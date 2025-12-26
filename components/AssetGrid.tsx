
import React from 'react';
import { motion } from 'framer-motion';
import { Asset, AssetCategory } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AssetGridProps {
  wallet: Asset[];
  filter: AssetCategory | null;
  onFilter: (cat: AssetCategory | null) => void;
  isFocusMode: boolean;
}

const AssetGrid: React.FC<AssetGridProps> = ({ wallet, filter, onFilter, isFocusMode }) => {
  const filteredAssets = filter ? wallet.filter(a => a.category === filter) : wallet;
  const totalValueBRL = wallet.reduce((sum, a) => sum + (a.totalQuantity * a.currentPrice * (a.category === AssetCategory.CRYPTO ? 5.45 : 1)), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Composição do Wallet</h3>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => onFilter(null)}
            className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", !filter ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300")}
          >
            Todos
          </button>
          <button 
            onClick={() => onFilter(AssetCategory.CRYPTO)}
            className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", filter === AssetCategory.CRYPTO ? "bg-cyan-500/20 text-cyan-400" : "text-slate-500 hover:text-slate-300")}
          >
            Cripto
          </button>
          <button 
            onClick={() => onFilter(AssetCategory.FII)}
            className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", filter === AssetCategory.FII ? "bg-emerald-500/20 text-emerald-400" : "text-slate-500 hover:text-slate-300")}
          >
            FIIs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset, idx) => {
          const multiplier = asset.category === AssetCategory.CRYPTO ? 5.45 : 1;
          const valueBRL = asset.totalQuantity * asset.currentPrice * multiplier;
          const weight = (valueBRL / totalValueBRL) * 100;
          const isPositive = asset.dailyChange >= 0;

          return (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={asset.id}
              className="glass-card p-6 rounded-3xl group relative overflow-hidden flex flex-col justify-between min-h-[220px]"
            >
              {/* Sparkline Overlay */}
              <div className="absolute top-0 right-0 w-32 h-16 opacity-20 pointer-events-none overflow-hidden">
                <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d">
                   <motion.path
                     initial={{ pathLength: 0 }}
                     animate={{ pathLength: 1 }}
                     transition={{ duration: 1.5, ease: "easeOut" }}
                     d="M0,30 Q10,10 20,25 T40,5 T60,20 T80,15 T100,25"
                     fill="none"
                     stroke={asset.category === AssetCategory.CRYPTO ? "#06b6d4" : "#10b981"}
                     strokeWidth="2"
                   />
                </svg>
              </div>

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-lg",
                      asset.category === AssetCategory.CRYPTO ? "bg-cyan-500/10 text-cyan-400 shadow-cyan-500/10" : "bg-emerald-500/10 text-emerald-400 shadow-emerald-500/10"
                    )}>
                      {asset.ticker[0]}
                    </div>
                    <div>
                      <h4 className="font-black text-lg tracking-tight">{asset.ticker}</h4>
                      <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest">{asset.sector}</span>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-md font-mono text-[10px] font-black",
                    isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                  )}>
                    {isPositive ? '↑' : '↓'} {Math.abs(asset.dailyChange).toFixed(2)}%
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Posição Atual</p>
                  <p className="text-xl font-mono font-black tracking-tighter">
                    {isFocusMode ? '••••••' : `${asset.category === AssetCategory.CRYPTO ? '$' : 'R$'} ${asset.currentPrice.toLocaleString()}`}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Peso no Portfólio</span>
                  <span className="text-[10px] font-mono font-black text-slate-300">{weight.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${weight}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      asset.category === AssetCategory.CRYPTO ? "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                    )}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
    </div>
  );
};

export default AssetGrid;
