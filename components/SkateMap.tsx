import React, { useState, useEffect } from 'react';
import { findNearbyParks } from '../services/geminiService';
import { MapPin, Navigation, Loader2, Info } from 'lucide-react';

const SkateMap: React.FC = () => {
  const [parks, setParks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    try {
      const result = await findNearbyParks(location.lat, location.lng);
      // Extract chunks from the grounding metadata
      const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      // Also try to parse the text if it's structured nicely, but chunks are safer for raw data
      
      // For the demo, we will create a simple list from the chunks or text
      // Since Gemini structure varies, we'll rely on the text generation and try to parse list items
      // Simple parser for standard list format "1. Park Name: Description"
      const text = result.text || "";
      const lines = text.split('\n').filter((l: string) => l.trim().length > 0);
      
      // Mocking structured data from text for better UI if parsing fails, 
      // but ideally we use the text directly.
      // Let's just display the AI's raw response in a nice card format for now, 
      // assuming the AI follows the prompt to list them.
      
      const parsedParks = lines.map((line: string, idx: number) => ({
          id: idx,
          content: line
      }));
      
      setParks(parsedParks);
      
    } catch (err) {
      setError("Could not fetch skateparks. Check API Key or Connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Global Skatepark Map</h2>
          <p className="text-gray-400">Find the best spots to ride anywhere in the world.</p>
        </div>
        <button 
          onClick={handleSearch}
          disabled={loading || !location}
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Navigation size={20} />}
          {loading ? 'Scanning...' : 'Find Near Me'}
        </button>
      </div>

      {/* Map Visual Placeholder */}
      <div className="flex-1 bg-gray-900 rounded-3xl relative overflow-hidden border border-gray-800 mb-8 group">
         {/* Abstract Map UI */}
         <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]"></div>
         
         <div className="absolute inset-0 flex items-center justify-center">
            {parks.length === 0 && !loading && (
                <div className="text-center">
                    <MapPin size={64} className="text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500">Click 'Find Near Me' to scan for parks</p>
                </div>
            )}
            {loading && (
                 <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-cyan-400 animate-pulse">Triangulating Skateparks...</p>
                 </div>
            )}
         </div>

         {/* Results Overlay */}
         {parks.length > 0 && (
             <div className="absolute inset-0 bg-black/80 backdrop-blur-sm p-8 overflow-y-auto">
                 <h3 className="text-xl text-white font-bold mb-6 sticky top-0 bg-black/80 pb-4 border-b border-gray-800">Detected Locations</h3>
                 <div className="grid gap-4">
                     {parks.map((park) => (
                         <div key={park.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-start gap-4 hover:border-cyan-500 transition-colors cursor-pointer">
                             <div className="bg-cyan-500/20 p-3 rounded-lg text-cyan-400">
                                 <MapPin size={24} />
                             </div>
                             <div>
                                 {/* Since we are displaying raw text lines from AI mostly, we style it simply */}
                                 <p className="text-gray-200">{park.content}</p>
                             </div>
                         </div>
                     ))}
                 </div>
                 <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl flex items-center gap-3">
                     <Info className="text-blue-400" />
                     <p className="text-sm text-blue-200">Data provided by Google Maps AI Grounding. Locations are approximate.</p>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};

export default SkateMap;