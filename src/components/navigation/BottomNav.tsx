'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Custom minimal SVG icons
const icons = {
    home: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    explore: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={active ? 'currentColor' : 'none'} />
        </svg>
    ),
    drives: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
            {/* Map/Routes icon matching DriveNav */}
            <path d="M9 3L3 6v15l6-3 6 3 6-3V3L15 6 9 3z" />
            <path d="M9 3v15" />
            <path d="M15 6v15" />
        </svg>
    ),
    profile: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
};

interface NavItem {
    href: string;
    icon: keyof typeof icons;
    label: string;
}

const navItems: NavItem[] = [
    { href: '/home', icon: 'home', label: 'Home' },
    { href: '/explore', icon: 'explore', label: 'Explore' },
    { href: '/routes', icon: 'drives', label: 'Routes' },
    { href: '/profile', icon: 'profile', label: 'Profile' },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#030205]/95 backdrop-blur-xl border-t border-[rgba(139,92,246,0.08)] px-6 pt-2 pb-6 h-[92px]">
            <div className="max-w-md mx-auto flex items-center justify-between relative">
                {/* Left nav items */}
                {navItems.slice(0, 2).map((item) => (
                    <NavLink key={item.href} item={item} isActive={pathname === item.href || pathname.startsWith(item.href + '/')} />
                ))}

                {/* Center Drive Mode Button */}
                <Link href="/drive" className="relative -top-2 flex flex-col items-center">
                    <img
                        src="/images/drive-button-icon.png"
                        alt="Drive Mode"
                        className="size-16 object-contain active:scale-95 transition-transform"
                    />
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-[#A8A8A8] -mt-2">
                        Drive
                    </span>
                </Link>

                {/* Right nav items */}
                {navItems.slice(2, 4).map((item) => (
                    <NavLink key={item.href} item={item} isActive={pathname === item.href || pathname.startsWith(item.href + '/')} />
                ))}
            </div>
        </nav>
    );
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
    const IconComponent = icons[item.icon];

    return (
        <Link
            href={item.href}
            className={`flex flex-col items-center gap-1.5 transition-colors ${isActive ? 'text-[#8B5CF6]' : 'text-[#A8A8A8] hover:text-[#F5F5F4]'
                }`}
        >
            {IconComponent(isActive)}
            <span className="text-[9px] font-semibold uppercase tracking-widest">
                {item.label}
            </span>
        </Link>
    );
}
