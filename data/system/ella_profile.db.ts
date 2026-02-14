import { UserProgress } from '../../types';

export const INITIAL_ELLA_PROGRESS: UserProgress = {
  unlockedChapters: [1],
  completedChapters: [],
  collectedFragments: [],
  currentChapterId: 1,
  lastActive: new Date().toISOString()
};