
import { UserProgress, UserJournal, SystemSettings, UserRole } from '../types';
import { DEFAULT_SYSTEM_SETTINGS } from '../data/system/settings.db';
import { INITIAL_PROGRESS_DB } from '../data/db/progress.db';
import { INITIAL_JOURNAL_DB } from '../data/db/journal.db';

const STORAGE_KEY_SETTINGS = 'yo-tambien-system-settings-v1';

// New Split Keys
const STORAGE_KEY_PROGRESS = 'yo-tambien-progress-db-v1';
const STORAGE_KEY_JOURNAL = 'yo-tambien-journal-db-v1';

// --- SYSTEM SETTINGS ---

export const saveSettings = (settings: SystemSettings) => {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
};

export const loadSettings = (): SystemSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load settings", e);
  }
  return DEFAULT_SYSTEM_SETTINGS;
};

// --- USER PROGRESS DB ---

export const saveProgress = (progress: UserProgress) => {
  try {
    const updatedProgress = {
      ...progress,
      lastActive: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updatedProgress));
  } catch (e) {
    console.error("Failed to save progress DB", e);
  }
};

export const loadProgress = (): UserProgress => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load progress DB", e);
  }
  return INITIAL_PROGRESS_DB;
};

// --- USER JOURNAL DB ---

export const saveJournal = (journal: UserJournal) => {
  try {
    localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(journal));
  } catch (e) {
    console.error("Failed to save journal DB", e);
  }
};

export const loadJournal = (): UserJournal => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_JOURNAL);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load journal DB", e);
  }
  return INITIAL_JOURNAL_DB;
};


// --- SESSION STORAGE ---

const STORAGE_KEY_SESSION = 'yo-tambien-session-v1';

export const saveSession = (role: UserRole) => {
  try {
    localStorage.setItem(STORAGE_KEY_SESSION, role);
  } catch (e) {
    console.error("Failed to save session", e);
  }
};

export const loadSession = (): UserRole | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SESSION);
    if (stored === 'Ella' || stored === 'El') {
      return stored as UserRole;
    }
  } catch (e) {
    console.error("Failed to load session", e);
  }
  return null;
};

export const clearSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  } catch (e) {
    console.error("Failed to clear session", e);
  }
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY_PROGRESS);
  localStorage.removeItem(STORAGE_KEY_JOURNAL);
  localStorage.removeItem(STORAGE_KEY_SESSION);
  window.location.reload();
};

export const resetEllaData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_PROGRESS);
    localStorage.removeItem(STORAGE_KEY_JOURNAL);
    // We intentionally do NOT clear settings or session
    // And we return true to indicate success
    return true;
  } catch (e) {
    console.error("Failed to reset Ella data", e);
    return false;
  }
};
