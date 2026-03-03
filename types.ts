
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

export enum AgeGroup {
  U20 = 'U20',
  TWENTIES = '20-29',
  THIRTIES = '30-39',
  FORTIES_PLUS = '40+',
}

export enum InfractionType {
  LATE = 'LATE',
  LAST_MINUTE = 'LAST_MINUTE',
  ABSENCE = 'ABSENCE',
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
  ageGroup: AgeGroup; // New field
  avatarUrl?: string;
  isExternal?: boolean; // For ringing players
}

export interface MatchPlayerStats {
  playerId: string;
  team: 'A' | 'B';
  position?: Position; // Optional for backward compatibility, defaults to player profile
  goals: number;
  assists: number;
  ownGoals: number;
  isGK: boolean;
  cleanSheet: boolean;
}

export interface MatchInfraction {
  playerId: string;
  type: InfractionType;
}

export interface Match {
  id: string;
  date: string;
  type: MatchType;
  stadium: StadiumSize;
  stadiumName?: string;
  youtubeLink?: string;
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  players: MatchPlayerStats[];
  infractions?: MatchInfraction[];
}

export interface SynergyPair {
  player1Id: string;
  player2Id: string;
  matchesTogether: number;
  winsTogether: number;
  winRate: number;
}

export interface DisciplineStat {
  player: Player;
  points: number;
  breakdown: Record<InfractionType, number>;
}

export interface PositionEventPoints {
  GOAL: number;
  ASSIST: number;
  CLEAN_SHEET: number;
}

export interface AppSettings {
  matchTypeWeights: Record<MatchType, number>;
  stadiumSizeWeights: Record<StadiumSize, number>;
  ageGroupMultipliers: Record<AgeGroup, number>;
  infractionPoints: Record<InfractionType, number>;
  positionPoints: Record<Position, PositionEventPoints>; // New granular scoring
  basePoints: {
    GOAL: number;
    ASSIST: number;
    OWN_GOAL: number;
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
