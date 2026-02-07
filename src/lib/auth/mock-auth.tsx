'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Mock user data for development
export interface MockUser {
    id: string;
    name: string;
    username: string;
    email: string;
    avatarUrl: string;
    bio: string;
    stats: {
        drives: number;
        distance: string;
        friends: number;
    };
    isVerified: boolean;
}

interface AuthContextType {
    user: MockUser | null;
    isGuest: boolean;
    isLoading: boolean;
    signIn: () => void;
    signOut: () => void;
    toggleGuestMode: () => void;
}

const defaultUser: MockUser = {
    id: 'mock-user-001',
    name: 'Alex Rivera',
    username: 'arivera',
    email: 'alex@evasion.app',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPGNKSmMXHYFxpkmTA_-0x_loIs2KMceOjby0Cdh0wcVd9yG476aRGEIdsUdVwipYHUaEKjM6JoQ_NOKTPVG5jl-aGkYpFUjJLyLKH5HQ9ikI0RNCC4dBjPcMCLiV5a1PfUek3KiP3ye6patl0c8rQZhvCO8WPAg-QDLoK9fJeMijBJ8Rtkw7phHFrIDhsFXjrGnlmBZiBM16lGUAfqcFL29wzeu-xN5ZS9sTsSBHLe0MizOYQ0a3PqAKOZkXTesqdIrwsC95VN7I',
    bio: 'Chasing horizons in a 911. Midnight drives and canyon runs.',
    stats: {
        drives: 42,
        distance: '1.2k mi',
        friends: 156,
    },
    isVerified: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function MockAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<MockUser | null>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check localStorage for mock auth state
        const storedAuth = localStorage.getItem('evasion_mock_auth');
        const storedGuest = localStorage.getItem('evasion_guest_mode');

        if (storedGuest === 'true') {
            setIsGuest(true);
            setUser(null);
        } else if (storedAuth === 'signed_in') {
            setUser(defaultUser);
            setIsGuest(false);
        } else {
            // Default to signed in for development
            setUser(defaultUser);
            localStorage.setItem('evasion_mock_auth', 'signed_in');
        }

        setIsLoading(false);
    }, []);

    const signIn = () => {
        setUser(defaultUser);
        setIsGuest(false);
        localStorage.setItem('evasion_mock_auth', 'signed_in');
        localStorage.removeItem('evasion_guest_mode');
    };

    const signOut = () => {
        setUser(null);
        setIsGuest(true);
        localStorage.removeItem('evasion_mock_auth');
        localStorage.setItem('evasion_guest_mode', 'true');
    };

    const toggleGuestMode = () => {
        if (isGuest) {
            signIn();
        } else {
            signOut();
        }
    };

    return (
        <AuthContext.Provider value={{ user, isGuest, isLoading, signIn, signOut, toggleGuestMode }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a MockAuthProvider');
    }
    return context;
}
