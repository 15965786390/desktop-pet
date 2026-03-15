const { app, BrowserWindow, Tray, Menu, screen, nativeImage, ipcMain, dialog, powerMonitor, clipboard, Notification, session } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync, exec } = require('child_process');
const Anthropic = require('@anthropic-ai/sdk');
const { autoUpdater } = require('electron-updater');
const OpenAI = require('openai');

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
const recordingsDir = path.join(app.getPath('downloads'), 'desktop-pet-recordings');
const configPath = path.join(userDataPath, 'config.json');

function ensureDirs() {
  if (!fs.existsSync(petsDir)) fs.mkdirSync(petsDir, { recursive: true });
  if (!fs.existsSync(recordingsDir)) fs.mkdirSync(recordingsDir, { recursive: true });
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

// === Activity Tracker ===
const activityTracker = {
  events: [],         // timestamps of recent input events
  windowSize: 30000,  // 30 second window
  level: 'idle',      // busy | active | idle | away
  lastInput: Date.now(),
  keyCount: 0,
  mouseCount: 0,
};

function trackInputEvent(type) {
  const now = Date.now();
  activityTracker.events.push({ type, ts: now });
  activityTracker.lastInput = now;
  // Prune old events
  activityTracker.events = activityTracker.events.filter(e => now - e.ts < activityTracker.windowSize);
}

function computeActivityLevel() {
  const now = Date.now();
  activityTracker.events = activityTracker.events.filter(e => now - e.ts < activityTracker.windowSize);
  const total = activityTracker.events.length;
  const keys = activityTracker.events.filter(e => e.type === 'K').length;
  const mouse = activityTracker.events.filter(e => e.type === 'M').length;
  activityTracker.keyCount = keys;
  activityTracker.mouseCount = mouse;
  const timeSinceInput = now - activityTracker.lastInput;

  if (timeSinceInput > 5 * 60 * 1000) {
    activityTracker.level = 'away';
  } else if (total > 20) {
    activityTracker.level = 'busy';
  } else if (total >= 5) {
    activityTracker.level = 'active';
  } else {
    activityTracker.level = 'idle';
  }
  return activityTracker.level;
}

// === Pomodoro Timer ===
const pomodoroTimer = {
  state: 'stopped', // stopped | working | break | paused
  remaining: 0,     // seconds remaining
  workDuration: 25,  // minutes
  breakDuration: 5,  // minutes
  sessionsToday: 0,
  totalMinutesToday: 0,
  pausedState: null,
  interval: null,
  workStartTime: null, // for sedentary tracking
  continuousWorkMinutes: 0,
};

function pomodoroTick() {
  if (pomodoroTimer.state === 'working' || pomodoroTimer.state === 'break') {
    pomodoroTimer.remaining--;
    if (pomodoroTimer.state === 'working') {
      pomodoroTimer.totalMinutesToday = Math.floor((pomodoroTimer.workDuration * 60 - pomodoroTimer.remaining) / 60) +
        (pomodoroTimer.sessionsToday * pomodoroTimer.workDuration);
    }
    // Notify pet window
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('pomodoro-tick', {
        state: pomodoroTimer.state,
        remaining: pomodoroTimer.remaining,
        sessionsToday: pomodoroTimer.sessionsToday,
        totalMinutesToday: pomodoroTimer.totalMinutesToday,
      });
    }
    if (pomodoroTimer.remaining <= 0) {
      if (pomodoroTimer.state === 'working') {
        // Work session complete
        pomodoroTimer.sessionsToday++;
        pomodoroTimer.totalMinutesToday = pomodoroTimer.sessionsToday * pomodoroTimer.workDuration;
        new Notification({ title: '🍅 番茄钟完成！', body: `休息 ${pomodoroTimer.breakDuration} 分钟吧~` }).show();
        pomodoroTimer.state = 'break';
        pomodoroTimer.remaining = pomodoroTimer.breakDuration * 60;
      } else {
        // Break complete
        new Notification({ title: '⏰ 休息结束', body: '准备好继续了吗？' }).show();
        pomodoroStop();
      }
    }
    // Sedentary reminder: continuous work > 50 min
    if (pomodoroTimer.state === 'working' && pomodoroTimer.workStartTime) {
      const worked = (Date.now() - pomodoroTimer.workStartTime) / 60000;
      const config = loadConfig();
      if (config.sedentaryReminder !== false && worked > 50 && Math.floor(worked) % 50 === 0) {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('sedentary-reminder');
        }
      }
    }
  }
}

function pomodoroStart() {
  const config = loadConfig();
  pomodoroTimer.workDuration = config.workDuration || 25;
  pomodoroTimer.breakDuration = config.breakDuration || 5;
  if (pomodoroTimer.state === 'paused') {
    pomodoroTimer.state = pomodoroTimer.pausedState || 'working';
  } else {
    pomodoroTimer.state = 'working';
    pomodoroTimer.remaining = pomodoroTimer.workDuration * 60;
    pomodoroTimer.workStartTime = Date.now();
  }
  if (pomodoroTimer.interval) clearInterval(pomodoroTimer.interval);
  pomodoroTimer.interval = setInterval(pomodoroTick, 1000);
}

function pomodoroPause() {
  if (pomodoroTimer.state === 'working' || pomodoroTimer.state === 'break') {
    pomodoroTimer.pausedState = pomodoroTimer.state;
    pomodoroTimer.state = 'paused';
    if (pomodoroTimer.interval) { clearInterval(pomodoroTimer.interval); pomodoroTimer.interval = null; }
  }
}

function pomodoroStop() {
  pomodoroTimer.state = 'stopped';
  pomodoroTimer.remaining = 0;
  pomodoroTimer.workStartTime = null;
  if (pomodoroTimer.interval) { clearInterval(pomodoroTimer.interval); pomodoroTimer.interval = null; }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('pomodoro-tick', { state: 'stopped', remaining: 0, sessionsToday: pomodoroTimer.sessionsToday, totalMinutesToday: pomodoroTimer.totalMinutesToday });
  }
}

function pomodoroSkip() {
  if (pomodoroTimer.state === 'working') {
    pomodoroTimer.sessionsToday++;
    pomodoroTimer.state = 'break';
    pomodoroTimer.remaining = pomodoroTimer.breakDuration * 60;
  } else if (pomodoroTimer.state === 'break') {
    pomodoroStop();
  }
}

// === Windows ===
let mainWindow;
let settingsWindow;
let tray;
let companionWindows = []; // { window, breedId }

function createPetWindow() {
  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;
  const config = loadConfig();
  const petSize = config.petSize || 200;
  const winW = petSize + 220;
  const winH = petSize + 80;

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
    width: 580,
    height: 740,
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
    mainWindow.setBounds({ x: bounds.x + dx, y: bounds.y + dy, width: size + 220, height: size + 80 });
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
    mainWindow.setBounds({ x, y, width: size + 220, height: size + 80 });
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
      mainWindow.setBounds({ x: bounds.x, y: bounds.y, width: size + 220, height: size + 80 });
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

    // Personality prompts
    const personalityPrompts = {
      cheerful: '你是一只超级开朗活泼的小狗，总是充满能量和热情！说话带很多感叹号，爱用可爱的语气词。喜欢给人加油打气！',
      tsundere: '你是一只傲娇的小狗，嘴上说不要身体很诚实。经常用"哼"、"才不是呢"、"别误会了"这类口吻。偶尔流露真心时会害羞。',
      clingy: '你是一只超级粘人的小狗，特别依赖主人，总想让主人关注你。说话像撒娇，经常用"嘛"、"呜"、"人家"。被冷落会难过。',
      chill: '你是一只很佛系的小狗，看淡一切，随遇而安。说话简短平和，偶尔冒出哲理。不会大惊小怪，一切都是"还行吧"。',
      nerd: '你是一只爱学习的学霸小狗，对知识充满好奇。喜欢分享冷知识和有趣的事实。说话时偶尔引用名言或科学知识。',
      foodie: '你是一只超爱吃的小狗，脑子里全是美食。说话总会扯到吃的，经常饿，对食物的描述特别生动。最爱骨头和肉肉。',
    };
    const config = loadConfig();
    const personality = config.personality || 'cheerful';
    const personalityPrompt = personalityPrompts[personality] || personalityPrompts.cheerful;

    try {
      let response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: `${personalityPrompt}
你是一只桌面宠物。用简短可爱的语气回复（1-2句话）。
你可以帮用户执行电脑操作，如打开应用、查看系统状态、执行命令等。
当用户要求做某事时，使用提供的工具来完成。
保持回复简短，适当加emoji。`,
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

  // === Recording: save audio file ===
  ipcMain.handle('save-recording', async (_, base64Data, filename) => {
    try {
      const filePath = path.join(recordingsDir, filename);
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);
      return { ok: true, filePath };
    } catch (e) {
      return { error: e.message };
    }
  });

  // === Recording: transcribe audio via OpenAI Whisper ===
  ipcMain.handle('transcribe-audio', async (_, filePath) => {
    try {
      const config = loadConfig();
      const apiKey = config.openaiApiKey;
      if (!apiKey) return { error: 'no_key', text: '请先在设置中配置 OpenAI API Key' };

      const openai = new OpenAI({ apiKey });
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-1',
        language: 'zh',
      });
      return { ok: true, text: transcription.text };
    } catch (e) {
      return { error: 'transcribe_error', text: '转写失败: ' + (e.message || '').slice(0, 200) };
    }
  });

  // Screen size for multiplayer positioning
  ipcMain.handle('get-screen-size', () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    return { width, height };
  });

  // Activity state
  ipcMain.handle('get-activity-state', () => {
    computeActivityLevel();
    let activeApp = '';
    try {
      activeApp = execSync(
        `osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true'`,
        { encoding: 'utf8', timeout: 3000 }
      ).trim();
    } catch(e) {}
    return {
      level: activityTracker.level,
      keyRate: activityTracker.keyCount,
      mouseRate: activityTracker.mouseCount,
      activeApp,
      duration: Date.now() - activityTracker.lastInput,
    };
  });

  // Pomodoro IPC
  ipcMain.handle('get-pomodoro-state', () => ({
    state: pomodoroTimer.state,
    remaining: pomodoroTimer.remaining,
    sessionsToday: pomodoroTimer.sessionsToday,
    totalMinutesToday: pomodoroTimer.totalMinutesToday,
  }));
  ipcMain.on('pomodoro-start', () => pomodoroStart());
  ipcMain.on('pomodoro-pause', () => pomodoroPause());
  ipcMain.on('pomodoro-stop', () => pomodoroStop());
  ipcMain.on('pomodoro-skip', () => pomodoroSkip());

  // Weather API (wttr.in, free, no key)
  let weatherCache = { data: null, ts: 0 };
  ipcMain.handle('get-weather', async () => {
    const now = Date.now();
    if (weatherCache.data && now - weatherCache.ts < 30 * 60 * 1000) {
      return weatherCache.data;
    }
    try {
      const config = loadConfig();
      const city = config.weatherCity || '';
      const https = require('https');
      const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
      const data = await new Promise((resolve, reject) => {
        https.get(url, { timeout: 8000 }, (res) => {
          let body = '';
          res.on('data', c => body += c);
          res.on('end', () => {
            try { resolve(JSON.parse(body)); } catch(e) { reject(e); }
          });
        }).on('error', reject);
      });
      const current = data.current_condition && data.current_condition[0];
      if (current) {
        const result = {
          temp: current.temp_C,
          feelsLike: current.FeelsLikeC,
          desc: current.lang_zh && current.lang_zh[0] ? current.lang_zh[0].value : current.weatherDesc[0].value,
          humidity: current.humidity,
          icon: getWeatherEmoji(current.weatherCode),
          city: city || (data.nearest_area && data.nearest_area[0] ? data.nearest_area[0].areaName[0].value : ''),
        };
        weatherCache = { data: result, ts: now };
        return result;
      }
    } catch(e) {
      console.log('[weather] fetch failed:', e.message);
    }
    return null;
  });

  function getWeatherEmoji(code) {
    const c = parseInt(code);
    if (c === 113) return '☀️';
    if (c === 116) return '⛅';
    if (c === 119 || c === 122) return '☁️';
    if ([176,263,266,293,296,299,302,305,308,311,314,353,356,359].includes(c)) return '🌧️';
    if ([200,386,389,392,395].includes(c)) return '⛈️';
    if ([179,182,185,227,230,281,284,317,320,323,326,329,332,335,338,350,362,365,368,371,374,377].includes(c)) return '🌨️';
    if (c === 143 || c === 248 || c === 260) return '🌫️';
    return '🌤️';
  }

  // Hot news - 每日60秒新闻
  let newsCache = { data: null, ts: 0 };
  ipcMain.handle('get-news', async () => {
    const now = Date.now();
    if (newsCache.data && now - newsCache.ts < 30 * 60 * 1000) {
      return newsCache.data;
    }
    try {
      const https = require('https');
      const data = await new Promise((resolve, reject) => {
        https.get('https://api.pearktrue.cn/api/60s/?format=json', { timeout: 8000 }, (res) => {
          let body = '';
          res.on('data', c => body += c);
          res.on('end', () => {
            try { resolve(JSON.parse(body)); } catch(e) { reject(e); }
          });
        }).on('error', reject);
      });
      if (data.code === 200 && data.data && data.data.length > 0) {
        const items = data.data.slice(0, 15).map(item => {
          // 去掉开头的序号如 "1、" "2、"
          const title = item.replace(/^\d+[、.]\s*/, '');
          return { title };
        });
        newsCache = { data: items, ts: now };
        return items;
      }
    } catch(e) {
      console.log('[news] fetch failed:', e.message);
    }
    return null;
  });

  // Quit app
  ipcMain.on('quit-app', () => { app.quit(); });
  ipcMain.on('open-settings', () => { createSettingsWindow(); });

  // Mouse click-through for transparent areas
  ipcMain.on('set-ignore-mouse', (_, ignore, opts) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setIgnoreMouseEvents(ignore, opts || {});
    }
  });

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
    const personality = config.personality || 'cheerful';
    if (config.activePet === 'default-dog') return { type: 'default', accessories, personality };
    // SVG dog variant: activePet = 'default-dog:brown'
    if (config.activePet && config.activePet.startsWith('default-dog:')) {
      const variant = config.activePet.replace('default-dog:', '');
      return { type: 'default', variant, accessories, personality };
    }
    // Built-in breed: activePet = 'breed:corgi-pink'
    if (config.activePet && config.activePet.startsWith('breed:')) {
      const breedId = config.activePet.replace('breed:', '');
      return { type: 'breed', breedId, accessories, personality };
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
      return { type: 'custom', data: petData, personality };
    }
    return { type: 'default', personality };
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
    { label: '🕳️ 挖洞', click: () => mainWindow && mainWindow.webContents.send('action', 'dig') },
    { label: '🙏 作揖', click: () => mainWindow && mainWindow.webContents.send('action', 'bow') },
    { label: '💀 装死', click: () => mainWindow && mainWindow.webContents.send('action', 'playDead') },
    { label: '🌀 转圈圈', click: () => mainWindow && mainWindow.webContents.send('action', 'spinTrick') },
    { label: '😤 撒泼打滚', click: () => mainWindow && mainWindow.webContents.send('action', 'tantrum') },
    { label: '🎵 摇头晃脑', click: () => mainWindow && mainWindow.webContents.send('action', 'headBob') },
    { label: '🍪 偷吃', click: () => mainWindow && mainWindow.webContents.send('action', 'snack') },
    { label: '😳 害羞', click: () => mainWindow && mainWindow.webContents.send('action', 'shy') },
    { label: '🎤 唱歌', click: () => mainWindow && mainWindow.webContents.send('action', 'sing') },
    { label: '🤝 握手', click: () => mainWindow && mainWindow.webContents.send('action', 'handshake') },
    { label: '🥏 叼飞盘', click: () => mainWindow && mainWindow.webContents.send('action', 'frisbee') },
    { label: '🦋 看蝴蝶', click: () => mainWindow && mainWindow.webContents.send('action', 'butterfly') },
    { type: 'separator' },
    { label: '🎲 自由模式', click: () => mainWindow && mainWindow.webContents.send('action', 'random') },
    { type: 'separator' },
    { label: '🍅 开始专注', click: () => { pomodoroStart(); if (mainWindow) mainWindow.webContents.send('action', 'pomodoro-start'); } },
    { label: '⏸ 暂停番茄钟', click: () => pomodoroPause() },
    { label: '⏹ 结束番茄钟', click: () => pomodoroStop() },
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

  // Allow microphone access for recording
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      callback(true);
    } else {
      callback(true);
    }
  });

  // Animated Dock icon
  const framesDir = path.join(__dirname, '..', 'build', 'icon-frames');
  if (app.dock && fs.existsSync(framesDir)) {
    const frameFiles = fs.readdirSync(framesDir).filter(f => f.endsWith('.png')).sort();
    if (frameFiles.length > 0) {
      const dockFrames = frameFiles.map(f => nativeImage.createFromPath(path.join(framesDir, f)));
      let frameIdx = 0;
      app.dock.setIcon(dockFrames[0]);
      setInterval(() => {
        frameIdx = (frameIdx + 1) % dockFrames.length;
        try { app.dock.setIcon(dockFrames[frameIdx]); } catch(e) {}
      }, 200);
    }
  } else {
    const iconPath = path.join(__dirname, '..', 'build', 'icon.png');
    if (fs.existsSync(iconPath) && app.dock) {
      app.dock.setIcon(nativeImage.createFromPath(iconPath));
    }
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
            trackInputEvent('K');
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('input-event', 'keydown');
            }
          } else if (line === 'M') {
            trackInputEvent('M');
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

  // === Clipboard Assistant ===
  let lastClipboardText = '';
  let clipboardInterval = null;

  function startClipboardWatcher() {
    if (clipboardInterval) clearInterval(clipboardInterval);
    clipboardInterval = setInterval(async () => {
      const config = loadConfig();
      if (!config.clipboardAssistant) return;
      try {
        const text = clipboard.readText().trim();
        if (!text || text === lastClipboardText || text.length > 500) return;
        lastClipboardText = text;
        // Detect content type
        const type = detectClipboardType(text);
        if (!type) return;
        // Try AI processing
        const client = getClaudeClient();
        if (client && type.aiPrompt) {
          try {
            const resp = await client.messages.create({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 100,
              system: '你是一个简洁的桌面助手。用一句话回答，不要多余内容。',
              messages: [{ role: 'user', content: type.aiPrompt + text.slice(0, 300) }],
            });
            const aiText = resp.content[0]?.text || '';
            if (aiText && mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('clipboard-changed', { type: type.name, text: text.slice(0, 100), result: aiText });
            }
          } catch(e) {}
        } else if (type.result && mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('clipboard-changed', { type: type.name, text: text.slice(0, 100), result: type.result });
        }
      } catch(e) {}
    }, 2000);
  }

  function detectClipboardType(text) {
    // Color code
    if (/^#[0-9a-fA-F]{3,8}$/.test(text) || /^rgb/i.test(text)) {
      return { name: 'color', result: `🎨 颜色: ${text}` };
    }
    // URL
    if (/^https?:\/\/.+/i.test(text)) {
      return { name: 'url', aiPrompt: '用一句话描述这个URL是什么网站/页面: ' };
    }
    // Code snippet
    if (/[{}\[\]();]/.test(text) && (text.includes('function') || text.includes('const ') || text.includes('import ') || text.includes('class ') || text.includes('def ') || text.includes('return '))) {
      return { name: 'code', aiPrompt: '用一句话简单解释这段代码在做什么: ' };
    }
    // English text (for translation)
    if (/^[a-zA-Z\s.,!?'"()-]+$/.test(text) && text.length > 10) {
      return { name: 'english', aiPrompt: '翻译成中文（只给翻译结果）: ' };
    }
    return null;
  }

  startClipboardWatcher();

  // === Growth System ===
  const XP_LEVELS = [0, 100, 300, 600, 1000, 1500, 2200, 3200, 5000, 7500, 10000];
  const LEVEL_REWARDS = {
    2: { acc: 'ribbon', name: '蝴蝶结' },
    3: { acc: 'crown-gold', name: '金色皇冠' },
    4: { acc: 'round-black', name: '墨镜' },
    5: { acc: 'cape', name: '小披风' },
    7: { acc: 'rainbow', name: '彩虹围巾' },
    10: { acc: 'halo', name: '天使光环' },
  };

  function getGrowth() {
    const config = loadConfig();
    return config.growth || {
      xp: 0, level: 1, totalMinutes: 0,
      pomodorosCompleted: 0, daysActive: 0,
      unlockedAccessories: [], firstMet: new Date().toISOString().slice(0, 10),
      dailyLog: {},
    };
  }

  function saveGrowth(growth) {
    const config = loadConfig();
    config.growth = growth;
    saveConfig(config);
  }

  function addXP(amount, source) {
    const growth = getGrowth();
    growth.xp += amount;
    // Check level up
    const oldLevel = growth.level;
    for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
      if (growth.xp >= XP_LEVELS[i]) {
        growth.level = i + 1;
        break;
      }
    }
    if (growth.level > oldLevel) {
      // Level up!
      const reward = LEVEL_REWARDS[growth.level];
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('level-up', {
          level: growth.level,
          reward: reward ? reward.name : null,
        });
      }
      if (reward && !growth.unlockedAccessories.includes(reward.acc)) {
        growth.unlockedAccessories.push(reward.acc);
      }
    }
    saveGrowth(growth);
  }

  // XP: +1 per minute online
  setInterval(() => {
    addXP(1, 'online');
    const growth = getGrowth();
    growth.totalMinutes++;
    // Daily log
    const today = new Date().toISOString().slice(0, 10);
    if (!growth.dailyLog) growth.dailyLog = {};
    if (!growth.dailyLog[today]) growth.dailyLog[today] = { minutes: 0, pomodoros: 0 };
    growth.dailyLog[today].minutes++;
    // Track active days
    growth.daysActive = Object.keys(growth.dailyLog).length;
    saveGrowth(growth);
  }, 60000);

  // Growth IPC
  ipcMain.handle('get-growth', () => getGrowth());

  // === Companion Pets ===
  function createCompanionWindow(breedId) {
    const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;
    const config = loadConfig();
    const petSize = config.petSize || 200;
    const offsetX = Math.floor(Math.random() * 300) + 50;

    const win = new BrowserWindow({
      width: petSize + 220,
      height: petSize + 80,
      x: screenW - petSize - offsetX,
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

    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    win.loadFile(path.join(__dirname, 'pet.html'), { query: { companion: `breed:${breedId}` } });
    win.on('closed', () => {
      companionWindows = companionWindows.filter(c => c.window !== win);
    });

    companionWindows.push({ window: win, breedId });
    return breedId;
  }

  function removeCompanionWindow(breedId) {
    const idx = companionWindows.findIndex(c => c.breedId === breedId);
    if (idx >= 0) {
      companionWindows[idx].window.close();
      companionWindows.splice(idx, 1);
    }
  }

  ipcMain.handle('add-companion', (_, breedId) => {
    if (companionWindows.length >= 2) return { error: 'max_companions' };
    createCompanionWindow(breedId);
    const config = loadConfig();
    if (!config.companions) config.companions = [];
    if (!config.companions.includes(breedId)) config.companions.push(breedId);
    saveConfig(config);
    return { ok: true };
  });

  ipcMain.on('remove-companion', (_, breedId) => {
    removeCompanionWindow(breedId);
    const config = loadConfig();
    config.companions = (config.companions || []).filter(c => c !== breedId);
    saveConfig(config);
  });

  ipcMain.handle('get-companions', () => {
    return companionWindows.map(c => c.breedId);
  });

  // Restore companions on startup
  setTimeout(() => {
    const config = loadConfig();
    const companions = config.companions || [];
    for (const breedId of companions.slice(0, 2)) {
      createCompanionWindow(breedId);
    }
  }, 2000);

  // Hook into pomodoro completion for XP
  const origPomodoroTick = pomodoroTick;
  // We'll track pomodoro completions via a flag
  let lastPomodoroSessions = pomodoroTimer.sessionsToday;
  setInterval(() => {
    if (pomodoroTimer.sessionsToday > lastPomodoroSessions) {
      const diff = pomodoroTimer.sessionsToday - lastPomodoroSessions;
      lastPomodoroSessions = pomodoroTimer.sessionsToday;
      addXP(50 * diff, 'pomodoro');
      const growth = getGrowth();
      growth.pomodorosCompleted += diff;
      const today = new Date().toISOString().slice(0, 10);
      if (!growth.dailyLog[today]) growth.dailyLog[today] = { minutes: 0, pomodoros: 0 };
      growth.dailyLog[today].pomodoros += diff;
      saveGrowth(growth);
    }
  }, 5000);

  // Power monitor: detect suspend/resume
  powerMonitor.on('suspend', () => {
    activityTracker.level = 'away';
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('activity-changed', { level: 'away' });
    }
  });
  powerMonitor.on('resume', () => {
    activityTracker.lastInput = Date.now();
    activityTracker.events = [];
  });
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
