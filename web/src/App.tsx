import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ContractProvider, useContract } from './context/ContractContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';

import { HomeView } from './views/HomeView';
import { DashboardView } from './views/DashboardView';
import { UploadView } from './views/UploadView';
import { ProcessingView } from './views/ProcessingView';
import { AnalysisView } from './views/AnalysisView';
import { AskAiView } from './views/AskAiView';
import { MyContractsView } from './views/MyContractsView';
import { SettingsView } from './views/SettingsView';

const AppLayout: React.FC = () => {
  const { currentView } = useContract();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'dashboard':
        return <DashboardView />;
      case 'upload':
        return <UploadView />;
      case 'processing':
        return <ProcessingView />;
      case 'analysis':
        return <AnalysisView />;
      case 'ask_ai':
        return <AskAiView />;
      case 'my_contracts':
        return <MyContractsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="page-scrollable">
          {renderCurrentView()}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ContractProvider>
        <AppLayout />
      </ContractProvider>
    </ThemeProvider>
  );
}
