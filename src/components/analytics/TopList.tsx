'use client';

interface TopListItem {
  name: string | null;
  count: number;
}

interface TopListProps {
  title: string;
  items: TopListItem[];
  maxItems?: number;
}

export function TopList({ title, items, maxItems = 5 }: TopListProps) {
  const displayItems = items.slice(0, maxItems);
  const maxCount = Math.max(...displayItems.map((i) => i.count), 1);

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 backdrop-blur-sm">
      <h3 className="text-[10px] font-black uppercase italic tracking-[0.2em] text-[#F5F5F4] mb-4">
        {title}
      </h3>
      <div className="space-y-4">
        {displayItems.map((item, index) => (
          <div key={index} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black italic uppercase tracking-tight text-white truncate max-w-[180px]">
                {item.name || 'Unknown Zone'}
              </span>
              <span className="text-[10px] font-bold text-zinc-500 tabular-nums">
                {item.count.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
              <div
                className="h-full bg-gradient-to-r from-[#8B5CF6] to-violet-900 rounded-full transition-all duration-700"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
