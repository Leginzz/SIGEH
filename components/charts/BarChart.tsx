import React from 'react';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  maxValue?: number;
  barColor?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, height = 200, maxValue, barColor = '#6366f1' }) => {
  const max = maxValue ?? Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.max(20, Math.min(40, 600 / data.length - 8));

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${data.length * (barWidth + 8) + 20} ${height + 30}`} className="w-full" style={{ height: 'auto' }}>
        {data.map((d, i) => {
          const barH = (d.value / max) * height;
          const x = 10 + i * (barWidth + 8);
          const y = height - barH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barH, 1)}
                fill={d.color || barColor}
                rx={3}
                className="transition-all duration-300"
              >
                <title>{`${d.label}: $${d.value}`}</title>
              </rect>
              <text x={x + barWidth / 2} y={height + 16} textAnchor="middle" fill="#94a3b8" fontSize="11">
                {d.label}
              </text>
              {d.value > 0 && (
                <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fill="#475569" fontSize="10" fontWeight="bold">
                  ${d.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default BarChart;
