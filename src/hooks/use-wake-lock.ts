import { useRef, useState, useEffect, useCallback } from 'react';

export function useWakeLock(enabled: boolean = true) {
    const sentinelRef = useRef<WakeLockSentinel | null>(null);
    const [isLocked, setIsLocked] = useState(false);

    const requestLock = useCallback(async () => {
        if (!enabled) return;
        try {
            if ('wakeLock' in navigator) {
                const sentinel = await navigator.wakeLock.request('screen');
                sentinelRef.current = sentinel;
                setIsLocked(true);

                sentinel.addEventListener('release', () => {
                    setIsLocked(false);
                    console.log('Wake Lock released');
                });
                console.log('Wake Lock acquired');
            }
        } catch (err) {
            console.warn('Wake Lock request failed:', err);
        }
    }, [enabled]);

    const releaseLock = useCallback(async () => {
        if (sentinelRef.current) {
            await sentinelRef.current.release();
            sentinelRef.current = null;
        }
    }, []);

    // Handle visibility change (re-acquire lock if tab becomes visible again)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && enabled) {
                requestLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [enabled, requestLock]);

    // Initial request / cleanup
    useEffect(() => {
        if (enabled) {
            requestLock();
        } else {
            releaseLock(); // eslint-disable-line
        }

        return () => {
            releaseLock();
        };
    }, [enabled, requestLock, releaseLock]); // eslint-disable-line react-hooks/exhaustive-deps

    return { isLocked };
}
