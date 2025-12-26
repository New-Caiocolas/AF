
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UserProfile, AssetCategory, Asset, Transaction } from './types';
import { db } from './services/dbService';
import { fetchMarketPrices } from './services/marketService';
import { Icons } from './constants';
import StatCard from './components/StatCard';
import AssetGrid from './components/AssetGrid';
import AllocationCharts from './components/AllocationCharts';
import RebalanceTool from './components/RebalanceTool';
import AIInsights from './components/AIInsights';
import TransactionLedger from './components/TransactionLedger';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import CommandBar from './components/CommandBar';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(db.getUser());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'history'>('dashboard');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<AssetCategory | null>(null);

  const USD_TO_BRL = 5.45;

  const refreshPrices = useCallback(async () => {
    setIsRefreshing(true);
    // Prepare assets for pricing service
    const currentWallet = user.wallet.map(a => ({ ...a }));
    const result = await fetchMarketPrices(currentWallet, 'realtime');
    
    const updatedWallet = user.wallet.map(asset => {
      const match = result.assets.find(r => r.ticker === asset.ticker);
      return match ? { ...asset, currentPrice: match.currentPrice, dailyChange: match.dailyChange } : asset;
    });

    const updatedUser = { ...user, wallet: updatedWallet };
    setUser(updatedUser);
    db.saveUser(updatedUser);
    setIsRefreshing(false);
  }, [user]);

  useEffect(() => {
    const interval = setInterval(refreshPrices, 60000);
    return () => clearInterval(interval);
  }, [refreshPrices]);

  const stats = useMemo(() => {
    const cryptoUSD = user.wallet
      .filter(a => a.category === AssetCategory.CRYPTO)
      .reduce((sum, a) => sum + (a.totalQuantity * a.currentPrice), 0);
    
    const fiiBRL = user.wallet
      .filter(a => a.category === AssetCategory.FII)
      .reduce((sum, a) => sum + (a.totalQuantity * a.currentPrice), 0);

    const totalBRL = (cryptoUSD * USD_TO_BRL) + fiiBRL;
    const monthlyDividends = user.wallet.reduce((sum, a) => sum + (a.provDividend || 0), 0);

    return { totalBRL, cryptoUSD, fiiBRL, monthlyDividends };
  }, [user.wallet, USD_TO_BRL]);

  const handleAddTransaction = (ticker: string, tx: Omit<Transaction, 'id'>) => {
    const updatedUser = db.addTransaction(user.id, ticker, tx);
    setUser(updatedUser);
  };

  const handleDeleteTransaction = (ticker: string, txId: string) => {
    const updatedUser = db.deleteTransaction(user.id, ticker, txId);
    setUser(updatedUser);
  };

  const maskValue = (val: string) => isFocusMode ? '••••••' : val;

  // Flattened transactions for Ledger and Dashboard
  const allTransactions = useMemo(() => 
    user.wallet.flatMap(a => a.transactions.map(t => ({ ...t, ticker: a.ticker, category: a.category }))),
    [user.wallet]
  );

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-100 font-sans selection:bg-emerald-500/30">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-72 border-r border-white/5 bg-[#020617]/80 backdrop-blur-xl flex flex-col p-8 sticky top-0 h-screen z-40">
        <div className="mb-16 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="font-black text-slate-900 text-xl">G</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="font-black text-xl tracking-tighter">GEM <span className="text-emerald-500">HUB</span></h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500">Intelligence v4</p>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {[
            { id: 'dashboard', icon: <Icons.TrendingUp />, label: 'Terminal' },
            { id: 'analytics', icon: <Icons.Sparkles />, label: 'Deep Dive' },
            { id: 'history', icon: <Icons.Wallet />, label: 'Transactions' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                activeTab === item.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="hidden lg:block font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/5 space-y-4">
          <button 
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${isFocusMode ? 'text-emerald-400 bg-emerald-500/5' : 'text-slate-500 hover:text-slate-200'}`}
          >
            <Icons.Sun />
            <span className="hidden lg:block font-bold text-[11px] uppercase tracking-widest">Focus Mode</span>
          </button>
          <div className="hidden lg:block p-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Live Sync</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] font-mono text-emerald-500/80">CONNECTED</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-12 max-w-[1600px] mx-auto overflow-x-hidden">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div>
            <h2 className="text-4xl font-black tracking-tighter">Terminal Principal</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-mono text-slate-400">ID: {user.id}</span>
              <span className="text-slate-600">/</span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Global Portfolio View</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCommandBarOpen(true)}
              className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-500 flex items-center gap-4 hover:border-white/20 transition-all text-sm group"
            >
              <Icons.Sparkles />
              <span className="font-medium group-hover:text-slate-200">Busca Rápida</span>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-1 rounded opacity-50 group-hover:opacity-100">⌘K</span>
            </button>
            <button 
              onClick={refreshPrices}
              className={`p-3 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-emerald-500/10 hover:text-emerald-400 ${isRefreshing ? 'animate-spin border-emerald-500/50 text-emerald-400' : ''}`}
            >
              <Icons.Refresh />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12"
            >
              {/* Bento Grid: Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard 
                  label="Net Worth Consolidado" 
                  value={maskValue(`R$ ${stats.totalBRL.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`)} 
                  trend="neutral" 
                  subValue="Total Assets BRL"
                />
                <StatCard 
                  label="Liquidez Cripto" 
                  value={maskValue(`$ ${stats.cryptoUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}`)} 
                  trend="up" 
                  subValue={`${((stats.cryptoUSD * USD_TO_BRL / stats.totalBRL) * 100).toFixed(1)}% Peso`}
                />
                <StatCard 
                  label="Real Estate Equity" 
                  value={maskValue(`R$ ${stats.fiiBRL.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`)} 
                  trend="neutral" 
                  subValue="Fundos Imobiliários"
                />
                <StatCard 
                  label="Yield Mensal Est." 
                  value={maskValue(`R$ ${stats.monthlyDividends.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`)} 
                  trend="up" 
                  subValue="Dividendos Provisionados"
                />
              </div>

              {/* Asset Grid Section (Bento Grid) */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                  <AssetGrid 
                    wallet={user.wallet} 
                    onFilter={setFilterCategory} 
                    filter={filterCategory} 
                    isFocusMode={isFocusMode}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AllocationCharts assets={user.wallet} usdToBrl={USD_TO_BRL} />
                    <AIInsights assets={user.wallet} />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="glass-card p-8 rounded-3xl bg-emerald-500/5 border-emerald-500/10">
                    <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-6">Sugestão de Aporte</h3>
                    <RebalanceTool assets={user.wallet} usdToBrl={USD_TO_BRL} />
                  </div>
                  <TransactionLedger 
                    assets={user.wallet} 
                    transactions={allTransactions} 
                    onAddTransaction={(tx) => handleAddTransaction(user.wallet[0]?.ticker || '', tx)} // Ticker should be selected in ledger
                    onDeleteTransaction={(id) => {
                      const asset = user.wallet.find(a => a.transactions.some(t => t.id === id));
                      if (asset) handleDeleteTransaction(asset.ticker, id);
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              <AnalyticsDashboard 
                assets={user.wallet} 
                transactions={allTransactions} 
                usdToBrl={USD_TO_BRL} 
              />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              <TransactionLedger 
                assets={user.wallet} 
                transactions={allTransactions} 
                onAddTransaction={(tx) => handleAddTransaction(user.wallet[0]?.ticker || '', tx)} 
                onDeleteTransaction={(id) => {
                  const asset = user.wallet.find(a => a.transactions.some(t => t.id === id));
                  if (asset) handleDeleteTransaction(asset.ticker, id);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <CommandBar 
        isOpen={isCommandBarOpen} 
        onClose={() => setIsCommandBarOpen(false)} 
        wallet={user.wallet}
        onNavigate={(tab) => setActiveTab(tab as any)}
      />

      <footer className="fixed bottom-8 right-8 z-40">
        <div className="glass-card px-4 py-2 rounded-full border-white/10 flex items-center gap-3 text-slate-500 shadow-2xl">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">Node: Atlas-M0-Sync</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
