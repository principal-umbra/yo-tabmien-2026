
import { SystemSettings } from '../../types';

// Configuración inicial por defecto (Factory Settings)
export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  ellaPasswordEnabled: false,
  ellaPassword: "", // Por defecto sin contraseña
  elPasswordEnabled: false,
  elPassword: "", // Por defecto sin contraseña
  maxUnlockableChapter: 14, // Por defecto todo está disponible
  ellaName: "Mi Alma Gemela",
  ellaBio: "Bienvenida a nuestro archivo de recuerdos eternos."
};
