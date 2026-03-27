import { useMarket } from '../context/useMarket';
import { WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

const errorConfig = {
  OFFLINE: {
    icon: <WifiOff size={18} />,
    title: "You're offline",
    message: "Please check your internet connection. Data will refresh automatically when you reconnect.",
    color: 'error-orange',
  },
  RATE_LIMIT: {
    icon: <AlertTriangle size={18} />,
    title: "API rate limit reached",
    message: "CoinGecko's free API has been temporarily rate-limited. Please wait a moment and refresh.",
    color: 'error-yellow',
  },
  API_ERROR: {
    icon: <AlertTriangle size={18} />,
    title: "Something went wrong",
    message: "Could not fetch market data. Please try refreshing.",
    color: 'error-red',
  },
};

export default function ErrorBanner() {
  const { error, forceRefresh, loading } = useMarket();
  if (!error) return null;

  const cfg = errorConfig[error] || errorConfig.API_ERROR;

  return (
    <div className={`error-banner ${cfg.color}`} role="alert">
      <div className="error-content">
        <span className="error-icon">{cfg.icon}</span>
        <div>
          <strong>{cfg.title}</strong>
          <p>{cfg.message}</p>
        </div>
      </div>
      <button
        className={`btn-retry ${loading ? 'spinning' : ''}`}
        onClick={forceRefresh}
        disabled={loading}
        aria-label="Retry loading data"
      >
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  );
}
