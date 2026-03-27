// CoinGecko API Service — all API calls are centralized here
// In development the Vite proxy forwards /api/coingecko/* → https://api.coingecko.com/api/v3/*
// eliminating browser CORS issues.

const BASE_URL = '/api/coingecko';
const DEFAULT_CURRENCY = 'usd';
const MAX_RETRIES = 2;

/** Internal fetch wrapper with exponential back-off on 429 */
async function apiFetch(url, attempt = 0) {
  const res = await fetch(url);
  if (res.status === 429) {
    if (attempt < MAX_RETRIES) {
      // Back-off: 2s on first retry, 5s on second
      await new Promise((r) => setTimeout(r, attempt === 0 ? 2000 : 5000));
      return apiFetch(url, attempt + 1);
    }
    throw new Error('RATE_LIMIT');
  }
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/**
 * Fetch top N coins by market cap with full market data + 7-day sparkline.
 */
export async function fetchTopCoins(limit = 50) {
  const url =
    `${BASE_URL}/coins/markets` +
    `?vs_currency=${DEFAULT_CURRENCY}` +
    `&order=market_cap_desc` +
    `&per_page=${limit}` +
    `&page=1` +
    `&sparkline=true` +
    `&price_change_percentage=24h,7d`;
  return apiFetch(url);
}

/**
 * Fetch global crypto market statistics (market cap, BTC dominance, etc.).
 */
export async function fetchGlobalStats() {
  return apiFetch(`${BASE_URL}/global`);
}

/**
 * Fetch detailed data for a single coin by ID.
 */
export async function fetchCoinDetail(coinId) {
  const url =
    `${BASE_URL}/coins/${coinId}` +
    `?localization=false` +
    `&tickers=false` +
    `&market_data=true` +
    `&community_data=false` +
    `&developer_data=false`;
  return apiFetch(url);
}

/**
 * Search coins by query string.
 */
export async function searchCoins(query) {
  return apiFetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`);
}
