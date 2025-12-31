import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Match, MatchType } from '../types';
import { Calendar, MapPin, Trophy, ChevronDown, ChevronUp, User, Youtube, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface MatchHistoryProps {
  onEdit?: () => void;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ onEdit }) => {
  const { matches, players, setMatchToEdit, deleteMatch } = useApp();
  const { showToast } = useToast();
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);

  // Safely sort matches by date descending
  const sortedMatches = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const toggleExpand = (id: string) => {
    setExpandedMatchId(expandedMatchId === id ? null : id);
  };

  const handleEditClick = (e: React.MouseEvent, match: Match) => {
    e.stopPropagation();
    setMatchToEdit(match);
    if (onEdit) onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent, match: Match) => {
      e.stopPropagation();
      setMatchToDelete(match);
  };

  const confirmDelete = () => {
      if (matchToDelete) {
          deleteMatch(matchToDelete.id);
          showToast('Match deleted successfully.', 'info');
          setMatchToDelete(null);
      }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-400 animate-fade-in">
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
          <Calendar size={48} />
        </div>
        <h3 className="text-xl font-bold dark:text-white">No Matches Recorded</h3>
        <p className="mt-2 text-center max-w-sm">Go to the "New Match" tab to track your first game!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Delete Confirmation Modal */}
      {matchToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border dark:border-gray-700 animate-slide-up">
            <div className="flex items-center gap-3 text-red-600 mb-4">
               <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                 <AlertTriangle size={24} />
               </div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Match?</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
               Are you sure you want to delete the match between <strong>{matchToDelete.teamAName}</strong> and <strong>{matchToDelete.teamBName}</strong>?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
               ⚠️ This action cannot be undone. Player stats from this match will be removed.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setMatchToDelete(null)}
                className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-3xl font-bold dark:text-white flex items-center gap-3">
        <Trophy className="text-pitch-600" /> Match History
      </h2>

      <div className="space-y-4">
        {sortedMatches.map((match) => {
          const isExpanded = expandedMatchId === match.id;
          const winner = match.scoreA > match.scoreB ? 'A' : match.scoreB > match.scoreA ? 'B' : 'Draw';
          
          return (
            <div key={match.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300">
              {/* Match Header Summary */}
              <div 
                onClick={() => toggleExpand(match.id)}
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  
                  {/* Date & Info */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {formatDate(match.date)}
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-bold">
                        {match.type === MatchType.INTERNAL_FRIENDLY ? 'Friendly' : 'Challenger'}
                      </span>
                      <span className="flex items-center gap-1">
                         <MapPin size={12} /> {match.stadiumName || match.stadium}
                      </span>
                      {match.youtubeLink && (
                        <span className="text-red-500 flex items-center gap-0.5" title="Video Available">
                            <Youtube size={12} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Scoreboard */}
                  <div className="flex items-center gap-6">
                    <div className={`text-right ${winner === 'A' ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                      <div className="text-lg md:text-xl">{match.teamAName}</div>
                    </div>
                    <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg px-4 py-2 gap-3">
                      <span className={`text-2xl md:text-3xl font-bold ${match.scoreA > match.scoreB ? 'text-pitch-600' : 'text-gray-700 dark:text-gray-300'}`}>
                        {match.scoreA}
                      </span>
                      <span className="text-gray-400">-</span>
                      <span className={`text-2xl md:text-3xl font-bold ${match.scoreB > match.scoreA ? 'text-pitch-600' : 'text-gray-700 dark:text-gray-300'}`}>
                        {match.scoreB}
                      </span>
                    </div>
                    <div className={`text-left ${winner === 'B' ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                      <div className="text-lg md:text-xl">{match.teamBName}</div>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <div className="hidden md:flex items-center gap-2 text-gray-400">
                    <button 
                        onClick={(e) => handleEditClick(e, match)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors hover:text-amber-500"
                        title="Edit Match Details"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button 
                        onClick={(e) => handleDeleteClick(e, match)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors hover:text-red-500"
                        title="Delete Match"
                    >
                        <Trash2 size={18} />
                    </button>
                    <div className="pl-2 border-l dark:border-gray-700">
                        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-6 animate-slide-down">
                  {/* Action Bar inside expanded view for mobile visibility */}
                  <div className="md:hidden flex justify-end gap-2 mb-4">
                     <button 
                        onClick={(e) => handleEditClick(e, match)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-sm font-medium text-amber-600"
                    >
                        <Edit2 size={14} /> Edit
                    </button>
                    <button 
                        onClick={(e) => handleDeleteClick(e, match)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-sm font-medium text-red-600"
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                  </div>

                  {match.youtubeLink && (
                      <div className="mb-6">
                          <a 
                             href={match.youtubeLink} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-bold text-sm"
                          >
                             <Youtube size={18} /> Watch Highlights
                          </a>
                      </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Team A Stats */}
                    <div>
                      <h4 className="font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase text-sm border-b dark:border-gray-700 pb-2 flex justify-between">
                         <span>{match.teamAName} Squad</span>
                         {winner === 'A' && <Trophy size={16} className="text-yellow-500" />}
                      </h4>
                      <div className="space-y-2">
                        {match.players.filter(p => p.team === 'A').map(mp => {
                          const player = players.find(p => p.id === mp.playerId);
                          return (
                            <div key={mp.playerId} className="flex items-center justify-between p-2 rounded bg-white dark:bg-gray-800 shadow-sm">
                               <div className="flex items-center gap-2">
                                  {player?.avatarUrl ? (
                                     <img src={player.avatarUrl} className="w-8 h-8 rounded-full" />
                                  ) : <User className="w-8 h-8 p-1 bg-gray-100 rounded-full" />}
                                  <div>
                                    <div className="text-sm font-bold dark:text-gray-200">{player?.name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-400">{mp.isGK ? 'GK' : player?.position}</div>
                                  </div>
                               </div>
                               <div className="flex gap-2 text-xs">
                                  {mp.goals > 0 && (
                                    <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                                      {mp.goals} G
                                    </span>
                                  )}
                                  {mp.assists > 0 && (
                                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                                      {mp.assists} A
                                    </span>
                                  )}
                                  {mp.ownGoals > 0 && (
                                    <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                                      {mp.ownGoals} OG
                                    </span>
                                  )}
                                  {mp.cleanSheet && (
                                    <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">
                                      CS
                                    </span>
                                  )}
                               </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Team B Stats */}
                    <div>
                      <h4 className="font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase text-sm border-b dark:border-gray-700 pb-2 flex justify-between">
                         <span>{match.teamBName} Squad</span>
                         {winner === 'B' && <Trophy size={16} className="text-yellow-500" />}
                      </h4>
                      <div className="space-y-2">
                        {match.players.filter(p => p.team === 'B').map(mp => {
                          const player = players.find(p => p.id === mp.playerId);
                          return (
                            <div key={mp.playerId} className="flex items-center justify-between p-2 rounded bg-white dark:bg-gray-800 shadow-sm">
                               <div className="flex items-center gap-2">
                                  {player?.avatarUrl ? (
                                     <img src={player.avatarUrl} className="w-8 h-8 rounded-full" />
                                  ) : <User className="w-8 h-8 p-1 bg-gray-100 rounded-full" />}
                                  <div>
                                    <div className="text-sm font-bold dark:text-gray-200">{player?.name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-400">{mp.isGK ? 'GK' : player?.position}</div>
                                  </div>
                               </div>
                               <div className="flex gap-2 text-xs">
                                  {mp.goals > 0 && (
                                    <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                                      {mp.goals} G
                                    </span>
                                  )}
                                  {mp.assists > 0 && (
                                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                                      {mp.assists} A
                                    </span>
                                  )}
                                  {mp.ownGoals > 0 && (
                                    <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                                      {mp.ownGoals} OG
                                    </span>
                                  )}
                                  {mp.cleanSheet && (
                                    <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">
                                      CS
                                    </span>
                                  )}
                               </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchHistory;