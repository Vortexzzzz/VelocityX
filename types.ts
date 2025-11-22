
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
  MountainBike = 'Mountain Bike'
}

export enum SubscriptionTier {
  Free = 'Free',
  Premium = 'Premium',
  Pro = 'Pro'
}

export type ExperienceLevel = 'Beginner' | 'Novice' | 'Expert' | 'Pro';

export interface Trick {
  name: string;
  rank: Rank;
  difficultyScore: number; // Internal score 1-100 for calc
}

export interface Activity {
  id: string;
  type: 'trick' | 'session' | 'rankup' | 'challenge';
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
  sport: Sport; // Add sport context to clips
}

export interface Challenge {
    id: string;
    title: string;
    locationName: string;
    description: string;
    points: number;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Insane';
    sport: Sport;
}

export type ThemeOption = 'default' | 'magma' | 'venom' | 'royal';
export type FontOption = 'inter' | 'roboto' | 'poppins' | 'montserrat';

// Data specific to one sport
export interface SportStats {
    currentRank: Rank;
    rankProgress: number;
    xp: number;
    trickPoints: number;
    tricksLogged: number;
    completedTricks: string[];
}

export interface UserProfile {
  username: string;
  email: string;
  isLoggedIn: boolean;
  
  // Global Settings
  activeSport: Sport; // The currently selected sport context
  availableSports: Sport[]; // Sports the user has onboarded for
  subscription: SubscriptionTier;
  experienceLevel: ExperienceLevel; // New Field
  
  // Data separated by sport
  sportProfiles: Record<Sport, SportStats>;

  // Global Stats (Aggregated or Shared)
  sessionsCount: number;
  recentActivity: Activity[];
  clips: Clip[]; 
  followers: number;
  following: number;
  bio: string;
  friends: string[]; 
  avatarUrl?: string;
  bannerUrl?: string;
  
  // Theme Settings
  theme: ThemeOption;
  font: FontOption;
  customBackgroundUrl?: string;

  // Daily Challenge Tracking
  dailyChallengesCompleted: number;
  dailyChallengeDate: string; 
  
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
