
import React, { useState } from 'react';
import { SCOOTER_TRICKS, BIKE_TRICKS, SKATE_TRICKS, RANK_ORDER } from '../constants';
import { Rank, Sport } from '../types';
import { Camera, Upload, CheckCircle, AlertCircle, Loader2, Medal, Swords, Edit3, Check, PlayCircle, Lock, X } from 'lucide-react';
import { analyzeTrickVideo } from '../services/geminiService';

interface RankingSystemProps {
  currentRank: Rank;
  sport: Sport;
  completedTricks: string[];
  onRankUpdate: (newRank: Rank) => void;
  onTrickComplete: (trickName: string, xp: number, method: string) => void;
  onSaveClip: (file: File, trickName: string, rank: Rank) => void;
}

const RankingSystem: React.FC<RankingSystemProps> = ({ currentRank, sport, completedTricks, onRankUpdate, onTrickComplete, onSaveClip }) => {
  const [mode, setMode] = useState<'video' | 'manual'>('video');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Verification State
  const [pendingResult, setPendingResult] = useState<any>(null);
  const [correctionMode, setCorrectionMode] = useState(false);
  const [correctedTrickName, setCorrectedTrickName] = useState('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  
  // Manual Entry State
  const [selectedTrickName, setSelectedTrickName] = useState('');

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
  
  // Calculate Progress
  const completedRankTricks = rankTricks.filter(t => completedTricks.includes(t.name));
  const progressPercentage = Math.round((completedRankTricks.length / rankTricks.length) * 100) || 0;
  const isRankComplete = completedRankTricks.length === rankTricks.length && rankTricks.length > 0;

  const processTrickResult = (trickName: string, method: 'video' | 'manual') => {
      const trickInDb = db.find(t => t.name.toLowerCase() === trickName.toLowerCase());
      
      if (trickInDb) {
          const isAlreadyCompleted = completedTricks.includes(trickInDb.name);
          const xp = 10 * (RANK_ORDER.indexOf(trickInDb.rank) + 1);
          
          // Notify Parent
          onTrickComplete(trickInDb.name, xp, method === 'video' ? 'AI Verified' : 'Manual Entry');

          // Save Clip if video
          if (method === 'video' && currentFile) {
              onSaveClip(currentFile, trickInDb.name, trickInDb.rank);
          }

          // Check for Rank Up
          const updatedCompletedList = isAlreadyCompleted ? completedTricks : [...completedTricks, trickInDb.name];
          const allDone = rankTricks.every(t => updatedCompletedList.includes(t.name));

          if (allDone && !isRankComplete) {
              const nextIndex = RANK_ORDER.indexOf(currentRank) + 1;
              if (nextIndex < RANK_ORDER.length) {
                  setTimeout(() => {
                      onRankUpdate(RANK_ORDER[nextIndex]);
                  }, 1500); 
              }
          }
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCurrentFile(file);
    setAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setPendingResult(null);
    setCorrectionMode(false);

    const allowedTricks = rankTricks.map(t => t.name);

    try {
      const result = await analyzeTrickVideo(file, sport, allowedTricks);
      const matchedTrick = rankTricks.find(t => t.name.toLowerCase() === result.trickName.toLowerCase());

      if (!matchedTrick) {
          setError(`The detected trick "${result.trickName}" is not in your current ${currentRank} checklist.`);
          setPendingResult(null);
      } else {
          setPendingResult({ ...result, trickName: matchedTrick.name });
      }
    } catch (err) {
      setError("Failed to analyze video. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const confirmAiResult = () => {
      if (pendingResult) {
          processTrickResult(pendingResult.trickName, 'video');
          setAnalysisResult(pendingResult);
          setPendingResult(null);
      }
  };

  const handleCorrectionSubmit = () => {
      if (!correctedTrickName) return;
      processTrickResult(correctedTrickName, 'video');
      
      setAnalysisResult({
          ...pendingResult,
          trickName: correctedTrickName,
          executionQuality: "User Corrected",
          feedback: "Trick corrected and logged successfully."
      });
      
      setPendingResult(null);
      setCorrectionMode(false);
      setCorrectedTrickName('');
  };

  const handleManualSubmit = () => {
      if (!selectedTrickName) return;
      processTrickResult(selectedTrickName, 'manual');
      setAnalysisResult({
          trickName: selectedTrickName,
          executionQuality: "Self Verified",
          feedback: "Trick logged manually. Keep pushing!"
      });
      setSelectedTrickName('');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in overflow-y-auto h-full pb-24">
      {/* Rank Progress Bar */}
      <div className="mb-8 bg-vx-panel border border-gray-800 p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-end mb-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {currentRank} Progress
                  {isRankComplete && <CheckCircle className="text-green-500" size={20} />}
              </h2>
              <span className="text-cyan-400 font-bold">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
          </div>
          <p className="text-gray-400 text-sm mt-2">
              Complete all {rankTricks.length} tricks in {currentRank} to unlock {nextRank}.
          </p>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-vx-panel border border-gray-800 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-black text-2xl shadow-lg shadow-orange-500/20">
            {currentRank[0]}
          </div>
          <div>
            <p className="text-gray-400 text-sm uppercase tracking-wider font-bold">Current Rank</p>
            <h2 className="text-2xl font-bold text-white">{currentRank}</h2>
          </div>
        </div>
        <div className="bg-vx-panel border border-gray-800 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-cyan-400 border border-gray-700">
            <Medal size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm uppercase tracking-wider font-bold">Next Milestone</p>
            <h2 className="text-2xl font-bold text-white">{nextRank}</h2>
          </div>
        </div>
        <div className="bg-vx-panel border border-gray-800 p-6 rounded-2xl flex items-center gap-4 shadow-lg relative overflow-hidden">
           <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/10 blur-2xl" />
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-purple-400 border border-gray-700">
            <Swords size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm uppercase tracking-wider font-bold">XP To Rank Up</p>
            <h2 className="text-2xl font-bold text-white">100 XP</h2>
          </div>
        </div>
      </div>

      {/* Logger / Analyzer */}
      <div className="mb-12 bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700">
            <button 
                onClick={() => { setMode('video'); setAnalysisResult(null); setError(null); setPendingResult(null); }}
                className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors
                    ${mode === 'video' ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}
            >
                <Camera size={18} /> Video Analysis
            </button>
            <button 
                onClick={() => { setMode('manual'); setAnalysisResult(null); setError(null); setPendingResult(null); }}
                className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors
                    ${mode === 'manual' ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}
            >
                <Edit3 size={18} /> Manual Entry
            </button>
        </div>

        <div className="p-8 relative z-10">
          {mode === 'video' ? (
              <>
                <h3 className="text-2xl font-bold text-white mb-2">AI Trick Analyzer</h3>
                <p className="text-gray-400 mb-6">
                    Record or upload a video. <span className="text-cyan-400 font-bold">Note: The trick must be listed in your current rank checklist.</span>
                </p>
                
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <label className="flex flex-col items-center justify-center w-full md:w-64 h-48 border-2 border-dashed border-gray-600 rounded-2xl bg-gray-900/50 hover:bg-gray-800 hover:border-cyan-500 transition-all cursor-pointer group">
                        <input type="file" accept="video/*" capture="environment" className="hidden" onChange={handleFileUpload} disabled={analyzing} />
                        {analyzing ? (
                        <Loader2 className="animate-spin text-cyan-400 mb-2" size={32} />
                        ) : (
                        <Upload className="text-gray-500 group-hover:text-cyan-400 mb-2 transition-colors" size={32} />
                        )}
                        <span className="text-sm text-gray-400 font-medium">{analyzing ? 'Scanning...' : 'Upload Video'}</span>
                    </label>

                    {/* Verification UI */}
                    {pendingResult && !analysisResult && (
                        <div className="flex-1 bg-gray-800 rounded-2xl p-6 border border-gray-700 w-full animate-fade-in">
                            {!correctionMode ? (
                                <>
                                    <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">AI Analysis Complete</h4>
                                    <p className="text-gray-500 text-sm mb-1">Detected Trick:</p>
                                    <p className="text-2xl font-bold text-white mb-4">{pendingResult.trickName}</p>

                                    {pendingResult.reasoning && (
                                        <p className="text-gray-400 text-xs mb-4 italic border-l-2 border-gray-700 pl-2">
                                            "{pendingResult.reasoning}"
                                        </p>
                                    )}
                                    
                                    <div className="flex flex-col gap-3">
                                        <button 
                                            onClick={confirmAiResult}
                                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <Check size={18} /> Confirm & Log
                                        </button>
                                        <button 
                                            onClick={() => setCorrectionMode(true)}
                                            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <X size={18} /> Incorrect Result
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                     <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Correction</h4>
                                     <label className="block text-xs text-gray-500 mb-2">What was the actual trick?</label>
                                     <select 
                                        value={correctedTrickName}
                                        onChange={(e) => setCorrectedTrickName(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-cyan-500"
                                     >
                                        <option value="">-- Select Trick --</option>
                                        {rankTricks.map(t => (
                                            <option key={t.name} value={t.name}>{t.name}</option>
                                        ))}
                                     </select>
                                     <div className="flex gap-3">
                                        <button 
                                            onClick={() => setCorrectionMode(false)}
                                            className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleCorrectionSubmit}
                                            disabled={!correctedTrickName}
                                            className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
                                        >
                                            Update Log
                                        </button>
                                     </div>
                                </>
                            )}
                        </div>
                    )}

                    {analysisResult && (
                    <div className="flex-1 bg-black/30 rounded-2xl p-6 border border-green-500/30 w-full animate-fade-in">
                        <div className="flex items-center gap-2 text-green-400 mb-4">
                            <CheckCircle size={20} />
                            <span className="font-bold uppercase tracking-wider">Trick Verified & Clip Saved</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                            <p className="text-gray-500 text-xs">Detected Trick</p>
                            <p className="text-xl font-bold text-white">{analysisResult.trickName}</p>
                            </div>
                            <div>
                            <p className="text-gray-500 text-xs">Quality</p>
                            <p className="text-xl font-bold text-white">{analysisResult.executionQuality}</p>
                            </div>
                        </div>
                        
                        {analysisResult.reasoning && (
                            <div className="mb-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                                <p className="text-gray-500 text-xs uppercase font-bold mb-1">AI Reasoning</p>
                                <p className="text-gray-300 text-sm">{analysisResult.reasoning}</p>
                            </div>
                        )}
                        <p className="text-gray-300 italic text-sm">"{analysisResult.feedback}"</p>
                    </div>
                    )}

                    {error && (
                        <div className="flex-1 bg-red-500/10 rounded-2xl p-6 border border-red-500/30 flex items-center gap-3">
                        <AlertCircle className="text-red-500 shrink-0" />
                        <span className="text-red-400">{error}</span>
                        </div>
                    )}
                </div>
              </>
          ) : (
              <>
                <h3 className="text-2xl font-bold text-white mb-2">Manual Entry</h3>
                <p className="text-gray-400 mb-6">Manually log a trick. <span className="text-purple-400">Manual entries do not save a clip.</span></p>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-full md:w-1/2 space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Select Trick</label>
                            <select 
                                value={selectedTrickName}
                                onChange={(e) => setSelectedTrickName(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-all"
                            >
                                <option value="">-- Choose a Trick ({currentRank}) --</option>
                                {rankTricks.map(t => {
                                    const isDone = completedTricks.includes(t.name);
                                    return (
                                        <option key={t.name} value={t.name} disabled={isDone}>
                                            {t.name} {isDone ? '(Completed)' : ''}
                                        </option>
                                    );
                                })}
                                {rankTricks.length === 0 && <option disabled>No tricks found for this rank</option>}
                            </select>
                        </div>
                        <button 
                            onClick={handleManualSubmit}
                            disabled={!selectedTrickName}
                            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            <Check size={20} /> Log Trick
                        </button>
                    </div>

                    {analysisResult && (
                        <div className="flex-1 bg-purple-500/10 rounded-2xl p-6 border border-purple-500/30 w-full animate-fade-in">
                            <div className="flex items-center gap-2 text-purple-400 mb-2">
                                <CheckCircle size={20} />
                                <span className="font-bold uppercase tracking-wider">Logged Successfully</span>
                            </div>
                            <p className="text-white text-lg font-bold">{analysisResult.trickName}</p>
                            <p className="text-gray-400 text-sm">Stats updated.</p>
                        </div>
                    )}
                </div>
              </>
          )}
        </div>
      </div>

      {/* Trick List */}
      <div className="mb-8">
         <div className="flex items-center justify-between mb-6">
             <h3 className="text-2xl font-bold text-white">
                {currentRank} <span className="text-cyan-400">Checklist</span>
             </h3>
             <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700">
                 {completedRankTricks.length} / {rankTricks.length} Completed
             </span>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rankTricks.map((trick, i) => {
              const isCompleted = completedTricks.includes(trick.name);
              return (
                <div key={i} className={`bg-vx-panel p-5 rounded-2xl border transition-all group relative overflow-hidden
                    ${isCompleted ? 'border-green-500/30 bg-green-500/5' : 'border-gray-800 hover:border-cyan-500/50'}
                `}>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/5 group-hover:to-purple-500/5 transition-all duration-500" />
                    
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                isCompleted ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-600'
                            }`}>
                                {isCompleted ? <Check size={20} /> : <Lock size={16} />}
                            </div>
                            <div>
                                <h4 className={`text-lg font-bold mb-1 transition-colors ${isCompleted ? 'text-green-400 line-through' : 'text-white group-hover:text-cyan-400'}`}>
                                    {trick.name}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-500 bg-gray-900 px-2 py-0.5 rounded uppercase tracking-wider">
                                        Difficulty
                                    </span>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, idx) => (
                                            <div 
                                                key={idx} 
                                                className={`h-1.5 w-4 rounded-full ${
                                                    (trick.difficultyScore / 20) > idx 
                                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                                                    : 'bg-gray-800'
                                                }`} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {!isCompleted && (
                            <button 
                                onClick={() => {
                                    setMode('manual');
                                    setSelectedTrickName(trick.name);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="w-10 h-10 rounded-full bg-gray-800 group-hover:bg-cyan-500 text-gray-400 group-hover:text-black flex items-center justify-center transition-all shadow-lg"
                                title="Log this trick"
                            >
                                <PlayCircle size={20} />
                            </button>
                        )}
                    </div>
                </div>
              );
            })}
            {rankTricks.length === 0 && (
                <div className="col-span-2 p-8 text-center border border-dashed border-gray-700 rounded-2xl text-gray-500">
                    No specific tricks listed for this rank in our database yet.
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default RankingSystem;
