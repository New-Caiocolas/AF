
import { UserProfile, AssetCategory, Asset, Transaction } from '../types';

const STORAGE_KEY = 'gem_user_data_v4';

const INITIAL_USER: UserProfile = {
  id: 'user_1',
  name: 'Investor Pro',
  email: 'investor@gemhub.ai',
  riskProfile: 'arrojado',
  preferredCurrency: 'BRL',
  wallet: [
    {
      id: 'wa_1',
      ticker: 'BTC',
      category: AssetCategory.CRYPTO,
      sector: 'Ouro Digital',
      averagePrice: 42000,
      totalQuantity: 0.15,
      currentPrice: 65400,
      dailyChange: 2.5,
      transactions: [
        { id: 'tx_1', type: 'buy', quantity: 0.1, price: 40000, fees: 5, date: '2024-05-10', source: 'new_money' },
        { id: 'tx_2', type: 'buy', quantity: 0.05, price: 46000, fees: 8, date: '2024-06-15', source: 'new_money' }
      ]
    },
    {
      id: 'wa_2',
      ticker: 'MXRF11',
      category: AssetCategory.FII,
      sector: 'Papel',
      averagePrice: 9.85,
      totalQuantity: 1200,
      currentPrice: 10.42,
      dailyChange: 0.2,
      provDividend: 12.50,
      transactions: [
        { id: 'tx_3', type: 'buy', quantity: 1200, price: 9.85, fees: 0, date: '2024-04-20', source: 'new_money' }
      ]
    }
  ]
};

export const db = {
  getUser: (): UserProfile => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_USER;
  },

  saveUser: (user: UserProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },

  addTransaction: (userId: string, ticker: string, tx: Omit<Transaction, 'id'>): UserProfile => {
    const user = db.getUser();
    const assetIndex = user.wallet.findIndex(a => a.ticker === ticker);
    const newTx = { ...tx, id: Math.random().toString(36).substr(2, 9) };

    if (assetIndex > -1) {
      const asset = user.wallet[assetIndex];
      asset.transactions.push(newTx);
      
      // Re-calculate averages and totals
      if (tx.type === 'buy') {
        const totalCost = (asset.averagePrice * asset.totalQuantity) + (tx.price * tx.quantity) + tx.fees;
        asset.totalQuantity += tx.quantity;
        asset.averagePrice = totalCost / asset.totalQuantity;
      } else if (tx.type === 'sell') {
        asset.totalQuantity = Math.max(0, asset.totalQuantity - tx.quantity);
      }
    } else {
      // Create new asset document in wallet
      const newAsset: Asset = {
        id: Math.random().toString(),
        ticker,
        category: ticker.endsWith('11') ? AssetCategory.FII : AssetCategory.CRYPTO,
        sector: 'Novo Ativo',
        averagePrice: tx.price,
        totalQuantity: tx.quantity,
        currentPrice: tx.price,
        dailyChange: 0,
        transactions: [newTx]
      };
      user.wallet.push(newAsset);
    }

    db.saveUser(user);
    return user;
  },

  deleteTransaction: (userId: string, ticker: string, txId: string): UserProfile => {
    const user = db.getUser();
    const asset = user.wallet.find(a => a.ticker === ticker);
    if (!asset) return user;

    asset.transactions = asset.transactions.filter(t => t.id !== txId);
    
    // Recalculate based on remaining transactions
    const buys = asset.transactions.filter(t => t.type === 'buy');
    if (buys.length > 0) {
      const totalQty = buys.reduce((sum, t) => sum + t.quantity, 0);
      const totalCost = buys.reduce((sum, t) => sum + (t.price * t.quantity) + t.fees, 0);
      asset.totalQuantity = totalQty;
      asset.averagePrice = totalCost / totalQty;
    } else {
      asset.totalQuantity = 0;
      asset.averagePrice = 0;
    }

    db.saveUser(user);
    return user;
  }
};
