
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
  const [isReady, setIsReady] = useState(false); // New: Initialization Shield

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

        // Prime the refs with loaded data to prevent redundant initial saves
        lastSavedProgress.current = JSON.stringify(loadedProgress);
        lastSavedJournal.current = JSON.stringify(loadedJournal);
        lastSavedSettings.current = JSON.stringify(loadedSettings);

      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
        setIsReady(true); // Open the shield
      }
    };

    initApp();

    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // --- PERSISTENCE & SYNC ---
  const lastSavedProgress = React.useRef<string>("");
  const lastSavedJournal = React.useRef<string>("");
  const lastSavedSettings = React.useRef<string>("");

  // 2. Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel('app_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_data' }, (payload) => {
        const { key, value } = payload.new as any;
        const incomingString = JSON.stringify(value);

        if (key === 'progress') {
          if (incomingString === lastSavedProgress.current) return;

          setProgress(prev => {
            // Smart Protection for Ella: Don't revert to a state with fewer completions
            if (currentUserRole === 'Ella') {
              const incomingCompletions = (value as UserProgress).completedChapters?.length || 0;
              const currentCompletions = prev.completedChapters.length;
              if (incomingCompletions < currentCompletions) return prev;
            }
            return value;
          });
        }

        if (key === 'journal') {
          if (incomingString === lastSavedJournal.current) return;
          setJournal(value);
        }

        if (key === 'settings') {
          if (incomingString === lastSavedSettings.current) return;
          setSettings(value);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserRole]); // Added role as dependency to apply logic correctly

  // Update DOM for dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Save persistence on change (ONLY FOR ELLA)
  useEffect(() => {
    if (!isReady) return; // THE SHIELD: Never save while initializing

    if (currentUserRole === 'Ella') {
      const progressString = JSON.stringify(progress);
      const journalString = JSON.stringify(journal);

      // Only save if actually different from last known saved state
      if (progressString !== lastSavedProgress.current) {
        lastSavedProgress.current = progressString;
        saveProgress(progress);
      }

      if (journalString !== lastSavedJournal.current) {
        lastSavedJournal.current = journalString;
        saveJournal(journal);
      }
    }
  }, [progress, journal, currentUserRole]);

  const toggleTheme = () => setDarkMode(!darkMode);


  // 4. Auto-repair unlockedChapters when settings or completions change
  useEffect(() => {
    if (!isAuthenticated) return;

    const nextUnlocked = CHAPTERS
      .map(c => c.id)
      .filter(id => {
        if (id === 1) return true;
        const prevCompleted = progress.completedChapters.includes(id - 1);
        const withinLimit = id <= settings.maxUnlockableChapter;
        return prevCompleted && withinLimit;
      });

    const hasNewUnlock = nextUnlocked.some(id => !progress.unlockedChapters.includes(id));

    if (hasNewUnlock) {
      setProgress(prev => {
        const newUnlocked = Array.from(new Set([...prev.unlockedChapters, ...nextUnlocked]));
        const nextState = { ...prev, unlockedChapters: newUnlocked };
        lastSavedProgress.current = JSON.stringify(nextState); // Pre-emptively update ref
        return nextState;
      });
    }
  }, [settings.maxUnlockableChapter, progress.completedChapters, isAuthenticated]);

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

  // --- ELLA'S INTERACTION HANDLERS (Memoized) ---

  const handleSelectChapter = React.useCallback((id: number) => {
    if (progress.unlockedChapters.includes(id)) {
      setProgress(prev => ({ ...prev, currentChapterId: id }));
    }
  }, [progress.unlockedChapters]);

  const handleReadChapter = React.useCallback((id: number) => {
    if (progress.unlockedChapters.includes(id)) {
      const fullChapterData = loadChapterFromDB(id);
      if (fullChapterData) {
        setBookReaderData(fullChapterData);
        setProgress(prev => ({ ...prev, currentChapterId: id }));
        setView(AppView.READER);
      }
    }
  }, [progress.unlockedChapters]);

  const handleChapterComplete = React.useCallback((chapterId: number) => {
    const chapter = CHAPTERS.find(c => c.id === chapterId);
    if (!chapter) return;

    setProgress(prev => {
      const isNewCompletion = !prev.completedChapters.includes(chapterId);

      const newCompleted = isNewCompletion
        ? [...prev.completedChapters, chapterId]
        : prev.completedChapters;

      const newFragments = isNewCompletion
        ? [...prev.collectedFragments, chapter.fragmentCode]
        : prev.collectedFragments;

      const nextUnlocked = CHAPTERS
        .map(c => c.id)
        .filter(id => {
          if (id === 1) return true;
          const prevCompleted = newCompleted.includes(id - 1);
          const withinLimit = id <= settings.maxUnlockableChapter;
          return prevCompleted && withinLimit;
        });

      let newCurrentId = prev.currentChapterId;
      if (nextUnlocked.includes(chapterId + 1) && prev.currentChapterId === chapterId) {
        newCurrentId = chapterId + 1;
      }

      return {
        ...prev,
        completedChapters: newCompleted,
        unlockedChapters: Array.from(new Set([...prev.unlockedChapters, ...nextUnlocked])),
        collectedFragments: newFragments,
        currentChapterId: newCurrentId
      };
    });
  }, [settings.maxUnlockableChapter]);

  const handleNextChapter = React.useCallback(() => {
    const nextId = progress.currentChapterId + 1;

    if (nextId <= 14 && nextId <= settings.maxUnlockableChapter) {
      if (progress.unlockedChapters.includes(nextId)) {
        setProgress(prev => {
          const nextState = { ...prev, currentChapterId: nextId };
          lastSavedProgress.current = JSON.stringify(nextState);
          return nextState;
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setView(AppView.MAP);
      }
    } else {
      setView(AppView.LOGBOOK);
    }
  }, [progress.currentChapterId, progress.unlockedChapters, settings.maxUnlockableChapter]);

  const handleSaveReflection = React.useCallback((chapterId: number, text: string) => {
    setJournal(prev => {
      const nextState = {
        ...prev,
        [chapterId]: text
      };
      lastSavedJournal.current = JSON.stringify(nextState);
      return nextState;
    });
  }, []);

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
        settings={settings}
      />

      <main className="flex-grow flex flex-col">
        {view === AppView.MAP && (
          <div className="w-full">
            <MapNavigation
              progress={progress}
              onSelectChapter={handleSelectChapter}
              onReadChapter={handleReadChapter}
              settings={settings}
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
              settings={settings}
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
