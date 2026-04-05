const sidebar = document.getElementById('sidebar');
const agentSlots = document.querySelectorAll('.agent-slot');
const agentName = document.getElementById('agent-name');
const agentDesc = document.getElementById('agent-desc');
const contentArea = document.getElementById('content-area');
const agentBody = document.querySelector('.agent-body');

// --- Agent Logic & State ---

let currentAgent = 'pilot';
let timerInterval = null;
let timeLeft = 25 * 60; // 25 minutes
let isTimerRunning = false;

const agentData = {
  pilot: {
    name: 'The Pilot',
    desc: 'Main AI Orchestrator. Select a provider below.',
    render: renderPilot
  },
  chef: {
    name: 'The Chef',
    desc: 'Kitchen-grade Pomodoro. Let\'s get some focus.',
    render: renderChef
  },
  archivist: {
    name: 'The Archivist',
    desc: 'Clipboard History. Always one step ahead.',
    render: renderArchivist
  },
  scribe: {
    name: 'The Scribe',
    desc: 'Floating Sticky Notes. Captured at light speed.',
    render: renderScribe
  },
  settings: {
    name: 'Configuration',
    desc: 'Customize your Sidekick experience.',
    render: renderSettings
  }
};

// --- Component Renderers ---

function renderSettings() {
  const isLeft = document.body.classList.contains('sidebar-left');
  
  agentBody.innerHTML = `
    <div class="glass-card">
      <p style="color: var(--accent-primary); font-weight: 600; margin-bottom: 12px;">Layout Anchor</p>
      <div style="display: flex; gap: 8px;">
        <button class="btn-icon ${!isLeft ? 'active' : ''}" id="anchor-right">Right Edge</button>
        <button class="btn-icon ${isLeft ? 'active' : ''}" id="anchor-left">Left Edge</button>
      </div>

      <p style="color: var(--accent-primary); font-weight: 600; margin-top: 24px; margin-bottom: 12px;">Visual Theme</p>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="clipboard-item" onclick="setAppTheme('lofi')">🌆 Lofi-Dark</div>
        <div class="clipboard-item" onclick="setAppTheme('cyberpunk')">🌃 Cyberpunk-Neon</div>
        <div class="clipboard-item" onclick="setAppTheme('frost')">❄️ Clean-Frost</div>
      </div>

      <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin-top: 24px;">v1.2.0 - Premium HQ</p>
    </div>
  `;

  document.getElementById('anchor-left').onclick = () => toggleAnchor(true);
  document.getElementById('anchor-right').onclick = () => toggleAnchor(false);
}

function toggleAnchor(left) {
  if (left) {
    document.body.classList.add('sidebar-left');
    localStorage.setItem('sidekick-anchor', 'left');
    window.electronAPI.send('switch-anchor', 'left');
  } else {
    document.body.classList.remove('sidebar-left');
    localStorage.setItem('sidekick-anchor', 'right');
    window.electronAPI.send('switch-anchor', 'right');
  }
  renderSettings(); // Refresh buttons
}

function setAppTheme(theme) {
  document.body.className = '';
  if (theme !== 'lofi') document.body.classList.add(`theme-${theme}`);
  localStorage.setItem('sidekick-theme', theme);
  renderSettings();
}

// Load Persistent Settings
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('sidekick-theme');
  const savedAnchor = localStorage.getItem('sidekick-anchor');
  
  if (savedTheme) setAppTheme(savedTheme);
  if (savedAnchor === 'left') toggleAnchor(true);
});

function renderPilot() {
  agentBody.innerHTML = `
    <div class="glass-card">
      <p style="color: var(--pilot-accent); font-weight: 600; margin-bottom: 12px;">Providers</p>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="clipboard-item">Claude 3.5 Sonnet</div>
        <div class="clipboard-item">GPT-4o</div>
        <div class="clipboard-item">Gemini 1.5 Pro (Active)</div>
      </div>
      <div style="margin-top: 16px; display: flex; gap: 8px;">
        <input type="text" placeholder="Ask anything..." style="background: rgba(0,0,0,0.2); border: 1px solid var(--border-glow); padding: 8px 12px; border-radius: 8px; color: white; width: 100%;">
      </div>
    </div>
  `;
}

function renderChef() {
  agentBody.innerHTML = `
    <div class="glass-card" style="display: flex; flex-direction: column; align-items: center;">
      <div class="timer-display" id="timer-display">${formatTime(timeLeft)}</div>
      <div class="timer-controls">
        <button class="btn-icon" id="start-stop-timer">${isTimerRunning ? 'Pause' : 'Start'}</button>
        <button class="btn-icon" id="reset-timer">Reset</button>
      </div>
      <div style="margin-top: 16px; color: var(--text-dim); font-size: 12px;">Deep Work: 25:00</div>
    </div>
  `;

  // Attach controls
  document.getElementById('start-stop-timer').onclick = toggleTimer;
  document.getElementById('reset-timer').onclick = resetTimer;
}

function renderArchivist() {
  agentBody.innerHTML = `
    <div class="glass-card">
      <ul class="clipboard-list" id="clipboard-list">
        <li class="clipboard-item">Loading history...</li>
      </ul>
    </div>
  `;
  updateClipboardList();
}

function renderScribe() {
  agentBody.innerHTML = `
    <div class="glass-card">
      <textarea placeholder="Write a note..." style="background: transparent; border: none; color: white; width: 100%; height: 120px; outline: none;"></textarea>
      <div style="text-align: right; margin-top: 8px;">
        <button class="btn-icon">Save to Desk</button>
      </div>
    </div>
  `;
}

// --- Logic Implementations ---

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function toggleTimer() {
  if (isTimerRunning) {
    clearInterval(timerInterval);
    isTimerRunning = false;
  } else {
    isTimerRunning = true;
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        alert('Work session done! Take a break.');
      }
      updateTimerUI();
    }, 1000);
  }
  renderChef(); // Re-render to update button text
}

function resetTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  timeLeft = 25 * 60;
  renderChef();
}

function updateTimerUI() {
  const display = document.getElementById('timer-display');
  if (display) display.innerText = formatTime(timeLeft);
}

function updateClipboardList() {
  const content = window.electronAPI.getClipboardItems();
  const list = document.getElementById('clipboard-list');
  if (list) {
    list.innerHTML = `
      <li class="clipboard-item">${content || 'Empty'}</li>
      <li class="clipboard-item" style="opacity: 0.5;">Paste from Archive...</li>
      <li class="clipboard-item" style="opacity: 0.5;">Draft snippet</li>
    `;
  }
}

// --- Sidebar Interactions & IPC ---

// Theme Switching
window.electronAPI.receive('switch-theme', (theme) => {
  document.body.className = ''; // Clear all
  if (theme !== 'lofi') {
    document.body.classList.add(`theme-${theme}`);
  }
});

// Click-through Management
// When collapsed and not hovered, allow clicks to pass through transparent parts
sidebar.addEventListener('mouseenter', () => {
  // window.electronAPI.send('toggle-click-through', false);
});

sidebar.addEventListener('mouseleave', () => {
  // Only ignore events if the sidebar is collapsed
  if (!sidebar.classList.contains('expanded')) {
    // window.electronAPI.send('toggle-click-through', true);
  }
});

agentSlots.forEach(slot => {
  slot.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent body click from closing
    
    agentSlots.forEach(s => s.classList.remove('active'));
    slot.classList.add('active');
    
    currentAgent = slot.dataset.agent;
    const data = agentData[currentAgent];
    
    agentName.innerText = data.name;
    agentDesc.innerText = data.desc;
    data.render();

    sidebar.classList.add('expanded');
  });
});

// Close expanded view when clicking the empty part of the body
document.body.addEventListener('click', (e) => {
  if (e.target.tagName === 'BODY' || e.target === sidebar) {
    sidebar.classList.remove('expanded');
  }
});

// Hide Button Logic
const hideBtn = document.getElementById('hide-btn');
if (hideBtn) {
  hideBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.remove('expanded');
    // window.electronAPI.send('hide-window');
  });
}

// Initial Render
renderPilot();
document.getElementById('slot-pilot').classList.add('active');
