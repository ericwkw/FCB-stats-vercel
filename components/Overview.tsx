import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, Calendar, BarChart2, ArrowRight, Shield, Target, Trophy, MapPin } from 'lucide-react';

interface OverviewProps {
  onNavigate: (tab: string) => void;
}

const Overview: React.FC<OverviewProps> = ({ onNavigate }) => {
  const { settings } = useApp();
  
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-pitch-900 to-jersey-dark rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Level Up Your <span className="text-pitch-500">Football Stats</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Welcome to PitchPerfect. The professional tracker for amateur teams. 
            We calculate weighted ratings based on match difficulty, stadium size, and individual performance.
          </p>
          <button 
            onClick={() => onNavigate('players')}
            className="bg-pitch-600 hover:bg-pitch-500 text-white px-8 py-3 rounded-xl font-bold text-lg transition-transform hover:scale-105 flex items-center gap-2 shadow-lg"
          >
            Get Started <ArrowRight size={20} />
          </button>
        </div>
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10 text-white">
           <Trophy size={400} />
        </div>
      </div>

      {/* How it Works */}
      <div>
        <h2 className="text-2xl font-bold dark:text-white mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('players')}>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold dark:text-white mb-2">1. Build Squad</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Create profiles grouped by position. Generate unique anime-style avatars using AI to give your squad a personality.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('venues')}>
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4">
              <MapPin size={24} />
            </div>
            <h3 className="text-xl font-bold dark:text-white mb-2">2. Manage Venues</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Organize pitches by size (5/7/11-a-side). Upload real photos and add Google Maps links for easy verification.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('matches')}>
            <div className="w-12 h-12 bg-pitch-100 dark:bg-pitch-900/30 text-pitch-600 dark:text-pitch-400 rounded-xl flex items-center justify-center mb-4">
              <Calendar size={24} />
            </div>
            <h3 className="text-xl font-bold dark:text-white mb-2">3. Record Matches</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Log match details. Assign players to teams and track goals, assists, and clean sheets.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('stats')}>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4">
              <BarChart2 size={24} />
            </div>
            <h3 className="text-xl font-bold dark:text-white mb-2">4. Analyze Stats</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              View the leaderboard, compare player forms, and discover the best duo synergies in your team.
            </p>
          </div>
        </div>
      </div>

      {/* Logic Explanation */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold dark:text-white mb-4">How We Calculate Your Rating</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-600 dark:text-gray-300">
           <ul className="space-y-3">
             <li className="flex items-start gap-2">
               <Target size={16} className="mt-1 text-pitch-500" />
               <span><strong>Fair Scoring:</strong> A Defender scoring a goal is a bigger deal than a Striker doing it. We award points differently based on your position.</span>
             </li>
             <li className="flex items-start gap-2">
               <BarChart2 size={16} className="mt-1 text-pitch-500" />
               <span><strong>The Formula:</strong> We take your base points and multiply them by the match difficulty, pitch size, and your age group.</span>
             </li>
             <li className="flex items-start gap-2">
               <Shield size={16} className="mt-1 text-pitch-500" />
               <span><strong>Defense Matters:</strong> Goalkeepers and Defenders get big points for Clean Sheets. But watch out—Own Goals will cost you {settings.basePoints.OWN_GOAL} points!</span>
             </li>
           </ul>
           <ul className="space-y-3">
             <li className="flex items-start gap-2">
               <Trophy size={16} className="mt-1 text-pitch-500" />
               <span><strong>Teamwork Pays Off:</strong> If your team wins, everyone gets a +{settings.basePoints.WIN} point bonus. A draw gets you +{settings.basePoints.DRAW}.</span>
             </li>
             <li className="flex items-start gap-2">
               <Users size={16} className="mt-1 text-pitch-500" />
               <span><strong>Age Adjustments:</strong> To keep the playing field level, we apply a small multiplier based on age groups (e.g. U20s or 40+ veterans).</span>
             </li>
             <li className="flex items-start gap-2">
               <MapPin size={16} className="mt-1 text-pitch-500" />
               <span><strong>Context is Key:</strong> A competitive match on a full-size pitch is worth more than a casual kickabout on a small field.</span>
             </li>
           </ul>
        </div>
      </div>
    </div>
  );
};

export default Overview;