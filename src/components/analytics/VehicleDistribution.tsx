'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import { cn } from '@/lib/utils';
import { Car } from 'lucide-react';

interface VehicleDistributionProps {
  data: Array<{
    make: string;
    count: number;
  }>;
}

export function VehicleDistribution({ data }: VehicleDistributionProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 text-center">
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500">No fleet telemetry acquired</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 backdrop-blur-sm">
      <h3 className="text-xs font-black uppercase italic tracking-wider text-[#F5F5F4] mb-4 flex items-center gap-2">
        <Car size={16} className="text-[#8B5CF6]" />
        Most Cited Vehicle Makes
      </h3>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => {
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value.toString();
              }}
            />
            <YAxis
              type="category"
              dataKey="make"
              tick={{ fill: '#F5F5F4', fontSize: 10, fontWeight: 800 }}
              axisLine={false}
              tickLine={false}
              width={90}
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
              labelStyle={{ color: '#8B5CF6', marginBottom: '2px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number | undefined) => [value ? value.toLocaleString() : '0', 'Intensity']}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? "#8B5CF6" : "rgba(139, 92, 246, 0.3)"}
                  className="transition-all hover:fill-[#8B5CF6]"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
