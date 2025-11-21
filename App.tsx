
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Sidebar from './components/Sidebar';
import RankingSystem from './components/RankingSystem';
import SkateMap from './components/SkateMap';
import Performance from './components/Performance';
import Profile from './components/Profile';
import Clips from './components/Clips';
import { Rank, Sport, SubscriptionTier, UserProfile, Activity, Clip } from './types';
import { SCOOTER_TRICKS, BIKE_TRICKS, SKATE_TRICKS } from './constants';
import { Trophy, Zap, TrendingUp, Star, Map, Clock } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');

  // Persist login simulation
  useEffect(() => {
    const savedUser = localStorage.getItem('vx_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      // Reset clip URLs since blobs expire (mock app limitation handling)
      if (parsed.clips) {
          parsed.clips = []; 
      }
      setUser(parsed);
    }
  }, []);

  const handleLogin = (username: string) => {
    const newUser: UserProfile = {
      username,
      email: `${username}@example.com`,
      isLoggedIn: true,
      selectedSports: [], // Will trigger onboarding if empty
      subscription: SubscriptionTier.Free,
      currentRank: Rank.Bronze,
      rankProgress: 0,
      xp: 30,
      sessionsCount: 3, // Mock initial data
      tricksLogged: 2,  // Mock initial data
      completedTricks: [],
      recentActivity: [],
      clips: [],
      followers: 128,
      following: 45,
      bio: "",
      personalBests: { speed: 0, airTime: 0 }
    };
    // Check if user exists in local storage to restore sports/sub
    const existing = localStorage.getItem('vx_user');
    if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.username === username) {
            // Ensure structure compatibility
            if (!parsed.completedTricks) parsed.completedTricks = [];
            if (!parsed.clips) parsed.clips = [];
            setUser(parsed);
            return;
        }
    }
    setUser(newUser);
    localStorage.setItem('vx_user', JSON.stringify(newUser));
  };

  const handleOnboardingComplete = (sports: Sport[], sub: SubscriptionTier) => {
    if (!user) return;
    const updatedUser = { ...user, selectedSports: sports, subscription: sub };
    setUser(updatedUser);
    localStorage.setItem('vx_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('vx_user');
  };

  const handleRankUpdate = (newRank: Rank) => {
      if(!user) return;
      const newActivity: Activity = {
          id: Date.now().toString(),
          type: 'rankup',
          title: 'Rank Up!',
          subtitle: `Promoted to ${newRank}`,
          xp: 500,
          timestamp: new Date().toISOString()
      };

      const updatedUser = { 
          ...user, 
          currentRank: newRank,
          rankProgress: 0, // Reset progress bar for new rank
          recentActivity: [
              newActivity,
              ...user.recentActivity
          ].slice(0, 10)
      };
      setUser(updatedUser);
      localStorage.setItem('vx_user', JSON.stringify(updatedUser));
  };

  const handleTrickComplete = (trickName: string, xpEarned: number, method: string) => {
      if (!user) return;

      // 1. Update completed tricks
      const newCompletedTricks = user.completedTricks.includes(trickName) 
        ? user.completedTricks 
        : [...user.completedTricks, trickName];

      // 2. Calculate Rank Progress
      let currentDb;
      const sport = user.selectedSports[0];
      if (sport === Sport.Scooter) currentDb = SCOOTER_TRICKS;
      else if (sport === Sport.Skateboard) currentDb = SKATE_TRICKS;
      else currentDb = BIKE_TRICKS;

      const rankTricks = currentDb.filter(t => t.rank === user.currentRank);
      const completedCount = rankTricks.filter(t => newCompletedTricks.includes(t.name)).length;
      const progress = rankTricks.length > 0 ? (completedCount / rankTricks.length) * 100 : 0;

      // 3. Log Activity
      const newActivity: Activity = {
        id: Date.now().toString(),
        type: 'trick',
        title: trickName,
        subtitle: `${user.selectedSports[0]} • ${user.currentRank} • ${method}`,
        xp: xpEarned,
        timestamp: new Date().toISOString()
      };

      const updatedUser = { 
          ...user, 
          xp: user.xp + xpEarned,
          tricksLogged: user.tricksLogged + 1,
          completedTricks: newCompletedTricks,
          rankProgress: progress,
          recentActivity: [newActivity, ...user.recentActivity].slice(0, 10)
      };

      setUser(updatedUser);
      localStorage.setItem('vx_user', JSON.stringify(updatedUser));
  };

  const handleSaveClip = (file: File, trickName: string, rank: Rank) => {
      if (!user) return;
      const newClip: Clip = {
          id: Date.now().toString(),
          videoUrl: URL.createObjectURL(file), // Temporary blob URL
          trickName,
          date: new Date().toISOString(),
          rank,
          likes: 0,
          views: 0,
          isPosted: false
      };

      const updatedUser = {
          ...user,
          clips: [newClip, ...user.clips]
      };
      setUser(updatedUser);
      // Note: We can't store blob URLs in localStorage, so typically we wouldn't persist this deeply in a pure frontend demo 
      // without IndexedDB, but we update state for the session.
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
      const activity: Activity = {
        id: Date.now().toString(),
        type: 'session',
        title: 'Freestyle Session',
        subtitle: `${session.duration} • Max Speed: ${session.maxSpeed}km/h`,
        xp: 50,
        timestamp: new Date().toISOString()
      };
      
      const updatedUser = { 
        ...user, 
        xp: user.xp + 50,
        sessionsCount: user.sessionsCount + 1,
        recentActivity: [activity, ...user.recentActivity].slice(0, 10) 
      };
      setUser(updatedUser);
      localStorage.setItem('vx_user', JSON.stringify(updatedUser));
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  if (user.selectedSports.length === 0) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto h-full pb-24">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-black text-white mb-2">
                Welcome back, <span className="text-cyan-400">{user.username}!</span>
              </h1>
              <p className="text-gray-400 text-lg">Ready to push your limits today?</p>
            </div>

            {/* Stats Grid - Updated to match user request */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Current Rank */}
              <div className="bg-vx-panel border border-gray-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg hover:border-gray-700 transition-colors h-40 relative overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500 mb-4">
                  <Trophy size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Current Rank</p>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                     {/* Rank Icon Placeholder */}
                    {user.currentRank === Rank.Bronze && <span className="text-2xl">🥉</span>}
                    {user.currentRank === Rank.Silver && <span className="text-2xl">🥈</span>}
                    {user.currentRank === Rank.Gold && <span className="text-2xl">🥇</span>}
                    {![Rank.Bronze, Rank.Silver, Rank.Gold].includes(user.currentRank) && <span className="text-2xl">👑</span>}
                    {user.currentRank}
                  </h3>
                </div>
              </div>
              
              {/* Tricks Logged */}
              <div className="bg-vx-panel border border-gray-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg hover:border-gray-700 transition-colors h-40">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                  <Star size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Tricks Logged</p>
                  <h3 className="text-3xl font-bold text-white">{user.tricksLogged}</h3>
                </div>
              </div>

              {/* Sessions */}
              <div className="bg-vx-panel border border-gray-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg hover:border-gray-700 transition-colors h-40">
                <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-500 mb-4">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Sessions</p>
                  <h3 className="text-3xl font-bold text-white">{user.sessionsCount}</h3>
                </div>
              </div>

              {/* Total XP */}
              <div className="bg-vx-panel border border-gray-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg hover:border-gray-700 transition-colors h-40">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500 mb-4">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Total XP</p>
                  <h3 className="text-3xl font-bold text-white">{user.xp}</h3>
                </div>
              </div>
            </div>

            {/* Your Rides */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Your Rides</h3>
              <div className="flex gap-3 flex-wrap">
                {user.selectedSports.map(sport => (
                  <button 
                    key={sport} 
                    className="bg-vx-panel border border-gray-700 hover:border-cyan-500 text-cyan-400 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider shadow-md hover:bg-gray-800 transition-all cursor-default"
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
               <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button onClick={() => setActiveTab('rank')} className="bg-vx-panel hover:bg-gray-800 border border-gray-800 p-8 rounded-3xl text-left transition-all group relative overflow-hidden h-48 flex flex-col justify-end">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/50 z-0"></div>
                      <div className="absolute top-6 left-6 w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform z-10">
                         <Trophy size={24} />
                      </div>
                      <div className="relative z-10">
                        <h4 className="text-xl font-bold text-white mb-1">Log a Trick</h4>
                        <p className="text-gray-400 text-sm">Record your latest achievements and rank up</p>
                      </div>
                  </button>
                  
                  <button onClick={() => setActiveTab('map')} className="bg-vx-panel hover:bg-gray-800 border border-gray-800 p-8 rounded-3xl text-left transition-all group relative overflow-hidden h-48 flex flex-col justify-end">
                       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/50 z-0"></div>
                      <div className="absolute top-6 left-6 w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform z-10">
                         <Map size={24} />
                      </div>
                      <div className="relative z-10">
                        <h4 className="text-xl font-bold text-white mb-1">Find Skateparks</h4>
                        <p className="text-gray-400 text-sm">Discover parks near you and worldwide</p>
                      </div>
                  </button>

                  <button onClick={() => setActiveTab('perf')} className="bg-vx-panel hover:bg-gray-800 border border-gray-800 p-8 rounded-3xl text-left transition-all group relative overflow-hidden h-48 flex flex-col justify-end">
                       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/50 z-0"></div>
                      <div className="absolute top-6 left-6 w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform z-10">
                         <Zap size={24} />
                      </div>
                      <div className="relative z-10">
                        <h4 className="text-xl font-bold text-white mb-1">Track Session</h4>
                        <p className="text-gray-400 text-sm">Monitor your speed and airtime performance</p>
                      </div>
                  </button>
               </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
              <div className="bg-vx-panel border border-gray-800 rounded-3xl overflow-hidden">
                {user.recentActivity.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No recent activity yet. Go ride!</div>
                ) : (
                  <div className="divide-y divide-gray-800">
                     {user.recentActivity.map((activity) => (
                       <div key={activity.id} className="p-5 flex items-center justify-between hover:bg-gray-900/50 transition-colors group">
                         <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-gray-800 border border-gray-700 group-hover:scale-105 transition-transform`}>
                              {activity.type === 'trick' && <Trophy size={20} className="text-orange-500" />}
                              {activity.type === 'session' && <Zap size={20} className="text-pink-500" />}
                              {activity.type === 'rankup' && <Star size={20} className="text-yellow-400" />}
                           </div>
                           <div>
                             <h5 className="text-white font-bold text-lg">{activity.title}</h5>
                             <div className="flex items-center gap-2 mt-1">
                                <p className="text-gray-400 text-xs uppercase font-bold tracking-wide">{activity.subtitle}</p>
                             </div>
                           </div>
                         </div>
                         <div className="text-right">
                            <div className="text-cyan-400 font-black text-sm mb-1">+{activity.xp} XP</div>
                            <p className="text-gray-600 text-[10px] font-mono">{new Date(activity.timestamp).toLocaleDateString()}</p>
                         </div>
                       </div>
                     ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'rank':
        return <RankingSystem 
          currentRank={user.currentRank} 
          sport={user.selectedSports[0]} 
          completedTricks={user.completedTricks}
          onRankUpdate={handleRankUpdate} 
          onTrickComplete={handleTrickComplete}
          onSaveClip={handleSaveClip}
        />;
      case 'clips':
          return <Clips clips={user.clips} onPostToProfile={handlePostClip} />;
      case 'map':
        return <SkateMap />;
      case 'perf':
        return <Performance onSessionComplete={handleSessionComplete} />;
      case 'profile':
        return <Profile user={user} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-vx-dark flex font-sans text-slate-200">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        subscription={user.subscription} 
        onLogout={handleLogout}
      />
      <main className="flex-1 ml-20 h-screen overflow-hidden relative">
         {/* Ambient Background Effects */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-600/5 blur-[120px] rounded-full opacity-50" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-cyan-600/5 blur-[120px] rounded-full opacity-50" />
         </div>
         
         {renderContent()}
      </main>
    </div>
  );
};

export default App;
