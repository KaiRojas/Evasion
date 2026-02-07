'use client';

import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#06040A] text-[#F5F5F4]">
            <header className="sticky top-0 z-50 bg-[#06040A]/90 backdrop-blur-xl border-b border-[rgba(139,92,246,0.1)]">
                <div className="flex items-center p-4 justify-between max-w-md mx-auto">
                    <Link href="/settings" className="p-2 -m-2 hover:bg-white/5 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[#F5F5F4]">close</span>
                    </Link>
                    <h1 className="text-lg font-bold">Privacy Policy</h1>
                    <div className="size-10" />
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 py-8 prose prose-invert prose-sm">
                <p className="text-slate-400 text-xs mb-8">Last Updated: February 6, 2026</p>

                <h3>1. Information We Collect</h3>
                <p>
                    We collect information to provide better services to all our users. This includes:
                </p>
                <ul>
                    <li><strong>Location Data:</strong> We collect your location data to provide navigation and crowd-sourced alerts. You can disable this at any time.</li>
                    <li><strong>Profile Information:</strong> Name, username, and vehicle details you provide.</li>
                    <li><strong>Usage Data:</strong> Information about how you use the app, such as features used and time spent.</li>
                </ul>

                <h3>2. How We Use Information</h3>
                <p>
                    We use the information we collect to:
                </p>
                <ul>
                    <li>Provide, maintain, and improve our services.</li>
                    <li>Develop new features (e.g., popularity heatmaps).</li>
                    <li>Protect our users and the public from harm.</li>
                </ul>

                <h3>3. Data Sharing</h3>
                <p>
                    We do not sell your personal data. We may share anonymized, aggregated location data for traffic analysis purposes.
                </p>

                <h3>4. Data Retention</h3>
                <p>
                    We retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy.
                </p>

                <h3>5. Your Rights</h3>
                <p>
                    You have the right to access, correct, or delete your personal data. You can manage these settings in the "Privacy & Security" section of the app.
                </p>
            </main>
        </div>
    );
}
