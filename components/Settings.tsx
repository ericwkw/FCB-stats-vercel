import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MatchType, StadiumSize, AgeGroup, Position, PositionEventPoints, InfractionType } from '../types';
import { Save, RotateCcw, Settings as SettingsIcon, Database, Ruler, Users, Target } from 'lucide-react';
import { MATCH_TYPE_WEIGHTS, STADIUM_SIZE_WEIGHTS, BASE_POINTS, AGE_GROUP_MULTIPLIERS, POSITION_POINTS } from '../constants';
import { useToast } from '../context/ToastContext';

const Settings: React.FC = () => {
  const { settings, updateSettings, resetData } = useApp();
  const { showToast } = useToast();
  
  // -- RULES STATE --
  const [localSettings, setLocalSettings] = useState(settings);
  useEffect(() => { setLocalSettings(settings); }, [settings]);

  // -- RULES HANDLERS --
  const handleSaveSettings = () => {
    updateSettings(localSettings);
    showToast('Configuration saved. Stats recalculated.', 'success');
  };

  const handleResetDefaults = () => {
    if (confirm('Reset scoring weights to defaults?')) {
        const defaults = {
            matchTypeWeights: { ...MATCH_TYPE_WEIGHTS },
            stadiumSizeWeights: { ...STADIUM_SIZE_WEIGHTS },
            ageGroupMultipliers: { ...AGE_GROUP_MULTIPLIERS },
            positionPoints: { ...POSITION_POINTS },
            basePoints: { ...BASE_POINTS },
            infractionPoints: { ...settings.infractionPoints } // Keep existing infractions or reset? User asked for defaults.
        };
        setLocalSettings(prev => ({ ...prev, ...defaults }));
        updateSettings({ ...settings, ...defaults });
        showToast('Weights reset to defaults.', 'info');
    }
  };

  const updateMatchTypeWeight = (type: MatchType, val: string) => {
    setLocalSettings(prev => ({ ...prev, matchTypeWeights: { ...prev.matchTypeWeights, [type]: parseFloat(val) || 0 } }));
  };

  const updateStadiumWeight = (size: StadiumSize, val: string) => {
    setLocalSettings(prev => ({ ...prev, stadiumSizeWeights: { ...prev.stadiumSizeWeights, [size]: parseFloat(val) || 0 } }));
  };

  const updateAgeGroupMultiplier = (age: AgeGroup, val: string) => {
    setLocalSettings(prev => ({ ...prev, ageGroupMultipliers: { ...prev.ageGroupMultipliers, [age]: parseFloat(val) || 0 } }));
  };

  const updatePositionPoint = (pos: Position, event: keyof PositionEventPoints, val: string) => {
      setLocalSettings(prev => ({
          ...prev,
          positionPoints: {
              ...prev.positionPoints,
              [pos]: {
                  ...prev.positionPoints[pos],
                  [event]: parseFloat(val) || 0
              }
          }
      }));
  };

  const updateBasePoint = (key: keyof typeof BASE_POINTS, val: string) => {
    setLocalSettings(prev => ({ ...prev, basePoints: { ...prev.basePoints, [key]: parseFloat(val) || 0 } }));
  };

  const updateInfractionPoint = (type: InfractionType, val: string) => {
    setLocalSettings(prev => ({ ...prev, infractionPoints: { ...prev.infractionPoints, [type]: parseFloat(val) || 0 } }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12 relative">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold dark:text-white flex items-center gap-3">
            <SettingsIcon className="text-pitch-600" size={32} />
            Scoring Rules
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Configure the mathematical algorithms used to calculate player ratings.</p>
      </div>

      <div className="space-y-6 animate-slide-up">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl flex items-start gap-3">
                <Ruler className="text-blue-600 dark:text-blue-400 mt-1" size={20} />
                <div>
                    <h3 className="font-bold text-blue-800 dark:text-blue-300">Weighted Rating Formula</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400/80 mt-1">
                        The app calculates a <strong>Weighted Rating</strong> for each player using the formula:
                        <br/>
                        <code className="bg-white/50 dark:bg-black/20 px-1 py-0.5 rounded mt-1 inline-block">Rating = (Position Points) × (Match Multiplier) × (Stadium Multiplier) × (Age Multiplier)</code>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Multipliers */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-8">
                    <div className="flex justify-between items-center border-b dark:border-gray-700 pb-2">
                        <h3 className="font-bold text-xl dark:text-white">Global Multipliers</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Match Difficulty</h4>
                            <p className="text-xs text-gray-400 mb-3">How tough was this match? We multiply the final rating to reward playing in harder games.</p>
                            <div className="space-y-3">
                                {Object.values(MatchType).map((type) => (
                                    <div key={type} className="flex justify-between items-center">
                                        <label className="text-gray-700 dark:text-gray-300 font-medium">{type.replace('_', ' ')}</label>
                                        <input 
                                            type="number" step="0.1"
                                            value={localSettings.matchTypeWeights[type]}
                                            onChange={(e) => updateMatchTypeWeight(type, e.target.value)}
                                            className="w-20 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-right font-mono dark:text-white focus:ring-2 focus:ring-pitch-500 outline-none"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-gray-700" />

                        <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Pitch Size</h4>
                            <p className="text-xs text-gray-400 mb-3">Big pitches are tiring! We boost the rating for matches played on larger fields.</p>
                            <div className="space-y-3">
                                {Object.values(StadiumSize).map((size) => (
                                    <div key={size} className="flex justify-between items-center">
                                        <label className="text-gray-700 dark:text-gray-300 font-medium">{size}</label>
                                        <input 
                                            type="number" step="0.1"
                                            value={localSettings.stadiumSizeWeights[size]}
                                            onChange={(e) => updateStadiumWeight(size, e.target.value)}
                                            className="w-20 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-right font-mono dark:text-white focus:ring-2 focus:ring-pitch-500 outline-none"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-gray-700" />

                        <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                                <Users size={14} /> Age Group Multipliers
                            </h4>
                            <p className="text-xs text-gray-400 mb-3">To keep things fair, we give a little rating boost to older age groups.</p>
                            <div className="space-y-3">
                                {Object.values(AgeGroup).map((age) => (
                                    <div key={age} className="flex justify-between items-center">
                                        <label className="text-gray-700 dark:text-gray-300 font-medium">{age}</label>
                                        <input 
                                            type="number" step="0.05"
                                            value={localSettings.ageGroupMultipliers[age]}
                                            onChange={(e) => updateAgeGroupMultiplier(age, e.target.value)}
                                            className="w-20 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-right font-mono dark:text-white focus:ring-2 focus:ring-pitch-500 outline-none"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Position Points */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center border-b dark:border-gray-700 pb-2 mb-6">
                        <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">
                            <Target size={20} className="text-pitch-600"/> Position Scoring
                        </h3>
                        <button onClick={handleResetDefaults} className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1">
                            <RotateCcw size={12}/> Reset Defaults
                        </button>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 -mt-4">Different roles, different rewards. Set how many points each position gets for goals, assists, and clean sheets.</p>

                    <div className="space-y-8">
                        {Object.values(Position).map((pos) => (
                            <div key={pos} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                <h4 className="font-bold text-gray-800 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">{pos}</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase mb-1">Goal</label>
                                        <input 
                                            type="number"
                                            value={localSettings.positionPoints[pos]?.GOAL ?? 0}
                                            onChange={(e) => updatePositionPoint(pos, 'GOAL', e.target.value)}
                                            className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-center font-mono dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase mb-1">Assist</label>
                                        <input 
                                            type="number"
                                            value={localSettings.positionPoints[pos]?.ASSIST ?? 0}
                                            onChange={(e) => updatePositionPoint(pos, 'ASSIST', e.target.value)}
                                            className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-center font-mono dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase mb-1">Clean Sheet</label>
                                        <input 
                                            type="number"
                                            value={localSettings.positionPoints[pos]?.CLEAN_SHEET ?? 0}
                                            onChange={(e) => updatePositionPoint(pos, 'CLEAN_SHEET', e.target.value)}
                                            className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-center font-mono dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t dark:border-gray-700">
                         <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Global Events</h4>
                         <p className="text-xs text-gray-400 mb-3">Points that apply to everyone, regardless of where they play.</p>
                         <div className="flex justify-between items-center">
                            <label className="font-medium text-red-600 dark:text-red-400">Own Goal Penalty</label>
                            <input 
                                type="number"
                                value={localSettings.basePoints.OWN_GOAL}
                                onChange={(e) => updateBasePoint('OWN_GOAL', e.target.value)}
                                className="w-20 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg text-right font-mono text-red-700 dark:text-red-400 outline-none"
                            />
                        </div>
                        <div className="flex justify-between items-center mt-3">
                            <label className="font-medium text-gray-700 dark:text-gray-300">Win Bonus</label>
                            <input 
                                type="number"
                                value={localSettings.basePoints.WIN}
                                onChange={(e) => updateBasePoint('WIN', e.target.value)}
                                className="w-20 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-right font-mono dark:text-white outline-none"
                            />
                        </div>
                         <div className="flex justify-between items-center mt-3">
                            <label className="font-medium text-gray-700 dark:text-gray-300">Draw Bonus</label>
                            <input 
                                type="number"
                                value={localSettings.basePoints.DRAW}
                                onChange={(e) => updateBasePoint('DRAW', e.target.value)}
                                className="w-20 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-right font-mono dark:text-white outline-none"
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t dark:border-gray-700">
                         <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Discipline Penalties</h4>
                         <p className="text-xs text-gray-400 mb-3">Points deducted for being late or missing a game. Keep the squad disciplined!</p>
                         <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="font-medium text-red-600 dark:text-red-400">Late Arrival</label>
                                <input 
                                    type="number"
                                    value={localSettings.infractionPoints[InfractionType.LATE]}
                                    onChange={(e) => updateInfractionPoint(InfractionType.LATE, e.target.value)}
                                    className="w-20 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg text-right font-mono text-red-700 dark:text-red-400 outline-none"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <label className="font-medium text-red-600 dark:text-red-400">Last Minute Dropout</label>
                                <input 
                                    type="number"
                                    value={localSettings.infractionPoints[InfractionType.LAST_MINUTE]}
                                    onChange={(e) => updateInfractionPoint(InfractionType.LAST_MINUTE, e.target.value)}
                                    className="w-20 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg text-right font-mono text-red-700 dark:text-red-400 outline-none"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <label className="font-medium text-red-600 dark:text-red-400">No Show</label>
                                <input 
                                    type="number"
                                    value={localSettings.infractionPoints[InfractionType.ABSENCE]}
                                    onChange={(e) => updateInfractionPoint(InfractionType.ABSENCE, e.target.value)}
                                    className="w-20 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg text-right font-mono text-red-700 dark:text-red-400 outline-none"
                                />
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t dark:border-gray-700">
                <button 
                    onClick={resetData}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                    <Database size={18} />
                    Factory Reset App
                </button>
                <button 
                    onClick={handleSaveSettings}
                    className="bg-pitch-600 hover:bg-pitch-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-xl flex items-center gap-3 transition-transform hover:scale-105"
                >
                    <Save size={24} />
                    Save Configuration
                </button>
            </div>
        </div>
    </div>
  );
};

export default Settings;