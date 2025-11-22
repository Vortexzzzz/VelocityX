
import React, { useState, useEffect } from 'react';
import { SCOOTER_TRICKS, BIKE_TRICKS, SKATE_TRICKS, RANK_ORDER } from '../constants';
import { Rank, Sport, UserProfile } from '../types';
import { Upload, CheckCircle, AlertCircle, Loader2, Swords, Check, PlayCircle, Lock, RotateCcw, AlertTriangle, Activity, ListChecks, X, Youtube, ExternalLink, Globe, User, Crown } from 'lucide-react';
import { analyzeTrickVideo, searchTrickTutorials } from '../services/geminiService';
import RankIcon from './RankIcon';

interface RankingSystemProps {
  currentRank: Rank;
  sport: Sport;
  completedTricks: string[];
  onRankUpdate: (newRank: Rank) => void;
  onTrickComplete: (trickName: string, xp: number, method: string) => void;
  onSaveClip: (file: File, trickName: string, rank: Rank) => void;
  onResetProgress: () => void;
  allUsers: UserProfile[];
}

const RankingSystem: React.FC<RankingSystemProps> = ({ currentRank, sport, completedTricks, onRankUpdate, onTrickComplete, onSaveClip, onResetProgress, allUsers }) => {
  const [view, setView] = useState<'progress' | 'leaderboard'>('progress');
  
  // AI/Trick State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Progress State
  const [progress, setProgress] = useState(0);
  
  // Verification State
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(Date.now());
  
  // Selection State
  const [selectedTrickName, setSelectedTrickName] = useState('');
  
  // Reset Confirmation State
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Tutorial State
  const [tutorialTrick, setTutorialTrick] = useState<string | null>(null);
  const [tutorialData, setTutorialData] = useState<{ summary: string, sources: { title: string, uri: string }[] } | null>(null);
  const [loadingTutorial, setLoadingTutorial] = useState(false);

  // Select DB based on sport
  const getTrickDB = () => {
    if (sport === Sport.Scooter) return SCOOTER_TRICKS;
    if (sport === Sport.Skateboard) return SKATE_TRICKS;
    return BIKE_TRICKS;
  };

  const db = getTrickDB();
  const nextRank = RANK_ORDER[RANK_ORDER.indexOf(currentRank) + 1] || Rank.Insanity;
  
  // Filter to ONLY current rank tricks
  const rankTricks = db.filter(t => t.rank === currentRank);
  
  // Calculate Effective Completed Tricks (Props + Local Success)
  // This ensures immediate visual feedback without waiting for prop updates
  const effectiveCompletedTricks = [...completedTricks];
  if (analysisResult?.landed && analysisResult?.trickName && !effectiveCompletedTricks.includes(analysisResult.trickName)) {
      effectiveCompletedTricks.push(analysisResult.trickName);
  }

  // Calculate Progress based on effective list
  const completedRankTricks = rankTricks.filter(t => effectiveCompletedTricks.includes(t.name));
  const progressPercentage = Math.round((completedRankTricks.length / rankTricks.length) * 100) || 0;
  const isRankComplete = completedRankTricks.length === rankTricks.length && rankTricks.length > 0;

  // Leaderboard Logic
  const getLeaderboardData = () => {
    return [...allUsers]
        .filter(u => u.availableSports.includes(sport)) // Only users who play this sport
        .map(u => ({
            username: u.username,
            avatarUrl: u.avatarUrl,
            stats: u.sportProfiles[sport] || { currentRank: Rank.Bronze, xp: 0 }
        }))
        .sort((a, b) => {
            // Sort by Rank Index (Higher is better)
            const rankA = RANK_ORDER.indexOf(a.stats.currentRank);
            const rankB = RANK_ORDER.indexOf(b.stats.currentRank);
            if (rankB !== rankA) return rankB - rankA;
            
            // If same rank, sort by XP
            return (b.stats.xp || 0) - (a.stats.xp || 0);
        })
        .slice(0, 100); // Top 100
  };

  const processTrickResult = (trickName: string, fileOverride?: File) => {
      const trickInDb = db.find(t => t.name.toLowerCase() === trickName.toLowerCase());
      
      if (trickInDb) {
          const isAlreadyCompleted = completedTricks.includes(trickInDb.name);
          const xp = 10 * (RANK_ORDER.indexOf(trickInDb.rank) + 1);
          
          // Notify Parent - This updates the global state and the checklist
          onTrickComplete(trickInDb.name, xp, 'AI Verified');

          // Save Clip if video - Use override if provided (safer), else fallback to state
          const fileToSave = fileOverride || currentFile;
          if (fileToSave) {
              onSaveClip(fileToSave, trickInDb.name, trickInDb.rank);
          }

          // Check for Rank Up (using effective list logic for immediate check)
          const updatedCompletedList = isAlreadyCompleted ? completedTricks : [...completedTricks, trickInDb.name];
          const allDone = rankTricks.every(t => updatedCompletedList.includes(t.name));

          if (allDone && !isRankComplete) {
              const nextIndex = RANK_ORDER.indexOf(currentRank) + 1;
              if (nextIndex < RANK_ORDER.length) {
                  setTimeout(() => {
                      onRankUpdate(RANK_ORDER[nextIndex]);
                  }, 2000); // Give time to see the full bar
              }
          }
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTrickName) return;
    
    // Explicitly set state but also use local variables to prevent race conditions
    setCurrentFile(file);
    setAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setProgress(0);

    // Simulate progress since API call is atomic
    const progressInterval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 90) return prev; // Hold at 90% until done
            return prev + Math.floor(Math.random() * 10) + 5;
        });
    }, 500);

    try {
      // Pass the target trick (selectedTrickName) to the AI to verify
      const result = await analyzeTrickVideo(file, sport, selectedTrickName);
      
      clearInterval(progressInterval);
      setProgress(100);

      // Requirement: Must be landed AND rating >= 5
      if (result.landed && result.rating >= 5) {
          // It's a success!
          const finalResult = { 
              ...result, 
              trickName: selectedTrickName, 
          };
          // Process the win
          setTimeout(() => { // Short delay to show 100% progress
              processTrickResult(selectedTrickName, file);
              setAnalysisResult(finalResult);
              setAnalyzing(false);
          }, 500);
      } else {
          // Failed attempt logic
          let feedbackMsg = result.feedback;
          let failTitle = "MISSED ATTEMPT";

          // Specific message if low score caused the fail
          if (result.landed && result.rating < 5) {
             failTitle = "LOW SCORE";
             feedbackMsg = `Try again! You fell below a 50%. ${result.feedback}`;
          }
          
          setTimeout(() => {
              setAnalysisResult({
                  ...result,
                  trickName: selectedTrickName,
                  landed: false, // Force false for UI state
                  feedback: feedbackMsg,
                  failTitle: failTitle
              });
              setAnalyzing(false);
          }, 500);
      }

    } catch (err: any) {
      clearInterval(progressInterval);
      if (err.message === "QUOTA_EXCEEDED") {
          setError("Daily AI limit reached. Please try again tomorrow.");
      } else {
          setError("Failed to analyze video. Please try again.");
      }
      setAnalyzing(false);
    }
  };

  const resetAnalyzer = () => {
    setAnalysisResult(null);
    setCurrentFile(null);
    setError(null);
    setProgress(0);
    setInputKey(Date.now()); // Force refresh of input element
    // We do not clear selectedTrickName here, so they can retry the same trick easily.
  };

  const handleWatchTutorial = async (trickName: string) => {
      setTutorialTrick(trickName);
      setLoadingTutorial(true);
      setTutorialData(null);
      try {
          const data = await searchTrickTutorials(`How to ${trickName}`, sport);
          setTutorialData(data);
      } catch (error) {
          console.error("Failed to load tutorial", error);
      } finally {
          setLoadingTutorial(false);
      }
  };

  // Helper to extract YouTube ID
  const getYouTubeId = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in overflow-y-auto h-full pb-24">
      
      {/* Tutorial Modal */}
      {tutorialTrick && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-vx-panel w-full max-w-3xl rounded-3xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Youtube className="text-red-500" /> How to: {tutorialTrick}
                      </h3>
                      <button onClick={() => setTutorialTrick(null)} className="text-gray-400 hover:text-white">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6">
                      {loadingTutorial ? (
                          <div className="flex flex-col items-center justify-center h-64">
                              <Loader2 size={48} className="text-cyan-400 animate-spin mb-4" />
                              <p className="text-gray-400">Finding the best tutorial...</p>
                          </div>
                      ) : tutorialData ? (
                          <div className="space-y-6">
                              {/* Video Embed if available */}
                              {tutorialData.sources.find(s => s.uri.includes('youtube')) && (
                                  <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-gray-800 shadow-lg">
                                      <iframe 
                                          width="100%" 
                                          height="100%" 
                                          src={`https://www.youtube.com/embed/${getYouTubeId(tutorialData.sources.find(s => s.uri.includes('youtube'))!.uri)}`} 
                                          title="YouTube video player" 
                                          frameBorder="0" 
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                          allowFullScreen
                                      ></iframe>
                                  </div>
                              )}
                              
                              {/* Summary */}
                              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                                  <h4 className="text-white font-bold mb-3">Technique Breakdown</h4>
                                  <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                                      {tutorialData.summary.split('\n').map((line, i) => (
                                          <p key={i} className="mb-1">{line}</p>
                                      ))}
                                  </div>
                              </div>

                              {/* External Links */}
                              <div>
                                  <h4 className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-3">Source Links</h4>
                                  <div className="flex flex-wrap gap-2">
                                      {tutorialData.sources.map((s, i) => (
                                          <a 
                                            key={i} 
                                            href={s.uri} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-cyan-400 text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                                          >
                                              <ExternalLink size={12} /> {s.title.slice(0, 30)}...
                                          </a>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="text-center text-gray-500">No tutorial found.</div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-vx-panel border border-gray-800 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center relative">
                <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Reset Progress?</h3>
                <p className="text-gray-400 mb-8">
                    Are you sure you want to restart? This will set your rank back to <span className="text-orange-500 font-bold">Bronze</span> and uncheck all completed tricks. This action cannot be undone.
                </p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            onResetProgress();
                            setShowResetConfirm(false);
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors"
                    >
                        Confirm Reset
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Header and Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
              {sport} <span className="text-cyan-400">Ranking</span>
          </h1>
          
          <div className="flex bg-vx-panel p-1 rounded-xl border border-gray-800">
              <button 
                  onClick={() => setView('progress')}
                  className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                      view === 'progress' ? 'bg-cyan-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
              >
                  <Activity size={16} /> My Progress
              </button>
              <button 
                  onClick={() => setView('leaderboard')}
                  className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                      view === 'leaderboard' ? 'bg-yellow-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
              >
                  <Swords size={16} /> Leaderboard
              </button>
          </div>
      </div>
      
      {view === 'progress' ? (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-vx-panel p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Current Rank</p>
                        <h3 className="text-2xl font-black text-white flex items-center gap-2">
                            {currentRank} <RankIcon rank={currentRank} size={24} />
                        </h3>
                    </div>
                    <div className="text-right">
                         <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">XP to Rank Up</p>
                         <h3 className="text-2xl font-black text-cyan-400">100 XP</h3> 
                    </div>
                </div>
                <div className="bg-vx-panel p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
                     <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Next Milestone</p>
                        <h3 className="text-2xl font-black text-white flex items-center gap-2">
                            {nextRank} <RankIcon rank={nextRank} size={24} />
                        </h3>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-vx-panel p-6 rounded-2xl border border-gray-800 relative overflow-hidden">
                <div className="flex justify-between items-end mb-2 relative z-10">
                    <h3 className="text-xl font-bold text-white">Path to {nextRank}</h3>
                    <span className="text-cyan-400 font-black text-2xl">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden mb-4 relative z-10">
                    <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <div className="flex justify-between items-center relative z-10">
                    <p className="text-gray-400 text-sm">
                        {completedRankTricks.length} / {rankTricks.length} Tricks Completed
                    </p>
                     <button 
                        onClick={() => setShowResetConfirm(true)}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 border border-red-500/30 px-2 py-1 rounded hover:bg-red-900/20 transition-colors"
                    >
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>
            </div>

            {/* Trick Checklist */}
            <div className="bg-vx-panel border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <ListChecks size={18} className="text-purple-400" /> {currentRank} Checklist
                    </h3>
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                        {completedRankTricks.length}/{rankTricks.length}
                    </span>
                </div>
                <div className="divide-y divide-gray-800">
                    {rankTricks.map((trick) => {
                        const isCompleted = effectiveCompletedTricks.includes(trick.name);
                        const isSelected = selectedTrickName === trick.name;
                        
                        return (
                            <div 
                                key={trick.name} 
                                onClick={() => !isCompleted && setSelectedTrickName(trick.name)}
                                className={`p-4 flex items-center justify-between transition-all cursor-pointer ${
                                    isCompleted ? 'bg-green-500/5' : 
                                    isSelected ? 'bg-cyan-500/10 border-l-4 border-cyan-500' : 
                                    'hover:bg-gray-900/50'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                                        isCompleted ? 'bg-green-500 border-green-500 text-black' : 
                                        'border-gray-600 text-transparent'
                                    }`}>
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h4 className={`font-bold ${isCompleted ? 'text-green-400 line-through' : 'text-white'}`}>
                                            {trick.name}
                                        </h4>
                                        <div className="flex gap-1 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div 
                                                    key={i} 
                                                    className={`h-1 w-4 rounded-full ${
                                                        i < (trick.difficultyScore / 20) 
                                                        ? 'bg-cyan-500' 
                                                        : 'bg-gray-700'
                                                    }`} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleWatchTutorial(trick.name);
                                    }}
                                    className="p-2 text-gray-500 hover:text-cyan-400 transition-colors"
                                    title="Watch Tutorial"
                                >
                                    <PlayCircle size={20} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Analysis Section */}
            {!isRankComplete && (
                <div className="bg-vx-panel border border-gray-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
                     <div className="absolute top-0 right-0 p-16 bg-cyan-500/5 rounded-bl-full" />
                     
                     <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Upload size={24} className="text-cyan-400" /> AI Trick Analyzer
                     </h3>

                     {/* Result View */}
                     {analysisResult ? (
                         <div className={`rounded-xl p-6 border ${analysisResult.landed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                             <div className="flex items-start gap-4">
                                 <div className={`p-3 rounded-full ${analysisResult.landed ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                                     {analysisResult.landed ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
                                 </div>
                                 <div className="flex-1">
                                     <h4 className={`text-xl font-bold mb-1 ${analysisResult.landed ? 'text-green-400' : 'text-red-400'}`}>
                                         {analysisResult.landed ? 'TRICK LANDED!' : analysisResult.failTitle || 'ATTEMPT FAILED'}
                                     </h4>
                                     
                                     {analysisResult.landed && (
                                         <div className="flex items-center gap-2 mb-2">
                                             <span className="bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                                <Check size={10} /> Checklist Updated
                                             </span>
                                             <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                                +XP
                                             </span>
                                         </div>
                                     )}

                                     <div className="flex items-center gap-4 mb-4">
                                         <div className="relative w-16 h-16 flex items-center justify-center">
                                             <svg className="w-full h-full" viewBox="0 0 36 36">
                                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#444" strokeWidth="4" />
                                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={analysisResult.landed ? '#4ade80' : '#f87171'} strokeWidth="4" strokeDasharray={`${analysisResult.rating * 10}, 100`} />
                                             </svg>
                                             <span className="absolute text-white font-bold">{analysisResult.rating}/10</span>
                                         </div>
                                         <div className="flex-1">
                                             <p className="text-gray-300 text-sm italic">"{analysisResult.feedback}"</p>
                                         </div>
                                     </div>

                                     {analysisResult.landed && (
                                         <div className="mb-4">
                                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                  <span>Path to {nextRank}</span>
                                                  <span>{progressPercentage}%</span>
                                              </div>
                                              <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                                                  <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
                                              </div>
                                         </div>
                                     )}

                                     <div className="flex gap-2">
                                         <button 
                                            onClick={resetAnalyzer}
                                            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
                                         >
                                             <RotateCcw size={14} /> Analyze Another
                                         </button>
                                         {analysisResult.landed && (
                                             <button className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                                                 Not the right trick?
                                             </button>
                                         )}
                                     </div>
                                 </div>
                             </div>
                         </div>
                     ) : (
                         // Input View
                        <div className="bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-700 p-8 text-center relative group hover:border-cyan-500 transition-all">
                            {analyzing ? (
                                <div>
                                    <div className="w-full max-w-xs mx-auto bg-gray-800 rounded-full h-4 overflow-hidden mb-4 border border-gray-700">
                                        <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                                    </div>
                                    <p className="text-cyan-400 font-bold animate-pulse">Analyzing Technique...</p>
                                    <p className="text-xs text-gray-500 mt-2">Checking form, landing, and difficulty</p>
                                </div>
                            ) : (
                                <>
                                    {!selectedTrickName ? (
                                        <div className="flex flex-col items-center text-gray-500">
                                            <ListChecks size={48} className="mb-4 opacity-50" />
                                            <p className="font-bold text-lg">Select a Trick First</p>
                                            <p className="text-sm">Click a trick in the list above to verify it.</p>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer w-full h-full block">
                                            <input 
                                                key={inputKey}
                                                type="file" 
                                                accept="video/*" 
                                                className="hidden" 
                                                onChange={handleFileUpload} 
                                            />
                                            <Upload size={48} className="mx-auto mb-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                                            <h4 className="text-xl font-bold text-white mb-2">
                                                Verify <span className="text-cyan-400">{selectedTrickName}</span>
                                            </h4>
                                            <p className="text-gray-400 text-sm">Upload a video of you landing this trick.</p>
                                            {error && (
                                                <div className="mt-4 text-red-400 bg-red-900/20 px-4 py-2 rounded-lg inline-block text-sm font-bold">
                                                    {error}
                                                </div>
                                            )}
                                        </label>
                                    )}
                                </>
                            )}
                        </div>
                     )}
                </div>
            )}
        </div>
      ) : (
        <div className="animate-fade-in">
            <div className="bg-vx-panel border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-6 bg-gray-900/50 border-b border-gray-800">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Globe size={20} className="text-yellow-500" /> Global Rankings ({sport})
                    </h3>
                    <p className="text-gray-400 text-sm">Top 100 riders worldwide</p>
                </div>
                <div className="divide-y divide-gray-800">
                    {getLeaderboardData().map((user, index) => {
                        const isTop3 = index < 3;
                        const rankColor = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-gray-500';
                        
                        return (
                            <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-900/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 font-black text-lg text-center ${rankColor}`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex items-center gap-3">
                                         <div className="relative">
                                            <div className={`w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-white font-black border-2 ${isTop3 ? 'border-yellow-500' : 'border-gray-700'}`}>
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt={user.username} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    user.username[0].toUpperCase()
                                                )}
                                            </div>
                                            {index === 0 && <Crown size={16} className="absolute -top-2 -right-1 text-yellow-500" fill="currentColor" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{user.username}</h4>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <RankIcon rank={user.stats.currentRank} size={12} />
                                                {user.stats.currentRank}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right pr-4">
                                    <div className="text-cyan-400 font-black text-lg">{user.stats.xp.toLocaleString()} XP</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default RankingSystem;
