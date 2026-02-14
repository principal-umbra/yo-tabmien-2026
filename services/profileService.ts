
import { SoulProfile } from '../types';
import { PROFILE_001_DB_DATA } from '../data/profiles/profile_001.db';
import { PROFILE_002_DB_DATA } from '../data/profiles/profile_002.db';
import { PROFILE_003_DB_DATA } from '../data/profiles/profile_003.db';
import { PROFILE_004_DB_DATA } from '../data/profiles/profile_004.db';
import { PROFILE_005_DB_DATA } from '../data/profiles/profile_005.db';
import { PROFILE_006_DB_DATA } from '../data/profiles/profile_006.db';

// Database registry for extended profiles
// We can import others here as they are created (e.g., PROFILE_002_DB_DATA)
const PROFILE_DATABASE: Record<number, SoulProfile> = {
  1: PROFILE_001_DB_DATA,
  2: PROFILE_002_DB_DATA,
  3: PROFILE_003_DB_DATA,
  4: PROFILE_004_DB_DATA,
  5: PROFILE_005_DB_DATA,
  6: PROFILE_006_DB_DATA,
};

export const loadProfileFromDB = (id: number): SoulProfile | null => {
  return PROFILE_DATABASE[id] || null;
};

// --- SOUL ALIASES ---
const SOUL_ALIASES: Record<number, string> = {
  1: "Ares",
  2: "Hades",
  3: "Morfeo",
  4: "Atlas",
  5: "Ghost",
  6: "Shadow"
};

export const getSoulAlias = (soulId: number): string => {
  return SOUL_ALIASES[soulId] || "???";
};

// Deprecated: Custom name persistence removed per user request
export const saveCustomName = (soulId: number, name: string): void => {
  // No-op
};
