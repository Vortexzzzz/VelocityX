
import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Check, Trash2, Type, Bike, AlertTriangle, RotateCcw } from 'lucide-react';
import { ThemeOption, FontOption, UserProfile, Sport } from '../types';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
  onFactoryReset: () => void;
}

export const THEMES: Record<ThemeOption, { name: string, colors: string[], primary: string }> = {
    default: { 
        name: 'Neon Cyber', 
        colors: ['#22d3ee', '#a78bfa'], 
        primary: '#22d3ee' 
    },
    magma: { 
        name: 'Magma', 
        colors: ['#f87171', '#fb923c'], 
        primary: '#f87171' 
    },
    venom: { 
        name: 'Venom', 
        colors: ['#4ade80', '#a3e635'], 
        primary: '#4ade80' 
    },
    royal: { 
        name: 'Royal', 
        colors: ['#60a5fa', '#facc15'], 
        primary: '#60a5fa' 
    }
};

export const FONTS: Record<FontOption, { name: string, family: string }> = {
    inter: { name: 'Inter (Default)', family: '"Inter", sans-serif' },
    roboto: { name: 'Roboto', family: '"Roboto", sans-serif' },
    poppins: { name: 'Poppins', family: '"Poppins", sans-serif' },
    montserrat: { name: 'Montserrat', family: '"Montserrat", sans-serif' }
};

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, user, onUpdate, onFactoryReset }) => {
  const [bgPreview, setBgPreview] = useState<string | null>(user.customBackgroundUrl || null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleThemeChange = (theme: ThemeOption) => {
      onUpdate({ theme });
  };

  const handleFontChange = (font: FontOption) => {
      onUpdate({ font });
  };
  
  const handleSportChange = (sport: Sport) => {
      onUpdate({ activeSport: sport });
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const result = reader.result as string;
              setBgPreview(result);
              onUpdate({ customBackgroundUrl: result });
          };
          reader.readAsDataURL(file);
      }
  };

  const clearBackground = () => {
      setBgPreview(null);
      onUpdate({ customBackgroundUrl: undefined });
  };
  
  // Sports available to switch to (defined in UserProfile availableSports or basic list)
  const availableSports = user.availableSports.length > 0 
    ? user.availableSports 
    : [Sport.Skateboard, Sport.Scooter, Sport.BMX, Sport.MountainBike];

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-vx-panel border border-gray-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center shrink-0">
            <h2 className="text-2xl font-bold text-white">App Settings</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto">
            
            {/* Primary Sport Selector */}
            <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Bike size={16} /> Primary Sport (What are you riding?)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {availableSports.map((sport) => {
                        const isActive = user.activeSport === sport;
                        return (
                            <button
                                key={sport}
                                onClick={() => handleSportChange(sport)}
                                className={`relative p-4 rounded-xl border transition-all flex items-center justify-between group
                                    ${isActive 
                                        ? 'bg-gray-800 border-cyan-500 ring-1 ring-cyan-500' 
                                        : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'
                                    }`}
                            >
                                <span className={`font-bold ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                    {sport}
                                </span>
                                {isActive && (
                                    <div className="text-cyan-500">
                                        <Check size={16} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">
                    Switching sports changes your active Rank, Stats, and Trick Checklist.
                </p>
            </div>

            <hr className="border-gray-800" />

            {/* Color Themes */}
            <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Color Theme</h3>
                <div className="grid grid-cols-2 gap-4">
                    {(Object.keys(THEMES) as ThemeOption[]).map((themeKey) => {
                        const theme = THEMES[themeKey];
                        const isActive = user.theme === themeKey;
                        return (
                            <button
                                key={themeKey}
                                onClick={() => handleThemeChange(themeKey)}
                                className={`relative p-4 rounded-xl border transition-all flex items-center gap-3 group
                                    ${isActive 
                                        ? 'bg-gray-800 border-cyan-500 ring-1 ring-cyan-500' 
                                        : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'
                                    }`}
                            >
                                <div className="flex gap-1">
                                    {theme.colors.map(c => (
                                        <div key={c} className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                                <span className={`font-bold ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                    {theme.name}
                                </span>
                                {isActive && (
                                    <div className="absolute top-2 right-2 text-cyan-500">
                                        <Check size={16} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Typography */}
            <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Type size={16} /> Typography
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {(Object.keys(FONTS) as FontOption[]).map((fontKey) => {
                        const font = FONTS[fontKey];
                        const isActive = (user.font || 'inter') === fontKey;
                        return (
                            <button
                                key={fontKey}
                                onClick={() => handleFontChange(fontKey)}
                                className={`relative p-4 rounded-xl border transition-all flex items-center justify-between group
                                    ${isActive 
                                        ? 'bg-gray-800 border-cyan-500 ring-1 ring-cyan-500' 
                                        : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'
                                    }`}
                                style={{ fontFamily: font.family }}
                            >
                                <span className={`text-lg ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                    {font.name}
                                </span>
                                {isActive && (
                                    <div className="text-cyan-500">
                                        <Check size={16} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Background Image */}
            <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Custom Background</h3>
                <div className="relative group rounded-2xl overflow-hidden border-2 border-dashed border-gray-700 bg-gray-900/50 hover:border-gray-500 transition-all h-48 flex flex-col items-center justify-center">
                    {bgPreview ? (
                        <>
                            <div 
                                className="absolute inset-0 bg-cover bg-center opacity-60"
                                style={{ backgroundImage: `url(${bgPreview})` }}
                            />
                            <div className="relative z-10 flex gap-3">
                                <label className="cursor-pointer bg-gray-900/80 hover:bg-black text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                                    <Upload size={16} /> Change
                                    <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} />
                                </label>
                                <button 
                                    onClick={clearBackground}
                                    className="bg-red-900/80 hover:bg-red-900 text-red-200 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 size={16} /> Remove
                                </button>
                            </div>
                        </>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                            <ImageIcon size={32} className="text-gray-500 mb-2 group-hover:text-white transition-colors" />
                            <span className="text-gray-400 font-medium group-hover:text-white transition-colors">Upload Image</span>
                            <span className="text-xs text-gray-600 mt-1">Recommended: 1920x1080</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} />
                        </label>
                    )}
                </div>
            </div>

            <hr className="border-gray-800" />

            {/* Danger Zone */}
            <div>
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <AlertTriangle size={16} /> Danger Zone
                </h3>
                {!showResetConfirm ? (
                    <button 
                        onClick={() => setShowResetConfirm(true)}
                        className="w-full bg-red-900/20 hover:bg-red-900/40 border border-red-900 text-red-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        <RotateCcw size={16} /> Factory Reset App
                    </button>
                ) : (
                    <div className="bg-red-900/20 border border-red-900 p-4 rounded-xl text-center">
                        <p className="text-white font-bold mb-2">Are you absolutely sure?</p>
                        <p className="text-red-300 text-xs mb-4">This will wipe ALL data, accounts, and settings. You will be returned to the login screen.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 bg-gray-800 text-white py-2 rounded-lg font-bold"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={onFactoryReset}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg font-bold"
                            >
                                Yes, Wipe Everything
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="p-6 border-t border-gray-700 bg-gray-900/50 shrink-0">
            <button 
                onClick={onClose}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-colors"
            >
                Done
            </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
