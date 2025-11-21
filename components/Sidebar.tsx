
import React from 'react';
import { Home, Trophy, Map, Zap, User, LogOut, Film } from 'lucide-react';
import { SubscriptionTier } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  subscription: SubscriptionTier;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, subscription, onLogout }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'rank', icon: Trophy, label: 'Ranking' },
    { id: 'clips', icon: Film, label: 'Clips' },
    { id: 'map', icon: Map, label: 'Skateparks' },
    { id: 'perf', icon: Zap, label: 'Speed/Air' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-20 bg-vx-dark border-r border-gray-800 flex flex-col items-center py-8 z-50 shadow-2xl">
      {/* Logo */}
      <div className="mb-12">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <span className="font-black text-white text-xl tracking-tighter">VX</span>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 flex flex-col gap-8 w-full px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative group flex items-center justify-center w-full p-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-cyan-400 bg-gray-900 shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50'
              }`}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 h-8 w-1 bg-cyan-400 rounded-r-full" />
              )}

              {/* Tooltip */}
              <div className="absolute left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <button 
        onClick={onLogout}
        className="mt-auto text-gray-600 hover:text-red-400 transition-colors p-3"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
};

export default Sidebar;
