
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Sidebar from './components/Sidebar';
import RankingSystem from './components/RankingSystem';
import SkateMap from './components/SkateMap';
import Performance from './components/Performance';
import Profile from './components/Profile';
import Clips from './components/Clips';
import Friends from './components/Friends';
import LearnTricks from './components/LearnTricks';
import Challenges from './components/Challenges';
import About from './components/About';
import Settings, { THEMES, FONTS } from './components/Settings';
import RankIcon from './components/RankIcon';
import { Rank, Sport, SubscriptionTier, UserProfile, Activity, Clip, Challenge, ThemeOption, SportStats, ExperienceLevel } from './types';
import { SCOOTER_TRICKS, BIKE_TRICKS, SKATE_TRICKS } from './constants';
import { Trophy, Zap, TrendingUp, Star, Map, Settings as SettingsIcon, Target, ChevronRight } from 'lucide-react';

// Default stats for a new sport
const INITIAL_SPORT_STATS: SportStats = {
    currentRank: Rank.Bronze,
    rankProgress: 0,
    xp: 0,
    trickPoints: 0,
    tricksLogged: 0,
    completedTricks: []
};

const MOCK_USERS: UserProfile[] = [
  {
    username: "ThrashMaster",
    email: "tm@ex.com",
    isLoggedIn: false,
    activeSport: Sport.Skateboard,
    availableSports: [Sport.Skateboard, Sport.BMX],
    subscription: SubscriptionTier.Pro,
    experienceLevel: 'Pro', // Added Default
    sportProfiles: {
        [Sport.Skateboard]: { ...INITIAL_SPORT_STATS, currentRank: Rank.Diamond, xp: 5000 },
        [Sport.BMX]: { ...INITIAL_SPORT_STATS, currentRank: Rank.Silver, xp: 800 },
        [Sport.Scooter]: INITIAL_SPORT_STATS,
        [Sport.MountainBike]: INITIAL_SPORT_STATS
    },
    sessionsCount: 12,
    recentActivity: [],
    clips: [],
    followers: 150,
    following: 45,
    friends: [],
    bio: "Skate or die. Diamond rank street skater.",
    personalBests: { speed: 0, airTime: 0 },
    dailyChallengesCompleted: 0,
    dailyChallengeDate: new Date().toISOString(),
    theme: 'default',
    font: 'inter'
  },
];

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Friends/Community State
  const [allUsers, setAllUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [viewingProfile, setViewingProfile] = useState<string | null>(null); 

  // Persist login simulation
  useEffect(() => {
    const savedUser = localStorage.getItem('vx_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      
      // Migration logic for old data structure to new multi-sport structure
      if (!parsed.sportProfiles) {
          const oldStats: SportStats = {
              currentRank: parsed.currentRank || Rank.Bronze,
              rankProgress: parsed.rankProgress || 0,
              xp: parsed.xp || 0,
              trickPoints: parsed.trickPoints || 0,
              tricksLogged: parsed.tricksLogged || 0,
              completedTricks: parsed.completedTricks || []
          };
          
          parsed.activeSport = parsed.selectedSports?.[0] || Sport.Skateboard;
          parsed.availableSports = parsed.selectedSports || [Sport.Skateboard];
          parsed.sportProfiles = {
              [Sport.Skateboard]: INITIAL_SPORT_STATS,
              [Sport.Scooter]: INITIAL_SPORT_STATS,
              [Sport.BMX]: INITIAL_SPORT_STATS,
              [Sport.MountainBike]: INITIAL_SPORT_STATS,
          };
          // Assign old data to the active sport
          parsed.sportProfiles[parsed.activeSport] = oldStats;
      }

      // Default experience level if missing
      if (!parsed.experienceLevel) {
          parsed.experienceLevel = 'Novice';
      }

      // Reset clip URLs since blobs expire
      if (parsed.clips) parsed.clips = []; 
      if (!parsed.friends) parsed.friends = [];
      setUser(parsed);
    }
  }, []);

  // Sync user changes to allUsers list
  useEffect(() => {
      if (user) {
          setAllUsers(prev => {
              const exists = prev.find(u => u.username === user.username);
              if (exists) {
                  return prev.map(u => u.username === user.username ? user : u);
              }
              return [...prev, user];
          });
      }
  }, [user]);

  const handleLogin = (username: string) => {
    const newUser: UserProfile = {
      username,
      email: `${username}@example.com`,
      isLoggedIn: true,
      activeSport: Sport.Skateboard, // Default temp
      availableSports: [], // Will trigger onboarding
      subscription: SubscriptionTier.Free,
      experienceLevel: 'Beginner', // Default temp until onboarding
      sportProfiles: {
          [Sport.Skateboard]: INITIAL_SPORT_STATS,
          [Sport.Scooter]: INITIAL_SPORT_STATS,
          [Sport.BMX]: INITIAL_SPORT_STATS,
          [Sport.MountainBike]: INITIAL_SPORT_STATS,
      },
      sessionsCount: 0,
      recentActivity: [],
      clips: [],
      followers: 0,
      following: 0,
      friends: [],
      bio: "",
      personalBests: { speed: 0, airTime: 0 },
      dailyChallengesCompleted: 0,
      dailyChallengeDate: new Date().toISOString(),
      theme: 'default',
      font: 'inter'
    };

    // Check existing
    const existing = localStorage.getItem('vx_user');
    if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.username === username) {
             // Ensure structure compatibility (same as useEffect migration)
            if (!parsed.sportProfiles) {
                const oldStats: SportStats = {
                    currentRank: parsed.currentRank || Rank.Bronze,
                    rankProgress: parsed.rankProgress || 0,
                    xp: parsed.xp || 0,
                    trickPoints: parsed.trickPoints || 0,
                    tricksLogged: parsed.tricksLogged || 0,
                    completedTricks: parsed.completedTricks || []
                };
                parsed.activeSport = parsed.selectedSports?.[0] || Sport.Skateboard;
                parsed.availableSports = parsed.selectedSports || [Sport.Skateboard];
                parsed.sportProfiles = {
                    [Sport.Skateboard]: INITIAL_SPORT_STATS,
                    [Sport.Scooter]: INITIAL_SPORT_STATS,
                    [Sport.BMX]: INITIAL_SPORT_STATS,
                    [Sport.MountainBike]: INITIAL_SPORT_STATS,
                };
                parsed.sportProfiles[parsed.activeSport] = oldStats;
            }
            if (!parsed.experienceLevel) parsed.experienceLevel = 'Novice';
            setUser(parsed);
            return;
        }
    }
    setUser(newUser);
    localStorage.setItem('vx_user', JSON.stringify(newUser));
  };

  const handleOnboardingComplete = (sports: Sport[], sub: SubscriptionTier, experience: ExperienceLevel) => {
    if (!user) return;
    const updatedUser = { 
        ...user, 
        availableSports: sports, 
        activeSport: sports[0], 
        subscription: sub,
        experienceLevel: experience
    };
    setUser(updatedUser);
    localStorage.setItem('vx_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('vx_user');
  };
  
  const handleFactoryReset = () => {
      localStorage.clear();
      window.location.reload();
  };

  const updateCurrentSportStats = (updates: Partial<SportStats>) => {
      if (!user) return null;
      const currentStats = user.sportProfiles[user.activeSport];
      const newStats = { ...currentStats, ...updates };
      
      const updatedUser = {
          ...user,
          sportProfiles: {
              ...user.sportProfiles,
              [user.activeSport]: newStats
          }
      };
      return updatedUser;
  };

  const handleRankUpdate = (newRank: Rank) => {
      if(!user) return;
      const newActivity: Activity = {
          id: Date.now().toString(),
          type: 'rankup',
          title: 'Rank Up!',
          subtitle: `Promoted to ${newRank} in ${user.activeSport}`,
          xp: 500,
          timestamp: new Date().toISOString()
      };

      const updatedUser = updateCurrentSportStats({
          currentRank: newRank,
          rankProgress: 0
      });

      if (updatedUser) {
          const finalUser = {
              ...updatedUser,
              recentActivity: [newActivity, ...user.recentActivity].slice(0, 10)
          };
          setUser(finalUser);
          localStorage.setItem('vx_user', JSON.stringify(finalUser));
      }
  };

  const handleTrickComplete = (trickName: string, xpEarned: number, method: string) => {
      if (!user) return;
      const currentStats = user.sportProfiles[user.activeSport];

      // 1. Update completed tricks
      const newCompletedTricks = currentStats.completedTricks.includes(trickName) 
        ? currentStats.completedTricks 
        : [...currentStats.completedTricks, trickName];

      // 2. Calculate Rank Progress
      let currentDb;
      const sport = user.activeSport;
      if (sport === Sport.Scooter) currentDb = SCOOTER_TRICKS;
      else if (sport === Sport.Skateboard) currentDb = SKATE_TRICKS;
      else currentDb = BIKE_TRICKS;

      const rankTricks = currentDb.filter(t => t.rank === currentStats.currentRank);
      const completedCount = rankTricks.filter(t => newCompletedTricks.includes(t.name)).length;
      const progress = rankTricks.length > 0 ? (completedCount / rankTricks.length) * 100 : 0;

      // 3. Log Activity
      const newActivity: Activity = {
        id: Date.now().toString(),
        type: 'trick',
        title: trickName,
        subtitle: `${user.activeSport} • ${currentStats.currentRank} • ${method}`,
        xp: xpEarned,
        timestamp: new Date().toISOString()
      };

      const updatedUser = updateCurrentSportStats({
          xp: currentStats.xp + xpEarned,
          tricksLogged: currentStats.tricksLogged + 1,
          completedTricks: newCompletedTricks,
          rankProgress: progress
      });

      if (updatedUser) {
        const finalUser = {
            ...updatedUser,
            recentActivity: [newActivity, ...user.recentActivity].slice(0, 10)
        };
        setUser(finalUser);
        localStorage.setItem('vx_user', JSON.stringify(finalUser));
      }
  };

  const handleSaveClip = (file: File, trickName: string, rank: Rank) => {
      if (!user) return;
      const newClip: Clip = {
          id: Date.now().toString(),
          videoUrl: URL.createObjectURL(file), 
          trickName,
          date: new Date().toISOString(),
          rank,
          likes: 0,
          views: 0,
          isPosted: false,
          sport: user.activeSport
      };

      const updatedUser = {
          ...user,
          clips: [newClip, ...user.clips]
      };
      setUser(updatedUser);
  };

  const handlePostClip = (clipId: string) => {
      if (!user) return;
      const updatedClips = user.clips.map(c => {
          if (c.id === clipId) return { ...c, isPosted: true, likes: Math.floor(Math.random() * 50) };
          return c;
      });
      
      const updatedUser = { ...user, clips: updatedClips };
      setUser(updatedUser);
  };

  const handleSessionComplete = (session: { duration: string, maxSpeed: string, maxHeight: string }) => {
      if (!user) return;
      const currentStats = user.sportProfiles[user.activeSport];
      
      const activity: Activity = {
        id: Date.now().toString(),
        type: 'session',
        title: 'Freestyle Session',
        subtitle: `${session.duration} • Max Speed: ${session.maxSpeed}km/h`,
        xp: 50,
        timestamp: new Date().toISOString()
      };
      
      const updatedUser = updateCurrentSportStats({
          xp: currentStats.xp + 50
      });

      if (updatedUser) {
          const finalUser = {
              ...updatedUser,
              sessionsCount: user.sessionsCount + 1,
              recentActivity: [activity, ...user.recentActivity].slice(0, 10) 
          };
          setUser(finalUser);
          localStorage.setItem('vx_user', JSON.stringify(finalUser));
      }
  };

  const handleChallengeComplete = (challenge: Challenge) => {
      if (!user) return;
      const currentStats = user.sportProfiles[user.activeSport];

      const today = new Date().toDateString();
      const lastChallengeDate = new Date(user.dailyChallengeDate || 0).toDateString();
      
      let currentDailyCount = user.dailyChallengesCompleted;
      if (today !== lastChallengeDate) {
          currentDailyCount = 0;
      }

      if (currentDailyCount >= 5) {
          alert("You have reached your daily limit of 5 challenges!");
          return;
      }

      const activity: Activity = {
          id: Date.now().toString(),
          type: 'challenge',
          title: 'Challenge Crushed!',
          subtitle: `${challenge.title} @ ${challenge.locationName}`,
          xp: 100,
          timestamp: new Date().toISOString()
      };

      const updatedUser = updateCurrentSportStats({
          trickPoints: currentStats.trickPoints + challenge.points,
          xp: currentStats.xp + 100,
      });

      if (updatedUser) {
          const finalUser = {
              ...updatedUser,
              dailyChallengesCompleted: currentDailyCount + 1,
              dailyChallengeDate: new Date().toISOString(),
              recentActivity: [activity, ...user.recentActivity].slice(0, 10)
          };
          setUser(finalUser);
          localStorage.setItem('vx_user', JSON.stringify(finalUser));
      }
  };

  const handleFollowToggle = (targetUsername: string) => {
      if (!user) return;
      const isFollowing = user.friends.includes(targetUsername);
      let newFriendsList = [...user.friends];
      let followingCountChange = 0;

      if (isFollowing) {
          newFriendsList = newFriendsList.filter(f => f !== targetUsername);
          followingCountChange = -1;
      } else {
          newFriendsList.push(targetUsername);
          followingCountChange = 1;
      }

      const updatedUser = {
          ...user,
          friends: newFriendsList,
          following: user.following + followingCountChange
      };
      setUser(updatedUser);
      localStorage.setItem('vx_user', JSON.stringify(updatedUser));
      
      // Mock update
      setAllUsers(prev => prev.map(u => 
        u.username === targetUsername ? { ...u, followers: u.followers + followingCountChange } : u
      ));
  };

  const handleProfileUpdate = (updates: Partial<UserProfile>) => {
      if (!user) return;
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('vx_user', JSON.stringify(updatedUser));
  };

  const handleResetProgress = () => {
    if (!user) return;
    // Reset ONLY current sport
    const updatedUser = updateCurrentSportStats({
        currentRank: Rank.Bronze,
        rankProgress: 0,
        completedTricks: []
    });
    
    if (updatedUser) {
        const newActivity: Activity = {
            id: Date.now().toString(),
            type: 'rankup', 
            title: 'Progress Reset',
            subtitle: `${user.activeSport} stats reset by user`,
            xp: 0,
            timestamp: new Date().toISOString()
        };
        const finalUser = {
            ...updatedUser,
            recentActivity: [newActivity, ...user.recentActivity].slice(0, 10)
        };
        setUser(finalUser);
        localStorage.setItem('vx_user', JSON.stringify(finalUser));
    }
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  if (user.availableSports.length === 0) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const currentSportStats = user.sportProfiles[user.activeSport];

  // Theme Application
  const getThemeStyle = () => {
      const theme = user.theme || 'default';
      const fontKey = user.font || 'inter';
      const fontStyle = FONTS[fontKey]?.family || '"Inter", sans-serif';
      
      const colorMap: Record<ThemeOption, React.CSSProperties> = {
          default: {
              '--primary-400': '#22d3ee', '--primary-500': '#06b6d4', '--primary-600': '#0891b2',
              '--secondary-400': '#a78bfa', '--secondary-500': '#8b5cf6', '--secondary-600': '#7c3aed',
          } as any,
          magma: {
              '--primary-400': '#fb923c', '--primary-500': '#f97316', '--primary-600': '#ea580c',
              '--secondary-400': '#f87171', '--secondary-500': '#ef4444', '--secondary-600': '#dc2626',
          } as any,
          venom: {
              '--primary-400': '#a3e635', '--primary-500': '#84cc16', '--primary-600': '#65a30d',
              '--secondary-400': '#4ade80', '--secondary-500': '#22c55e', '--secondary-600': '#16a34a',
          } as any,
          royal: {
              '--primary-400': '#facc15', '--primary-500': '#eab308', '--primary-600': '#ca8a04',
              '--secondary-400': '#60a5fa', '--secondary-500': '#3b82f6', '--secondary-600': '#2563eb',
          } as any
      };

      const baseStyles = {
          ...colorMap[theme],
          '--app-font': fontStyle 
      };
      
      if (user.customBackgroundUrl) {
          return {
              ...baseStyles,
              backgroundImage: `linear-gradient(rgba(11, 12, 21, 0.85), rgba(11, 12, 21, 0.95)), url(${user.customBackgroundUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
          };
      }
      return baseStyles;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        // Calculate Progress Percentage for Display
        let currentDb;
        if (user.activeSport === Sport.Scooter) currentDb = SCOOTER_TRICKS;
        else if (user.activeSport === Sport.Skateboard) currentDb = SKATE_TRICKS;
        else currentDb = BIKE_TRICKS;
        
        const rankTricks = currentDb.filter(t => t.rank === currentSportStats.currentRank);
        const completedCount = rankTricks.filter(t => currentSportStats.completedTricks.includes(t.name)).length;
        const progressPercent = rankTricks.length > 0 ? Math.round((completedCount / rankTricks.length) * 100) : 0;

        // Daily Logic
        const today = new Date().toDateString();
        const lastDate = new Date(user.dailyChallengeDate || 0).toDateString();
        const dailyCompleted = today === lastDate ? user.dailyChallengesCompleted : 0;

        return (
          <div className="p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto h-full pb-24">
            {/* Hero Section with Banner */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-800 h-72 group">
                 {user.bannerUrl ? (
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${user.bannerUrl})` }} />
                 ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-purple-900 to-cyan-900">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    </div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-vx-dark via-vx-dark/50 to-transparent" />
                 
                 <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="flex items-end gap-6">
                        <div className="w-24 h-24 rounded-full border-4 border-vx-dark bg-gray-800 flex items-center justify-center text-4xl font-black text-white shadow-2xl overflow-hidden">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                                user.username[0].toUpperCase()
                            )}
                        </div>
                        <div className="mb-2">
                             <h1 className="text-4xl font-black text-white mb-1 drop-shadow-lg">
                                {user.username}
                            </h1>
                            <p className="text-gray-300 text-lg flex items-center gap-2">
                                Ready to shred on your <span className="text-cyan-400 font-bold">{user.activeSport}</span>?
                            </p>
                        </div>
                    </div>

                    {/* Rank Progress Widget */}
                    <div className="bg-vx-panel/90 backdrop-blur-md border border-gray-700 p-5 rounded-2xl min-w-[280px] shadow-xl">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Current Rank</p>
                                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                                    {currentSportStats.currentRank}
                                    <RankIcon rank={currentSportStats.currentRank} size={24} />
                                </h3>
                            </div>
                            <span className="text-cyan-400 font-black text-xl">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-2">
                            <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <p className="text-gray-500 text-xs text-right">
                            {completedCount} / {rankTricks.length} Tricks to Next Rank
                        </p>
                    </div>
                 </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-vx-panel border border-gray-800 p-5 rounded-2xl flex flex-col justify-between hover:border-cyan-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                            <Star size={20} />
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase">Total</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white">{currentSportStats.tricksLogged}</h3>
                        <p className="text-gray-400 text-xs font-bold">Tricks Logged</p>
                    </div>
               </div>
               <div className="bg-vx-panel border border-gray-800 p-5 rounded-2xl flex flex-col justify-between hover:border-purple-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
                            <Zap size={20} />
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase">Activity</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white">{user.sessionsCount}</h3>
                        <p className="text-gray-400 text-xs font-bold">Sessions</p>
                    </div>
               </div>
               <div className="bg-vx-panel border border-gray-800 p-5 rounded-2xl flex flex-col justify-between hover:border-green-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-500/10 text-green-400 rounded-xl group-hover:scale-110 transition-transform">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase">Growth</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white">{currentSportStats.xp}</h3>
                        <p className="text-gray-400 text-xs font-bold">Total XP</p>
                    </div>
               </div>
               <div className="bg-vx-panel border border-gray-800 p-5 rounded-2xl flex flex-col justify-between hover:border-yellow-500/50 transition-all group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl group-hover:scale-110 transition-transform">
                            <Target size={20} />
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase">Daily</span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black text-white">{dailyCompleted}/5</h3>
                        <p className="text-gray-400 text-xs font-bold">Daily Challenges</p>
                    </div>
                    {/* Progress Ring Background */}
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 border-8 border-yellow-500/10 rounded-full" />
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Actions */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Actions */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Zap size={20} className="text-cyan-400" /> Quick Actions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button onClick={() => setActiveTab('rank')} className="group bg-vx-panel border border-gray-800 hover:border-cyan-500/50 p-6 rounded-2xl text-left transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 bg-cyan-500/5 rounded-bl-full transition-transform group-hover:scale-110" />
                                <Trophy className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
                                <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">Log Trick</h4>
                                <p className="text-gray-500 text-xs mt-1">Verify progress with AI</p>
                            </button>

                            <button onClick={() => setActiveTab('challenges')} className="group bg-vx-panel border border-gray-800 hover:border-purple-500/50 p-6 rounded-2xl text-left transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 bg-purple-500/5 rounded-bl-full transition-transform group-hover:scale-110" />
                                <Target className="text-purple-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
                                <h4 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">Local Spots</h4>
                                <p className="text-gray-500 text-xs mt-1">Find challenges nearby</p>
                            </button>

                            <button onClick={() => setActiveTab('perf')} className="group bg-vx-panel border border-gray-800 hover:border-pink-500/50 p-6 rounded-2xl text-left transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 bg-pink-500/5 rounded-bl-full transition-transform group-hover:scale-110" />
                                <Zap className="text-pink-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
                                <h4 className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors">Session</h4>
                                <p className="text-gray-500 text-xs mt-1">Track speed & air time</p>
                            </button>
                        </div>
                    </div>

                    {/* Tip Card */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 flex justify-between items-center">
                         <div>
                             <h4 className="text-white font-bold mb-1">Switching it up?</h4>
                             <p className="text-gray-400 text-sm">Change your active sport in Settings to track different stats.</p>
                         </div>
                         <button onClick={() => setIsSettingsOpen(true)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                             Open Settings
                         </button>
                    </div>
                </div>

                {/* Right Column: Activity Feed */}
                <div className="lg:col-span-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                        <button onClick={() => setActiveTab('profile')} className="text-cyan-400 text-xs font-bold hover:underline flex items-center gap-1">
                            View All <ChevronRight size={12} />
                        </button>
                    </div>
                    
                    <div className="bg-vx-panel border border-gray-800 rounded-2xl overflow-hidden">
                        {user.recentActivity.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 italic">No recent activity.</div>
                        ) : (
                            <div className="divide-y divide-gray-800">
                                {user.recentActivity.slice(0, 5).map((activity) => (
                                    <div key={activity.id} className="p-4 hover:bg-gray-900/50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <h5 className="text-white font-bold text-sm line-clamp-1">{activity.title}</h5>
                                            <span className="text-cyan-400 font-bold text-xs">+{activity.xp} XP</span>
                                        </div>
                                        <p className="text-gray-500 text-xs mb-2 line-clamp-1">{activity.subtitle}</p>
                                        <p className="text-gray-600 text-[10px] uppercase font-bold">
                                            {new Date(activity.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </div>
        );
      case 'rank':
        return <RankingSystem 
          currentRank={currentSportStats.currentRank} 
          sport={user.activeSport} 
          completedTricks={currentSportStats.completedTricks}
          onRankUpdate={handleRankUpdate} 
          onTrickComplete={handleTrickComplete}
          onSaveClip={handleSaveClip}
          onResetProgress={handleResetProgress}
          allUsers={allUsers}
        />;
      case 'challenges':
          return <Challenges 
            currentUser={user} 
            allUsers={allUsers} 
            onCompleteChallenge={handleChallengeComplete} 
          />;
      case 'clips':
          return <Clips clips={user.clips} onPostToProfile={handlePostClip} />;
      case 'learn':
          return <LearnTricks sport={user.activeSport} />;
      case 'map':
        return <SkateMap />;
      case 'perf':
        return <Performance onSessionComplete={handleSessionComplete} />;
      case 'profile':
        return <Profile 
            user={user} 
            onProfileUpdate={handleProfileUpdate} 
        />;
      case 'friends':
          if (viewingProfile) {
              const friendUser = allUsers.find(u => u.username === viewingProfile);
              if (!friendUser) return <div>User not found</div>;
              return (
                <Profile 
                    user={friendUser} 
                    isOwnProfile={false} 
                    isFollowing={user.friends.includes(friendUser.username)}
                    onFollowToggle={() => handleFollowToggle(friendUser.username)}
                    onBack={() => setViewingProfile(null)}
                />
              );
          }
          return (
            <Friends 
                currentUser={user} 
                allUsers={allUsers} 
                onFollowToggle={handleFollowToggle} 
                onViewProfile={setViewingProfile} 
            />
          );
      case 'about':
        return <About />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-vx-dark flex font-sans text-slate-200" style={getThemeStyle() as any}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setViewingProfile(null); }} 
        subscription={user.subscription} 
        onLogout={handleLogout}
      />
      <main className="flex-1 ml-20 h-screen overflow-hidden relative">
         {!user.customBackgroundUrl && (
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-600/5 blur-[120px] rounded-full opacity-50" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-cyan-600/5 blur-[120px] rounded-full opacity-50" />
            </div>
         )}
         {renderContent()}
      </main>

      <button 
        onClick={() => setIsSettingsOpen(true)}
        className="fixed bottom-6 right-6 bg-vx-panel border border-gray-700 p-3 rounded-full text-gray-400 hover:text-cyan-400 hover:border-cyan-500 transition-all shadow-xl z-40 group"
      >
        <SettingsIcon size={24} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>

      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        user={user} 
        onUpdate={handleProfileUpdate}
        onFactoryReset={handleFactoryReset}
      />

    </div>
  );
};

export default App;
