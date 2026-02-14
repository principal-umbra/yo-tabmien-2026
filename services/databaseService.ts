
import { Chapter } from '../types';
import { CHAPTERS } from '../constants';
import { CHAPTER_001_DB_DATA } from '../data/chapters/chapter_001.db';
import { CHAPTER_002_DB_DATA } from '../data/chapters/chapter_002.db';
import { CHAPTER_003_DB_DATA } from '../data/chapters/chapter_003.db';
import { CHAPTER_004_DB_DATA } from '../data/chapters/chapter_004.db';
import { CHAPTER_005_DB_DATA } from '../data/chapters/chapter_005.db';
import { CHAPTER_006_DB_DATA } from '../data/chapters/chapter_006.db';

// Simula un sistema de archivos o una base de datos externa
const DATABASE: Record<number, Partial<Chapter>> = {
  1: CHAPTER_001_DB_DATA,
  2: CHAPTER_002_DB_DATA,
  3: CHAPTER_003_DB_DATA,
  4: CHAPTER_004_DB_DATA,
  5: CHAPTER_005_DB_DATA,
  6: CHAPTER_006_DB_DATA,
};

export const loadChapterFromDB = (chapterId: number): Chapter | null => {
  // 1. Obtener los metadatos básicos de constantes (Mapa/Landing)
  const baseMetadata = CHAPTERS.find(c => c.id === chapterId);
  
  if (!baseMetadata) return null;

  // 2. Buscar si existe el archivo de historia extendida en la "BD"
  const extendedData = DATABASE[chapterId];

  if (extendedData) {
    // Fusionar: Priorizar los datos de la BD (Historia completa) sobre los metadatos
    return {
      ...baseMetadata,
      ...extendedData,
    };
  }

  // Si no hay archivo DB (capítulos futuros), devolver solo metadatos
  return baseMetadata;
};
