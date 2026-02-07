'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#06040A] text-[#F5F5F4]">
            <header className="sticky top-0 z-50 bg-[#06040A]/90 backdrop-blur-xl border-b border-[rgba(139,92,246,0.1)]">
                <div className="flex items-center p-4 justify-between max-w-md mx-auto">
                    <Link href="/settings" className="p-2 -m-2 hover:bg-white/5 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[#F5F5F4]">close</span>
                    </Link>
                    <h1 className="text-lg font-bold">Terms of Service</h1>
                    <div className="size-10" />
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 py-8 prose prose-invert prose-sm">
                <p className="text-slate-400 text-xs mb-8">Last Updated: February 6, 2026</p>

                <h3>1. Introduction</h3>
                <p>
                    Welcome to EVASION. By accessing or using our application, you agree to be bound by these Terms of Service.
                    If you do not agree to these terms, simply do not use the application.
                </p>

                <h3>2. Usage & Safety</h3>
                <p>
                    <strong>WARNING:</strong> EVASION is designed for entertainment and situational awareness.
                    You must obey all local traffic laws and regulations.
                </p>
                <ul>
                    <li>Do not interact with the app while driving.</li>
                    <li>Always keep your eyes on the road.</li>
                    <li>We are not responsible for tickets, accidents, or legal issues resulting from use of this app.</li>
                </ul>

                <h3>3. User Content</h3>
                <p>
                    By uploading routes, photos, or other content, you grant us a non-exclusive license to use, display, and distribute that content within the EVASION platform.
                    We reserve the right to remove content that violates our community guidelines (e.g., promoting illegal street racing).
                </p>

                <h3>4. Account Termination</h3>
                <p>
                    We may terminate or suspend your account immediately, without prior notice, if you breach these Terms.
                </p>

                <h3>5. Disclaimer</h3>
                <p>
                    The service is provided on an "AS-IS" and "AS AVAILABLE" basis. We make no warranties regarding the accuracy of map data, police locations, or route conditions.
                </p>
            </main>
        </div>
    );
}
