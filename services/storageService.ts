
import { UserProgress, UserJournal, SystemSettings, UserRole } from '../types';
import { DEFAULT_SYSTEM_SETTINGS } from '../data/system/settings.db';
import { INITIAL_PROGRESS_DB } from '../data/db/progress.db';
import { INITIAL_JOURNAL_DB } from '../data/db/journal.db';
import { supabase } from './supabaseClient';

const STORAGE_KEY_SETTINGS = 'settings';
const STORAGE_KEY_PROGRESS = 'progress';
const STORAGE_KEY_JOURNAL = 'journal';
const STORAGE_KEY_SESSION = 'yo-tambien-session-v1';

// --- SYSTEM SETTINGS ---

export const saveSettings = async (settings: SystemSettings) => {
  try {
    const { error } = await supabase
      .from('app_data')
      .upsert({ key: STORAGE_KEY_SETTINGS, value: settings, updated_at: new Date().toISOString() });

    if (error) throw error;
  } catch (e) {
    console.error("Failed to save settings to Supabase", e);
  }
};

export const loadSettings = async (): Promise<SystemSettings> => {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('value')
      .eq('key', STORAGE_KEY_SETTINGS)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is code for no rows found
    return data?.value || DEFAULT_SYSTEM_SETTINGS;
  } catch (e) {
    console.error("Failed to load settings from Supabase", e);
    return DEFAULT_SYSTEM_SETTINGS;
  }
};

// --- USER PROGRESS DB ---

export const saveProgress = async (progress: UserProgress) => {
  try {
    const updatedProgress = {
      ...progress,
      lastActive: new Date().toISOString()
    };

    const { error } = await supabase
      .from('app_data')
      .upsert({ key: STORAGE_KEY_PROGRESS, value: updatedProgress, updated_at: new Date().toISOString() });

    if (error) throw error;
  } catch (e) {
    console.error("Failed to save progress to Supabase", e);
  }
};

export const loadProgress = async (): Promise<UserProgress> => {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('value')
      .eq('key', STORAGE_KEY_PROGRESS)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.value || INITIAL_PROGRESS_DB;
  } catch (e) {
    console.error("Failed to load progress from Supabase", e);
    return INITIAL_PROGRESS_DB;
  }
};

// --- USER JOURNAL DB ---

export const saveJournal = async (journal: UserJournal) => {
  try {
    const { error } = await supabase
      .from('app_data')
      .upsert({ key: STORAGE_KEY_JOURNAL, value: journal, updated_at: new Date().toISOString() });

    if (error) throw error;
  } catch (e) {
    console.error("Failed to save journal to Supabase", e);
  }
};

export const loadJournal = async (): Promise<UserJournal> => {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('value')
      .eq('key', STORAGE_KEY_JOURNAL)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.value || INITIAL_JOURNAL_DB;
  } catch (e) {
    console.error("Failed to load journal from Supabase", e);
    return INITIAL_JOURNAL_DB;
  }
};


// --- SESSION STORAGE (Still local for authentication persistent) ---
// Note: We keep session local because authentication is personal to the device/user.

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

// --- DATA MANAGEMENT ---

export const clearAllData = async () => {
  try {
    // We clear the shared data for everyone! Use with caution.
    await supabase.from('app_data').delete().in('key', [STORAGE_KEY_SETTINGS, STORAGE_KEY_PROGRESS, STORAGE_KEY_JOURNAL]);
    localStorage.removeItem(STORAGE_KEY_SESSION);
    window.location.reload();
  } catch (e) {
    console.error("Failed to clear shared data", e);
  }
};

export const resetEllaData = async () => {
  try {
    await supabase.from('app_data').delete().in('key', [STORAGE_KEY_PROGRESS, STORAGE_KEY_JOURNAL]);
    return true;
  } catch (e) {
    console.error("Failed to reset shared data", e);
    return false;
  }
};
