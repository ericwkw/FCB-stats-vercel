import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Overview from './components/Overview';
import Dashboard from './components/Dashboard';
import PlayerList from './components/PlayerList';
import VenueManager from './components/VenueManager';
import MatchManager from './components/MatchManager';
import MatchHistory from './components/MatchHistory';
import ImportData from './components/ImportData';
import Settings from './components/Settings';
import StatsComparison from './components/StatsComparison';
import DisciplineStats from './components/DisciplineStats';

// Wrapper component to access context for navigation logic
const AppContent = () => {
  const { setMatchToEdit, matchToEdit } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  // Enhanced navigation handler to ensure state consistency
  const handleTabChange = (tab: string) => {
    // If navigating to 'New Match', force clear any pending edit state
    // so the user gets a fresh form.
    if (tab === 'matches') {
        setMatchToEdit(null);
    }
    setActiveTab(tab);
  };

  const handleEditMatch = () => {
    setActiveTab('matches');
  };

  const handleCancelEdit = () => {
    setActiveTab('history');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview onNavigate={handleTabChange} />;
      case 'dashboard': return <Dashboard />;
      case 'stats': return <StatsComparison />;
      case 'discipline': return <DisciplineStats />;
      case 'players': return <PlayerList />;
      case 'venues': return <VenueManager />;
      case 'matches': return <MatchManager key={matchToEdit?.id || 'new'} onCancel={handleCancelEdit} />;
      case 'history': return <MatchHistory onEdit={handleEditMatch} />;
      case 'import': return <ImportData />;
      case 'settings': return <Settings />;
      default: return <Overview onNavigate={handleTabChange} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={handleTabChange}>
      {renderContent()}
    </Layout>
  );
};

function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ToastProvider>
  );
}

export default App;