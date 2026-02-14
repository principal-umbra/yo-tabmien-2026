
export interface SoulProfile {
  characterName: string;
  archetype: string;
  element: string;
  description: string;
  roleDescription: string;
  timeTogether: string;
  bondType: string;
  galleryImages?: string[];
}

export interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  era: string;
  story: string;
  riddle: {
    question: string;
    answer: string;
    hintPrompt: string;
  };
  image: string;
  fragmentCode: string;
  rewardBadge: string;
  profile?: SoulProfile;
}

// Separate Journal Data Structure
export type UserJournal = Record<number, string>; // Chapter ID -> Text Content

export interface UserProgress {
  unlockedChapters: number[];
  completedChapters: number[];
  collectedFragments: string[];
  // reflections: Record<number, string>; // DEPRECATED: Moved to UserJournal
  currentChapterId: number;
  lastActive: string;
}

export interface SystemSettings {
  ellaPasswordEnabled: boolean;
  ellaPassword?: string;
  elPasswordEnabled: boolean;
  elPassword?: string;
  maxUnlockableChapter: number;
  ellaName: string;
  ellaBio: string;
}

export type UserRole = 'Ella' | 'El';

export enum AppView {
  MAP = 'MAP',
  STORY = 'STORY',
  READER = 'READER',
  LOGBOOK = 'LOGBOOK',
  FINAL = 'FINAL',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}
