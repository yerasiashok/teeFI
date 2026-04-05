import { create } from 'zustand'
import type { Cart } from '../types'
import { cartApi } from '../services/api'
import toast from 'react-hot-toast'

interface CartState {
  cart:      Cart | null
  loading:   boolean
  fetchCart: () => Promise<void>
  addItem:   (variantId: string, quantity?: number) => Promise<void>
  updateItem:(cartItemId: string, quantity: number) => Promise<void>
  removeItem:(cartItemId: string) => Promise<void>
  clearCart: () => Promise<void>
}

export const useCartStore = create<CartState>((set) => ({
  cart:    null,
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true })
      const cart = await cartApi.get()
      set({ cart })
    } catch {
      // user may not be logged in — silent fail
    } finally {
      set({ loading: false })
    }
  },

  addItem: async (variantId, quantity = 1) => {
    try {
      const cart = await cartApi.addItem(variantId, quantity)
      set({ cart })
      toast.success('Added to cart!')
    } catch {
      toast.error('Failed to add item')
    }
  },

  updateItem: async (cartItemId, quantity) => {
    try {
      const cart = await cartApi.updateItem(cartItemId, quantity)
      set({ cart })
    } catch {
      toast.error('Failed to update cart')
    }
  },

  removeItem: async (cartItemId) => {
    try {
      const cart = await cartApi.removeItem(cartItemId)
      set({ cart })
      toast.success('Item removed')
    } catch {
      toast.error('Failed to remove item')
    }
  },

  clearCart: async () => {
    try {
      await cartApi.clear()
      set({ cart: null })
    } catch {
      // silent
    }
  }
}))
