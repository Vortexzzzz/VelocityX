import { Rank, Sport, Trick } from './types';

export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/forever',
    features: ['Ads Included', 'Ranking System', 'Skatepark Map', 'Speed/Air Tracker'],
    access: ['rank', 'map', 'perf'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$1.50',
    period: '/month',
    features: ['NO Ads', 'Ranking System', 'Skatepark Map', 'Speed/Air Time'],
    access: ['rank', 'map', 'perf'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$20.00',
    period: '/year',
    features: ['Everything in Premium', 'Priority Support', 'Exclusive Badges'],
    access: ['rank', 'map', 'perf'],
  }
];

// Databases based on prompt
export const SCOOTER_TRICKS: Trick[] = [
  // Bronze
  { name: 'Bunny Hop', rank: Rank.Bronze, difficultyScore: 1 },
  { name: 'One Footer', rank: Rank.Bronze, difficultyScore: 2 },
  { name: 'One Hander', rank: Rank.Bronze, difficultyScore: 2 },
  { name: 'Magnet', rank: Rank.Bronze, difficultyScore: 3 },
  { name: 'No Footer', rank: Rank.Bronze, difficultyScore: 3 },
  // Silver
  { name: '180', rank: Rank.Silver, difficultyScore: 15 },
  { name: 'Tailwhip', rank: Rank.Silver, difficultyScore: 18 },
  { name: 'X-Up', rank: Rank.Silver, difficultyScore: 16 },
  { name: 'Fakie', rank: Rank.Silver, difficultyScore: 15 },
  { name: 'Manuel', rank: Rank.Silver, difficultyScore: 17 },
  // Gold
  { name: '360', rank: Rank.Gold, difficultyScore: 30 },
  { name: 'Feeble', rank: Rank.Gold, difficultyScore: 32 },
  { name: 'No Hander', rank: Rank.Gold, difficultyScore: 31 },
  { name: 'Heelwhip', rank: Rank.Gold, difficultyScore: 35 },
  { name: 'Barspin', rank: Rank.Gold, difficultyScore: 33 },
  // Platinum
  { name: 'Double Tailwhip', rank: Rank.Platinum, difficultyScore: 50 },
  { name: 'Deckgrab', rank: Rank.Platinum, difficultyScore: 45 },
  { name: '360 Whip', rank: Rank.Platinum, difficultyScore: 55 },
  { name: 'Double Barspin', rank: Rank.Platinum, difficultyScore: 52 },
  { name: 'Fingerwhip', rank: Rank.Platinum, difficultyScore: 53 },
  // Diamond
  { name: '540', rank: Rank.Diamond, difficultyScore: 70 },
  { name: 'Backflip', rank: Rank.Diamond, difficultyScore: 75 },
  { name: 'Triple Whip', rank: Rank.Diamond, difficultyScore: 78 },
  { name: '360 Tuck No Hander', rank: Rank.Diamond, difficultyScore: 72 },
  { name: 'Kickless', rank: Rank.Diamond, difficultyScore: 71 },
  { name: 'Bri Flip', rank: Rank.Diamond, difficultyScore: 76 },
  // Champion
  { name: '720', rank: Rank.Champion, difficultyScore: 85 },
  { name: 'Double Bri Flip', rank: Rank.Champion, difficultyScore: 88 },
  { name: '4 Whips', rank: Rank.Champion, difficultyScore: 87 },
  { name: 'Flair', rank: Rank.Champion, difficultyScore: 86 },
  // Insanity
  { name: 'Infinity', rank: Rank.Insanity, difficultyScore: 95 },
  { name: 'Double Backflip', rank: Rank.Insanity, difficultyScore: 98 },
  { name: '6 Whips', rank: Rank.Insanity, difficultyScore: 97 },
  { name: 'Flair Whip', rank: Rank.Insanity, difficultyScore: 96 },
  { name: 'Barrelroll', rank: Rank.Insanity, difficultyScore: 95 },
];

export const BIKE_TRICKS: Trick[] = [
  // Bronze
  { name: 'Bunny Hop', rank: Rank.Bronze, difficultyScore: 1 },
  { name: 'Wheelie', rank: Rank.Bronze, difficultyScore: 2 },
  { name: 'Manuel', rank: Rank.Bronze, difficultyScore: 3 },
  { name: 'One Hander', rank: Rank.Bronze, difficultyScore: 2 },
  // Silver
  { name: 'X-UP', rank: Rank.Silver, difficultyScore: 15 },
  { name: 'One Footer', rank: Rank.Silver, difficultyScore: 15 },
  { name: 'Tbog', rank: Rank.Silver, difficultyScore: 16 },
  { name: '180', rank: Rank.Silver, difficultyScore: 17 },
  { name: 'Half Whip', rank: Rank.Silver, difficultyScore: 18 },
  // Gold
  { name: '360', rank: Rank.Gold, difficultyScore: 30 },
  { name: 'Barspin', rank: Rank.Gold, difficultyScore: 32 },
  { name: 'Rail Grind', rank: Rank.Gold, difficultyScore: 35 },
  { name: 'Table', rank: Rank.Gold, difficultyScore: 31 },
  // Platinum
  { name: 'Tail Whip', rank: Rank.Platinum, difficultyScore: 50 },
  { name: '50/50 Grind', rank: Rank.Platinum, difficultyScore: 48 },
  { name: 'No-Foot Can', rank: Rank.Platinum, difficultyScore: 52 },
  { name: 'Backflip', rank: Rank.Platinum, difficultyScore: 55 },
  // Diamond
  { name: '540', rank: Rank.Diamond, difficultyScore: 70 },
  { name: 'Double Barspin', rank: Rank.Diamond, difficultyScore: 72 },
  { name: 'Backflip-Barspin', rank: Rank.Diamond, difficultyScore: 78 },
  { name: 'Superman Seat Grab', rank: Rank.Diamond, difficultyScore: 75 },
  { name: 'Frontflip', rank: Rank.Diamond, difficultyScore: 79 },
  // Champion
  { name: 'Superman', rank: Rank.Champion, difficultyScore: 85 },
  { name: 'Triple Tailwhip', rank: Rank.Champion, difficultyScore: 88 },
  { name: 'Double Backflip', rank: Rank.Champion, difficultyScore: 89 },
  // Insanity
  { name: 'Bri Flip', rank: Rank.Insanity, difficultyScore: 95 },
  { name: '720', rank: Rank.Insanity, difficultyScore: 96 },
  { name: 'Double Frontflip', rank: Rank.Insanity, difficultyScore: 99 },
];

export const SKATE_TRICKS: Trick[] = [
  // Bronze
  { name: 'Tic-Tac', rank: Rank.Bronze, difficultyScore: 1 },
  { name: 'Wheelie', rank: Rank.Bronze, difficultyScore: 2 }, // Assuming Manual
  { name: 'Ollie', rank: Rank.Bronze, difficultyScore: 5 },
  { name: 'Fakie Kickturn', rank: Rank.Bronze, difficultyScore: 3 },
  // Silver
  { name: 'Carving', rank: Rank.Silver, difficultyScore: 12 },
  { name: 'Drop-In', rank: Rank.Silver, difficultyScore: 15 },
  { name: 'Kickturn', rank: Rank.Silver, difficultyScore: 12 },
  { name: 'Nollie', rank: Rank.Silver, difficultyScore: 18 },
  // Gold
  { name: 'Kickflip', rank: Rank.Gold, difficultyScore: 35 },
  { name: 'Heelflip', rank: Rank.Gold, difficultyScore: 35 },
  { name: '180', rank: Rank.Gold, difficultyScore: 32 },
  { name: 'Boardslide', rank: Rank.Gold, difficultyScore: 33 },
  // Diamond (Skipped Platinum in prompt, mapping to Diamond as requested order)
  { name: 'Inward Heelflip', rank: Rank.Diamond, difficultyScore: 70 },
  { name: '360', rank: Rank.Diamond, difficultyScore: 72 },
  { name: 'Double Kickflip', rank: Rank.Diamond, difficultyScore: 75 },
  { name: 'Impossible', rank: Rank.Diamond, difficultyScore: 78 },
  // Champion
  { name: 'Laserflip', rank: Rank.Champion, difficultyScore: 88 },
  { name: 'Double Heelflip', rank: Rank.Champion, difficultyScore: 85 },
  { name: 'Backflip', rank: Rank.Champion, difficultyScore: 89 }, // Very rare on skate, but in DB
  // Insanity
  { name: 'Ollie 720', rank: Rank.Insanity, difficultyScore: 99 }, // Almost impossible
  { name: 'Hospital Flip', rank: Rank.Insanity, difficultyScore: 95 },
  { name: 'Heelflip 540', rank: Rank.Insanity, difficultyScore: 97 },
];

export const RANK_ORDER = [
  Rank.Bronze,
  Rank.Silver,
  Rank.Gold,
  Rank.Platinum,
  Rank.Diamond,
  Rank.Champion,
  Rank.Insanity
];