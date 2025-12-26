
import React, { useState } from 'react';
import { Asset, AssetCategory } from '../types';

interface RebalanceToolProps {
  assets: Asset[];
  usdToBrl: number;
}

const RebalanceTool: React.FC<RebalanceToolProps> = ({ assets, usdToBrl }) => {
  const [targetCrypto, setTargetCrypto] = useState(30);
  const [contributionBRL, setContributionBRL] = useState(5000);

  const currentValuesBRL = assets.reduce((acc, a) => {
    const multiplier = a.category === AssetCategory.CRYPTO ? usdToBrl : 1;
    const val = a.totalQuantity * a.currentPrice * multiplier;
    if (a.category === AssetCategory.CRYPTO) acc.crypto += val;
    else acc.fii += val;
    acc.total += val;
    return acc;
  }, { crypto: 0, fii: 0, total: 0 });

  const newTotalBRL = currentValuesBRL.total + contributionBRL;
  const targetCryptoValBRL = newTotalBRL * (targetCrypto / 100);
  const targetFiiValBRL = newTotalBRL * ((100 - targetCrypto) / 100);

  const cryptoDiffBRL = targetCryptoValBRL - currentValuesBRL.crypto;
  const fiiDiffBRL = targetFiiValBRL - currentValuesBRL.fii;

  let cryptoAllocBRL = 0;
  let fiiAllocBRL = 0;

  if (cryptoDiffBRL > 0 && fiiDiffBRL > 0) {
    const sumDiff = cryptoDiffBRL + fiiDiffBRL;
    cryptoAllocBRL = (cryptoDiffBRL / sumDiff) * contributionBRL;
    fiiAllocBRL = (fiiDiffBRL / sumDiff) * contributionBRL;
  } else if (cryptoDiffBRL > 0) {
    cryptoAllocBRL = contributionBRL;
  } else if (fiiDiffBRL > 0) {
    fiiAllocBRL = contributionBRL;
  }

  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-sm font-bold dark:text-slate-100 text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
        Calculadora de Aporte
      </h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Alocação Alvo (Cripto %)</label>
          <input 
            type="range" 
            min="0" max="100" 
            value={targetCrypto} 
            onChange={(e) => setTargetCrypto(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono font-bold">
            <span>{targetCrypto}% Cripto</span>
            <span>{100 - targetCrypto}% FIIs</span>
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Aporte Disponível (R$)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
            <input 
              type="number" 
              value={contributionBRL}
              onChange={(e) => setContributionBRL(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-[#09090b] border dark:border-[#27272a] border-slate-200 rounded-lg p-3 pl-10 dark:text-slate-100 text-slate-900 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        <div className="bg-black/5 dark:bg-black/20 p-4 rounded-xl border dark:border-slate-800/50 border-slate-200">
          <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-4">Sugestão de Compra</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Cripto (USD)</span>
                <span className="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold">+${(cryptoAllocBRL / usdToBrl).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${(cryptoAllocBRL / contributionBRL) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">FIIs (BRL)</span>
                <span className="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold">+R${fiiAllocBRL.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full" style={{ width: `${(fiiAllocBRL / contributionBRL) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RebalanceTool;
