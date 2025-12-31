import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Upload, AlertCircle, Check, Download, FileJson, Database, FileText } from 'lucide-react';
import { BackupData } from '../types';

const ImportData: React.FC = () => {
  const { importData, matches, players, stadiums, settings } = useApp();
  const [jsonContent, setJsonContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setJsonContent(event.target.result as string);
        setStatus('idle'); // Reset status on new file load
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      
      // Validation: Check for legacy array (matches only) or new BackupData object
      if (Array.isArray(parsed)) {
          // Legacy support: Convert to BackupData structure on the fly
          const legacyBackup: BackupData = {
              version: "1.0",
              timestamp: new Date().toISOString(),
              matches: parsed,
              players: [], // Won't overwrite existing if empty in context logic logic usually, but here we pass empty. 
                           // Context logic merges, so empty array is safe.
              stadiums: [],
              settings: settings // Keep current settings
          };
          importData(legacyBackup);
      } else if (parsed.players && parsed.matches) {
          // Valid Full Backup
          importData(parsed as BackupData);
      } else {
          throw new Error("Invalid file format");
      }

      setStatus('success');
      setJsonContent('');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleExportJSON = () => {
      const backup: BackupData = {
          version: "2.0",
          timestamp: new Date().toISOString(),
          players,
          matches,
          stadiums,
          settings
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `pitchperfect_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode); 
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const handleExportCSV = () => {
      // Create CSV Header
      const headers = ["Match ID", "Date", "Type", "Stadium", "Home Team", "Away Team", "Score Home", "Score Away", "Winner"];
      
      // Map Matches to Rows
      const rows = matches.map(m => {
          const winner = m.scoreA > m.scoreB ? m.teamAName : m.scoreB > m.scoreA ? m.teamBName : "Draw";
          return [
              m.id,
              new Date(m.date).toLocaleDateString(),
              m.type,
              m.stadiumName || m.stadium,
              m.teamAName,
              m.teamBName,
              m.scoreA,
              m.scoreB,
              winner
          ].map(field => `"${field}"`).join(","); // Quote fields to handle commas in names
      });

      const csvContent = [headers.join(","), ...rows].join("\n");
      const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
      
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `pitchperfect_matches_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(downloadAnchorNode); 
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-3">
         <div className="p-3 bg-pitch-100 dark:bg-pitch-900/30 text-pitch-600 rounded-xl">
            <Database size={32} />
         </div>
         <div>
            <h2 className="text-3xl font-bold dark:text-white">Data Management</h2>
            <p className="text-gray-500 dark:text-gray-400">Backup your entire team history or export for analysis.</p>
         </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* IMPORT SECTION */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                    <Upload size={20} className="text-pitch-600"/> Import Backup
                </h3>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer relative mb-6">
                <input 
                    type="file" 
                    accept=".json"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <div className="flex flex-col items-center pointer-events-none">
                    <div className="bg-pitch-50 dark:bg-pitch-900/30 p-4 rounded-full text-pitch-600 mb-4">
                        <Upload size={32} />
                    </div>
                    <span className="font-bold text-lg dark:text-white">Drop JSON file here</span>
                    <span className="text-sm text-gray-500 mt-2">Supports Full Backup v2.0</span>
                </div>
            </div>

            {jsonContent && (
            <div className="flex-1 flex flex-col">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-xs text-gray-600 dark:text-gray-400 max-h-40 overflow-auto mb-4 border border-gray-200 dark:border-gray-700">
                    {jsonContent.slice(0, 500)}...
                </div>
                <button 
                onClick={handleImport}
                className="w-full bg-pitch-600 hover:bg-pitch-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
                >
                Restore Data
                </button>
            </div>
            )}

            {status === 'success' && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl flex items-center gap-2 border border-green-200 dark:border-green-800">
                <Check size={20} /> 
                <span className="font-medium">System restored successfully!</span>
            </div>
            )}
            
            {status === 'error' && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-2 border border-red-200 dark:border-red-800">
                <AlertCircle size={20} /> 
                <span className="font-medium">Invalid file format.</span>
            </div>
            )}
        </div>

        {/* EXPORT SECTION */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
            <h3 className="text-xl font-bold dark:text-white flex items-center gap-2 mb-4">
                <Download size={20} className="text-blue-500"/> Export Data
            </h3>
            
            <div className="flex-1 space-y-6">
                {/* JSON Export */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="flex gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg h-fit">
                            <FileJson size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold dark:text-white">Full System Backup (JSON)</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                Includes Players, Matches, Venues, Photos, and Settings. Best for restoring data.
                            </p>
                            <button 
                                onClick={handleExportJSON}
                                disabled={matches.length === 0}
                                className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                            >
                                Download JSON
                            </button>
                        </div>
                    </div>
                </div>

                {/* CSV Export */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="flex gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg h-fit">
                            <FileText size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold dark:text-white">Match Report (CSV)</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                Simple spreadsheet of match results. Best for analysis in Excel or Google Sheets.
                            </p>
                            <button 
                                onClick={handleExportCSV}
                                disabled={matches.length === 0}
                                className="text-sm bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                            >
                                Download CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>

      <div className="text-sm text-gray-500 mt-8">
         <p className="font-bold mb-2">JSON Structure Reference (v2.0):</p>
         <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-xs font-mono border border-gray-200 dark:border-gray-700">
{`{
  "version": "2.0",
  "players": [ ... ],
  "matches": [ ... ],
  "stadiums": [ ... ],
  "settings": { ... }
}`}
         </pre>
      </div>
    </div>
  );
};

export default ImportData;