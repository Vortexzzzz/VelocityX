
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_CHALLENGES } from '../constants';
import { UserProfile, Challenge, SubscriptionTier, Sport, Rank } from '../types';
import { Crown, MapPin, Zap, CheckCircle, Loader2, RefreshCw, Lock, Upload, AlertCircle, X, Camera, Calendar } from 'lucide-react';
import { generateLocalChallenges, verifyChallengeVideo } from '../services/geminiService';

interface ChallengesProps {
    currentUser: UserProfile;
    allUsers: UserProfile[];
    onCompleteChallenge: (challenge: Challenge) => void;
}

const Challenges: React.FC<ChallengesProps> = ({ currentUser, allUsers, onCompleteChallenge }) => {
    const [activeTab, setActiveTab] = useState<'local' | 'leaderboard'>('local');
    const [filterSport, setFilterSport] = useState<Sport>(currentUser.activeSport || Sport.Skateboard);

    // Local Challenge State
    const [localChallenges, setLocalChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [usingMock, setUsingMock] = useState(false);

    // Verification Modal State
    const [verifyingChallenge, setVerifyingChallenge] = useState<Challenge | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<{completed: boolean, reasoning: string} | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isPremium = currentUser.subscription !== SubscriptionTier.Free;

    // Daily Logic
    const today = new Date().toDateString();
    const lastChallengeDate = new Date(currentUser.dailyChallengeDate || 0).toDateString();
    const dailyCompleted = today === lastChallengeDate ? currentUser.dailyChallengesCompleted : 0;
    const dailyLimitReached = dailyCompleted >= 5;

    const fetchLocalChallenges = () => {
        if (!isPremium) return; // Prevent fetch if not premium

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            setLocalChallenges(MOCK_CHALLENGES.filter(c => c.sport === filterSport));
            setUsingMock(true);
            return;
        }

        setLoading(true);
        setLocationError(null);
        setUsingMock(false);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const challenges = await generateLocalChallenges(position.coords.latitude, position.coords.longitude, filterSport);
                    if (challenges && challenges.length > 0) {
                        setLocalChallenges(challenges as Challenge[]);
                    } else {
                        // Fallback if AI returns nothing useful
                        setLocalChallenges(MOCK_CHALLENGES.filter(c => c.sport === filterSport));
                        setUsingMock(true);
                        setLocationError("No spots found nearby. Showing global challenges.");
                    }
                } catch (err: any) {
                    setLocalChallenges(MOCK_CHALLENGES.filter(c => c.sport === filterSport));
                    setUsingMock(true);
                    
                    if (err.message === "QUOTA_EXCEEDED") {
                        setLocationError("Daily AI limit reached. Switched to Offline Mode.");
                    } else {
                        setLocationError("Failed to generate local challenges. Showing global challenges.");
                    }
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                console.error("Geolocation error:", err);
                setLocalChallenges(MOCK_CHALLENGES.filter(c => c.sport === filterSport));
                setUsingMock(true);
                setLocationError("Location access denied. Showing global challenges.");
                setLoading(false);
            }
        );
    };

    useEffect(() => {
        if (activeTab === 'local' && isPremium && localChallenges.length === 0) {
            fetchLocalChallenges();
        }
    }, [activeTab, isPremium, filterSport]);

    const handleVerification = async () => {
        if (!file || !verifyingChallenge) return;
        setAnalyzing(true);
        setError(null);
        
        try {
            const aiResult = await verifyChallengeVideo(file, verifyingChallenge.title, verifyingChallenge.description);
            setResult(aiResult);
            
            if (aiResult.completed) {
                setTimeout(() => {
                    onCompleteChallenge(verifyingChallenge);
                    // Close modal after short delay
                    setTimeout(() => {
                        setVerifyingChallenge(null);
                        setFile(null);
                        setResult(null);
                    }, 2000);
                }, 1500);
            }
        } catch (err: any) {
            if (err.message === "QUOTA_EXCEEDED") {
                setError("Daily AI limit reached. Please try again tomorrow.");
            } else {
                setError("Failed to verify video. Please try again.");
            }
        } finally {
            setAnalyzing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    // Filter users by currently selected sport for the leaderboard
    const leaderboard = [...allUsers]
        .filter(u => u.availableSports.includes(filterSport))
        .sort((a, b) => (b.sportProfiles[filterSport]?.trickPoints || 0) - (a.sportProfiles[filterSport]?.trickPoints || 0));

    // Available sports for the selector
    const availableSports = Object.values(Sport);

    const ChallengeVerificationModal = () => {
        if (!verifyingChallenge) return null;

        return (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-vx-panel w-full max-w-md rounded-3xl border border-gray-800 overflow-hidden shadow-2xl relative">
                    <button 
                        onClick={() => { setVerifyingChallenge(null); setFile(null); setResult(null); }}
                        className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="p-8">
                        <h2 className="text-2xl font-black text-white mb-2">{verifyingChallenge.title}</h2>
                        <p className="text-gray-400 mb-6">{verifyingChallenge.description}</p>

                        <div className="mb-6">
                             <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-700 rounded-2xl bg-gray-900/50 hover:bg-gray-800 hover:border-cyan-500 transition-all cursor-pointer group">
                                <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} disabled={analyzing || !!result} />
                                {file ? (
                                    <div className="text-center">
                                        <CheckCircle className="text-green-500 mx-auto mb-2" size={32} />
                                        <span className="text-green-400 font-bold text-sm">{file.name}</span>
                                        <p className="text-gray-500 text-xs mt-1">Click to change</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Upload className="text-gray-500 group-hover:text-cyan-400 mb-2 mx-auto transition-colors" size={32} />
                                        <span className="text-sm text-gray-400 font-medium group-hover:text-white">Upload Proof</span>
                                    </div>
                                )}
                            </label>
                        </div>

                        {error && (
                             <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-sm border border-red-500/20 mb-4 flex items-center gap-2">
                                 <AlertCircle size={16} /> {error}
                             </div>
                        )}

                        {result && (
                            <div className={`p-4 rounded-xl mb-4 border ${result.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {result.completed ? <CheckCircle className="text-green-500" /> : <X className="text-red-500" />}
                                    <span className={`font-bold ${result.completed ? 'text-green-400' : 'text-red-400'}`}>
                                        {result.completed ? 'Challenge Complete!' : 'Challenge Failed'}
                                    </span>
                                </div>
                                <p className="text-gray-300 text-xs italic">"{result.reasoning}"</p>
                            </div>
                        )}

                        <button 
                            onClick={handleVerification}
                            disabled={!file || analyzing || (result && result.completed)}
                            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all"
                        >
                            {analyzing ? <Loader2 className="animate-spin" /> : <Zap fill="currentColor" />}
                            {analyzing ? 'Verifying...' : result?.completed ? 'Points Awarded!' : 'Verify Challenge'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto pb-24">
            <ChallengeVerificationModal />

            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                        Challenges <Crown className="text-yellow-500" fill="currentColor" />
                    </h1>
                    <p className="text-gray-400">Compete at local spots and climb the global ranks.</p>
                </div>
                <div className="flex flex-col items-end gap-4">
                    {/* Sport Selector */}
                    <div className="flex bg-vx-panel rounded-xl p-1 border border-gray-800 overflow-x-auto max-w-[300px] md:max-w-none no-scrollbar">
                        {availableSports.map((sport) => (
                            <button
                                key={sport}
                                onClick={() => setFilterSport(sport)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                                    filterSport === sport ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {sport}
                            </button>
                        ))}
                    </div>

                    {/* Tab Selector */}
                    <div className="bg-vx-panel p-1 rounded-xl border border-gray-800 flex">
                        <button 
                            onClick={() => setActiveTab('local')}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'local' ? 'bg-cyan-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Local Spots
                        </button>
                        <button 
                            onClick={() => setActiveTab('leaderboard')}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'leaderboard' ? 'bg-yellow-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Leaderboard
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'local' ? (
                !isPremium ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-vx-panel rounded-2xl border border-gray-800 text-center p-8 animate-fade-in shadow-2xl">
                        <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-700 shadow-lg shadow-yellow-500/10">
                            <Lock size={40} className="text-yellow-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4">Premium Feature</h2>
                        <p className="text-gray-400 max-w-md mb-8 text-lg">
                            Upgrade to Premium to unlock <span className="text-cyan-400">Local Challenges</span>. Discover real spots nearby, complete daily tasks, and earn TrickPoints to climb the leaderboard.
                        </p>
                        <div className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-xl shadow-xl shadow-orange-500/20 hover:scale-105 transition-transform cursor-pointer">
                            Unlock for $2.50/mo
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="flex items-center justify-between bg-gradient-to-r from-cyan-900/20 to-purple-900/20 p-6 rounded-2xl border border-cyan-500/20">
                                <div className="flex items-center gap-4">
                                    <div className="bg-cyan-500/20 p-3 rounded-full text-cyan-400">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Your TrickPoints</h3>
                                        <p className="text-gray-400 text-sm">Total Points Earned ({filterSport})</p>
                                    </div>
                                </div>
                                <div className="text-4xl font-black text-white">{currentUser.sportProfiles[filterSport]?.trickPoints || 0}</div>
                            </div>

                             <div className="flex items-center justify-between bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${dailyLimitReached ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Daily Progress</h3>
                                        <p className="text-gray-400 text-sm">Resets every 24 hours</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-3xl font-black ${dailyLimitReached ? 'text-red-400' : 'text-green-400'}`}>
                                        {dailyCompleted}/5
                                    </div>
                                    {dailyLimitReached && <span className="text-[10px] text-red-400 uppercase font-bold">Limit Reached</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">
                                {usingMock ? `Global Challenges (${filterSport})` : `Nearby Challenges (${filterSport})`}
                            </h3>
                            <button 
                                onClick={fetchLocalChallenges} 
                                disabled={loading}
                                className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                Refresh Challenges
                            </button>
                        </div>

                        {locationError && (
                            <div className="bg-yellow-500/10 text-yellow-400 p-3 rounded-xl text-sm border border-yellow-500/20 mb-4">
                                {locationError}
                            </div>
                        )}

                        {dailyLimitReached ? (
                            <div className="p-12 text-center bg-gray-900/30 rounded-3xl border border-gray-800">
                                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={40} className="text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">All Done For Today!</h3>
                                <p className="text-gray-400 max-w-md mx-auto">
                                    You've completed your 5 daily challenges. Rest up and come back tomorrow for new spots and points.
                                </p>
                            </div>
                        ) : loading ? (
                             <div className="flex flex-col items-center justify-center py-20 bg-vx-panel rounded-2xl border border-gray-800 border-dashed">
                                <Loader2 size={48} className="text-cyan-500 animate-spin mb-4" />
                                <p className="text-gray-400 font-bold">Scanning local area for spots...</p>
                                <p className="text-xs text-gray-500 mt-2">Creating challenges for {filterSport}</p>
                             </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {localChallenges.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 bg-gray-900/30 rounded-2xl">
                                        No challenges found for {filterSport} in this area. Try refreshing or changing sports.
                                    </div>
                                ) : (
                                    localChallenges.map(challenge => (
                                        <div key={challenge.id} className="bg-vx-panel border border-gray-800 hover:border-yellow-500/50 p-6 rounded-2xl transition-all group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-12 bg-yellow-500/5 rounded-bl-full" />
                                            
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="text-xl font-bold text-white">{challenge.title}</h4>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                                                            challenge.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                                                            challenge.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                                                            challenge.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                                                            'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                                        }`}>
                                                            {challenge.difficulty}
                                                        </span>
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-gray-800 text-gray-400 border border-gray-700">
                                                            {challenge.sport}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                                        <MapPin size={14} /> {challenge.locationName}
                                                    </div>
                                                    <p className="text-gray-300">{challenge.description}</p>
                                                </div>

                                                <div className="flex flex-col items-end gap-2 min-w-[120px]">
                                                    <div className="text-yellow-400 font-black text-xl">+{challenge.points} TP</div>
                                                    <button 
                                                        onClick={() => setVerifyingChallenge(challenge)}
                                                        className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all w-full justify-center bg-gray-800 hover:bg-yellow-500 hover:text-black text-white"
                                                    >
                                                        <Camera size={18} /> Proof
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )
            ) : (
                <div className="animate-fade-in">
                    <div className="bg-vx-panel border border-gray-800 rounded-3xl overflow-hidden">
                        <div className="bg-gray-900/50 p-4 border-b border-gray-800 flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                            <div className="pl-4">{filterSport} Riders</div>
                            <div className="pr-4">Score</div>
                        </div>
                        <div className="divide-y divide-gray-800">
                            {leaderboard.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No riders found for {filterSport}. Be the first!
                                </div>
                            ) : (
                                leaderboard.map((user, index) => {
                                    const isTop3 = index < 3;
                                    const rankColor = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-gray-500';
                                    const isCurrentUser = user.username === currentUser.username;
                                    // Access stats for filterSport
                                    const sportStats = user.sportProfiles[filterSport];

                                    return (
                                        <div key={index} className={`p-4 flex items-center justify-between ${isCurrentUser ? 'bg-cyan-500/10' : 'hover:bg-gray-900/30'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 font-black text-lg text-center ${rankColor}`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className={`w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-white font-black border-2 ${isTop3 ? 'border-yellow-500' : 'border-gray-700'}`}>
                                                            {user.username[0].toUpperCase()}
                                                        </div>
                                                        {index === 0 && <Crown size={16} className="absolute -top-2 -right-1 text-yellow-500" fill="currentColor" />}
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-bold ${isCurrentUser ? 'text-cyan-400' : 'text-white'}`}>
                                                            {user.username} {isCurrentUser && '(You)'}
                                                        </h4>
                                                        <span className="text-xs text-gray-500">{sportStats?.currentRank || Rank.Bronze}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right pr-4">
                                                <div className="text-white font-black text-lg">{sportStats?.trickPoints?.toLocaleString() || 0}</div>
                                                <div className="text-gray-600 text-[10px] uppercase font-bold">Trick Points</div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Challenges;
