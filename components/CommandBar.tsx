
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Asset, AssetCategory } from '../types';
import { Icons } from '../constants';

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Asset[];
  onNavigate: (tab: string) => void;
}

const CommandBar: React.FC<CommandBarProps> = ({ isOpen, onClose, wallet, onNavigate }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  const commands = [
    { id: 'dashboard', label: 'Dashboard Principal', icon: <Icons.TrendingUp />, type: 'nav' },
    { id: 'analytics', label: 'Análise de Performance', icon: <Icons.Sparkles />, type: 'nav' },
    { id: 'history', label: 'Histórico de Transações', icon: <Icons.Wallet />, type: 'nav' }
  ];

  const filteredItems = [
    ...commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase())),
    ...wallet.filter(a => a.ticker.toLowerCase().includes(query.toLowerCase())).map(a => ({
      id: a.ticker,
      label: `Ver Detalhes: ${a.ticker}`,
      icon: <span className="text-[10px] font-black w-5 h-5 flex items-center justify-center bg-white/10 rounded">{a.ticker[0]}</span>,
      type: 'asset'
    }))
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: -20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: -20 }} 
            className="w-full max-w-2xl bg-[#0f172a] rounded-2xl overflow-hidden relative z-10 border border-white/10 shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center gap-4">
              <Icons.Sparkles />
              <input 
                autoFocus
                type="text" 
                placeholder="O que você deseja buscar?" 
                className="bg-transparent border-none focus:ring-0 text-xl font-medium w-full placeholder:text-slate-600 outline-none text-white"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="text-[10px] bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-slate-500 font-mono">ESC</span>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-3 mb-3">Sugestões</div>
              <div className="space-y-1">
                {filteredItems.map((item, idx) => (
                  <button 
                    key={`${item.id}-${idx}`}
                    onClick={() => {
                      if (item.type === 'nav') onNavigate(item.id);
                      onClose();
                    }}
                    className="w-full text-left px-4 py-3.5 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 transition-all text-sm font-semibold flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500 group-hover:text-emerald-400">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-mono uppercase text-slate-500">Selecionar</span>
                  </button>
                ))}
                {filteredItems.length === 0 && (
                  <div className="py-12 text-center text-slate-600 uppercase text-[10px] font-black tracking-widest">
                    Nenhum resultado para "{query}"
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                   <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/5">↑↓</span>
                   <span className="text-[10px] text-slate-600 uppercase font-black">Navegar</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/5">↵</span>
                   <span className="text-[10px] text-slate-600 uppercase font-black">Abrir</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-700 font-bold italic">GEM Intelligence Terminal</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandBar;
