/**
 * PetNetwork - PeerJS-based P2P networking for desktop pet multiplayer.
 * Loaded as a <script> in pet.html after peerjs.min.js.
 * Uses the global `Peer` class from PeerJS browser bundle.
 */
(function () {
  'use strict';

  const PEER_ID_PREFIX = 'desktoppet-';
  const SYNC_INTERVAL = 200;       // ms between state broadcasts
  const RECONNECT_DELAY = 2000;    // ms before reconnect attempt
  const MAX_RECONNECT = 5;

  // --- helpers ---
  function generateRoomCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function makePeerId(code) {
    return PEER_ID_PREFIX + code;
  }

  // --- PetNetwork singleton ---
  const PetNetwork = {
    peer: null,
    connections: {},      // peerId -> DataConnection
    members: {},          // peerId -> { nickname, status }
    myNickname: '',
    roomCode: null,
    isHost: false,
    _syncTimer: null,
    _localState: null,
    _onPeerState: null,
    _onMemberUpdate: null,
    _onError: null,
    _onRoomJoined: null,
    _reconnectAttempts: {},
    _destroyed: false,

    // ---- public API ----

    /**
     * Create a room as host.
     * @param {string} nickname
     * @returns {Promise<{roomCode: string}>}
     */
    createRoom(nickname) {
      return new Promise((resolve, reject) => {
        this._destroyed = false;
        this.isHost = true;
        this.myNickname = nickname || 'Host';
        this.roomCode = generateRoomCode();
        const peerId = makePeerId(this.roomCode);

        this.peer = new Peer(peerId, { debug: 1 });

        this.peer.on('open', (id) => {
          console.log('[PetNetwork] Host peer opened:', id);
          this.members[id] = { nickname: this.myNickname, status: 'online' };
          this._emitMemberUpdate();
          resolve({ roomCode: this.roomCode });
        });

        this.peer.on('connection', (conn) => {
          this._handleIncomingConnection(conn);
        });

        this.peer.on('error', (err) => {
          console.error('[PetNetwork] Host peer error:', err);
          if (err.type === 'unavailable-id') {
            // Room code collision, retry with new code
            this.roomCode = generateRoomCode();
            this.peer.destroy();
            this.createRoom(nickname).then(resolve).catch(reject);
            return;
          }
          if (this._onError) this._onError(err);
          reject(err);
        });

        this.peer.on('disconnected', () => {
          if (!this._destroyed) {
            console.log('[PetNetwork] Host disconnected, reconnecting...');
            this.peer.reconnect();
          }
        });
      });
    },

    /**
     * Join a room as guest.
     * @param {string} roomCode
     * @param {string} nickname
     * @returns {Promise<void>}
     */
    joinRoom(roomCode, nickname) {
      return new Promise((resolve, reject) => {
        this._destroyed = false;
        this.isHost = false;
        this.myNickname = nickname || 'Guest';
        this.roomCode = roomCode;
        const hostPeerId = makePeerId(roomCode);

        this.peer = new Peer(undefined, { debug: 1 });

        this.peer.on('open', (myId) => {
          console.log('[PetNetwork] Guest peer opened:', myId);
          const conn = this.peer.connect(hostPeerId, {
            metadata: { nickname: this.myNickname },
            reliable: true,
          });

          conn.on('open', () => {
            console.log('[PetNetwork] Connected to host');
            this._registerConnection(conn);
            // Send join message
            conn.send({
              type: 'join',
              nickname: this.myNickname,
              peerId: myId,
            });
            if (this._onRoomJoined) this._onRoomJoined();
            resolve();
          });

          conn.on('error', (err) => {
            console.error('[PetNetwork] Connection error:', err);
            if (this._onError) this._onError(err);
            reject(err);
          });

          // Timeout for connection
          setTimeout(() => {
            if (!conn.open) {
              reject(new Error('Connection timeout - room may not exist'));
            }
          }, 10000);
        });

        this.peer.on('error', (err) => {
          console.error('[PetNetwork] Guest peer error:', err);
          if (this._onError) this._onError(err);
          reject(err);
        });

        this.peer.on('disconnected', () => {
          if (!this._destroyed) {
            console.log('[PetNetwork] Guest disconnected, reconnecting...');
            this.peer.reconnect();
          }
        });
      });
    },

    /**
     * Send local pet state to all connected peers.
     * @param {object} data - pet state
     */
    sendPetState(data) {
      this._localState = data;
    },

    /**
     * Register callback for receiving remote peer states.
     * @param {function} callback - (peerId, stateData) => void
     */
    onPeerState(callback) {
      this._onPeerState = callback;
    },

    /**
     * Register callback for member list changes.
     * @param {function} callback - (members) => void
     */
    onMemberUpdate(callback) {
      this._onMemberUpdate = callback;
    },

    /**
     * Register callback for errors.
     * @param {function} callback - (error) => void
     */
    onError(callback) {
      this._onError = callback;
    },

    /**
     * Register callback for successful room join (guest only).
     * @param {function} callback - () => void
     */
    onRoomJoined(callback) {
      this._onRoomJoined = callback;
    },

    /**
     * Leave the current room and disconnect.
     */
    leaveRoom() {
      this._destroyed = true;
      this._stopSync();

      // Notify peers
      const msg = { type: 'leave', peerId: this.peer ? this.peer.id : null };
      for (const id of Object.keys(this.connections)) {
        try {
          if (this.connections[id].open) this.connections[id].send(msg);
        } catch (e) { /* ignore */ }
      }

      // Cleanup
      for (const id of Object.keys(this.connections)) {
        try { this.connections[id].close(); } catch (e) { /* ignore */ }
      }
      this.connections = {};
      this.members = {};
      this._reconnectAttempts = {};

      if (this.peer) {
        try { this.peer.destroy(); } catch (e) { /* ignore */ }
        this.peer = null;
      }

      this.roomCode = null;
      this.isHost = false;
      this._localState = null;
      this._emitMemberUpdate();
    },

    /**
     * Get current member list.
     * @returns {Array<{peerId: string, nickname: string, status: string}>}
     */
    getMembers() {
      return Object.entries(this.members).map(([peerId, info]) => ({
        peerId,
        nickname: info.nickname,
        status: info.status,
      }));
    },

    /**
     * Check if currently in a room.
     * @returns {boolean}
     */
    isConnected() {
      return this.peer !== null && !this.peer.destroyed && this.roomCode !== null;
    },

    // ---- internal ----

    _handleIncomingConnection(conn) {
      console.log('[PetNetwork] Incoming connection from:', conn.peer);
      conn.on('open', () => {
        this._registerConnection(conn);
      });
      conn.on('error', (err) => {
        console.error('[PetNetwork] Incoming connection error:', err);
      });
    },

    _registerConnection(conn) {
      const peerId = conn.peer;
      this.connections[peerId] = conn;
      this._reconnectAttempts[peerId] = 0;

      conn.on('data', (data) => {
        this._handleMessage(peerId, data);
      });

      conn.on('close', () => {
        console.log('[PetNetwork] Connection closed:', peerId);
        this._handleDisconnect(peerId);
      });

      conn.on('error', (err) => {
        console.error('[PetNetwork] Connection error with', peerId, err);
      });

      // Start sync timer if not running
      this._startSync();
    },

    _handleMessage(fromPeerId, data) {
      if (!data || !data.type) return;

      switch (data.type) {
        case 'join': {
          // A peer joined - register them in members
          this.members[fromPeerId] = {
            nickname: data.nickname || 'Unknown',
            status: 'online',
          };
          this._emitMemberUpdate();

          // Host: broadcast updated member list to all peers
          if (this.isHost) {
            this._broadcastMemberList();
          }
          break;
        }

        case 'leave': {
          delete this.connections[fromPeerId];
          delete this.members[fromPeerId];
          this._emitMemberUpdate();
          if (this.isHost) {
            this._broadcastMemberList();
          }
          break;
        }

        case 'pet-state': {
          // Received pet state from a peer
          if (this._onPeerState) {
            this._onPeerState(fromPeerId, data.state);
          }
          // Host: relay to other peers
          if (this.isHost) {
            this._relayToOthers(fromPeerId, data);
          }
          break;
        }

        case 'member-list': {
          // Guest receives full member list from host
          if (!this.isHost && data.members) {
            this.members = data.members;
            this._emitMemberUpdate();
          }
          break;
        }

        case 'relay-state': {
          // Guest receives relayed state from host
          if (this._onPeerState && data.originPeerId) {
            this._onPeerState(data.originPeerId, data.state);
          }
          break;
        }
      }
    },

    _handleDisconnect(peerId) {
      if (this._destroyed) return;

      if (this.members[peerId]) {
        this.members[peerId].status = 'disconnected';
        this._emitMemberUpdate();
      }

      delete this.connections[peerId];

      // Guest: try to reconnect to host
      if (!this.isHost && peerId === makePeerId(this.roomCode)) {
        this._attemptReconnect(peerId);
      }

      // Host: broadcast updated member list
      if (this.isHost) {
        // Remove after a delay to allow reconnection
        setTimeout(() => {
          if (!this.connections[peerId]) {
            delete this.members[peerId];
            this._emitMemberUpdate();
            this._broadcastMemberList();
          }
        }, RECONNECT_DELAY * MAX_RECONNECT + 1000);
      }
    },

    _attemptReconnect(peerId) {
      const attempts = (this._reconnectAttempts[peerId] || 0) + 1;
      this._reconnectAttempts[peerId] = attempts;

      if (attempts > MAX_RECONNECT) {
        console.log('[PetNetwork] Max reconnect attempts reached for', peerId);
        delete this.members[peerId];
        this._emitMemberUpdate();
        return;
      }

      console.log(`[PetNetwork] Reconnect attempt ${attempts}/${MAX_RECONNECT} to ${peerId}`);
      setTimeout(() => {
        if (this._destroyed || !this.peer || this.peer.destroyed) return;

        const conn = this.peer.connect(peerId, {
          metadata: { nickname: this.myNickname },
          reliable: true,
        });

        conn.on('open', () => {
          console.log('[PetNetwork] Reconnected to', peerId);
          this._registerConnection(conn);
          conn.send({
            type: 'join',
            nickname: this.myNickname,
            peerId: this.peer.id,
          });
          if (this.members[peerId]) {
            this.members[peerId].status = 'online';
            this._emitMemberUpdate();
          }
        });

        conn.on('error', () => {
          this._attemptReconnect(peerId);
        });
      }, RECONNECT_DELAY);
    },

    _broadcastMemberList() {
      const msg = { type: 'member-list', members: this.members };
      for (const id of Object.keys(this.connections)) {
        try {
          if (this.connections[id].open) this.connections[id].send(msg);
        } catch (e) { /* ignore */ }
      }
    },

    _relayToOthers(fromPeerId, data) {
      // Host relays pet-state from one guest to all other guests
      const msg = {
        type: 'relay-state',
        originPeerId: fromPeerId,
        state: data.state,
      };
      for (const id of Object.keys(this.connections)) {
        if (id !== fromPeerId) {
          try {
            if (this.connections[id].open) this.connections[id].send(msg);
          } catch (e) { /* ignore */ }
        }
      }
    },

    _startSync() {
      if (this._syncTimer) return;
      this._syncTimer = setInterval(() => {
        if (!this._localState) return;
        const msg = { type: 'pet-state', state: this._localState };
        for (const id of Object.keys(this.connections)) {
          try {
            if (this.connections[id].open) this.connections[id].send(msg);
          } catch (e) { /* ignore */ }
        }
      }, SYNC_INTERVAL);
    },

    _stopSync() {
      if (this._syncTimer) {
        clearInterval(this._syncTimer);
        this._syncTimer = null;
      }
    },

    _emitMemberUpdate() {
      if (this._onMemberUpdate) {
        this._onMemberUpdate(this.getMembers());
      }
    },
  };

  // Expose globally
  window.PetNetwork = PetNetwork;
})();
