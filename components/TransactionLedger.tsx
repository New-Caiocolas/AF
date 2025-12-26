
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Asset, AssetCategory, Transaction, TransactionType, TransactionSource } from '../types';
import { Icons } from '../constants';

interface TransactionLedgerProps {
  assets: Asset[];
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction?: (id: string) => void;
}

const TransactionLedger: React.FC<TransactionLedgerProps> = ({ 
  assets, 
  transactions, 
  onAddTransaction,
  onDeleteTransaction 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Omit<Transaction, 'id'>>({
    type: 'buy',
    source: 'new_money',
    quantity: 0,
    price: 0,
    fees: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const [selectedTicker, setSelectedTicker] = useState('');
  const [search, setSearch] = useState('');

  const typeLabels: Record<TransactionType, string> = {
    buy: 'Compra',
    sell: 'Venda',
    dividend: 'Dividendo'
  };

  const filteredTickerSuggestions = useMemo(() => {
    if (!search) return [];
    const allKnown = [
      ...assets.map(a => ({ ticker: a.ticker, category: a.category, sector: a.sector })),
      { ticker: 'BTC', category: AssetCategory.CRYPTO, sector: 'Ouro Digital' },
      { ticker: 'ETH', category: AssetCategory.CRYPTO, sector: 'Plataforma' },
      { ticker: 'SOL', category: AssetCategory.CRYPTO, sector: 'DeFi' },
      { ticker: 'KNIP11', category: AssetCategory.FII, sector: 'Papel' },
      { ticker: 'XPML11', category: AssetCategory.FII, sector: 'Shopping' },
    ];
    const unique = Array.from(new Set(allKnown.map(a => a.ticker))).map(t => allKnown.find(a => a.ticker === t)!);
    return unique.filter(a => a.ticker.toLowerCase().includes(search.toLowerCase())).slice(0, 5);
  }, [search, assets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicker || form.quantity <= 0) return;
    
    onAddTransaction(form);
    setIsOpen(false);
    setForm({
      type: 'buy',
      source: 'new_money',
      quantity: 0,
      price: 0,
      fees: 0,
      date: new Date().toISOString().split('T')[0]
    });
    setSearch('');
    setSelectedTicker('');
  };

  const handleRepeatLast = () => {
    if (transactions.length > 0) {
      const last = transactions[transactions.length - 1];
      setForm({
        type: last.type,
        source: last.source,
        quantity: last.quantity,
        price: last.price,
        fees: last.fees,
        date: new Date().toISOString().split('T')[0]
      });
      // In a real scenario we'd also need the ticker, assuming it's available or handled by onAddTransaction
    }
  };

  const currencySymbol = assets.find(a => a.ticker === selectedTicker)?.category === AssetCategory.CRYPTO ? '$' : 'R$';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Histórico de Transações</h3>
        <button 
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
        >
          <Icons.Wallet /> Registrar Transação
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-md p-8 rounded-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black tracking-tight text-white uppercase">Novo Registro</h2>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
                  {(['buy', 'sell', 'dividend'] as TransactionType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                        form.type === t ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {typeLabels[t]}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-900/30 p-1 rounded-lg border border-white/5">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, source: 'new_money' })}
                      className={`py-1.5 text-[9px] font-bold uppercase tracking-tighter rounded transition-all ${
                        form.source === 'new_money' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      Dinheiro Novo (PIX)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, source: 'reinvestment' })}
                      className={`py-1.5 text-[9px] font-bold uppercase tracking-tighter rounded transition-all ${
                        form.source === 'reinvestment' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      Reinvestimento
                    </button>
                </div>

                <div className="relative">
                  <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 ml-1">Ativo (Ticker)</label>
                  <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Busque ex: BTC, MXRF11..."
                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl p-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                  {filteredTickerSuggestions.length > 0 && !selectedTicker && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#18181b] border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl">
                      {filteredTickerSuggestions.map(s => (
                        <div 
                          key={s.ticker}
                          onClick={() => {
                            setSelectedTicker(s.ticker);
                            setSearch(s.ticker);
                          }}
                          className="p-3 hover:bg-emerald-500/10 cursor-pointer flex justify-between items-center"
                        >
                          <span className="font-bold font-mono text-sm">{s.ticker}</span>
                          <span className="text-[10px] text-slate-500 uppercase">{s.category} • {s.sector}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 ml-1">Quantidade</label>
                    <input 
                      type="number" 
                      step="any"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) })}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-xl p-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 ml-1">Preço ({currencySymbol})</label>
                    <input 
                      type="number" 
                      step="any"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-xl p-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 ml-1">Taxas ({currencySymbol})</label>
                    <input 
                      type="number" 
                      step="any"
                      value={form.fees}
                      onChange={(e) => setForm({ ...form, fees: parseFloat(e.target.value) })}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-xl p-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5 ml-1">Data</label>
                    <input 
                      type="date" 
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-xl p-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button 
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Confirmar Transação
                  </button>
                  {transactions.length > 0 && (
                    <button 
                      type="button"
                      onClick={handleRepeatLast}
                      className="w-full bg-white/5 hover:bg-white/10 text-slate-400 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all"
                    >
                      Repetir Último Aporte
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="glass-card rounded-xl overflow-hidden max-h-[400px] overflow-y-auto">
        <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Atividade Recente</h4>
        </div>
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-600">
            <p className="text-xs uppercase tracking-widest">Nenhum registro manual encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence initial={false}>
              {transactions.slice().reverse().map(tx => {
                // Determine category from assets if possible, or fallback
                const asset = assets.find(a => a.transactions.some(t => t.id === tx.id));
                const txCurrency = asset?.category === AssetCategory.CRYPTO ? '$' : 'R$';
                return (
                  <motion.div 
                    key={tx.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 hover:bg-white/[0.02] transition-colors flex justify-between items-center group relative overflow-hidden"
                  >
                    <div className="flex gap-4 items-center">
                      <div className={`w-1.5 h-8 rounded-full ${
                        tx.type === 'buy' ? 'bg-emerald-500' : 
                        tx.type === 'sell' ? 'bg-rose-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <div className="font-bold font-mono text-sm dark:text-slate-100 text-slate-800 flex items-center gap-2">
                          {asset?.ticker || 'Ativo'}
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black tracking-tighter uppercase ${
                            tx.type === 'buy' ? 'bg-emerald-500/10 text-emerald-500' : 
                            tx.type === 'sell' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {typeLabels[tx.type]}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {new Date(tx.date).toLocaleDateString('pt-BR')} • {tx.source === 'new_money' ? 'Novo' : 'Reinv.'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono text-xs dark:text-slate-300 text-slate-600">
                          {tx.quantity.toLocaleString('pt-BR')} unid @ {txCurrency} {tx.price.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-500">
                          Total: {txCurrency} {(tx.quantity * tx.price + tx.fees).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      {onDeleteTransaction && (
                        <button 
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-2 text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Excluir Transação"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionLedger;
