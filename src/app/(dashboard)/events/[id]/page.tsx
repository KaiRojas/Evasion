'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, Clock, User, Check, X } from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  eventType: string;
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
    user: {
      username: string;
      avatar?: string;
    };
    status: 'going' | 'maybe' | 'not-going';
  }>;
  maxAttendees?: number;
  status: string;
  tags: string[];
  isPrivate: boolean;
  requiresApproval: boolean;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  'meet': '#3b82f6',
  'cruise': '#22c55e',
  'race': '#ef4444',
  'show': '#8b5cf6',
  'track-day': '#f59e0b',
  'other': '#6b7280',
};

const EVENT_TYPE_ICONS: Record<string, string> = {
  'meet': '🚗',
  'cruise': '🛣️',
  'race': '🏁',
  'show': '✨',
  'track-day': '🏎️',
  'other': '📅',
};

export default function EventPage() {
  const params = useParams();
  const id = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();

        if (!data.success) {
          setError(data.error || 'Event not found');
          return;
        }

        setEvent(data.data);
      } catch (err) {
        setError('Failed to load event');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getAttendeesByStatus = (status: string) => {
    if (!event) return [];
    return event.attendees.filter(a => a.status === status);
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-4 lg:p-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Events
        </Link>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 text-center">
          <p className="text-red-400">{error || 'Event not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Events
      </Link>

      <div className="max-w-4xl mx-auto">
        {/* Event Header */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden mb-6">
          <div
            className="h-3"
            style={{ backgroundColor: EVENT_TYPE_COLORS[event.eventType] }}
          />
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <span className="text-5xl">{EVENT_TYPE_ICONS[event.eventType]}</span>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <span className="px-2 py-1 bg-zinc-800 rounded">
                    {event.eventType.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded ${
                    event.status === 'upcoming' ? 'bg-green-500/20 text-green-400' :
                    event.status === 'ongoing' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-zinc-800 text-zinc-400'
                  }`}>
                    {event.status.toUpperCase()}
                  </span>
                  {event.isPrivate && (
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded">
                      PRIVATE
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>

            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {event.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-zinc-800 text-zinc-400 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Event Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Date & Time */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Date & Time
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-zinc-400">Start</div>
                  <div className="text-white font-medium">
                    {formatDate(event.startDate)} at {formatTime(event.startDate)}
                  </div>
                </div>
                {event.endDate && (
                  <div>
                    <div className="text-sm text-zinc-400">End</div>
                    <div className="text-white font-medium">
                      {formatDate(event.endDate)} at {formatTime(event.endDate)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Location
              </h2>
              <div className="space-y-2">
                <p className="text-white">{event.location.address}</p>
                <p className="text-zinc-400">
                  {event.location.city}, {event.location.state}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${event.location.coordinates.lat},${event.location.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-400 hover:text-blue-300 text-sm mt-2"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>

            {/* Host */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User size={20} />
                Hosted by
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-white font-semibold">
                  {event.host.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-white">{event.host.username}</div>
                  <div className="text-sm text-zinc-400">Event Organizer</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attendees */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users size={20} />
                Attendees
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Going</span>
                    <span className="font-semibold text-green-400">
                      {getAttendeesByStatus('going').length}
                      {event.maxAttendees && ` / ${event.maxAttendees}`}
                    </span>
                  </div>
                  {getAttendeesByStatus('going').length > 0 && (
                    <div className="space-y-2">
                      {getAttendeesByStatus('going').slice(0, 5).map((attendee, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Check size={14} className="text-green-400" />
                          <span className="text-zinc-300">{attendee.user.username}</span>
                        </div>
                      ))}
                      {getAttendeesByStatus('going').length > 5 && (
                        <div className="text-xs text-zinc-500">
                          +{getAttendeesByStatus('going').length - 5} more
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {getAttendeesByStatus('maybe').length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">Maybe</span>
                      <span className="font-semibold text-amber-400">
                        {getAttendeesByStatus('maybe').length}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                RSVP to Event
              </button>
            </div>

            {/* Event Info */}
            {event.requiresApproval && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-amber-400 text-sm">
                  This event requires host approval to attend
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
