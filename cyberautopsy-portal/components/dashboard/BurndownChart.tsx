"use client";

/**
 * 90-day remediation burndown.
 * X axis = day 0..90, Y axis = open POA&M / control gaps.
 * Two series: planned (gold), actual (clinical blue).
 */
export function BurndownChart() {
  const days = 90;
  const startOpen = 30;
  const target = 0;

  // Planned: linear closure from startOpen at day 0 to target at day 90
  const planned: [number, number][] = Array.from({ length: days + 1 }, (_, d) => [
    d,
    startOpen - ((startOpen - target) * d) / days
  ]);

  // Actual: realistic-looking burndown — slower start, faster mid, plateau near end (simulating real engagement)
  const ACTUAL_RAW = [
    30, 30, 29, 29, 28, 27, 27, 26, 26, 25,
    24, 23, 23, 22, 21, 20, 20, 19, 18, 17,
    16, 16, 15, 14, 14, 13, 12, 12, 11, 11,
    10, 10, 10, 9, 9, 8, 8, 8, 8, 8 // we are here (day 39)
  ];
  const actual: [number, number][] = ACTUAL_RAW.map((v, i) => [i, v]);

  // SVG geometry
  const W = 640;
  const H = 200;
  const PAD = { l: 36, r: 16, t: 16, b: 30 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const x = (d: number) => PAD.l + (d / days) * innerW;
  const y = (n: number) => PAD.t + innerH - (n / startOpen) * innerH;

  const toPath = (pts: [number, number][]) =>
    pts.map(([d, n], i) => `${i === 0 ? "M" : "L"} ${x(d).toFixed(1)} ${y(n).toFixed(1)}`).join(" ");

  const lastActual = actual[actual.length - 1];

  return (
    <section className="border border-ink-700 bg-ink-900 p-5">
      <header className="flex items-baseline justify-between">
        <div>
          <h2 className="font-serif text-lg text-bone-50">Remediation burndown</h2>
          <p className="text-xs text-bone-400">90-day plan · day {lastActual[0]} of {days}</p>
        </div>
        <div className="flex items-center gap-4">
          <Legend color="#D4AF37" label="Planned" />
          <Legend color="#0EA5E9" label="Actual" />
        </div>
      </header>

      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]">
          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={PAD.l}
              x2={W - PAD.r}
              y1={PAD.t + innerH * t}
              y2={PAD.t + innerH * t}
              stroke="#1F1F24"
              strokeDasharray="2 4"
            />
          ))}
          {/* Y axis labels */}
          {[0, Math.round(startOpen / 2), startOpen].map((v, i) => (
            <text
              key={v}
              x={PAD.l - 6}
              y={y(v) + 4}
              textAnchor="end"
              fontFamily="monospace"
              fontSize="10"
              fill="#8E8E86"
            >
              {v}
            </text>
          ))}
          {/* X axis labels */}
          {[0, 30, 60, 90].map((d) => (
            <text
              key={d}
              x={x(d)}
              y={H - 10}
              textAnchor="middle"
              fontFamily="monospace"
              fontSize="10"
              fill="#8E8E86"
            >
              D{d}
            </text>
          ))}

          {/* Planned line */}
          <path d={toPath(planned)} stroke="#D4AF37" strokeWidth="1" fill="none" opacity="0.5" strokeDasharray="3 3" />

          {/* Actual line (with area under) */}
          <path
            d={`${toPath(actual)} L ${x(lastActual[0]).toFixed(1)} ${y(0).toFixed(1)} L ${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`}
            fill="#0EA5E9"
            opacity="0.08"
          />
          <path d={toPath(actual)} stroke="#0EA5E9" strokeWidth="1.6" fill="none" />

          {/* "Today" marker on actual */}
          <circle cx={x(lastActual[0])} cy={y(lastActual[1])} r="3.5" fill="#0EA5E9" />
          <text
            x={x(lastActual[0]) + 6}
            y={y(lastActual[1]) - 6}
            fontFamily="monospace"
            fontSize="10"
            fill="#FAFAFA"
          >
            8 open
          </text>
        </svg>
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 font-mono text-[10px] tracking-widest2 text-bone-400">
      <span className="h-px w-4" style={{ background: color }} aria-hidden />
      {label.toUpperCase()}
    </span>
  );
}
