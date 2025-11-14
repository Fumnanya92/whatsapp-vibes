
import React, { useState } from 'react';
import { 
  Code, Brain, Mic, Settings, Target, RefreshCw, MessageSquare,
  Send, TestTube, Database, Wrench, Activity
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'grace';
  timestamp: Date;
}

const DevTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dev-assistant');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to the Dev Assistant! I can help you with development tasks, debugging, and system analysis.',
      sender: 'grace',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const tabs = [
    { id: 'dev-assistant', label: 'Dev Assistant', icon: MessageSquare, color: 'from-blue-500 to-purple-600' },
    { id: 'prompt-playground', label: 'Prompt Playground', icon: Code, color: 'from-green-500 to-teal-600' },
    { id: 'memory-viewer', label: 'Memory Viewer', icon: Brain, color: 'from-purple-500 to-pink-600' },
    { id: 'speech-library', label: 'Speech Library', icon: Mic, color: 'from-orange-500 to-red-600' },
    { id: 'prompt-tuner', label: 'Prompt Tuner', icon: Settings, color: 'from-yellow-500 to-orange-600' },
    { id: 'intent-trainer', label: 'Intent Trainer', icon: Target, color: 'from-indigo-500 to-purple-600' },
    { id: 'system-config', label: 'System Config', icon: RefreshCw, color: 'from-gray-500 to-gray-600' },
  ];

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate Grace's response
    setTimeout(() => {
      const graceMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I understand you're asking about "${inputText}". As a development assistant, I can help you with code analysis, debugging, system optimization, and technical documentation. What specific development task would you like assistance with?`,
        sender: 'grace',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, graceMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderDevAssistant = () => (
    <div className="flex flex-col h-[600px] bg-background rounded-2xl border border-border overflow-hidden">
      {/* Chat Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Dev Assistant</h3>
            <p className="text-sm text-muted-foreground">Development & debugging support</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-6 py-4 shadow-lg ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              <p className={`text-xs mt-2 ${
                message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-card border border-border rounded-2xl px-6 py-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm text-muted-foreground">Grace is analyzing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about development, debugging, or system analysis..."
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderToolCard = (title: string, description: string, icon: React.ElementType, children: React.ReactNode) => (
    <div className="card-enhanced p-8 rounded-2xl space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
          {React.createElement(icon, { className: "w-6 h-6 text-white" })}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dev-assistant':
        return renderDevAssistant();
      
      case 'prompt-playground':
        return renderToolCard(
          'Prompt Playground',
          'Test and experiment with different AI prompts',
          TestTube,
          <div className="space-y-4">
            <textarea
              placeholder="Enter your prompt here..."
              className="w-full h-32 px-4 py-3 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button className="btn-primary px-6 py-3 rounded-xl">
              Run Prompt
            </button>
          </div>
        );
      
      case 'memory-viewer':
        return renderToolCard(
          'Memory Viewer',
          'View and manage stored conversation memories',
          Database,
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">No memories stored yet</p>
            </div>
          </div>
        );
      
      case 'speech-library':
        return renderToolCard(
          'Speech Library',
          'Manage voice responses and audio settings',
          Mic,
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="btn-secondary p-4 rounded-xl">Record New</button>
              <button className="btn-secondary p-4 rounded-xl">Import Audio</button>
            </div>
          </div>
        );
      
      case 'prompt-tuner':
        return renderToolCard(
          'Prompt Tuner',
          'Fine-tune system prompts for better responses',
          Wrench,
          <div className="space-y-4">
            <textarea
              placeholder="System prompt configuration..."
              className="w-full h-32 px-4 py-3 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button className="btn-primary px-6 py-3 rounded-xl">
              Save Configuration
            </button>
          </div>
        );
      
      case 'intent-trainer':
        return renderToolCard(
          'Intent Trainer',
          'Train AI to recognize user intents and patterns',
          Target,
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Intent name..."
                className="px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <input
                placeholder="Example phrase..."
                className="px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button className="btn-primary px-6 py-3 rounded-xl">
              Add Training Data
            </button>
          </div>
        );
      
      case 'system-config':
        return renderToolCard(
          'System Configuration',
          'Manage system settings and reload configurations',
          Activity,
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="btn-secondary p-4 rounded-xl flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Reload Config</span>
              </button>
              <button className="btn-secondary p-4 rounded-xl flex items-center justify-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>System Status</span>
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold gradient-text">Developer Tools</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Advanced tools for development, debugging, and system management
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 p-2 bg-card/50 rounded-2xl border border-border animate-slide-up">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground hover:scale-105'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default DevTools;
