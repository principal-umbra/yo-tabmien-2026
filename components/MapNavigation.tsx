
import React from 'react';
import { Chapter, UserProgress } from '../types';
import { CHAPTERS } from '../constants';
import { loadSettings } from '../services/storageService';

interface MapNavigationProps {
  progress: UserProgress;
  onSelectChapter: (id: number) => void;
  onReadChapter: (id: number) => void;
}

const MapNavigation: React.FC<MapNavigationProps> = ({ progress, onSelectChapter, onReadChapter }) => {
  const settings = loadSettings();
  const completedCount = progress.completedChapters.length;
  const totalChapters = CHAPTERS.length;
  const progressPercent = Math.round((completedCount / totalChapters) * 100);

  // Filter chapters based on Admin Limit
  const visibleChapters = CHAPTERS.filter(c => c.id <= settings.maxUnlockableChapter);

  return (
    <div className="min-h-screen bg-paper dark:bg-[#121212] text-text-main dark:text-gray-200 relative overflow-hidden transition-colors duration-500">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 fixed h-full w-full">
        {/* Adjusted blobs for light mode visibility */}
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-gold-accent/20 dark:bg-amber-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-romance-red/10 dark:bg-red-900/10 rounded-full blur-[120px]"></div>

        {/* Icons adjusted for both modes */}
        <span className="material-symbols-outlined absolute text-romance-red/5 dark:text-white/5 text-9xl" style={{ top: '5%', right: '5%' }}>favorite</span>
        <span className="material-symbols-outlined absolute text-romance-red/5 dark:text-white/5 text-[15rem]" style={{ bottom: '10%', left: '-5%' }}>volunteer_activism</span>
      </div>

      <div className="flex flex-col lg:flex-row py-4 md:py-8 px-2 md:px-4 lg:px-20 gap-8 max-w-[1600px] mx-auto w-full relative z-10">

        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex flex-col gap-6 order-2 lg:order-1 lg:sticky lg:top-24 h-fit">

          {/* Soul Cipher Panel */}
          <div className="bg-white/80 dark:bg-obsidian-gradient backdrop-blur-md border border-gold-accent/30 dark:border-primary/30 rounded-xl p-6 relative overflow-hidden group shadow-soft dark:shadow-panel transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-romance-red/5 dark:from-red-900/10 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-romance-dark dark:text-primary border-b border-gold-accent/20 dark:border-primary/20 pb-2">
                <span className="material-symbols-outlined text-2xl drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]">lock_open</span>
                <h3 className="font-cinzel font-bold tracking-widest text-base uppercase drop-shadow-sm">Cifrado del Alma</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-xs text-text-light/70 dark:text-gray-400 font-mono font-bold">
                  <span>Progreso de Descifrado</span>
                  <span className="text-romance-red dark:text-red-400 font-black">{progressPercent}%</span>
                </div>
                <div className="h-3 w-full bg-black/10 dark:bg-black/50 rounded-full overflow-hidden border border-black/5 dark:border-gray-800">
                  <div
                    className="h-full bg-gradient-to-r from-romance-red to-romance-glow dark:from-red-800 dark:to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                {/* Cipher Grid */}
                <div className="grid grid-cols-7 gap-1.5 mt-2">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const id = i + 1;
                    const hasFragment = i < progress.collectedFragments.length;
                    const char = hasFragment ? progress.collectedFragments[i].charAt(0) : '?';

                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded flex items-center justify-center text-[10px] font-bold shadow-sm transition-all
                          ${hasFragment
                            ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-200 dark:border-red-500/50 shadow-[0_0_5px_rgba(220,38,38,0.3)]'
                            : 'bg-black/5 dark:bg-black/40 border border-black/10 dark:border-gray-700 text-text-light/40 dark:text-gray-600'
                          }`}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Logbook Panel */}
          <div className="bg-white/80 dark:bg-obsidian-gradient backdrop-blur-md border border-gold-accent/30 dark:border-primary/30 rounded-xl p-6 flex-1 shadow-soft dark:shadow-panel transition-colors">
            <div className="flex items-center justify-between mb-6 border-b border-gold-accent/20 dark:border-primary/20 pb-4">
              <div className="flex items-center gap-2 text-romance-dark dark:text-primary">
                <span className="material-symbols-outlined drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]">auto_stories</span>
                <h3 className="font-cinzel font-bold tracking-widest text-lg drop-shadow-sm">Mi Bitácora</h3>
              </div>
              <span className="text-[10px] font-bold bg-romance-red/10 dark:bg-red-900/50 text-romance-red dark:text-red-200 border border-romance-red/30 dark:border-red-500/50 px-3 py-1 rounded-full shadow-sm">
                ALMA {progress.currentChapterId}/14
              </span>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-text-light/60 dark:text-gray-500 font-bold mb-4">Vidas Descubiertas</h4>
              <div className="grid grid-cols-4 gap-3">
                {CHAPTERS.map((chapter) => {
                  const isUnlocked = progress.unlockedChapters.includes(chapter.id);
                  const isCurrent = progress.currentChapterId === chapter.id;

                  return (
                    <div
                      key={chapter.id}
                      className={`aspect-square rounded-full border bg-cover bg-center shadow-sm relative group transition-colors
                        ${isUnlocked
                          ? 'border-gold-accent dark:border-primary cursor-pointer hover:scale-110 transition-transform shadow-[0_0_10px_rgba(212,175,55,0.3)] ring-1 ring-gold-accent/30 dark:ring-primary/30'
                          : isCurrent
                            ? 'border-romance-red dark:border-red-500 animate-pulse shadow-glow-red bg-peach-cream dark:bg-[#2a1a1a]'
                            : 'border-black/10 dark:border-gray-800 bg-black/5 dark:bg-black/30 flex items-center justify-center'
                        }`}
                      style={{ backgroundImage: isUnlocked ? `url("${chapter.image}")` : undefined }}
                    >
                      {isUnlocked && (
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-black border border-gold-accent dark:border-primary text-text-main dark:text-primary text-[9px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg font-serif">
                          {chapter.title}
                        </div>
                      )}
                      {!isUnlocked && !isCurrent && (
                        <span className="material-symbols-outlined text-sm text-text-light/30 dark:text-gray-700">question_mark</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Timeline */}
        <div className="flex-1 order-1 lg:order-2 relative pb-20">
          <div className="text-center mb-10 md:mb-16 relative z-10 sticky top-[72px] lg:static bg-paper/80 dark:bg-[#121212]/80 backdrop-blur-sm py-4 md:py-0">
            <p className="text-romance-red dark:text-primary font-black uppercase tracking-[0.2em] text-[10px] md:text-xs mb-2 md:mb-3 shadow-lg inline-block px-3 md:px-4 py-1 bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-full border border-romance-red/20 dark:border-primary/30">
              Nuestra Historia Eterna
            </p>
            <h1 className="text-text-main dark:text-gray-100 text-2xl md:text-5xl lg:text-6xl font-cinzel font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight px-4">
              El Sendero de las 14 Almas
            </h1>
          </div>

          <div className="relative py-10 flex flex-col items-center gap-24">
            {/* Vertical Line */}
            <div className="path-constellation"></div>

            {visibleChapters.map((chapter, index) => {
              const isCompleted = progress.completedChapters.includes(chapter.id);
              const isCurrent = progress.currentChapterId === chapter.id;
              const isLocked = !progress.unlockedChapters.includes(chapter.id);
              const isRight = index % 2 !== 0;

              // Opacity logic for future chapters
              const opacityClass = isLocked
                ? index > progress.currentChapterId + 2 ? 'opacity-40' : 'opacity-60'
                : 'opacity-100';

              return (
                <div
                  key={chapter.id}
                  className={`relative z-10 w-full max-w-2xl group transition-all duration-300 ${opacityClass}`}
                >
                  {/* Glowing background for active/completed nodes */}
                  {(isCurrent || isCompleted) && (
                    <div className={`amber-glow ${isCurrent ? 'opacity-30' : 'opacity-100'}`}></div>
                  )}
                  {isCurrent && (
                    <div className="absolute inset-0 bg-romance-red/20 dark:bg-red-900/20 blur-3xl rounded-full opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  )}
                  {isCompleted && (
                    <div className="absolute inset-0 bg-gold-accent/10 dark:bg-primary/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  )}

                  <div className="flex items-center gap-6 flex-col md:flex-row">

                    {/* Spacer for zig-zag */}
                    {isRight && <div className="hidden md:block flex-1 order-1"></div>}

                    {/* The Node Icon */}
                    <div className={`relative shrink-0 order-1 ${isRight ? 'md:order-2' : 'md:order-2'}`}>
                      <div
                        onClick={() => !isLocked && onSelectChapter(chapter.id)}
                        className={`
                          rounded-full flex items-center justify-center relative z-20 transition-all cursor-pointer
                          ${isCurrent
                            ? 'size-24 bg-gradient-to-br from-romance-red to-black dark:from-red-900 dark:to-black border-2 border-romance-red dark:border-red-500 ring-4 ring-romance-red/20 dark:ring-red-900/30 pulse-intense shadow-glow-red'
                            : isCompleted
                              ? 'size-20 bg-white dark:bg-[#1a1a1a] border-2 border-gold-accent dark:border-primary shadow-glow-gold'
                              : 'size-14 bg-paper-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 shadow-sm'
                          }
                        `}
                      >
                        {isCurrent ? (
                          <span className="material-symbols-outlined text-white dark:text-red-100 text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">history_edu</span>
                        ) : isCompleted ? (
                          <span className="material-symbols-outlined text-gold-accent dark:text-primary text-4xl font-bold drop-shadow-[0_0_5px_rgba(212,175,55,0.8)]">landscape</span>
                        ) : (
                          <span className="material-symbols-outlined text-gray-400 dark:text-gray-600 text-xl">lock</span>
                        )}
                      </div>

                      {/* Status Badges */}
                      {isCompleted && (
                        <div className="absolute -top-2 -right-2 bg-gold-accent dark:bg-primary text-white dark:text-black rounded-full p-1.5 border border-white dark:border-black z-30 shadow-md">
                          <span className="material-symbols-outlined text-sm font-bold">check</span>
                        </div>
                      )}
                      {isCurrent && (
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-romance-red to-black dark:from-red-900 dark:to-black text-white dark:text-red-100 px-4 py-1 rounded-full text-[10px] font-bold tracking-wider whitespace-nowrap border border-romance-red/50 dark:border-red-500/50 shadow-glow-red z-30">
                          VIDA ACTUAL
                        </div>
                      )}

                      {/* Horizontal Connector Line */}
                      <div className={`hidden md:block absolute top-1/2 w-20 h-[1px] bg-gradient-to-${isRight ? 'r' : 'l'} ${isCurrent ? 'from-romance-red dark:from-red-500' : isCompleted ? 'from-gold-accent dark:from-primary' : 'from-gray-300 dark:from-gray-700'} to-transparent -translate-y-1/2 opacity-50 ${isRight ? 'left-full' : 'right-full'}`}></div>
                    </div>

                    {/* Content Box */}
                    <div className={`flex-1 order-2 ${isRight ? 'md:order-3 text-center md:text-left' : 'md:order-1 text-center md:text-right'}`}>
                      {isCurrent ? (
                        <div className="bg-peach-cream dark:bg-[#151515] border border-romance-red/60 dark:border-red-500/60 p-4 md:p-6 rounded-xl shadow-[0_0_30px_rgba(209,0,36,0.15)] relative overflow-hidden transform hover:-translate-y-1 transition-transform">
                          <span className="text-[10px] md:text-xs font-black text-romance-red dark:text-red-500 uppercase tracking-widest mb-1 block">Alma {chapter.id}</span>
                          <h3 className="text-lg md:text-2xl font-cinzel font-bold text-text-main dark:text-gray-100 mb-2 drop-shadow-md">{chapter.title}</h3>
                          <p className="text-xs md:text-sm text-text-light/80 dark:text-gray-400 mb-4 line-clamp-2 font-medium italic">{chapter.era}</p>
                          <button
                            onClick={() => onReadChapter(chapter.id)}
                            className="bg-gradient-to-r from-romance-red to-romance-dark dark:from-red-800 dark:to-red-600 hover:from-romance-glow hover:to-romance-red dark:hover:from-red-700 dark:hover:to-red-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-[10px] md:text-xs uppercase font-bold tracking-widest shadow-lg transition-all w-full md:w-auto flex items-center justify-center gap-2 transform hover:-translate-y-0.5 border border-white/20 dark:border-red-400/30 mx-auto md:mx-0"
                          >
                            <span>Continuar Viaje</span>
                            <span className="material-symbols-outlined text-sm">auto_stories</span>
                          </button>
                        </div>
                      ) : isCompleted ? (
                        <div className="bg-white/90 dark:bg-obsidian-gradient backdrop-blur-md border border-gold-accent/40 dark:border-primary/40 p-5 rounded-xl shadow-soft dark:shadow-panel relative overflow-hidden group-hover:border-gold-accent dark:group-hover:border-primary transition-colors cursor-pointer" onClick={() => onReadChapter(chapter.id)}>
                          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-gold-accent/10 dark:from-primary/10 to-transparent"></div>
                          <span className="text-xs font-bold text-romance-dark dark:text-primary-dark uppercase tracking-widest mb-1 block">Alma {chapter.id}</span>
                          <h3 className="text-xl font-cinzel font-bold text-text-main dark:text-gray-200 mb-1 drop-shadow-md">{chapter.title}</h3>
                          <p className="text-sm text-text-light/70 dark:text-gray-400 mb-3 font-medium italic">{chapter.era}</p>
                          <span className="text-[10px] font-bold text-gold-accent dark:text-primary uppercase tracking-widest border border-gold-accent/50 dark:border-primary/50 px-3 py-1 rounded-full bg-gold-accent/5 dark:bg-primary/5 inline-block hover:bg-gold-accent hover:text-white dark:hover:bg-primary dark:hover:text-black transition-colors">Revisar Memoria</span>
                        </div>
                      ) : (
                        <div className="bg-white/40 dark:bg-obsidian-gradient border border-black/5 dark:border-white/5 p-4 rounded-xl">
                          <span className="text-[10px] font-bold text-text-light/50 dark:text-gray-600 uppercase tracking-widest mb-1 block">Alma {chapter.id}</span>
                          <h3 className="text-lg font-cinzel font-bold text-text-light/50 dark:text-gray-500 mb-1">{chapter.title}</h3>
                          <p className="text-xs text-text-light/40 dark:text-gray-700 italic">Bloqueado</p>
                        </div>
                      )}
                    </div>

                    {/* Right spacer for left-aligned items */}
                    {!isRight && <div className="hidden md:block flex-1 order-3"></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapNavigation;
