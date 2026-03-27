import { useEffect, useState } from 'react';
import { useMarket } from '../context/useMarket';
import { fetchCoinDetail } from '../services/cryptoService';
import { X, Star, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';

function formatPrice(price) {
  if (price == null) return 'N/A';
  if (price >= 1) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${price.toFixed(6)}`;
}

function formatLargeNum(n) {
  if (n == null) return 'N/A';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

export default function CoinDetailModal() {
  const { selectedCoin, setSelectedCoin, toggleWatchlist, isWatched } = useMarket();
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!selectedCoin) { setDetail(null); return; }
    setDetailLoading(true);
    fetchCoinDetail(selectedCoin.id)
      .then(d => setDetail(d))
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, [selectedCoin]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setSelectedCoin(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setSelectedCoin]);

  if (!selectedCoin) return null;

  const coin = selectedCoin;
  const md = detail?.market_data;
  const change24h = coin.price_change_percentage_24h;
  const isPositive = change24h >= 0;
  const watched = isWatched(coin.id);

  const stats = [
    { label: '24h High', value: formatPrice(md?.high_24h?.usd ?? coin.high_24h) },
    { label: '24h Low', value: formatPrice(md?.low_24h?.usd ?? coin.low_24h) },
    { label: 'All Time High', value: formatPrice(md?.ath?.usd) },
    { label: 'ATH Date', value: md?.ath_date?.usd ? new Date(md.ath_date.usd).toLocaleDateString() : 'N/A' },
    { label: 'Market Cap', value: formatLargeNum(md?.market_cap?.usd ?? coin.market_cap) },
    { label: 'Fully Diluted Val', value: formatLargeNum(md?.fully_diluted_valuation?.usd) },
    { label: '24h Volume', value: formatLargeNum(md?.total_volume?.usd ?? coin.total_volume) },
    { label: 'Circulating Supply', value: md?.circulating_supply ? `${md.circulating_supply.toLocaleString()} ${coin.symbol.toUpperCase()}` : 'N/A' },
    { label: 'Total Supply', value: md?.total_supply ? `${md.total_supply.toLocaleString()} ${coin.symbol.toUpperCase()}` : '∞' },
    { label: 'Market Cap Rank', value: `#${coin.market_cap_rank}` },
  ];

  return (
    <div className="modal-overlay" onClick={() => setSelectedCoin(null)} role="dialog" aria-modal="true" aria-label={`${coin.name} detail`}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-coin-identity">
            <img src={coin.image} alt={coin.name} className="modal-coin-img" />
            <div>
              <h2 className="modal-coin-name">{coin.name}</h2>
              <span className="modal-coin-symbol">{coin.symbol.toUpperCase()}</span>
            </div>
          </div>
          <div className="modal-header-actions">
            <button
              className={`star-btn lg ${watched ? 'starred' : ''}`}
              onClick={() => toggleWatchlist(coin.id)}
              aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <Star size={20} fill={watched ? 'currentColor' : 'none'} />
            </button>
            <button className="modal-close" onClick={() => setSelectedCoin(null)} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="modal-price-section">
          <span className="modal-current-price">{formatPrice(coin.current_price)}</span>
          <span className={`modal-change-badge ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {isPositive ? '+' : ''}{change24h?.toFixed(2)}%
          </span>
        </div>

        {/* Stats Grid */}
        {detailLoading ? (
          <div className="modal-loading">
            <div className="spinner" />
            <span>Loading details...</span>
          </div>
        ) : (
          <div className="stats-grid">
            {stats.map(({ label, value }) => (
              <div key={label} className="stat-card">
                <span className="stat-label">{label}</span>
                <span className="stat-value">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        {detail?.description?.en && (
          <div className="modal-desc">
            <p dangerouslySetInnerHTML={{ __html: detail.description.en.split('. ').slice(0, 3).join('. ') + '.' }} />
          </div>
        )}

        {/* Footer links */}
        {detail?.links?.homepage?.[0] && (
          <a
            className="modal-link"
            href={detail.links.homepage[0]}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={14} /> Official Website
          </a>
        )}
      </div>
    </div>
  );
}
