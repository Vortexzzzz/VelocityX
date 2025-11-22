
import React, { useState } from 'react';
import { UserProfile, Rank } from '../types';
import { Search, UserPlus, UserCheck, ExternalLink } from 'lucide-react';
import RankIcon from './RankIcon';

interface FriendsProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onFollowToggle: (username: string) => void;
  onViewProfile: (username: string) => void;
}

interface UserCardProps {
  user: UserProfile;
  isFollowing: boolean;
  onFollowToggle: (username: string) => void;
  onViewProfile: (username: string) => void;
}

// Extract UserCard component
const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  isFollowing, 
  onFollowToggle, 
  onViewProfile 
}) => {
  const stats = user.sportProfiles[user.activeSport];

  return (
    <div className="bg-vx-panel p-5 rounded-2xl border border-gray-800 flex items-center justify-between hover:border-gray-700 transition-all group">
        <div className="flex items-center gap-4">
            <div onClick={() => onViewProfile(user.username)} className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-lg font-black text-white border border-gray-700 cursor-pointer hover:border-cyan-500 transition-colors">
                {user.username[0].toUpperCase()}
            </div>
            <div>
                <h4 onClick={() => onViewProfile(user.username)} className="text-white font-bold cursor-pointer hover:text-cyan-400 transition-colors">
                    {user.username}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                        <RankIcon rank={stats?.currentRank || Rank.Bronze} size={14} />
                        <span>{stats?.currentRank || Rank.Bronze}</span>
                    </div>
                    <span className="text-xs text-gray-600">• {user.followers} followers</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => onFollowToggle(user.username)}
                className={`p-2 rounded-lg transition-all ${
                    isFollowing 
                    ? 'bg-gray-800 text-gray-400 hover:text-red-400 hover:bg-red-900/20' 
                    : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-lg shadow-cyan-500/20'
                }`}
                title={isFollowing ? "Unfollow" : "Follow"}
            >
                {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
            </button>
            <button 
                onClick={() => onViewProfile(user.username)}
                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                title="View Profile"
            >
                <ExternalLink size={18} />
            </button>
        </div>
    </div>
  );
};

const Friends: React.FC<FriendsProps> = ({ currentUser, allUsers, onFollowToggle, onViewProfile }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic
  const filteredUsers = allUsers.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) && 
    user.username !== currentUser.username
  );

  const followingList = filteredUsers.filter(u => currentUser.friends.includes(u.username));
  const communityList = filteredUsers.filter(u => !currentUser.friends.includes(u.username));

  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto pb-24">
        <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Friends & Community</h1>
            <p className="text-gray-400 mb-6">Find other riders, build your crew, and track their progress.</p>

            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search riders by username..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-vx-panel border border-gray-800 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-cyan-500 transition-all shadow-lg"
                />
                <Search className="absolute left-4 top-4 text-gray-500" />
            </div>
        </div>

        <div className="space-y-8">
            {/* My Friends Section */}
            {followingList.length > 0 && (
                <div className="animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        My Crew <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">{followingList.length}</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {followingList.map(user => (
                            <UserCard 
                                key={user.username} 
                                user={user} 
                                isFollowing={true} 
                                onFollowToggle={onFollowToggle}
                                onViewProfile={onViewProfile}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Community Section */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Discover Riders</h3>
                {communityList.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800">
                        No other riders found matching "{searchQuery}".
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {communityList.map(user => (
                            <UserCard 
                                key={user.username} 
                                user={user} 
                                isFollowing={false}
                                onFollowToggle={onFollowToggle}
                                onViewProfile={onViewProfile}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Friends;
