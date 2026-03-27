import { useMarket } from '../context/useMarket';
import { Sun, Moon, RefreshCw, TrendingUp } from 'lucide-react';

export default function Header() {
  const { darkMode, setDarkMode, forceRefresh, loading, lastUpdated } = useMarket();

  return (
    <header className="header">
      <div className="header-brand">
        <div className="brand-icon">
          <TrendingUp size={22} />
        </div>
        <div>
          <h1 className="brand-title">CryptoPulse</h1>
          <p className="brand-subtitle">Real-Time Market Dashboard</p>
        </div>
      </div>

      <div className="header-actions">
        {lastUpdated && (
          <span className="last-updated">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
        <button
          className={`btn-icon refresh-btn ${loading ? 'spinning' : ''}`}
          onClick={forceRefresh}
          disabled={loading}
          title="Refresh data"
          aria-label="Refresh market data"
        >
          <RefreshCw size={18} />
        </button>
        <button
          className="btn-icon"
          onClick={() => setDarkMode(d => !d)}
          title="Toggle dark mode"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
