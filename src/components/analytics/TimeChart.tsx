'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Clock } from 'lucide-react';

interface TimeChartProps {
  data: Array<{
    label: string;
    count: number;
    alcoholCount?: number;
    accidentCount?: number;
  }>;
  title: string;
  showBreakdown?: boolean;
}

export function TimeChart({ data, title, showBreakdown = false }: TimeChartProps) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 backdrop-blur-sm">
      <h3 className="text-xs font-black uppercase italic tracking-wider text-[#F5F5F4] mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-[#8B5CF6]" />
        {title}
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => {
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value.toString();
              }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
              contentStyle={{
                backgroundColor: '#030205',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#fff'
              }}
              labelStyle={{ color: '#8B5CF6', marginBottom: '4px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value) => [value ? value.toLocaleString() : '0', 'Intensity']}
            />
            <Bar
              dataKey="count"
              name="Intelligence Volume"
              fill="#8B5CF6"
              radius={[4, 4, 0, 0]}
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
