// PWA Service Worker Registration and iOS Installation Prompt
// Enhanced PWA support for both Android and iOS devices with elegant Grace styling

let deferredPrompt;
let isIOSDevice = false;

// Enhanced device detection with better debugging
function detectIOS() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /ipad|iphone|ipod/.test(userAgent) && !window.MSStream;
  const isStandalone = window.navigator.standalone === true;
  console.log('Device Detection:', {
    userAgent: userAgent,
    isIOS: isIOS,
    isStandalone: isStandalone,
    result: isIOS && !isStandalone
  });
  return isIOS && !isStandalone;
}

function detectAndroid() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isAndroid = /android/.test(userAgent);
  console.log('Android Detection:', {
    userAgent: userAgent,
    isAndroid: isAndroid
  });
  return isAndroid;
}

// Show iOS installation instructions with elegant Grace styling
function showIOSInstallPrompt() {
  if (!detectIOS()) return;
  
  // Check if user has already dismissed the prompt
  if (localStorage.getItem('ios-install-dismissed') === 'true') return;
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'ios-install-overlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(75, 0, 125, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.3s ease-out;
  `;
  
  // Create iOS install prompt card
  const iosPrompt = document.createElement('div');
  iosPrompt.id = 'ios-install-prompt';
  iosPrompt.style.cssText = `
    background: linear-gradient(145deg, rgba(248, 248, 248, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%);
    color: #4B007D;
    padding: 32px 28px;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(75, 0, 125, 0.4), 0 0 0 1px rgba(201, 143, 234, 0.3);
    max-width: 420px;
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    border: 1px solid rgba(201, 143, 234, 0.2);
    animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
  `;
  
  iosPrompt.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        to { 
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
    </style>
    
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="
        width: 72px;
        height: 72px;
        margin: 0 auto 16px;
        border-radius: 18px;
        background: linear-gradient(135deg, #C98FEA 0%, #B67DD9 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 25px rgba(201, 143, 234, 0.4);
        animation: float 3s ease-in-out infinite;
      ">
        <img src="logo.png" style="width: 48px; height: 48px; border-radius: 12px;" alt="Grace" />
      </div>
      <h3 style="
        margin: 0 0 8px 0;
        font-size: 22px;
        font-weight: 600;
        color: #4B007D;
        letter-spacing: -0.5px;
      ">Install Grace</h3>
      <p style="
        margin: 0;
        font-size: 14px;
        color: rgba(75, 0, 125, 0.7);
        font-weight: 400;
        line-height: 1.5;
      ">Get instant access to your personal fashion assistant</p>
    </div>
    
    <div style="
      background: rgba(201, 143, 234, 0.08);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
      border: 1px solid rgba(201, 143, 234, 0.15);
    ">
      <ol style="
        margin: 0;
        padding: 0;
        list-style: none;
        color: #4B007D;
      ">
        <li style="
          display: flex;
          align-items: flex-start;
          margin-bottom: 16px;
          font-size: 15px;
          line-height: 1.6;
        ">
          <span style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            min-width: 28px;
            background: linear-gradient(135deg, #C98FEA 0%, #B67DD9 100%);
            color: white;
            border-radius: 50%;
            font-weight: 600;
            font-size: 13px;
            margin-right: 12px;
            box-shadow: 0 4px 12px rgba(201, 143, 234, 0.3);
          ">1</span>
          <span style="padding-top: 3px;">Tap the <strong style="color: #4B007D;">Share</strong> button at the bottom of Safari</span>
        </li>
        <li style="
          display: flex;
          align-items: flex-start;
          margin-bottom: 16px;
          font-size: 15px;
          line-height: 1.6;
        ">
          <span style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            min-width: 28px;
            background: linear-gradient(135deg, #C98FEA 0%, #B67DD9 100%);
            color: white;
            border-radius: 50%;
            font-weight: 600;
            font-size: 13px;
            margin-right: 12px;
            box-shadow: 0 4px 12px rgba(201, 143, 234, 0.3);
          ">2</span>
          <span style="padding-top: 3px;">Scroll and select <strong style="color: #4B007D;">Add to Home Screen</strong></span>
        </li>
        <li style="
          display: flex;
          align-items: flex-start;
          font-size: 15px;
          line-height: 1.6;
        ">
          <span style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            min-width: 28px;
            background: linear-gradient(135deg, #C98FEA 0%, #B67DD9 100%);
            color: white;
            border-radius: 50%;
            font-weight: 600;
            font-size: 13px;
            margin-right: 12px;
            box-shadow: 0 4px 12px rgba(201, 143, 234, 0.3);
          ">3</span>
          <span style="padding-top: 3px;">Tap <strong style="color: #4B007D;">Add</strong> to complete installation</span>
        </li>
      </ol>
    </div>
    
    <button id="ios-install-close" style="
      width: 100%;
      background: linear-gradient(135deg, #C98FEA 0%, #B67DD9 100%);
      color: #4B007D;
      border: none;
      padding: 16px 28px;
      border-radius: 14px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 8px 25px rgba(201, 143, 234, 0.4);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-family: inherit;
      letter-spacing: 0.3px;
    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 35px rgba(201, 143, 234, 0.5)'" 
       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 25px rgba(201, 143, 234, 0.4)'"
       ontouchstart="this.style.transform='scale(0.98)'" 
       ontouchend="this.style.transform='scale(1)'">
      Got It
    </button>
    
    <p style="
      margin: 16px 0 0 0;
      text-align: center;
      font-size: 12px;
      color: rgba(75, 0, 125, 0.5);
    ">You can dismiss this anytime</p>
  `;
  
  overlay.appendChild(iosPrompt);
  document.body.appendChild(overlay);
  
  // Handle close button
  document.getElementById('ios-install-close').addEventListener('click', () => {
    overlay.style.animation = 'fadeOut 0.3s ease-out';
    iosPrompt.style.animation = 'slideDown 0.3s ease-out';
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, 300);
    localStorage.setItem('ios-install-dismissed', 'true');
  });
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.getElementById('ios-install-close').click();
    }
  });
  
  // Add closing animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes slideDown {
      from { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      to { 
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
    }
  `;
  document.head.appendChild(style);
  
  // Auto-dismiss after 45 seconds
  setTimeout(() => {
    if (document.getElementById('ios-install-overlay')) {
      document.getElementById('ios-install-close').click();
    }
  }, 45000);
}

// Handle Android/Chrome install prompt with elegant styling
function handleAndroidInstall() {
  console.log('Setting up Android install handlers...');
  
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt event fired - Grace AI can be installed as an app');
    e.preventDefault();
    deferredPrompt = e;
    
    // Show custom install button or prompt
    showInstallButton();
  });
  
  // Track successful installation
  window.addEventListener('appinstalled', () => {
    console.log('Grace AI installed successfully');
    deferredPrompt = null;
    hideInstallButton();
  });
  
  // Fallback: Show manual install instructions for Android if beforeinstallprompt doesn't fire
  setTimeout(() => {
    if (!deferredPrompt && detectAndroid()) {
      console.log('beforeinstallprompt not fired, showing manual Android install prompt...');
      showAndroidManualInstall();
    }
  }, 5000); // Wait 5 seconds for beforeinstallprompt
}

function showInstallButton() {
  if (!deferredPrompt) return;
  
  const installBtn = document.createElement('div');
  installBtn.id = 'android-install-prompt';
  installBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background: linear-gradient(145deg, rgba(248, 248, 248, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%);
    color: #4B007D;
    padding: 18px 20px;
    border-radius: 20px;
    box-shadow: 0 12px 40px rgba(75, 0, 125, 0.3), 0 0 0 1px rgba(201, 143, 234, 0.2);
    z-index: 10000;
    font-family: system-ui, -apple-system, sans-serif;
    max-width: 480px;
    margin: 0 auto;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(201, 143, 234, 0.2);
    animation: slideUpFade 0.4s ease-out;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUpFade {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
  
  installBtn.innerHTML = `
    <div style="display: flex; align-items: center; gap: 14px;">
      <div style="
        width: 52px;
        height: 52px;
        min-width: 52px;
        border-radius: 14px;
        background: linear-gradient(135deg, #C98FEA 0%, #B67DD9 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 20px rgba(201, 143, 234, 0.35);
      ">
        <img src="logo.png" style="width: 36px; height: 36px; border-radius: 10px;" alt="Grace" />
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 600; margin-bottom: 4px; font-size: 15px; color: #4B007D;">Install Grace</div>
        <div style="color: rgba(75, 0, 125, 0.7); font-size: 13px; line-height: 1.4;">
          Add to home screen for quick access
        </div>
      </div>
      <button id="install-button" style="
        background: linear-gradient(135deg, #C98FEA 0%, #B67DD9 100%);
        color: #4B007D;
        border: none;
        padding: 10px 20px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(201, 143, 234, 0.35);
        transition: all 0.3s ease;
        white-space: nowrap;
      " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 8px 25px rgba(201, 143, 234, 0.45)'"
         onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 6px 20px rgba(201, 143, 234, 0.35)'"
         ontouchstart="this.style.transform='scale(0.98)'"
         ontouchend="this.style.transform='scale(1)'">Install</button>
      <button id="android-install-close" style="
        background: rgba(75, 0, 125, 0.08);
        border: none;
        color: rgba(75, 0, 125, 0.6);
        width: 32px;
        height: 32px;
        min-width: 32px;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        margin-left: 8px;
      " onmouseover="this.style.background='rgba(75, 0, 125, 0.12)'"
         onmouseout="this.style.background='rgba(75, 0, 125, 0.08)'">×</button>
    </div>
  `;
  
  document.body.appendChild(installBtn);
  
  // Handle install button click
  document.getElementById('install-button').addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Installation: ${outcome}`);
      deferredPrompt = null;
      hideInstallButton();
    }
  });
  
  // Handle close button
  document.getElementById('android-install-close').addEventListener('click', () => {
    hideInstallButton();
  });
}

function hideInstallButton() {
  const installBtn = document.getElementById('android-install-prompt');
  if (installBtn) {
    installBtn.style.animation = 'slideDownFade 0.3s ease-out';
    setTimeout(() => {
      if (document.body.contains(installBtn)) {
        document.body.removeChild(installBtn);
      }
    }, 300);
  }
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDownFade {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(20px);
      }
    }
  `;
  document.head.appendChild(style);
}

// Manual Android install prompt when beforeinstallprompt doesn't fire
function showAndroidManualInstall() {
  // Check if user has already dismissed the prompt
  if (localStorage.getItem('android-manual-dismissed') === 'true') return;
  
  const overlay = document.createElement('div');
  overlay.id = 'android-manual-overlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(75, 0, 125, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.3s ease-out;
  `;
  
  const prompt = document.createElement('div');
  prompt.style.cssText = `
    background: linear-gradient(145deg, rgba(248, 248, 248, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%);
    color: #4B007D;
    padding: 32px 28px;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(75, 0, 125, 0.4), 0 0 0 1px rgba(201, 143, 234, 0.3);
    max-width: 420px;
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    border: 1px solid rgba(201, 143, 234, 0.2);
    animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;
  
  prompt.innerHTML = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="
        width: 72px;
        height: 72px;
        margin: 0 auto 16px;
        border-radius: 18px;
        background: linear-gradient(135deg, #C98FEA 0%, #B67DD9 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 25px rgba(201, 143, 234, 0.4);
      ">
        <img src="logo.png" style="width: 48px; height: 48px; border-radius: 12px;" alt="Grace" />
      </div>
      <h3 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 600; color: #4B007D;">Install Grace</h3>
      <p style="margin: 0; font-size: 14px; color: rgba(75, 0, 125, 0.7);">Add to your home screen for quick access</p>
    </div>
    
    <div style="background: rgba(201, 143, 234, 0.08); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
      <ol style="margin: 0; padding: 0; list-style: none; color: #4B007D;">
        <li style="display: flex; align-items: flex-start; margin-bottom: 16px; font-size: 15px; line-height: 1.6;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; min-width: 28px; background: linear-gradient(135deg, #C98FEA 0%, #B67DD9 100%); color: white; border-radius: 50%; font-weight: 600; font-size: 13px; margin-right: 12px;">1</span>
          <span style="padding-top: 3px;">Tap the <strong>three dots menu</strong> (⋮) in Chrome</span>
        </li>
        <li style="display: flex; align-items: flex-start; margin-bottom: 16px; font-size: 15px; line-height: 1.6;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; min-width: 28px; background: linear-gradient(135deg, #C98FEA 0%, #B67DD9 100%); color: white; border-radius: 50%; font-weight: 600; font-size: 13px; margin-right: 12px;">2</span>
          <span style="padding-top: 3px;">Select <strong>"Add to Home screen"</strong></span>
        </li>
        <li style="display: flex; align-items: flex-start; font-size: 15px; line-height: 1.6;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; min-width: 28px; background: linear-gradient(135deg, #C98FEA 0%, #B67DD9 100%); color: white; border-radius: 50%; font-weight: 600; font-size: 13px; margin-right: 12px;">3</span>
          <span style="padding-top: 3px;">Tap <strong>"Install"</strong> or <strong>"Add"</strong></span>
        </li>
      </ol>
    </div>
    
    <button id="android-manual-close" style="width: 100%; background: linear-gradient(135deg, #C98FEA 0%, #B67DD9 100%); color: #4B007D; border: none; padding: 16px 28px; border-radius: 14px; font-weight: 600; font-size: 16px; cursor: pointer; box-shadow: 0 8px 25px rgba(201, 143, 234, 0.4); transition: all 0.3s ease;">
      Got It
    </button>
  `;
  
  overlay.appendChild(prompt);
  document.body.appendChild(overlay);
  
  // Handle close button
  document.getElementById('android-manual-close').addEventListener('click', () => {
    overlay.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, 300);
    localStorage.setItem('android-manual-dismissed', 'true');
  });
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.getElementById('android-manual-close').click();
    }
  });
}

// Register service worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  }
}

// Initialize PWA features
function initPWA() {
  console.log('🚀 Initializing Grace AI PWA features');
  console.log('Current URL:', window.location.href);
  console.log('User Agent:', navigator.userAgent);
  
  // Check if already installed
  if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
    console.log('✅ Running in standalone mode - already installed');
    document.body.classList.add('standalone');
    return;
  }
  
  // Register service worker
  registerServiceWorker();
  
  // Handle platform-specific installation
  if (detectIOS()) {
    console.log('📱 iOS device detected - setting up iOS install prompt');
    // Show iOS install prompt after a short delay
    setTimeout(showIOSInstallPrompt, 3000);
  } else if (detectAndroid()) {
    console.log('🤖 Android device detected - setting up Android install handlers');
    handleAndroidInstall();
  } else {
    console.log('🖥️ Desktop device detected - setting up desktop install handlers');
    handleAndroidInstall(); // Desktop Chrome also uses the same beforeinstallprompt
  }
  
  // Add to home screen detection
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('App installation available');
  });
  
  // Standalone mode detection
  if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
    console.log('Running in standalone mode');
    document.body.classList.add('standalone');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPWA);
} else {
  initPWA();
}

export { initPWA };
