'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, Plus, Filter, Clock, Car } from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  eventType: 'meet' | 'cruise' | 'race' | 'show' | 'track-day' | 'other';
  startDate: string;
  endDate?: string;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  host: {
    username: string;
    avatar?: string;
  };
  attendees: Array<{
    user: string;
    status: string;
  }>;
  maxAttendees?: number;
  status: string;
  tags: string[];
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  'meet': '#3b82f6',      // Blue
  'cruise': '#22c55e',    // Green
  'race': '#ef4444',      // Red
  'show': '#8b5cf6',      // Purple
  'track-day': '#f59e0b', // Amber
  'other': '#6b7280',     // Gray
};

const EVENT_TYPE_ICONS: Record<string, string> = {
  'meet': '🚗',
  'cruise': '🛣️',
  'race': '🏁',
  'show': '✨',
  'track-day': '🏎️',
  'other': '📅',
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('upcoming');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params = new URLSearchParams();
        if (filter !== 'all') params.set('status', filter);
        if (typeFilter !== 'all') params.set('type', typeFilter);

        const res = await fetch(`/api/events?${params}`);
        const data = await res.json();

        if (data.success) {
          setEvents(data.data);
        } else {
          setError(data.error || 'Failed to load events');
        }
      } catch (err) {
        setError('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [filter, typeFilter]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getAttendeeCount = (event: Event) => {
    return event.attendees.filter(a => a.status === 'going').length;
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="text-zinc-400 mt-1">
            Discover and join automotive events in your area
          </p>
        </div>
        <Link
          href="/events/create"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={16} />
          Create Event
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-zinc-400" />
          <span className="text-sm text-zinc-400">Filter:</span>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {['upcoming', 'ongoing', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="meet">Car Meets</option>
          <option value="cruise">Cruises</option>
          <option value="race">Races</option>
          <option value="show">Car Shows</option>
          <option value="track-day">Track Days</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-zinc-800 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-zinc-800 rounded w-full mb-2"></div>
              <div className="h-4 bg-zinc-800 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-zinc-900/30 border border-zinc-700 rounded-lg p-8 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-zinc-600" />
          <h2 className="text-xl font-semibold text-white mb-2">No Events Found</h2>
          <p className="text-zinc-400 mb-4">
            {filter === 'upcoming'
              ? "There are no upcoming events. Be the first to create one!"
              : `No ${filter} events found.`}
          </p>
          <Link
            href="/events/create"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={16} />
            Create Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Link
              key={event._id}
              href={`/events/${event._id}`}
              className="bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-lg overflow-hidden transition-all hover:transform hover:scale-[1.02]"
            >
              {/* Event Type Badge */}
              <div
                className="h-2"
                style={{ backgroundColor: EVENT_TYPE_COLORS[event.eventType] }}
              />

              <div className="p-4">
                {/* Title and Icon */}
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl flex-shrink-0">
                    {EVENT_TYPE_ICONS[event.eventType]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-lg mb-1 truncate">
                      {event.title}
                    </h3>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">
                      {event.eventType.replace('-', ' ')}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                  {event.description}
                </p>

                {/* Date & Time */}
                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                  <Clock size={14} className="flex-shrink-0" />
                  <span className="truncate">{formatDate(event.startDate)}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-3">
                  <MapPin size={14} className="flex-shrink-0" />
                  <span className="truncate">
                    {event.location.city}, {event.location.state}
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Users size={14} />
                    <span>
                      {getAttendeeCount(event)}
                      {event.maxAttendees && ` / ${event.maxAttendees}`} going
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    by {event.host.username}
                  </div>
                </div>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {event.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
