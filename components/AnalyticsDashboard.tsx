
import React, { useMemo } from 'react';
import { Asset, AssetCategory, Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Treemap } from 'recharts';
import { motion } from 'framer-motion';
import { Icons } from '../constants';

interface AnalyticsDashboardProps {
  assets: Asset[];
  transactions: Transaction[];
  usdToBrl: number;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ assets, transactions, usdToBrl }) => {
  // 1. Processamento de Aportes Mensais (Consolidado em BRL para comparação justa)
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; crypto: number; fii: number; reinvested: number }> = {};
    
    const sortedTxs = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sortedTxs.forEach(tx => {
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) {
        months[key] = { month: key, crypto: 0, fii: 0, reinvested: 0 };
      }
      
      // Determine category from related assets
      const asset = assets.find(a => a.transactions.some(t => t.id === tx.id));
      const category = asset?.category || AssetCategory.CRYPTO;

      const multiplier = category === AssetCategory.CRYPTO ? usdToBrl : 1;
      const val = (tx.quantity * tx.price + tx.fees) * multiplier;
      
      if (tx.source === 'reinvestment') {
        months[key].reinvested += val;
      } else if (category === AssetCategory.CRYPTO) {
        months[key].crypto += val;
      } else {
        months[key].fii += val;
      }
    });
    
    return Object.values(months).slice(-6); 
  }, [transactions, usdToBrl, assets]);

  // 2. Cálculo de Capital Aportado vs Valor Atual
  const capitalMetrics = useMemo(() => {
    let totalInvestedBRL = 0;
    let newMoneyBRL = 0;
    let reinvestedBRL = 0;
    
    transactions.forEach(tx => {
      const asset = assets.find(a => a.transactions.some(t => t.id === tx.id));
      const category = asset?.category || AssetCategory.CRYPTO;
      const multiplier = category === AssetCategory.CRYPTO ? usdToBrl : 1;

      if (tx.type === 'buy') {
        const val = (tx.quantity * tx.price + tx.fees) * multiplier;
        totalInvestedBRL += val;
        if (tx.source === 'reinvestment') reinvestedBRL += val;
        else newMoneyBRL += val;
      } else if (tx.type === 'sell') {
        const val = (tx.quantity * tx.price) * multiplier;
        totalInvestedBRL -= val; // Deduzindo capital realizado
      }
    });

    const currentTotalBRL = assets.reduce((sum, a) => {
        const mult = a.category === AssetCategory.CRYPTO ? usdToBrl : 1;
        return sum + (a.totalQuantity * a.currentPrice * mult);
    }, 0);

    const profitBRL = currentTotalBRL - totalInvestedBRL;
    const profitPct = totalInvestedBRL > 0 ? (profitBRL / totalInvestedBRL) * 100 : 0;
    
    const annualIncomeBRL = assets.filter(a => a.category === AssetCategory.FII).reduce((sum, a) => {
        return sum + ((a.provDividend || 0) * 12);
    }, 0);

    const yieldOnCost = totalInvestedBRL > 0 ? (annualIncomeBRL / totalInvestedBRL) * 100 : 0;

    return { totalInvestedBRL, newMoneyBRL, reinvestedBRL, currentTotalBRL, profitBRL, profitPct, yieldOnCost };
  }, [transactions, assets, usdToBrl]);

  // 3. Treemap Data (Alocação Hierárquica em BRL)
  const treemapData = useMemo(() => {
    return [
      {
        name: 'Cripto',
        children: assets.filter(a => a.category === AssetCategory.CRYPTO && a.totalQuantity > 0).map(a => ({
          name: a.ticker,
          size: a.totalQuantity * a.currentPrice * usdToBrl
        }))
      },
      {
        name: 'FIIs',
        children: assets.filter(a => a.category === AssetCategory.FII && a.totalQuantity > 0).map(a => ({
          name: a.ticker,
          size: a.totalQuantity * a.currentPrice
        }))
      }
    ].filter(cat => cat.children.length > 0);
  }, [assets, usdToBrl]);

  // 4. Heatmap Helper
  const contributionDays = useMemo(() => {
    const days: Record<string, number> = {};
    transactions.forEach(tx => {
        days[tx.date] = (days[tx.date] || 0) + 1;
    });
    return days;
  }, [transactions]);

  const exportCSV = () => {
    const headers = ["Data", "Ticker", "Tipo", "Fonte", "Quantidade", "Preço Unit", "Moeda", "Total BRL"];
    const rows = transactions.map(tx => {
        const asset = assets.find(a => a.transactions.some(t => t.id === tx.id));
        const category = asset?.category || AssetCategory.CRYPTO;
        const currency = category === AssetCategory.CRYPTO ? 'USD' : 'BRL';
        const multiplier = category === AssetCategory.CRYPTO ? usdToBrl : 1;
        const total = (tx.quantity * tx.price + tx.fees) * multiplier;
        return [tx.date, asset?.ticker || 'N/A', tx.type, tx.source, tx.quantity, tx.price, currency, total.toFixed(2)];
    });
    
    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gem_portfolio_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10">
      {/* Resumo Financeiro Deep Dive */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-xl border-l-4 border-l-emerald-500">
            <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Capital Aportado (Bolso)</h4>
            <div className="text-xl font-mono font-bold dark:text-slate-100 text-slate-800">R$ {capitalMetrics.totalInvestedBRL.toLocaleString()}</div>
            <p className="text-[10px] text-slate-500 mt-1">Reinvestimento: R$ {capitalMetrics.reinvestedBRL.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-xl border-l-4 border-l-blue-500">
            <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Patrimônio Líquido</h4>
            <div className="text-xl font-mono font-bold dark:text-slate-100 text-slate-800">R$ {capitalMetrics.currentTotalBRL.toLocaleString()}</div>
            <div className={`text-[10px] mt-1 font-bold ${capitalMetrics.profitBRL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {capitalMetrics.profitBRL >= 0 ? 'Lucro' : 'Prejuízo'}: R$ {Math.abs(capitalMetrics.profitBRL).toLocaleString()}
            </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-xl border-l-4 border-l-slate-500">
            <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Rentabilidade Global</h4>
            <div className={`text-xl font-mono font-bold ${capitalMetrics.profitPct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {capitalMetrics.profitPct >= 0 ? '+' : ''}{capitalMetrics.profitPct.toFixed(2)}%
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Sempre em relação ao custo</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6 rounded-xl border-l-4 border-l-emerald-400">
            <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Eficácia Yield on Cost</h4>
            <div className="text-xl font-mono font-bold dark:text-slate-100 text-slate-800">{capitalMetrics.yieldOnCost.toFixed(2)}%</div>
            <p className="text-[10px] text-slate-500 mt-1">Retorno real sobre investimento</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Gráfico de Aportes Acumulados */}
        <div className="glass-card p-6 rounded-xl min-h-[420px] shadow-2xl">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fluxo de Caixa Mensal (BRL)</h3>
                <button onClick={exportCSV} className="px-3 py-1 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-tighter text-emerald-500 border border-emerald-500/20 rounded-full transition-colors">Exportar Dados</button>
            </div>
            <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis 
                            dataKey="month" 
                            stroke="#475569" 
                            fontSize={10} 
                            tickFormatter={(v) => v.split('-')[1] + '/' + v.split('-')[0].slice(2)} 
                        />
                        <YAxis stroke="#475569" fontSize={10} tickFormatter={(v) => `R$${v/1000}k`} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                            itemStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', padding: '2px 0' }}
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '30px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                        <Bar dataKey="fii" name="FIIs (BRL)" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="crypto" name="Cripto (Convertido)" stackId="a" fill="#64748b" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="reinvested" name="Reinvestimentos" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Treemap Hierárquico */}
        <div className="glass-card p-6 rounded-xl min-h-[420px] shadow-2xl">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Concentração de Ativos (BRL)</h3>
             <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                        data={treemapData}
                        dataKey="size"
                        aspectRatio={4 / 3}
                        stroke="#09090b"
                        fill="#10b981"
                        content={<CustomTreemapContent />}
                    >
                        <Tooltip 
                            formatter={(value: number) => `R$ ${value.toLocaleString()}`}
                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }}
                        />
                    </Treemap>
                </ResponsiveContainer>
             </div>
        </div>
      </div>

      {/* Histórico de Consistência */}
      <div className="glass-card p-6 rounded-xl overflow-x-auto shadow-2xl">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Heatmap de Atividade (24 Semanas)</h3>
        <div className="flex gap-1.5 min-w-[850px] justify-between">
            {Array.from({ length: 24 }).map((_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1.5">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (168 - (weekIndex * 7 + dayIndex)));
                        const dateStr = date.toISOString().split('T')[0];
                        const count = contributionDays[dateStr] || 0;
                        
                        return (
                            <div 
                                key={dayIndex} 
                                title={`${dateStr}: ${count} aporte(s)`}
                                className={`w-3.5 h-3.5 rounded-[3px] transition-all duration-300 hover:scale-125 ${
                                    count === 0 ? 'bg-slate-800/20' : 
                                    count === 1 ? 'bg-emerald-900/60' :
                                    count === 2 ? 'bg-emerald-700' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                                }`}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
        <div className="mt-6 flex justify-between items-center">
            <p className="text-[9px] text-slate-500 italic">Cada bloco representa um dia de atividade no mercado financeiro.</p>
            <div className="flex items-center gap-3">
                <span className="text-[8px] text-slate-500 uppercase font-black tracking-tighter">Menos</span>
                <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-[1px] bg-slate-800/20" />
                    <div className="w-2.5 h-2.5 rounded-[1px] bg-emerald-900/60" />
                    <div className="w-2.5 h-2.5 rounded-[1px] bg-emerald-700" />
                    <div className="w-2.5 h-2.5 rounded-[1px] bg-emerald-400" />
                </div>
                <span className="text-[8px] text-slate-500 uppercase font-black tracking-tighter">Mais</span>
            </div>
        </div>
      </div>
    </div>
  );
};

// Renderizador customizado para o Treemap para melhor legibilidade
const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, index, name } = props;
  if (width < 30 || height < 20) return null;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: index % 2 === 0 ? '#10b981' : '#64748b',
          fillOpacity: 0.6,
          stroke: '#09090b',
          strokeWidth: 2,
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        fontSize={10}
        fontFamily="JetBrains Mono"
        fontWeight="bold"
      >
        {name}
      </text>
    </g>
  );
};

export default AnalyticsDashboard;
