
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, trend, loading }) => {
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="glass-card p-6 rounded-[2rem] group border-white/5 relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 ${trendColor}`}>
          {trend === 'up' && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline></svg>}
          {trend === 'down' && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline></svg>}
          {trend === 'neutral' && <div className="w-4 h-0.5 bg-current" />}
        </div>
      </div>
      
      {loading ? (
        <div className="h-8 w-32 bg-slate-800/50 animate-pulse rounded" />
      ) : (
        <div className="relative">
          <AnimatePresence mode="popLayout">
            <motion.h3 
              key={value}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="text-2xl font-black font-mono tracking-tighter text-white"
            >
              {value}
            </motion.h3>
          </AnimatePresence>
          {subValue && (
            <p className={`text-[11px] mt-2 font-bold tracking-wide uppercase opacity-70 ${trendColor}`}>
              {subValue}
            </p>
          )}
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

export default StatCard;
