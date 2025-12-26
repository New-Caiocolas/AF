
import { Asset, AssetCategory, DataSource, MarketResponse } from '../types';

// Crypto em tempo real via API pública da Binance (REST)
const fetchBinancePrice = async (ticker: string): Promise<{ price: number; change: number }> => {
  try {
    const symbol = `${ticker}USDT`;
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
    if (!response.ok) throw new Error('API da Binance indisponível');
    const data = await response.json();
    return {
      price: parseFloat(data.lastPrice),
      change: parseFloat(data.priceChangePercent)
    };
  } catch (e) {
    console.warn(`Busca em tempo real falhou para ${ticker}, usando fallback.`);
    throw e;
  }
};

// URL para WebSocket da Binance
export const getBinanceWSUrl = (tickers: string[]): string => {
  const streams = tickers.map(t => `${t.toLowerCase()}usdt@ticker`).join('/');
  return `wss://stream.binance.com:9443/ws/${streams}`;
};

const simulatePrice = (asset: Asset): Asset => {
  const volatility = asset.category === AssetCategory.CRYPTO ? 0.005 : 0.001; // Reduzido para parecer mais natural com updates frequentes
  const change = (Math.random() - 0.5) * volatility;
  const newPrice = asset.currentPrice * (1 + change);
  return {
    ...asset,
    currentPrice: newPrice,
    dailyChange: asset.dailyChange + (change * 100)
  };
};

export const fetchMarketPrices = async (
  assets: Asset[], 
  source: DataSource = 'simulated'
): Promise<MarketResponse> => {
  let errorOccurred = false;

  if (source === 'simulated') {
    return {
      assets: assets.map(simulatePrice),
      errorOccurred: false
    };
  }

  const updatedAssets = await Promise.all(assets.map(async (asset) => {
    try {
      if (asset.category === AssetCategory.CRYPTO) {
        const live = await fetchBinancePrice(asset.ticker);
        return { ...asset, currentPrice: live.price, dailyChange: live.change };
      } else if (asset.category === AssetCategory.FII) {
        // Fallback FII - Simulando leve variação do mercado B3
        const drift = (Math.random() - 0.48) * 0.004; 
        return {
          ...asset,
          currentPrice: asset.currentPrice * (1 + drift),
          dailyChange: asset.dailyChange + (drift * 100)
        };
      }
      return asset;
    } catch (err) {
      errorOccurred = true;
      return simulatePrice(asset);
    }
  }));

  return {
    assets: updatedAssets,
    errorOccurred
  };
};

export const INITIAL_ASSETS: Asset[] = [
  { id: '1', ticker: 'BTC', category: AssetCategory.CRYPTO, sector: 'Ouro Digital', totalQuantity: 0.25, averagePrice: 45000, currentPrice: 64200, dailyChange: 2.4, transactions: [] },
  { id: '2', ticker: 'ETH', category: AssetCategory.CRYPTO, sector: 'Plataforma', totalQuantity: 4.2, averagePrice: 2200, currentPrice: 3150, dailyChange: -1.2, transactions: [] },
  { id: '3', ticker: 'SOL', category: AssetCategory.CRYPTO, sector: 'DeFi', totalQuantity: 50, averagePrice: 85, currentPrice: 142, dailyChange: 5.8, transactions: [] },
  { id: '4', ticker: 'MXRF11', category: AssetCategory.FII, sector: 'Papel', totalQuantity: 1500, averagePrice: 9.80, currentPrice: 10.45, dailyChange: 0.1, provDividend: 165, dy: 12.5, pvp: 1.04, vacancy: 0, transactions: [] },
  { id: '5', ticker: 'HGLG11', category: AssetCategory.FII, sector: 'Logística', totalQuantity: 85, averagePrice: 158.00, currentPrice: 164.20, dailyChange: -0.3, provDividend: 93.5, dy: 9.2, pvp: 1.02, vacancy: 2.1, transactions: [] },
  { id: '6', ticker: 'VISC11', category: AssetCategory.FII, sector: 'Shoppings', totalQuantity: 120, averagePrice: 110.00, currentPrice: 118.50, dailyChange: 0.5, provDividend: 120, dy: 8.8, pvp: 0.95, vacancy: 4.5, transactions: [] }
];
