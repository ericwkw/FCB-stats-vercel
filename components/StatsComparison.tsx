import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Player, PlayerStats, Position } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown, Shield, Trophy, Medal, AlertCircle } from 'lucide-react';
import PlayerProfile from './PlayerProfile';

type SortKey = keyof PlayerStats | 'name' | 'winRate';

interface SortConfig {
  key: SortKey;
  direction: 'asc' | 'desc';
}

const StatsComparison: React.FC = () => {
  const { getAllPlayerStats } = useApp();
  const allStats = getAllPlayerStats();
  
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'weightedRating', direction: 'desc' });
  const [filterPosition, setFilterPosition] = useState<Position | 'ALL'>('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const sortedData = useMemo(() => {
    let data = [...allStats];

    if (filterPosition !== 'ALL') {
      data = data.filter(p => p.position === filterPosition);
    }

    return data.sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof typeof a];
      let bValue: any = b[sortConfig.key as keyof typeof b];

      // Handle calculated fields
      if (sortConfig.key === 'winRate') {
        aValue = a.matchesPlayed > 0 ? a.wins / a.matchesPlayed : 0;
        bValue = b.matchesPlayed > 0 ? b.wins / b.matchesPlayed : 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [allStats, sortConfig, filterPosition]);

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-gray-400 opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="text-pitch-600" /> 
      : <ArrowDown size={14} className="text-pitch-600" />;
  };

  const positionColor = (pos: Position) => {
    switch (pos) {
        case Position.GK: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        case Position.DF: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case Position.MF: return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
        case Position.FW: return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        default: return 'bg-gray-100';
    }
  };

  // Helper to render bars
  const maxGoals = Math.max(...allStats.map(s => s.goals), 1);
  const maxRating = Math.max(...allStats.map(s => s.weightedRating), 1);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {selectedPlayer && (
        <PlayerProfile player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                <Trophy className="text-pitch-600" /> Stats Comparison
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Compare performance metrics across the entire squad.
            </p>
        </div>

        {/* Filter */}
        <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
           {(['ALL', ...Object.values(Position)] as const).map(pos => (
              <button
                 key={pos}
                 onClick={() => setFilterPosition(pos)}
                 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                     filterPosition === pos 
                     ? 'bg-pitch-600 text-white shadow-sm' 
                     : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                 }`}
              >
                  {pos === 'ALL' ? 'All Positions' : pos}
              </button>
           ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                     <th className="p-4 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors w-16 text-center">Rank</th>
                     <th className="p-4 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors" onClick={() => handleSort('name')}>
                        <div className="flex items-center gap-1">Player {getSortIcon('name')}</div>
                     </th>
                     <th className="p-4 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-center w-24">Pos</th>
                     <th className="p-4 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-right" onClick={() => handleSort('matchesPlayed')}>
                        <div className="flex items-center justify-end gap-1">Matches {getSortIcon('matchesPlayed')}</div>
                     </th>
                     <th className="p-4 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-right w-32" onClick={() => handleSort('goals')}>
                        <div className="flex items-center justify-end gap-1">Goals {getSortIcon('goals')}</div>
                     </th>
                     <th className="p-4 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-right" onClick={() => handleSort('assists')}>
                        <div className="flex items-center justify-end gap-1">Assists {getSortIcon('assists')}</div>
                     </th>
                     <th className="p-4 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-right" onClick={() => handleSort('cleanSheets')}>
                        <div className="flex items-center justify-end gap-1">Clean Sheets {getSortIcon('cleanSheets')}</div>
                     </th>
                     <th className="p-4 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-right" onClick={() => handleSort('winRate')}>
                        <div className="flex items-center justify-end gap-1">Win % {getSortIcon('winRate')}</div>
                     </th>
                     <th className="p-4 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-right w-40" onClick={() => handleSort('weightedRating')}>
                        <div className="flex items-center justify-end gap-1">Rating {getSortIcon('weightedRating')}</div>
                     </th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                  {sortedData.map((player, idx) => {
                     const winRate = player.matchesPlayed > 0 ? (player.wins / player.matchesPlayed) * 100 : 0;
                     const isTopRating = sortConfig.key === 'weightedRating' && idx < 3;
                     const rank = idx + 1;

                     return (
                        <tr 
                           key={player.id} 
                           onClick={() => setSelectedPlayer(player)}
                           className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer group"
                        >
                           <td className="p-4 text-center font-bold text-gray-400">
                              {rank === 1 && sortConfig.key === 'weightedRating' ? <Medal size={20} className="text-yellow-500 mx-auto"/> : 
                               rank === 2 && sortConfig.key === 'weightedRating' ? <Medal size={20} className="text-gray-400 mx-auto"/> :
                               rank === 3 && sortConfig.key === 'weightedRating' ? <Medal size={20} className="text-amber-700 mx-auto"/> : rank}
                           </td>
                           <td className="p-4">
                              <div className="flex items-center gap-3">
                                 <img src={player.avatarUrl} className="w-10 h-10 rounded-full object-cover bg-gray-100" alt={player.name} />
                                 <div>
                                    <div className="font-bold dark:text-white group-hover:text-pitch-600 transition-colors">{player.name}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="p-4 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${positionColor(player.position)}`}>
                                 {player.position}
                              </span>
                           </td>
                           <td className="p-4 text-right font-mono text-gray-700 dark:text-gray-300">
                              {player.matchesPlayed}
                           </td>
                           <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <span className="font-bold dark:text-white">{player.goals}</span>
                                 <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(player.goals / maxGoals) * 100}%` }}></div>
                                 </div>
                              </div>
                           </td>
                           <td className="p-4 text-right font-mono text-gray-700 dark:text-gray-300">
                              {player.assists}
                           </td>
                           <td className="p-4 text-right font-mono text-gray-700 dark:text-gray-300">
                              <span className={player.cleanSheets > 0 ? 'text-pitch-600 font-bold' : ''}>{player.cleanSheets}</span>
                           </td>
                           <td className="p-4 text-right">
                              <span className={`font-bold ${winRate >= 50 ? 'text-green-600' : 'text-gray-500'}`}>{winRate.toFixed(0)}%</span>
                           </td>
                           <td className="p-4 text-right">
                               <div className="flex flex-col items-end">
                                   <span className="font-bold text-base dark:text-white">{player.weightedRating.toFixed(1)}</span>
                                   <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-1 max-w-[80px]">
                                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(player.weightedRating / maxRating) * 100}%` }}></div>
                                   </div>
                               </div>
                           </td>
                        </tr>
                     );
                  })}
                  {sortedData.length === 0 && (
                     <tr>
                        <td colSpan={9} className="p-8 text-center text-gray-500">
                           <div className="flex flex-col items-center gap-2">
                              <AlertCircle size={24} />
                              <p>No players match the current filter.</p>
                           </div>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default StatsComparison;