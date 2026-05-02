import { LineChart } from 'react-native-wagmi-charts';
import { View } from 'react-native';

export function Sparkline({
  data,
  color,
  width = 72,
  height = 30,
}: {
  data: { timestamp: number; value: number }[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (!data || data.length === 0) {
    return (
      <View style={{ width, height, justifyContent: 'center' }}>
        <View style={{ height: 2, backgroundColor: color, opacity: 0.2, width: '100%', borderRadius: 1 }} />
      </View>
    );
  }

  return (
    <View style={{ width, height }}>
      <LineChart.Provider data={data}>
        <LineChart height={height} width={width}>
          <LineChart.Path 
            color={color} 
            width={2.5} 
          />
        </LineChart>
      </LineChart.Provider>
    </View>
  );
}

