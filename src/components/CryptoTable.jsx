import { useMarket } from '../context/useMarket';
import { Star, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import SparklineChart from './SparklineChart';

function formatPrice(price) {
  if (price >= 1) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${price.toFixed(6)}`;
}

function formatMarketCap(cap) {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
  return `$${cap.toLocaleString()}`;
}

function CoinRow({ coin, rank }) {
  const { toggleWatchlist, isWatched, setSelectedCoin } = useMarket();
  const change = coin.price_change_percentage_24h;
  const change7d = coin.price_change_percentage_7d_in_currency;
  const isPositive = change >= 0;
  const is7dPositive = change7d >= 0;
  const watched = isWatched(coin.id);

  return (
    <tr
      className="coin-row"
      onClick={() => setSelectedCoin(coin)}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && setSelectedCoin(coin)}
      role="button"
      aria-label={`View details for ${coin.name}`}
    >
      <td className="td-rank">{rank}</td>
      <td className="td-coin">
        <img src={coin.image} alt={coin.name} className="coin-img" />
        <div className="coin-info">
          <span className="coin-name">{coin.name}</span>
          <span className="coin-symbol">{coin.symbol.toUpperCase()}</span>
        </div>
      </td>
      <td className="td-price">{formatPrice(coin.current_price)}</td>
      <td className={`td-change ${isPositive ? 'positive' : 'negative'}`}>
        <span className="change-badge">
          {isPositive ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {Math.abs(change).toFixed(2)}%
        </span>
      </td>
      <td className="td-cap">{formatMarketCap(coin.market_cap)}</td>
      <td className="td-vol">{formatMarketCap(coin.total_volume)}</td>
      <td className="td-spark">
        <SparklineChart
          prices={coin.sparkline_in_7d?.price}
          positive={is7dPositive}
        />
      </td>
      <td className="td-star">
        <button
          className={`star-btn ${watched ? 'starred' : ''}`}
          onClick={e => { e.stopPropagation(); toggleWatchlist(coin.id); }}
          aria-label={watched ? `Remove ${coin.name} from watchlist` : `Add ${coin.name} to watchlist`}
          title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Star size={16} fill={watched ? 'currentColor' : 'none'} />
        </button>
      </td>
    </tr>
  );
}

export default function CryptoTable({ coins, emptyMessage = 'No coins found.' }) {
  const [sortField, setSortField] = useState('market_cap_rank');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = [...coins].sort((a, b) => {
    let av = a[sortField] ?? 0;
    let bv = b[sortField] ?? 0;
    if (sortDir === 'asc') return av > bv ? 1 : -1;
    return av < bv ? 1 : -1;
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="sort-icon neutral">↕</span>;
    return <span className="sort-icon active">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  if (!coins.length) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="crypto-table" aria-label="Cryptocurrency market data">
        <thead>
          <tr>
            <th onClick={() => handleSort('market_cap_rank')} className="sortable">
              # <SortIcon field="market_cap_rank" />
            </th>
            <th>Asset</th>
            <th onClick={() => handleSort('current_price')} className="sortable">
              Price <SortIcon field="current_price" />
            </th>
            <th onClick={() => handleSort('price_change_percentage_24h')} className="sortable">
              24h % <SortIcon field="price_change_percentage_24h" />
            </th>
            <th onClick={() => handleSort('market_cap')} className="sortable">
              Market Cap <SortIcon field="market_cap" />
            </th>
            <th onClick={() => handleSort('total_volume')} className="sortable">
              Volume <SortIcon field="total_volume" />
            </th>
            <th className="th-spark">7d Chart</th>
            <th title="Watchlist">★</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((coin, i) => (
            <CoinRow key={coin.id} coin={coin} rank={coin.market_cap_rank || i + 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
