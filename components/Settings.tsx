import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MatchType, StadiumSize } from '../types';
import { Save, RotateCcw, Settings as SettingsIcon, Database, Ruler } from 'lucide-react';
import { MATCH_TYPE_WEIGHTS, STADIUM_SIZE_WEIGHTS, BASE_POINTS } from '../constants';
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
            basePoints: { ...BASE_POINTS }
        };
        setLocalSettings(defaults);
        updateSettings(defaults);
        showToast('Weights reset to defaults.', 'info');
    }
  };

  const updateMatchTypeWeight = (type: MatchType, val: string) => {
    setLocalSettings(prev => ({ ...prev, matchTypeWeights: { ...prev.matchTypeWeights, [type]: parseFloat(val) || 0 } }));
  };

  const updateStadiumWeight = (size: StadiumSize, val: string) => {
    setLocalSettings(prev => ({ ...prev, stadiumSizeWeights: { ...prev.stadiumSizeWeights, [size]: parseFloat(val) || 0 } }));
  };

  const updateBasePoint = (key: keyof typeof BASE_POINTS, val: string) => {
    setLocalSettings(prev => ({ ...prev, basePoints: { ...prev.basePoints, [key]: parseFloat(val) || 0 } }));
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
                        <code className="bg-white/50 dark:bg-black/20 px-1 py-0.5 rounded mt-1 inline-block">Rating = (Base Points) × (Match Multiplier) × (Stadium Multiplier)</code>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Multipliers */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-xl mb-6 dark:text-white border-b dark:border-gray-700 pb-2">Multipliers</h3>
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Match Difficulty</h4>
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
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Pitch Size</h4>
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
                    </div>
                </div>

                {/* Base Points */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center border-b dark:border-gray-700 pb-2 mb-6">
                        <h3 className="font-bold text-xl dark:text-white">Base Points</h3>
                        <button onClick={handleResetDefaults} className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1">
                            <RotateCcw size={12}/> Reset Defaults
                        </button>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: 'Goal Scored', key: 'GOAL' },
                            { label: 'Assist', key: 'ASSIST' },
                            { label: 'Win Bonus', key: 'WIN' },
                            { label: 'Draw Bonus', key: 'DRAW' },
                            { label: 'Clean Sheet (GK)', key: 'CLEAN_SHEET' },
                            { label: 'Own Goal Penalty', key: 'OWN_GOAL', isNegative: true },
                        ].map((item) => (
                            <div key={item.key} className="flex justify-between items-center">
                                <label className={`font-medium ${item.isNegative ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>{item.label}</label>
                                <input 
                                    type="number"
                                    value={localSettings.basePoints[item.key as keyof typeof BASE_POINTS]}
                                    onChange={(e) => updateBasePoint(item.key as keyof typeof BASE_POINTS, e.target.value)}
                                    className={`w-20 p-2 border rounded-lg text-right font-mono outline-none focus:ring-2 focus:ring-pitch-500 ${item.isNegative ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 dark:text-white'}`}
                                />
                            </div>
                        ))}
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