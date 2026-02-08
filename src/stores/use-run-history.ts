import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RunMetadata {
    id: string;
    timestamp: number;
    durationMs: number;
    distanceKm: number;
    pointCount: number;
    previewTrace: [number, number][]; // Simplified trace for UI
}

interface RunHistoryState {
    runs: RunMetadata[];
    addRun: (metadata: RunMetadata, rawData: any) => Promise<void>;
    getRunData: (id: string) => Promise<any | null>;
    deleteRun: (id: string) => Promise<void>;
    clearHistory: () => Promise<void>;
}

// Simple IndexedDB wrapper for large blobs
const DB_NAME = 'evasion-logs';
const STORE_NAME = 'runs';

const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
};

const saveToDB = async (id: string, data: any) => {
    const db = await initDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(data, id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const getFromDB = async (id: string) => {
    const db = await initDB();
    return new Promise<any>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const deleteFromDB = async (id: string) => {
    const db = await initDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const clearDB = async () => {
    const db = await initDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const useRunHistory = create<RunHistoryState>()(
    persist(
        (set, get) => ({
            runs: [],
            addRun: async (metadata, rawData) => {
                // 1. Save raw data to IndexedDB
                await saveToDB(metadata.id, rawData);

                // 2. Update metadata state
                set((state) => ({
                    runs: [metadata, ...state.runs]
                }));
            },
            getRunData: async (id) => {
                return await getFromDB(id);
            },
            deleteRun: async (id) => {
                await deleteFromDB(id);
                set((state) => ({
                    runs: state.runs.filter(r => r.id !== id)
                }));
            },
            clearHistory: async () => {
                await clearDB();
                set({ runs: [] });
            }
        }),
        {
            name: 'evasion-run-history', // localStorage key for metadata
            partialize: (state) => ({ runs: state.runs }), // Only persist runs metadata
        }
    )
);
