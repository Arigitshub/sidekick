const { _electron: electron } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Launching Sidekick HQ Native Audit...');
  
  const electronApp = await electron.launch({
    args: [path.join(__dirname, '..', 'src', 'main.js')],
  });

  // Get the first window that the app opens
  const window = await electronApp.firstWindow();
  console.log('✅ Window found: ' + await window.title());

  // Wait for the UI to be ready
  await window.waitForSelector('.sidebar-container');
  console.log('✅ Class .sidebar-container visible.');

  // Create Screenshots Dir
  const screenshotDir = path.join(__dirname, '..', 'screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);

  // 1. Initial Home Screen (The Pilot)
  await window.screenshot({ path: path.join(screenshotDir, '1_home_pilot.png') });
  console.log('📸 Screenshot 1: Home (Pilot) captured.');

  // 2. Expand Sidebar (Hover Simulation)
  await window.hover('.sidebar-container');
  await window.waitForTimeout(500); // Wait for transition
  await window.screenshot({ path: path.join(screenshotDir, '2_expanded.png') });
  console.log('📸 Screenshot 2: Expanded Sidebar captured.');

  // 3. Test 'The Chef' (Pomodoro)
  console.log('🔧 Clicking The Chef agent...');
  await window.click('#slot-chef');
  await window.waitForTimeout(500); 
  await window.screenshot({ path: path.join(screenshotDir, '3_agent_chef.png') });
  console.log('📸 Screenshot 3: The Chef dashboard captured.');

  // 4. Test Settings & Theme (Cyberpunk)
  console.log('⚙️ Clicking Settings agent...');
  await window.click('#slot-settings');
  await window.waitForTimeout(500);
  
  console.log('🌃 Switching to Cyberpunk theme...');
  // Click on the theme list item by text or position
  await window.click('text=Cyberpunk-Neon');
  await window.waitForTimeout(800);
  await window.screenshot({ path: path.join(screenshotDir, '4_cyberpunk_theme.png') });
  console.log('📸 Screenshot 4: Cyberpunk-Neon theme captured.');

  // 5. Test Settings & Anchor (Left Side)
  console.log('📍 Switching to Left Edge...');
  await window.click('#anchor-left');
  await window.waitForTimeout(1000); // Repositioning window might take time
  await window.screenshot({ path: path.join(screenshotDir, '5_left_edge_anchor.png') });
  console.log('📸 Screenshot 5: Left Edge anchor captured.');

  console.log('🏁 Logic Audit Complete. Closing...');
  await electronApp.close();
})();
