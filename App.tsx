
import React, { useState, useEffect } from 'react';
import { AppView, UserProgress, UserJournal, Chapter, UserRole, SystemSettings } from './types';
import { CHAPTERS } from './constants';
import {
  loadProgress, saveProgress,
  loadJournal, saveJournal,
  clearAllData, loadSettings,
  loadSession, saveSession, clearSession,
  saveSettings
} from './services/storageService';
import { loadChapterFromDB } from './services/databaseService';
import { INITIAL_PROGRESS_DB } from './data/db/progress.db';
import { INITIAL_JOURNAL_DB } from './data/db/journal.db';
import { DEFAULT_SYSTEM_SETTINGS } from './data/system/settings.db';
import { supabase } from './services/supabaseClient';

// Components
import Header from './components/Header';
import MapNavigation from './components/MapNavigation';
import StoryReader from './components/StoryReader';
import Logbook from './components/Logbook';
import BookReader from './components/BookReader';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);

  // View State
  const [view, setView] = useState<AppView>(AppView.STORY);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // DATA STATE (Split DBs)
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS_DB);
  const [journal, setJournal] = useState<UserJournal>(INITIAL_JOURNAL_DB);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);

  const [bookReaderData, setBookReaderData] = useState<Chapter | null>(null);

  // 1. Initial Data Load
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      try {
        // Load Session (Sync)
        const savedSession = loadSession();
        if (savedSession) {
          setIsAuthenticated(true);
          setCurrentUserRole(savedSession);
          if (savedSession === 'El') {
            setView(AppView.ADMIN_DASHBOARD);
          } else {
            setView(AppView.STORY);
          }
        }

        // Load Global Data (Async)
        const [loadedSettings, loadedProgress, loadedJournal] = await Promise.all([
          loadSettings(),
          loadProgress(),
          loadJournal()
        ]);

        setSettings(loadedSettings);
        setProgress(loadedProgress);
        setJournal(loadedJournal);

      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();

    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // 2. Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel('app_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_data' }, (payload) => {
        const { key, value } = payload.new as any;
        if (key === 'progress') setProgress(value);
        if (key === 'journal') setJournal(value);
        if (key === 'settings') setSettings(value);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update DOM for dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Save persistence on change (ONLY FOR ELLA)
  // We keep this to sync local changes to Supabase
  useEffect(() => {
    if (currentUserRole === 'Ella') {
      saveProgress(progress);
      saveJournal(journal);
    }
  }, [progress, journal, currentUserRole]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleLogin = async (role: UserRole) => {
    setCurrentUserRole(role);
    setIsAuthenticated(true);
    saveSession(role); // Save session!

    setIsLoading(true);
    const [p, j] = await Promise.all([loadProgress(), loadJournal()]);
    setProgress(p);
    setJournal(j);
    setIsLoading(false);

    if (role === 'El') {
      setView(AppView.ADMIN_DASHBOARD);
    } else {
      setView(AppView.STORY);
    }
  };

  const handleLogout = () => {
    clearSession(); // Clear session!
    setIsAuthenticated(false);
    setCurrentUserRole(null);
    setView(AppView.STORY);
  };

  // --- ELLA'S INTERACTION HANDLERS ---

  const handleSelectChapter = (id: number) => {
    if (progress.unlockedChapters.includes(id)) {
      setProgress(prev => ({ ...prev, currentChapterId: id }));
    }
  };

  const handleReadChapter = (id: number) => {
    if (progress.unlockedChapters.includes(id)) {
      const fullChapterData = loadChapterFromDB(id);
      if (fullChapterData) {
        setBookReaderData(fullChapterData);
        setProgress(prev => ({ ...prev, currentChapterId: id }));
        setView(AppView.READER);
      }
    }
  };

  const handleChapterComplete = (chapterId: number) => {
    const chapter = CHAPTERS.find(c => c.id === chapterId);
    if (!chapter) return;

    setProgress(prev => {
      const nextId = chapterId + 1;
      const isNewCompletion = !prev.completedChapters.includes(chapterId);

      const canUnlockNext = nextId <= 14 && nextId <= settings.maxUnlockableChapter;

      const newUnlocked = isNewCompletion && canUnlockNext && !prev.unlockedChapters.includes(nextId)
        ? [...prev.unlockedChapters, nextId]
        : prev.unlockedChapters;

      const newCompleted = isNewCompletion
        ? [...prev.completedChapters, chapterId]
        : prev.completedChapters;

      const newFragments = isNewCompletion
        ? [...prev.collectedFragments, chapter.fragmentCode]
        : prev.collectedFragments;

      return {
        ...prev,
        completedChapters: newCompleted,
        unlockedChapters: newUnlocked,
        collectedFragments: newFragments
      };
    });
  };

  const handleNextChapter = () => {
    const nextId = progress.currentChapterId + 1;

    if (nextId <= 14 && nextId <= settings.maxUnlockableChapter) {
      if (progress.unlockedChapters.includes(nextId)) {
        setProgress(prev => ({ ...prev, currentChapterId: nextId }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setView(AppView.MAP);
      }
    } else {
      setView(AppView.LOGBOOK);
    }
  };

  const handleSaveReflection = (chapterId: number, text: string) => {
    setJournal(prev => ({
      ...prev,
      [chapterId]: text
    }));
  };

  const handleAttemptFinal = (code: string) => {
    const allCodesCollected = progress.collectedFragments.length === CHAPTERS.length;
    if (allCodesCollected) {
      alert("¡Has desbloqueado el final!");
      setView(AppView.FINAL);
    } else {
      alert(`Aún te faltan fragmentos.Has recolectado ${progress.collectedFragments.length} de 14.`);
    }
  };

  const activeLandingChapter = CHAPTERS.find(c => c.id === progress.currentChapterId);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper dark:bg-obsidian flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-romance-red border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-serif text-romance-red animate-pulse">Consultando el Archivo de las Almas...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} settings={settings} />;
  }

  if (currentUserRole === 'El') {
    return <AdminPanel onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-obsidian transition-colors duration-500">
      <Header
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        currentView={view}
        setView={setView}
        resetProgress={clearAllData}
        currentChapterId={progress.currentChapterId}
        onLogout={handleLogout}
      />

      <main className="flex-grow flex flex-col">
        {view === AppView.MAP && (
          <div className="w-full">
            <MapNavigation
              progress={progress}
              onSelectChapter={handleSelectChapter}
              onReadChapter={handleReadChapter}
            />
          </div>
        )}

        {view === AppView.STORY && activeLandingChapter && (
          <div className="w-full flex-1 flex flex-col">
            <StoryReader
              chapter={activeLandingChapter}
              progress={progress}
              journal={journal}
              onComplete={(id) => handleChapterComplete(id)}
              onSaveReflection={handleSaveReflection}
              onNextChapter={handleNextChapter}
            />
          </div>
        )}

        {view === AppView.READER && bookReaderData && (
          <BookReader
            chapter={bookReaderData}
            progress={progress}
            journal={journal}
            onComplete={(id) => handleChapterComplete(id)}
            onSaveReflection={handleSaveReflection}
            onClose={() => setView(AppView.MAP)}
          />
        )}

        {view === AppView.LOGBOOK && (
          <div className="container mx-auto px-4 pb-20">
            <Logbook
              progress={progress}
              onAttemptFinal={handleAttemptFinal}
            />
          </div>
        )}

        {view === AppView.FINAL && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in container mx-auto px-4">
            <h1 className="font-serif text-6xl text-romance-red mb-6">Amor Vincit Omnia</h1>
            <p className="text-xl max-w-2xl text-text-main dark:text-champagne">
              Hemos recorrido 14 vidas para encontrarnos aquí de nuevo.
            </p>
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-xs text-text-light/30 dark:text-champagne/30 font-serif">
        <p>Yo También © {new Date().getFullYear()} — Un Archivo de Vidas Pasadas</p>
      </footer>
    </div>
  );
};

export default App;
