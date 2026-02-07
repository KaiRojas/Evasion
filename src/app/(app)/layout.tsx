import { Header, BottomNav } from '@/components/navigation';
import { SettingsProvider } from '@/lib/settings';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PWAInstallPrompt } from '@/components/pwa';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SettingsProvider>
            <AuthGuard>
                <PWAInstallPrompt />
                <div className="flex flex-col min-h-screen max-w-md mx-auto bg-[#06040A]">
                    <Header />

                    <main className="flex-1 overflow-y-auto pt-16 pb-28">
                        {children}
                    </main>

                    <BottomNav />
                </div>
            </AuthGuard>
        </SettingsProvider>
    );
}


