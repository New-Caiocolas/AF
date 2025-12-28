
import React, { useState } from 'react';
import { auth, GoogleAuthProvider, signInWithPopup } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { motion } from 'framer-motion';
import { Icons } from '../constants';

export const LoginTerminal: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card w-full max-w-md p-10 rounded-[2.5rem] relative z-10 border-white/5 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6">
            <span className="font-black text-slate-900 text-3xl">G</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white mb-2">GEM INTELLIGENCE</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">Institutional Grade Assets Hub</p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-black text-slate-600 ml-1">Terminal ID (Email)</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-mono focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-700"
              placeholder="terminal@gemhub.ai"
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-black text-slate-600 ml-1">Access Key (Password)</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-mono focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-700"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-[10px] text-rose-500 font-bold text-center uppercase tracking-tight">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-white/5"
          >
            {isRegistering ? 'Initialize Terminal' : 'Access Dashboard'}
          </button>
        </form>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-[#020617] px-4 text-slate-600">Cross-Sync</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-2xl text-xs font-bold transition-all text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Connect with Cloud Identity
          </button>
        </div>

        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full mt-6 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors"
        >
          {isRegistering ? 'Already have account? Sign In' : "Don't have a node? Create One"}
        </button>
      </motion.div>
    </div>
  );
};
