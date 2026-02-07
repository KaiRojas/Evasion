'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';

export default function EditProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: user?.displayName || '',
        username: user?.username || '',
        bio: '',  // Bio not stored in AuthUser, start empty for editing
        avatarUrl: user?.avatarUrl || '',
    });
    const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setAvatarPreview(result);
                setFormData(prev => ({ ...prev, avatarUrl: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        router.push('/profile');
    };

    return (
        <div className="min-h-screen bg-[#06040A] text-[#F5F5F4]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#06040A]/90 backdrop-blur-xl border-b border-[rgba(139,92,246,0.1)]">
                <div className="flex items-center p-4 justify-between max-w-md mx-auto">
                    <Link href="/profile" className="p-2 -m-2 hover:bg-white/5 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[#F5F5F4]">close</span>
                    </Link>
                    <h1 className="text-lg font-bold">Edit Profile</h1>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="text-[#8B5CF6] font-bold disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 py-8">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center mb-8">
                    <div
                        onClick={handleAvatarClick}
                        className="relative cursor-pointer group"
                    >
                        <div className="size-32 rounded-full p-1.5 bg-gradient-to-tr from-[#8B5CF6] to-purple-400">
                            <div
                                className="size-full rounded-full bg-[#06040A] border-4 border-[#06040A] overflow-hidden bg-center bg-cover"
                                style={{
                                    backgroundImage: avatarPreview ? `url('${avatarPreview}')` : 'none',
                                    backgroundColor: avatarPreview ? 'transparent' : '#1a1a2e'
                                }}
                            >
                                {!avatarPreview && (
                                    <div className="size-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-5xl text-white/30">person</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Camera overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                        </div>
                        {/* Edit badge */}
                        <div className="absolute bottom-1 right-1 size-8 bg-[#8B5CF6] rounded-full flex items-center justify-center border-4 border-[#06040A]">
                            <span className="material-symbols-outlined text-white text-sm">edit</span>
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <button
                        onClick={handleAvatarClick}
                        className="mt-4 text-[#8B5CF6] text-sm font-medium"
                    >
                        Change Photo
                    </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-3 bg-[#0D0B14] border border-white/10 rounded-xl text-[#F5F5F4] placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] transition-colors"
                            placeholder="Your name"
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                            Username
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">@</span>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                className="w-full pl-8 pr-4 py-3 bg-[#0D0B14] border border-white/10 rounded-xl text-[#F5F5F4] placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] transition-colors"
                                placeholder="username"
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                            Bio
                        </label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            rows={3}
                            maxLength={150}
                            className="w-full px-4 py-3 bg-[#0D0B14] border border-white/10 rounded-xl text-[#F5F5F4] placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] transition-colors resize-none"
                            placeholder="Tell us about yourself..."
                        />
                        <p className="text-right text-xs text-slate-500 mt-1">
                            {formData.bio.length}/150
                        </p>
                    </div>
                </div>

                {/* Additional Options */}
                <div className="mt-8 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Vehicle Info</h3>
                    <Link
                        href="/garage/add"
                        className="flex items-center justify-between p-4 bg-[#0D0B14] rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#8B5CF6]">add_circle</span>
                            <span className="font-medium">Add Vehicle</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                    </Link>
                </div>

                {/* Delete Account */}
                <div className="mt-12 pt-8 border-t border-white/5">
                    <button className="w-full p-4 text-red-400 text-sm font-medium hover:bg-red-500/10 rounded-xl transition-colors">
                        Delete Account
                    </button>
                </div>
            </main>
        </div>
    );
}
