import { useMemo } from 'react';
import Svg, { Polyline } from 'react-native-svg';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function Sparkline({
  data,
  color,
  width = 110,
  height = 56,
}: {
  data: { timestamp: number; value: number }[];
  color: string;
  width?: number;
  height?: number;
}) {
  const points = useMemo(() => {
    if (!data.length) {
      return '';
    }

    const values = data.map((entry) => entry.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    return data
      .map((entry, index) => {
        const x = (index / Math.max(1, data.length - 1)) * width;
        const normalized = (entry.value - minValue) / range;
        const y = height - clamp(normalized, 0, 1) * height;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }, [data, height, width]);

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

