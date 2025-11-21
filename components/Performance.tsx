
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Play, Square, Plus, Timer, Zap, ArrowUp } from 'lucide-react';

interface PerformanceProps {
    onSessionComplete?: (session: { duration: string, maxSpeed: string, maxHeight: string }) => void;
}

const Performance: React.FC<PerformanceProps> = ({ onSessionComplete }) => {
  const [tabs, setTabs] = useState(['Session 1']);
  const [activeTab, setActiveTab] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [data, setData] = useState<{time: number, speed: number, height: number}[]>([]);
  // Fixed type definition for browser environment
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Goals
  const [speedGoal, setSpeedGoal] = useState(25); // km/h
  const [heightGoal, setHeightGoal] = useState(1.5); // meters

  const startRecording = (delay: number) => {
    setCountdown(delay);
    let count = delay;
    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        setIsRecording(true);
        beginSession();
      }
    }, 1000);
  };

  const beginSession = () => {
    setTimer(0);
    setData([]);
    timerRef.current = setInterval(() => {
      setTimer(t => t + 1);
      // Simulate sensor data since we are in a web browser without physics engine
      setData(prev => [...prev, {
        time: prev.length,
        speed: Math.max(0, Math.random() * 30 + (Math.sin(prev.length / 5) * 10)),
        height: Math.max(0, Math.random() * 2 * (Math.random() > 0.8 ? 1 : 0)) // Random jumps
      }]);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (onSessionComplete) {
        const duration = formatTime(timer);
        const currentMaxSpeed = data.reduce((max, p) => Math.max(max, p.speed), 0).toFixed(1);
        const currentMaxHeight = data.reduce((max, p) => Math.max(max, p.height), 0).toFixed(2);
        onSessionComplete({ duration, maxSpeed: currentMaxSpeed, maxHeight: currentMaxHeight });
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentSpeed = data.length > 0 ? data[data.length - 1].speed.toFixed(1) : '0.0';
  const maxSpeed = data.reduce((max, p) => Math.max(max, p.speed), 0).toFixed(1);
  const maxHeight = data.reduce((max, p) => Math.max(max, p.height), 0).toFixed(2);

  return (
    <div className="p-8 h-full overflow-y-auto pb-24">
      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
              activeTab === idx ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
        <button 
            onClick={() => setTabs([...tabs, `Session ${tabs.length + 1}`])}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700"
        >
            <Plus size={20} />
        </button>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Timer & Controls */}
        <div className="bg-vx-panel p-8 rounded-3xl border border-gray-800 flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
           {countdown !== null && (
             <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center">
               <span className="text-9xl font-black text-cyan-500 animate-ping">{countdown}</span>
             </div>
           )}
           
           <div className="text-6xl font-mono font-bold text-white mb-8 tracking-widest relative z-10">
             {formatTime(timer)}
           </div>

           {!isRecording ? (
             <div className="flex gap-4 relative z-10">
               {[3, 5, 10].map(sec => (
                 <button 
                   key={sec}
                   onClick={() => startRecording(sec)}
                   className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-600/20"
                 >
                   <Play size={18} /> {sec}s
                 </button>
               ))}
             </div>
           ) : (
             <button 
               onClick={stopRecording}
               className="bg-red-600 hover:bg-red-500 text-white w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 animate-pulse shadow-lg shadow-red-600/20 relative z-10"
             >
               <Square size={20} /> STOP SESSION
             </button>
           )}
        </div>

        {/* Live Stats */}
        <div className="bg-vx-panel p-8 rounded-3xl border border-gray-800 grid grid-cols-2 gap-4 shadow-lg">
           <div className="col-span-2 mb-2 text-gray-400 uppercase text-xs font-bold tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Live Metrics
           </div>
           
           <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                 <Zap size={16} /> <span className="text-xs font-bold">CURRENT SPEED</span>
              </div>
              <div className="text-3xl font-black text-white">{currentSpeed} <span className="text-sm text-gray-500 font-normal">km/h</span></div>
           </div>

           <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                 <ArrowUp size={16} /> <span className="text-xs font-bold">MAX AIR</span>
              </div>
              <div className="text-3xl font-black text-white">{maxHeight} <span className="text-sm text-gray-500 font-normal">m</span></div>
           </div>

           <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 col-span-2">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                 <Timer size={16} /> <span className="text-xs font-bold">TOP SPEED</span>
              </div>
              <div className="text-3xl font-black text-white">{maxSpeed} <span className="text-sm text-gray-500 font-normal">km/h</span></div>
           </div>
        </div>

        {/* Goals */}
        <div className="bg-vx-panel p-8 rounded-3xl border border-gray-800 shadow-lg">
           <h3 className="text-white font-bold mb-6">Monthly Goals</h3>
           <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Speed Target</span>
                  <span className="text-white font-bold">{speedGoal} km/h</span>
                </div>
                <input 
                  type="range" 
                  min="10" max="100" 
                  value={speedGoal} 
                  onChange={(e) => setSpeedGoal(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Air Time Target</span>
                  <span className="text-white font-bold">{heightGoal} m</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" max="5" step="0.1"
                  value={heightGoal} 
                  onChange={(e) => setHeightGoal(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
           </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-8">
         <div className="bg-vx-panel p-6 rounded-3xl border border-gray-800 h-80 shadow-lg">
            <h4 className="text-gray-400 text-sm font-bold mb-4 uppercase tracking-wider">Speed Over Time</h4>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="speed" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorSpeed)" />
              </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

export default Performance;
