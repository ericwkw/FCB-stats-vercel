import { MatchType, StadiumSize, AgeGroup, InfractionType, Position } from './types';

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

export const AGE_GROUP_MULTIPLIERS: Record<AgeGroup, number> = {
  [AgeGroup.U20]: 1.0,
  [AgeGroup.TWENTIES]: 1.0,
  [AgeGroup.THIRTIES]: 1.1,
  [AgeGroup.FORTIES_PLUS]: 1.25,
};

export const INFRACTION_POINTS: Record<InfractionType, number> = {
  [InfractionType.LATE]: 1,
  [InfractionType.LAST_MINUTE]: 2,
  [InfractionType.ABSENCE]: 3,
};

export const BASE_POINTS = {
  GOAL: 5,
  ASSIST: 3,
  OWN_GOAL: -3, // Penalty for own goals
  CLEAN_SHEET: 10,
  WIN: 3,
  DRAW: 1,
};

export const POSITION_POINTS = {
  [Position.GK]: { GOAL: 10, ASSIST: 5, CLEAN_SHEET: 10 },
  [Position.DF]: { GOAL: 7, ASSIST: 4, CLEAN_SHEET: 5 },
  [Position.MF]: { GOAL: 5, ASSIST: 3, CLEAN_SHEET: 2 },
  [Position.FW]: { GOAL: 4, ASSIST: 3, CLEAN_SHEET: 0 },
};