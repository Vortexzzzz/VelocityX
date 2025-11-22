
import React, { useState } from 'react';
import { UserProfile, Clip, ExperienceLevel } from '../types';
import { MapPin, Link as LinkIcon, Grid, BarChart2, Users, Edit2, Play, Heart, MessageCircle, UserPlus, UserMinus, ArrowLeft, X, Check, Camera } from 'lucide-react';
import RankIcon from './RankIcon';

interface ProfileProps {
  user: UserProfile;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
  onBack?: () => void;
  onProfileUpdate?: (updates: Partial<UserProfile>) => void;
}

const Profile: React.FC<ProfileProps> = ({ 
    user, 
    isOwnProfile = true, 
    isFollowing = false, 
    onFollowToggle,
    onBack,
    onProfileUpdate
}) => {
  const [tab, setTab] = useState<'posts' | 'stats'>('posts');
  const [viewingClip, setViewingClip] = useState<Clip | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user.bio || "");
  const [editExperience, setEditExperience] = useState<ExperienceLevel>(user.experienceLevel || 'Beginner');

  const posts = user.clips.filter(c => c.isPosted);

  // Access stats for the currently active sport
  const activeSportStats = user.sportProfiles[user.activeSport];

  const handleSave = () => {
      if (onProfileUpdate) {
          onProfileUpdate({ bio, experienceLevel: editExperience });
      }
      setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'bannerUrl') => {
    const file = e.target.files?.[0];
    if (file && onProfileUpdate) {
        const reader = new FileReader();
        reader.onloadend = () => {
            onProfileUpdate({ [field]: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-vx-dark">
        {/* Video Modal */}
        {viewingClip && (
            <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fade-in">
                <button 
                    onClick={() => setViewingClip(null)}
                    className="absolute top-6 right-6 text-gray-400 hover:text-white bg-gray-800 rounded-full p-2 transition-colors"
                >
                    <X size={24} />
                </button>
                <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 relative">
                    <video 
                        src={viewingClip.videoUrl} 
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                    />
                </div>
                <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none">
                    <h3 className="text-white font-bold text-xl shadow-black drop-shadow-md">{viewingClip.trickName}</h3>
                    <p className="text-gray-300 text-sm shadow-black drop-shadow-md">{viewingClip.rank} Rank</p>
                </div>
            </div>
        )}

        {/* Banner */}
        <div className="h-48 w-full relative group">
            {user.bannerUrl ? (
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${user.bannerUrl})` }}
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-cyan-900">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                </div>
            )}
            
            {/* Banner Upload Overlay */}
            {isOwnProfile && (
                <label className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors cursor-pointer flex items-center justify-center">
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, 'bannerUrl')}
                    />
                    <div className="bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={24} />
                    </div>
                </label>
            )}

            {/* Back Button for Friend View */}
            {!isOwnProfile && onBack && (
                <button 
                    onClick={onBack}
                    className="absolute top-6 left-6 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-md transition-all z-10"
                >
                    <ArrowLeft size={20} />
                </button>
            )}
        </div>

        <div className="max-w-5xl mx-auto px-6 relative -top-16">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-end md:items-center gap-6 mb-8">
                {/* Avatar */}
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-vx-dark bg-gray-800 flex items-center justify-center text-5xl overflow-hidden shadow-2xl relative">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-black">
                                {user.username[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                    
                    {/* Avatar Upload Overlay */}
                    {isOwnProfile && (
                        <label className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors cursor-pointer flex items-center justify-center z-10">
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handleImageUpload(e, 'avatarUrl')}
                            />
                            <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={24} />
                            </div>
                        </label>
                    )}
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
                            {isEditing ? (
                                <textarea 
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-cyan-500 mt-2"
                                    rows={3}
                                    placeholder="Tell us about yourself..."
                                />
                            ) : (
                                <p className="text-gray-400 text-sm font-medium max-w-md">{user.bio || "Rider on VelocityX. Pushing limits every day."}</p>
                            )}
                        </div>
                        
                        <div className="flex gap-3">
                            {isOwnProfile ? (
                                isEditing ? (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => {
                                                setIsEditing(false);
                                                setBio(user.bio || "");
                                                setEditExperience(user.experienceLevel || 'Beginner');
                                            }}
                                            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-gray-700"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleSave}
                                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20"
                                        >
                                            <Check size={14} /> Save
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            setBio(user.bio || "");
                                            setEditExperience(user.experienceLevel || 'Beginner');
                                            setIsEditing(true);
                                        }}
                                        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors border border-gray-700"
                                    >
                                        <Edit2 size={14} /> Edit Profile
                                    </button>
                                )
                            ) : (
                                <button 
                                    onClick={onFollowToggle}
                                    className={`px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-lg
                                        ${isFollowing 
                                            ? 'bg-gray-800 text-gray-300 hover:bg-red-900/50 hover:text-red-400 border border-gray-700' 
                                            : 'bg-cyan-500 hover:bg-cyan-400 text-black'
                                        }`}
                                >
                                    {isFollowing ? (
                                        <>
                                            <UserMinus size={16} /> Unfollow
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={16} /> Follow
                                        </>
                                    )}
                                </button>
                            )}
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
                                 <div 
                                    key={clip.id} 
                                    onClick={() => setViewingClip(clip)}
                                    className="aspect-[9/16] bg-gray-900 relative group cursor-pointer overflow-hidden rounded-lg border border-transparent hover:border-cyan-500/50 transition-all"
                                 >
                                     <video src={clip.videoUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                         <h3 className="text-white font-bold">{clip.trickName}</h3>
                                         <div className="flex items-center gap-4 text-gray-300 text-xs mt-2">
                                             <span className="flex items-center gap-1"><Heart size={12} /> {clip.likes}</span>
                                             <span className="flex items-center gap-1"><MessageCircle size={12} /> 0</span>
                                         </div>
                                         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cyan-500/80 p-3 rounded-full text-white shadow-lg backdrop-blur-sm scale-0 group-hover:scale-100 transition-transform">
                                             <Play size={24} fill="white" />
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
                                 <span className="text-white font-bold">{user.activeSport}</span>
                             </div>
                             
                             {/* Experience Level Row */}
                             <div className="flex justify-between border-b border-gray-800 pb-2 items-center">
                                 <span className="text-gray-500">Experience Level</span>
                                 {isEditing ? (
                                     <select
                                        value={editExperience}
                                        onChange={(e) => setEditExperience(e.target.value as ExperienceLevel)}
                                        className="bg-gray-900 text-white text-sm border border-gray-700 rounded px-2 py-1 focus:outline-none focus:border-cyan-500"
                                     >
                                         <option value="Beginner">Beginner</option>
                                         <option value="Novice">Novice</option>
                                         <option value="Expert">Expert</option>
                                         <option value="Pro">Pro</option>
                                     </select>
                                 ) : (
                                    <span className="text-white font-bold">{user.experienceLevel || 'Beginner'}</span>
                                 )}
                             </div>

                             <div className="flex justify-between items-center">
                                 <span className="text-gray-500">Rank</span>
                                 <div className="flex items-center gap-2">
                                    <RankIcon rank={activeSportStats.currentRank} size={20} />
                                    <span className="text-cyan-400 font-bold">{activeSportStats.currentRank}</span>
                                 </div>
                             </div>
                             <div className="flex justify-between">
                                 <span className="text-gray-500">Total XP</span>
                                 <span className="text-cyan-400 font-bold">{activeSportStats.xp}</span>
                             </div>
                        </div>
                    </div>
                    <div className="bg-vx-panel p-6 rounded-2xl border border-gray-800">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><BarChart2 size={18} /> Performance</h3>
                         <div className="grid grid-cols-2 gap-4 text-center">
                             <div className="bg-gray-900 p-4 rounded-xl">
                                 <p className="text-xs text-gray-500 uppercase font-bold">Logged Tricks</p>
                                 <p className="text-2xl text-white font-black">{activeSportStats.tricksLogged}</p>
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
