import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse } from '../types'

interface AuthState {
  user:         Omit<AuthResponse, 'accessToken' | 'refreshToken' | 'tokenType'> | null
  accessToken:  string | null
  isAuth:       boolean
  isAdmin:      boolean
  setAuth:      (auth: AuthResponse) => void
  logout:       () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:        null,
      accessToken: null,
      isAuth:      false,
      isAdmin:     false,

      setAuth: (auth: AuthResponse) => {
        localStorage.setItem('accessToken', auth.accessToken)
        localStorage.setItem('refreshToken', auth.refreshToken)
        set({
          accessToken: auth.accessToken,
          isAuth: true,
          isAdmin: auth.role === 'ROLE_ADMIN',
          user: {
            email:     auth.email,
            firstName: auth.firstName,
            lastName:  auth.lastName,
            role:      auth.role,
          }
        })
      },

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ user: null, accessToken: null, isAuth: false, isAdmin: false })
      }
    }),
    { name: 'teefi-auth', partialize: (s) => ({ user: s.user, isAuth: s.isAuth, isAdmin: s.isAdmin }) }
  )
)
