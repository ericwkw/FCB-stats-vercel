import React from 'react';
import { useApp } from '../context/AppContext';
import { Gavel, AlertTriangle, UserX, Clock, AlertCircle } from 'lucide-react';

const DisciplineStats = () => {
    const { getDisciplineStats } = useApp();
    const stats = getDisciplineStats();
    
    // Sort by total points descending
    const sortedStats = [...stats].sort((a, b) => b.points - a.points);
    
    // Top 4 for Breakfast Club
    const breakfastClub = sortedStats.slice(0, 4).filter(s => s.points > 0);

    return (
        <div className="space-y-8 animate-fade-in pb-12">
             <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                    <Gavel className="text-red-600" /> Discipline & Penalties
                </h2>
            </div>

            {/* Breakfast Club Card */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-8 rounded-3xl border border-red-100 dark:border-red-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <AlertTriangle size={120} className="text-red-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-2 relative z-10">The Breakfast Club</h3>
                <p className="text-red-600 dark:text-red-400 mb-6 max-w-xl relative z-10">
                    The following players have accumulated the most penalty points for lateness, absence, or last-minute dropouts. 
                    The top 4 are currently liable for the team breakfast!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                    {breakfastClub.length > 0 ? breakfastClub.map((stat, index) => (
                        <div key={stat.playerId} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-red-100 dark:border-red-900 flex items-center gap-4">
                            <div className="relative">
                                <img src={stat.player.avatarUrl} alt={stat.player.name} className="w-12 h-12 rounded-full object-cover border-2 border-red-100" />
                                <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md">
                                    #{index + 1}
                                </div>
                            </div>
                            <div>
                                <div className="font-bold dark:text-white">{stat.player.name}</div>
                                <div className="text-red-600 font-bold text-sm">{stat.points} pts</div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-8 text-gray-500 italic bg-white/50 dark:bg-black/20 rounded-xl">
                            No infractions recorded yet. Everyone is safe... for now.
                        </div>
                    )}
                </div>
            </div>

            {/* Full Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-lg dark:text-white">Penalty Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4 text-left">Player</th>
                                <th className="px-6 py-4 text-center text-orange-600"><Clock size={14} className="inline mr-1"/> Late Arrival</th>
                                <th className="px-6 py-4 text-center text-red-500"><AlertCircle size={14} className="inline mr-1"/> Last Minute Dropout</th>
                                <th className="px-6 py-4 text-center text-gray-400"><UserX size={14} className="inline mr-1"/> No Show</th>
                                <th className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">Total Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {sortedStats.map(stat => (
                                <tr key={stat.playerId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={stat.player.avatarUrl} className="w-8 h-8 rounded-full bg-gray-100" alt="" />
                                            <span className="font-medium dark:text-gray-200">{stat.player.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                                        {stat.breakdown.LATE > 0 ? <span className="font-bold text-orange-600">{stat.breakdown.LATE}</span> : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                                        {stat.breakdown.LAST_MINUTE > 0 ? <span className="font-bold text-red-600">{stat.breakdown.LAST_MINUTE}</span> : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                                        {stat.breakdown.ABSENCE > 0 ? <span className="font-bold text-gray-800 dark:text-gray-200">{stat.breakdown.ABSENCE}</span> : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">
                                        {stat.points}
                                    </td>
                                </tr>
                            ))}
                            {sortedStats.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DisciplineStats;
