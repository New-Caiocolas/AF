
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Asset, AssetCategory, Transaction } from './types';
import { dbService } from './services/dbService';
import { auth, onAuthStateChanged, User, signOut } from './services/firebase';
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
import { DividendBridge, CorrelationHeatmap, TaxSimulator } from './components/IntelligenceModules';
import { LoginTerminal } from './components/Auth';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [wallet, setWallet] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'history'>('dashboard');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<AssetCategory | null>(null);

  const USD_TO_BRL = 5.45;

  // 1. Handle Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Firebase Sync with snapshot listeners
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubWallet = dbService.subscribeToWallet(firebaseUser.uid, (data) => {
      setWallet(data);
    });

    const unsubTxs = dbService.subscribeToTransactions(firebaseUser.uid, (data) => {
      setTransactions(data);
    });

    return () => {
      unsubWallet();
      unsubTxs();
    };
  }, [firebaseUser]);

  const refreshPrices = useCallback(async () => {
    if (wallet.length === 0) return;
    setIsRefreshing(true);
    const result = await fetchMarketPrices(wallet, 'realtime');
    
    // Optimistic local update while Firestore might be syncing in background
    setWallet(prev => prev.map(asset => {
      const match = result.assets.find(r => r.ticker === asset.ticker);
      return match ? { ...asset, currentPrice: match.currentPrice, dailyChange: match.dailyChange } : asset;
    }));
    
    setIsRefreshing(false);
  }, [wallet]);

  useEffect(() => {
    const interval = setInterval(refreshPrices, 60000);
    return () => clearInterval(interval);
  }, [refreshPrices]);

  const stats = useMemo(() => {
    const cryptoUSD = wallet
      .filter(a => a.category === AssetCategory.CRYPTO)
      .reduce((sum, a) => sum + (a.totalQuantity * a.currentPrice), 0);
    
    const fiiBRL = wallet
      .filter(a => a.category === AssetCategory.FII)
      .reduce((sum, a) => sum + (a.totalQuantity * a.currentPrice), 0);

    const totalBRL = (cryptoUSD * USD_TO_BRL) + fiiBRL;
    const monthlyDividends = wallet.reduce((sum, a) => sum + (a.provDividend || 0), 0);

    return { totalBRL, cryptoUSD, fiiBRL, monthlyDividends };
  }, [wallet, USD_TO_BRL]);

  const handleAddTransaction = async (ticker: string, tx: Omit<Transaction, 'id'>) => {
    if (!firebaseUser) return;
    const category = ticker.endsWith('11') ? AssetCategory.FII : AssetCategory.CRYPTO;
    await dbService.registerTransaction(firebaseUser.uid, ticker, tx, category);
  };

  const maskValue = (val: string) => isFocusMode ? '••••••' : val;

  if (authLoading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  if (!firebaseUser) return <LoginTerminal />;

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-100 font-sans selection:bg-emerald-500/30 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-72 border-r border-white/5 bg-[#020617]/80 backdrop-blur-xl flex flex-col p-8 sticky top-0 h-screen z-40">
        <div className="mb-16 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="font-black text-slate-900 text-xl">G</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="font-black text-xl tracking-tighter">GEM <span className="text-emerald-500">HUB</span></h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500">REAL-TIME SYNC ON</p>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {[
            { id: 'dashboard', icon: <Icons.TrendingUp />, label: 'Terminal' },
            { id: 'analytics', icon: <Icons.Sparkles />, label: 'Deep Dive' },
            { id: 'history', icon: <Icons.Wallet />, label: 'History' }
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
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-slate-500 hover:text-rose-400 hover:bg-rose-500/5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span className="hidden lg:block font-bold text-[11px] uppercase tracking-widest text-left">Disconnect Node</span>
          </button>
          <button 
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${isFocusMode ? 'text-emerald-400 bg-emerald-500/5' : 'text-slate-500 hover:text-slate-200'}`}
          >
            <Icons.Sun />
            <span className="hidden lg:block font-bold text-[11px] uppercase tracking-widest">Focus Mode</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-12 max-w-[1600px] mx-auto h-screen overflow-y-auto custom-scrollbar">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-500/20 bg-[#020617] flex items-center justify-center">
              <img src={firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.email}&background=020617&color=10b981`} alt="Avatar" />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter">Terminal Principal</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-[9px] font-black uppercase text-emerald-400 tracking-widest">Firestore v10</span>
                <span className="text-slate-600 font-mono text-[10px] truncate max-w-[150px]">{firebaseUser.email}</span>
              </div>
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
              className="space-y-12 pb-24"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Patrimônio Consolidado" value={maskValue(`R$ ${stats.totalBRL.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`)} trend="neutral" />
                <StatCard label="Liquidez Cripto" value={maskValue(`$ ${stats.cryptoUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}`)} trend="up" />
                <StatCard label="Real Estate Equity" value={maskValue(`R$ ${stats.fiiBRL.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`)} trend="neutral" />
                <StatCard label="Yield Mensal Est." value={maskValue(`R$ ${stats.monthlyDividends.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`)} trend="up" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                  <AssetGrid wallet={wallet} onFilter={setFilterCategory} filter={filterCategory} isFocusMode={isFocusMode} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AllocationCharts assets={wallet} usdToBrl={USD_TO_BRL} />
                    <AIInsights assets={wallet} />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="glass-card p-8 rounded-3xl bg-emerald-500/5 border-emerald-500/10">
                    <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-6">Sugestão de Aporte</h3>
                    <RebalanceTool assets={wallet} usdToBrl={USD_TO_BRL} />
                  </div>
                  <TransactionLedger 
                    assets={wallet} 
                    transactions={transactions} 
                    onAddTransaction={(tx) => handleAddTransaction(tx.ticker, tx)} 
                    onDeleteTransaction={(id) => dbService.deleteTransaction(firebaseUser.uid, id, 'unknown')}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="pb-24 space-y-12">
              <AnalyticsDashboard assets={wallet} transactions={transactions} usdToBrl={USD_TO_BRL} />
              
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                  <CorrelationHeatmap assets={wallet} />
                </div>
                <TaxSimulator assets={wallet} />
              </div>
              
              <div className="grid grid-cols-1 gap-8">
                 <DividendBridge assets={wallet} usdToBrl={USD_TO_BRL} />
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="pb-24">
              <TransactionLedger 
                assets={wallet} 
                transactions={transactions} 
                onAddTransaction={(tx) => handleAddTransaction(tx.ticker, tx)} 
                onDeleteTransaction={(id) => dbService.deleteTransaction(firebaseUser.uid, id, 'unknown')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <CommandBar isOpen={isCommandBarOpen} onClose={() => setIsCommandBarOpen(false)} wallet={wallet} onNavigate={(tab) => setActiveTab(tab as any)} />

      <footer className="fixed bottom-8 right-8 z-40">
        <div className="glass-card px-4 py-2 rounded-full border-white/10 flex items-center gap-3 text-slate-500 shadow-2xl">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
          <span className="text-[10px] font-black uppercase tracking-widest">Firestore: Synchronized</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
