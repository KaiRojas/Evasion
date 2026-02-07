'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  Radio,
  Calendar,
  TrendingUp,
  MapPin,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Pattern {
  patternId: string;
  patternType: string;
  name: string;
  description: string;
  locationCount: number;
  locations: Array<{ gridId: string; lat: number; lng: number }>;
  confidence: number;
  statistics: Record<string, unknown>;
  insight: string;
}

interface PatternSummary {
  totalPatterns: number;
  timeClusters: number;
  methodZones: number;
  dayPatterns: number;
  quotaEffectDetected: boolean;
}

interface PatternDiscoveryProps {
  onLocationClick?: (gridId: string) => void;
}

const PATTERN_ICONS: Record<string, React.ReactNode> = {
  time_cluster: <Clock className="text-blue-400" size={20} />,
  method_zone: <Radio className="text-purple-400" size={20} />,
  day_pattern: <Calendar className="text-green-400" size={20} />,
  quota_effect: <TrendingUp className="text-yellow-400" size={20} />,
};

const PATTERN_COLORS: Record<string, string> = {
  time_cluster: 'border-blue-500/30 bg-blue-500/5',
  method_zone: 'border-purple-500/30 bg-purple-500/5',
  day_pattern: 'border-green-500/30 bg-green-500/5',
  quota_effect: 'border-yellow-500/30 bg-yellow-500/5',
};

export function PatternDiscovery({ onLocationClick }: PatternDiscoveryProps) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [summary, setSummary] = useState<PatternSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPatterns, setExpandedPatterns] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchPatterns() {
      try {
        const response = await fetch('/api/insights/ml/patterns');
        const result = await response.json();

        if (result.success) {
          setPatterns(result.data.patterns);
          setSummary(result.data.summary);
        } else {
          setError(result.error || 'Failed to load patterns');
        }
      } catch (err) {
        setError('Failed to fetch patterns');
      } finally {
        setLoading(false);
      }
    }

    fetchPatterns();
  }, []);

  const togglePattern = (patternId: string) => {
    const newExpanded = new Set(expandedPatterns);
    if (newExpanded.has(patternId)) {
      newExpanded.delete(patternId);
    } else {
      newExpanded.add(patternId);
    }
    setExpandedPatterns(newExpanded);
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-48 mb-4" />
        <div className="space-y-3">
          <div className="h-20 bg-gray-700 rounded" />
          <div className="h-20 bg-gray-700 rounded" />
          <div className="h-20 bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-red-400 flex items-center gap-2">
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Total Patterns', value: summary.totalPatterns, color: 'text-white' },
            { label: 'Time Clusters', value: summary.timeClusters, color: 'text-[#8B5CF6]' },
            { label: 'Method Zones', value: summary.methodZones, color: 'text-violet-400' },
            { label: 'Day Patterns', value: summary.dayPatterns, color: 'text-[#F5F5F4]' },
            { label: 'Quota Effect', value: summary.quotaEffectDetected ? 'Detected' : 'Negative', color: summary.quotaEffectDetected ? 'text-red-400' : 'text-zinc-500' },
          ].map((item, i) => (
            <div key={i} className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-3 text-center backdrop-blur-sm">
              <div className={cn("text-xl font-black italic", item.color)}>{item.value}</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Pattern List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black uppercase italic tracking-[0.2em] text-[#F5F5F4] flex items-center gap-2">
            <Zap className="text-[#8B5CF6] w-4 h-4" />
            Neural Extractions
          </h3>
          <div className="text-[10px] font-bold text-[#8B5CF6] animate-pulse">COMPUTING...</div>
        </div>

        {patterns.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-800/50 border-dashed rounded-3xl p-12 text-center">
            <div className="size-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
              <Radio className="text-zinc-700 animate-pulse" />
            </div>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500">Awaiting Signal Acquisition</p>
          </div>
        ) : (
          <div className="space-y-3">
            {patterns.map((pattern) => (
              <div
                key={pattern.patternId}
                className={cn(
                  "rounded-2xl border transition-all duration-300",
                  expandedPatterns.has(pattern.patternId)
                    ? "bg-[#8B5CF6]/5 border-[#8B5CF6]/30 shadow-xl shadow-[#8B5CF6]/5"
                    : "bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700"
                )}
              >
                {/* Pattern Header */}
                <button
                  onClick={() => togglePattern(pattern.patternId)}
                  className="w-full p-4 flex items-start gap-4 text-left"
                >
                  <div className={cn(
                    "mt-0.5 p-2 rounded-xl border border-zinc-800",
                    expandedPatterns.has(pattern.patternId) ? "bg-[#8B5CF6] text-white" : "bg-zinc-900 text-[#8B5CF6]"
                  )}>
                    {PATTERN_ICONS[pattern.patternType] || <Zap size={18} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black italic text-white uppercase tracking-tight">{pattern.name}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                          {Math.round(pattern.confidence * 100)}% RELIABILITY
                        </span>
                        {expandedPatterns.has(pattern.patternId) ? (
                          <ChevronUp size={14} className="text-zinc-500" />
                        ) : (
                          <ChevronDown size={14} className="text-zinc-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 font-medium leading-relaxed">{pattern.description}</p>
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedPatterns.has(pattern.patternId) && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="border-t border-zinc-800/50 pt-4 space-y-4">
                      {/* Insight */}
                      <div className="bg-[#030205] border border-[#8B5CF6]/20 rounded-xl p-4">
                        <p className="text-xs text-zinc-400 font-medium leading-relaxed italic">
                          <span className="text-[#8B5CF6] font-black not-italic mr-2">ANALYSIS:</span>
                          {pattern.insight}
                        </p>
                      </div>

                      {/* Statistics */}
                      {Object.keys(pattern.statistics).length > 0 && (
                        <div>
                          <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Metrics Spectrum</h5>
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            {Object.entries(pattern.statistics).map(([key, value]) => (
                              <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                                <div className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mb-0.5">{key.replace(/_/g, ' ')}</div>
                                <div className="text-xs text-white font-bold">
                                  {typeof value === 'number'
                                    ? value < 1
                                      ? `${Math.round(value * 100)}%`
                                      : value.toFixed(1)
                                    : Array.isArray(value)
                                      ? value.join(', ')
                                      : String(value)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Locations */}
                      {pattern.locations.length > 0 && (
                        <div>
                          <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Tactical Hotspots</h5>
                          <div className="flex flex-wrap gap-2">
                            {pattern.locations.slice(0, 8).map((loc) => (
                              <button
                                key={loc.gridId}
                                onClick={() => onLocationClick?.(loc.gridId)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs hover:border-[#8B5CF6]/50 transition-colors group"
                              >
                                <MapPin size={10} className="text-[#8B5CF6]" />
                                <span className="text-zinc-300 font-mono text-[10px]">
                                  {loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
