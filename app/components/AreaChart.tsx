interface AreaChartProps {
  data: { label: string; value: number }[];
  from: string;
  to: string;
  id: string;
}

interface Point {
  x: number;
  y: number;
}

function monotonePath(points: Point[]): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M ${points[0].x} ${points[0].y}`;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  const dx: number[] = [];
  const dy: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = xs[i + 1] - xs[i];
    dy[i] = ys[i + 1] - ys[i];
    slope[i] = dy[i] / dx[i];
  }

  const c1 = [slope[0]];
  for (let i = 0; i < n - 2; i++) {
    const m = slope[i];
    const mNext = slope[i + 1];
    if (m * mNext <= 0) {
      c1[i + 1] = 0;
    } else {
      const len = dx[i] + dx[i + 1];
      c1[i + 1] = (3 * len) / ((len + dx[i + 1]) / m + (len + dx[i]) / mNext);
    }
  }
  c1[n - 1] = slope[n - 2];

  let path = `M ${xs[0].toFixed(2)} ${ys[0].toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const t = dx[i];
    const cp1x = xs[i] + t / 3;
    const cp1y = ys[i] + (c1[i] * t) / 3;
    const cp2x = xs[i + 1] - t / 3;
    const cp2y = ys[i + 1] - (c1[i + 1] * t) / 3;
    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${xs[i + 1].toFixed(2)} ${ys[i + 1].toFixed(2)}`;
  }
  return path;
}

export default function AreaChart({ data, from, to, id }: AreaChartProps) {
  const width = 100;
  const height = 60;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));

  const points = data.map((d, i) => {
    const x = data.length === 1 ? 0 : (i / (data.length - 1)) * width;
    const y =
      max === min
        ? height / 2
        : height - ((d.value - min) / (max - min)) * (height - 8) - 4;
    return { x, y };
  });

  const curvePath = monotonePath(points);
  const areaPath = `${curvePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-36 w-full"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} stopOpacity="0.5" />
          <stop offset="100%" stopColor={to} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${id})`} />
      <path
        d={curvePath}
        fill="none"
        stroke={to}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
