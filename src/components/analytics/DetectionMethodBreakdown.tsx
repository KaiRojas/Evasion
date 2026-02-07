'use client';

import { Gauge, Radio, Zap, Clock, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DetectionMethodBreakdownProps {
  data: Array<{
    method: string;
    count: number;
    percentage: number;
  }>;
}

const getMethodColor = (method: string) => {
  switch (method.toLowerCase()) {
    case 'radar':
      return 'text-blue-400';
    case 'laser':
      return 'text-red-400';
    case 'vascar':
      return 'text-yellow-400';
    case 'patrol':
      return 'text-green-400';
    case 'automated':
      return 'text-purple-400';
    default:
      return 'text-zinc-400';
  }
};

const getMethodBgColor = (method: string) => {
  switch (method.toLowerCase()) {
    case 'radar':
      return 'bg-blue-500';
    case 'laser':
      return 'bg-red-500';
    case 'vascar':
      return 'bg-yellow-500';
    case 'patrol':
      return 'bg-green-500';
    case 'automated':
      return 'bg-purple-500';
    default:
      return 'bg-violet-500';
  }
};

const getMethodIcon = (method: string) => {
  switch (method.toLowerCase()) {
    case 'radar':
      return Radio;
    case 'laser':
      return Zap;
    case 'vascar':
      return Clock;
    case 'patrol':
      return Car;
    default:
      return Gauge;
  }
};

export function DetectionMethodBreakdown({ data }: DetectionMethodBreakdownProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 text-center">
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500">No telemetry data acquired</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 backdrop-blur-sm">
      <h3 className="text-xs font-black uppercase italic tracking-wider text-[#F5F5F4] mb-4 flex items-center gap-2">
        <Radio size={16} className="text-[#8B5CF6]" />
        Detection Method Breakdown
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {data.map((m) => {
          const Icon = getMethodIcon(m.method);
          return (
            <div key={m.method} className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-3 text-center transition-all hover:border-[#8B5CF6]/30">
              <Icon className={cn(getMethodColor(m.method), "mx-auto mb-2")} size={24} />
              <p className="text-white text-[11px] font-black italic uppercase tracking-tight mb-0.5">{m.method}</p>
              <p className="text-zinc-500 text-[10px] font-bold">{m.count.toLocaleString()}</p>
              <div className="mt-2 bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-700", getMethodBgColor(m.method))}
                  style={{ width: `${m.percentage}%` }}
                />
              </div>
              <p className="text-[9px] font-black text-[#8B5CF6] mt-1">{m.percentage.toFixed(1)}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
