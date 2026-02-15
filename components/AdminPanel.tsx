import React, { useState, useEffect } from 'react';
import { loadSettings, saveSettings, loadProgress, loadJournal, resetEllaData } from '../services/storageService';
import { SystemSettings, UserProgress, UserJournal } from '../types';
import { CHAPTERS } from '../constants';

interface AdminPanelProps {
    onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<'settings' | 'activity'>('activity');
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [ellaData, setEllaData] = useState<UserProgress | null>(null);
    const [ellaJournal, setEllaJournal] = useState<UserJournal | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const loadAllData = async () => {
        const [s, p, j] = await Promise.all([
            loadSettings(),
            loadProgress(),
            loadJournal()
        ]);
        setSettings(s);
        setEllaData(p);
        setEllaJournal(j);
    };

    // Refresh data on mount
    useEffect(() => {
        loadAllData();
    }, []);

    const handleSaveSettings = async () => {
        if (!settings) return;
        setIsSaving(true);
        await saveSettings(settings);
        setIsSaving(false);
        alert("Configuración guardada en la nube correctamente.");
    };

    const handleRefreshData = async () => {
        await loadAllData();
    };

    const handleResetProgress = async () => {
        if (window.confirm("⚠️ ¿Estás seguro de que quieres BORRAR todo el progreso de Ella?\n\nEsto eliminará:\n- Capítulos desbloqueados\n- Fragmentos recolectados\n- Diario y reflexiones\n\nEsta acción NO se puede deshacer.")) {
            if (window.confirm("CONFIRMACIÓN FINAL:\n\n¿Realmente deseas reiniciar el viaje de Ella a cero?")) {
                const success = await resetEllaData();
                if (success) {
                    alert("El progreso ha sido eliminado correctamente.");
                    await handleRefreshData();
                } else {
                    alert("Hubo un error al intentar borrar los datos.");
                }
            }
        }
    };

    if (!settings || !ellaData || !ellaJournal) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-gold-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gold-accent font-cinzel animate-pulse">Cargando datos del servidor...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans">

            {/* Admin Header */}
            <header className="bg-[#151515] border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold-accent/10 rounded-full flex items-center justify-center border border-gold-accent/30">
                        <span className="material-symbols-outlined text-gold-accent">admin_panel_settings</span>
                    </div>
                    <div>
                        <h1 className="font-cinzel text-lg font-bold text-white tracking-wide">Panel de Control</h1>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Bienvenido, Creador</p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors border border-red-900/50 px-4 py-2 rounded-lg hover:bg-red-900/20"
                >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Salir
                </button>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-6xl">

                {/* Navigation Tabs */}
                <div className="flex gap-4 mb-8 border-b border-white/10 pb-1">
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'activity' ? 'text-gold-accent border-b-2 border-gold-accent' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Actividad de Ella
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`pb-3 px-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'text-gold-accent border-b-2 border-gold-accent' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Configuración del Sistema
                    </button>
                </div>

                {/* --- ACTIVITY VIEW --- */}
                {activeTab === 'activity' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/5 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Última Conexión</h3>
                                    <span className="material-symbols-outlined text-gray-600">schedule</span>
                                </div>
                                <p className="text-2xl font-mono text-white">
                                    {new Date(ellaData.lastActive).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {new Date(ellaData.lastActive).toLocaleTimeString()}
                                </p>
                            </div>

                            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/5 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Progreso Global</h3>
                                    <span className="material-symbols-outlined text-gold-accent">trending_up</span>
                                </div>
                                <div className="flex items-end gap-2">
                                    <p className="text-4xl font-bold text-white">{ellaData.completedChapters.length}</p>
                                    <span className="text-gray-500 mb-1">/ {CHAPTERS.length} Vidas</span>
                                </div>
                                <div className="w-full h-1 bg-gray-800 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-gold-accent" style={{ width: `${(ellaData.completedChapters.length / CHAPTERS.length) * 100}%` }}></div>
                                </div>
                            </div>

                            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/5 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Capítulo Actual</h3>
                                    <span className="material-symbols-outlined text-romance-red">bookmark</span>
                                </div>
                                <p className="text-xl font-serif text-white truncate">
                                    {CHAPTERS.find(c => c.id === ellaData.currentChapterId)?.title || "Desconocido"}
                                </p>
                                <span className="inline-block mt-2 px-2 py-1 bg-romance-red/20 text-romance-red text-xs rounded font-bold border border-romance-red/30">
                                    ID: {ellaData.currentChapterId}
                                </span>
                            </div>
                        </div>

                        {/* Reflections Timeline */}
                        <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
                            <div className="bg-[#202020] px-6 py-4 border-b border-white/5 flex justify-between items-center">
                                <h3 className="text-white font-bold font-cinzel tracking-wide">Diario de Reflexiones</h3>
                                <button onClick={handleRefreshData} className="text-xs text-gold-accent hover:underline flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">refresh</span> Actualizar
                                </button>
                            </div>
                            <div className="divide-y divide-white/5">
                                {CHAPTERS.map(chapter => {
                                    const reflection = ellaJournal[chapter.id];
                                    const isCompleted = ellaData.completedChapters.includes(chapter.id);

                                    return (
                                        <div key={chapter.id} className="p-6 hover:bg-white/[0.02] transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border ${isCompleted ? 'bg-gold-accent/10 border-gold-accent/30 text-gold-accent' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                                                    <span className="font-serif font-bold text-lg">{chapter.id}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="text-white font-bold text-sm">{chapter.title}</h4>
                                                        {isCompleted ? (
                                                            <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-800 uppercase font-bold">Completado</span>
                                                        ) : (
                                                            <span className="text-[10px] bg-gray-800 text-gray-500 px-2 py-1 rounded border border-gray-700 uppercase font-bold">Pendiente</span>
                                                        )}
                                                    </div>
                                                    {reflection ? (
                                                        <div className="bg-black/40 p-4 rounded-lg border border-white/5 relative">
                                                            <span className="material-symbols-outlined absolute top-2 right-2 text-white/10">format_quote</span>
                                                            <p className="text-gray-300 font-serif italic text-sm leading-relaxed">"{reflection}"</p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-600 text-xs italic">Sin reflexión registrada aún.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SETTINGS VIEW --- */}
                {activeTab === 'settings' && (
                    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">

                        {/* 0. Personalización de Ella */}
                        <div className="bg-[#1a1a1a] p-8 rounded-xl border border-romance-red/20 shadow-lg relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-romance-red/10 rounded-lg flex items-center justify-center text-romance-red border border-romance-red/30">
                                    <span className="material-symbols-outlined text-2xl">favorite</span>
                                </div>
                                <div>
                                    <h3 className="text-white text-xl font-cinzel font-bold">Personalización</h3>
                                    <p className="text-gray-400 text-sm">Cómo se verá el perfil de Ella.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider font-bold">Nombre para Ella</label>
                                    <input
                                        type="text"
                                        value={settings.ellaName}
                                        onChange={(e) => setSettings({ ...settings, ellaName: e.target.value })}
                                        placeholder="Ej: Mi Amor, Sofia..."
                                        className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-romance-red focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider font-bold">Mensaje de Bienvenida / Bio</label>
                                    <input
                                        type="text"
                                        value={settings.ellaBio}
                                        onChange={(e) => setSettings({ ...settings, ellaBio: e.target.value })}
                                        placeholder="Un mensaje corto..."
                                        className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-romance-red focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 1. Control de Ritmo (Unlock Limit) */}
                        <div className="bg-[#1a1a1a] p-8 rounded-xl border border-gold-accent/20 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-20 bg-gold-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gold-accent/20 rounded-lg flex items-center justify-center text-gold-accent border border-gold-accent/30">
                                    <span className="material-symbols-outlined text-2xl">lock_clock</span>
                                </div>
                                <div>
                                    <h3 className="text-white text-xl font-cinzel font-bold">Control de Ritmo</h3>
                                    <p className="text-gray-400 text-sm">Limita hasta qué capítulo puede avanzar Ella.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-300 font-bold">Capítulo Máximo Desbloqueable</span>
                                        <span className="text-gold-accent font-mono text-xl font-bold">{settings.maxUnlockableChapter} / 14</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="14"
                                        value={settings.maxUnlockableChapter}
                                        onChange={(e) => setSettings({ ...settings, maxUnlockableChapter: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold-accent"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-600 mt-2 font-mono uppercase tracking-widest">
                                        <span>Cap 1</span>
                                        <span>Cap 14</span>
                                    </div>
                                </div>

                                <div className="bg-black/40 p-4 rounded border border-white/5">
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        <strong className="text-gold-accent">Nota:</strong> Si estableces esto en "5", Ella podrá jugar hasta completar el capítulo 5. Aunque lo complete, el capítulo 6 permanecerá bloqueado en su mapa hasta que tú lo aumentes aquí.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Security (Passwords) */}
                        <div className="bg-[#1a1a1a] p-8 rounded-xl border border-white/10 shadow-lg">
                            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
                                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white border border-gray-700">
                                    <span className="material-symbols-outlined">security</span>
                                </div>
                                <div>
                                    <h3 className="text-white text-lg font-cinzel font-bold">Seguridad y Acceso</h3>
                                    <p className="text-gray-400 text-xs">Gestiona las llaves de entrada.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Ella's Security */}
                                <div className="space-y-4">
                                    <h4 className="text-romance-red font-bold uppercase tracking-widest text-xs border-l-2 border-romance-red pl-3">Perfil de Ella</h4>

                                    <div className="flex items-center justify-between bg-black/30 p-3 rounded border border-white/5">
                                        <span className="text-sm text-gray-300">Requerir Contraseña</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.ellaPasswordEnabled}
                                                onChange={(e) => setSettings({ ...settings, ellaPasswordEnabled: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-romance-red"></div>
                                        </label>
                                    </div>

                                    <div className={`transition-opacity ${settings.ellaPasswordEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                        <label className="block text-xs text-gray-500 mb-1">Contraseña para Ella</label>
                                        <input
                                            type="text"
                                            value={settings.ellaPassword || ''}
                                            onChange={(e) => setSettings({ ...settings, ellaPassword: e.target.value })}
                                            placeholder="Escribe la clave..."
                                            className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white font-mono focus:border-romance-red focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* El's Security */}
                                <div className="space-y-4">
                                    <h4 className="text-gold-accent font-bold uppercase tracking-widest text-xs border-l-2 border-gold-accent pl-3">Perfil de Él (Admin)</h4>

                                    <div className="flex items-center justify-between bg-black/30 p-3 rounded border border-white/5">
                                        <span className="text-sm text-gray-300">Requerir Contraseña</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.elPasswordEnabled}
                                                onChange={(e) => setSettings({ ...settings, elPasswordEnabled: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-accent"></div>
                                        </label>
                                    </div>

                                    <div className={`transition-opacity ${settings.elPasswordEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                        <label className="block text-xs text-gray-500 mb-1">Contraseña Admin</label>
                                        <input
                                            type="text"
                                            value={settings.elPassword || ''}
                                            onChange={(e) => setSettings({ ...settings, elPassword: e.target.value })}
                                            placeholder="Escribe la clave..."
                                            className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white font-mono focus:border-gold-accent focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Danger Zone */}
                        <div className="bg-[#1a1a1a] p-8 rounded-xl border border-red-900/30 shadow-lg relative overflow-hidden group">
                            <div className="absolute inset-0 bg-red-900/5 group-hover:bg-red-900/10 transition-colors pointer-events-none"></div>

                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="w-12 h-12 bg-red-900/20 rounded-lg flex items-center justify-center text-red-500 border border-red-900/50">
                                    <span className="material-symbols-outlined text-2xl">dangerous</span>
                                </div>
                                <div>
                                    <h3 className="text-white text-xl font-cinzel font-bold">Zona de Peligro</h3>
                                    <p className="text-red-400 text-sm">Acciones irreversibles.</p>
                                </div>
                            </div>

                            <div className="flex bg-black/40 p-4 rounded border border-red-900/30 items-center justify-between relative z-10">
                                <div>
                                    <h4 className="text-red-500 font-bold uppercase text-xs tracking-widest mb-1">Reiniciar Progreso de Ella</h4>
                                    <p className="text-gray-400 text-xs">Elimina todo el historial, capítulos y diario.</p>
                                </div>
                                <button
                                    onClick={handleResetProgress}
                                    className="bg-red-900/30 hover:bg-red-900/50 text-red-500 font-bold py-2 px-4 rounded border border-red-900/50 hover:border-red-500/50 transition-all text-xs uppercase tracking-widest flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">delete_forever</span>
                                    Borrar Todo
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSaveSettings}
                                className="bg-gold-accent hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-gold-accent/20 transition-all uppercase tracking-widest text-sm flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">save</span>
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default AdminPanel;