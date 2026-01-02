import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Player, Match, MatchType, StadiumSize, Position, PlayerStats, SynergyPair, AppSettings, Stadium, BackupData } from '../types';
import { MATCH_TYPE_WEIGHTS, STADIUM_SIZE_WEIGHTS, BASE_POINTS } from '../constants';

interface AppContextType {
  players: Player[];
  matches: Match[];
  stadiums: Stadium[];
  settings: AppSettings;
  matchToEdit: Match | null; // For passing data to MatchManager
  setMatchToEdit: (match: Match | null) => void;
  addPlayer: (player: Player) => void;
  updatePlayer: (player: Player) => void;
  deletePlayer: (id: string) => void;
  updatePlayerAvatar: (id: string, url: string) => void;
  addMatch: (match: Match) => void;
  updateMatch: (updatedMatch: Match) => void;
  deleteMatch: (id: string) => void; // New
  importData: (data: BackupData) => void; // Updated from importMatches
  addStadium: (stadium: Stadium) => void;
  updateStadium: (stadium: Stadium) => void; // New
  deleteStadium: (id: string) => void;
  updateSettings: (newSettings: AppSettings) => void;
  getPlayerStats: (playerId: string) => PlayerStats;
  getAllPlayerStats: () => (Player & PlayerStats)[];
  getBestSynergy: () => SynergyPair[];
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Data
const INITIAL_PLAYERS: Player[] = [
  { id: '1', name: 'Tsubasa', position: Position.MF, avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: '2', name: 'Hyuga', position: Position.FW, avatarUrl: 'https://randomuser.me/api/portraits/men/86.jpg' },
  { id: '3', name: 'Wakabayashi', position: Position.GK, avatarUrl: 'https://randomuser.me/api/portraits/men/11.jpg' },
  { id: '4', name: 'Misaki', position: Position.MF, avatarUrl: 'https://randomuser.me/api/portraits/men/64.jpg' },
];

const INITIAL_STADIUMS: Stadium[] = [
  { id: '1', name: 'Community Center Field', size: StadiumSize.SMALL, mapsUrl: '', imageUrl: '' },
  { id: '2', name: 'Riverside Park', size: StadiumSize.MEDIUM, mapsUrl: '', imageUrl: '' },
  { id: '3', name: 'City Stadium', size: StadiumSize.LARGE, mapsUrl: '', imageUrl: '' },
];

const INITIAL_SETTINGS: AppSettings = {
    matchTypeWeights: { ...MATCH_TYPE_WEIGHTS },
    stadiumSizeWeights: { ...STADIUM_SIZE_WEIGHTS },
    basePoints: { ...BASE_POINTS }
};

// Storage Keys
const KEYS = {
    PLAYERS: 'pp_players_v1',
    MATCHES: 'pp_matches_v1',
    STADIUMS: 'pp_stadiums_v1',
    SETTINGS: 'pp_settings_v1'
};

// Helper to get data safely
const getLocalStorage = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (error) {
        console.warn(`Error reading ${key} from localStorage`, error);
        return fallback;
    }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage or Fallback
  const [players, setPlayers] = useState<Player[]>(() => getLocalStorage(KEYS.PLAYERS, INITIAL_PLAYERS));
  const [matches, setMatches] = useState<Match[]>(() => getLocalStorage(KEYS.MATCHES, []));
  const [stadiums, setStadiums] = useState<Stadium[]>(() => getLocalStorage(KEYS.STADIUMS, INITIAL_STADIUMS));
  
  // Robust Settings Initialization: Deep merge to ensure new keys (like OWN_GOAL) exist if user has old data
  const [settings, setSettings] = useState<AppSettings>(() => {
      const stored = getLocalStorage(KEYS.SETTINGS, INITIAL_SETTINGS);
      return {
          ...INITIAL_SETTINGS,
          ...stored,
          matchTypeWeights: { ...INITIAL_SETTINGS.matchTypeWeights, ...stored.matchTypeWeights },
          stadiumSizeWeights: { ...INITIAL_SETTINGS.stadiumSizeWeights, ...stored.stadiumSizeWeights },
          basePoints: { ...INITIAL_SETTINGS.basePoints, ...stored.basePoints }
      };
  });
  
  const [matchToEdit, setMatchToEdit] = useState<Match | null>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(KEYS.PLAYERS, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem(KEYS.MATCHES, JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem(KEYS.STADIUMS, JSON.stringify(stadiums));
  }, [stadiums]);

  useEffect(() => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const addPlayer = (player: Player) => {
    setPlayers(prev => [...prev, player]);
  };

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
  };

  const deletePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const updatePlayerAvatar = (id: string, url: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, avatarUrl: url } : p));
  };

  const addMatch = (match: Match) => {
    setMatches(prev => [match, ...prev]); // Newest first
  };

  const updateMatch = (updatedMatch: Match) => {
    setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
  };

  const deleteMatch = (id: string) => {
    setMatches(prev => prev.filter(m => m.id !== id));
  };

  const importData = (data: BackupData) => {
      // Restore Players (Merge strategy: ID overwrite)
      if (data.players && Array.isArray(data.players)) {
          setPlayers(prev => {
              const prevMap = new Map(prev.map(p => [p.id, p]));
              data.players.forEach(p => prevMap.set(p.id, p));
              return Array.from(prevMap.values());
          });
      }

      // Restore Stadiums
      if (data.stadiums && Array.isArray(data.stadiums)) {
          setStadiums(prev => {
             const prevMap = new Map(prev.map(s => [s.id, s]));
             data.stadiums.forEach(s => prevMap.set(s.id, s));
             return Array.from(prevMap.values());
          });
      }

      // Restore Settings
      if (data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
      }

      // Restore Matches
      if (data.matches && Array.isArray(data.matches)) {
          setMatches(prev => {
              const prevMap = new Map(prev.map(m => [m.id, m]));
              data.matches.forEach(m => prevMap.set(m.id, m));
              const combined = Array.from(prevMap.values());
              // Sort newest first
              return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          });
      }
  };

  const addStadium = (stadium: Stadium) => {
    setStadiums(prev => [...prev, stadium]);
  };

  const updateStadium = (updatedStadium: Stadium) => {
    setStadiums(prev => prev.map(s => s.id === updatedStadium.id ? updatedStadium : s));
  };

  const deleteStadium = (id: string) => {
    setStadiums(prev => prev.filter(s => s.id !== id));
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  const resetData = () => {
    if(confirm("Are you sure? This will delete all local data and reset to defaults.")) {
        setPlayers(INITIAL_PLAYERS);
        setMatches([]);
        setStadiums(INITIAL_STADIUMS);
        setSettings(INITIAL_SETTINGS);
        localStorage.clear();
        window.location.reload();
    }
  };

  const getPlayerStats = (playerId: string): PlayerStats => {
    const stats: PlayerStats = {
      goals: 0,
      assists: 0,
      ownGoals: 0,
      cleanSheets: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      matchesPlayed: 0,
      weightedRating: 0,
    };

    matches.forEach(match => {
      const pMatch = match.players.find(p => p.playerId === playerId);
      if (!pMatch) return;

      stats.matchesPlayed += 1;
      stats.goals += pMatch.goals;
      stats.assists += pMatch.assists;
      stats.ownGoals += (pMatch.ownGoals || 0); 
      if (pMatch.isGK && pMatch.cleanSheet) stats.cleanSheets += 1;

      // Result
      const isTeamA = pMatch.team === 'A';
      const myScore = isTeamA ? match.scoreA : match.scoreB;
      const oppScore = isTeamA ? match.scoreB : match.scoreA;

      if (myScore > oppScore) stats.wins += 1;
      else if (myScore === oppScore) stats.draws += 1;
      else stats.losses += 1;

      // Weighted Rating Calculation
      const matchMultiplier = (settings.matchTypeWeights[match.type] || 1) * (settings.stadiumSizeWeights[match.stadium] || 1);
      
      let matchRating = 0;
      matchRating += pMatch.goals * settings.basePoints.GOAL;
      matchRating += pMatch.assists * settings.basePoints.ASSIST;
      matchRating += (pMatch.ownGoals || 0) * (settings.basePoints.OWN_GOAL || -3);
      
      if (pMatch.isGK && pMatch.cleanSheet) matchRating += settings.basePoints.CLEAN_SHEET;
      
      if (myScore > oppScore) matchRating += settings.basePoints.WIN;
      else if (myScore === oppScore) matchRating += settings.basePoints.DRAW;

      stats.weightedRating += (matchRating * matchMultiplier);
    });

    return stats;
  };

  const getAllPlayerStats = () => {
    return players.map(p => ({
      ...p,
      ...getPlayerStats(p.id)
    }));
  };

  const getBestSynergy = (): SynergyPair[] => {
    const pairs: Map<string, SynergyPair> = new Map();

    matches.forEach(match => {
      const teamA = match.players.filter(p => p.team === 'A');
      const teamB = match.players.filter(p => p.team === 'B');

      const processTeam = (teamMembers: typeof teamA, isWin: boolean) => {
        for (let i = 0; i < teamMembers.length; i++) {
          for (let j = i + 1; j < teamMembers.length; j++) {
            const p1 = teamMembers[i].playerId;
            const p2 = teamMembers[j].playerId;
            const key = [p1, p2].sort().join('_');
            
            if (!pairs.has(key)) {
              pairs.set(key, { 
                player1Id: p1 < p2 ? p1 : p2, 
                player2Id: p1 < p2 ? p2 : p1, 
                matchesTogether: 0, 
                winsTogether: 0, 
                winRate: 0 
              });
            }

            const current = pairs.get(key)!;
            current.matchesTogether += 1;
            if (isWin) current.winsTogether += 1;
          }
        }
      };

      const winA = match.scoreA > match.scoreB;
      const winB = match.scoreB > match.scoreA;

      processTeam(teamA, winA);
      processTeam(teamB, winB);
    });

    return Array.from(pairs.values())
      .map(pair => ({ ...pair, winRate: pair.matchesTogether > 0 ? (pair.winsTogether / pair.matchesTogether) * 100 : 0 }))
      .filter(pair => pair.matchesTogether >= 2)
      .sort((a, b) => b.winRate - a.winRate);
  };

  return (
    <AppContext.Provider value={{ 
      players, 
      matches, 
      stadiums,
      settings,
      matchToEdit,
      setMatchToEdit,
      addPlayer, 
      updatePlayer,
      deletePlayer,
      updatePlayerAvatar,
      addMatch, 
      updateMatch,
      deleteMatch,
      importData,
      addStadium,
      updateStadium,
      deleteStadium,
      updateSettings,
      getPlayerStats,
      getAllPlayerStats,
      getBestSynergy,
      resetData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};