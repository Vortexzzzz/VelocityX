
import React, { useState } from 'react';
import { UserProfile, Clip } from '../types';
import { MapPin, Link as LinkIcon, Grid, BarChart2, Users, Edit2, Play, Heart, MessageCircle } from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [tab, setTab] = useState<'posts' | 'stats'>('posts');
  const posts = user.clips.filter(c => c.isPosted);

  return (
    <div className="h-full overflow-y-auto pb-24 bg-vx-dark">
        {/* Banner */}
        <div className="h-48 w-full bg-gradient-to-r from-indigo-900 via-purple-900 to-cyan-900 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 relative -top-16">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-end md:items-center gap-6 mb-8">
                <div className="w-32 h-32 rounded-full border-4 border-vx-dark bg-gray-800 flex items-center justify-center text-5xl overflow-hidden relative shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-black">
                        {user.username[0].toUpperCase()}
                    </div>
                </div>
                
                <div className="flex-1 pt-16 md:pt-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-2">
                                {user.username} 
                                <span className="bg-cyan-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider align-middle transform translate-y-[-2px]">
                                    {user.subscription}
                                </span>
                            </h1>
                            <p className="text-gray-400 text-sm font-medium max-w-md">{user.bio || "Rider on VelocityX. Pushing limits every day."}</p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors border border-gray-700">
                                <Edit2 size={14} /> Edit Profile
                            </button>
                        </div>
                    </div>
                    
                    {/* Social Stats */}
                    <div className="flex gap-8 mt-6 border-t border-gray-800 pt-6">
                        <div className="text-center md:text-left">
                            <span className="block text-white font-black text-lg">{posts.length}</span>
                            <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Posts</span>
                        </div>
                        <div className="text-center md:text-left">
                            <span className="block text-white font-black text-lg">{user.followers}</span>
                            <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Followers</span>
                        </div>
                        <div className="text-center md:text-left">
                            <span className="block text-white font-black text-lg">{user.following}</span>
                            <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Following</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex border-b border-gray-800 mb-6 sticky top-0 bg-vx-dark/95 backdrop-blur-sm z-10">
                <button 
                    onClick={() => setTab('posts')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${tab === 'posts' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-white'}`}
                >
                    <Grid size={16} /> Posts
                </button>
                <button 
                    onClick={() => setTab('stats')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${tab === 'stats' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-500 hover:text-white'}`}
                >
                    <BarChart2 size={16} /> Statistics
                </button>
            </div>

            {/* Content Area */}
            {tab === 'posts' ? (
                <div>
                    {posts.length === 0 ? (
                        <div className="py-20 text-center text-gray-500 border border-dashed border-gray-800 rounded-2xl">
                            <Grid size={48} className="mx-auto mb-4 text-gray-700" />
                            <p className="text-lg font-bold mb-2">No Posts Yet</p>
                            <p className="text-sm">Upload clips in Ranking and post them to your profile.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                             {posts.map(clip => (
                                 <div key={clip.id} className="aspect-[9/16] bg-gray-900 relative group cursor-pointer overflow-hidden rounded-lg">
                                     <video src={clip.videoUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                         <h3 className="text-white font-bold">{clip.trickName}</h3>
                                         <div className="flex items-center gap-4 text-gray-300 text-xs mt-2">
                                             <span className="flex items-center gap-1"><Heart size={12} /> {clip.likes}</span>
                                             <span className="flex items-center gap-1"><MessageCircle size={12} /> 0</span>
                                         </div>
                                     </div>
                                     <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md">
                                         {clip.rank}
                                     </div>
                                 </div>
                             ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-vx-panel p-6 rounded-2xl border border-gray-800">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Users size={18} /> Account Details</h3>
                        <div className="space-y-4">
                             <div className="flex justify-between border-b border-gray-800 pb-2">
                                 <span className="text-gray-500">Member Since</span>
                                 <span className="text-white font-bold">2024</span>
                             </div>
                             <div className="flex justify-between border-b border-gray-800 pb-2">
                                 <span className="text-gray-500">Primary Sport</span>
                                 <span className="text-white font-bold">{user.selectedSports[0]}</span>
                             </div>
                             <div className="flex justify-between">
                                 <span className="text-gray-500">Total XP</span>
                                 <span className="text-cyan-400 font-bold">{user.xp}</span>
                             </div>
                        </div>
                    </div>
                    <div className="bg-vx-panel p-6 rounded-2xl border border-gray-800">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><BarChart2 size={18} /> Performance</h3>
                         <div className="grid grid-cols-2 gap-4 text-center">
                             <div className="bg-gray-900 p-4 rounded-xl">
                                 <p className="text-xs text-gray-500 uppercase font-bold">Logged Tricks</p>
                                 <p className="text-2xl text-white font-black">{user.tricksLogged}</p>
                             </div>
                             <div className="bg-gray-900 p-4 rounded-xl">
                                 <p className="text-xs text-gray-500 uppercase font-bold">Sessions</p>
                                 <p className="text-2xl text-white font-black">{user.sessionsCount}</p>
                             </div>
                         </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default Profile;
