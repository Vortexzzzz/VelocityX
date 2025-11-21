
export enum Rank {
  Bronze = 'Bronze',
  Silver = 'Silver',
  Gold = 'Gold',
  Platinum = 'Platinum',
  Diamond = 'Diamond',
  Champion = 'Champion',
  Insanity = 'Insanity'
}

export enum Sport {
  Skateboard = 'Skateboard',
  Scooter = 'Scooter',
  BMX = 'BMX', // Represents Bike/BMX
  DirtJumper = 'Dirt Jumper',
  DirtBike = 'Dirt Bike',
  MountainBike = 'Mountain Bike'
}

export enum SubscriptionTier {
  Free = 'Free',
  Premium = 'Premium',
  Pro = 'Pro'
}

export interface Trick {
  name: string;
  rank: Rank;
  difficultyScore: number; // Internal score 1-100 for calc
}

export interface Activity {
  id: string;
  type: 'trick' | 'session' | 'rankup';
  title: string;
  subtitle: string;
  xp: number;
  timestamp: string;
}

export interface Clip {
  id: string;
  videoUrl: string; // Blob URL for session
  thumbnailUrl?: string;
  trickName: string;
  date: string;
  rank: Rank;
  likes: number;
  views: number;
  isPosted: boolean; // Is shared to profile
}

export interface UserProfile {
  username: string;
  email: string;
  isLoggedIn: boolean;
  selectedSports: Sport[];
  subscription: SubscriptionTier;
  currentRank: Rank;
  rankProgress: number; // 0-100 within current rank
  xp: number;
  sessionsCount: number;
  tricksLogged: number;
  completedTricks: string[]; // List of trick names completed
  recentActivity: Activity[];
  clips: Clip[]; // All uploads
  followers: number;
  following: number;
  bio: string;
  // Tracked stats
  personalBests: {
    speed: number;
    airTime: number;
  };
}

export interface PerformanceSession {
  id: string;
  name: string;
  date: string;
  dataPoints: { time: number; speed: number; height: number }[];
}
