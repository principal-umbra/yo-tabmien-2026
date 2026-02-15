
import React, { useState, useEffect } from 'react';
import { Chapter, UserProgress, UserJournal, SystemSettings } from '../types';
import { getRiddleHint } from '../services/geminiService';
import { loadSettings } from '../services/storageService';
import { normalizeText, compareRiddle } from '../services/textUtils';

interface StoryReaderProps {
    chapter: Chapter;
    progress: UserProgress;
    journal: UserJournal;
    onComplete: (chapterId: number) => void;
    onSaveReflection: (chapterId: number, text: string) => void;
    onNextChapter: () => void;
    settings: SystemSettings;
}

const StoryReader: React.FC<StoryReaderProps> = ({ chapter, progress, journal, onComplete, onSaveReflection, onNextChapter, settings }) => {
    const [reflection, setReflection] = useState(journal[chapter.id] || '');
    const [riddleInput, setRiddleInput] = useState('');
    const [hint, setHint] = useState<string | null>(null);
    const [isGettingHint, setIsGettingHint] = useState(false);
    const [riddleError, setRiddleError] = useState(false);
    const [isCompleted, setIsCompleted] = useState(progress.completedChapters.includes(chapter.id));

    const isAtLimit = chapter.id >= settings.maxUnlockableChapter;

    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

    // 1. Handle Chapter Changes (Initial Load)
    useEffect(() => {
        setReflection(journal[chapter.id] || '');
        setRiddleInput('');
        setHint(null);
        setRiddleError(false);
        setIsCompleted(progress.completedChapters.includes(chapter.id));
    }, [chapter.id]);

    // 2. Handle Real-time Sync from other devices
    useEffect(() => {
        // Only overwrite local state if:
        // - We are currently "saved" (not locally dirty)
        // - AND the remote value is actually different
        if (saveStatus === 'saved') {
            const remoteValue = journal[chapter.id] || '';
            if (remoteValue !== reflection) {
                setReflection(remoteValue);
            }
        }
    }, [journal, chapter.id, saveStatus]); // Depend on journal, chapter.id, and saveStatus for sync

    // 3. Auto-save effect
    useEffect(() => {
        if (reflection === (journal[chapter.id] || '')) {
            setSaveStatus('saved');
            return;
        }

        setSaveStatus('unsaved');
        const timer = setTimeout(() => {
            setSaveStatus('saving');
            onSaveReflection(chapter.id, reflection);
            setTimeout(() => setSaveStatus('saved'), 800); // Fake delay for visual feedback
        }, 4000); // Increased 4s debounce to avoid interference

        return () => clearTimeout(timer);
    }, [reflection, chapter.id, onSaveReflection]);


    const handleGetHint = async () => {
        if (hint) return;
        setIsGettingHint(true);
        const result = await getRiddleHint(chapter.riddle.hintPrompt);
        setHint(result);
        setIsGettingHint(false);
    };

    const handleSubmitRiddle = (e: React.FormEvent) => {
        e.preventDefault();
        const isCorrect = compareRiddle(riddleInput, chapter.riddle.answer);

        if (isCorrect) {
            setIsCompleted(true);
            onComplete(chapter.id);
        } else {
            setRiddleError(true);
            setTimeout(() => setRiddleError(false), 2000);
        }
    };

    const handleManualSave = () => {
        onSaveReflection(chapter.id, reflection);
        setSaveStatus('saved');
    };

    return (
        <div className="flex-1 flex flex-col items-center py-12 px-4 md:px-10 relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <span className="material-symbols-outlined absolute text-romance-red/10 text-6xl" style={{ top: '5%', left: '2%' }}>favorite</span>
                <span className="material-symbols-outlined absolute text-romance-red/5 text-8xl" style={{ top: '20%', right: '-2%', transform: 'rotate(15deg)' }}>favorite_border</span>
                <span className="material-symbols-outlined absolute text-gold-accent/10 text-9xl" style={{ bottom: '10%', left: '-3%', transform: 'rotate(-10deg)' }}>local_florist</span>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-romance-red/5 rounded-full blur-3xl -z-10"></div>
            </div>

            <div className="max-w-[800px] w-full flex flex-col gap-12 relative z-10 animate-fade-in">

                <div className="text-center space-y-4 relative">
                    <span className="material-symbols-outlined absolute -top-8 left-1/2 -translate-x-1/2 text-romance-red/10 text-4xl md:text-6xl">history_edu</span>
                    <p className="text-romance-red font-bold uppercase tracking-[0.2em] md:tracking-[0.25em] text-[10px] md:text-xs pt-4 drop-shadow-sm">Historia de Nuestras Vidas</p>
                    <h1 className="text-text-main dark:text-champagne text-3xl md:text-7xl font-serif font-medium leading-tight tracking-tight italic drop-shadow-sm px-2">
                        {chapter.title}<br />
                        <span className="not-italic font-normal text-text-main/90 dark:text-champagne/90 text-xl md:text-5xl">{chapter.subtitle}</span>
                    </h1>
                    <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-transparent via-romance-red/40 to-transparent mx-auto rounded-full mt-2 md:mt-4"></div>
                </div>

                <div className="bg-paper-white dark:bg-obsidian rounded-t-[2rem] rounded-b-xl shadow-soft border border-gold-accent/30 p-2 relative overflow-hidden group hover:shadow-glow-gold transition-shadow duration-500">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-romance-red/20 to-transparent rounded-bl-full z-10 pointer-events-none"></div>

                    <div className="w-full h-48 md:h-72 rounded-t-[1.8rem] bg-center bg-no-repeat bg-cover relative border-b-4 border-gold-accent/20" style={{ backgroundImage: `url("${chapter.image}")` }}>
                        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-t-[1.8rem]"></div>
                    </div>

                    <div className="p-6 md:p-14 space-y-6 md:space-y-8 relative">
                        <span className="material-symbols-outlined absolute top-10 right-10 text-6xl md:text-9xl text-romance-red/5 -rotate-12 pointer-events-none select-none">auto_stories</span>
                        <div className="flex items-center gap-3 text-romance-red border-b border-romance-red/20 pb-4">
                            <span className="material-symbols-outlined text-xl">hourglass_empty</span>
                            <span className="text-xs font-bold uppercase tracking-widest font-sans text-romance-dark dark:text-romance-glow">Fragmento de Memoria #{chapter.id.toString().padStart(3, '0')}</span>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-2xl md:text-3xl font-serif font-bold text-text-main dark:text-champagne">{chapter.era}</h3>
                            <div className="text-text-light dark:text-champagne/80 text-base md:text-xl leading-relaxed md:leading-loose font-light font-serif">
                                {chapter.story.split('\n').map((paragraph, idx) => {
                                    if (idx === 0) {
                                        const firstLetter = paragraph.charAt(0);
                                        const rest = paragraph.slice(1);
                                        return (
                                            <p key={idx} className="mb-6">
                                                <span className="text-5xl float-left mr-2 mt-[-8px] text-romance-red font-serif drop-shadow-sm">{firstLetter}</span>
                                                {rest}
                                            </p>
                                        );
                                    }
                                    return <p key={idx} className="mb-6">{paragraph}</p>;
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-8 h-8 rounded-full bg-romance-red/10 flex items-center justify-center text-romance-red shadow-sm border border-romance-red/20">
                                <span className="material-symbols-outlined text-lg">edit_note</span>
                            </div>
                            <h2 className="text-xl font-serif font-bold text-text-main dark:text-champagne">Tu Perspectiva</h2>
                        </div>
                        <div className="flex flex-col bg-paper-white dark:bg-obsidian/80 rounded-xl shadow-md border border-gold-accent/20 overflow-hidden min-h-[260px] relative hover:border-romance-red/30 transition-colors">
                            <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px)', backgroundSize: '100% 28px', marginTop: '70px' }}></div>
                            <div className="p-5 bg-peach-dark/40 dark:bg-white/5 flex items-center gap-4 border-b border-romance-red/10">
                                <div className="size-12 rounded-full bg-cover bg-center border-2 border-white dark:border-white/20 shadow-md ring-1 ring-gold-accent/30" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAGkdQzszTOr2OMev3WUsXAV-SoZ0N5AxEyKwlPRpKMzWcUhAgjpVdpixquDjPXotQj8zMgEFwuzMBUUVp6vwDYQUTlGCiAXGukR9nGma97KLZpuYIO3T8Ru4-sbfvN-R-54a-dbIJGeBvMCmK4GSEIf1Bq3eJXebfI2rTSL5A3pJNxozS3vy38lwJk51XzoGE_AQ43XioxxMc742ML4vTbPWJv6CoxxlH4BZTK1bqINwS6Fu6vDLgigcvKADyiWSXo-YQ5ABVfFO76")' }}></div>
                                <div>
                                    <span className="text-sm font-bold text-text-main dark:text-champagne block font-serif">¿Qué es lo que sientes?</span>
                                    <span className="text-xs text-text-light dark:text-champagne/60 italic">Graba este recuerdo para siempre</span>
                                </div>
                            </div>
                            <textarea
                                value={reflection}
                                onChange={(e) => setReflection(e.target.value)}
                                className="flex-1 p-6 border-none focus:ring-0 bg-transparent text-text-main dark:text-champagne text-lg font-serif placeholder:text-text-light/40 dark:placeholder:text-champagne/40 placeholder:italic resize-none leading-7"
                                placeholder="Escribe aquí con el corazón..."
                            ></textarea>
                            <div className="p-4 flex justify-between items-center bg-white/50 dark:bg-black/20 border-t border-romance-red/10">
                                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1 ${saveStatus === 'saved' ? 'text-green-600 dark:text-green-400' :
                                    saveStatus === 'saving' ? 'text-gold-accent' : 'text-gray-400'
                                    }`}>
                                    {saveStatus === 'saved' && <><span className="material-symbols-outlined text-sm">cloud_done</span> Guardado</>}
                                    {saveStatus === 'saving' && <><span className="material-symbols-outlined text-sm animate-spin">sync</span> Guardando...</>}
                                    {saveStatus === 'unsaved' && <><span className="material-symbols-outlined text-sm">edit</span> Escribiendo...</>}
                                </span>
                                {/* Manual save optional */}
                                {saveStatus === 'unsaved' && (
                                    <button
                                        onClick={handleManualSave}
                                        className="text-xs text-romance-red hover:underline font-bold uppercase tracking-wider"
                                    >
                                        Guardar ahora
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-8 h-8 rounded-full bg-romance-red/10 flex items-center justify-center text-romance-red shadow-sm border border-romance-red/20">
                                <span className="material-symbols-outlined text-lg">psychology_alt</span>
                            </div>
                            <h2 className="text-xl font-serif font-bold text-text-main dark:text-champagne">La Pregunta del Alma</h2>
                        </div>
                        <div className={`bg-gradient-to-br from-romance-red to-romance-dark text-peach-cream p-8 rounded-xl shadow-glow-red flex flex-col justify-between min-h-[260px] relative overflow-hidden group border-2 border-gold-accent/20 transition-all ${isCompleted ? 'opacity-80 grayscale-[0.5]' : ''}`}>
                            <div className="absolute -right-6 -top-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                                <span className="material-symbols-outlined text-[10rem]">help</span>
                            </div>
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-peach-cream/80 text-3xl md:text-4xl drop-shadow-sm">format_quote</span>
                                    <p className="text-lg md:text-xl font-serif font-medium leading-relaxed italic pr-4 text-white drop-shadow-md">
                                        {chapter.riddle.question}
                                    </p>
                                </div>
                                {!isCompleted && (
                                    <form onSubmit={handleSubmitRiddle} className="space-y-2 pt-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold opacity-80 ml-1 text-peach-cream">Tu Respuesta</label>
                                        <div className="relative">
                                            <input
                                                value={riddleInput}
                                                onChange={(e) => setRiddleInput(e.target.value)}
                                                className={`w-full bg-black/20 border-white/20 rounded-lg placeholder:text-white/40 text-white focus:ring-white/40 focus:border-white/40 transition-all font-serif py-3 pl-4 pr-10 shadow-inner ${riddleError ? 'animate-pulse ring-2 ring-red-500' : ''}`}
                                                placeholder="Dime qué recuerdas..."
                                                type="text"
                                            />
                                            <span className="material-symbols-outlined absolute right-3 top-3 text-white/50">edit</span>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2 rounded-lg transition-colors border border-white/10 uppercase tracking-widest text-[10px]"
                                        >
                                            Confirmar Respuesta
                                        </button>
                                    </form>
                                )}
                                {isCompleted && (
                                    <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                                        <p className="font-bold text-white flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined">check_circle</span> Resuelto
                                        </p>
                                    </div>
                                )}
                            </div>

                            {!isCompleted && (
                                <div className="relative z-10 pt-4 flex items-center justify-between">
                                    <button
                                        onClick={handleGetHint}
                                        className="flex items-center gap-2 text-xs font-bold opacity-90 uppercase tracking-wide text-peach-cream hover:text-white transition-colors"
                                    >
                                        <div className="w-5 h-5 rounded-full border border-peach-cream/60 flex items-center justify-center bg-black/10">
                                            <span className="material-symbols-outlined text-[10px]">lock</span>
                                        </div>
                                        <span className="drop-shadow-sm">{isGettingHint ? "Consultando..." : "Revelar Pista"}</span>
                                    </button>
                                    {hint && (
                                        <span className="text-xs italic text-white/80 max-w-[60%] text-right animate-fade-in">{hint}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isCompleted && (
                    <div className="relative mt-8 group animate-fade-in">
                        <div className="absolute -inset-1 bg-gradient-to-r from-romance-red/20 via-gold-accent/20 to-romance-red/20 rounded-2xl opacity-60 blur-md pointer-events-none group-hover:opacity-80 transition-opacity duration-700"></div>
                        <div className="relative bg-paper-white dark:bg-obsidian border border-gold-accent/40 rounded-xl p-1 shadow-soft overflow-hidden">
                            <div className="bg-gradient-to-r from-peach-cream/50 to-white/50 dark:from-white/10 dark:to-white/5 border-b border-romance-red/10 p-5 flex items-center justify-between rounded-t-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-romance-red p-2 rounded-lg text-white shadow-md border border-white/20">
                                        <span className="material-symbols-outlined">emoji_events</span>
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-text-main dark:text-champagne text-lg">Capítulo Completado</h3>
                                        <p className="text-xs text-romance-red dark:text-romance-glow font-bold tracking-widest uppercase">Recompensas Desbloqueadas</p>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center gap-2 text-xs font-bold text-text-light/80 dark:text-champagne/80 bg-white/80 dark:bg-black/40 px-4 py-2 rounded-full border border-gold-accent/30 shadow-sm">
                                    <span className="material-symbols-outlined text-sm text-romance-red">verified</span>
                                    <span className="tracking-wider text-romance-dark dark:text-champagne">MEMORIA AUTÉNTICA</span>
                                </div>
                            </div>

                            <div className="p-8 md:p-10 flex flex-col md:flex-row gap-10 items-center md:items-start bg-cream-dust dark:bg-none">
                                <div className="flex flex-col items-center gap-5 w-full md:w-1/3">
                                    <div className="relative group/portrait cursor-pointer">
                                        <div className="w-40 h-40 md:w-48 md:h-48 rounded-full p-2 border-2 border-gold-accent/30 bg-white dark:bg-white/10 shadow-xl relative">
                                            <div className="w-full h-full rounded-full border-4 border-double border-romance-red/20 overflow-hidden relative">
                                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/portrait:scale-110" style={{ backgroundImage: `url("${chapter.image}")` }}></div>
                                            </div>
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-romance-red drop-shadow-md"><span className="material-symbols-outlined text-2xl fill-current">local_florist</span></div>
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-romance-red drop-shadow-md"><span className="material-symbols-outlined text-2xl fill-current">local_florist</span></div>
                                        </div>
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-romance-red text-white px-5 py-1.5 rounded-full shadow-lg border-2 border-white dark:border-white/20 whitespace-nowrap z-10 group-hover/portrait:-translate-y-1 transition-transform">
                                            <span className="text-xs font-bold font-serif tracking-widest uppercase">El Viajero</span>
                                        </div>
                                    </div>
                                    <p className="text-center text-xs text-text-light/70 dark:text-champagne/60 italic font-serif mt-2">Añadido a tu Bitácora de Vidas</p>
                                </div>

                                <div className="flex-1 w-full space-y-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1 bg-white dark:bg-white/5 rounded-lg p-1 shadow-sm border border-gold-accent/30 transition-all hover:-translate-y-1 duration-300 hover:shadow-md">
                                            <div className="h-full border border-dashed border-gold-accent/40 rounded-md p-4 flex items-center gap-4 bg-peach-cream/20 dark:bg-white/5">
                                                <div className="size-16 bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-amber-900/50 dark:to-amber-800/50 rounded-full flex items-center justify-center shadow-inner border border-amber-200 dark:border-amber-700">
                                                    <span className="material-symbols-outlined text-yellow-700 dark:text-gold-accent text-3xl drop-shadow-sm">token</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-text-main dark:text-champagne text-sm font-serif">Insignia de Alma Obtenida</h4>
                                                    <p className="text-xs text-text-light dark:text-champagne/60 italic mt-1">"{chapter.rewardBadge}"</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 bg-gray-900 rounded-lg p-1 shadow-glow-red border border-romance-red/40 flex flex-col relative overflow-hidden group/fragment">
                                            <div className="absolute inset-0 bg-stardust opacity-30"></div>
                                            <div className="absolute right-0 top-0 p-16 bg-romance-red/40 blur-3xl rounded-full translate-x-1/4 -translate-y-1/4 group-hover/fragment:bg-romance-red/50 transition-colors duration-500"></div>
                                            <div className="h-full border border-white/10 rounded-md p-4 flex items-center gap-4 relative z-10">
                                                <div className="size-16 bg-white/5 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-[inset_0_0_15px_rgba(209,0,36,0.3)]">
                                                    <span className="material-symbols-outlined text-white text-3xl drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">key</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white text-sm font-serif tracking-wide drop-shadow-md">Fragmento Secreto</h4>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="bg-black/50 border border-romance-red/50 px-3 py-1 rounded text-xs tracking-[0.2em] font-mono text-romance-glow font-bold shadow-[0_0_10px_rgba(255,77,109,0.2)]">
                                                            {chapter.fragmentCode}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-romance-red/5 dark:bg-romance-red/10 rounded-lg p-4 text-xs text-text-main/90 dark:text-champagne/90 border border-romance-red/20 flex gap-3 items-start">
                                        <span className="material-symbols-outlined text-lg shrink-0 text-romance-red">info</span>
                                        <p className="leading-relaxed font-serif italic text-text-light dark:text-champagne/80">
                                            Esta entrada de bitácora ha sido guardada. Reúne los 14 fragmentos para desbloquear el Capítulo Sorpresa Final en tu viaje.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isAtLimit ? (
                            <div className="flex flex-col items-center pt-8 pb-8 gap-4 text-center animate-fade-in">
                                <div className="w-16 h-1 bg-gold-accent/30 rounded-full mb-4"></div>
                                <h3 className="font-serif text-xl text-text-main dark:text-champagne font-bold">El Sendero descansa aquí</h3>
                                <p className="text-sm text-text-light dark:text-champagne/60 italic max-w-md">
                                    Has alcanzado el límite de las memorias reveladas hasta hoy.
                                    El destino aguarda a que las estrellas se alineen de nuevo.
                                </p>
                                <button
                                    onClick={onNextChapter}
                                    className="text-xs text-gold-accent uppercase tracking-widest font-bold hover:text-white transition-colors border-b border-gold-accent/30 pb-1 mt-2"
                                >
                                    Volver al Sendero
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center pt-8 pb-8 gap-8">
                                <div className="flex items-center gap-4 text-romance-red/40">
                                    <div className="h-px w-20 bg-romance-red/30"></div>
                                    <span className="material-symbols-outlined text-xl text-romance-red">favorite</span>
                                    <div className="h-px w-20 bg-romance-red/30"></div>
                                </div>
                                <button
                                    onClick={onNextChapter}
                                    className="flex items-center gap-3 md:gap-4 bg-romance-red text-white px-8 md:pl-10 md:pr-8 py-3.5 md:py-4 rounded-full text-base md:text-lg font-serif font-bold shadow-[0_0_30px_rgba(209,0,36,0.4)] hover:scale-105 hover:bg-romance-dark transition-all duration-300 group border-2 border-white/20 hover:shadow-[0_0_40px_rgba(209,0,36,0.6)]"
                                >
                                    <span>Continuar Viaje</span>
                                    <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center group-hover:bg-white group-hover:text-romance-red transition-colors">
                                        <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward_ios</span>
                                    </div>
                                </button>
                                <p className="text-sm text-text-light dark:text-champagne/60 font-serif italic opacity-70">El Capítulo {chapter.id + 1} aguarda...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoryReader;
