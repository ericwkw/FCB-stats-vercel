import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Award, Shield, Activity } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { getAllPlayerStats, getBestSynergy } = useApp();
  const stats = getAllPlayerStats();
  const synergy = getBestSynergy();

  const sortedByRating = [...stats].sort((a, b) => b.weightedRating - a.weightedRating).slice(0, 5);
  const sortedByGoals = [...stats].sort((a, b) => b.goals - a.goals).slice(0, 5);
  
  const bestDuo = synergy.length > 0 ? synergy[0] : null;
  const bestDuoP1 = bestDuo ? stats.find(p => p.id === bestDuo.player1Id) : null;
  const bestDuoP2 = bestDuo ? stats.find(p => p.id === bestDuo.player2Id) : null;

  return (
    <div className="space-y-6">
      {/* Hero Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-pitch-600 to-pitch-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
           <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
              <Award size={100} />
           </div>
           <h3 className="text-pitch-100 text-sm font-medium mb-1">Top Rated Player</h3>
           {sortedByRating[0] ? (
               <div>
                  <div className="text-3xl font-bold">{sortedByRating[0].name}</div>
                  <div className="text-sm opacity-80 mt-2">Rating: {sortedByRating[0].weightedRating.toFixed(1)}</div>
               </div>
           ) : (
               <div className="text-xl">No Data</div>
           )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-300">
                <TrendingUp size={20} />
             </div>
             <span className="text-gray-500 dark:text-gray-400 font-medium">Top Scorer</span>
           </div>
           {sortedByGoals[0] ? (
               <div>
                  <div className="text-2xl font-bold dark:text-white">{sortedByGoals[0].name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{sortedByGoals[0].goals} Goals</div>
               </div>
           ) : <div className="dark:text-white">--</div>}
        </div>

        {/* Best Duo Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 col-span-1 md:col-span-2">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg text-purple-600 dark:text-purple-300">
                <Activity size={20} />
             </div>
             <span className="text-gray-500 dark:text-gray-400 font-medium">Golden Duo (Highest Win Rate Together)</span>
           </div>
           {bestDuo && bestDuoP1 && bestDuoP2 ? (
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="flex -space-x-4">
                        <img src={bestDuoP1.avatarUrl} className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800" alt={bestDuoP1.name}/>
                        <img src={bestDuoP2.avatarUrl} className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800" alt={bestDuoP2.name}/>
                     </div>
                     <div>
                        <div className="font-bold dark:text-white">{bestDuoP1.name} & {bestDuoP2.name}</div>
                        <div className="text-xs text-gray-500">{bestDuo.matchesTogether} matches together</div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-3xl font-bold text-pitch-600">{bestDuo.winRate.toFixed(0)}%</div>
                     <div className="text-xs text-gray-500">Win Rate</div>
                  </div>
               </div>
           ) : (
               <div className="text-gray-400 italic">Play more matches to unlock synergy stats</div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Chart */}
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2">
            <h3 className="font-bold text-lg mb-6 dark:text-white">Performance Overview</h3>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedByRating} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        cursor={{fill: 'transparent'}}
                    />
                    <Bar dataKey="weightedRating" name="Rating" radius={[4, 4, 0, 0]}>
                      {sortedByRating.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#38bdf8'} />
                      ))}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Leaderboard */}
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Top Scorers</h3>
            <div className="space-y-4">
               {sortedByGoals.map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                     <div className="flex items-center gap-3">
                        <div className={`w-6 text-center font-bold ${idx < 3 ? 'text-pitch-500' : 'text-gray-400'}`}>
                           {idx + 1}
                        </div>
                        <img src={p.avatarUrl} className="w-8 h-8 rounded-full" alt={p.name} />
                        <span className="font-medium dark:text-gray-200">{p.name}</span>
                     </div>
                     <span className="font-bold text-gray-900 dark:text-white">{p.goals}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
