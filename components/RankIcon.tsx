
import React from 'react';
import { Rank } from '../types';

interface RankIconProps {
  rank: Rank;
  size?: number;
  className?: string;
}

const RankIcon: React.FC<RankIconProps> = ({ rank, size = 40, className = '' }) => {
  const getSize = () => ({ width: size, height: size });

  switch (rank) {
    case Rank.Bronze:
      return (
        <svg {...getSize()} viewBox="0 0 100 100" className={`drop-shadow-lg ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bronzeGrad" x1="0" y1="0" x2="100" y2="100">
              <stop offset="0%" stopColor="#E7CFA0" />
              <stop offset="50%" stopColor="#CD7F32" />
              <stop offset="100%" stopColor="#8B4513" />
            </linearGradient>
            <filter id="inset" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
                <feOffset dx="1" dy="1" result="offsetBlur"/>
                <feComposite in="offsetBlur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"/>
                <feFlood floodColor="black" floodOpacity="0.5"/>
                <feComposite in2="shadowDiff" operator="in"/>
                <feComposite in2="SourceGraphic" operator="over" />
            </filter>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#bronzeGrad)" stroke="#5C300B" strokeWidth="2" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="#5C300B" strokeWidth="1" opacity="0.5" />
          <path d="M50 25 L50 75 M25 50 L75 50" stroke="#5C300B" strokeWidth="2" opacity="0.3" />
          <text x="50" y="60" fontSize="30" fontWeight="900" fill="#5C300B" textAnchor="middle" style={{fontFamily: 'serif'}}>B</text>
        </svg>
      );
    case Rank.Silver:
      return (
        <svg {...getSize()} viewBox="0 0 100 100" className={`drop-shadow-lg ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="silverGrad" x1="0" y1="0" x2="100" y2="100">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#C0C0C0" />
              <stop offset="100%" stopColor="#707070" />
            </linearGradient>
          </defs>
          <path d="M50 5 L90 25 L80 85 L50 95 L20 85 L10 25 Z" fill="url(#silverGrad)" stroke="#505050" strokeWidth="2" />
          <path d="M50 15 L80 30 L72 78 L50 85 L28 78 L20 30 Z" fill="none" stroke="#505050" strokeWidth="1" opacity="0.5" />
          <text x="50" y="62" fontSize="35" fontWeight="900" fill="#404040" textAnchor="middle" style={{fontFamily: 'sans-serif'}}>S</text>
        </svg>
      );
    case Rank.Gold:
      return (
        <svg {...getSize()} viewBox="0 0 100 100" className={`drop-shadow-lg ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="100" y2="100">
              <stop offset="0%" stopColor="#FFFACD" />
              <stop offset="50%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
          </defs>
          <path d="M50 5 L63 35 L95 38 L70 60 L78 90 L50 75 L22 90 L30 60 L5 38 L37 35 Z" fill="url(#goldGrad)" stroke="#B8860B" strokeWidth="2" />
          <circle cx="50" cy="55" r="15" fill="none" stroke="#B8860B" strokeWidth="2" />
          <text x="50" y="63" fontSize="24" fontWeight="900" fill="#8B4500" textAnchor="middle">G</text>
        </svg>
      );
    case Rank.Platinum:
      return (
        <svg {...getSize()} viewBox="0 0 100 100" className={`drop-shadow-lg ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="platGrad" x1="0" y1="0" x2="0" y2="100">
              <stop offset="0%" stopColor="#E0FFFF" />
              <stop offset="50%" stopColor="#B0E0E6" />
              <stop offset="100%" stopColor="#4682B4" />
            </linearGradient>
          </defs>
          <path d="M20 20 L80 20 L95 50 L50 95 L5 50 Z" fill="url(#platGrad)" stroke="#4682B4" strokeWidth="2" />
          <path d="M20 20 L50 95 M80 20 L50 95 M5 50 L95 50" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
        </svg>
      );
    case Rank.Diamond:
      return (
        <svg {...getSize()} viewBox="0 0 100 100" className={`drop-shadow-[0_0_15px_rgba(34,211,238,0.6)] ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="diamondGrad" x1="0" y1="0" x2="100" y2="100">
              <stop offset="0%" stopColor="#E0FFFF" />
              <stop offset="50%" stopColor="#00BFFF" />
              <stop offset="100%" stopColor="#1E90FF" />
            </linearGradient>
          </defs>
          <path d="M50 5 L85 40 L50 95 L15 40 Z" fill="url(#diamondGrad)" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M50 5 L50 95 M15 40 L85 40 M32.5 22.5 L67.5 22.5" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
        </svg>
      );
    case Rank.Champion:
      return (
        <svg {...getSize()} viewBox="0 0 100 100" className={`drop-shadow-[0_0_15px_rgba(220,20,60,0.6)] ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="champGrad" x1="0" y1="0" x2="100" y2="100">
              <stop offset="0%" stopColor="#FF4500" />
              <stop offset="50%" stopColor="#8B0000" />
              <stop offset="100%" stopColor="#2F0000" />
            </linearGradient>
            <linearGradient id="goldTrim" x1="0" y1="0" x2="100" y2="0">
               <stop offset="0%" stopColor="#FFD700" />
               <stop offset="100%" stopColor="#FFA500" />
            </linearGradient>
          </defs>
          {/* Wreath */}
          <path d="M10 60 Q 10 90 50 95 Q 90 90 90 60" stroke="url(#goldTrim)" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Crown */}
          <path d="M20 50 L20 20 L40 35 L50 10 L60 35 L80 20 L80 50 Z" fill="url(#champGrad)" stroke="url(#goldTrim)" strokeWidth="2" />
          <path d="M20 50 L80 50 L80 60 L20 60 Z" fill="url(#goldTrim)" />
        </svg>
      );
    case Rank.Insanity:
      return (
        <svg {...getSize()} viewBox="0 0 100 100" className={`drop-shadow-[0_0_20px_rgba(139,92,246,0.8)] ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="insanityGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="20%" stopColor="#E0B0FF" />
              <stop offset="60%" stopColor="#8A2BE2" />
              <stop offset="100%" stopColor="#4B0082" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="black" />
          {/* Vortex shape */}
          <path d="M50 50 Q 70 20 90 50 T 50 90 T 10 50 T 50 10 Z" fill="url(#insanityGrad)" opacity="0.8">
            <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="10s" repeatCount="indefinite" />
          </path>
          <path d="M50 50 Q 80 30 80 60 T 50 80 T 20 60 T 50 50 Z" stroke="#FFFFFF" strokeWidth="1" fill="none" opacity="0.5">
            <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="7s" repeatCount="indefinite" />
          </path>
        </svg>
      );
    default:
      return <div style={{ width: size, height: size }} className="bg-gray-500 rounded-full" />;
  }
};

export default RankIcon;
