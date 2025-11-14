
import React, { useState } from 'react';
import { User, Shield, Palette, Globe, RefreshCw, LogOut, Save } from 'lucide-react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'en',
    autoSave: true,
  });

  const [loading, setLoading] = useState(false);

  const handleSettingChange = (key: string, value: boolean | string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleReloadPersona = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleLogout = () => {
    // Simulate logout
    console.log('Logging out...');
  };

  const settingSections = [
    {
      title: 'Appearance',
      icon: Palette,
      settings: [
        {
          key: 'theme',
          label: 'Color Theme',
          type: 'select',
          options: [
            { value: 'dark', label: 'Dark Mode' },
            { value: 'light', label: 'Light Mode' },
            { value: 'auto', label: 'Auto (System)' },
          ],
        },
        {
          key: 'autoSave',
          label: 'Auto-save Conversations',
          type: 'toggle',
        },
      ],
    },
    {
      title: 'Language & Region',
      icon: Globe,
      settings: [
        {
          key: 'language',
          label: 'Language',
          type: 'select',
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
            { value: 'fr', label: 'Français' },
            { value: 'de', label: 'Deutsch' },
          ],
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Settings</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Customize your Grace experience to suit your preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingSections.map((section, index) => (
            <div
              key={section.title}
              className="card-enhanced p-8 rounded-2xl animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <section.icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">{section.title}</h2>
              </div>

              <div className="space-y-6">
                {section.settings.map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <label className="text-lg font-medium text-foreground">
                        {setting.label}
                      </label>
                    </div>

                    <div className="min-w-48">
                      {setting.type === 'select' && (
                        <select
                          value={String(settings[setting.key as keyof typeof settings])}
                          onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        >
                          {setting.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {setting.type === 'toggle' && (
                        <button
                          onClick={() => handleSettingChange(setting.key, !settings[setting.key as keyof typeof settings])}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                            settings[setting.key as keyof typeof settings] ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              settings[setting.key as keyof typeof settings] ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="card-enhanced p-8 rounded-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Grace Management</h2>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleReloadPersona}
                disabled={loading}
                className="w-full btn-secondary p-4 rounded-xl flex items-center justify-center space-x-3 text-lg"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Reloading Persona...' : 'Reload Grace\'s Persona'}</span>
              </button>

              <button className="w-full btn-primary p-4 rounded-xl flex items-center justify-center space-x-3 text-lg">
                <Save className="w-5 h-5" />
                <span>Save All Settings</span>
              </button>
            </div>
          </div>

          <div className="card-enhanced p-8 rounded-2xl border-destructive/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <LogOut className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Account</h2>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground p-4 rounded-xl flex items-center justify-center space-x-3 text-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
