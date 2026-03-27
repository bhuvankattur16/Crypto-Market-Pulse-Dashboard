import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchTopCoins, fetchGlobalStats } from '../services/cryptoService';

const MarketContext = createContext(null);

const WATCHLIST_KEY = 'crypto_watchlist';
const DARK_MODE_KEY = 'crypto_dark_mode';
const AUTO_REFRESH_MS = 3 * 60_000;  // 3 minutes — safe for CoinGecko free tier
const MIN_FETCH_INTERVAL_MS = 90_000; // never fetch more than once per 90s

export function MarketProvider({ children }) {
  const [coins, setCoins] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // null | 'OFFLINE' | 'RATE_LIMIT' | 'API_ERROR'
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem(DARK_MODE_KEY);
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [activeTab, setActiveTab] = useState('market'); // 'market' | 'watchlist'
  const isFetching = useRef(false);
  const lastFetchedAt = useRef(0); // timestamp of last successful/attempted fetch

  // Apply dark mode class on body
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem(DARK_MODE_KEY, JSON.stringify(darkMode));
  }, [darkMode]);

  // Persist watchlist
  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const loadCoins = useCallback(async (forceRefresh = false) => {
    if (isFetching.current) return;
    // Throttle: skip if data is fresh enough (unless user explicitly clicked Refresh)
    const now = Date.now();
    if (!forceRefresh && now - lastFetchedAt.current < MIN_FETCH_INTERVAL_MS) return;
    if (!navigator.onLine) {
      setError('OFFLINE');
      setLoading(false);
      return;
    }
    isFetching.current = true;
    lastFetchedAt.current = now;
    setLoading(true);
    setError(null);
    try {
      const [coinsData, globalData] = await Promise.all([
        fetchTopCoins(50),
        fetchGlobalStats(),
      ]);
      setCoins(coinsData);
      setGlobalStats(globalData);
      setLastUpdated(new Date());
    } catch (err) {
      if (err.message === 'RATE_LIMIT') setError('RATE_LIMIT');
      else setError('API_ERROR');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  // Auto-fetch on mount, auto-refresh every 60s, and listen for online/offline
  useEffect(() => {
    loadCoins();

    const timer = setInterval(() => {
      if (navigator.onLine) loadCoins();
    }, AUTO_REFRESH_MS);

    const handleOnline = () => loadCoins();
    const handleOffline = () => setError('OFFLINE');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadCoins]);

  const toggleWatchlist = useCallback((coinId) => {
    setWatchlist(prev =>
      prev.includes(coinId) ? prev.filter(id => id !== coinId) : [...prev, coinId]
    );
  }, []);

  const isWatched = useCallback((coinId) => watchlist.includes(coinId), [watchlist]);

  const filteredCoins = coins.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const watchlistCoins = coins.filter(c => watchlist.includes(c.id));

  return (
    <MarketContext.Provider value={{
      coins,
      filteredCoins,
      watchlistCoins,
      globalStats,
      loading,
      error,
      lastUpdated,
      searchQuery,
      setSearchQuery,
      watchlist,
      toggleWatchlist,
      isWatched,
      darkMode,
      setDarkMode,
      selectedCoin,
      setSelectedCoin,
      activeTab,
      setActiveTab,
      refresh: loadCoins,
      forceRefresh: () => loadCoins(true),
    }}>
      {children}
    </MarketContext.Provider>
  );
}

export { MarketContext };
