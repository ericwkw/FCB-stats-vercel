
export enum MatchType {
  INTERNAL_FRIENDLY = 'INTERNAL_FRIENDLY',
  CHALLENGER = 'CHALLENGER',
}

export enum StadiumSize {
  SMALL = 'SMALL', // e.g. 5-a-side
  MEDIUM = 'MEDIUM', // e.g. 7-a-side
  LARGE = 'LARGE', // e.g. 11-a-side
}

export enum Position {
  FW = 'Forward',
  MF = 'Midfielder',
  DF = 'Defender',
  GK = 'Goalkeeper',
}

export interface Stadium {
  id: string;
  name: string;
  size: StadiumSize;
  imageUrl?: string; // Optional Base64 image
  mapsUrl?: string; // Optional Google Maps link
}

export interface PlayerStats {
  goals: number;
  assists: number;
  ownGoals: number; // New stat
  cleanSheets: number; // Only relevant if played as GK
  wins: number;
  draws: number;
  losses: number;
  matchesPlayed: number;
  weightedRating: number;
}

export interface Player {
  id: string;
  name: string;
  position: Position;
  avatarUrl?: string;
  isExternal?: boolean; // For ringing players
}

export interface MatchPlayerStats {
  playerId: string;
  team: 'A' | 'B';
  goals: number;
  assists: number;
  ownGoals: number; // New stat
  isGK: boolean;
  cleanSheet: boolean;
}

export interface Match {
  id: string;
  date: string;
  type: MatchType;
  stadium: StadiumSize;
  stadiumName?: string; // Optional name of the venue
  youtubeLink?: string; // Optional video link
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  players: MatchPlayerStats[]; // Records who played in this match and their performance
}

export interface SynergyPair {
  player1Id: string;
  player2Id: string;
  matchesTogether: number;
  winsTogether: number;
  winRate: number;
}

export interface AppSettings {
  matchTypeWeights: Record<MatchType, number>;
  stadiumSizeWeights: Record<StadiumSize, number>;
  basePoints: {
    GOAL: number;
    ASSIST: number;
    OWN_GOAL: number; // New weighting
    CLEAN_SHEET: number;
    WIN: number;
    DRAW: number;
  };
}

// New Interface for Full System Backup
export interface BackupData {
  version: string;
  timestamp: string;
  players: Player[];
  matches: Match[];
  stadiums: Stadium[];
  settings: AppSettings;
}
