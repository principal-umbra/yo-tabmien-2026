
import React, { useState, useEffect } from 'react';
import { UserProgress, Chapter } from '../types';
import { CHAPTERS } from '../constants';
import { loadProfileFromDB, getSoulAlias } from '../services/profileService';
import { Lock, Award, Key, ArrowLeft, Flower } from 'lucide-react';

interface LogbookProps {
    progress: UserProgress;
    onAttemptFinal: (code: string) => void;
}

// Load images dynamically from assets
const soulImagesGlob = import.meta.glob('../assets/images/personajes/*/*.{png,jpg,jpeg,webp}', { eager: true });

const getSoulGallery = (soulId: number): string[] => {
    const images: string[] = [];
    const searchString = `/${soulId}-`; // Match /1-rurik/ structure

    for (const path in soulImagesGlob) {
        // Check if path contains the folder pattern (e.g. .../1-rurik/...)
        // We look for "/{id}-" to ensure we match the folder start
        if (path.split('/personajes/')[1]?.startsWith(`${soulId}-`)) {
            const mod = soulImagesGlob[path] as { default: string };
            images.push(mod.default);
        }
    }
    return images;
};

const Logbook: React.FC<LogbookProps> = ({ progress, onAttemptFinal }) => {
    const [finalCodeInput, setFinalCodeInput] = useState('');
    const [selectedSoul, setSelectedSoul] = useState<Chapter | null>(null);
    const [currentImage, setCurrentImage] = useState<string | null>(null);

    const completedCount = progress.completedChapters.length;
    const totalChapters = CHAPTERS.length;
    const progressPercent = (completedCount / totalChapters) * 100;

    React.useEffect(() => {
        setCurrentImage(null);
    }, [selectedSoul]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAttemptFinal(finalCodeInput);
    };

    // --- DETAIL VIEW ---
    if (selectedSoul) {
        // 1. Try to load the extended profile from our new DB system
        const extendedProfile = loadProfileFromDB(selectedSoul.id);
        const galleryImages = getSoulGallery(selectedSoul.id);

        // Determine which image to show: User selection > First gallery image > Default cover
        const displayImage = currentImage || galleryImages[0] || selectedSoul.image;

        // 2. Fallback to the basic info in constants if DB file doesn't exist yet
        const profile = extendedProfile || selectedSoul.profile || {
            characterName: "Alma Desconocida",
            archetype: "EL MISTERIO",
            element: "Éter",
            description: "Los registros de esta alma son difusos...",
            roleDescription: "Por revelar.",
            timeTogether: "?",
            bondType: "Desconocido"
        };

        return (
            <div className="min-h-screen bg-[#1a1a1a] text-[#e0e0e0] font-sans relative animate-fade-in selection:bg-gold-accent selection:text-black">
                {/* Background Texture - Dark Paper */}
                <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/black-linen.png")` }}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"></div>

                {/* Top Navigation Bar */}
                <div className="relative z-20 flex justify-between items-center px-8 py-8 md:px-16">
                    <button
                        onClick={() => setSelectedSoul(null)}
                        className="flex items-center gap-3 text-gold-accent hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.2em] group"
                    >
                        <Key className="w-4 h-4 group-hover:-translate-x-1 transition-transform rotate-90" />
                        Volver a la Galería
                    </button>
                    <span className="text-xs font-serif font-bold text-romance-red tracking-[0.2em] uppercase opacity-80">
                        Archivo #{selectedSoul.id.toString().padStart(2, '0')}
                    </span>
                </div>

                <div className="container mx-auto px-4 lg:px-16 py-4 flex flex-col lg:flex-row gap-12 lg:gap-20 items-start justify-center min-h-[80vh]">

                    {/* Left Column: Portrait & Gallery (STICKY & NARROWER) */}
                    <div className="relative w-full lg:w-[30%] flex flex-col gap-8 perspective-[1000px] lg:sticky lg:top-32 self-start">

                        {/* Main Portrait Frame */}
                        <div className="relative group cursor-pointer transition-transform duration-700 hover:scale-[1.01] hover:rotate-1">
                            {/* Shadow */}
                            <div className="absolute inset-0 bg-black/60 translate-y-4 translate-x-4 blur-xl rounded-sm"></div>

                            {/* Golden Border Frame */}
                            <div className="relative bg-[#151515] p-2 border-2 border-[#8B7355] shadow-2xl rounded-sm">
                                {/* Inner Gold Line */}
                                <div className="border border-[#D4AF37]/30 p-1">
                                    <div className="relative aspect-[3/4] overflow-hidden bg-[#0a0a0a]">
                                        <div className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-105 filter sepia-[0.2] contrast-[1.15]"
                                            style={{ backgroundImage: `url("${displayImage}")` }}>
                                        </div>

                                        {/* Gradient Overlay for Text */}
                                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/90 to-transparent"></div>

                                        {/* Name Overlay */}
                                        <div className="absolute bottom-6 left-0 right-0 text-center px-4">
                                            <h2 className="font-serif italic text-2xl md:text-3xl lg:text-4xl text-[#e0e0e0] tracking-wide drop-shadow-md opacity-90">
                                                {profile.characterName}, <span className="text-white/60 text-xl md:text-2xl">{selectedSoul.era.split(',').pop()?.trim()}</span>
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Note - Custom Name (Moved) */}
                        <div className="absolute bottom-16 md:bottom-32 -right-4 md:-right-10 w-28 h-28 md:w-32 md:h-32 bg-[#F2E8D5] shadow-[0_5px_15px_rgba(0,0,0,0.3)] transform rotate-6 flex flex-col items-center justify-center text-[#2c2c2c] z-30 transition-transform hover:rotate-0 group/note">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/30 -rotate-1 blur-[0.5px]"></div>
                            <span className="text-[8px] md:text-[9px] uppercase tracking-widest opacity-60 font-bold mb-1 md:mb-2 text-center px-2">Identidad:</span>
                            <div className="w-12 md:w-16 h-px bg-black/10 mb-1 md:mb-2"></div>
                            <span className="font-serif italic text-lg md:text-xl text-[#8B0018] font-bold text-center px-2">
                                {getSoulAlias(selectedSoul.id)}
                            </span>
                        </div>


                        {/* Thumbnails (Polaroid Style) */}
                        <div className="flex gap-4 justify-center md:justify-start px-4">
                            {(galleryImages.length > 0 ? galleryImages : [selectedSoul.image, selectedSoul.image, selectedSoul.image]).slice(0, 3).map((img, i) => (
                                <div
                                    key={i}
                                    onClick={() => setCurrentImage(img)}
                                    className={`w-20 h-24 bg-paper-white p-2 shadow-lg transform hover:-translate-y-4 transition-all duration-300 rotate-2 odd:-rotate-1 cursor-pointer group/thumb relative ${currentImage === img || (!currentImage && i === 0 && galleryImages.length > 0) ? 'ring-2 ring-gold-accent scale-110 z-10' : 'opacity-80 hover:opacity-100'}`}
                                >
                                    <div className="w-full h-[80%] bg-gray-200 overflow-hidden grayscale group-hover/thumb:grayscale-0 transition-all">
                                        <img src={img} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="h-[20%] flex items-center justify-center">
                                        <span className="text-[6px] text-black font-serif italic opacity-60">fig. {i + 1}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Information (The Dossier) (WIDER) */}
                    <div className="w-full lg:w-[70%] relative pt-4 space-y-10">

                        {/* Header Section */}
                        <div className="relative border-b border-white/10 pb-8">
                            {/* Sticky Note - Element */}
                            <div className="absolute -top-10 -left-6 md:-left-12 w-28 h-28 bg-[#E8DCC4] shadow-[0_5px_15px_rgba(0,0,0,0.3)] transform -rotate-3 flex flex-col items-center justify-center text-[#2c2c2c] z-20">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/30 rotate-2 blur-[0.5px]"></div>
                                <span className="material-symbols-outlined text-2xl mb-1 opacity-80">
                                    {profile.element === 'Fuego' ? 'local_fire_department' :
                                        profile.element === 'Aire' ? 'air' :
                                            profile.element === 'Agua' ? 'water_drop' :
                                                profile.element === 'Hielo' ? 'ac_unit' : 'lens_blur'}
                                </span>
                                <span className="font-serif italic text-xl border-b border-black/20 pb-1">{profile.element}</span>
                            </div>



                            {/* Red Seal */}
                            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4">
                                <div className="w-16 h-16 bg-[#8B0018] rounded-full flex items-center justify-center shadow-[0_4px_6px_rgba(0,0,0,0.4),inset_0_-4px_4px_rgba(0,0,0,0.2)] border-2 border-[#5a0010]">
                                    <Flower className="text-[#D4AF37] w-8 h-8 opacity-80" />
                                </div>
                                <span className="block text-right text-[10px] text-[#8B0018] font-bold uppercase tracking-widest mt-2 mr-2">Descubierta</span>
                            </div>

                            <div className="pl-6 md:pl-20 pt-8 md:pt-4">
                                <h1 className="font-cinzel text-4xl md:text-7xl text-gold-accent tracking-normal drop-shadow-sm leading-tight">
                                    {profile.archetype}
                                </h1>
                                <p className="text-gray-500 font-serif italic mt-2 text-xs md:text-sm tracking-wide">
                                    Vida Pasada #{selectedSoul.id.toString().padStart(2, '0')} — <span className="text-gray-400">{selectedSoul.era}</span>
                                </p>
                            </div>
                        </div>

                        {/* Main Text Content */}
                        <div className="relative pr-4 md:pr-10">
                            <div className="font-serif text-lg leading-loose text-gray-300 text-justify whitespace-pre-wrap">
                                <span className="float-left text-[5rem] font-cinzel text-[#b89b35] mr-4 mt-[-10px] leading-[0.8] opacity-90">{profile.description.charAt(0)}</span>
                                {profile.description.slice(1)}
                            </div>
                        </div>

                        {/* Role Section */}
                        <div className="flex gap-6 items-start border-l-2 border-gold-accent/30 pl-6 py-2">
                            <div className="flex-1 space-y-2">
                                <h3 className="font-cinzel text-lg text-[#b89b35] tracking-widest uppercase">Rol del Alma</h3>
                                <p className="font-sans text-gray-400 leading-relaxed text-sm">
                                    {profile.roleDescription}
                                </p>
                            </div>
                        </div>

                        {/* Footer / Stats Note */}
                        <div className="flex flex-col md:flex-row items-end justify-between gap-8 pt-12 relative">

                            <button className="group flex items-center gap-3 text-[#D4AF37] hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.2em] px-0 py-2">
                                <span className="border-b border-[#D4AF37]/40 group-hover:border-white transition-colors pb-1">Leer Cartas Guardadas</span>
                                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>

                            {/* Sticky Note - Stats */}
                            <div className="relative w-full md:w-64 bg-[#F3E5AB] p-6 shadow-[0_10px_20px_rgba(0,0,0,0.4)] transform md:rotate-2 text-[#1a1a1a] transition-transform hover:rotate-0 duration-300 rounded-sm">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/40 backdrop-blur-sm shadow-sm transform -rotate-1"></div>
                                <div className="flex flex-row md:flex-col justify-around md:justify-start gap-4 md:space-y-3">
                                    <div className="flex-1">
                                        <span className="block text-[10px] uppercase tracking-widest opacity-60 font-bold mb-1">Tiempo:</span>
                                        <span className="font-serif italic text-lg md:text-xl leading-none block">{profile.timeTogether}</span>
                                    </div>
                                    <div className="flex-1 border-l md:border-l-0 md:border-t border-black/10 pl-4 md:pl-0 md:pt-2">
                                        <span className="block text-[10px] uppercase tracking-widest opacity-60 font-bold mb-1">Vínculo:</span>
                                        <span className="font-serif italic text-[#8B0018] font-bold text-lg md:text-2xl block transform md:-rotate-2">{profile.bondType}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    // --- GRID VIEW (DEFAULT) ---
    return (
        <div className="w-full max-w-6xl mx-auto py-12 px-4 animate-fade-in">
            <div className="text-center mb-16">
                <h2 className="font-serif text-4xl text-romance-dark dark:text-gold-accent mb-2">La Logia de Almas</h2>
                <p className="text-obsidian/60 dark:text-champagne/60 font-sans italic">
                    Aquí yacen los fragmentos de quienes fuimos.
                </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-12 max-w-md mx-auto">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 text-obsidian/50 dark:text-champagne/50">
                    <span>Restauración del Alma</span>
                    <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-romance-red to-gold-accent transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Grid of Souls */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
                {CHAPTERS.map((chapter) => {
                    const isCompleted = progress.completedChapters.includes(chapter.id);
                    const isUnlocked = progress.unlockedChapters.includes(chapter.id);

                    return (
                        <div
                            key={chapter.id}
                            onClick={() => isCompleted && setSelectedSoul(chapter)}
                            className={`aspect-[3/4] rounded-lg border-2 relative overflow-hidden group transition-all duration-300 cursor-pointer 
                        ${isCompleted
                                    ? 'border-gold-accent dark:border-gold-accent shadow-lg hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(212,175,55,0.2)]'
                                    : 'border-gray-200 dark:border-gray-800 grayscale opacity-70 pointer-events-none'}`}
                        >
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: isUnlocked ? `url(${chapter.image})` : 'none' }}
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                {isCompleted ? (
                                    <>
                                        <div className="w-12 h-12 bg-gold-accent/90 rounded-full flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(212,175,55,0.6)]">
                                            <Award className="text-obsidian w-6 h-6" />
                                        </div>
                                        <h4 className="font-serif font-bold text-white text-lg leading-tight drop-shadow-md">{chapter.title}</h4>
                                        <span className="mt-2 text-[10px] uppercase font-bold tracking-widest text-gold-accent bg-black/50 px-2 py-1 rounded border border-gold-accent/20">
                                            {chapter.rewardBadge}
                                        </span>
                                        <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity font-serif italic text-xs text-white/80">
                                            Ver Archivo
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center opacity-50">
                                        <Lock className="w-8 h-8 text-white mb-2" />
                                        <span className="text-white font-serif text-sm">Bloqueado</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* The Final Decrypter */}
            <div className="max-w-2xl mx-auto bg-obsidian text-champagne p-8 md:p-12 rounded-2xl shadow-2xl border border-gold-accent/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-stardust opacity-30 pointer-events-none" />
                <div className="relative z-10 text-center">
                    <Key className="w-12 h-12 mx-auto text-romance-red mb-4 animate-pulse-slow" />
                    <h3 className="font-serif font-bold text-3xl mb-4 text-gold-accent">El Descifrador Final</h3>
                    <p className="font-sans text-champagne/70 mb-8">
                        Reúne los 14 códigos de fragmento para desbloquear la verdad última.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={finalCodeInput}
                            onChange={(e) => setFinalCodeInput(e.target.value)}
                            placeholder="Ingresa la secuencia maestra..."
                            className="w-full bg-black/30 border border-gold-accent/30 rounded-lg p-4 text-center font-mono text-xl tracking-[0.2em] text-gold-accent placeholder:text-gold-accent/20 focus:border-gold-accent outline-none transition-colors"
                        />
                        <button
                            type="submit"
                            className="bg-romance-red hover:bg-romance-dark text-white font-serif font-bold py-3 px-8 rounded-lg shadow-[0_0_20px_rgba(209,0,36,0.4)] hover:shadow-[0_0_30px_rgba(209,0,36,0.6)] transition-all uppercase tracking-widest"
                        >
                            Revelar Verdad
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Logbook;
