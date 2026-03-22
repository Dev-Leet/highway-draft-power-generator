import { useRef, useEffect, useState } from "react";

const W = 520, H = 190, PAD = { t: 14, r: 14, b: 30, l: 44 };

function toPoints(data, w, h) {
  if (!data || data.length < 2) return [];
  const vMin = Math.min(...data.map((d) => d.v));
  const vMax = Math.max(...data.map((d) => d.v));
  const range = vMax - vMin || 1;
  return data.map((d, i) => ({
    x: PAD.l + (i / (data.length - 1)) * (w - PAD.l - PAD.r),
    y: PAD.t + (1 - (d.v - vMin) / range) * (h - PAD.t - PAD.b),
    v: d.v,
    label: d.label,
  }));
}

function splinePath(pts) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cp1x = pts[i].x + (pts[i + 1].x - pts[i].x) / 3;
    const cp1y = pts[i].y;
    const cp2x = pts[i + 1].x - (pts[i + 1].x - pts[i].x) / 3;
    const cp2y = pts[i + 1].y;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  return d;
}

function linePath(pts) {
  if (!pts.length) return "";
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

function areaPath(pts, h) {
  const base = h - PAD.b;
  if (!pts.length) return "";
  return (
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
    ` L ${pts[pts.length - 1].x} ${base} L ${pts[0].x} ${base} Z`
  );
}

function splineAreaPath(pts, h) {
  if (pts.length < 2) return "";
  const base = h - PAD.b;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cp1x = pts[i].x + (pts[i + 1].x - pts[i].x) / 3;
    const cp1y = pts[i].y;
    const cp2x = pts[i + 1].x - (pts[i + 1].x - pts[i].x) / 3;
    const cp2y = pts[i + 1].y;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  d += ` L ${pts[pts.length - 1].x} ${base} L ${pts[0].x} ${base} Z`;
  return d;
}

export default function SensorChart({ data = [], chartType = "spline" }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [svgW, setSvgW] = useState(W);

  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSvgW(entry.contentRect.width || W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const w = Math.max(svgW - 4, 200);
  const h = H;
  const pts = toPoints(data, w, h);

  // Y-axis grid lines
  const vMin = data.length ? Math.min(...data.map((d) => d.v)) : 100;
  const vMax = data.length ? Math.max(...data.map((d) => d.v)) : 200;
  const gridLines = 4;
  const gridYs = Array.from({ length: gridLines + 1 }, (_, i) => ({
    y: PAD.t + (i / gridLines) * (h - PAD.t - PAD.b),
    v: Math.round(vMax - (i / gridLines) * (vMax - vMin)),
  }));

  // Bar width
  const barW = pts.length > 1 ? Math.max(2, ((w - PAD.l - PAD.r) / pts.length) * 0.7) : 10;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height={h}
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0e7490" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridYs.map(({ y, v }, i) => (
          <g key={i}>
            <line
              x1={PAD.l} y1={y} x2={w - PAD.r} y2={y}
              stroke="rgba(6,182,212,0.1)" strokeWidth={1}
            />
            <text x={PAD.l - 6} y={y + 4} fill="#475569" fontSize={10} textAnchor="end">
              {v}
            </text>
          </g>
        ))}

        {/* X-axis labels: first and last */}
        {pts.length > 0 && (
          <>
            <text x={pts[0].x} y={h - 6} fill="#475569" fontSize={9} textAnchor="middle">
              {pts[0].label}
            </text>
            <text
              x={pts[pts.length - 1].x}
              y={h - 6}
              fill="#475569"
              fontSize={9}
              textAnchor="middle"
            >
              {pts[pts.length - 1].label}
            </text>
          </>
        )}

        {/* Chart body */}
        {pts.length >= 2 && chartType !== "bar" && (
          <>
            <path
              d={chartType === "spline" ? splineAreaPath(pts, h) : areaPath(pts, h)}
              fill="url(#areaGrad)"
            />
            <path
              d={chartType === "spline" ? splinePath(pts) : linePath(pts)}
              fill="none"
              stroke="#06b6d4"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {/* Bar chart */}
        {chartType === "bar" &&
          pts.map((p, i) => (
            <rect
              key={i}
              x={p.x - barW / 2}
              y={p.y}
              width={barW}
              height={h - PAD.b - p.y}
              fill="url(#barGrad)"
              rx={2}
            />
          ))}

        {/* Invisible hit targets for tooltip */}
        {pts.map((p, i) => (
          <rect
            key={i}
            x={p.x - (w / pts.length) * 0.5}
            y={PAD.t}
            width={w / pts.length}
            height={h - PAD.t - PAD.b}
            fill="transparent"
            style={{ cursor: "crosshair" }}
            onMouseEnter={() => setTooltip({ x: p.x, y: p.y, v: p.v, label: p.label })}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}

        {/* Tooltip crosshair */}
        {tooltip && (
          <>
            <line
              x1={tooltip.x} y1={PAD.t} x2={tooltip.x} y2={h - PAD.b}
              stroke="#06b6d4" strokeWidth={1} strokeDasharray="3,3"
            />
            <circle cx={tooltip.x} cy={tooltip.y} r={4} fill="#06b6d4" />
            <rect
              x={Math.min(tooltip.x + 8, w - 95)}
              y={Math.max(tooltip.y - 28, PAD.t)}
              width={88}
              height={24}
              rx={5}
              fill="#0f172a"
              stroke="rgba(6,182,212,0.4)"
            />
            <text
              x={Math.min(tooltip.x + 52, w - 51)}
              y={Math.max(tooltip.y - 12, PAD.t + 14)}
              fill="#e2e8f0"
              fontSize={11}
              textAnchor="middle"
            >
              {tooltip.v.toFixed(1)} W
            </text>
          </>
        )}
      </svg>

      {/* Empty state */}
      {pts.length === 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#334155",
            fontSize: 13,
          }}
        >
          Waiting for data stream...
        </div>
      )}
    </div>
  );
}
