import React from 'react';
import { Player, Position } from '../types';
import { useApp } from '../context/AppContext';
import { X, Trophy, Target, Footprints, Shield, TrendingUp, Percent, Hash, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface PlayerProfileProps {
    player: Player;
    onClose: () => void;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ player, onClose }) => {
    const { getPlayerStats } = useApp();
    const stats = getPlayerStats(player.id);
    
    const winRate = stats.matchesPlayed > 0 ? ((stats.wins / stats.matchesPlayed) * 100).toFixed(1) : '0';
    const contributionPerMatch = stats.matchesPlayed > 0 ? ((stats.goals + stats.assists) / stats.matchesPlayed).toFixed(2) : '0';
    
    const pieData = [
        { name: 'Wins', value: stats.wins, color: '#10b981' }, // pitch-500
        { name: 'Draws', value: stats.draws, color: '#9ca3af' }, // gray-400
        { name: 'Losses', value: stats.losses, color: '#ef4444' }, // red-500
    ].filter(d => d.value > 0);

    const positionColor = (pos: Position) => {
        switch (pos) {
            case Position.GK: return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
            case Position.DF: return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
            case Position.MF: return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700';
            case Position.FW: return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
            default: return 'bg-gray-100';
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto"
        >
            <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-3xl shadow-2xl border dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh] animate-slide-up relative">
                
                {/* Close Button - Increased Z-index and contrast */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm"
                    aria-label="Close Profile"
                >
                    <X size={24} />
                </button>

                {/* Header Section */}
                <div className="bg-jersey-dark relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-pitch-900/50 to-blue-900/50"></div>
                    <div className="relative p-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
                         <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden bg-white">
                                <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                            </div>
                            <span className={`absolute bottom-0 right-0 px-3 py-1 rounded-full text-xs font-bold uppercase border-2 border-white dark:border-gray-800 shadow-md ${positionColor(player.position)}`}>
                                {player.position}
                            </span>
                         </div>
                         <div className="text-center sm:text-left text-white mb-2">
                            <h2 className="text-4xl font-bold tracking-tight">{player.name}</h2>
                            <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-gray-300 text-sm">
                                <span className="flex items-center gap-1"><Hash size={14}/> ID: {player.id.slice(-4)}</span>
                                <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded"><Trophy size={14} className="text-yellow-400"/> Rating: {stats.weightedRating.toFixed(1)}</span>
                            </div>
                         </div>
                    </div>
                </div>

                {/* Content Scroll Area */}
                <div className="overflow-y-auto p-6 sm:p-8 space-y-8 bg-gray-50 dark:bg-gray-900/50 flex-1">
                    
                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-1">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Matches</span>
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.matchesPlayed}</span>
                            <Footprints size={16} className="text-pitch-500 mt-1" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-1">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Goals</span>
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.goals}</span>
                            <Target size={16} className="text-blue-500 mt-1" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-1">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Assists</span>
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.assists}</span>
                            <TrendingUp size={16} className="text-purple-500 mt-1" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-1">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Win Rate</span>
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">{winRate}%</span>
                            <Percent size={16} className="text-orange-500 mt-1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Win/Loss Chart */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 md:col-span-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Activity size={20} className="text-pitch-600"/> Match Record
                            </h3>
                            <div className="h-48 w-full relative">
                                {stats.matchesPlayed > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={70}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip 
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">No matches played</div>
                                )}
                            </div>
                        </div>

                        {/* Detailed Stats List */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 md:col-span-2">
                             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Activity size={20} className="text-blue-500"/> Performance Metrics
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Goal Contributions per Match</span>
                                    <span className="font-bold text-gray-900 dark:text-white font-mono">{contributionPerMatch}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Clean Sheets (as GK)</span>
                                    <span className="font-bold text-gray-900 dark:text-white font-mono flex items-center gap-2">
                                        {stats.cleanSheets} 
                                        {player.position === Position.GK && <Shield size={14} className="text-pitch-500"/>}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Own Goals</span>
                                    <span className="font-bold text-red-500 font-mono">{stats.ownGoals}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Total Rating Points</span>
                                    <span className="font-bold text-amber-500 font-mono">{stats.weightedRating.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PlayerProfile;