import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Page = 'home' | 'menu' | 'cart' | 'orders' | 'login' | 'register' | 'profile' | 'receipt'

export interface CartItem {
  productId: string
  productName: string
  price: number
  quantity: number
  image: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  points?: number
  voucher?: number
}

export interface OrderData {
  id: string
  userId?: string
  total: number
  discount?: number
  voucherCode?: string
  status: string
  paymentMethod: string
  customerName: string
  customerPhone: string
  customerAddress: string
  notes?: string
  pointsAwarded?: boolean
  pointsEarned?: number
  createdAt: string
  items: {
    id: string
    productName: string
    quantity: number
    price: number
    subtotal: number
  }[]
}

export interface AppliedVoucher {
  id: string
  code: string
  type: string
  value: number
  discount: number
  finalTotal: number
}

interface AppState {
  currentPage: Page
  setPage: (page: Page) => void

  user: User | null
  setUser: (user: User | null) => void
  logout: () => void

  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number

  currentReceipt: OrderData | null
  setReceipt: (order: OrderData | null) => void

  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[]
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void
  removeToast: (id: string) => void

  unreadChats: number
  setUnreadChats: (n: number) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentPage: 'home',
      setPage: (page) => set({ currentPage: page }),

      user: null,
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null, currentPage: 'home' })
        localStorage.removeItem('app-storage')
      },

      cart: [],
      addToCart: (item) => {
        const cart = get().cart
        const existing = cart.find((c) => c.productId === item.productId)
        if (existing) {
          set({
            cart: cart.map((c) =>
              c.productId === item.productId
                ? { ...c, quantity: c.quantity + item.quantity }
                : c
            ),
          })
        } else {
          set({ cart: [...cart, item] })
        }
      },
      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((c) => c.productId !== productId) })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
        } else {
          set({
            cart: get().cart.map((c) =>
              c.productId === productId ? { ...c, quantity } : c
            ),
          })
        }
      },
      clearCart: () => set({ cart: [] }),
      getCartTotal: () =>
        get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getCartCount: () =>
        get().cart.reduce((sum, item) => sum + item.quantity, 0),

      currentReceipt: null,
      setReceipt: (order) => set({ currentReceipt: order }),

      toasts: [],
      addToast: (message, type = 'success') => {
        const id = Date.now().toString()
        set({ toasts: [...get().toasts, { id, message, type }] })
        setTimeout(() => {
          get().removeToast(id)
        }, 3000)
      },
      removeToast: (id) => {
        set({ toasts: get().toasts.filter((t) => t.id !== id) })
      },

      unreadChats: 0,
      setUnreadChats: (n) => set({ unreadChats: n }),
    }),
    {
      name: 'app-storage',
      skipHydration: true,
      partialize: (state) => ({
        user: state.user,
        cart: state.cart,
      }),
    }
  )
)