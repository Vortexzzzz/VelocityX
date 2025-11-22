
import React from 'react';
import { ExternalLink, Heart, DollarSign, CreditCard } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto pb-24 flex flex-col items-center justify-center min-h-[80vh]">
      
      {/* Profile Card */}
      <div className="w-full bg-vx-panel border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative animate-fade-in">
        
        {/* Decorative Background */}
        <div className="h-48 bg-gradient-to-r from-cyan-600 to-purple-700 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 p-2 bg-vx-panel rounded-full">
                <div className="w-32 h-32 bg-gray-900 rounded-full flex items-center justify-center text-4xl font-black text-white border-4 border-gray-800 shadow-xl">
                    IR
                </div>
            </div>
        </div>

        <div className="pt-20 pb-12 px-8 text-center">
          <h1 className="text-4xl font-black text-white mb-2">Ian Ruffino</h1>
          <p className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-8">Founder & Developer</p>
          
          <div className="max-w-2xl mx-auto bg-gray-900/50 p-8 rounded-2xl border border-gray-800 mb-10">
            <p className="text-gray-300 text-lg leading-relaxed italic">
              "Hi, my name is <span className="text-white font-bold">Ian Ruffino</span>. I am a 15-year-old entrepreneur. 
              If you would like to support me and the development of this app, feel free to donate using the links below. 
              Every contribution helps keep VelocityX running and improving!"
            </p>
          </div>

          <h3 className="text-white font-bold text-xl mb-6 flex items-center justify-center gap-2">
            <Heart className="text-red-500" fill="currentColor" size={20} /> Support Development
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {/* PayPal */}
            <a 
                href="https://paypal.me/vortexzzzzzz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#003087] hover:bg-[#002569] text-white p-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-transform hover:scale-105 shadow-lg shadow-blue-900/20 group"
            >
                <div className="bg-white text-[#003087] p-1.5 rounded-full">
                    <span className="font-bold text-sm">P</span>
                </div>
                <span>PayPal</span>
                <ExternalLink size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* CashApp */}
            <a 
                href="https://cash.app/$Iruff2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#00D632] hover:bg-[#00B82B] text-white p-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-transform hover:scale-105 shadow-lg shadow-green-900/20 group"
            >
                <div className="bg-white text-[#00D632] p-1.5 rounded-full">
                    <DollarSign size={14} strokeWidth={4} />
                </div>
                <span>CashApp</span>
                <ExternalLink size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* Venmo */}
            <a 
                href="https://venmo.com/u/Iruff2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#008CFF] hover:bg-[#0075D6] text-white p-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-transform hover:scale-105 shadow-lg shadow-cyan-900/20 group"
            >
                <div className="bg-white text-[#008CFF] p-1.5 rounded-full">
                    <span className="font-bold text-xs">V</span>
                </div>
                <span>Venmo</span>
                <ExternalLink size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

        </div>
      </div>
      
      <p className="mt-8 text-gray-600 text-sm">© 2024 VelocityX. Created by Ian Ruffino.</p>
    </div>
  );
};

export default About;
