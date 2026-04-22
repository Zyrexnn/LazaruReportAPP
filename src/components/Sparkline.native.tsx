import { LineChart } from 'react-native-wagmi-charts';

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
  return (
    <LineChart.Provider data={data}>
      <LineChart height={height} width={width}>
        <LineChart.Path color={color} width={2} />
      </LineChart>
    </LineChart.Provider>
  );
}

