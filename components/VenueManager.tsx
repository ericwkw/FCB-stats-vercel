import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StadiumSize, Stadium } from '../types';
import { MapPin, Plus, Trash2, Edit2, X, Search, LayoutGrid, List, AlertTriangle, Upload, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { resizeImage } from '../utils/image';

const VenueManager: React.FC = () => {
  const { stadiums, addStadium, updateStadium, deleteStadium } = useApp();
  const { showToast } = useToast();
  
  // -- VENUE MANAGEMENT STATE --
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Modals
  const [isStadiumModalOpen, setIsStadiumModalOpen] = useState(false);
  const [stadiumToDelete, setStadiumToDelete] = useState<Stadium | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [editingStadiumId, setEditingStadiumId] = useState<string | null>(null);
  const [formStadiumName, setFormStadiumName] = useState('');
  const [formStadiumSize, setFormStadiumSize] = useState<StadiumSize>(StadiumSize.MEDIUM);
  const [formStadiumImage, setFormStadiumImage] = useState('');
  const [formMapsLink, setFormMapsLink] = useState('');

  // -- VENUE HANDLERS --
  const filteredStadiums = stadiums.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleOpenAddStadium = () => {
      setEditingStadiumId(null);
      setFormStadiumName('');
      setFormStadiumSize(StadiumSize.MEDIUM);
      setFormStadiumImage('');
      setFormMapsLink('');
      setIsStadiumModalOpen(true);
  };

  const handleOpenEditStadium = (s: Stadium) => {
      setEditingStadiumId(s.id);
      setFormStadiumName(s.name);
      setFormStadiumSize(s.size);
      setFormStadiumImage(s.imageUrl || '');
      setFormMapsLink(s.mapsUrl || '');
      setIsStadiumModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setIsProcessing(true);
          try {
              // Resize image to prevent LocalStorage quota exceeded errors
              const resizedImage = await resizeImage(file);
              setFormStadiumImage(resizedImage);
          } catch (error) {
              console.error(error);
              showToast("Error processing image.", 'error');
          } finally {
              setIsProcessing(false);
          }
      }
  };

  const handleStadiumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStadiumName.trim()) return;

    const stadiumData = {
        name: formStadiumName,
        size: formStadiumSize,
        imageUrl: formStadiumImage,
        mapsUrl: formMapsLink
    };

    if (editingStadiumId) {
        updateStadium({ id: editingStadiumId, ...stadiumData });
        showToast('Stadium details updated.', 'success');
    } else {
        addStadium({ id: Date.now().toString(), ...stadiumData });
        showToast('New venue added.', 'success');
    }
    setIsStadiumModalOpen(false);
  };

  const confirmDeleteStadium = () => {
      if (stadiumToDelete) {
          deleteStadium(stadiumToDelete.id);
          showToast('Venue removed.', 'info');
          setStadiumToDelete(null);
      }
  };

  const sizeColor = (size: StadiumSize) => {
      switch(size) {
          case StadiumSize.SMALL: return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700';
          case StadiumSize.MEDIUM: return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
          case StadiumSize.LARGE: return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
          default: return 'bg-gray-100';
      }
  };

  const getSizeLabel = (size: StadiumSize) => {
      switch(size) {
          case StadiumSize.SMALL: return 'Small Pitches (5-a-side)';
          case StadiumSize.MEDIUM: return 'Medium Pitches (7-a-side)';
          case StadiumSize.LARGE: return 'Large Pitches (11-a-side)';
      }
  };

  const sizes = [StadiumSize.SMALL, StadiumSize.MEDIUM, StadiumSize.LARGE];

  return (
    <div className="space-y-6 animate-fade-in relative pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold dark:text-white flex items-center gap-3">
               <MapPin className="text-pitch-600" size={32} />
               Venues
           </h2>
           <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your team's playing fields grouped by size.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search venues..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-pitch-500 outline-none dark:text-white"
                />
            </div>
            <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-pitch-100 text-pitch-600 dark:bg-pitch-900/30 dark:text-pitch-400' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid size={20} /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-pitch-100 text-pitch-600 dark:bg-pitch-900/30 dark:text-pitch-400' : 'text-gray-400 hover:text-gray-600'}`}><List size={20} /></button>
            </div>
            <button 
                onClick={handleOpenAddStadium}
                className="bg-pitch-600 hover:bg-pitch-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all"
            >
                <Plus size={20} /> Add Venue
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-10">
          {filteredStadiums.length === 0 && (
              <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  <MapPin className="mx-auto mb-3 opacity-50" size={48} />
                  <p>No venues found. Add one to get started!</p>
              </div>
          )}

          {sizes.map(size => {
              const group = filteredStadiums.filter(s => s.size === size);
              if (group.length === 0) return null;
              
              const headerColorClass = sizeColor(size);

              return (
                  <div key={size} className="animate-fade-in">
                      <div className="flex items-center gap-3 mb-4">
                          <span className={`h-8 w-1 rounded-full ${headerColorClass.split(' ')[0].replace('bg-', 'bg-')}`}></span>
                          <h3 className="text-xl font-bold dark:text-white">{getSizeLabel(size)}</h3>
                          <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs font-bold">
                              {group.length}
                          </span>
                      </div>

                      {viewMode === 'grid' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {group.map(s => (
                                  <div key={s.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 overflow-hidden group relative flex flex-col">
                                      {/* Image / Header */}
                                      <div 
                                        className={`h-40 relative overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-900`}
                                        style={s.imageUrl ? { backgroundImage: `url(${s.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                      >
                                          {!s.imageUrl && (
                                              <div className={`absolute inset-0 opacity-20 ${sizeColor(s.size).split(' ')[0]}`}></div>
                                          )}
                                          {!s.imageUrl && <MapPin className="text-gray-400 w-12 h-12 relative z-10" />}
                                          
                                          {/* Badges */}
                                          <div className="absolute top-2 right-2 z-20 flex gap-1">
                                            {s.mapsUrl && (
                                                <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/90 dark:bg-black/60 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-black/80 transition-colors shadow-sm" title="View on Google Maps" onClick={e => e.stopPropagation()}>
                                                    <ExternalLink size={14} />
                                                </a>
                                            )}
                                            <span className={`px-2 py-1.5 rounded text-xs font-bold uppercase bg-white/90 dark:bg-black/60 backdrop-blur-sm border shadow-sm ${sizeColor(s.size)}`}>
                                                {s.size}
                                            </span>
                                          </div>
                                      </div>

                                      {/* Details */}
                                      <div className="p-5 flex-1 flex flex-col">
                                          <h3 className="font-bold text-xl dark:text-white truncate mb-4">{s.name}</h3>
                                          
                                          <div className="flex gap-2 mt-auto">
                                              <button onClick={() => handleOpenEditStadium(s)} className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 transition-colors flex items-center justify-center gap-2">
                                                  <Edit2 size={16} /> Edit
                                              </button>
                                              <button onClick={() => setStadiumToDelete(s)} className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors flex items-center justify-center gap-2">
                                                  <Trash2 size={16} /> Delete
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                              {group.map(s => (
                                  <div key={s.id} className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                      <div className="flex items-center gap-4">
                                          {/* Thumbnail */}
                                          <div className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 relative ${!s.imageUrl && sizeColor(s.size)}`}>
                                            {s.imageUrl ? (
                                                <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center opacity-50">
                                                    <MapPin size={24} />
                                                </div>
                                            )}
                                          </div>
                                          
                                          <div>
                                              <div className="font-bold dark:text-white text-lg flex items-center gap-2">
                                                  {s.name}
                                                  {s.mapsUrl && (
                                                      <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                                                          <ExternalLink size={14} />
                                                      </a>
                                                  )}
                                              </div>
                                              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{s.size.toLowerCase()} pitch</div>
                                          </div>
                                      </div>
                                      <div className="flex gap-2">
                                          <button onClick={() => handleOpenEditStadium(s)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                                              <Edit2 size={18} />
                                          </button>
                                          <button onClick={() => setStadiumToDelete(s)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                              <Trash2 size={18} />
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              );
          })}
      </div>

      {/* --- MODALS --- */}

      {/* Add/Edit Stadium Modal */}
      {isStadiumModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl border dark:border-gray-700 animate-slide-up relative max-h-[90vh] overflow-y-auto">
            <button 
                onClick={() => setIsStadiumModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
                <X size={20} />
            </button>
            <h3 className="text-2xl font-bold mb-6 dark:text-white flex items-center gap-2">
                {editingStadiumId ? <Edit2 className="text-amber-500"/> : <MapPin className="text-pitch-600"/>}
                {editingStadiumId ? 'Edit Venue' : 'Add New Venue'}
            </h3>
            <form onSubmit={handleStadiumSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Venue Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g., Riverside Park"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-pitch-500 outline-none dark:text-white transition-all"
                  value={formStadiumName}
                  onChange={(e) => setFormStadiumName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pitch Size</label>
                <select
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-pitch-500 outline-none dark:text-white transition-all"
                  value={formStadiumSize}
                  onChange={(e) => setFormStadiumSize(e.target.value as StadiumSize)}
                >
                  {Object.values(StadiumSize).map((s) => (
                    <option key={s} value={s}>{s} Size</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                    Affects rating multiplier. {formStadiumSize === StadiumSize.SMALL ? 'High scoring expected.' : formStadiumSize === StadiumSize.LARGE ? 'Harder to score.' : 'Balanced play.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                    <MapPin size={14}/> Google Maps Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-pitch-500 outline-none dark:text-white transition-all"
                  value={formMapsLink}
                  onChange={(e) => setFormMapsLink(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <ImageIcon size={14}/> Venue Photo (Optional)
                </label>
                
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors relative">
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isProcessing}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    {isProcessing ? (
                        <div className="flex flex-col items-center py-8">
                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pitch-600 mb-2"></div>
                             <span className="text-sm text-gray-500">Compressing image...</span>
                        </div>
                    ) : formStadiumImage ? (
                        <div className="relative h-32 w-full rounded-lg overflow-hidden">
                            <img src={formStadiumImage} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-medium opacity-0 hover:opacity-100 transition-opacity">
                                Change Photo
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-4 text-gray-400">
                            <Upload size={24} className="mb-2"/>
                            <span className="text-sm">Click to upload photo</span>
                            <span className="text-xs opacity-70 mt-1">(Optimized automatically)</span>
                        </div>
                    )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsStadiumModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 text-white rounded-lg font-medium shadow-md transition-colors ${editingStadiumId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-pitch-600 hover:bg-pitch-500'}`}
                >
                  {editingStadiumId ? 'Update Venue' : 'Add Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {stadiumToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border dark:border-gray-700 animate-slide-up">
            <div className="flex items-center gap-3 text-red-600 mb-4">
               <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                 <AlertTriangle size={24} />
               </div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Venue?</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
               Are you sure you want to delete <strong>{stadiumToDelete.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
               ⚠️ Past matches played here will keep the stadium name, but this venue won't appear in future selections.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setStadiumToDelete(null)}
                className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteStadium}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VenueManager;