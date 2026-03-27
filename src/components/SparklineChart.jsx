/**
 * SparklineChart — renders a 7-day mini SVG line chart from CoinGecko sparkline data.
 * Props:
 *   prices  — number[]  (sparkline_in_7d.price array)
 *   positive — boolean  (true = green line, false = red line)
 *   width   — number    (default 80)
 *   height  — number    (default 32)
 */
export default function SparklineChart({ prices, positive = true, width = 80, height = 32 }) {
  if (!prices || prices.length < 2) {
    return <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>;
  }

  // Subsample to at most 40 points for performance
  const step = Math.max(1, Math.floor(prices.length / 40));
  const pts = prices.filter((_, i) => i % step === 0);

  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;

  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const points = pts
    .map((p, i) => {
      const x = pad + (i / (pts.length - 1)) * w;
      const y = pad + h - ((p - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const color = positive ? 'var(--green)' : 'var(--red)';
  const fillId = `sf-${positive ? 'g' : 'r'}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="sparkline-svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Filled area */}
      <polygon
        points={`${pad},${height - pad} ${points} ${width - pad},${height - pad}`}
        fill={`url(#${fillId})`}
      />
      {/* Line */}
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
