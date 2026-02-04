'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  RefreshCw,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Prediction {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  probability: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  totalHistoricalStops: number;
  alcoholIncidents: number;
  accidentIncidents: number;
  distanceMiles: number | null;
}

interface PredictionContext {
  hour: number;
  hourLabel: string;
  timeOfDay: string;
  day: number;
  dayLabel: string;
  totalHotspots: number;
  highRiskCount: number;
}

interface PredictionPanelProps {
  userLocation?: { latitude: number; longitude: number } | null;
  onSelectPrediction?: (prediction: Prediction) => void;
  className?: string;
}

const riskColors = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  very_high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const riskLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  very_high: 'Very High',
};

export function PredictionPanel({
  userLocation,
  onSelectPrediction,
  className,
}: PredictionPanelProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [context, setContext] = useState<PredictionContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchPredictions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (userLocation) {
        params.set('lat', userLocation.latitude.toString());
        params.set('lng', userLocation.longitude.toString());
      }

      const res = await fetch(`/api/analytics/predict?${params}`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const json = await res.json();
      
      if (json.success) {
        setPredictions(json.data.predictions);
        setContext(json.data.context);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    fetchPredictions();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchPredictions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchPredictions]);

  const highRiskPredictions = predictions.filter(
    (p) => p.riskLevel === 'high' || p.riskLevel === 'very_high'
  );

  return (
    <div
      className={cn(
        'bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-xl shadow-xl overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                Activity Predictions
                {highRiskPredictions.length > 0 && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                    {highRiskPredictions.length} High Risk
                  </span>
                )}
              </h3>
              {context && (
                <p className="text-xs text-zinc-400">
                  {context.timeOfDay} • {context.dayLabel}
                </p>
              )}
            </div>
          </div>
          <ChevronRight
            size={20}
            className={cn(
              'text-zinc-400 transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-zinc-800">
          {/* Context info */}
          {context && (
            <div className="px-4 py-3 bg-zinc-800/50 flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-zinc-400">
                  <Clock size={14} />
                  <span>{context.hourLabel}</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-400">
                  <TrendingUp size={14} />
                  <span>{context.totalHotspots} hotspots</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fetchPredictions();
                }}
                disabled={isLoading}
              >
                <RefreshCw
                  size={14}
                  className={isLoading ? 'animate-spin' : ''}
                />
              </Button>
            </div>
          )}

          {/* Predictions list */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-zinc-400">
                <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
                Loading predictions...
              </div>
            ) : predictions.length === 0 ? (
              <div className="p-4 text-center text-zinc-400">
                <MapPin size={20} className="mx-auto mb-2 opacity-50" />
                No predictions available
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {predictions.slice(0, 10).map((prediction) => (
                  <div
                    key={prediction.id}
                    className="p-3 hover:bg-zinc-800/50 cursor-pointer transition-colors"
                    onClick={() => onSelectPrediction?.(prediction)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              'px-2 py-0.5 text-xs font-medium rounded border',
                              riskColors[prediction.riskLevel]
                            )}
                          >
                            {riskLabels[prediction.riskLevel]}
                          </span>
                          {prediction.distanceMiles !== null && (
                            <span className="text-xs text-zinc-500">
                              {prediction.distanceMiles} mi away
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400">
                          {prediction.totalHistoricalStops.toLocaleString()} historical stops
                          {prediction.alcoholIncidents > 0 && (
                            <span className="text-red-400 ml-1">
                              • {prediction.alcoholIncidents} alcohol
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">
                          {Math.round(prediction.probability * 100)}%
                        </p>
                        <p className="text-xs text-zinc-500">likely</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {predictions.length > 10 && (
            <div className="p-3 border-t border-zinc-800 text-center">
              <span className="text-xs text-zinc-500">
                Showing 10 of {predictions.length} hotspots
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
