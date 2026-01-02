import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Player, Match, MatchType, StadiumSize, Position, PlayerStats, SynergyPair, AppSettings, Stadium, BackupData } from '../types';
import { MATCH_TYPE_WEIGHTS, STADIUM_SIZE_WEIGHTS, BASE_POINTS } from '../constants';
import { supabase } from '../services/supabase';

interface AppContextType {
  players: Player[];
  matches: Match[];
  stadiums: Stadium[];
  settings: AppSettings;
  isLoading: boolean;
  matchToEdit: Match | null;
  setMatchToEdit: (match: Match | null) => void;
  addPlayer: (player: Player) => void;
  updatePlayer: (player: Player) => void;
  deletePlayer: (id: string) => void;
  updatePlayerAvatar: (id: string, url: string) => void;
  addMatch: (match: Match) => void;
  updateMatch: (updatedMatch: Match) => void;
  deleteMatch: (id: string) => void;
  importData: (data: BackupData) => void;
  addStadium: (stadium: Stadium) => void;
  updateStadium: (stadium: Stadium) => void;
  deleteStadium: (id: string) => void;
  updateSettings: (newSettings: AppSettings) => void;
  getPlayerStats: (playerId: string) => PlayerStats;
  getAllPlayerStats: () => (Player & PlayerStats)[];
  getBestSynergy: () => SynergyPair[];
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_SETTINGS: AppSettings = {
    matchTypeWeights: { ...MATCH_TYPE_WEIGHTS },
    stadiumSizeWeights: { ...STADIUM_SIZE_WEIGHTS },
    basePoints: { ...BASE_POINTS }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [matchToEdit, setMatchToEdit] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // -- FETCH INITIAL DATA --
  useEffect(() => {
    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Players
            const { data: playersData, error: playersError } = await supabase.from('players').select('*');
            if (playersError) throw playersError;
            
            // Map snake_case from DB to camelCase for app
            const mappedPlayers: Player[] = (playersData || []).map((p: any) => ({
                id: p.id,
                name: p.name,
                position: p.position as Position,
                avatarUrl: p.avatar_url,
                isExternal: p.is_external
            }));

            // 2. Fetch Stadiums
            const { data: stadiumData, error: stadiumError } = await supabase.from('stadiums').select('*');
            if (stadiumError) throw stadiumError;

            const mappedStadiums: Stadium[] = (stadiumData || []).map((s: any) => ({
                id: s.id,
                name: s.name,
                size: s.size as StadiumSize,
                imageUrl: s.image_url,
                mapsUrl: s.maps_url
            }));

            // 3. Fetch Matches
            const { data: matchData, error: matchError } = await supabase.from('matches').select('*');
            if (matchError) throw matchError;

            const mappedMatches: Match[] = (matchData || []).map((m: any) => ({
                id: m.id,
                date: m.date,
                type: m.type as MatchType,
                stadium: m.stadium as StadiumSize,
                stadiumName: m.stadium_name,
                youtubeLink: m.youtube_link,
                teamAName: m.team_a_name,
                teamBName: m.team_b_name,
                scoreA: m.score_a,
                scoreB: m.score_b,
                players: m.players // JSONB column automatically parsed
            })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

            // 4. Fetch Settings
            const { data: settingsData, error: settingsError } = await supabase.from('app_settings').select('config').eq('id', 1).single();
            
            if (settingsData && settingsData.config && Object.keys(settingsData.config).length > 0) {
                 setSettings(prev => ({
                    ...prev,
                    ...settingsData.config,
                    // Deep merge to ensure defaults exist
                    matchTypeWeights: { ...prev.matchTypeWeights, ...(settingsData.config.matchTypeWeights || {}) },
                    stadiumSizeWeights: { ...prev.stadiumSizeWeights, ...(settingsData.config.stadiumSizeWeights || {}) },
                    basePoints: { ...prev.basePoints, ...(settingsData.config.basePoints || {}) }
                 }));
            }

            setPlayers(mappedPlayers);
            setStadiums(mappedStadiums);
            setMatches(mappedMatches);

        } catch (error) {
            console.error("Error loading data from Supabase:", error);
            // Fallback? Or just leave empty state.
        } finally {
            setIsLoading(false);
        }
    };

    fetchAllData();
  }, []);

  // -- PLAYERS --
  const addPlayer = async (player: Player) => {
    // Optimistic Update
    setPlayers(prev => [...prev, player]);

    const { error } = await supabase.from('players').insert({
        id: player.id,
        name: player.name,
        position: player.position,
        avatar_url: player.avatarUrl,
        is_external: player.isExternal
    });
    if (error) console.error("Error adding player:", error);
  };

  const updatePlayer = async (updatedPlayer: Player) => {
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));

    const { error } = await supabase.from('players').update({
        name: updatedPlayer.name,
        position: updatedPlayer.position,
        avatar_url: updatedPlayer.avatarUrl
    }).eq('id', updatedPlayer.id);
    if (error) console.error("Error updating player:", error);
  };

  const deletePlayer = async (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    const { error } = await supabase.from('players').delete().eq('id', id);
    if (error) console.error("Error deleting player:", error);
  };

  const updatePlayerAvatar = async (id: string, url: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, avatarUrl: url } : p));
    const { error } = await supabase.from('players').update({ avatar_url: url }).eq('id', id);
    if (error) console.error("Error updating avatar:", error);
  };

  // -- MATCHES --
  const addMatch = async (match: Match) => {
    setMatches(prev => [match, ...prev]);

    const { error } = await supabase.from('matches').insert({
        id: match.id,
        date: match.date,
        type: match.type,
        stadium: match.stadium,
        stadium_name: match.stadiumName,
        youtube_link: match.youtubeLink,
        team_a_name: match.teamAName,
        team_b_name: match.teamBName,
        score_a: match.scoreA,
        score_b: match.scoreB,
        players: match.players // Sends array as JSONB
    });
    if (error) console.error("Error adding match:", error);
  };

  const updateMatch = async (updatedMatch: Match) => {
    setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));

    const { error } = await supabase.from('matches').update({
        date: updatedMatch.date,
        type: updatedMatch.type,
        stadium: updatedMatch.stadium,
        stadium_name: updatedMatch.stadiumName,
        youtube_link: updatedMatch.youtubeLink,
        team_a_name: updatedMatch.teamAName,
        team_b_name: updatedMatch.teamBName,
        score_a: updatedMatch.scoreA,
        score_b: updatedMatch.scoreB,
        players: updatedMatch.players
    }).eq('id', updatedMatch.id);
    if (error) console.error("Error updating match:", error);
  };

  const deleteMatch = async (id: string) => {
    setMatches(prev => prev.filter(m => m.id !== id));
    const { error } = await supabase.from('matches').delete().eq('id', id);
    if (error) console.error("Error deleting match:", error);
  };

  // -- STADIUMS --
  const addStadium = async (stadium: Stadium) => {
    setStadiums(prev => [...prev, stadium]);

    const { error } = await supabase.from('stadiums').insert({
        id: stadium.id,
        name: stadium.name,
        size: stadium.size,
        image_url: stadium.imageUrl,
        maps_url: stadium.mapsUrl
    });
    if (error) console.error("Error adding stadium:", error);
  };

  const updateStadium = async (updatedStadium: Stadium) => {
    setStadiums(prev => prev.map(s => s.id === updatedStadium.id ? updatedStadium : s));
    
    const { error } = await supabase.from('stadiums').update({
        name: updatedStadium.name,
        size: updatedStadium.size,
        image_url: updatedStadium.imageUrl,
        maps_url: updatedStadium.mapsUrl
    }).eq('id', updatedStadium.id);
    if (error) console.error("Error updating stadium:", error);
  };

  const deleteStadium = async (id: string) => {
    setStadiums(prev => prev.filter(s => s.id !== id));
    const { error } = await supabase.from('stadiums').delete().eq('id', id);
    if (error) console.error("Error deleting stadium:", error);
  };

  // -- SETTINGS --
  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    
    // Upsert settings (assumes ID 1 is the main config)
    const { error } = await supabase.from('app_settings').upsert({
        id: 1,
        config: newSettings
    });
    if (error) console.error("Error saving settings:", error);
  };

  // -- IMPORT/RESET --
  const importData = (data: BackupData) => {
     // NOTE: This now only updates LOCAL state. 
     // A full Supabase import would require looping and inserting.
     // For this "hybrid" request, we will alert the user that Import is local-only temporarily or perform a massive insert.
     // To keep it safe: We will iterate and insert. This might be slow for large datasets.
     
     alert("Importing to cloud database... this may take a moment.");

     // 1. Players
     if(data.players) {
        data.players.forEach(p => addPlayer(p));
     }
     // 2. Stadiums
     if(data.stadiums) {
        data.stadiums.forEach(s => addStadium(s));
     }
     // 3. Matches
     if(data.matches) {
        data.matches.forEach(m => addMatch(m));
     }
     // 4. Settings
     if(data.settings) {
        updateSettings(data.settings);
     }
  };

  const resetData = async () => {
    if(confirm("DANGER: This will wipe all data from the database. Are you sure?")) {
        setIsLoading(true);
        await supabase.from('matches').delete().neq('id', '0');
        await supabase.from('players').delete().neq('id', '0');
        await supabase.from('stadiums').delete().neq('id', '0');
        await supabase.from('app_settings').delete().neq('id', 0);
        
        setPlayers([]);
        setMatches([]);
        setStadiums([]);
        setSettings(INITIAL_SETTINGS);
        setIsLoading(false);
    }
  };

  // -- STATS CALCULATIONS (UNCHANGED LOGIC) --
  const getPlayerStats = (playerId: string): PlayerStats => {
    const stats: PlayerStats = {
      goals: 0, assists: 0, ownGoals: 0, cleanSheets: 0,
      wins: 0, draws: 0, losses: 0, matchesPlayed: 0, weightedRating: 0,
    };

    matches.forEach(match => {
      const pMatch = match.players.find(p => p.playerId === playerId);
      if (!pMatch) return;

      stats.matchesPlayed += 1;
      stats.goals += pMatch.goals;
      stats.assists += pMatch.assists;
      stats.ownGoals += (pMatch.ownGoals || 0); 
      if (pMatch.isGK && pMatch.cleanSheet) stats.cleanSheets += 1;

      const isTeamA = pMatch.team === 'A';
      const myScore = isTeamA ? match.scoreA : match.scoreB;
      const oppScore = isTeamA ? match.scoreB : match.scoreA;

      if (myScore > oppScore) stats.wins += 1;
      else if (myScore === oppScore) stats.draws += 1;
      else stats.losses += 1;

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

  const getAllPlayerStats = () => players.map(p => ({ ...p, ...getPlayerStats(p.id) }));

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
              pairs.set(key, { player1Id: p1 < p2 ? p1 : p2, player2Id: p1 < p2 ? p2 : p1, matchesTogether: 0, winsTogether: 0, winRate: 0 });
            }
            const current = pairs.get(key)!;
            current.matchesTogether += 1;
            if (isWin) current.winsTogether += 1;
          }
        }
      };
      processTeam(teamA, match.scoreA > match.scoreB);
      processTeam(teamB, match.scoreB > match.scoreA);
    });
    return Array.from(pairs.values())
      .map(pair => ({ ...pair, winRate: pair.matchesTogether > 0 ? (pair.winsTogether / pair.matchesTogether) * 100 : 0 }))
      .filter(pair => pair.matchesTogether >= 2)
      .sort((a, b) => b.winRate - a.winRate);
  };

  return (
    <AppContext.Provider value={{ 
      players, matches, stadiums, settings, isLoading,
      matchToEdit, setMatchToEdit,
      addPlayer, updatePlayer, deletePlayer, updatePlayerAvatar,
      addMatch, updateMatch, deleteMatch,
      importData,
      addStadium, updateStadium, deleteStadium,
      updateSettings,
      getPlayerStats, getAllPlayerStats, getBestSynergy, resetData
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