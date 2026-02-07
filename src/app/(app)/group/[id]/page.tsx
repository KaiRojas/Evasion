'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function GroupPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.id as string;

    // Mock data
    const isJoined = useState(false);
    const group = {
        name: groupId === 'porsche-club' ? 'SoCal Porsches' : 'Midnight Runners',
        image: groupId === 'porsche-club'
            ? 'https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2000&auto=format&fit=crop'
            : 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2830&auto=format&fit=crop',
        members: '1.2k',
        location: 'Los Angeles, CA',
        description: 'Official group for Porsche enthusiasts in Southern California. Weekly meets and canyon runs.',
        stats: {
            active: 142,
            events: 4,
            routes: 28
        }
    };

    return (
        <div className="flex flex-col min-h-screen pb-24">
            {/* Header / Hero */}
            <div className="relative h-64 w-full">
                <img
                    src={group.image}
                    className="w-full h-full object-cover"
                    alt={group.name}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#06040A]" />

                {/* Nav Back */}
                <Link
                    href="/explore"
                    className="absolute top-4 left-4 size-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/60 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>

                <div className="absolute bottom-0 left-0 w-full p-6">
                    <h1 className="text-3xl font-bold text-white mb-1 shadow-sm">{group.name}</h1>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/90 font-medium">{group.location}</span>
                        <span className="text-white/60">•</span>
                        <span className="text-white/90 font-medium">{group.members} members</span>
                    </div>
                </div>
            </div>

            {/* Actions & Stats */}
            <div className="px-6 py-4 flex flex-col gap-6 border-b border-[rgba(255,255,255,0.05)]">
                <div className="flex gap-4">
                    <button className="flex-1 bg-[#8B5CF6] text-white h-11 rounded-full font-bold uppercase tracking-wide text-xs shadow-[0_5px_20px_rgba(139,92,246,0.3)] active:scale-95 transition-all">
                        Join Group
                    </button>
                    <button className="px-6 h-11 rounded-full border border-[rgba(255,255,255,0.1)] text-white font-bold uppercase tracking-wide text-xs hover:bg-white/5 transition-colors">
                        Invites
                    </button>
                </div>

                <div className="flex justify-between px-2">
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-white">{group.stats.active}</span>
                        <span className="text-[10px] text-[#A8A8A8] font-bold uppercase tracking-wider">Active</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-white">{group.stats.events}</span>
                        <span className="text-[10px] text-[#A8A8A8] font-bold uppercase tracking-wider">Events</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-white">{group.stats.routes}</span>
                        <span className="text-[10px] text-[#A8A8A8] font-bold uppercase tracking-wider">Routes</span>
                    </div>
                </div>

                <p className="text-[#A8A8A8] text-sm leading-relaxed">
                    {group.description}
                </p>
            </div>

            {/* Feed Section */}
            <div className="flex flex-col gap-4 p-4">
                <h3 className="text-[#A8A8A8] text-xs font-bold uppercase tracking-wider px-2">Group Feed</h3>

                {/* Create Post */}
                <div className="flex gap-3 items-center bg-[#0D0B14] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                    <div className="size-10 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-purple-400 p-[2px]">
                        <div className="size-full rounded-full bg-[#0D0B14] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#8B5CF6] text-lg">person</span>
                        </div>
                    </div>
                    <input
                        type="text"
                        placeholder={`Post to ${group.name}...`}
                        className="bg-transparent flex-1 text-sm text-white placeholder:text-[#A8A8A8] outline-none"
                    />
                    <button className="text-[#8B5CF6]">
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </div>

                {/* Posts */}
                <GroupPost
                    author="Michael Ross"
                    time="2h ago"
                    content="Anyone up for a sunrise run on ACH tomorrow? Looking for 3-4 cars max."
                    likes={12}
                    comments={5}
                />
                <GroupPost
                    author="Jessica Lee"
                    time="5h ago"
                    content="Great turnout at the meet last night! Here's a shot of the lineup."
                    image="https://images.unsplash.com/photo-1574775492196-857c74230d74?q=80&w=2940&auto=format&fit=crop"
                    likes={84}
                    comments={12}
                />
            </div>
        </div>
    );
}

function GroupPost({ author, time, content, image, likes, comments }: any) {
    return (
        <div className="bg-[#0D0B14] rounded-xl border border-[rgba(255,255,255,0.05)] overflow-hidden">
            <div className="flex items-center gap-3 p-3">
                <div className="size-8 rounded-full bg-[#1A1820] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#A8A8A8] text-sm">person</span>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-bold">{author}</span>
                        <span className="text-[10px] text-[#A8A8A8]">• {time}</span>
                    </div>
                    <span className="text-[10px] text-[#8B5CF6] font-medium">Member</span>
                </div>
            </div>

            <p className="text-[#F5F5F4] text-sm px-3 pb-3 leading-relaxed">
                {content}
            </p>

            {image && (
                <div className="aspect-video w-full bg-[#1A1820] relative">
                    <img src={image} className="w-full h-full object-cover" alt="Post content" />
                </div>
            )}

            <div className="flex items-center p-3 border-t border-[rgba(255,255,255,0.05)] gap-4">
                <button className="flex items-center gap-1.5 text-[#A8A8A8] hover:text-[#EF4444] transition-colors">
                    <span className="material-symbols-outlined text-lg">favorite</span>
                    <span className="text-xs font-medium">{likes}</span>
                </button>
                <button className="flex items-center gap-1.5 text-[#A8A8A8] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">chat_bubble</span>
                    <span className="text-xs font-medium">{comments}</span>
                </button>
            </div>
        </div>
    );
}
