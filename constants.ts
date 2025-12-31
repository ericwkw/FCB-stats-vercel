import { MatchType, StadiumSize } from './types';

// Multipliers for calculating "Weighted Rating"
export const MATCH_TYPE_WEIGHTS: Record<MatchType, number> = {
  [MatchType.INTERNAL_FRIENDLY]: 1.0,
  [MatchType.CHALLENGER]: 1.5,
};

export const STADIUM_SIZE_WEIGHTS: Record<StadiumSize, number> = {
  [StadiumSize.SMALL]: 1.0,   // High scoring, less weight per goal
  [StadiumSize.MEDIUM]: 1.2,
  [StadiumSize.LARGE]: 1.5,   // Harder to score, more weight
};

export const BASE_POINTS = {
  GOAL: 5,
  ASSIST: 3,
  OWN_GOAL: -3, // Penalty for own goals
  CLEAN_SHEET: 10,
  WIN: 3,
  DRAW: 1,
};