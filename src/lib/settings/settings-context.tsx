'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserSettings {
    units: 'imperial' | 'metric';
    theme: 'dark' | 'light' | 'system';
    mapStyle: 'midnight' | 'satellite' | 'streets';
    pushNotifications: boolean;
    emailUpdates: boolean;
    shareData: boolean;
    locationServices: boolean;
}

interface SettingsContextType {
    settings: UserSettings;
    updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
    resetSettings: () => void;
}

const defaultSettings: UserSettings = {
    units: 'imperial',
    theme: 'dark',
    mapStyle: 'midnight',
    pushNotifications: true,
    emailUpdates: true,
    shareData: true,
    locationServices: true,
};

const STORAGE_KEY = 'evasion_user_settings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setSettings({ ...defaultSettings, ...parsed });
            }
        } catch (e) {
            console.warn('Failed to load settings:', e);
        }
        setIsHydrated(true);
    }, []);

    // Persist settings to localStorage whenever they change
    useEffect(() => {
        if (isHydrated) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
            } catch (e) {
                console.warn('Failed to save settings:', e);
            }
        }
    }, [settings, isHydrated]);

    const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const resetSettings = () => {
        setSettings(defaultSettings);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
