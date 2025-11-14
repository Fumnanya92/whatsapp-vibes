
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, ShoppingBag, Settings, Wrench, X, Menu, Bell, BellOff } from 'lucide-react';
import notificationManager from '../utils/NotificationManager';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    console.log('🔔 Sidebar useEffect: Getting initial notification state');
    const initialState = notificationManager.isNotificationsEnabled();
    console.log('🔔 Initial notification state:', initialState);
    setNotificationsEnabled(initialState);
  }, []);

  const toggleNotifications = async () => {
    console.log('🔔 Notification toggle clicked! Current state:', notificationsEnabled);
    const newState = notificationManager.toggle();
    setNotificationsEnabled(newState);
    console.log('🔔 New notification state:', newState);
    
    // Show test notification when enabling
    if (newState) {
      await notificationManager.test();
    }
  };

  const navItems = [
    { to: '/', icon: Home, label: 'Home', gradient: 'from-blue-500 to-purple-600' },
    { to: '/chat', icon: MessageSquare, label: 'Chat', gradient: 'from-green-500 to-teal-600' },
    { to: '/catalog', icon: ShoppingBag, label: 'Catalog', gradient: 'from-orange-500 to-red-600' },
    // Removed admin/dev entries for temporary public chat UI
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full min-h-screen w-72 bg-sidebar-background/90 backdrop-blur-xl border-r border-sidebar-border z-40
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:relative lg:translate-x-0
        shadow-2xl lg:shadow-xl
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border/50">
          <div className="flex items-center space-x-3">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Atuche Woman" className="w-10 h-10 rounded-xl shadow-lg" />
            <div>
              <h1 className="text-xl font-bold gradient-text">Grace</h1>
              <p className="text-xs text-muted-foreground">by Atuche Woman</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) => `
                group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-primary/20 text-primary border border-primary/30 shadow-lg' 
                  : 'hover:bg-sidebar-accent text-sidebar-foreground hover:text-primary hover:scale-105'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`
                    p-2 rounded-lg transition-all duration-200
                    ${isActive 
                      ? `bg-gradient-to-br ${item.gradient} shadow-lg` 
                      : 'bg-sidebar-accent group-hover:bg-primary/20'
                    }
                  `}>
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-sidebar-foreground group-hover:text-primary'}`} />
                  </div>
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 space-y-3 border-t border-sidebar-border/50">
          {/* Notification Toggle */}
          <div className="p-4 rounded-xl bg-white/10 backdrop-blur border border-white/20 shadow-lg">
            <button
              onClick={toggleNotifications}
              className="w-full flex items-center justify-between text-sm hover:bg-white/20 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-white/30"
            >
              <div className="flex items-center space-x-3">
                {notificationsEnabled ? (
                  <Bell className="w-5 h-5 text-green-400" />
                ) : (
                  <BellOff className="w-5 h-5 text-red-400" />
                )}
                <span className="font-semibold text-white">
                  Notifications
                </span>
              </div>
              <div className={`w-10 h-5 rounded-full transition-all duration-200 border-2 ${
                notificationsEnabled 
                  ? 'bg-green-500 border-green-400' 
                  : 'bg-gray-600 border-gray-500'
              }`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 rounded-xl glass-effect">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-sm font-bold text-white">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">User</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
