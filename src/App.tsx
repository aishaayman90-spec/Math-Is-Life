import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MascotPiwi } from './components/common/MascotPiwi';
import { FocusModeOverlay } from './components/common/FocusModeOverlay';

import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { AITutorView } from './components/tutor/AITutorView';
import { InteractiveWhiteboard } from './components/whiteboard/InteractiveWhiteboard';
import { SmartRevisionView } from './components/revision/SmartRevisionView';
import { SmartNotesView } from './components/notes/SmartNotesView';
import { StudyAssistantView } from './components/assistant/StudyAssistantView';
import { MathGamesView } from './components/games/MathGamesView';
import { ProgressTrackerView } from './components/progress/ProgressTrackerView';
import { MyLearningSpaceView } from './components/learning-space/MyLearningSpaceView';
import { ProfileSettingsView } from './components/profile/ProfileSettingsView';

const MainLayout: React.FC = () => {
  const { currentSection } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Dynamic Section Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-w-0">
          {currentSection === 'dashboard' && <HomeDashboard />}
          {currentSection === 'tutor' && <AITutorView />}
          {currentSection === 'whiteboard' && <InteractiveWhiteboard />}
          {currentSection === 'revision' && <SmartRevisionView />}
          {currentSection === 'notes' && <SmartNotesView />}
          {currentSection === 'assistant' && <StudyAssistantView />}
          {currentSection === 'games' && <MathGamesView />}
          {currentSection === 'progress' && <ProgressTrackerView />}
          {currentSection === 'learningSpace' && <MyLearningSpaceView />}
          {currentSection === 'settings' && <ProfileSettingsView />}
        </main>
      </div>

      {/* Floating Mascot Piwi */}
      <MascotPiwi />

      {/* Distraction-Free Focus Mode Overlay */}
      <FocusModeOverlay />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
