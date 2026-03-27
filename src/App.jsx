import { useMarket } from './context/useMarket';
import { MarketProvider } from './context/MarketContext';
import Header from './components/Header';
import GlobalStatsBar from './components/GlobalStatsBar';
import SearchBar from './components/SearchBar';
import CryptoTable from './components/CryptoTable';
import CoinDetailModal from './components/CoinDetailModal';
import ErrorBanner from './components/ErrorBanner';
import { Bookmark, BarChart2, Loader } from 'lucide-react';
import './App.css';

function Dashboard() {
  const { filteredCoins, watchlistCoins, loading, error, activeTab, setActiveTab, searchQuery } = useMarket();

  const displayCoins = activeTab === 'watchlist' ? watchlistCoins : filteredCoins;

  return (
    <div className="app-container">
      <Header />
      <GlobalStatsBar />

      <main className="main-content">
        <ErrorBanner />

        {/* Tabs + Search row */}
        <div className="controls-row">
          <div className="tab-group">
            <button
              id="tab-market"
              className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`}
              onClick={() => setActiveTab('market')}
            >
              <BarChart2 size={15} /> Market
            </button>
            <button
              id="tab-watchlist"
              className={`tab-btn ${activeTab === 'watchlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('watchlist')}
            >
              <Bookmark size={15} /> Watchlist
              {watchlistCoins.length > 0 && (
                <span className="tab-badge">{watchlistCoins.length}</span>
              )}
            </button>
          </div>
          <SearchBar />
        </div>

        {/* Summary bar */}
        <div className="summary-bar">
          <span>{displayCoins.length} asset{displayCoins.length !== 1 ? 's' : ''}</span>
          {searchQuery && <span className="filter-tag">Filtering: "{searchQuery}"</span>}
        </div>

        {/* Table area */}
        {loading && !displayCoins.length ? (
          <div className="loading-state">
            <Loader size={32} className="spinning" />
            <p>Fetching live market data…</p>
          </div>
        ) : (
          <CryptoTable
            coins={displayCoins}
            emptyMessage={
              activeTab === 'watchlist'
                ? searchQuery
                  ? 'No watched coins match your search.'
                  : 'No coins in your watchlist yet. Star some assets to track them here!'
                : 'No coins match your search.'
            }
          />
        )}
      </main>

      <CoinDetailModal />

      <footer className="app-footer">
        <span>Data powered by <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer">CoinGecko</a></span>
        <span>Auto-refreshes every 60s &bull; All values in USD</span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <MarketProvider>
      <Dashboard />
    </MarketProvider>
  );
}
