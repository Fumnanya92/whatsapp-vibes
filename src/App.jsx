import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomeNew';
import ChatPage from './pages/ChatPage';
import CatalogPage from './pages/Catalog';
import SettingsPage from './pages/Settings';
import DevToolsPage from './pages/DevTools';
import DevMemoryManager from './components/DevTools/DevMemoryManager';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import CacheManager from './utils/cacheManager';

import './App.css';

const App = () => {
  // track whether sidebar is visible
  const [sidebarVisible, setSidebarVisible] = useState(false); // Start with sidebar closed on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [cacheCleared, setCacheCleared] = useState(false);

  // Initialize cache management on app start
  useEffect(() => {
    const initializeCacheManagement = async () => {
      console.log('[App] Initializing cache management...');
      
      try {
        // Register service worker update listener
        CacheManager.registerServiceWorkerUpdateListener();
        
        // Check if this is a returning user who might have cache issues
        const isReturningUser = CacheManager.isReturningUser();
        console.log('[App] Is returning user:', isReturningUser);
        
        // Check and clear stale cache if needed
        const wasCleared = await CacheManager.checkAndClearStaleCache();
        
        if (wasCleared) {
          console.log('[App] Stale cache was cleared');
          setCacheCleared(true);
          
          // Show notification to user
          if (isReturningUser) {
            console.log('[App] Showing cache refresh notification for returning user');
            CacheManager.showCacheRefreshNotification();
          }
        }
        
        // Mark user as having visited
        CacheManager.markUserAsVisited();
        
      } catch (error) {
        console.error('[App] Error initializing cache management:', error);
      }
    };

    initializeCacheManagement();
  }, []);

  // Handle window resize to detect mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarVisible(true); // Always show sidebar on desktop
      }
    };

    // Call immediately and add listener
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  // Use Vite env var VITE_PUBLIC_MODE to enable a public/client-facing mode.
  // When enabled, admin/dev routes will redirect to home to avoid accidental exposure.
  const PUBLIC_MODE = (import.meta && import.meta.env && import.meta.env.VITE_PUBLIC_MODE) === 'true';

  const getPageTitle = () => {
    const path = window.location.pathname;
    if (path === '/') return 'Home';
    if (path === '/chat') return 'Chat';
    if (path === '/catalog') return 'Catalog';
    if (path === '/settings') return 'Settings';
    if (path === '/devtools') return 'Dev Tools';
    return 'Grace';
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        {/* Mobile Header */}
        <MobileHeader 
          title={getPageTitle()} 
          onMenuClick={toggleSidebar} 
        />

        <div className="flex h-screen lg:h-screen">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarVisible} onClose={closeSidebar} />

          {/* Main Content */}
          <main className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarVisible && isMobile ? 'overflow-hidden' : ''
          } lg:ml-0`}>
            <div className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route
                  path="/settings"
                  element={PUBLIC_MODE ? <Navigate to="/" replace /> : <SettingsPage />}
                />
                <Route
                  path="/devtools"
                  element={PUBLIC_MODE ? <Navigate to="/" replace /> : <DevToolsPage />}
                />
                <Route
                  path="/dev-memory-manager"
                  element={PUBLIC_MODE ? <Navigate to="/" replace /> : <DevMemoryManager />}
                />
                <Route
                  path="*"
                  element={
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-foreground mb-4">Page Not Found</h2>
                        <p className="text-muted-foreground">Looks like you took a wrong turn. 🧭</p>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
