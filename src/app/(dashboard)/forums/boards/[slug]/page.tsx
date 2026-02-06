'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, MessageSquare, Pin } from 'lucide-react';
import Link from 'next/link';

interface Board {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  type: string;
  threadCount: number;
  postCount: number;
  createdBy: {
    username: string;
    avatar?: string;
  };
  moderators: Array<{
    username: string;
    avatar?: string;
  }>;
}

export default function BoardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await fetch(`/api/forum/boards/${slug}`);
        const data = await res.json();

        if (!data.success) {
          setError(data.error || 'Board not found');
          return;
        }

        setBoard(data.data);
      } catch (err) {
        setError('Failed to load board');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoard();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="p-4 lg:p-6">
        <Link
          href="/forums/boards"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Boards
        </Link>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 text-center">
          <p className="text-red-400">{error || 'Board not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <Link
        href="/forums/boards"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Boards
      </Link>

      {/* Board Info */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ backgroundColor: `${board.color}20`, color: board.color }}
          >
            {board.icon}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">{board.name}</h1>
            <p className="text-zinc-400 mb-4">{board.description}</p>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} />
                {board.threadCount} threads
              </div>
              <div className="flex items-center gap-2">
                <Pin size={16} />
                {board.postCount} posts
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Threads Section (Coming Soon) */}
      <div className="bg-zinc-900/30 border border-zinc-700 rounded-lg p-8 text-center">
        <MessageSquare size={48} className="mx-auto mb-4 text-zinc-600" />
        <h2 className="text-xl font-semibold text-white mb-2">Threads Coming Soon</h2>
        <p className="text-zinc-400">
          The board &quot;{board.name}&quot; has been created successfully. Thread functionality will be implemented next.
        </p>
      </div>

      {/* Board Info Footer */}
      <div className="mt-6 bg-zinc-900/30 border border-zinc-700 rounded-lg p-4">
        <div className="text-xs text-zinc-500">
          <p>
            <strong className="text-zinc-400">Created by:</strong> {board.createdBy.username}
          </p>
          {board.moderators && board.moderators.length > 0 && (
            <p className="mt-1">
              <strong className="text-zinc-400">Moderators:</strong>{' '}
              {board.moderators.map(mod => mod.username).join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
