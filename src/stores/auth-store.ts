/**
 * Authentication Store
 * Global state management for auth using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types';

interface AuthState {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,
      
      // Actions
      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      logout: () => set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }),
    }),
    {
      name: 'evasion-auth',
      partialize: (state) => ({
        // Only persist user data, not loading state
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
