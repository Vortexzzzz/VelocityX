import React, { useState } from 'react';
import { Sport, SubscriptionTier } from '../types';
import { SUBSCRIPTION_PLANS } from '../constants';
import { Check, Bike, Component, Flame } from 'lucide-react';

interface OnboardingProps {
  onComplete: (sports: Sport[], sub: SubscriptionTier) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedSports, setSelectedSports] = useState<Sport[]>([]);
  
  const sportsList = [
    { id: Sport.Skateboard, label: 'Skateboard', icon: '🛹' },
    { id: Sport.Scooter, label: 'Scooter', icon: '🛴' },
    { id: Sport.BMX, label: 'BMX', icon: '🚲' },
    { id: Sport.DirtJumper, label: 'Dirt Jumper', icon: '🚵' },
    { id: Sport.DirtBike, label: 'Dirt Bike', icon: '🏍️' },
    { id: Sport.MountainBike, label: 'Mountain Bike', icon: '🏔️' },
  ];

  const toggleSport = (sport: Sport) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter(s => s !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const handleSubscriptionSelect = (subId: string) => {
    let tier = SubscriptionTier.Free;
    if (subId === 'premium') tier = SubscriptionTier.Premium;
    if (subId === 'pro') tier = SubscriptionTier.Pro;
    onComplete(selectedSports, tier);
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-vx-dark flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Ride</span>
          </h1>
          <p className="text-gray-400 text-xl mb-12">Select all the sports you participate in.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {sportsList.map((sport) => (
              <button
                key={sport.id}
                onClick={() => toggleSport(sport.id)}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-4 group
                  ${selectedSports.includes(sport.id) 
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                    : 'border-gray-800 bg-gray-900/50 hover:border-gray-600'}`}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{sport.icon}</span>
                <span className={`font-bold ${selectedSports.includes(sport.id) ? 'text-white' : 'text-gray-400'}`}>
                  {sport.label}
                </span>
                {selectedSports.includes(sport.id) && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                    <Check size={14} className="text-black font-bold" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => selectedSports.length > 0 && setStep(2)}
            disabled={selectedSports.length === 0}
            className={`px-12 py-4 rounded-xl font-bold text-lg transition-all
              ${selectedSports.length > 0 
                ? 'bg-white text-black hover:scale-105 shadow-xl' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vx-dark flex flex-col items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-white mb-4">Select Your Plan</h1>
          <p className="text-gray-400">Unlock your full potential with premium features.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div key={plan.id} className={`relative rounded-3xl p-8 border transition-all duration-300 flex flex-col
              ${plan.id === 'pro' 
                ? 'bg-gradient-to-b from-gray-900 to-gray-900 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)] scale-105 z-10' 
                : 'bg-gray-900/30 border-gray-800 hover:border-gray-600'}`}
            >
              {plan.id === 'pro' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.id === 'free' ? 'bg-gray-800 text-gray-400' : 'bg-green-500/20 text-green-400'}`}>
                      <Check size={12} />
                    </div>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscriptionSelect(plan.id)}
                className={`w-full py-4 rounded-xl font-bold transition-all
                  ${plan.id === 'pro'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25'
                    : plan.id === 'premium'
                      ? 'bg-white text-black hover:bg-gray-200'
                      : 'bg-gray-800 text-white hover:bg-gray-700'}`}
              >
                Select {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;