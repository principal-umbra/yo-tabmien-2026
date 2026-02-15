
import React, { useState, useEffect, useMemo } from 'react';
import { Chapter, UserProgress, UserJournal } from '../types';
import { getRiddleHint } from '../services/geminiService';
import { normalizeText, compareRiddle } from '../services/textUtils';

interface BookReaderProps {
  chapter: Chapter;
  progress: UserProgress;
  journal: UserJournal;
  onComplete: (chapterId: number) => void;
  onSaveReflection: (chapterId: number, text: string) => void;
  onClose: () => void;
}

const getStoryPages = (text: string, isMobile: boolean): string[][] => {
  // Config (Visual approximation in pixels)
  // Container height is ~695px (823px - 128px padding)
  // We use much larger height for mobile to allow more scrollable content per page
  const PAGE_HEIGHT = isMobile ? 1200 : 680;
  const FIRST_PAGE_HEIGHT = isMobile ? 800 : 350;

  const LINE_HEIGHT = isMobile ? 28 : 34;
  const PARAGRAPH_MARGIN = 24;
  const CHARS_PER_LINE = isMobile ? 55 : 65;

  const pages: string[][] = [];
  let currentPage: string[] = [];
  let currentHeight = 0;

  // Normalize text: split by paragraphs
  const paragraphs = text.split('\n').filter(p => p.trim() !== '');

  // We iterate through paragraphs and try to fit them
  // If a paragraph doesn't fit, we split it based on how many lines remain

  // Helper to calculate visual height of a text block
  const calcHeight = (txt: string) => {
    const lines = Math.ceil(txt.length / CHARS_PER_LINE);
    // Height = lines * line_height + margin
    // We assume every block added to currentPage gets a margin, 
    // except maybe if we manual split, but let's be safe and assume margin
    return (lines * LINE_HEIGHT) + PARAGRAPH_MARGIN;
  };

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const isFirstPage = pages.length === 0;
    const maxHeight = isFirstPage ? FIRST_PAGE_HEIGHT : PAGE_HEIGHT;

    const pHeight = calcHeight(p);

    // 1. If paragraph fits completely
    if (currentHeight + pHeight <= maxHeight) {
      currentPage.push(p);
      currentHeight += pHeight;
    }
    // 2. It doesn't fit completely -> Split it
    else {
      // Calculate remaining space in pixels
      const spaceLeft = maxHeight - currentHeight;

      // How many lines can we fit in the remaining space?
      // We subtract margin because this new chunk will be a "paragraph" in the view (with mb-6)
      const linesFit = Math.floor((spaceLeft - PARAGRAPH_MARGIN) / LINE_HEIGHT);

      // Widow/Orphan control: If we can't fit at least 2 lines, just break page
      if (linesFit < 2) {
        if (currentPage.length > 0) {
          pages.push(currentPage);
          currentPage = [];
          currentHeight = 0;
          i--; // Retry this paragraph on new page
          continue;
        }
        // If page is empty and we can't fit even 2 lines, we must fit something or we loop forever.
        // In that case, we will let logic below take 'linesFit' (even if 0 or 1) 
        // but max(1, linesFit)
      }

      // Calculate char limit for split
      // Ensure we take at least some chars if page is empty
      const targetLines = Math.max(1, linesFit);
      const targetChars = targetLines * CHARS_PER_LINE;

      // Cut the text
      const chunk = p.substring(0, targetChars);

      // Find a nice break point (sentence ending is best, space is okay)
      let splitIndex = -1;
      const sentenceMatch = chunk.match(/[.!?]["']?\s+(?=[^.!?]*$)/);
      if (sentenceMatch) {
        splitIndex = sentenceMatch.index! + sentenceMatch[0].length;
      } else {
        splitIndex = chunk.lastIndexOf(' ');
      }

      // If split is too aggressive (leaves too much whitespace), force it closer to limit
      if (splitIndex < targetChars * 0.75) {
        const lastSpace = chunk.lastIndexOf(' ');
        if (lastSpace > targetChars * 0.75) splitIndex = lastSpace;
        else if (currentPage.length === 0) splitIndex = targetChars; // Force strict if empty
      }

      // Safety fallback
      if (splitIndex <= 0) splitIndex = targetChars;

      const part1 = p.substring(0, splitIndex).trim();
      const part2 = p.substring(splitIndex).trim();

      if (part1) {
        currentPage.push(part1);
      }

      // Force page break
      pages.push(currentPage);
      currentPage = [];
      currentHeight = 0;

      // Handle remainder
      if (part2) {
        paragraphs[i] = part2; // Update current paragraph
        i--; // Retry on new page
      }
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
};

const DiaryPage: React.FC<{
  chapterId: number;
  initialReflection: string;
  onSave: (id: number, text: string) => void;
  journalEntry: string;
}> = ({ chapterId, initialReflection, onSave, journalEntry }) => {
  const [reflection, setReflection] = useState(initialReflection);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // 1. Initial Load from journal entry
  useEffect(() => {
    setReflection(journalEntry || '');
  }, [chapterId]); // Only on actual chapter change

  // 2. Real-time Sync from other devices
  useEffect(() => {
    // Only overwrite local state if we are currently "saved" (not locally dirty)
    if (saveStatus === 'saved') {
      const remoteValue = journalEntry || '';
      if (remoteValue !== reflection) {
        setReflection(remoteValue);
      }
    }
  }, [journalEntry, saveStatus]);

  // 3. Auto-save effect
  useEffect(() => {
    if (reflection === (journalEntry || '')) {
      setSaveStatus('saved');
      return;
    }

    setSaveStatus('unsaved');
    const timer = setTimeout(() => {
      setSaveStatus('saving');
      onSave(chapterId, reflection);
      setTimeout(() => setSaveStatus('saved'), 800);
    }, 4000); // 4s debounce to avoid interference

    return () => clearTimeout(timer);
  }, [reflection, chapterId, onSave, journalEntry]);

  return (
    <div className="h-full p-6 md:p-12 lg:p-16 flex flex-col justify-center relative bg-[#F9F1E6]">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")` }}></div>
      <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-[#8B0018]/20 pb-2">
        <h3 className="font-cinzel text-xl md:text-2xl text-[#8B0018]">Tu Diario</h3>
        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1 ${saveStatus === 'saved' ? 'text-green-600' :
          saveStatus === 'saving' ? 'text-amber-600' : 'text-gray-400'
          }`}>
          {saveStatus === 'saved' && <><span className="material-symbols-outlined text-sm">cloud_done</span> Guardado</>}
          {saveStatus === 'saving' && <><span className="material-symbols-outlined text-sm animate-spin">sync</span> Guardando</>}
          {saveStatus === 'unsaved' && <><span className="material-symbols-outlined text-sm">edit</span> Escribiendo</>}
        </span>
      </div>
      <p className="font-serif italic text-gray-600 mb-4 md:mb-6 text-xs md:text-sm">¿Qué ecos despierta esta historia en tu memoria?</p>
      <div className="flex-1 bg-white border border-gray-200 shadow-inner relative p-4 md:p-6 pt-6 md:pt-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '100% 32px', marginTop: '40px' }}></div>
        <div className="absolute top-0 bottom-0 left-8 md:left-12 w-px bg-red-100/50"></div>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Escribe tus pensamientos..."
          className="w-full h-full bg-transparent border-none p-0 font-serif text-lg leading-[32px] resize-none focus:ring-0 text-gray-800 placeholder:text-gray-300 relative z-10"
          style={{ lineHeight: '32px' }}
        />
      </div>
    </div>
  );
};

const BookReader: React.FC<BookReaderProps> = ({ chapter, progress, journal, onComplete, onSaveReflection, onClose }) => {
  const [viewIndex, setViewIndex] = useState(0);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reflection state moved to DiaryPage, but we keep a local sync for initial invalidation if needed
  // or simply pass journal[chapter.id] down.

  const [riddleInput, setRiddleInput] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [riddleError, setRiddleError] = useState(false);
  const [isCompleted, setIsCompleted] = useState(progress.completedChapters.includes(chapter.id));
  const [showJumpToPage, setShowJumpToPage] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [viewIndex]);

  // 1. Handle actual Chapter change
  useEffect(() => {
    setViewIndex(0);
    setRiddleInput('');
    setHint(null);
    setRiddleError(false);
  }, [chapter.id]);

  // 2. Handle background progress updates (e.g. cloud sync)
  useEffect(() => {
    setIsCompleted(progress.completedChapters.includes(chapter.id));
  }, [progress, chapter.id]);

  const storyPages = useMemo(() => getStoryPages(chapter.story, isMobile), [chapter.story, isMobile]);
  const textSpreadCount = Math.ceil((storyPages.length - 1) / 2);

  const totalViews = useMemo(() => {
    if (isMobile) {
      // Mobile: Polaroid (1) + Title/Page0 (1) + Remaining Pages (length - 1) + Diary (1) + Riddle (1)
      return 1 + 1 + (storyPages.length - 1) + 2;
    }
    // Desktop: Cover Spread (1) + Text Spreads + Interaction Spread (1)
    return 1 + textSpreadCount + 1;
  }, [isMobile, storyPages.length, textSpreadCount]);

  const handleNext = () => {
    if (viewIndex < totalViews - 1 && !flipDirection) {
      setFlipDirection('next');
      setTimeout(() => {
        setViewIndex(prev => prev + 1);
        setFlipDirection(null);
      }, 800);
    }
  };

  const handlePrev = () => {
    if (viewIndex > 0 && !flipDirection) {
      setFlipDirection('prev');
      setTimeout(() => {
        setViewIndex(prev => prev - 1);
        setFlipDirection(null);
      }, 800);
    }
  };

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

  // --- CONTENT RENDERERS (Stateless helpers) ---

  const renderLeft = (vIndex: number) => {
    // 1. Polaroid
    if (vIndex === 0) {
      return (
        <div className="h-full w-full flex items-center justify-center p-4 md:p-8 relative overflow-hidden bg-[#F2E8D5]">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")` }}></div>
          <div className="relative transform -rotate-1 md:-rotate-2 z-10 w-[85%] md:w-[70%] max-w-[320px]">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-8 z-30 drop-shadow-md">
              <svg viewBox="0 0 50 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-zinc-400">
                <path d="M15 80 V25 C15 14 24 5 35 5 C46 5 55 14 55 25 V95 C55 108 44 118 30 118 C16 118 5 108 5 95 V30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <div className="bg-white p-2 md:p-3 pb-10 md:pb-14 shadow-2xl relative">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")` }}></div>
              <div className="w-full aspect-[3/4] bg-gray-100 overflow-hidden relative shadow-inner">
                <img
                  src={chapter.image}
                  alt={chapter.title}
                  className="w-full h-full object-cover filter sepia-[0.25] contrast-[1.1] brightness-[0.95]"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/600?grayscale'; }}
                />
                <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-40 mix-blend-multiply pointer-events-none"></div>
              </div>
            </div>
            <div className="absolute bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 w-[90%] md:w-[85%] z-20 transform rotate-1">
              <div className="bg-[#fffde7]/90 backdrop-blur-[1px] py-2 md:py-2 px-1 text-center shadow-sm border border-black/5 relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-white/40 rotate-1 mix-blend-overlay blur-[0.5px]"></div>
                <p className="font-serif text-[11px] md:text-[11px] italic text-gray-800/90 font-bold leading-tight">"{chapter.subtitle}"</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 2. Interaction (Diary)
    const isInteractionView = vIndex === (isMobile ? totalViews - 2 : totalViews - 1);
    if (isInteractionView) {
      return (
        <DiaryPage
          chapterId={chapter.id}
          initialReflection={journal[chapter.id] || ''}
          onSave={onSaveReflection}
          journalEntry={journal[chapter.id]}
        />
      );
    }

    // 3. Text Page
    // On Desktop, view index 1 starts at page 1 (polaroid/title spread is index 0)
    // On Mobile, this function might be used directly if we refactor, but for now desktop rules apply
    const pageIdx = (vIndex * 2) - 1;
    const content = storyPages[pageIdx] || [];
    return (
      <div className="h-full p-6 md:p-12 lg:p-16 text-justify flex flex-col relative bg-[#F9F1E6]">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")` }}></div>
        <span className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 text-[10px] md:text-[10px] uppercase tracking-widest text-gray-400 font-bold font-sans">{pageIdx + 1}</span>
        <div className="flex-1 pt-6 md:pt-4">
          {content.map((p, i) => <p key={i} className="mb-4 md:mb-6 font-serif text-lg md:text-lg leading-relaxed md:leading-[1.8] text-gray-900">{p}</p>)}
        </div>
      </div>
    );
  };

  const renderRight = (vIndex: number) => {
    // 1. Title Page
    if (vIndex === 0) {
      const firstPageContent = storyPages[0];
      return (
        <div className="h-full p-8 md:p-12 lg:p-16 flex flex-col relative bg-[#F9F1E6]">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")` }}></div>
          <div className="absolute -top-0 right-6 md:right-10 w-6 md:w-8 h-20 md:h-28 bg-[#D10024] shadow-md z-20">
            <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[12px] md:border-l-[16px] border-l-transparent border-r-[12px] md:border-r-[16px] border-r-transparent border-b-[8px] md:border-b-[12px] border-b-[#F9F1E6] transform translate-y-[1px]"></div>
          </div>
          <div className="text-center mt-8 md:mt-12 mb-8 md:mb-12">
            <h4 className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#D10024] mb-3 md:mb-4">Memoria #{chapter.id.toString().padStart(3, '0')}</h4>
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-[#1A1A1A] mb-3 md:mb-4 leading-tight tracking-tight">{chapter.title}</h1>
            <h2 className="font-serif text-sm md:text-base italic text-gray-500 font-medium">{chapter.era}</h2>
            <div className="w-10 md:w-12 h-0.5 bg-gray-300 mx-auto mt-4 md:mt-6"></div>
          </div>
          <div className="flex-1 text-justify relative z-10 pt-4">
            {firstPageContent.map((p, i) => {
              if (i === 0) {
                const firstChar = p.charAt(0);
                const rest = p.slice(1);
                return (
                  <p key={i} className="mb-4 md:mb-6 font-serif text-lg md:text-lg leading-relaxed md:leading-[1.8] text-gray-900">
                    <span className="float-left text-[3.2rem] md:text-[4.2rem] font-cinzel text-[#8B0018] mr-2 md:mr-3 mt-[-4px] md:mt-[-6px] leading-[0.9]">{firstChar}</span>
                    {rest}
                  </p>
                )
              }
              return <p key={i} className="mb-4 md:mb-6 font-serif text-lg md:text-lg leading-relaxed md:leading-[1.8] text-gray-900">{p}</p>;
            })}
          </div>
          <span className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] uppercase tracking-widest text-gray-400 font-bold font-sans">{isMobile ? '' : '1'}</span>
        </div>
      );
    }

    // 2. Riddle View
    const isInteractionView = vIndex === (isMobile ? totalViews - 1 : totalViews - 1);
    if (isInteractionView) {
      return (
        <div className="h-full p-8 md:p-12 lg:p-16 flex flex-col justify-center relative items-center text-center bg-[#F9F1E6]">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")` }}></div>
          <div className="absolute top-0 right-0 p-12 md:p-24 bg-[#D10024]/5 rounded-bl-[60px] md:rounded-bl-[100px] pointer-events-none"></div>
          <div className="relative z-10 w-full max-w-md">
            {isCompleted ? (
              <div className="animate-fade-in space-y-4 md:space-y-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#D10024] to-[#8B0018] rounded-full flex items-center justify-center mx-auto shadow-xl text-white border-4 border-[#F9F1E6] ring-2 ring-[#D10024]/20"><span className="material-symbols-outlined text-3xl md:text-4xl">check</span></div>
                <div>
                  <h3 className="font-cinzel text-xl md:text-2xl text-gray-900 mb-2">Recuerdo Restaurado</h3>
                  <div className="h-px w-16 md:w-20 bg-gray-300 mx-auto my-3 md:my-4"></div>
                  <p className="font-serif text-gray-600 italic text-sm md:text-base">Has recuperado un fragmento de tu alma.</p>
                </div>
                <div className="bg-white/60 p-3 md:p-4 rounded border border-gray-200">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Código del Fragmento</span>
                  <p className="text-xl md:text-2xl font-mono font-bold text-[#D10024] mt-1">{chapter.fragmentCode}</p>
                </div>
                <button onClick={onClose} className="mt-2 md:mt-4 bg-transparent border-2 border-[#8B0018] text-[#8B0018] hover:bg-[#8B0018] hover:text-white transition-all px-6 md:px-8 py-2 md:py-3 rounded-sm font-bold uppercase tracking-widest text-[10px]">Cerrar Libro</button>
              </div>
            ) : (
              <div className="space-y-6 md:space-y-8">
                <div>
                  <span className="material-symbols-outlined text-3xl md:text-4xl text-[#8B0018] mb-3 md:mb-4 opacity-80">psychology_alt</span>
                  <h3 className="font-cinzel text-lg md:text-xl text-gray-900 mb-4 md:mb-6">El Enigma del Alma</h3>
                  <p className="font-serif text-xl md:text-xl italic text-gray-800 leading-relaxed">"{chapter.riddle.question}"</p>
                </div>
                <form onSubmit={handleSubmitRiddle} className="space-y-4 md:space-y-6">
                  <input
                    type="text"
                    value={riddleInput}
                    onChange={(e) => setRiddleInput(e.target.value)}
                    placeholder="Respuesta..."
                    className="w-full bg-white/50 border border-gray-300 focus:border-[#D10024] focus:ring-1 focus:ring-[#D10024]/20 text-center font-serif text-xl md:text-lg py-3 md:py-3 rounded text-gray-900 placeholder:text-gray-400 outline-none transition-all shadow-inner"
                  />
                  {riddleError && <span className="text-[10px] text-red-600 font-bold uppercase tracking-widest block animate-pulse">Respuesta Incorrecta</span>}
                  <div className="flex gap-4 justify-center items-center pt-2">
                    <button type="button" onClick={handleGetHint} disabled={isGettingHint} className="text-[10px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 disabled:opacity-50">{isGettingHint ? "Consultando..." : "Pedir Pista"}</button>
                    <div className="w-px h-3 bg-gray-300"></div>
                    <button type="submit" className="text-[10px] md:text-[10px] font-bold uppercase tracking-widest text-[#D10024] hover:text-[#8B0018]">Confirmar</button>
                  </div>
                </form>
                {hint && <div className="bg-[#fff9c4] p-3 md:p-4 rounded shadow-sm transform -rotate-1 border border-yellow-200"><p className="text-xs md:text-sm font-serif italic text-gray-700">"{hint}"</p></div>}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 3. Text Page
    const pageIdx = isMobile ? vIndex : vIndex * 2;
    const content = storyPages[pageIdx] || [];
    return (
      <div className="h-full p-6 md:p-12 lg:p-16 text-justify flex flex-col relative bg-[#F9F1E6]">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")` }}></div>
        <span className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 text-[10px] md:text-[10px] uppercase tracking-widest text-gray-400 font-bold font-sans">{pageIdx + 1}</span>
        <div className="flex-1 pt-6 md:pt-4">
          {content.map((p, i) => <p key={i} className="mb-4 md:mb-6 font-serif text-lg md:text-lg leading-relaxed md:leading-[1.8] text-gray-900">{p}</p>)}
        </div>
      </div>
    );
  };

  // --- CALCULATE CONTENT ---
  let leftContent: React.ReactNode = null;
  let rightContent: React.ReactNode = null;
  let flipFrontContent: React.ReactNode = null;
  let flipBackContent: React.ReactNode = null;
  let animationClass = '';

  if (isMobile) {
    if (viewIndex === 0) {
      rightContent = renderLeft(0);
    } else if (viewIndex === 1) {
      rightContent = renderRight(0);
    } else if (viewIndex < totalViews - 2) {
      rightContent = renderRight(viewIndex - 1);
    } else if (viewIndex === totalViews - 2) {
      rightContent = renderLeft(totalViews - 2);
    } else {
      rightContent = renderRight(totalViews - 1);
    }
  } else {
    if (flipDirection === 'next') {
      leftContent = renderLeft(viewIndex);
      rightContent = renderRight(viewIndex + 1);
      flipFrontContent = renderRight(viewIndex);
      flipBackContent = renderLeft(viewIndex + 1);
      animationClass = 'animate-flip-next';
    } else if (flipDirection === 'prev') {
      leftContent = renderLeft(viewIndex - 1);
      rightContent = renderRight(viewIndex);
      flipFrontContent = renderRight(viewIndex - 1);
      flipBackContent = renderLeft(viewIndex);
      animationClass = 'animate-flip-prev';
    } else {
      leftContent = renderLeft(viewIndex);
      rightContent = renderRight(viewIndex);
    }
  }

  // --- RENDER ---

  const showHeader = !isMobile;

  return (
    <div className="fixed inset-0 z-[100] bg-[#1a1a14] flex flex-col items-center justify-center p-0 md:p-4 lg:p-8">
      {showHeader && (
        <div className="w-full max-w-[1400px] flex items-center justify-between text-[#8a8a80] mb-4 px-4 font-serif text-xs tracking-[0.2em] uppercase">
          <div className="flex items-center gap-3"><span className="text-white">Yo También</span></div>
          <button onClick={onClose} className="hover:text-white transition-colors flex items-center gap-2"><span>Cerrar</span><span className="material-symbols-outlined text-lg">close</span></button>
        </div>
      )}

      {isMobile ? (
        // MOBILE VIEW: Clean, full-screen vertical layout
        <div className="flex-1 w-full bg-[#F9F1E6] flex flex-col relative overflow-hidden">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-black/5 bg-[#F2E8D5]/50 backdrop-blur-sm z-30">
            <span className="font-serif text-[10px] uppercase tracking-widest text-[#8B0018] font-bold">Memoria #{chapter.id.toString().padStart(3, '0')}</span>
            <button onClick={onClose} className="text-[#1a1a14] p-1"><span className="material-symbols-outlined">close</span></button>
          </div>

          {/* Main Content Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar relative">
            {rightContent}
          </div>

          {/* Mobile Navigation Footer */}
          <div className="p-4 bg-[#F2E8D5]/80 backdrop-blur-md border-t border-black/5 flex items-center justify-between z-30">
            <button
              onClick={handlePrev}
              disabled={viewIndex === 0}
              className={`flex items-center gap-1 text-[#8B0018] font-bold uppercase tracking-widest text-[10px] py-2 px-3 rounded-lg transition-all ${viewIndex === 0 ? 'opacity-20 grayscale' : 'active:scale-95 bg-[#8B0018]/5'}`}
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Atrás
            </button>

            <button
              onClick={() => setShowJumpToPage(!showJumpToPage)}
              className="px-4 py-2 bg-black/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2"
            >
              <span>{viewIndex + 1} / {totalViews}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={viewIndex === totalViews - 1}
              className={`flex items-center gap-1 text-[#8B0018] font-bold uppercase tracking-widest text-[10px] py-2 px-3 rounded-lg transition-all ${viewIndex === totalViews - 1 ? 'opacity-20 grayscale' : 'active:scale-95 bg-[#8B0018]/5'}`}
            >
              Siguiente
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      ) : (
        // DESKTOP VIEW: Book container
        <div className={`relative w-full max-w-[1400px] aspect-[1.5/1] md:aspect-[1.7/1] perspective-[2500px]`}>
          <div className={`w-full h-full bg-[#F2E8D5] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] flex rounded-[2px] relative preserve-3d`}>
            {/* Book Spine Shadow */}
            <div className="absolute left-1/2 top-0 bottom-0 w-12 -translate-x-1/2 bg-gradient-to-r from-black/5 via-black/20 to-black/5 z-20 pointer-events-none mix-blend-multiply"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-black/10 z-20"></div>

            {/* Left Page (Desktop) */}
            <div className="flex-1 relative bg-[#F9F1E6] overflow-hidden border-r border-gray-300/50 z-0 shadow-[inset_-15px_0_20px_rgba(0,0,0,0.05)]">
              {leftContent}
            </div>

            {/* Right Page (Desktop) */}
            <div className="flex-1 relative bg-[#F9F1E6] overflow-hidden z-0 shadow-[inset_15px_0_20px_rgba(0,0,0,0.05)]">
              {rightContent}
            </div>

            {/* Flip Surface (Desktop) */}
            {flipDirection && (
              <div className={`absolute top-0 bottom-0 left-1/2 w-1/2 preserve-3d origin-left z-10 ${animationClass}`}>
                <div className="absolute inset-0 bg-[#F9F1E6] backface-hidden overflow-hidden border-l border-gray-300/30 shadow-md">
                  <div className="w-full h-full shadow-[inset_15px_0_20px_rgba(0,0,0,0.05)]">
                    {flipFrontContent}
                  </div>
                </div>
                <div className="absolute inset-0 bg-[#F9F1E6] rotate-y-180 backface-hidden overflow-hidden border-r border-gray-300/30 shadow-md">
                  <div className="w-full h-full shadow-[inset_-15px_0_20px_rgba(0,0,0,0.05)]">
                    {flipBackContent}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Nav Arrows */}
          <button onClick={handlePrev} disabled={viewIndex === 0 || !!flipDirection} className={`absolute top-1/2 -left-20 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-4 ${viewIndex === 0 ? 'opacity-0 pointer-events-none' : ''}`}><span className="material-symbols-outlined text-5xl font-light">chevron_left</span></button>
          <button onClick={handleNext} disabled={viewIndex === totalViews - 1 || !!flipDirection} className={`absolute top-1/2 -right-20 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-4 ${viewIndex === totalViews - 1 ? 'opacity-0 pointer-events-none' : ''}`}><span className="material-symbols-outlined text-5xl font-light">chevron_right</span></button>
        </div>
      )}

      <div className="mb-4 md:mt-8 relative">
        {showJumpToPage && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-gray-200 z-50 w-72 md:w-80 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Seleccionar Página</span>
              <button onClick={() => setShowJumpToPage(false)} className="text-gray-400 hover:text-[#8B0018] transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {isMobile ? (
                // Mobile Jump Grid (Sequential)
                Array.from({ length: totalViews }).map((_, i) => {
                  let label = "";
                  let num = (i + 1).toString();
                  if (i === 0) label = "Foto";
                  else if (i === 1) label = "Port";
                  else if (i === totalViews - 2) { label = "Diario"; num = "D"; }
                  else if (i === totalViews - 1) { label = "Enig"; num = "?"; }
                  else { label = "Pág"; num = i.toString(); }

                  return (
                    <button
                      key={i}
                      onClick={() => { setViewIndex(i); setShowJumpToPage(false); }}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${viewIndex === i ? 'bg-[#8B0018] border-[#8B0018] text-white' : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-[#8B0018]/30 hover:bg-[#8B0018]/5'}`}
                    >
                      <span className="text-[8px] font-bold uppercase">{label}</span>
                      <span className="text-xs font-serif italic">{num}</span>
                    </button>
                  );
                })
              ) : (
                <>
                  {/* Portada */}
                  <button
                    onClick={() => { setViewIndex(0); setShowJumpToPage(false); }}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${viewIndex === 0 ? 'bg-[#8B0018] border-[#8B0018] text-white' : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-[#8B0018]/30 hover:bg-[#8B0018]/5'}`}
                  >
                    <span className="text-[9px] font-bold uppercase">Port</span>
                    <span className="text-xs font-serif italic">1</span>
                  </button>

                  {/* Story Spreads */}
                  {Array.from({ length: textSpreadCount }).map((_, i) => {
                    const targetView = i + 1;
                    const p1 = targetView * 2;
                    const p2 = targetView * 2 + 1;
                    const isActive = viewIndex === targetView;
                    return (
                      <button
                        key={targetView}
                        onClick={() => { setViewIndex(targetView); setShowJumpToPage(false); }}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${isActive ? 'bg-[#8B0018] border-[#8B0018] text-white' : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-[#8B0018]/30 hover:bg-[#8B0018]/5'}`}
                      >
                        <span className="text-[9px] font-bold uppercase">Págs</span>
                        <span className="text-xs font-serif italic">{p1}-{p2}</span>
                      </button>
                    );
                  })}

                  {/* Final/Enigma */}
                  <button
                    onClick={() => { setViewIndex(totalViews - 1); setShowJumpToPage(false); }}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${viewIndex === totalViews - 1 ? 'bg-[#8B0018] border-[#8B0018] text-white' : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-[#8B0018]/30 hover:bg-[#8B0018]/5'}`}
                  >
                    <span className="text-[9px] font-bold uppercase">Fin</span>
                    <span className="text-xs font-serif italic">?</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        <button
          onClick={() => setShowJumpToPage(!showJumpToPage)}
          className="text-[#8a8a80] text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-[#8B0018] transition-all cursor-pointer flex items-center gap-2 group"
          title="Ver todas las páginas"
        >
          <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">grid_view</span>
          {isMobile ? `Página ${viewIndex + 1}` : (viewIndex === 0 ? 'Portada (1)' : `Página ${viewIndex * 2} - ${viewIndex * 2 + 1}`)}
        </button>
      </div>
    </div>
  );
};

export default BookReader;
