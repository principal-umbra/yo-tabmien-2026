
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { loadSettings } from '../services/storageService';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<UserRole>('Ella');
  const [password, setPassword] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState('');
  
  // Load settings to check if passwords are required
  const settings = loadSettings();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let isAuthenticated = false;

    if (selectedUser === 'Ella') {
        if (!settings.ellaPasswordEnabled) {
            isAuthenticated = true;
        } else {
            if (password === (settings.ellaPassword || '')) isAuthenticated = true;
        }
    } else {
        // User is 'El'
        if (!settings.elPasswordEnabled) {
            isAuthenticated = true;
        } else {
            if (password === (settings.elPassword || '')) isAuthenticated = true;
        }
    }

    if (isAuthenticated) {
        setIsAnimating(true);
        setTimeout(() => {
          onLogin(selectedUser);
        }, 800);
    } else {
        setError('Credenciales incorrectas');
        // Shake animation logic could go here
    }
  };

  const isPasswordRequired = selectedUser === 'Ella' ? settings.ellaPasswordEnabled : settings.elPasswordEnabled;

  return (
    <div className="min-h-screen w-full bg-[#121212] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse-slow pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-[#1a0505] to-black opacity-90 pointer-events-none"></div>
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-romance-red/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-accent/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Card */}
      <div className={`relative z-10 w-full max-w-md bg-obsidian/80 backdrop-blur-md border border-gold-accent/30 p-1 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-700 transform ${isAnimating ? 'scale-95 opacity-0 blur-sm' : 'scale-100 opacity-100'}`}>
        <div className="bg-gradient-to-b from-[#1a1a1a] to-black rounded-xl p-8 md:p-12 border border-white/5 relative overflow-hidden">
          
          {/* Header */}
          <div className="text-center mb-10 space-y-2">
            <span className="material-symbols-outlined text-romance-red text-4xl drop-shadow-[0_0_10px_rgba(209,0,36,0.6)] animate-pulse">favorite</span>
            <h1 className="font-cinzel text-3xl md:text-4xl text-white font-bold tracking-wide">Yo También</h1>
            <p className="font-serif text-gold-accent/60 italic text-sm tracking-widest uppercase">El Sendero de las 14 Almas</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            
            {/* User Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] block text-center">¿Quién Eres?</label>
              <div className="grid grid-cols-2 gap-4 p-1 bg-black/50 rounded-lg border border-white/10 relative">
                
                {/* Selection Indicator */}
                <div 
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-romance-dark to-romance-red rounded-md shadow-lg transition-all duration-300 ease-out ${selectedUser === 'Ella' ? 'left-1' : 'left-[calc(50%+4px)]'}`}
                ></div>

                <button 
                  type="button"
                  onClick={() => { setSelectedUser('Ella'); setError(''); setPassword(''); }}
                  className={`relative z-10 py-3 flex flex-col items-center justify-center gap-1 transition-colors duration-300 ${selectedUser === 'Ella' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                >
                  <span className="material-symbols-outlined text-2xl">face_3</span>
                  <span className="font-serif font-bold tracking-widest text-sm">ELLA</span>
                </button>

                <button 
                  type="button"
                  onClick={() => { setSelectedUser('El'); setError(''); setPassword(''); }}
                  className={`relative z-10 py-3 flex flex-col items-center justify-center gap-1 transition-colors duration-300 ${selectedUser === 'El' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                >
                  <span className="material-symbols-outlined text-2xl">face_6</span>
                  <span className="font-serif font-bold tracking-widest text-sm">ÉL</span>
                </button>
              </div>
            </div>

            {/* Password Field - Conditionally Rendered or Visual State */}
            <div className="space-y-2 transition-all duration-300">
              <div className="relative group">
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-white/5 border rounded-lg px-4 py-4 pl-12 text-white font-serif placeholder:text-white/20 focus:outline-none focus:border-gold-accent/50 focus:ring-1 focus:ring-gold-accent/30 transition-all text-center tracking-[0.5em] ${error ? 'border-red-500 animate-pulse' : 'border-white/10'}`}
                  placeholder={isPasswordRequired ? "••••••" : "SIN CLAVE"}
                  disabled={!isPasswordRequired}
                />
                <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-500' : 'text-white/30 group-focus-within:text-gold-accent'}`}>
                    {isPasswordRequired ? 'lock' : 'lock_open'}
                </span>
              </div>
              
              {error ? (
                  <p className="text-[10px] text-center text-red-500 font-bold tracking-widest uppercase">{error}</p>
              ) : (
                  <p className="text-[10px] text-center text-white/30 font-serif italic">
                    {isPasswordRequired ? "(Ingresa tu llave maestra)" : "(Acceso libre habilitado)"}
                  </p>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-gold-accent via-[#e5c558] to-gold-accent text-black font-cinzel font-bold text-lg py-4 rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {selectedUser === 'El' ? 'Administrar' : 'Entrar'}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>

          </form>
        </div>
        
        {/* Footer decoration */}
        <div className="absolute -bottom-10 left-0 w-full flex justify-center opacity-50">
           <span className="font-serif text-[10px] text-gold-accent/40 tracking-[0.5em] uppercase">Amor Vincit Omnia</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
