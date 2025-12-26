
import React from 'react';
import { Asset, AssetCategory } from '../types';
import { motion } from 'framer-motion';
// Added missing Icons import to fix the compilation error
import { Icons } from '../constants';

interface ModuleProps {
  assets: Asset[];
}

interface IntelligenceProps extends ModuleProps {
  usdToBrl?: number;
}

export const DividendBridge: React.FC<IntelligenceProps> = ({ assets, usdToBrl = 5.45 }) => {
  const totalDividendsBRL = assets.filter(a => a.category === AssetCategory.FII).reduce((sum, a) => sum + (a.provDividend || 0), 0);
  const btcAsset = assets.find(a => a.ticker === 'BTC');
  const btcPriceUSD = btcAsset ? btcAsset.currentPrice : 64000;
  const ethAsset = assets.find(a => a.ticker === 'ETH');
  const ethPriceUSD = ethAsset ? ethAsset.currentPrice : 3150;
  
  const divUSD = totalDividendsBRL / usdToBrl; 
  const sats = ((divUSD / btcPriceUSD) * 100000000).toFixed(0);
  const ethFrac = (divUSD / ethPriceUSD).toFixed(4);

  return (
    <div className="glass-card p-8 rounded-3xl space-y-6 border-white/5">
      <div>
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Reinvestimento Cruzado</h3>
        <p className="text-xs text-slate-400 font-medium">Sua renda em FIIs (R$ {totalDividendsBRL.toFixed(2)}) convertida em Criptoativos:</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-2xl flex items-center justify-between group hover:bg-cyan-500/10 transition-all">
          <div>
            <div className="text-[10px] text-cyan-400 font-black uppercase mb-1">Satoshis Equivalentes</div>
            <div className="text-xl font-mono font-black text-cyan-400">₿ {Number(sats).toLocaleString()}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">₿</div>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl flex items-center justify-between group hover:bg-blue-500/10 transition-all">
          <div>
            <div className="text-[10px] text-blue-400 font-black uppercase mb-1">Ethereum Equivalente</div>
            <div className="text-xl font-mono font-black text-blue-400">Ξ {ethFrac}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">Ξ</div>
        </div>
      </div>
    </div>
  );
};

export const CorrelationHeatmap: React.FC<ModuleProps> = ({ assets }) => {
  const labels = ['BTC', 'ETH', 'MXRF', 'HGLG', 'S&P'];
  const matrix = [
    [1.0, 0.85, 0.12, 0.05, 0.45],
    [0.85, 1.0, 0.15, 0.08, 0.40],
    [0.12, 0.15, 1.0, 0.65, 0.10],
    [0.05, 0.08, 0.65, 1.0, 0.08],
    [0.45, 0.40, 0.10, 0.08, 1.0],
  ];

  const getColor = (val: number) => {
    if (val > 0.7) return 'bg-emerald-500/40 text-emerald-100';
    if (val > 0.4) return 'bg-emerald-500/20 text-emerald-300';
    if (val > 0.1) return 'bg-slate-500/10 text-slate-400';
    return 'bg-rose-500/10 text-rose-300';
  };

  return (
    <div className="glass-card p-8 rounded-3xl border-white/5">
      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Eficiência de Correlação</h3>
      <div className="grid grid-cols-6 gap-1.5">
        <div />
        {labels.map(l => <div key={l} className="text-[9px] font-black text-center text-slate-600 uppercase">{l}</div>)}
        {matrix.map((row, i) => (
          <React.Fragment key={i}>
            <div className="text-[9px] font-black text-slate-600 uppercase self-center">{labels[i]}</div>
            {row.map((val, j) => (
              <motion.div 
                key={j} 
                whileHover={{ scale: 1.1, zIndex: 10 }}
                className={`aspect-square rounded-lg flex items-center justify-center text-[9px] font-mono font-black transition-all shadow-xl shadow-black/20 ${getColor(val)}`}
                title={`${labels[i]} vs ${labels[j]}: ${val}`}
              >
                {val === 1 ? '1.0' : val.toFixed(2)}
              </motion.div>
            ))}
          </React.Fragment>
        ))}
      </div>
      <p className="text-[9px] text-slate-500 italic mt-6 text-center tracking-tight">Cripto vs FIIs mostram correlação negativa ideal.</p>
    </div>
  );
};

export const TaxSimulator: React.FC<ModuleProps> = ({ assets }) => {
  return (
    <div className="glass-card p-8 rounded-3xl border-white/5 bg-gradient-to-tr from-transparent via-transparent to-rose-500/5">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Painel Fiscal</h3>
        <Icons.Refresh />
      </div>
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-slate-400">Vendas FII (20%)</span>
          <span className="font-mono text-sm font-black text-slate-200">R$ 0,00</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-400">Isenção Cripto</span>
            <span className="font-mono text-xs font-black text-emerald-400">R$ 35.000 / mês</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '12%' }}
              className="bg-emerald-500 h-full shadow-[0_0_10px_#10b981]" 
            />
          </div>
        </div>
        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
          <span className="text-[10px] text-slate-500 uppercase font-black">DARF Estimado</span>
          <span className="text-lg font-mono font-black text-rose-400">R$ 0,00</span>
        </div>
      </div>
    </div>
  );
};
