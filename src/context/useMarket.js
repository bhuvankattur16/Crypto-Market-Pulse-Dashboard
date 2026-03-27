import { useContext } from 'react';
import { MarketContext } from './MarketContext';

/**
 * useMarket — Custom hook to access the crypto market state.
 * Must be used within a MarketProvider.
 */
export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) {
    throw new Error('useMarket must be used inside a MarketProvider');
  }
  return ctx;
}
