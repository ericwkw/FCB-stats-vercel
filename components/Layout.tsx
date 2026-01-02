import React, { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, FileText, Settings, Moon, Sun, History, BarChart2, Home, MapPin, Coffee, Cloud, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { isLoading } = useApp();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      setIsDark(true);
    }
  };

  // Grouped Navigation
  const navGroups = [
    {
      label: "Home",
      items: [
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'dashboard', label: 'Dashboard', icon: Trophy },
      ]
    },
    {
      label: "Analytics",
      items: [
        { id: 'stats', label: 'Stats Comparison', icon: BarChart2 },
        { id: 'history', label: 'Match History', icon: History },
      ]
    },
    {
      label: "Management",
      items: [
         { id: 'matches', label: 'New Match', icon: Calendar },
         { id: 'players', label: 'Squad List', icon: Users },
         { id: 'venues', label: 'Venues', icon: MapPin },
      ]
    },
    {
      label: "System",
      items: [
        { id: 'import', label: 'Import / Export', icon: FileText },
        { id: 'settings', label: 'Scoring Rules', icon: Settings },
      ]
    }
  ];

  const handleKofiClick = () => {
    window.open('https://ko-fi.com/R6R71PIYM0', '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Nav - Simplified flat list for mobile */}
      <div className="md:hidden bg-jersey-dark text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-bold text-xl text-pitch-500">PitchPerfect</h1>
        <div className="flex space-x-2 overflow-x-auto">
            {navGroups.flatMap(g => g.items).filter(i => ['overview', 'dashboard', 'matches', 'players', 'venues'].includes(i.id)).map(item => (
                <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`p-2 rounded-lg flex-shrink-0 ${activeTab === item.id ? 'bg-pitch-600' : 'text-gray-400'}`}
                >
                    <item.icon size={20} />
                </button>
            ))}
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-400 hover:bg-white/10">
               {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-jersey-dark text-white p-6 fixed h-full shadow-xl z-10 transition-colors overflow-y-auto">
        <div className="mb-8 flex items-center justify-between">
             <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('overview')}>
                <div className="w-8 h-8 bg-pitch-500 rounded-full flex items-center justify-center shadow-lg shadow-pitch-900/50">
                    <Trophy size={16} className="text-white" />
                </div>
                <h1 className="font-bold text-2xl tracking-tight">PitchPerfect</h1>
            </div>
        </div>

        <nav className="flex-1 space-y-8">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-4">{group.label}</h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                        activeTab === item.id
                          ? 'bg-pitch-600 text-white shadow-lg shadow-pitch-900/50'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon size={18} className={activeTab === item.id ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        
        <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
            <button 
              onClick={handleKofiClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#72a4f2] hover:bg-[#5a8fd9] text-white rounded-xl font-bold transition-all shadow-lg transform hover:-translate-y-0.5"
            >
              <Coffee size={18} className="animate-pulse"/>
              <span>Support on Ko-fi</span>
            </button>

            <button 
                onClick={toggleTheme}
                className="w-full flex items-center space-x-3 px-4 py-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            >
               {isDark ? <Sun size={18} /> : <Moon size={18} />}
               <span className="font-medium text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <div className="text-xs text-gray-600 text-center flex flex-col items-center">
                <p>Team Stat Tracker v1.5</p>
                <div className="flex items-center gap-1 mt-1 text-pitch-500">
                    <Cloud size={12} />
                    <span>Cloud Synced</span>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        {isLoading ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 space-y-4 min-h-[50vh]">
                <Loader2 size={48} className="animate-spin text-pitch-500" />
                <p className="font-medium">Syncing with database...</p>
            </div>
        ) : (
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        )}
      </main>
    </div>
  );
};

export default Layout;