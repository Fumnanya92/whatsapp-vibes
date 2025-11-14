/**
 * Cache Management Utility for Grace AI
 * Handles clearing stale caches and session data that cause issues for returning users
 */

export class CacheManager {
  static CACHE_VERSION_KEY = 'grace_cache_version';
  static CURRENT_VERSION = '3.0.1'; // Update this when you need to force cache clear
  static SESSION_PREFIX = 'grace_session_';
  static CHAT_HISTORY_KEY = 'grace_chat_history';

  /**
   * Check if cache needs to be cleared and clear if necessary
   */
  static async checkAndClearStaleCache() {
    try {
      console.log('[CacheManager] Checking cache version...');
      const storedVersion = localStorage.getItem(this.CACHE_VERSION_KEY);
      
      if (storedVersion !== this.CURRENT_VERSION) {
        console.log('[CacheManager] Cache version mismatch. Stored:', storedVersion, 'Current:', this.CURRENT_VERSION);
        await this.forceClearAllCaches();
        localStorage.setItem(this.CACHE_VERSION_KEY, this.CURRENT_VERSION);
        console.log('[CacheManager] Cache cleared and version updated');
        return true;
      }
      
      console.log('[CacheManager] Cache version is current');
      return false;
    } catch (error) {
      console.error('[CacheManager] Error checking cache version:', error);
      return false;
    }
  }

  /**
   * Force clear all caches - localStorage, sessionStorage, service worker caches
   */
  static async forceClearAllCaches() {
    console.log('[CacheManager] Starting comprehensive cache clear...');
    
    try {
      // Clear localStorage except for essential user preferences
      const essentialKeys = ['grace_user_preferences', 'grace_theme'];
      const keysToDelete = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !essentialKeys.includes(key)) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => {
        console.log('[CacheManager] Clearing localStorage key:', key);
        localStorage.removeItem(key);
      });

      // Clear sessionStorage completely
      console.log('[CacheManager] Clearing sessionStorage...');
      sessionStorage.clear();

      // Clear service worker caches
      if ('caches' in window) {
        console.log('[CacheManager] Clearing service worker caches...');
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log('[CacheManager] Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }

      // Clear any Grace-specific session data
      this.clearGraceSessionData();

      console.log('[CacheManager] Comprehensive cache clear completed');
    } catch (error) {
      console.error('[CacheManager] Error during cache clear:', error);
    }
  }

  /**
   * Clear Grace-specific session data
   */
  static clearGraceSessionData() {
    try {
      console.log('[CacheManager] Clearing Grace session data...');
      
      // Clear any indexed session data
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.SESSION_PREFIX)) {
          console.log('[CacheManager] Removing session key:', key);
          localStorage.removeItem(key);
        }
      });

      // Clear chat history
      localStorage.removeItem(this.CHAT_HISTORY_KEY);
      
      // Clear any cached user profile data
      localStorage.removeItem('grace_user_profile');
      localStorage.removeItem('grace_current_session');
      
      console.log('[CacheManager] Grace session data cleared');
    } catch (error) {
      console.error('[CacheManager] Error clearing Grace session data:', error);
    }
  }

  /**
   * Register service worker update listener
   */
  static registerServiceWorkerUpdateListener() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_REFRESHED') {
          console.log('[CacheManager] Service worker cache refreshed:', event.data.message);
          // Optionally show user notification
          this.showCacheRefreshNotification();
        }
      });
    }
  }

  /**
   * Show notification to user about cache refresh
   */
  static showCacheRefreshNotification() {
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: system-ui, sans-serif;
      font-size: 14px;
    `;
    notification.textContent = '✅ Cache refreshed - Grace AI updated!';
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  /**
   * Add cache-busting parameters to API requests
   */
  static addCacheBusting(url) {
    const separator = url.includes('?') ? '&' : '?';
    const timestamp = Date.now();
    return `${url}${separator}_cb=${timestamp}&v=${this.CURRENT_VERSION}`;
  }

  /**
   * Check if this is a returning user who might have cache issues
   */
  static isReturningUser() {
    return localStorage.getItem('grace_has_visited') === 'true';
  }

  /**
   * Mark user as having visited
   */
  static markUserAsVisited() {
    localStorage.setItem('grace_has_visited', 'true');
  }
}

export default CacheManager;