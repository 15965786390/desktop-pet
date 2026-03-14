const { app, BrowserWindow, Tray, Menu, screen, nativeImage, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync, exec } = require('child_process');
const Anthropic = require('@anthropic-ai/sdk');
const { autoUpdater } = require('electron-updater');

// === Single Instance Lock ===
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // If user tries to open again, show settings
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.focus();
    } else {
      createSettingsWindow();
    }
  });
}

// === Data paths ===
const userDataPath = app.getPath('userData');
const petsDir = path.join(userDataPath, 'pets');
const configPath = path.join(userDataPath, 'config.json');

function ensureDirs() {
  if (!fs.existsSync(petsDir)) fs.mkdirSync(petsDir, { recursive: true });
}

function loadConfig() {
  try {
    if (fs.existsSync(configPath)) return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch(e) {}
  return { activePet: 'default-dog', petSize: 200, pets: [] };
}

function saveConfig(cfg) {
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
}

// === Windows ===
let mainWindow;
let settingsWindow;
let tray;

function createPetWindow() {
  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;
  const config = loadConfig();
  const petSize = config.petSize || 200;
  const winW = petSize + 40;
  const winH = petSize + 60; // Extra space for chat input + speech bubble

  mainWindow = new BrowserWindow({
    width: winW,
    height: winH,
    x: screenW - petSize - 100,
    y: screenH - petSize - 50,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.loadFile(path.join(__dirname, 'pet.html'));

  mainWindow.on('closed', () => { mainWindow = null; });
}

function createSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 520,
    height: 620,
    resizable: false,
    title: '桌面宠物 - 设置',
    webPreferences: {
      preload: path.join(__dirname, 'settings-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  settingsWindow.loadFile(path.join(__dirname, 'settings.html'));
  settingsWindow.on('closed', () => { settingsWindow = null; });
}

// === IPC handlers ===
function setupIPC() {
  // Pet window movement
  ipcMain.on('move-window', (_, { dx, dy }) => {
    if (!mainWindow) return;
    const config = loadConfig();
    const size = config.petSize || 200;
    const bounds = mainWindow.getBounds();
    mainWindow.setBounds({ x: bounds.x + dx, y: bounds.y + dy, width: size + 40, height: size + 60 });
  });

  ipcMain.handle('get-bounds', () => {
    const config = loadConfig();
    const size = config.petSize || 200;
    const display = screen.getPrimaryDisplay();
    return {
      window: mainWindow ? mainWindow.getBounds() : { x: 0, y: 0 },
      screen: display.workAreaSize,
      petSize: size,
    };
  });

  ipcMain.on('set-position', (_, { x, y }) => {
    if (!mainWindow) return;
    const config = loadConfig();
    const size = config.petSize || 200;
    mainWindow.setBounds({ x, y, width: size + 40, height: size + 60 });
  });

  // Settings: load config
  ipcMain.handle('get-config', () => {
    const config = loadConfig();
    // Scan pets directory for custom pets
    const customPets = [];
    if (fs.existsSync(petsDir)) {
      const files = fs.readdirSync(petsDir);
      for (const f of files) {
        if (f.endsWith('.json')) {
          try {
            const petData = JSON.parse(fs.readFileSync(path.join(petsDir, f), 'utf8'));
            customPets.push(petData);
          } catch(e) {}
        }
      }
    }
    config.customPets = customPets;
    config.petsDir = petsDir;
    return config;
  });

  // Settings: save config
  ipcMain.on('save-config', (_, cfg) => {
    const old = loadConfig();
    if (cfg.claudeApiKey !== undefined) claudeClient = null; // Reset client on key change
    Object.assign(old, cfg);
    saveConfig(old);
    // Notify pet window to reload
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('config-changed', old);
      const size = old.petSize || 200;
      const bounds = mainWindow.getBounds();
      mainWindow.setBounds({ x: bounds.x, y: bounds.y, width: size + 40, height: size + 60 });
    }
  });

  // Settings: add custom pet (pick image)
  ipcMain.handle('add-pet-image', async () => {
    const result = await dialog.showOpenDialog(settingsWindow, {
      title: '选择宠物图片',
      filters: [
        { name: '图片', extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'] },
      ],
      properties: ['openFile'],
    });
    if (result.canceled || result.filePaths.length === 0) return null;

    const srcPath = result.filePaths[0];
    const ext = path.extname(srcPath);
    const id = 'pet-' + Date.now();
    const destPath = path.join(petsDir, id + ext);

    fs.copyFileSync(srcPath, destPath);

    const petInfo = {
      id,
      name: path.basename(srcPath, ext),
      imagePath: destPath,
      createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(petsDir, id + '.json'), JSON.stringify(petInfo, null, 2));
    return petInfo;
  });

  // Settings: delete custom pet
  ipcMain.on('delete-pet', (_, petId) => {
    const files = fs.readdirSync(petsDir).filter(f => f.startsWith(petId));
    for (const f of files) {
      fs.unlinkSync(path.join(petsDir, f));
    }
    const config = loadConfig();
    if (config.activePet === petId) {
      config.activePet = 'default-dog';
      saveConfig(config);
      if (mainWindow) mainWindow.webContents.send('config-changed', config);
    }
  });

  // System info for pet
  ipcMain.handle('get-system-info', async () => {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsage = Math.round((1 - freeMem / totalMem) * 100);

    // CPU usage (average across cores)
    const cpuIdle = cpus.reduce((sum, c) => sum + c.times.idle, 0) / cpus.length;
    const cpuTotal = cpus.reduce((sum, c) => sum + c.times.user + c.times.nice + c.times.sys + c.times.idle + c.times.irq, 0) / cpus.length;
    const cpuUsage = Math.round((1 - cpuIdle / cpuTotal) * 100);

    const uptime = Math.round(os.uptime() / 3600); // hours

    // Battery (macOS)
    let battery = null;
    try {
      const out = execSync('pmset -g batt', { encoding: 'utf8', timeout: 3000 });
      const match = out.match(/(\d+)%/);
      const charging = out.includes('charging') || out.includes('AC Power');
      if (match) battery = { percent: parseInt(match[1]), charging };
    } catch(e) {}

    // Active app (macOS)
    let activeApp = '';
    try {
      activeApp = execSync(
        `osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true'`,
        { encoding: 'utf8', timeout: 3000 }
      ).trim();
    } catch(e) {}

    return { cpuUsage, memUsage, uptime, battery, activeApp, platform: process.platform };
  });

  // === Claude AI Chat ===
  let claudeClient = null;
  let chatHistory = [];

  function getClaudeClient() {
    const config = loadConfig();
    const apiKey = config.claudeApiKey || process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return null;
    if (!claudeClient) {
      const opts = { apiKey };
      const baseURL = config.claudeBaseUrl || process.env.ANTHROPIC_BASE_URL;
      if (baseURL) opts.baseURL = baseURL;
      claudeClient = new Anthropic(opts);
    }
    return claudeClient;
  }

  // Tools the pet can use
  const petTools = [
    {
      name: 'run_command',
      description: '在用户电脑上执行终端命令（如打开应用、查看文件、系统操作等）。只执行安全的只读或用户明确要求的命令。',
      input_schema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: '要执行的shell命令' },
          reason: { type: 'string', description: '执行这个命令的原因' },
        },
        required: ['command', 'reason'],
      },
    },
    {
      name: 'get_system_info',
      description: '获取用户电脑的系统信息（CPU、内存、电量、运行时间等）',
      input_schema: { type: 'object', properties: {} },
    },
    {
      name: 'open_app',
      description: '打开Mac应用程序',
      input_schema: {
        type: 'object',
        properties: {
          app_name: { type: 'string', description: '应用名称，如 Safari, Finder, Notes' },
        },
        required: ['app_name'],
      },
    },
    {
      name: 'open_url',
      description: '在浏览器中打开URL',
      input_schema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: '要打开的URL' },
        },
        required: ['url'],
      },
    },
  ];

  // Execute tool calls
  function executeTool(toolName, input) {
    try {
      switch (toolName) {
        case 'run_command':
          const output = execSync(input.command, { encoding: 'utf8', timeout: 10000, maxBuffer: 1024 * 100 }).trim();
          return output.slice(0, 500) || '命令执行成功';
        case 'get_system_info': {
          const cpus = os.cpus();
          const memUsage = Math.round((1 - os.freemem() / os.totalmem()) * 100);
          let battery = '';
          try {
            const out = execSync('pmset -g batt', { encoding: 'utf8', timeout: 3000 });
            const m = out.match(/(\d+)%/);
            if (m) battery = `电量${m[1]}%`;
          } catch(e) {}
          return `CPU: ${cpus.length}核, 内存使用: ${memUsage}%, ${battery}, 运行: ${Math.round(os.uptime()/3600)}小时`;
        }
        case 'open_app':
          execSync(`open -a "${input.app_name}"`, { timeout: 5000 });
          return `已打开 ${input.app_name}`;
        case 'open_url':
          execSync(`open "${input.url}"`, { timeout: 5000 });
          return `已打开 ${input.url}`;
        default:
          return '未知工具';
      }
    } catch (e) {
      return `执行失败: ${e.message.slice(0, 200)}`;
    }
  }

  ipcMain.handle('claude-chat', async (_, userMessage) => {
    const client = getClaudeClient();
    if (!client) return { error: 'no_key', text: '还没设置 API Key 哦~ 去设置页面添加吧！' };

    chatHistory.push({ role: 'user', content: userMessage });
    // Keep last 20 messages to save tokens
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

    try {
      let response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: `你是一只可爱的桌面宠物，性格活泼、温暖、略带俏皮。用简短可爱的语气回复（1-2句话）。
你可以帮用户执行电脑操作，如打开应用、查看系统状态、执行命令等。
当用户要求做某事时，使用提供的工具来完成。
保持回复简短，像一只会说话的小狗/猫。适当加emoji。`,
        messages: chatHistory,
        tools: petTools,
      });

      // Handle tool use
      let textParts = [];
      let toolResults = [];

      for (const block of response.content) {
        if (block.type === 'text') textParts.push(block.text);
        if (block.type === 'tool_use') {
          const result = executeTool(block.name, block.input);
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
        }
      }

      // If there were tool calls, send results back for final response
      if (toolResults.length > 0) {
        chatHistory.push({ role: 'assistant', content: response.content });
        chatHistory.push({ role: 'user', content: toolResults });

        response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          system: `你是一只可爱的桌面宠物。刚刚执行了用户要求的操作，现在用简短可爱的语气报告结果（1-2句话）。`,
          messages: chatHistory,
        });

        textParts = [];
        for (const block of response.content) {
          if (block.type === 'text') textParts.push(block.text);
        }
      }

      const reply = textParts.join('') || '汪？';
      chatHistory.push({ role: 'assistant', content: reply });
      return { text: reply };
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('401') || msg.includes('auth')) {
        return { error: 'invalid_key', text: 'API Key 无效哦，检查一下设置~ 🔑' };
      }
      return { error: 'api_error', text: '网络不太好…稍后再试？🌐' };
    }
  });

  // Clear chat history
  ipcMain.on('claude-clear-history', () => { chatHistory = []; });

  // Screen size for multiplayer positioning
  ipcMain.handle('get-screen-size', () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    return { width, height };
  });

  // Quit app
  ipcMain.on('quit-app', () => { app.quit(); });
  ipcMain.on('open-settings', () => { createSettingsWindow(); });

  // Save cartoon pet (from canvas dataURL)
  ipcMain.handle('save-cartoon-pet', async (_, name, dataUrl) => {
    try {
      const id = 'pet-' + Date.now();
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      const destPath = path.join(petsDir, id + '.png');
      fs.writeFileSync(destPath, Buffer.from(base64Data, 'base64'));

      const petInfo = {
        id,
        name: name || '我的宠物',
        imagePath: destPath,
        createdAt: new Date().toISOString(),
      };
      fs.writeFileSync(path.join(petsDir, id + '.json'), JSON.stringify(petInfo, null, 2));
      return petInfo;
    } catch(e) {
      console.error('save-cartoon-pet error:', e);
      return null;
    }
  });

  // Get active pet info
  ipcMain.handle('get-active-pet', () => {
    const config = loadConfig();
    const accessories = config.accessories || {};
    if (config.activePet === 'default-dog') return { type: 'default', accessories };
    // Built-in breed: activePet = 'breed:corgi-pink'
    if (config.activePet && config.activePet.startsWith('breed:')) {
      const breedId = config.activePet.replace('breed:', '');
      return { type: 'breed', breedId, accessories };
    }
    // Custom pet
    const jsonPath = path.join(petsDir, config.activePet + '.json');
    if (fs.existsSync(jsonPath)) {
      const petData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      if (fs.existsSync(petData.imagePath)) {
        const ext = path.extname(petData.imagePath).slice(1);
        const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
        const buf = fs.readFileSync(petData.imagePath);
        petData.imageDataUrl = `data:${mime};base64,${buf.toString('base64')}`;
      }
      return { type: 'custom', data: petData };
    }
    return { type: 'default' };
  });
}

// === Tray ===
function createTray() {
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA2klEQVR4nGNgGAWkAkYGBgZ+BgYGfyA+D8T/gfg8VIwfiAWINeA/EPMzMDDwA2l+ID4PxOdRxPmhYsQa8B+I/0PF/oOcAJUHif0nZABIDj8X4INKQw0B0f+h4v/xGYAbC1P4H58BILn/uAzgy8jIeP78+fM0d+7cOKD58wwMDP74DMAJ+BkZGX2Bht1nYGDgZ2Bg8GVgYOBHEfdlZGQEqcFrANRZMEP+g2wDYaATYWLnGaAApwEgN6OI+YL4UDa62H+oGF4DQC4BGnQeyj7PwMDgCxMbBQMHAAC0z12B0z24AAAAAElFTkSuQmCC'
  );

  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: '🐕 站立', click: () => mainWindow && mainWindow.webContents.send('action', 'stand') },
    { label: '🚶 散步', click: () => mainWindow && mainWindow.webContents.send('action', 'walk') },
    { label: '🪑 坐下', click: () => mainWindow && mainWindow.webContents.send('action', 'sit') },
    { label: '😴 睡觉', click: () => mainWindow && mainWindow.webContents.send('action', 'sleep') },
    { type: 'separator' },
    { label: '🥺 撒娇', click: () => mainWindow && mainWindow.webContents.send('action', 'beg') },
    { label: '🌀 追尾巴', click: () => mainWindow && mainWindow.webContents.send('action', 'chase') },
    { label: '⭐ 蹦跳', click: () => mainWindow && mainWindow.webContents.send('action', 'jump') },
    { label: '😪 打哈欠', click: () => mainWindow && mainWindow.webContents.send('action', 'yawn') },
    { label: '🐾 伸懒腰', click: () => mainWindow && mainWindow.webContents.send('action', 'stretch') },
    { label: '💩 拉粑粑', click: () => mainWindow && mainWindow.webContents.send('action', 'poop') },
    { type: 'separator' },
    { label: '🎲 自由模式', click: () => mainWindow && mainWindow.webContents.send('action', 'random') },
    { type: 'separator' },
    { label: '⚙️ 设置', click: () => createSettingsWindow() },
    { label: '退出', click: () => app.quit() },
  ]);
  tray.setToolTip('桌面宠物');
  tray.setContextMenu(contextMenu);
}

// === App lifecycle ===
app.whenReady().then(() => {
  ensureDirs();
  setupIPC();

  // Set Dock icon
  const iconPath = path.join(__dirname, '..', 'build', 'icon.png');
  if (fs.existsSync(iconPath)) {
    const dockIcon = nativeImage.createFromPath(iconPath);
    if (app.dock) app.dock.setIcon(dockIcon);
  }

  createPetWindow();
  createTray();
  // Auto-open settings on launch
  createSettingsWindow();

  // === Auto Updater ===
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-status', 'downloading', info.version);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-status', 'ready', info.version);
    }
    // Show dialog to restart
    dialog.showMessageBox({
      type: 'info',
      title: '更新就绪',
      message: `新版本 v${info.version} 已下载完成，重启后生效。`,
      buttons: ['现在重启', '稍后'],
      defaultId: 0,
    }).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.on('error', (err) => {
    console.log('[updater] error:', err.message);
  });

  // Check for updates 3s after launch, then every 2 hours
  setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 3000);
  setInterval(() => autoUpdater.checkForUpdates().catch(() => {}), 2 * 60 * 60 * 1000);

  // === Global input mirror (macOS CGEvent tap via Swift helper) ===
  // In packaged app, asarUnpack extracts to app.asar.unpacked/
  const watcherPath = path.join(__dirname.replace('app.asar', 'app.asar.unpacked'), 'input-watcher');
  let inputWatcher = null;

  function startInputWatcher() {
    if (!fs.existsSync(watcherPath)) {
      console.log('[input-watcher] binary not found at', watcherPath);
      return;
    }
    try {
      inputWatcher = require('child_process').spawn(watcherPath, [], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      inputWatcher.stdout.on('data', (data) => {
        const lines = data.toString().trim().split('\n');
        for (const line of lines) {
          if (line === 'K') {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('input-event', 'keydown');
            }
          } else if (line === 'M') {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('input-event', 'mousedown');
            }
          }
        }
      });

      inputWatcher.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg === 'OK') console.log('[input-watcher] started');
        else console.error('[input-watcher]', msg);
      });

      inputWatcher.on('exit', (code) => {
        console.log('[input-watcher] exited with code', code);
        inputWatcher = null;
      });
    } catch(e) {
      console.error('[input-watcher] spawn failed:', e.message);
    }
  }

  startInputWatcher();
});

app.on('before-quit', () => {
  // Kill input watcher process if running
  try {
    const { execSync: es } = require('child_process');
    es('pkill -f input-watcher', { timeout: 2000 });
  } catch(e) {}
});

app.on('window-all-closed', (e) => {
  // Don't quit when settings window closes
  if (mainWindow === null && (!settingsWindow || settingsWindow.isDestroyed())) {
    // Keep running in tray
  }
});

// Keep app alive in tray
app.on('activate', () => {
  if (!mainWindow) createPetWindow();
});
