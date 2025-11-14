
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ShoppingBag, Wrench, TrendingUp, Users, Activity, Sparkles, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  const [stats, setStats] = useState({
    conversations: 0,
    memoryEntries: 0,
    recentRequests: 0,
  });

  const [recentActivities] = useState([
    "Analyzed customer feedback for product improvements",
    "Generated sales report for Q4 performance review",
    "Assisted with inventory management optimization",
    "Provided customer support for billing inquiries",
    "Created marketing content for new product launch"
  ]);

  useEffect(() => {
    // Animate stats counting up
    const timer = setTimeout(() => {
      setStats({
        conversations: 1247,
        memoryEntries: 89,
        recentRequests: 156,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const actionCards = [
    {
      title: 'Chat with Grace',
      description: 'Start a conversation with your AI assistant',
      icon: MessageSquare,
      to: '/chat',
      gradient: 'from-blue-500 to-purple-600',
      color: 'text-blue-400'
    },
    {
      title: 'Browse Catalog',
      description: 'Explore our product collection',
      icon: ShoppingBag,
      to: '/catalog',
      gradient: 'from-orange-500 to-red-600',
      color: 'text-orange-400'
    },
    {
      title: 'Dev Tools',
      description: 'Access developer utilities',
      icon: Wrench,
      to: '/devtools',
      gradient: 'from-green-500 to-teal-600',
      color: 'text-green-400'
    },
  ];

  const statCards = [
    {
      title: 'Total Conversations',
      value: stats.conversations,
      icon: TrendingUp,
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Memory Entries',
      value: stats.memoryEntries,
      icon: Activity,
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Recent Requests',
      value: stats.recentRequests,
      icon: Users,
      gradient: 'from-green-500 to-teal-600'
    },
  ];

  return (
    <div className="min-h-screen p-6 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 animate-fade-in">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-5xl font-bold gradient-text">Welcome to Grace</h1>
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Your AI-powered business assistant for sales, support, and strategy — all in one intelligent platform.
            Experience the future of business automation with Grace's advanced capabilities.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {actionCards.map((card, index) => (
            <Link
              key={card.to}
              to={card.to}
              className="group card-enhanced p-8 rounded-2xl transition-all duration-300 hover:scale-105 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 mx-auto`}>
                  <card.icon className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground">{card.description}</p>
                </div>
                <div className="flex items-center justify-center space-x-2 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-sm font-medium">Get Started</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold gradient-text mb-2">Dashboard Overview</h2>
          <p className="text-muted-foreground">Real-time insights into your Grace experience</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={stat.title}
              className="card-enhanced p-8 rounded-2xl text-center space-y-4 animate-scale-in"
              style={{ animationDelay: `${(index + 4) * 100}ms` }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg mx-auto`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-primary loading-pulse">
                  {stat.value.toLocaleString()}
                </h3>
                <p className="text-muted-foreground font-medium">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activities */}
      <section className="animate-slide-up" style={{ animationDelay: '600ms' }}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold gradient-text mb-2">Recent Activities</h2>
          <p className="text-muted-foreground">Latest interactions and accomplishments</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="card-enhanced p-8 rounded-2xl space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 rounded-xl hover:bg-accent/50 transition-all duration-200 group animate-fade-in"
                style={{ animationDelay: `${(index + 7) * 100}ms` }}
              >
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <p className="text-foreground group-hover:text-primary transition-colors flex-1">
                  {activity}
                </p>
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  Just now
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="text-center animate-slide-up" style={{ animationDelay: '900ms' }}>
        <div className="max-w-3xl mx-auto card-enhanced p-12 rounded-2xl">
          <blockquote className="text-2xl font-medium text-foreground italic mb-4 leading-relaxed">
            "Grace isn't just smart — she learns with you, grows with your business, and transforms how you work."
          </blockquote>
          <cite className="text-primary font-semibold">— Team Grace</cite>
        </div>
      </section>
    </div>
  );
};

export default Home;
