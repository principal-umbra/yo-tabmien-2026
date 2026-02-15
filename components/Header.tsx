
import React, { useState, useRef, useEffect } from 'react';
import { AppView, SystemSettings } from '../types';
import { loadSettings } from '../services/storageService';

interface HeaderProps {
  darkMode: boolean;
  toggleTheme: () => void;
  currentView: AppView;
  setView: (view: AppView) => void;
  resetProgress: () => void;
  currentChapterId: number;
  onLogout: () => void;
  settings: SystemSettings;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleTheme, currentView, setView, currentChapterId, onLogout, settings }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-romance-red/20 px-6 lg:px-40 py-5 bg-peach-cream/95 dark:bg-obsidian/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm transition-all duration-300">
      {/* Logo Section - Redirects to Home (Inicio/Story) */}
      <div
        className="flex items-center gap-3 cursor-pointer group shrink-0"
        onClick={() => setView(AppView.STORY)}
      >
        <div className="relative">
          <span className="material-symbols-outlined text-black dark:text-white text-3xl drop-shadow-[2px_2px_0_rgba(209,0,36,0.5)] group-hover:scale-110 transition-transform">favorite</span>
        </div>
        <h2 className="text-black dark:text-white font-serif text-2xl font-bold tracking-wide">Yo También</h2>
      </div>

      {/* Main Navigation Sections */}
      <nav className="hidden md:flex items-center gap-8 mx-8">
        <button
          onClick={() => setView(AppView.STORY)}
          className={`text-sm font-bold uppercase tracking-widest transition-all relative group ${currentView === AppView.STORY ? 'text-romance-red' : 'text-text-light dark:text-champagne/60 hover:text-romance-red'}`}
        >
          Inicio
          <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-romance-red transform origin-left transition-transform duration-300 ${currentView === AppView.STORY ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
        </button>
        <button
          onClick={() => setView(AppView.MAP)}
          className={`text-sm font-bold uppercase tracking-widest transition-all relative group ${currentView === AppView.MAP ? 'text-romance-red' : 'text-text-light dark:text-champagne/60 hover:text-romance-red'}`}
        >
          El Sendero Eterno
          <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-romance-red transform origin-left transition-transform duration-300 ${currentView === AppView.MAP ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
        </button>
      </nav>

      <div className="flex flex-1 justify-end gap-2 items-center">
        {currentView === AppView.STORY && (
          <div className="hidden lg:flex gap-2 mr-4 animate-fade-in border-r border-romance-red/20 pr-4">
            <span className="text-xs uppercase tracking-widest text-text-light dark:text-champagne/70 font-bold self-center">
              Capítulo {currentChapterId} / 14
            </span>
          </div>
        )}

        <div className="flex gap-1 md:gap-2">
          <button
            onClick={() => setView(AppView.LOGBOOK)}
            className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${currentView === AppView.LOGBOOK ? 'text-romance-red' : 'text-text-main dark:text-champagne'}`}
            title="Bitácora"
          >
            <span className="material-symbols-outlined">auto_stories</span>
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-text-main dark:text-champagne"
            title="Cambiar Tema"
          >
            <span className="material-symbols-outlined">{darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-text-main dark:text-champagne"
            title="Menú"
          >
            <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* User Profile Dropdown (Desktop) */}
        <div className="relative ml-2 hidden md:block" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-11 border-2 border-romance-red shadow-md ring-2 ring-romance-red/20 hover:scale-105 transition-transform"
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA1TZZyR5VvSK_nIVwXHfFjLX2EO3kj-OIbRT4PCSQllGPBKyMcRZqUYvTbVOCyaM8lpsO6fZcw-ETCcfsJkiNZx3UdStQBwEG0V_cwfX31ZE4yN4J46eXqQi7h2hRyte5vy13vorPHinFAk4raw_hQqMsbChND8ouypNz29sJ1pDsgbZD_t1-hIb-hb8AuGsBUZxYQnmLD238wz5mIzgpXcpNmAAVkty2gwjzDNxghhXtw0TDktbBW-JOxrVaGi9nFxIk0n_vw1vOK")' }}
          ></button>

          {/* Dropdown Content */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl border border-gold-accent/20 dark:border-white/10 overflow-hidden animate-fade-in z-50">
              <div className="p-4 bg-gradient-to-br from-romance-red/5 to-gold-accent/5 dark:from-red-900/10 dark:to-yellow-900/10 border-b border-gray-100 dark:border-white/5">
                <p className="text-xs uppercase tracking-widest text-gold-accent font-bold mb-1">Identidad</p>
                <h4 className="font-serif font-bold text-lg text-text-main dark:text-white truncate">{settings.ellaName || "Mi Alma Gemela"}</h4>
                <p className="text-xs text-text-light/70 dark:text-gray-400 italic mt-1 line-clamp-2">"{settings.ellaBio || "Bienvenida..."}"</p>
              </div>
              <div className="p-2">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors font-bold uppercase tracking-wide"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-peach-cream/95 dark:bg-obsidian/95 backdrop-blur-md border-b border-romance-red/20 py-4 px-6 animate-fade-in z-40 shadow-xl">
          <nav className="flex flex-col gap-4">
            <button
              onClick={() => { setView(AppView.STORY); setIsMenuOpen(false); }}
              className={`text-left text-sm font-bold uppercase tracking-widest py-2 transition-all ${currentView === AppView.STORY ? 'text-romance-red' : 'text-text-light dark:text-champagne/60'}`}
            >
              Inicio
            </button>
            <button
              onClick={() => { setView(AppView.MAP); setIsMenuOpen(false); }}
              className={`text-left text-sm font-bold uppercase tracking-widest py-2 transition-all ${currentView === AppView.MAP ? 'text-romance-red' : 'text-text-light dark:text-champagne/60'}`}
            >
              El Sendero Eterno
            </button>
            <div className="h-px bg-romance-red/10 my-2"></div>
            <div className="flex items-center gap-3">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-romance-red shadow-sm"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA1TZZyR5VvSK_nIVwXHfFjLX2EO3kj-OIbRT4PCSQllGPBKyMcRZqUYvTbVOCyaM8lpsO6fZcw-ETCcfsJkiNZx3UdStQBwEG0V_cwfX31ZE4yN4J46eXqQi7h2hRyte5vy13vorPHinFAk4raw_hQqMsbChND8ouypNz29sJ1pDsgbZD_t1-hIb-hb8AuGsBUZxYQnmLD238wz5mIzgpXcpNmAAVkty2gwjzDNxghhXtw0TDktbBW-JOxrVaGi9nFxIk0n_vw1vOK")' }}
              ></div>
              <div className="flex-1 overflow-hidden">
                <h4 className="font-serif font-bold text-sm text-text-main dark:text-white truncate">{settings.ellaName || "Mi Alma Gemela"}</h4>
                <p className="text-[10px] text-text-light/70 dark:text-gray-400 italic truncate italic">"{settings.ellaBio || "Bienvenida..."}"</p>
              </div>
            </div>
            <button
              onClick={() => { onLogout(); setIsMenuOpen(false); }}
              className="mt-2 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Cerrar Sesión
            </button>
          </nav>
        </div>
      )}

    </header>
  );
};

export default Header;
