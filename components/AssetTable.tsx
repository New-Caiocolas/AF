
import React from 'react';
import { Asset, AssetCategory, DataSource } from '../types';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AssetTableProps {
  title: string;
  assets: Asset[];
  category: AssetCategory;
  currencySymbol: string;
  source: DataSource;
  onSourceToggle: (category: AssetCategory) => void;
  isFallbackActive?: boolean;
}

const AssetTable: React.FC<AssetTableProps> = ({ 
  title, 
  assets, 
  category, 
  currencySymbol, 
  source, 
  onSourceToggle,
  isFallbackActive
}) => {
  return (
    <div className="w-full">
      {title && (
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">{title}</h3>
          <button 
            onClick={() => onSourceToggle(category)}
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
              source === 'realtime' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-slate-500 border-white/5"
            )}
          >
            {source === 'realtime' ? '● Realtime' : 'Simulado'}
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="text-slate-600 font-black uppercase tracking-[0.2em] text-[9px] border-b border-white/5">
            <tr>
              <th className="px-4 py-4">Ticker</th>
              <th className="px-4 py-4 text-right">Price</th>
              <th className="px-4 py-4 text-right">24h Change</th>
              <th className="px-4 py-4 text-center">Trend (7d)</th>
              <th className="px-4 py-4 text-right">Balance</th>
              <th className="px-4 py-4 text-right">Value ({currencySymbol})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {assets.map((asset) => (
              <motion.tr 
                key={asset.id}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                className="group transition-colors"
              >
                <td className="px-4 py-5">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px]",
                      asset.category === AssetCategory.CRYPTO ? "bg-cyan-500/10 text-cyan-400" : "bg-emerald-500/10 text-emerald-400"
                    )}>
                      {asset.ticker[0]}
                    </div>
                    <div>
                      <div className="font-black dark:text-white">{asset.ticker}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{asset.sector}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-5 text-right font-mono font-bold">
                  {currencySymbol} {asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className={cn(
                  "px-4 py-5 text-right font-mono font-black",
                  asset.dailyChange >= 0 ? "text-emerald-400" : "text-rose-400"
                )}>
                  <span className={cn(
                    "px-2 py-0.5 rounded-md",
                    asset.dailyChange >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10"
                  )}>
                    {asset.dailyChange >= 0 ? '+' : ''}{asset.dailyChange.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-5 text-center">
                  {/* Simulated Sparkline */}
                  <div className="h-6 w-20 mx-auto flex items-end gap-[2px]">
                    {[0.4, 0.6, 0.5, 0.8, 0.7, 0.9, 0.85].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h * 100}%` }}
                        className={cn(
                          "w-1 rounded-full",
                          asset.dailyChange >= 0 ? "bg-emerald-500/30" : "bg-rose-500/30"
                        )}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-5 text-right font-mono text-slate-400">
                   {asset.totalQuantity.toLocaleString()}
                </td>
                <td className="px-4 py-5 text-right font-mono font-black dark:text-emerald-50">
                  {currencySymbol} {(asset.totalQuantity * asset.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetTable;
