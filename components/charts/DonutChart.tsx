import React from 'react';

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  innerRadius?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, size = 200, innerRadius = 65 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  const circumference = 2 * Math.PI * r;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={r - innerRadius} />
          <text x={cx} y={cy - 4} textAnchor="middle" fill="#9ca3af" fontSize="14">Sin datos</text>
        </svg>
      </div>
    );
  }

  let offset = 0;
  const segments = data.filter(d => d.value > 0).map((d, i) => {
    const percentage = d.value / total;
    const dashLength = percentage * circumference;
    const seg = (
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={d.color}
        strokeWidth={r - innerRadius}
        strokeDasharray={`${dashLength} ${circumference - dashLength}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        className="transition-all duration-300"
      >
        <title>{`${d.label}: $${d.value} (${(percentage * 100).toFixed(1)}%)`}</title>
      </circle>
    );
    offset += dashLength;
    return seg;
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#1f2937" fontSize="18" fontWeight="bold">
          ${total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#6b7280" fontSize="11">Total</text>
      </svg>
      <div className="flex flex-wrap justify-center gap-3 mt-3">
        {data.filter(d => d.value > 0).map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            {d.label}: ${d.value}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
