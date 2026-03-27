import { useMarket } from '../context/useMarket';
import { Globe, Bitcoin, Layers } from 'lucide-react';

function fmt(n) {
  if (n == null) return '—';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

export default function GlobalStatsBar() {
  const { globalStats } = useMarket();

  if (!globalStats) return null;

  const d = globalStats.data;
  const totalMarketCap = d?.total_market_cap?.usd;
  const marketCapChange = d?.market_cap_change_percentage_24h_usd;
  const btcDominance = d?.market_cap_percentage?.btc;
  const activeCryptos = d?.active_cryptocurrencies;

  const changePositive = marketCapChange >= 0;

  return (
    <div className="global-stats-bar" role="region" aria-label="Global crypto market stats">
      <div className="gstat-item">
        <Globe size={13} />
        <span className="gstat-label">Market Cap</span>
        <span className="gstat-value">{fmt(totalMarketCap)}</span>
        {marketCapChange != null && (
          <span className={`gstat-change ${changePositive ? 'positive' : 'negative'}`}>
            {changePositive ? '▲' : '▼'} {Math.abs(marketCapChange).toFixed(2)}%
          </span>
        )}
      </div>

      <span className="gstat-divider" />

      <div className="gstat-item">
        <Bitcoin size={13} />
        <span className="gstat-label">BTC Dominance</span>
        <span className="gstat-value">{btcDominance != null ? `${btcDominance.toFixed(1)}%` : '—'}</span>
      </div>

      <span className="gstat-divider" />

      <div className="gstat-item">
        <Layers size={13} />
        <span className="gstat-label">Active Cryptos</span>
        <span className="gstat-value">{activeCryptos != null ? activeCryptos.toLocaleString() : '—'}</span>
      </div>
    </div>
  );
}
