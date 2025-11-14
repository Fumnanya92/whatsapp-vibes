// src/utils/NotificationManager.js

class NotificationManager {
  constructor() {
    this.isEnabled = true;
    this.fallbackSound = null;
    
    // Initialize settings from localStorage
    this.loadSettings();
    this.initializeAudio();
  }

  loadSettings() {
    const settings = JSON.parse(localStorage.getItem('grace-notifications') || '{}');
    this.isEnabled = settings.enabled !== false; // Default to true
  }

  saveSettings() {
    const settings = { enabled: this.isEnabled };
    localStorage.setItem('grace-notifications', JSON.stringify(settings));
  }

  async initializeAudio() {
    try {
      // Preload fallback sound for cases where system notification doesn't work
      // Production uses /chat/ mount, development uses local server
      const soundPath = window.location.origin.includes('ngrok.app') 
        ? '/chat/grace-approvalsound/happy-message-ping-351298.mp3'
        : '/grace-approvalsound/happy-message-ping-351298.mp3';
      
      this.fallbackSound = new Audio(soundPath);
      this.fallbackSound.preload = 'auto';
      this.fallbackSound.volume = 0.7;
    } catch (error) {
      console.warn('Fallback sound initialization failed:', error);
    }
  }

  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  async showNotification(title, body, options = {}) {
    console.log('🔔 showNotification called:', { title, body, isEnabled: this.isEnabled, permission: Notification.permission });
    
    if (!this.isEnabled) return null;

    // Request permission if not granted
    if ('Notification' in window && Notification.permission !== 'granted') {
      console.log('🔔 Requesting notification permission...');
      const granted = await this.requestNotificationPermission();
      console.log('🔔 Permission result:', granted);
      if (!granted) return null;
    }

    try {
      // Create notification with Grace branding
      const notification = new Notification(title, {
        body,
        icon: '/logo.png',
        badge: '/favicon-32x32.png',
        tag: 'grace-message', // Replaces previous notifications
        requireInteraction: false,
        silent: false, // Let system handle default sound
        ...options
      });

      // Auto-close notification after 6 seconds
      setTimeout(() => notification.close(), 6000);

      // If system notification didn't play sound, play fallback
      this.playFallbackSoundIfNeeded();

      return notification;
    } catch (error) {
      console.warn('Notification creation failed:', error);
      // Still try to play sound even if notification fails
      this.playFallbackSound();
      return null;
    }
  }

  playFallbackSoundIfNeeded() {
    // Small delay to check if system played notification sound
    setTimeout(() => {
      if (this.fallbackSound) {
        try {
          this.fallbackSound.currentTime = 0;
          this.fallbackSound.play().catch(e => {
            // Silently fail - user might have audio restrictions
            console.debug('Fallback sound play failed:', e);
          });
        } catch (error) {
          console.debug('Fallback sound error:', error);
        }
      }
    }, 100);
  }

  playFallbackSound() {
    if (this.fallbackSound && this.isEnabled) {
      try {
        this.fallbackSound.currentTime = 0;
        this.fallbackSound.play().catch(e => {
          console.debug('Fallback sound play failed:', e);
        });
      } catch (error) {
        console.debug('Fallback sound error:', error);
      }
    }
  }

  // Main notification method for Grace messages
  async notifyNewMessage(message = 'New message from Grace') {
    console.log('🔔 NotificationManager.notifyNewMessage called:', { message, isEnabled: this.isEnabled });
    
    if (!this.isEnabled) {
      console.log('🔕 Notifications disabled, returning null');
      return null;
    }

    // Show notification with system sound
    const notification = await this.showNotification('Grace', message, {
      tag: 'grace-new-message',
      icon: '/logo.png',
      silent: false // Use system notification sound
    });

    // Also play fallback sound for better user experience
    this.playFallbackSound();
    
    console.log('🔔 Notification created:', notification);
    return notification;
  }

  // Toggle notifications on/off
  toggle() {
    this.isEnabled = !this.isEnabled;
    this.saveSettings();
    return this.isEnabled;
  }

  // Get current state
  isNotificationsEnabled() {
    return this.isEnabled;
  }

  // Test notification
  async test() {
    const wasEnabled = this.isEnabled;
    this.isEnabled = true; // Temporarily enable for test
    
    const result = await this.notifyNewMessage('Test notification from Grace! 🎉');
    
    this.isEnabled = wasEnabled; // Restore original state
    return result;
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

export default notificationManager;