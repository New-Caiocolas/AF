
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Asset, AssetCategory } from '../types';
import { COLORS } from '../constants';

interface AllocationChartsProps {
  assets: Asset[];
  usdToBrl: number;
}

const AllocationCharts: React.FC<AllocationChartsProps> = ({ assets, usdToBrl }) => {
  const data = [
    { name: 'Cripto', value: assets.filter(a => a.category === AssetCategory.CRYPTO).reduce((sum, a) => sum + (a.totalQuantity * a.currentPrice * usdToBrl), 0) },
    { name: 'FIIs', value: assets.filter(a => a.category === AssetCategory.FII).reduce((sum, a) => sum + (a.totalQuantity * a.currentPrice), 0) }
  ];

  const sectorData = assets.reduce((acc: any[], asset) => {
    const existing = acc.find(item => item.name === asset.sector);
    const multiplier = asset.category === AssetCategory.CRYPTO ? usdToBrl : 1;
    const val = asset.totalQuantity * asset.currentPrice * multiplier;
    if (existing) {
      existing.value += val;
    } else {
      acc.push({ name: asset.sector, value: val });
    }
    return acc;
  }, []);

  const CHART_COLORS = ['#06b6d4', '#10b981', '#3b82f6', '#14b8a6', '#6366f1'];

  return (
    <>
      <div className="glass-card p-8 rounded-3xl h-[400px] border-white/5 relative overflow-hidden group">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Exposição Global (BRL)</h3>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          </div>
        </div>
        <ResponsiveContainer width="100%" height="75%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={105}
              paddingAngle={10}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
            >
              <Cell fill="url(#neonCrypto)" />
              <Cell fill="url(#neonFii)" />
            </Pie>
            <defs>
              <linearGradient id="neonCrypto" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="neonFii" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
            <Tooltip 
              formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
              contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px', backdropFilter: 'blur(10px)' }}
              itemStyle={{ color: '#fff', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}
            />
            <Legend 
              verticalAlign="bottom" 
              iconType="circle"
              wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', paddingTop: '30px', color: '#64748b' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card p-8 rounded-3xl h-[400px] border-white/5 overflow-hidden">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Diversificação Setorial</h3>
        <ResponsiveContainer width="100%" height="75%">
          <PieChart>
            <Pie
              data={sectorData}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={105}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              animationBegin={500}
              animationDuration={1500}
            >
              {sectorData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} fillOpacity={0.8} />
              ))}
            </Pie>
            <Tooltip 
               formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
               contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px' }}
               itemStyle={{ color: '#fff', fontFamily: 'JetBrains Mono' }}
            />
            <Legend 
              verticalAlign="bottom" 
              iconType="circle"
              wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '30px', color: '#64748b' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default AllocationCharts;
