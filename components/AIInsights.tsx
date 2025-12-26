
import React, { useState } from 'react';
import { getPortfolioInsights } from '../services/geminiService';
import { Asset } from '../types';
import { Icons } from '../constants';

interface AIInsightsProps {
  assets: Asset[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ assets }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await getPortfolioInsights(assets);
    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-[#18181b] to-[#09090b] border border-emerald-500/20 p-6 rounded-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icons.Sparkles />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-emerald-500"><Icons.Sparkles /></span>
          <h3 className="text-lg font-bold text-slate-100 font-sans">Inteligência GEM AI</h3>
        </div>
        
        {!insight && !loading && (
          <div className="flex flex-col items-center py-4">
            <p className="text-sm text-slate-400 text-center mb-6 max-w-md">
              Obtenha análises de nível institucional do seu portfólio multi-ativos usando a inteligência do Gemini 3.
            </p>
            <button 
              onClick={handleGenerate}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2"
            >
              Analisar meu Portfólio
            </button>
          </div>
        )}

        {loading && (
          <div className="space-y-3 py-4 animate-pulse">
            <div className="h-4 bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-800 rounded w-5/6"></div>
            <div className="h-4 bg-slate-800 rounded w-4/6"></div>
          </div>
        )}

        {insight && !loading && (
          <div className="bg-black/30 border border-slate-800 p-4 rounded-lg whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-light">
            {insight}
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleGenerate}
                className="text-[10px] uppercase tracking-widest text-emerald-500 hover:text-emerald-400 font-bold"
              >
                Atualizar Análise
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
