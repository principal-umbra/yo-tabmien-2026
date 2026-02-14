
import { UserProgress } from '../../types';

export const INITIAL_PROGRESS_DB: UserProgress = {
  unlockedChapters: [1],
  completedChapters: [],
  collectedFragments: [],
  currentChapterId: 1,
  lastActive: new Date().toISOString()
};
