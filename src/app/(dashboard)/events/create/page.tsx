'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';

const EVENT_TYPES = [
  { value: 'meet', label: 'Car Meet', icon: '🚗', description: 'Casual gathering of car enthusiasts' },
  { value: 'cruise', label: 'Cruise', icon: '🛣️', description: 'Group drive through scenic routes' },
  { value: 'race', label: 'Race', icon: '🏁', description: 'Competitive racing event' },
  { value: 'show', label: 'Car Show', icon: '✨', description: 'Display and showcase vehicles' },
  { value: 'track-day', label: 'Track Day', icon: '🏎️', description: 'Professional track driving' },
  { value: 'other', label: 'Other', icon: '📅', description: 'Other automotive event' },
];

export default function CreateEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'meet',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    address: '',
    city: '',
    state: '',
    lat: 39.0,
    lng: -77.0,
    maxAttendees: '',
    isPrivate: false,
    requiresApproval: false,
    tags: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Combine date and time
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = formData.endDate && formData.endTime
        ? new Date(`${formData.endDate}T${formData.endTime}`)
        : undefined;

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          eventType: formData.eventType,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime?.toISOString(),
          location: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            coordinates: {
              lat: formData.lat,
              lng: formData.lng,
            },
          },
          maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
          isPrivate: formData.isPrivate,
          requiresApproval: formData.requiresApproval,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create event');
      }

      // Small delay to ensure data is committed
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect to the new event
      router.push(`/events/${data.data._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Events
        </Link>
        <h1 className="text-2xl font-bold text-white">Create Event</h1>
        <p className="text-zinc-400 mt-1">
          Organize a car meet, cruise, or other automotive event
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Event Title */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Event Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Sunday Morning Cars & Coffee"
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            maxLength={100}
          />
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Event Type *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {EVENT_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, eventType: type.value })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  formData.eventType === type.value
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <span className="text-2xl mb-2 block">{type.icon}</span>
                <div className="font-medium text-white text-sm">{type.label}</div>
                <div className="text-xs text-zinc-500 mt-1">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your event, what to expect, parking info, etc..."
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-32"
            required
            maxLength={2000}
          />
          <p className="text-xs text-zinc-500 mt-1">{formData.description.length}/2000 characters</p>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Start Time *
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              End Time
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Location *
          </label>
          <div className="space-y-3">
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State (e.g., MD)"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                maxLength={2}
              />
            </div>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-white">Additional Settings</h3>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Max Attendees (optional)
            </label>
            <input
              type="number"
              value={formData.maxAttendees}
              onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
              placeholder="Leave blank for unlimited"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-white">Private Event</div>
              <div className="text-xs text-zinc-400">
                Only invited users can view and join
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.requiresApproval}
              onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
              className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-white">Require Approval</div>
              <div className="text-xs text-zinc-400">
                Host must approve all attendees
              </div>
            </div>
          </label>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., jdm, muscle, imports"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading || !formData.title || !formData.description}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Calendar size={16} />
                Create Event
              </>
            )}
          </button>
          <Link
            href="/events"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
