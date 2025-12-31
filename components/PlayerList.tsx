import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Position, Player } from '../types';
import { generatePlayerAvatar } from '../services/genai';
import { compressBase64 } from '../utils/image';
import { UserPlus, Sparkles, Shirt, LayoutGrid, List, Search, Trash2, Edit2, AlertTriangle, X, Activity } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import PlayerProfile from './PlayerProfile';

const PlayerList: React.FC = () => {
  const { players, addPlayer, updatePlayer, updatePlayerAvatar, deletePlayer } = useApp();
  const { showToast } = useToast();
  
  // Edit/Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formPosition, setFormPosition] = useState<Position>(Position.MF);
  
  // Delete Modal State
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);

  // Profile View State
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);

  // View & AI State
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
      setModalMode('add');
      setFormName('');
      setFormPosition(Position.MF);
      setEditingId(null);
      setIsModalOpen(true);
  };

  const handleOpenEdit = (player: Player) => {
      setModalMode('edit');
      setFormName(player.name);
      setFormPosition(player.position);
      setEditingId(player.id);
      setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (modalMode === 'add') {
        // Use a random realistic portrait by default instead of initials
        const randomId = Math.floor(Math.random() * 99);
        const gender = Math.random() > 0.5 ? 'men' : 'women';
        const avatarUrl = `https://randomuser.me/api/portraits/${gender}/${randomId}.jpg`;

        const newPlayer: Player = {
            id: Date.now().toString(),
            name: formName,
            position: formPosition,
            avatarUrl: avatarUrl
        };
        addPlayer(newPlayer);
        showToast('Player recruited successfully!', 'success');
    } else {
        if (editingId) {
            const existing = players.find(p => p.id === editingId);
            if (existing) {
                updatePlayer({
                    ...existing,
                    name: formName,
                    position: formPosition
                });
                showToast('Player details updated.', 'success');
            }
        }
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (player: Player) => {
      setPlayerToDelete(player);
  };

  const confirmDelete = () => {
    if (playerToDelete) {
      deletePlayer(playerToDelete.id);
      showToast(`${playerToDelete.name} has been released.`, 'info');
      setPlayerToDelete(null);
    }
  };

  const handleGenerateAvatar = async (player: Player) => {
    if (generatingId) return; 
    setGeneratingId(player.id);
    
    try {
        let desc = "";
        if (player.position === Position.GK) desc = "wearing goalkeeper gloves, focused, defending goal";
        else if (player.position === Position.FW) desc = "striking a ball, aggressive striker pose";
        else desc = "dribbling a football, dynamic midfield action";

        const rawImageUrl = await generatePlayerAvatar(player.name, desc);
        
        // CRITICAL: Compress AI image before storing to avoid LocalStorage limits
        // The API returns high-res images which can be 3-4MB. We need < 200KB.
        const compressedUrl = await compressBase64(rawImageUrl);

        updatePlayerAvatar(player.id, compressedUrl);
        showToast('New avatar generated!', 'success');
    } catch (err) {
        console.error(err);
        showToast("Failed to generate avatar. Check API Key.", 'error');
    } finally {
        setGeneratingId(null);
    }
  };

  const handleViewStats = (player: Player) => {
      setViewingPlayer(player);
  };

  const positionColor = (pos: Position) => {
    switch (pos) {
        case Position.GK: return 'bg-yellow-500 text-yellow-50 border-yellow-200';
        case Position.DF: return 'bg-blue-500 text-blue-50 border-blue-200';
        case Position.MF: return 'bg-emerald-500 text-emerald-50 border-emerald-200';
        case Position.FW: return 'bg-red-500 text-red-50 border-red-200';
        default: return 'bg-gray-500';
    }
  };

  const getPosLabel = (pos: Position) => {
      switch(pos) {
          case Position.GK: return { label: 'Goalkeepers', color: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500' };
          case Position.DF: return { label: 'Defenders', color: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500' };
          case Position.MF: return { label: 'Midfielders', color: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500' };
          case Position.FW: return { label: 'Forwards', color: 'text-red-600 dark:text-red-400', border: 'border-red-500' };
      }
  };

  const positions = [Position.GK, Position.DF, Position.MF, Position.FW];

  return (
    <div className="space-y-6 animate-fade-in relative pb-12">
      
      {/* Profile Modal */}
      {viewingPlayer && (
          <PlayerProfile player={viewingPlayer} onClose={() => setViewingPlayer(null)} />
      )}

      {/* Delete Confirmation Modal */}
      {playerToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border dark:border-gray-700 animate-slide-up">
            <div className="flex items-center gap-3 text-red-600 mb-4">
               <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                 <AlertTriangle size={24} />
               </div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white">Release Player?</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
               Are you sure you want to remove <strong>{playerToDelete.name}</strong> from the squad?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
               ⚠️ Matches played by this player will remain in history, but they will be marked as 'Unknown' if edited in the future.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setPlayerToDelete(null)}
                className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg"
              >
                Yes, Release
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold dark:text-white">Squad</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
             <input 
                type="text" 
                placeholder="Find player..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-pitch-500 outline-none dark:text-white"
             />
          </div>

          {/* View Toggle */}
          <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
             <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-pitch-100 text-pitch-600 dark:bg-pitch-900/30 dark:text-pitch-400' : 'text-gray-400 hover:text-gray-600'}`}
             >
                <LayoutGrid size={20} />
             </button>
             <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-pitch-100 text-pitch-600 dark:bg-pitch-900/30 dark:text-pitch-400' : 'text-gray-400 hover:text-gray-600'}`}
             >
                <List size={20} />
             </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="bg-pitch-600 hover:bg-pitch-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <UserPlus size={20} />
            Add Player
          </button>
        </div>
      </div>

      <div className="space-y-10">
        {filteredPlayers.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <p>No players found.</p>
          </div>
        )}

        {positions.map(pos => {
           const group = filteredPlayers.filter(p => p.position === pos);
           if (group.length === 0) return null;
           const style = getPosLabel(pos);

           return (
              <div key={pos} className="animate-fade-in">
                 <div className={`flex items-center gap-3 mb-4 border-b-2 border-opacity-10 dark:border-opacity-20 pb-2 ${style.border.replace('border', 'border-current')}`}>
                    <h3 className={`font-bold text-xl ${style.color}`}>{style.label}</h3>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full font-bold">{group.length}</span>
                 </div>

                 {/* Grid View */}
                 {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {group.map((player) => (
                      <div key={player.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 group">
                        <div 
                            className="relative h-48 bg-gray-100 dark:bg-gray-900 overflow-hidden cursor-pointer"
                            onClick={() => handleViewStats(player)}
                        >
                            <img 
                                src={player.avatarUrl} 
                                alt={player.name} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-2 right-2">
                                <span className={`${positionColor(player.position)} border px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm`}>
                                    {player.position}
                                </span>
                            </div>
                            {/* Hover Overlay Actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleViewStats(player); }}
                                    className="bg-white text-pitch-600 px-4 py-2 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg"
                                >
                                    <Activity size={18} />
                                    View Stats
                                </button>

                                <div className="flex gap-2">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleGenerateAvatar(player); }}
                                      disabled={generatingId === player.id}
                                      className="bg-gray-800/80 text-white p-2 rounded-full font-bold hover:bg-gray-700 transform hover:scale-110 transition-all shadow-md backdrop-blur-sm"
                                      title="Generate Avatar"
                                    >
                                      {generatingId === player.id ? <span className="animate-spin text-xs">⌛</span> : <Sparkles size={16} />}
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(player); }}
                                      className="bg-amber-500 text-white p-2 rounded-full font-bold hover:bg-amber-600 transform hover:scale-110 transition-all shadow-md"
                                      title="Edit"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(player); }}
                                      className="bg-red-500 text-white p-2 rounded-full font-bold hover:bg-red-600 transform hover:scale-110 transition-all shadow-md"
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4" onClick={() => handleViewStats(player)}>
                          <div className="flex justify-between items-start cursor-pointer">
                              <div>
                                  <h3 className="text-xl font-bold dark:text-white truncate max-w-[150px] group-hover:text-pitch-600 transition-colors">{player.name}</h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                      <Shirt size={14} /> #{player.id.slice(-3)}
                                  </p>
                              </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                   <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                      <div className="overflow-x-auto">
                         <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
                               <tr>
                                  <th className="p-4 font-medium">Player</th>
                                  <th className="p-4 font-medium">Position</th>
                                  <th className="p-4 font-medium">ID</th>
                                  <th className="p-4 font-medium text-right">Actions</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                               {group.map(player => (
                                  <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group cursor-pointer" onClick={() => handleViewStats(player)}>
                                     <td className="p-4">
                                        <div className="flex items-center gap-3">
                                           <img src={player.avatarUrl} className="w-10 h-10 rounded-full object-cover bg-gray-100" alt={player.name} />
                                           <span className="font-bold dark:text-white group-hover:text-pitch-600 transition-colors">{player.name}</span>
                                        </div>
                                     </td>
                                     <td className="p-4">
                                        <span className={`${positionColor(player.position)} px-2 py-1 rounded-full text-xs font-bold uppercase`}>
                                           {player.position}
                                        </span>
                                     </td>
                                     <td className="p-4 text-gray-500 dark:text-gray-400 font-mono text-sm">
                                        #{player.id.slice(-4)}
                                     </td>
                                     <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                           <button 
                                              onClick={() => handleViewStats(player)}
                                              title="View Stats"
                                              className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                           >
                                              <Activity size={18} />
                                           </button>
                                           <button 
                                              onClick={() => handleGenerateAvatar(player)}
                                              disabled={generatingId === player.id}
                                              title="Generate Avatar"
                                              className="p-2 text-pitch-600 hover:bg-pitch-50 dark:hover:bg-pitch-900/30 rounded-lg transition-colors"
                                           >
                                              {generatingId === player.id ? <span className="animate-spin text-xs">⌛</span> : <Sparkles size={18} />}
                                           </button>
                                           <button 
                                              onClick={() => handleOpenEdit(player)}
                                              title="Edit Details"
                                              className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                                           >
                                              <Edit2 size={18} />
                                           </button>
                                           <button 
                                              onClick={() => handleDeleteClick(player)}
                                              title="Remove Player"
                                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                           >
                                              <Trash2 size={18} />
                                           </button>
                                        </div>
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </div>
                )}
              </div>
           )
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl border dark:border-gray-700 animate-slide-up relative">
            <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
                <X size={20} />
            </button>
            <h3 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                {modalMode === 'add' ? <UserPlus className="text-pitch-600"/> : <Edit2 className="text-amber-500"/>}
                {modalMode === 'add' ? 'Recruit New Player' : 'Update Player Details'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-pitch-500 outline-none dark:text-white transition-all"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
                <select
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-pitch-500 outline-none dark:text-white transition-all"
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value as Position)}
                >
                  {Object.values(Position).map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 text-white rounded-lg font-medium shadow-md transition-colors ${modalMode === 'add' ? 'bg-pitch-600 hover:bg-pitch-500' : 'bg-amber-600 hover:bg-amber-500'}`}
                >
                  {modalMode === 'add' ? 'Add to Squad' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerList;