
import React, { useState, useEffect } from 'react';
import { findNearbyParks } from '../services/geminiService';
import { MapPin, Navigation, Loader2, Info, Map as MapIcon, ArrowRight, X, AlertTriangle } from 'lucide-react';

interface Park {
  id: number;
  name: string;
  description: string;
  x: number; // Simulated X coordinate (%)
  y: number; // Simulated Y coordinate (%)
}

const MOCK_PARKS: Park[] = [
  { id: 101, name: "Venice Beach Skatepark", description: "Legendary oceanfront concrete park with snake run and bowls.", x: 40, y: 60 },
  { id: 102, name: "Burnside Skatepark", description: "Iconic DIY concrete park under the bridge.", x: 70, y: 30 },
  { id: 103, name: "Pier 62 Skatepark", description: "Hudson River park with open flow and ledges.", x: 20, y: 50 },
  { id: 104, name: "Kona Skatepark", description: "Historic park with famous snake run and vert ramp.", x: 80, y: 70 },
  { id: 105, name: "FDR Skatepark", description: "Gritty DIY spot under the freeway.", x: 30, y: 20 }
];

const SkateMap: React.FC = () => {
  const [parks, setParks] = useState<Park[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          console.error("Geo error", err);
          // Default fallback (San Francisco) if blocked
          setLocation({ lat: 37.7749, lng: -122.4194 });
        }
      );
    }
  }, []);

  const handleSearch = async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    setParks([]);
    setSelectedParkId(null);
    setIsDemoMode(false);

    try {
      const result = await findNearbyParks(location.lat, location.lng);
      
      const text = result.text || "";
      const lines = text.split('\n').filter((l: string) => l.trim().length > 0);
      
      // Smarter parsing to extract Name vs Description if possible
      const parsedParks: Park[] = lines.map((line: string, idx: number) => {
          // Attempt to split by ": " or " - " or just take the whole line
          let name = line;
          let description = "Skatepark location";
          
          // Regex to remove leading numbers like "1. "
          const cleanLine = line.replace(/^\d+[\.)]\s*/, '');
          
          if (cleanLine.includes(':')) {
              const parts = cleanLine.split(':');
              name = parts[0].trim();
              description = parts.slice(1).join(':').trim();
          } else if (cleanLine.includes(' - ')) {
              const parts = cleanLine.split(' - ');
              name = parts[0].trim();
              description = parts.slice(1).join(' - ').trim();
          } else {
              name = cleanLine;
          }

          return {
              id: idx,
              name,
              description,
              // Randomize position to simulate map distribution (keeping away from extreme edges)
              x: 15 + Math.random() * 70, 
              y: 15 + Math.random() * 70
          };
      });
      
      setParks(parsedParks);
      
    } catch (err: any) {
      setIsDemoMode(true);
      setParks(MOCK_PARKS); // Fallback to mock data
      if (err.message === "QUOTA_EXCEEDED") {
          setError("Daily AI limit reached. Map switched to Demo Mode.");
      } else {
          setError("Connection failed. Map switched to Demo Mode.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 h-full flex flex-col max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
             Global Skate Map <MapIcon className="text-cyan-500" />
          </h2>
          <p className="text-gray-400">Discover top-rated spots near your location.</p>
        </div>
        <button 
          onClick={handleSearch}
          disabled={loading || !location}
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Navigation size={20} fill="currentColor" />}
          {loading ? 'Scanning Area...' : 'Scan Local Area'}
        </button>
      </div>

      {/* Main Interface */}
      <div className="flex-1 relative bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl flex flex-col md:flex-row">
         
         {/* Map Viewport */}
         <div className="relative flex-1 bg-[#0f172a] overflow-hidden group">
             {/* Grid Pattern Background */}
             <div 
                className="absolute inset-0 opacity-10"
                style={{ 
                    backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
             />
             
             {/* Radar Effect when loading */}
             {loading && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="w-[500px] h-[500px] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent rounded-full animate-spin blur-xl opacity-50" />
                     <div className="absolute w-64 h-64 border-2 border-cyan-500/30 rounded-full animate-ping" />
                 </div>
             )}

             {/* Empty State */}
             {parks.length === 0 && !loading && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                     <MapPin size={64} className="mb-4 opacity-50" />
                     <p className="text-lg font-bold">Map Offline</p>
                     <p className="text-sm">Click "Scan Local Area" to triangulate spots.</p>
                 </div>
             )}

             {/* Simulated Markers */}
             {parks.map((park) => (
                 <button
                    key={park.id}
                    onClick={() => setSelectedParkId(park.id)}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group/marker z-10
                        ${selectedParkId === park.id ? 'scale-125 z-50' : 'hover:scale-110'}`}
                    style={{ left: `${park.x}%`, top: `${park.y}%` }}
                 >
                     <div className={`relative flex flex-col items-center ${selectedParkId === park.id ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-300'}`}>
                         <MapPin size={selectedParkId === park.id ? 48 : 32} fill={selectedParkId === park.id ? "currentColor" : "none"} strokeWidth={2.5} className="drop-shadow-lg" />
                         
                         {/* Pulse Effect */}
                         <div className={`absolute bottom-0 w-full h-2 bg-cyan-500/50 blur-md rounded-full transform scale-x-0 transition-transform duration-300 ${selectedParkId === park.id ? 'scale-x-100' : ''}`} />
                     </div>

                     {/* Info Popup (Tooltip style) */}
                     <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-gray-900/90 backdrop-blur-md border border-gray-700 p-3 rounded-xl text-left shadow-xl transition-all duration-300 origin-bottom pointer-events-none
                         ${selectedParkId === park.id ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}
                     `}>
                         <h4 className="text-white font-bold text-sm mb-1 leading-tight">{park.name}</h4>
                         <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">View Details</div>
                         <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900/90 border-r border-b border-gray-700 transform rotate-45"></div>
                     </div>
                 </button>
             ))}
         </div>

         {/* Results Sidebar / Overlay */}
         <div className={`
             absolute md:relative inset-0 md:inset-auto z-20 
             md:w-80 bg-vx-panel/95 backdrop-blur-xl border-l border-gray-800 flex flex-col
             transition-transform duration-300 transform
             ${parks.length > 0 ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
         `}>
             <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                 <h3 className="text-white font-bold flex items-center gap-2">
                     <Navigation size={16} className="text-cyan-400" />
                     {isDemoMode ? 'Demo Results' : 'Detected Spots'}
                 </h3>
                 <span className="bg-gray-800 text-gray-400 text-xs font-bold px-2 py-1 rounded-full">
                     {parks.length}
                 </span>
             </div>

             {error && (
                 <div className="p-3 bg-yellow-500/10 text-yellow-400 text-xs font-bold border-b border-yellow-500/20 flex items-center gap-2">
                     <AlertTriangle size={12} /> {error}
                 </div>
             )}

             <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                 {parks.length === 0 && !loading && (
                     <div className="text-center py-10 text-gray-500 text-sm">
                         Use the scanner to find parks.
                     </div>
                 )}

                 {parks.map(park => (
                     <div 
                        key={park.id}
                        onClick={() => setSelectedParkId(park.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer group
                            ${selectedParkId === park.id 
                                ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                                : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600'}
                        `}
                     >
                         <div className="flex justify-between items-start mb-2">
                             <h4 className={`font-bold text-sm ${selectedParkId === park.id ? 'text-cyan-400' : 'text-white group-hover:text-cyan-200'}`}>
                                 {park.name}
                             </h4>
                             {selectedParkId === park.id && <ArrowRight size={14} className="text-cyan-500" />}
                         </div>
                         <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                             {park.description}
                         </p>
                     </div>
                 ))}
             </div>

             <div className="p-4 bg-blue-900/20 border-t border-blue-500/20">
                <div className="flex gap-3">
                    <Info className="text-blue-400 shrink-0" size={16} />
                    <p className="text-[10px] text-blue-200 leading-tight">
                        Locations are approximate based on AI search data. Always check local regulations.
                    </p>
                </div>
             </div>
         </div>

      </div>
    </div>
  );
};

export default SkateMap;
