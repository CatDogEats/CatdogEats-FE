import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
    isAuthenticated: boolean;
    setAuth: (auth: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            setAuth: (auth) => set({ isAuthenticated: auth }),
        }),
        {
            name: 'auth-session',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
