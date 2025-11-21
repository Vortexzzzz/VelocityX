
import React, { useState } from 'react';
import { Clip } from '../types';
import { Play, Share2, Filter, Calendar, Trophy, Search } from 'lucide-react';

interface ClipsProps {
  clips: Clip[];
  onPostToProfile: (clipId: string) => void;
}

const Clips: React.FC<ClipsProps> = ({ clips, onPostToProfile }) => {
  const [sort, setSort] = useState<'newest' | 'oldest' | 'rank'>('newest');
  const [filterRank, setFilterRank] = useState<string>('all');

  const sortedClips = [...clips]
    .filter(c => filterRank === 'all' || c.rank === filterRank)
    .sort((a, b) => {
        if (sort === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sort === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
        // Alphabetical rank sort (rough approximation)
        return a.rank.localeCompare(b.rank);
    });

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Your Clips Library</h1>
          <p className="text-gray-400">Manage and share your verified trick videos.</p>
        </div>
        
        <div className="flex gap-3 bg-vx-panel p-2 rounded-xl border border-gray-800">
           <div className="relative">
               <select 
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="bg-gray-900 text-white pl-10 pr-4 py-2 rounded-lg appearance-none border border-gray-700 focus:border-cyan-500 outline-none text-sm font-bold"
               >
                   <option value="newest">Newest First</option>
                   <option value="oldest">Oldest First</option>
                   <option value="rank">By Rank</option>
               </select>
               <Calendar className="absolute left-3 top-2.5 text-gray-500" size={14} />
           </div>

           <div className="relative">
               <select 
                value={filterRank}
                onChange={(e) => setFilterRank(e.target.value)}
                className="bg-gray-900 text-white pl-10 pr-4 py-2 rounded-lg appearance-none border border-gray-700 focus:border-cyan-500 outline-none text-sm font-bold"
               >
                   <option value="all">All Ranks</option>
                   <option value="Bronze">Bronze</option>
                   <option value="Silver">Silver</option>
                   <option value="Gold">Gold</option>
                   <option value="Platinum">Platinum</option>
                   <option value="Diamond">Diamond</option>
               </select>
               <Filter className="absolute left-3 top-2.5 text-gray-500" size={14} />
           </div>
        </div>
      </div>

      {sortedClips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/30 text-gray-500">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4 text-gray-600">
                  <Play size={32} />
              </div>
              <p className="font-bold text-lg">No Clips Yet</p>
              <p className="text-sm">Record verified tricks in the Ranking section to save clips.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedClips.map(clip => (
                  <div key={clip.id} className="bg-vx-panel rounded-2xl border border-gray-800 overflow-hidden group hover:border-gray-600 transition-all">
                      {/* Video Preview */}
                      <div className="aspect-video bg-black relative">
                          <video 
                            src={clip.videoUrl} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            controls
                          />
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded border border-white/10">
                              {clip.rank}
                          </div>
                      </div>

                      <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                              <div>
                                  <h3 className="text-white font-bold text-lg leading-tight mb-1">{clip.trickName}</h3>
                                  <p className="text-gray-500 text-xs">{new Date(clip.date).toLocaleDateString()}</p>
                              </div>
                              {clip.isPosted ? (
                                  <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                      Posted
                                  </span>
                              ) : (
                                  <button 
                                    onClick={() => onPostToProfile(clip.id)}
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg transition-colors shadow-lg shadow-cyan-500/20"
                                    title="Post to Profile"
                                  >
                                      <Share2 size={16} />
                                  </button>
                              )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-gray-400 text-xs mt-4 pt-4 border-t border-gray-800">
                               <span className="flex items-center gap-1"><Play size={12} /> {clip.views} views</span>
                               <span className="flex items-center gap-1 text-pink-400"><Trophy size={12} /> Verified</span>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default Clips;
