import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Match, MatchType, StadiumSize, MatchPlayerStats, Position, InfractionType, MatchInfraction } from '../types';
import { Save, Search, Calendar, Clock, LayoutGrid, List, PlusCircle, MinusCircle, Youtube, Edit2, Users, ArrowLeft, AlertTriangle, UserX, X, Gavel, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface MatchManagerProps {
    onCancel?: () => void;
}

const MatchManager: React.FC<MatchManagerProps> = ({ onCancel }) => {
  const { players, addMatch, updateMatch, stadiums, matchToEdit, setMatchToEdit } = useApp();
  const { showToast } = useToast();
  
  const [step, setStep] = useState<1 | 2>(1); // 1: Setup, 2: Stats
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Date & Time
  const [matchDate, setMatchDate] = useState(() => {
    if (matchToEdit) {
        return new Date(matchToEdit.date).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });
  
  const [matchTime, setMatchTime] = useState(() => {
    if (matchToEdit) {
        return new Date(matchToEdit.date).toTimeString().split(' ')[0].slice(0, 5);
    }
    return new Date().toTimeString().split(' ')[0].slice(0, 5);
  });

  // Setup State
  const [matchType, setMatchType] = useState<MatchType>(matchToEdit?.type || MatchType.INTERNAL_FRIENDLY);
  const [youtubeLink, setYoutubeLink] = useState(matchToEdit?.youtubeLink || '');
  
  // Venue State
  const [selectedStadiumId, setSelectedStadiumId] = useState<string>(() => {
      if (matchToEdit) {
          const existingStadium = stadiums.find(s => s.name === matchToEdit.stadiumName && s.size === matchToEdit.stadium);
          return existingStadium ? existingStadium.id : 'custom';
      }
      return 'custom';
  });
  const [customStadiumName, setCustomStadiumName] = useState(() => {
      if (matchToEdit && !stadiums.find(s => s.name === matchToEdit.stadiumName && s.size === matchToEdit.stadium)) {
          return matchToEdit.stadiumName || '';
      }
      return '';
  });
  const [stadiumSize, setStadiumSize] = useState<StadiumSize>(matchToEdit?.stadium || StadiumSize.MEDIUM);

  const [teamAName, setTeamAName] = useState(matchToEdit?.teamAName || 'Team A');
  const [teamBName, setTeamBName] = useState(matchToEdit?.teamBName || 'Team B');
  const [selectedPlayers, setSelectedPlayers] = useState<{ id: string, team: 'A' | 'B' }[]>(() => {
      if (matchToEdit) {
          return matchToEdit.players.map(mp => ({ id: mp.playerId, team: mp.team }));
      }
      return [];
  });
  
  // Search State for Squad Selection
  const [squadSearch, setSquadSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Stats State
  const [otherGoalsA, setOtherGoalsA] = useState(0);
  const [otherGoalsB, setOtherGoalsB] = useState(0);
  const [playerPerformances, setPlayerPerformances] = useState<Record<string, { goals: number, assists: number, ownGoals: number, isGK: boolean, cleanSheet: boolean, position: Position }>>(() => {
      if (matchToEdit) {
          const perfs: Record<string, any> = {};
          matchToEdit.players.forEach(mp => {
              // Find player to get default position if not in match stats (backward compatibility)
              const playerProfile = players.find(p => p.id === mp.playerId);
              perfs[mp.playerId] = {
                  goals: mp.goals,
                  assists: mp.assists,
                  ownGoals: mp.ownGoals || 0,
                  isGK: mp.isGK,
                  cleanSheet: mp.cleanSheet,
                  position: mp.position || playerProfile?.position || Position.MF
              };
          });
          return perfs;
      }
      return {};
  });

  // Infractions State
  const [currentInfractions, setCurrentInfractions] = useState<MatchInfraction[]>(matchToEdit?.infractions || []);
  const [infractionPlayerId, setInfractionPlayerId] = useState('');
  const [infractionType, setInfractionType] = useState<InfractionType>(InfractionType.LATE);

  // Effect to load match data if we are in Edit Mode
  // NOTE: Initial state is now handled by lazy initialization. 
  // We rely on the parent component to remount this component when matchToEdit changes (by using a key).
  // This avoids the "setState in useEffect" anti-pattern.
  
  const clearForm = () => {
    setMatchToEdit(null);
    setStep(1);
    setMatchDate(new Date().toISOString().split('T')[0]);
    setMatchTime(new Date().toTimeString().split(' ')[0].slice(0, 5));
    setMatchType(MatchType.INTERNAL_FRIENDLY);
    setYoutubeLink('');
    setSelectedStadiumId('custom');
    setCustomStadiumName('');
    setStadiumSize(StadiumSize.MEDIUM);
    setTeamAName('Team A');
    setTeamBName('Team B');
    setSelectedPlayers([]);
    setOtherGoalsA(0);
    setOtherGoalsB(0);
    setPlayerPerformances({});
    setCurrentInfractions([]);
    setInfractionPlayerId('');
  };

  const handleCancelClick = () => {
    if (matchToEdit) {
        setShowConfirmModal(true);
    } else if (step === 2) {
        setStep(1);
    } else {
        clearForm();
    }
  };

  const confirmCancel = () => {
    setShowConfirmModal(false);
    setMatchToEdit(null);
    if (onCancel) {
        onCancel();
    } else {
        clearForm();
    }
  };

  const teamAPlayers = selectedPlayers.filter(p => p.team === 'A');
  const teamBPlayers = selectedPlayers.filter(p => p.team === 'B');

  const teamAGoalsFromPlayers = teamAPlayers.reduce((sum, p) => sum + (playerPerformances[p.id]?.goals || 0), 0);
  const teamAAssists = teamAPlayers.reduce((sum, p) => sum + (playerPerformances[p.id]?.assists || 0), 0);
  const teamBOwnGoals = teamBPlayers.reduce((sum, p) => sum + (playerPerformances[p.id]?.ownGoals || 0), 0);
  
  const teamBGoalsFromPlayers = teamBPlayers.reduce((sum, p) => sum + (playerPerformances[p.id]?.goals || 0), 0);
  const teamBAssists = teamBPlayers.reduce((sum, p) => sum + (playerPerformances[p.id]?.assists || 0), 0);
  const teamAOwnGoals = teamAPlayers.reduce((sum, p) => sum + (playerPerformances[p.id]?.ownGoals || 0), 0);
  
  const totalScoreA = teamAGoalsFromPlayers + teamBOwnGoals + otherGoalsA;
  const totalScoreB = teamBGoalsFromPlayers + teamAOwnGoals + otherGoalsB;

  // Validation Logic
  const showAssistWarningA = teamAAssists > totalScoreA;
  const showAssistWarningB = teamBAssists > totalScoreB;

  // Check for Self-Assist: If a player has goals & assists, ensure team total > player goals
  // Logic: A player cannot assist themselves. If they have 1 goal and 1 assist, there must be at least 2 goals.
  // Actually, simpler: If a player has > 0 assists, there must be at least (player.goals + 1) goals in the team?
  // No, if Player A scores 1 and assists 1 (for Player B), total goals = 2.
  // If Player A scores 2 and assists 1 (for Player B), total goals = 3.
  // If Player A scores 1 and assists 0, total goals = 1.
  // So, if player.assists > 0, they must have assisted SOMEONE ELSE.
  // Thus, totalTeamGoals must be > player.goals.
  // If totalTeamGoals == player.goals, and player.assists > 0, it means they assisted themselves (impossible) or assisted a ghost (impossible).
  const selfAssistWarningPlayers = selectedPlayers.filter(p => {
      const stats = playerPerformances[p.id];
      const teamTotal = p.team === 'A' ? totalScoreA : totalScoreB;
      return stats && stats.goals > 0 && stats.assists > 0 && teamTotal <= stats.goals;
  });

  // Check for Invalid Clean Sheet: Clean sheet checked but opponent scored
  const invalidCleanSheetPlayers = selectedPlayers.filter(p => {
      const stats = playerPerformances[p.id];
      const opponentScore = p.team === 'A' ? totalScoreB : totalScoreA;
      return stats && stats.cleanSheet && opponentScore > 0;
  });

  const handleVenueChange = (val: string) => {
    setSelectedStadiumId(val);
    if (val !== 'custom') {
      const stadium = stadiums.find(s => s.id === val);
      if (stadium) {
        setStadiumSize(stadium.size);
      }
    } else {
        setCustomStadiumName('');
    }
  };

  const getEffectiveStadiumName = () => {
     if (selectedStadiumId === 'custom') return customStadiumName || 'Unknown Venue';
     const stadium = stadiums.find(s => s.id === selectedStadiumId);
     return stadium ? stadium.name : 'Unknown Venue';
  };

  const togglePlayerSelection = (playerId: string, team: 'A' | 'B') => {
    setSelectedPlayers(prev => {
      const exists = prev.find(p => p.id === playerId);
      if (exists) {
        if (exists.team === team) {
          return prev.filter(p => p.id !== playerId);
        } else {
          return prev.map(p => p.id === playerId ? { ...p, team } : p);
        }
      } else {
        return [...prev, { id: playerId, team }];
      }
    });
  };

  // Identify players in the selection who are no longer in the squad (deleted players)
  const ghostPlayers = selectedPlayers.filter(sp => !players.find(p => p.id === sp.id));

  const initializePerformance = () => {
    const perfs: typeof playerPerformances = { ...playerPerformances };
    selectedPlayers.forEach(p => {
      if (!perfs[p.id]) {
          const playerProfile = players.find(pl => pl.id === p.id);
          perfs[p.id] = { 
              goals: 0, 
              assists: 0, 
              ownGoals: 0, 
              isGK: playerProfile?.position === Position.GK, // Auto-check GK if it's their main role
              cleanSheet: false,
              position: playerProfile?.position || Position.MF // Default to profile position
          };
      }
    });
    setPlayerPerformances(perfs);
    setStep(2);
  };

  const updateStat = (playerId: string, field: keyof typeof playerPerformances[string], value: any) => {
    // Enforcement: Ensure value is non-negative number if it's a number type
    let finalValue = value;
    if (typeof value === 'number') {
        finalValue = Math.max(0, value || 0);
    }

    setPlayerPerformances(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], [field]: finalValue }
    }));
  };

  const handleAddInfraction = () => {
      if (!infractionPlayerId) return;

      // Check if player already has an infraction
      const existingInfraction = currentInfractions.find(i => i.playerId === infractionPlayerId);
      if (existingInfraction) {
          showToast("This player already has a recorded issue for this match.", "error");
          return;
      }

      // Validation: Check if player is in the squad
      const isParticipating = selectedPlayers.some(p => p.id === infractionPlayerId);

      // Rule 1: Participating players can only be LATE
      if (isParticipating) {
          if (infractionType !== InfractionType.LATE) {
               showToast("Active players can only be marked as 'Late'. If they dropped out, remove them from the squad first.", "error");
               return;
          }
      } 
      // Rule 2: Non-participating players cannot be LATE
      else {
          if (infractionType === InfractionType.LATE) {
              showToast("A player must be in the squad to be marked as 'Late'.", "error");
              return;
          }
      }

      setCurrentInfractions(prev => [...prev, { playerId: infractionPlayerId, type: infractionType }]);
      setInfractionPlayerId('');
  };

  const handleRemoveInfraction = (index: number) => {
      setCurrentInfractions(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinishMatch = () => {
    // Validation
    if (selfAssistWarningPlayers.length > 0) {
        const names = selfAssistWarningPlayers.map(p => players.find(pl => pl.id === p.id)?.name).join(', ');
        showToast(`Logic Error: ${names} cannot assist their own goal.`, "error");
        return;
    }
    if (invalidCleanSheetPlayers.length > 0) {
        const names = invalidCleanSheetPlayers.map(p => players.find(pl => pl.id === p.id)?.name).join(', ');
        showToast(`Logic Error: ${names} cannot have a Clean Sheet because the team conceded goals.`, "error");
        return;
    }

    const combinedDate = new Date(`${matchDate}T${matchTime}`);

    const matchPlayers: MatchPlayerStats[] = selectedPlayers.map(sp => ({
      playerId: sp.id,
      team: sp.team,
      ...playerPerformances[sp.id]
    }));

    const matchData: Match = {
      id: matchToEdit ? matchToEdit.id : Date.now().toString(),
      date: combinedDate.toISOString(),
      type: matchType,
      stadium: stadiumSize,
      stadiumName: getEffectiveStadiumName(),
      youtubeLink: youtubeLink.trim() || undefined,
      teamAName,
      teamBName,
      scoreA: totalScoreA,
      scoreB: totalScoreB,
      players: matchPlayers,
      infractions: currentInfractions
    };

    if (matchToEdit) {
        updateMatch(matchData);
        showToast("Match updated successfully!", "success");
        if (onCancel) onCancel();
    } else {
        addMatch(matchData);
        showToast("Match saved successfully!", "success");
        clearForm();
    }
  };

  const filteredSquadList = players.filter(p => p.name.toLowerCase().includes(squadSearch.toLowerCase()));

  const positionColor = (pos: Position) => {
    switch (pos) {
        case Position.GK: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case Position.DF: return 'bg-blue-100 text-blue-800 border-blue-200';
        case Position.MF: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        case Position.FW: return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 relative">
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border dark:border-gray-700 animate-slide-up transform transition-all">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
               <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                 <AlertTriangle size={24} />
               </div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white">Discard Changes?</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              You are about to cancel your edits. Any unsaved changes to this match record will be lost permanently.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Keep Editing
              </button>
              <button 
                onClick={confirmCancel}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 1 ? (
        <div className="space-y-6 animate-fade-in">
            {matchToEdit && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-3 shadow-sm">
                    <Edit2 className="text-amber-600 dark:text-amber-400 mt-1" size={20} />
                    <div>
                        <h3 className="font-bold text-amber-800 dark:text-amber-300">Editing Match Record</h3>
                        <p className="text-sm text-amber-700 dark:text-amber-400/80">
                            You are modifying a past match. Changes here will update your history and player stats.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                    {matchToEdit ? 'Update Match Logistics' : 'New Match Setup'}
                </h2>
                {matchToEdit && (
                    <button 
                        type="button"
                        onClick={handleCancelClick} 
                        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <ArrowLeft size={16}/> Cancel Edit
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Match Logistics Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold mb-4 dark:text-gray-200 flex items-center gap-2">Match Logistics</h3>
                    <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm text-gray-500 mb-1 flex items-center gap-1"><Calendar size={14} /> Date</label>
                            <input type="date" className="w-full p-2 rounded bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 dark:text-white" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
                        </div>
                        <div className="w-1/3">
                            <label className="block text-sm text-gray-500 mb-1 flex items-center gap-1"><Clock size={14} /> Time</label>
                            <input type="time" className="w-full p-2 rounded bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 dark:text-white" value={matchTime} onChange={(e) => setMatchTime(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Type</label>
                        <select className="w-full p-2 rounded bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 dark:text-white" value={matchType} onChange={(e) => setMatchType(e.target.value as MatchType)}>
                        {Object.values(MatchType).map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Stadium</label>
                        <select className="w-full p-2 rounded bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 dark:text-white mb-2" value={selectedStadiumId} onChange={(e) => handleVenueChange(e.target.value)}>
                        {stadiums.map(s => <option key={s.id} value={s.id}>{s.name} ({s.size})</option>)}
                        <option value="custom">-- Custom Venue --</option>
                        </select>
                        {selectedStadiumId === 'custom' ? (
                        <div className="flex gap-2 animate-fade-in">
                            <input type="text" placeholder="Venue Name" className="flex-1 p-2 rounded bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 dark:text-white" value={customStadiumName} onChange={(e) => setCustomStadiumName(e.target.value)} />
                            <select className="w-32 p-2 rounded bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 dark:text-white" value={stadiumSize} onChange={(e) => setStadiumSize(e.target.value as StadiumSize)}>
                            {Object.values(StadiumSize).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        ) : <div className="text-sm text-gray-400 pl-1">Applied Size: <span className="font-semibold text-pitch-600 dark:text-pitch-400">{stadiumSize}</span></div>}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-500 mb-1 flex items-center gap-1"><Youtube size={14} /> YouTube Link (Optional)</label>
                        <input type="url" placeholder="https://youtu.be/..." className="w-full p-2 rounded bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 dark:text-white" value={youtubeLink} onChange={(e) => setYoutubeLink(e.target.value)} />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                        <label className="block text-sm text-gray-500 mb-1">Team A Name</label>
                        <input className="w-full p-2 rounded bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 dark:text-white" value={teamAName} onChange={e => setTeamAName(e.target.value)} />
                        </div>
                        <div className="flex-1">
                        <label className="block text-sm text-gray-500 mb-1">Team B Name</label>
                        <input className="w-full p-2 rounded bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 dark:text-white" value={teamBName} onChange={e => setTeamBName(e.target.value)} />
                        </div>
                    </div>
                    </div>
                </div>

                {/* Summary & Action Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold mb-4 dark:text-gray-200">Squad Allocation</h3>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="font-bold text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{teamAName}</span>
                                <div className="flex items-center gap-2" title="Assigned Players">
                                    <Users size={14} className="text-gray-400"/>
                                    <span className="font-mono font-bold text-pitch-600 text-sm">{teamAPlayers.length} Players</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{teamBName}</span>
                                <div className="flex items-center gap-2" title="Assigned Players">
                                    <Users size={14} className="text-gray-400"/>
                                    <span className="font-mono font-bold text-pitch-600 text-sm">{teamBPlayers.length} Players</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex justify-between border-b dark:border-gray-700 pb-1"><span>Date:</span><span className="font-medium dark:text-white">{matchDate} {matchTime}</span></div>
                            <div className="flex justify-between border-b dark:border-gray-700 pb-1"><span>Venue:</span><span className="font-medium dark:text-white">{getEffectiveStadiumName()}</span></div>
                            <div className="flex justify-between"><span>Type:</span><span className="font-medium dark:text-white">{matchType.replace('_', ' ')}</span></div>
                        </div>
                    </div>
                    <button 
                        disabled={selectedPlayers.length === 0}
                        onClick={initializePerformance}
                        className={`w-full mt-6 py-3 text-white rounded-xl font-bold transition-colors shadow-lg disabled:shadow-none flex items-center justify-center gap-2 ${matchToEdit ? 'bg-amber-600 hover:bg-amber-500' : 'bg-pitch-600 hover:bg-pitch-500 disabled:bg-gray-400'}`}
                    >
                        {matchToEdit ? <Edit2 size={18} /> : <Save size={18} />}
                        {matchToEdit ? 'Continue to Edit Stats' : 'Start Match Tracking'}
                    </button>
                </div>
            </div>

            {/* Squad Selection Panel */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="font-bold dark:text-gray-200">Assign Players to Squads</h3>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input type="text" placeholder="Search players..." value={squadSearch} onChange={(e) => setSquadSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-pitch-500 outline-none dark:text-white" />
                        </div>
                        <div className="flex bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-pitch-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid size={18} /></button>
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-pitch-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><List size={18} /></button>
                        </div>
                    </div>
                </div>

                {/* GHOST PLAYER SECTION: Allows users to remove deleted players from old matches */}
                {ghostPlayers.length > 0 && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold mb-3">
                            <UserX size={18} />
                            <h4>Released / Unavailable Players</h4>
                        </div>
                        <p className="text-xs text-red-500/80 mb-3">These players were assigned to this match but are no longer in your Squad List. Uncheck them to remove.</p>
                        <div className="flex flex-wrap gap-2">
                            {ghostPlayers.map(p => (
                                <div key={p.id} className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900 shadow-sm">
                                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">?</div>
                                    <div className="text-sm">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">Unknown</span>
                                        <span className="ml-1 text-xs text-gray-400">({p.id.slice(-4)})</span>
                                    </div>
                                    <button 
                                        onClick={() => togglePlayerSelection(p.id, p.team)} 
                                        className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Remove from match"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="max-h-96 overflow-y-auto pr-2">
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" : "space-y-2"}>
                        {filteredSquadList.map(p => {
                            const selection = selectedPlayers.find(sp => sp.id === p.id);
                            const isSelected = !!selection;
                            
                            if (viewMode === 'grid') {
                                return (
                                    <div key={p.id} className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${isSelected ? 'border-pitch-500 bg-pitch-50 dark:bg-pitch-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                        <div className="relative">
                                            <img src={p.avatarUrl} className="w-12 h-12 rounded-full object-cover" alt={p.name} />
                                            <span className={`absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${positionColor(p.position)}`}>{p.position}</span>
                                        </div>
                                        <span className="font-medium text-sm dark:text-white truncate w-full text-center">{p.name}</span>
                                        <div className="flex gap-2 w-full mt-1">
                                            <button onClick={() => togglePlayerSelection(p.id, 'A')} className={`flex-1 text-xs py-1.5 font-medium rounded transition-colors ${selection?.team === 'A' ? 'bg-pitch-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}>Team A</button>
                                            <button onClick={() => togglePlayerSelection(p.id, 'B')} className={`flex-1 text-xs py-1.5 font-medium rounded transition-colors ${selection?.team === 'B' ? 'bg-pitch-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}>Team B</button>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 ${isSelected ? 'border-pitch-500 bg-pitch-50 dark:bg-pitch-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                        <div className="flex items-center gap-4">
                                            <img src={p.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt={p.name} />
                                            <div>
                                                <div className="font-bold dark:text-white text-sm">{p.name}</div>
                                                <div className={`text-[10px] inline-block px-1.5 rounded uppercase font-bold mt-0.5 ${positionColor(p.position)}`}>{p.position}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => togglePlayerSelection(p.id, 'A')} className={`w-20 text-xs py-2 font-medium rounded transition-colors ${selection?.team === 'A' ? 'bg-pitch-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}>Team A</button>
                                            <button onClick={() => togglePlayerSelection(p.id, 'B')} className={`w-20 text-xs py-2 font-medium rounded transition-colors ${selection?.team === 'B' ? 'bg-pitch-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}>Team B</button>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>
                    {filteredSquadList.length === 0 && <div className="text-center py-8 text-gray-400">No players found matching "{squadSearch}"</div>}
                </div>
            </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
            {/* Step 2 Header */}
            {matchToEdit && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-3 shadow-sm mb-6">
                    <Edit2 className="text-amber-600 dark:text-amber-400 mt-1" size={20} />
                    <div>
                        <h3 className="font-bold text-amber-800 dark:text-amber-300">Editing Match Results</h3>
                        <p className="text-sm text-amber-700 dark:text-amber-400/80">Updating goals and stats will modify the historical record for this match.</p>
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold dark:text-white">{matchToEdit ? 'Update Results' : 'Match Result'}</h2>
                <button type="button" onClick={handleCancelClick} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    {matchToEdit ? 'Cancel Edit' : 'Go Back'}
                </button>
            </div>

            {/* Scoreboard Input */}
            <div className={`p-6 sm:p-8 rounded-2xl text-white shadow-lg relative overflow-hidden ${matchToEdit ? 'bg-amber-900' : 'bg-jersey-dark'}`}>
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${matchToEdit ? 'from-amber-500 to-orange-500' : 'from-pitch-500 to-blue-500'}`}></div>
                <div className="flex justify-center items-center gap-4 sm:gap-12 relative z-10">
                    <div className="text-center flex-1">
                        <h3 className={`text-lg sm:text-xl mb-2 font-bold truncate ${matchToEdit ? 'text-amber-400' : 'text-pitch-400'}`}>{teamAName}</h3>
                        <div className="text-5xl sm:text-7xl font-bold tracking-tight">{totalScoreA}</div>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-xs text-gray-400 uppercase tracking-wide">Unassigned</span>
                            <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
                                <button onClick={() => setOtherGoalsA(Math.max(0, otherGoalsA - 1))} className={`p-1 hover:text-white transition-colors ${matchToEdit ? 'text-amber-300' : 'text-pitch-400'}`}><MinusCircle size={18}/></button>
                                <span className="text-lg font-mono w-8 text-center">{otherGoalsA}</span>
                                <button onClick={() => setOtherGoalsA(otherGoalsA + 1)} className={`p-1 hover:text-white transition-colors ${matchToEdit ? 'text-amber-300' : 'text-pitch-400'}`}><PlusCircle size={18}/></button>
                            </div>
                        </div>
                    </div>
                    <div className="text-3xl sm:text-5xl font-thin text-gray-600">-</div>
                    <div className="text-center flex-1">
                        <h3 className={`text-lg sm:text-xl mb-2 font-bold truncate ${matchToEdit ? 'text-amber-400' : 'text-blue-400'}`}>{teamBName}</h3>
                        <div className="text-5xl sm:text-7xl font-bold tracking-tight">{totalScoreB}</div>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-xs text-gray-400 uppercase tracking-wide">Unassigned</span>
                            <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
                                <button onClick={() => setOtherGoalsB(Math.max(0, otherGoalsB - 1))} className={`p-1 hover:text-white transition-colors ${matchToEdit ? 'text-amber-300' : 'text-pitch-400'}`}><MinusCircle size={18}/></button>
                                <span className="text-lg font-mono w-8 text-center">{otherGoalsB}</span>
                                <button onClick={() => setOtherGoalsB(otherGoalsB + 1)} className={`p-1 hover:text-white transition-colors ${matchToEdit ? 'text-amber-300' : 'text-pitch-400'}`}><PlusCircle size={18}/></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Players Stats List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[
                    { team: 'A', name: teamAName, players: teamAPlayers, total: totalScoreA }, 
                    { team: 'B', name: teamBName, players: teamBPlayers, total: totalScoreB }
                ].map((group) => (
                    <div key={group.team} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                            <h3 className={`font-bold text-xl ${matchToEdit ? 'text-amber-600' : 'text-pitch-600'}`}>{group.name} Stats</h3>
                            <div className="text-sm text-gray-400">Total: <span className="text-gray-900 dark:text-white font-bold">{group.total}</span></div>
                        </div>
                        <div className="space-y-4">
                            {group.players.map(sp => {
                                // Fallback for deleted players to prevent crash
                                const p = players.find(x => x.id === sp.id) || {
                                    id: sp.id,
                                    name: 'Unknown Player (Released)',
                                    position: Position.MF,
                                    avatarUrl: `https://ui-avatars.com/api/?name=Unknown&background=gray`
                                };
                                const stats = playerPerformances[p.id];
                                return (
                                    <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                                        <img src={p.avatarUrl} className="w-10 h-10 rounded-full bg-white" alt={p.name} />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold truncate dark:text-white text-sm">{p.name}</div>
                                            <select 
                                                className="text-[10px] p-0.5 mt-0.5 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white outline-none w-20"
                                                value={stats.position}
                                                onChange={(e) => updateStat(p.id, 'position', e.target.value)}
                                            >
                                                {Object.values(Position).map(pos => (
                                                    <option key={pos} value={pos}>{pos}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] text-gray-400 mb-0.5 uppercase">Goals</span>
                                            <input type="number" min="0" className="w-10 p-1 text-center text-sm border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:border-pitch-500 outline-none" value={stats.goals} onChange={e => updateStat(p.id, 'goals', parseInt(e.target.value))} />
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] text-gray-400 mb-0.5 uppercase">Asst</span>
                                            <input type="number" min="0" className="w-10 p-1 text-center text-sm border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:border-pitch-500 outline-none" value={stats.assists} onChange={e => updateStat(p.id, 'assists', parseInt(e.target.value))} />
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] text-red-400 mb-0.5 uppercase font-bold" title="Own Goal">OG</span>
                                            <input type="number" min="0" className="w-10 p-1 text-center text-sm border border-red-200 dark:border-red-900 rounded dark:bg-gray-800 dark:text-white focus:border-red-500 outline-none" value={stats.ownGoals} onChange={e => updateStat(p.id, 'ownGoals', parseInt(e.target.value))} />
                                        </div>
                                        <div className="flex flex-col items-center px-1">
                                            <span className="text-[10px] text-gray-400 mb-0.5 uppercase">GK</span>
                                            <input type="checkbox" className={`w-5 h-5 rounded cursor-pointer ${matchToEdit ? 'accent-amber-600' : 'accent-pitch-600'}`} checked={stats.isGK} onChange={e => updateStat(p.id, 'isGK', e.target.checked)} />
                                        </div>
                                        {stats.isGK && (
                                            <div className="flex flex-col items-center animate-fade-in px-1">
                                                <span className="text-[10px] text-gray-400 mb-0.5 uppercase">CS</span>
                                                <input type="checkbox" className={`w-5 h-5 rounded cursor-pointer ${matchToEdit ? 'accent-amber-600' : 'accent-pitch-600'}`} checked={stats.cleanSheet} onChange={e => updateStat(p.id, 'cleanSheet', e.target.checked)} />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Discipline & Infractions Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4 text-red-600 dark:text-red-400">
                    <Gavel size={24} />
                    <h3 className="font-bold text-xl">Discipline & Penalties</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Track who was late, who dropped out last minute, or who didn't show up. These affect the "Breakfast Club" standings.
                </p>

                <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Player</label>
                        <select 
                            className="w-full p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 dark:text-white"
                            value={infractionPlayerId}
                            onChange={(e) => setInfractionPlayerId(e.target.value)}
                        >
                            <option value="">-- Select Player --</option>
                            {players.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Type</label>
                        <select 
                            className="w-full p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 dark:text-white"
                            value={infractionType}
                            onChange={(e) => setInfractionType(e.target.value as InfractionType)}
                        >
                            <option value={InfractionType.LATE}>Late Arrival</option>
                            <option value={InfractionType.LAST_MINUTE}>Last Minute Dropout</option>
                            <option value={InfractionType.ABSENCE}>No Show</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={handleAddInfraction}
                            disabled={!infractionPlayerId}
                            className="px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Add Record
                        </button>
                    </div>
                </div>

                {currentInfractions.length > 0 ? (
                    <div className="space-y-2">
                        {currentInfractions.map((inf, idx) => {
                            const p = players.find(x => x.id === inf.playerId);
                            let label = '';
                            switch(inf.type) {
                                case InfractionType.LATE: label = 'Late Arrival'; break;
                                case InfractionType.LAST_MINUTE: label = 'Last Minute Dropout'; break;
                                case InfractionType.ABSENCE: label = 'No Show'; break;
                                default: label = inf.type;
                            }
                            
                            return (
                                <div key={idx} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <img src={p?.avatarUrl} className="w-8 h-8 rounded-full bg-gray-200" alt={p?.name} />
                                        <div>
                                            <span className="font-bold dark:text-white block">{p?.name || 'Unknown'}</span>
                                            <span className="text-xs text-red-600 dark:text-red-400 font-bold uppercase">{label}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleRemoveInfraction(idx)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-400 italic text-sm">No issues recorded for this match.</div>
                )}
            </div>

            {(showAssistWarningA || showAssistWarningB || selfAssistWarningPlayers.length > 0 || invalidCleanSheetPlayers.length > 0) && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl flex items-start gap-3 mb-6 animate-fade-in">
                    <AlertTriangle className="text-yellow-600 dark:text-yellow-400 mt-1" size={20} />
                    <div>
                        <h4 className="font-bold text-yellow-800 dark:text-yellow-300">Logic Check</h4>
                        <div className="text-sm text-yellow-700 dark:text-yellow-400/80 space-y-1">
                            {showAssistWarningA && <div>• {teamAName} has more assists ({teamAAssists}) than goals ({totalScoreA}).</div>}
                            {showAssistWarningB && <div>• {teamBName} has more assists ({teamBAssists}) than goals ({totalScoreB}).</div>}
                            {selfAssistWarningPlayers.length > 0 && (
                                <div>• <strong>Self-Assist Error:</strong> A player cannot assist their own goal ({selfAssistWarningPlayers.length} flagged).</div>
                            )}
                            {invalidCleanSheetPlayers.length > 0 && (
                                <div>• <strong>Clean Sheet Error:</strong> Team conceded goals, so Clean Sheet is invalid ({invalidCleanSheetPlayers.length} flagged).</div>
                            )}
                            <div className="mt-2 text-xs font-medium opacity-80">Note: An assist is only awarded if it directly leads to a goal.</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-6">
                <button onClick={handleFinishMatch} className={`text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl flex items-center gap-3 transition-transform hover:scale-105 ${matchToEdit ? 'bg-amber-600 hover:bg-amber-500' : 'bg-pitch-600 hover:bg-pitch-500'}`}>
                    <Save size={24} />
                    {matchToEdit ? 'Update Match Results' : 'Save Match Results'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default MatchManager;
