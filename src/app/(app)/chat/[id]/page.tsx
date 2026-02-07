'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/navigation';

interface Message {
    id: string;
    text: string;
    sender: 'me' | 'them';
    time: string;
    isRoute?: boolean;
}

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    // In a real app, use params.id to fetch chat data
    const chatId = params.id as string;

    // Mock data based on ID
    const isGroup = chatId === 'group-1';
    const title = isGroup ? 'Midnight Runners' : 'Marcus Chen';
    const subtitle = isGroup ? '82 active now' : 'Online';

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Yo, you going to the meet tonight?', sender: 'them', time: '8:42 PM' },
        { id: '2', text: 'Thinking about it. What time?', sender: 'me', time: '8:45 PM' },
        { id: '3', text: 'We roll out at 10. Meeting at the usual spot.', sender: 'them', time: '8:46 PM' },
        { id: '4', text: 'Sent you the route.', sender: 'them', time: '8:46 PM', isRoute: true },
    ]);

    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, newMessage]);
        setInputText('');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)]">
            {/* Custom Header for Chat */}
            <div className="sticky top-0 z-30 bg-[#06040A]/95 backdrop-blur-md border-b border-[rgba(139,92,246,0.1)] px-4 py-3 flex items-center gap-3">
                <Link href="/explore" className="text-[#A8A8A8] hover:text-white transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div className="size-10 rounded-full bg-[#1A1820] flex items-center justify-center shrink-0">
                    {isGroup ? (
                        <span className="material-symbols-outlined text-[#8B5CF6]">groups</span>
                    ) : (
                        <span className="material-symbols-outlined text-[#8B5CF6]">person</span>
                    )}
                </div>
                <div className="flex flex-col">
                    <h1 className="text-white font-bold text-sm">{title}</h1>
                    <span className={`text-[10px] items-center gap-1.5 flex ${isGroup ? 'text-[#A8A8A8]' : 'text-[#22C55E]'}`}>
                        {!isGroup && <div className="size-1.5 rounded-full bg-[#22C55E]" />}
                        {subtitle}
                    </span>
                </div>
                <button className="ml-auto text-[#A8A8A8] hover:text-white">
                    <span className="material-symbols-outlined">more_vert</span>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                <div className="text-center py-4">
                    <span className="text-[10px] text-[#A8A8A8] font-medium uppercase tracking-widest bg-[#0D0B14] px-3 py-1 rounded-full border border-[rgba(255,255,255,0.05)]">
                        Today
                    </span>
                </div>

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col max-w-[80%] ${msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                        {msg.isRoute ? (
                            <div className={`rounded-2xl p-3 border mb-1 w-64 ${msg.sender === 'me'
                                    ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/20'
                                    : 'bg-[#0D0B14] border-[rgba(255,255,255,0.1)]'
                                }`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="size-8 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#8B5CF6] text-lg">map</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white text-xs font-bold">Midnight Run</span>
                                        <span className="text-[#A8A8A8] text-[10px]">12.4 mi • 45m</span>
                                    </div>
                                </div>
                                <button className="w-full py-1.5 rounded-lg bg-[#8B5CF6] text-white text-xs font-bold uppercase tracking-wide">
                                    View Route
                                </button>
                            </div>
                        ) : (
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed mb-1 ${msg.sender === 'me'
                                    ? 'bg-[#8B5CF6] text-white rounded-tr-none'
                                    : 'bg-[#1A1820] text-[#F5F5F4] rounded-tl-none border border-[rgba(255,255,255,0.05)]'
                                }`}>
                                {msg.text}
                            </div>
                        )}
                        <span className="text-[10px] text-[#A8A8A8] px-1">{msg.time}</span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#06040A] border-t border-[rgba(139,92,246,0.1)]">
                <div className="flex items-center gap-2 bg-[#0D0B14] p-2 pr-2 rounded-full border border-[rgba(255,255,255,0.1)] focus-within:border-[#8B5CF6] transition-colors">
                    <button className="size-8 rounded-full flex items-center justify-center text-[#A8A8A8] hover:text-[#8B5CF6] transition-colors">
                        <span className="material-symbols-outlined text-xl">add_circle</span>
                    </button>
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Message..."
                        className="flex-1 bg-transparent text-sm text-white placeholder:text-[#525252] outline-none"
                    />
                    <button
                        onClick={handleSend}
                        className={`size-8 rounded-full flex items-center justify-center transition-all ${inputText.trim()
                                ? 'bg-[#8B5CF6] text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                                : 'text-[#525252]'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
