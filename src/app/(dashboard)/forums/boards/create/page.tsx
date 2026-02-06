'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

const COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
];

const ICONS = ['💬', '🚗', '🏁', '🔧', '📸', '🎮', '💰', '📰', '🎯', '⚙️'];

export default function CreateBoardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '💬',
    color: '#3b82f6',
    isPrivate: false,
    requireApproval: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/forum/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          color: formData.color,
          settings: {
            isPrivate: formData.isPrivate,
            requireApproval: formData.requireApproval,
          },
        }),
      });

      const data = await res.json();

      if (!data.success) {
        // Provide helpful error messages
        if (res.status === 401) {
          throw new Error(data.error + ' (Redirect to login?)');
        } else if (res.status === 403) {
          throw new Error(data.error + ' (In dev mode, reputation check is skipped)');
        }
        throw new Error(data.error || 'Failed to create board');
      }

      // Small delay to ensure MongoDB has committed the data before redirecting
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect to the new board
      router.push(`/forums/boards/${data.data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/forums/boards"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Boards
        </Link>
        <h1 className="text-2xl font-bold text-white">Create Discussion Board</h1>
        <p className="text-zinc-400 mt-1">
          Create a new board for your community to discuss topics
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

        {/* Board Name */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Board Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Street Racing, Car Builds, Photography"
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            maxLength={50}
          />
          <p className="text-xs text-zinc-500 mt-1">{formData.name.length}/50 characters</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what this board is about..."
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
            required
            maxLength={200}
          />
          <p className="text-xs text-zinc-500 mt-1">{formData.description.length}/200 characters</p>
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Board Icon
          </label>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setFormData({ ...formData, icon })}
                className={`p-3 rounded-lg text-2xl transition-all ${
                  formData.icon === icon
                    ? 'bg-blue-500/20 ring-2 ring-blue-500'
                    : 'bg-zinc-900 hover:bg-zinc-800'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Board Color
          </label>
          <div className="grid grid-cols-7 gap-2">
            {COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setFormData({ ...formData, color: color.value })}
                className={`h-12 rounded-lg transition-all ${
                  formData.color === color.value ? 'ring-2 ring-white scale-110' : ''
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-white">Board Settings</h3>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-white">Private Board</div>
              <div className="text-xs text-zinc-400">
                Only approved members can view and post
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.requireApproval}
              onChange={(e) =>
                setFormData({ ...formData, requireApproval: e.target.checked })
              }
              className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-white">Require Post Approval</div>
              <div className="text-xs text-zinc-400">
                Moderators must approve new threads before they appear
              </div>
            </div>
          </label>
        </div>

        {/* Preview */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3">Preview</h3>
          <div className="flex items-center gap-4 p-4 bg-zinc-900 rounded-lg">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${formData.color}20`, color: formData.color }}
            >
              {formData.icon}
            </div>
            <div>
              <h4 className="font-semibold text-white">
                {formData.name || 'Board Name'}
              </h4>
              <p className="text-sm text-zinc-400">
                {formData.description || 'Board description will appear here'}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading || !formData.name || !formData.description}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={16} />
                Create Board
              </>
            )}
          </button>
          <Link
            href="/forums/boards"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </Link>
        </div>

        {/* Info */}
        <div className="bg-zinc-900/30 border border-zinc-700 rounded-lg p-4">
          <p className="text-xs text-zinc-400">
            <strong className="text-zinc-300">Note:</strong> In development mode, anyone can create a board.
            In production, you need 100 reputation points.
            As the creator, you will be the board moderator and can manage posts and members.
          </p>
        </div>
      </form>
    </div>
  );
}
