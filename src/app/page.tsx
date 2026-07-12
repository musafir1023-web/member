'use client'

import { useState, useEffect, useCallback, useRef, useSyncExternalStore, Component, type ReactNode, type ErrorInfo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, type CartItem, type OrderData, type Page, type AppliedVoucher } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChefHat,
  Home,
  UtensilsCrossed,
  ShoppingCart,
  Package,
  LogIn,
  LayoutDashboard,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Phone,
  MapPin,
  CreditCard,
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  UserPlus,
  Lock,
  Mail,
  User,
  Star,
  Truck,
  AlertCircle,
  ChevronRight,
  KeyRound,
  ReceiptText,
  UserCircle,
  Settings,
  Edit3,
  LogOut,
  Shield,
  TrendingUp,
  Calendar,
  BadgeCheck,
  Bell,
  HelpCircle,
  Info,
  Share2,
  Flame,
  Sparkles,
  Crown,
  Percent,
  Gift,
  X,
  Camera,
  PackageSearch,
  Search,
  MessageCircle,
  Send,
  Smile,
  BellRing,
  Volume2,
  Printer,
  ShoppingBag,
  Tag,
  Copy,
  Check,
} from 'lucide-react'
import JsBarcode from 'jsbarcode'

/* ─────────────────────── FORMATTERS ─────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  delivering: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabel: Record<string, string> = {
  pending: 'Menunggu',
  confirmed: 'Dikonfirmasi',
  preparing: 'Diproses',
  delivering: 'Dikirim',
  delivered: 'Selesai',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

/* ─────────────────────── NOTIFICATION SOUND ─────────────────────── */
function playNotifSound() {
  try {
    const ctx = new AudioContext()
    const notes = [880, 1100, 880, 1320]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.14)
      osc.start(ctx.currentTime + i * 0.15)
      osc.stop(ctx.currentTime + i * 0.15 + 0.15)
    })
  } catch { /* silent */ }
}

/* ─────────────────────── TOAST COMPONENT ─────────────────────── */
function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts)
  const removeToast = useAppStore((s) => s.removeToast)

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${
              t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────── STORE INFO ─────────────────────── */
const STORE_INFO = {
  name: 'Ayam Geprek Sambal Ijo',
  tagline: 'Sambal Ijo Khas Aceh',
  address: 'Jl. Medan - Banda Aceh, Simpang Camat, Gampong Tijue, Kec. Pidie, Kab. Pidie, 24151',
  phone: '085260812758',
  whatsapp: '6285260812758',
  hours: '10:00 - 22:00',
  timezone: 'WIB',
  openHour: 10,
  closeHour: 22,
} as const

function getStoreStatus(): { open: boolean; label: string } {
  const now = new Date()
  const jakartaStr = now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
  const jakartaDate = new Date(jakartaStr)
  const hour = jakartaDate.getHours()
  // Open every day 10:00 - 22:00 WIB
  const isOpen = hour >= STORE_INFO.openHour && hour < STORE_INFO.closeHour
  return { open: isOpen, label: isOpen ? 'Buka Sekarang' : 'Tutup' }
}

/* ─────────────────────── TOP BAR (SUPER COMPLETE) ─────────────────────── */
function TopBar() {
  const { currentPage, setPage, getCartCount } = useAppStore()
  const cartCount = useAppStore(getCartCount)
  const showBack = currentPage !== 'home'
  const storeStatus = getStoreStatus()
  const [showInfo, setShowInfo] = useState(false)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

  return (
    <header className="sticky top-0 z-50">
      {/* ═══ Header Bar ═══ */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 relative overflow-hidden">
        <div className="absolute inset-0 aceh-pattern opacity-20" />

        <div className="relative max-w-5xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Back + Logo + Name + Info Chip */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {showBack && (
                <button
                  onClick={() => setPage('home')}
                  className="p-1.5 -ml-1 text-white/80 hover:text-white hover:bg-white/10 transition-all rounded-lg flex-shrink-0"
                  aria-label="Kembali ke Beranda"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setPage('home')}
                className="flex items-center gap-2 hover:opacity-90 transition-opacity min-w-0"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                  <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-extrabold text-xs sm:text-sm text-white uppercase tracking-wider leading-tight truncate">
                    {STORE_INFO.name}
                  </h1>
                  <p className="text-[9px] sm:text-[11px] text-orange-100/80 leading-tight truncate">
                    Jl. Medan - Banda Aceh, Kec. Pidie
                  </p>
                </div>
              </button>

              {/* Info Chip (clickable) */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo) }}
                className="ml-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-lg transition-all flex-shrink-0 active:scale-95"
                aria-label="Info Toko"
              >
                <Info className="w-3.5 h-3.5 text-white/90" />
                <span className="text-[9px] sm:text-[11px] text-white/90 font-medium hidden sm:inline">Info</span>
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Notification Bell */}
              <button
                onClick={() => setPage('orders')}
                className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 transition-all rounded-xl relative"
                aria-label="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
              </button>

              {/* Cart Shortcut */}
              <button
                onClick={() => setPage('cart')}
                className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 transition-all rounded-xl relative"
                aria-label="Keranjang"
              >
                <ShoppingCart className="w-5 h-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 shadow-sm">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ═══ Info Detail Panel (Dropdown) — Animated ═══ */}
        <AnimatePresence>
          {showInfo && (
            <>
              {/* Backdrop with blur-in */}
              <motion.div
                initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
                exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/25 z-[-1]"
                onClick={() => setShowInfo(false)}
              />
              <motion.div
                initial={{ opacity: 0, scaleY: 0.7, translateY: -8 }}
                animate={{ opacity: 1, scaleY: 1, translateY: 0 }}
                exit={{ opacity: 0, scaleY: 0.8, translateY: -8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
                style={{ transformOrigin: 'top center' }}
                className="overflow-hidden"
              >
                <div className="bg-white shadow-2xl shadow-orange-900/8 border-b border-orange-100 relative">
                  {/* Shimmer sweep on open */}
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.1 }}
                    className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none z-10"
                  />

                  <div className="max-w-5xl mx-auto px-4 py-5 relative z-20">
                    {/* Animated Aceh ornament top divider */}
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ duration: 0.5, delay: 0.05 }}
                      className="flex items-center gap-2 mb-5"
                    >
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300/60 to-orange-300/60" />
                      <motion.svg
                        initial={{ rotate: 0, scale: 0 }}
                        animate={{ rotate: 180, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                        className="w-4 h-4 text-orange-400/50"
                        viewBox="0 0 14 14" fill="none"
                      >
                        <path d="M7 1 L13 7 L7 13 L1 7 Z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.2" />
                      </motion.svg>
                      <motion.span
                        initial={{ opacity: 0, letterSpacing: '0.3em' }}
                        animate={{ opacity: 1, letterSpacing: '0.15em' }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className="text-[10px] text-orange-500 font-bold uppercase tracking-widest"
                      >
                        Informasi Toko
                      </motion.span>
                      <motion.svg
                        initial={{ rotate: 0, scale: 0 }}
                        animate={{ rotate: -180, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                        className="w-4 h-4 text-orange-400/50"
                        viewBox="0 0 14 14" fill="none"
                      >
                        <path d="M7 1 L13 7 L7 13 L1 7 Z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.2" />
                      </motion.svg>
                      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-orange-300/60 to-orange-300/60" />
                    </motion.div>

                    <div className="space-y-2.5">
                      {/* Status Card — featured */}
                      <motion.div
                        initial={{ opacity: 0, x: -30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25, delay: 0.12 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50/60 to-orange-50 border border-orange-200/60 cursor-default"
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative ${
                          storeStatus.open
                            ? 'bg-gradient-to-br from-green-100 to-emerald-100'
                            : 'bg-gradient-to-br from-red-100 to-rose-100'
                        }`}>
                          <Clock className={`w-5 h-5 ${storeStatus.open ? 'text-green-600' : 'text-red-500'}`} />
                          {/* Animated pulse ring */}
                          {storeStatus.open && (
                            <motion.span
                              className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full"
                              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-800">{storeStatus.label}</p>
                            {storeStatus.open && (
                              <motion.span
                                initial={{ width: 0 }}
                                animate={{ width: 'auto' }}
                                transition={{ duration: 0.3, delay: 0.5 }}
                                className="text-[9px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full overflow-hidden whitespace-nowrap"
                              >
                                LIVE
                              </motion.span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{STORE_INFO.hours} {STORE_INFO.timezone} · Setiap Hari</p>
                        </div>
                        <motion.div
                          animate={{ rotate: storeStatus.open ? 0 : 0 }}
                          className={`w-2 h-2 rounded-full ${storeStatus.open ? 'bg-green-500' : 'bg-red-400'}`}
                        >
                          {storeStatus.open && (
                            <motion.div
                              className="w-2 h-2 rounded-full bg-green-500 absolute"
                              animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                              style={{ position: 'relative', top: 0, left: 0 }}
                            />
                          )}
                        </motion.div>
                      </motion.div>

                      {/* Address */}
                      <motion.div
                        initial={{ opacity: 0, x: 30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25, delay: 0.18 }}
                        whileHover={{ scale: 1.02, x: -4 }}
                        className="flex items-start gap-3 p-3.5 rounded-2xl hover:bg-orange-50/60 transition-colors cursor-default"
                      >
                        <motion.div
                          initial={{ rotate: -15, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.25 }}
                          className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0"
                        >
                          <MapPin className="w-5 h-5 text-orange-600" />
                        </motion.div>
                        <div className="min-w-0 pt-0.5">
                          <p className="text-sm font-bold text-gray-800">Alamat</p>
                          <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{STORE_INFO.address}</p>
                        </div>
                      </motion.div>

                      {/* Phone */}
                      <motion.a
                        initial={{ opacity: 0, x: -30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25, delay: 0.24 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        href={`tel:${STORE_INFO.phone}`}
                        className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-blue-50/60 transition-colors"
                      >
                        <motion.div
                          initial={{ rotate: 15, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
                          className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center flex-shrink-0"
                        >
                          <Phone className="w-5 h-5 text-blue-600" />
                        </motion.div>
                        <div className="pt-0.5">
                          <p className="text-sm font-bold text-gray-800">Telepon</p>
                          <p className="text-xs text-gray-500 mt-0.5">{STORE_INFO.phone}</p>
                        </div>
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="ml-auto"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </motion.div>
                      </motion.a>

                      {/* WhatsApp */}
                      <motion.a
                        initial={{ opacity: 0, x: 30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25, delay: 0.30 }}
                        whileHover={{ scale: 1.02, x: -4 }}
                        whileTap={{ scale: 0.98 }}
                        href={`https://wa.me/${STORE_INFO.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-green-50/60 transition-colors"
                      >
                        <motion.div
                          initial={{ rotate: -15, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.36 }}
                          className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center flex-shrink-0"
                        >
                          <MessageCircle className="w-5 h-5 text-green-600" />
                        </motion.div>
                        <div className="pt-0.5">
                          <p className="text-sm font-bold text-gray-800">WhatsApp</p>
                          <p className="text-xs text-gray-500 mt-0.5">{STORE_INFO.phone}</p>
                        </div>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.55 }}
                          className="ml-auto"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </motion.div>
                      </motion.a>

                      {/* Share */}
                      <motion.button
                        initial={{ opacity: 0, x: -30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25, delay: 0.36 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: STORE_INFO.name,
                              text: `${STORE_INFO.name}\n${STORE_INFO.address}\n${STORE_INFO.phone}`,
                            }).catch(() => {})
                          } else {
                            navigator.clipboard.writeText(`${STORE_INFO.name}\n${STORE_INFO.address}\n${STORE_INFO.phone}`)
                          }
                        }}
                        className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-amber-50/60 transition-colors w-full"
                      >
                        <motion.div
                          initial={{ rotate: 15, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.42 }}
                          className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center flex-shrink-0"
                        >
                          <Share2 className="w-5 h-5 text-amber-600" />
                        </motion.div>
                        <div className="text-left pt-0.5">
                          <p className="text-sm font-bold text-gray-800">Bagikan</p>
                          <p className="text-xs text-gray-500 mt-0.5">Salin info toko ke clipboard</p>
                        </div>
                      </motion.button>
                    </div>

                    {/* Animated close button */}
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowInfo(false)}
                      className="mt-4 w-full py-2.5 text-center text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50/70 hover:bg-orange-100/80 rounded-2xl transition-colors"
                    >
                      Tutup
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

/* ─────────────────────── BOTTOM NAVIGATION ─────────────────────── */
function BottomNav() {
  const { currentPage, setPage, user, logout, getCartCount } = useAppStore()
  const cartCount = useAppStore(getCartCount)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

  const navItems: { page: Page; label: string; icon: React.ReactNode; show: boolean }[] = [
    { page: 'home', label: 'Beranda', icon: <Home className="w-5 h-5" />, show: true },
    { page: 'menu', label: 'Menu', icon: <UtensilsCrossed className="w-5 h-5" />, show: true },
    { page: 'cart', label: 'Keranjang', icon: <ShoppingCart className="w-5 h-5" />, show: true },
    { page: 'orders', label: 'Pesanan', icon: <Package className="w-5 h-5" />, show: true },
    { page: user ? 'profile' : 'login', label: user ? 'Profile' : 'Login', icon: user ? <UserCircle className="w-5 h-5" /> : <LogIn className="w-5 h-5" />, show: true },
  ]

  const handleNav = (page: Page) => {
    if (user && page === 'login') {
      logout()
      return
    }
    setPage(page)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-orange-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      {/* Safe area for iOS */}
      <div className="pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-lg mx-auto flex items-center justify-around px-1 py-1.5">
          {navItems.map((item) => {
            const isActive = currentPage === item.page
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.page)}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[56px] transition-all duration-200 ${
                  isActive
                    ? 'text-orange-500'
                    : 'text-gray-400 hover:text-gray-600 active:scale-95'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-orange-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <div className="relative">
                  {item.icon}
                  {item.page === 'cart' && mounted && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

/* ─────────────────────── HOME PAGE ─────────────────────── */
interface HomeProduct {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number | null
  image: string
  category: string
  tag?: string | null
  available: boolean
}

function HomePage() {
  const { setPage, addToCart, addToast, user, setUser } = useAppStore()
  const [promoProducts, setPromoProducts] = useState<HomeProduct[]>([])
  const [terlarisProducts, setTerlarisProducts] = useState<HomeProduct[]>([])
  const [populerProducts, setPopulerProducts] = useState<HomeProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [showBarcode, setShowBarcode] = useState(false)
  const [userVouchers, setUserVouchers] = useState<any[]>([])
  const [loadingVouchers, setLoadingVouchers] = useState(false)
  const barcodeRef = useRef<SVGSVGElement>(null)

  const memberCode = user ? `AGSI-${user.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)}` : ''
  const activeVoucherList = (userVouchers || []).filter((v: any) => !v.used && (!v.expiresAt || new Date(v.expiresAt) >= new Date()))

  // Generate barcode when back side is visible
  useEffect(() => {
    if (showBarcode && barcodeRef.current && memberCode) {
      try {
        JsBarcode(barcodeRef.current, memberCode, {
          format: 'CODE128',
          width: 1.8,
          height: 52,
          displayValue: false,
          margin: 0,
          background: 'transparent',
          lineColor: '#1a1a1a',
        })
      } catch {}
    }
  }, [showBarcode, memberCode])

  // Fetch latest user points/voucher on mount
  useEffect(() => {
    if (user && user.id) {
      fetch(`/api/auth/profile?userId=${user.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.id) {
            setUser({ ...user, points: data.points, voucher: data.voucher })
          }
        })
        .catch(() => {})
      // Fetch user's vouchers
      ;(async () => {
        setLoadingVouchers(true)
        try {
          const res = await fetch(`/api/vouchers?userId=${user.id}`)
          const data = await res.json()
          setUserVouchers(Array.isArray(data) ? data : [])
        } catch { /* silent */ }
        finally { setLoadingVouchers(false) }
      })()
    }
  }, [user?.id])

  useEffect(() => {
    Promise.all([
      fetch('/api/products?tag=promo').then((r) => r.json()),
      fetch('/api/products?tag=terlaris').then((r) => r.json()),
      fetch('/api/products?tag=populer').then((r) => r.json()),
    ])
      .then(([promo, terlaris, populer]) => {
        setPromoProducts(Array.isArray(promo) ? promo : [])
        setTerlarisProducts(Array.isArray(terlaris) ? terlaris : [])
        setPopulerProducts(Array.isArray(populer) ? populer : [])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        addToast('Gagal memuat produk', 'error')
      })
  }, [addToast])

  const handleAdd = (p: HomeProduct) => {
    if (!user) {
      addToast('Silakan login terlebih dahulu untuk menambahkan produk', 'error')
      setPage('login')
      return
    }
    addToCart({ productId: p.id, productName: p.name, price: p.price, quantity: 1, image: p.image })
    addToast(`${p.name} ditambahkan ke keranjang`)
  }

  const getDiscount = (p: HomeProduct) => {
    if (!p.originalPrice || p.originalPrice <= p.price) return 0
    return Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
  }

  const renderProductScroll = (
    items: HomeProduct[],
    sectionLabel: string,
    sectionDesc: string,
    iconBg: string,
    iconColor: string,
    badgeTag: string | null,
    emptyText: string
  ) => (
    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      {loading ? (
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="w-44 sm:w-48 flex-shrink-0 rounded-2xl" style={{ height: '220px' }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-white/60 text-sm py-4">{emptyText}</p>
      ) : (
        items.map((p, i) => {
          const disc = getDiscount(p)
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex-shrink-0 w-44 sm:w-48 bg-white rounded-2xl shadow-lg overflow-hidden relative group cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => handleAdd(p)}
            >
              {/* Image */}
              <div className="relative h-32 sm:h-36 bg-orange-50 flex items-center justify-center p-3">
                {disc > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-md z-10">
                    -{disc}%
                  </div>
                )}
                {badgeTag && p.tag === badgeTag && !disc && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-md z-10 flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5" /> {badgeTag === 'terlaris' ? 'Laris' : 'Populer'}
                  </div>
                )}
                <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
              </div>
              {/* Info */}
              <div className="p-3">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{p.category}</p>
                <h3 className="font-bold text-gray-800 text-xs leading-tight mt-0.5 line-clamp-2 min-h-[2rem]">{p.name}</h3>
                <div className="flex items-baseline gap-1 mt-1.5 mb-2">
                  <span className="text-sm font-extrabold text-orange-600">{fmt(p.price)}</span>
                  {disc > 0 && (
                    <span className="text-[10px] text-gray-400 line-through">{fmt(p.originalPrice!)}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-orange-500 text-white rounded-lg px-2.5 py-1.5 w-fit text-[10px] font-bold group-hover:bg-orange-600 transition-colors shadow-sm">
                  <Plus className="w-3 h-3" />
                  Tambah
                </div>
              </div>
            </motion.div>
          )
        })
      )}
    </div>
  )

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400">
        <div className="absolute inset-0 aceh-pattern" />
        <div className="relative max-w-3xl mx-auto px-4 py-12 sm:py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <ChefHat className="w-10 h-10 sm:w-14 sm:h-14 text-white drop-shadow-lg" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-md">
              AYAM GEPREK<br />SAMBAL IJO
            </h2>
            <p className="text-orange-50 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Nikmati kelezatan ayam geprek dengan sambal ijo khas Aceh yang autentik. Dibuat dari bahan pilihan dengan resep turun-temurun yang menjaga cita rasa asli.
            </p>



            {/* ═════════════════════════════════════════════════
                 MEMBER CARD
                 ═══════════════════════════════════════════════════ */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-8 mx-auto w-full"
                style={{ maxWidth: 360, perspective: 1200 }}
              >
                <div className="relative w-full" style={{ animation: 'v7-float 5s ease-in-out infinite' }}>
                  <div className="relative w-full cursor-pointer" style={{ transformStyle: 'preserve-3d' }} onClick={() => setShowBarcode(!showBarcode)}>

                    <div className="relative w-full" style={{ transformStyle: 'preserve-3d', transform: showBarcode ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}>

                      {/* ═══ FRONT FACE ═══ */}
                      <div className="relative rounded-2xl overflow-hidden shadow-xl" style={{ backfaceVisibility: 'hidden', background: 'linear-gradient(135deg, #EA580C 0%, #F97316 50%, #FB923C 100%)' }}>
                        {/* Decorative circles */}
                        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-white/[0.07]" />
                        <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-white/[0.05]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white/[0.03]" />

                        <div className="relative z-10 flex flex-col px-5 pt-5 pb-4">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Crown className="w-4.5 h-4.5 text-white" />
                              </div>
                              <div>
                                <p className="text-[7px] text-white/60 font-semibold uppercase tracking-[0.25em] leading-none">Member Card</p>
                                <p className="text-white font-bold text-[13px] sm:text-sm truncate max-w-[120px] leading-tight mt-1">{user.name}</p>
                              </div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1">
                              <span className="text-[8px] text-white font-bold uppercase tracking-wider">Premium</span>
                            </div>
                          </div>

                          {/* Member Number */}
                          <p className="text-center text-white/50 font-mono text-[10px] tracking-[0.35em] uppercase mb-3">{memberCode}</p>

                          {/* Divider */}
                          <div className="h-px bg-white/20 mb-3" />

                          {/* Stats Row */}
                          <div className="flex gap-3 mb-3">
                            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                              <Star className="w-3.5 h-3.5 text-white/80 mx-auto mb-1" />
                              <p className="text-[7px] text-white/60 font-semibold uppercase tracking-wider mb-0.5">Poin</p>
                              <p className="text-white font-extrabold text-xl leading-none">{user.points ?? 0}</p>
                            </div>
                            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                              <Gift className="w-3.5 h-3.5 text-white/80 mx-auto mb-1" />
                              <p className="text-[7px] text-white/60 font-semibold uppercase tracking-wider mb-0.5">Voucher</p>
                              <p className="text-white font-extrabold text-xl leading-none">{activeVoucherList.length}</p>
                            </div>
                          </div>

                          {/* Active Voucher Pills */}
                          {activeVoucherList.length > 0 && (
                            <div>
                              <p className="text-[7px] text-white/50 font-semibold uppercase tracking-[0.2em] mb-1.5">Voucher Aktif</p>
                              <div className="flex flex-wrap gap-1.5">
                                {activeVoucherList.slice(0, 3).map((v: any) => (
                                  <div key={v.id} className="bg-white/20 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                                    <Tag className="w-2.5 h-2.5 text-white/70" />
                                    <span className="text-[9px] text-white font-bold tracking-wide">{v.code}</span>
                                    <span className="text-[8px] text-white/70">
                                      {v.type === 'percentage' ? `${v.value}%` : fmt(v.value).replace('Rp', '').trim()}
                                    </span>
                                  </div>
                                ))}
                                {activeVoucherList.length > 3 && (
                                  <div className="bg-white/10 rounded-lg px-2 py-1">
                                    <span className="text-[8px] text-white/60 font-semibold">+{activeVoucherList.length - 3} lagi</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <p className="text-center text-[7px] text-white/30 font-medium mt-3 tracking-wide">Ketuk untuk melihat barcode</p>
                        </div>
                      </div>

                      {/* ═══ BACK FACE (Barcode) ═══ */}
                      <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg, #EA580C 0%, #F97316 50%, #FB923C 100%)' }}>
                        {/* Decorative circles */}
                        <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-white/[0.07]" />
                        <div className="absolute -bottom-8 -right-8 w-20 h-20 rounded-full bg-white/[0.05]" />

                        <div className="relative z-10 flex flex-col px-5 pt-4 pb-4" style={{ minHeight: 210 }}>
                          {/* Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Crown className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-[7px] text-white/60 font-semibold uppercase tracking-[0.25em] leading-none">Member Card</p>
                                <p className="text-white font-bold text-[11px] leading-tight mt-0.5">{user.name}</p>
                              </div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1">
                              <span className="text-[8px] text-white font-bold uppercase tracking-wider">Premium</span>
                            </div>
                          </div>

                          {/* Barcode Container */}
                          <div className="flex-1 bg-white rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                            {/* Corner accents */}
                            <svg className="absolute top-0 left-0 w-5 h-5" viewBox="0 0 20 20" fill="none"><path d="M0 6 L0 0 L6 0" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" /></svg>
                            <svg className="absolute top-0 right-0 w-5 h-5" viewBox="0 0 20 20" fill="none"><path d="M14 0 L20 0 L20 6" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" /></svg>
                            <svg className="absolute bottom-0 left-0 w-5 h-5" viewBox="0 0 20 20" fill="none"><path d="M0 14 L0 20 L6 20" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" /></svg>
                            <svg className="absolute bottom-0 right-0 w-5 h-5" viewBox="0 0 20 20" fill="none"><path d="M20 14 L20 20 L14 20" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" /></svg>

                            {/* Scan line label */}
                            <p className="text-[8px] text-gray-400 font-semibold uppercase tracking-[0.3em] mb-2">Scan Barcode</p>

                            {/* Barcode */}
                            <svg ref={barcodeRef} className="w-full max-w-[260px]" style={{ minHeight: 48 }} />

                            {/* Member code below barcode */}
                            <p className="text-[9px] text-gray-500 font-mono tracking-[0.25em] mt-2 font-semibold">{memberCode}</p>
                          </div>

                          <p className="text-center text-[7px] text-white/30 font-medium mt-2.5 tracking-wide">Ketuk untuk kembali</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}



            {/* USER VOUCHER LIST */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="mt-4 mx-auto w-full"
                style={{ maxWidth: 360 }}
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-2.5">
                  <Gift className="w-4 h-4 text-white/80" />
                  <span className="text-white/80 text-sm font-medium">Voucher Saya</span>
                  {!loadingVouchers && (
                    <span className="bg-white/20 rounded-full px-2 py-0.5 text-[10px] text-white font-bold">
                      {(userVouchers || []).filter((v: any) => !v.used && !(v.expiresAt && new Date(v.expiresAt) < new Date())).length} aktif
                    </span>
                  )}
                </div>

                {/* Voucher cards */}
                <div className="space-y-2.5 max-h-80 overflow-y-auto no-scrollbar">
                  {loadingVouchers ? (
                    <div className="space-y-2">
                      {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="w-full h-20 rounded-xl bg-white/10" />
                      ))}
                    </div>
                  ) : userVouchers.length === 0 ? (
                    <div className="text-center py-4">
                      <Gift className="w-8 h-8 text-white/30 mx-auto mb-2" />
                      <p className="text-white/50 text-xs">Belum ada voucher</p>
                      <p className="text-white/30 text-[10px] mt-0.5">Voucher akan muncul di sini saat admin memberikan</p>
                    </div>
                  ) : (
                    userVouchers.map((v: any) => {
                      const isExpired = v.expiresAt && new Date(v.expiresAt) < new Date()
                      const isUsed = v.used
                      const isInvalid = isUsed || isExpired
                      return (
                        <div key={v.id} className={`relative rounded-xl overflow-hidden shadow-md ${isInvalid ? 'opacity-60' : ''}`}>
                          <div className="flex">
                            <div className={`${isInvalid ? 'bg-gray-400' : 'bg-orange-500'} text-white px-4 py-3 flex flex-col items-center justify-center min-w-[80px] relative`}>
                              <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-orange-500" style={{ boxShadow: 'inset 0 0 0 4px white' }} />
                              {v.type === 'percentage' ? (
                                <>
                                  <span className="text-2xl font-extrabold leading-none">{v.value}%</span>
                                  <span className="text-[8px] text-white/70 font-medium mt-0.5">OFF</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-lg font-extrabold leading-none">{fmt(v.value).replace('Rp', '')}</span>
                                  <span className="text-[8px] text-white/70 font-medium mt-0.5">DISKON</span>
                                </>
                              )}
                            </div>
                            <div className="flex-1 bg-white p-3 flex flex-col justify-between min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                  <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Kode Voucher</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <p className="font-mono font-extrabold text-sm text-gray-800 tracking-wide">{v.code}</p>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(v.code)
                                        addToast('Kode voucher disalin!', 'success')
                                      }}
                                      className="text-gray-300 hover:text-orange-500 transition-colors"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                {isUsed ? (
                                  <span className="bg-gray-100 text-gray-500 text-[9px] font-semibold px-2 py-0.5 rounded shrink-0">Dipakai</span>
                                ) : isExpired ? (
                                  <span className="bg-red-50 text-red-500 text-[9px] font-semibold px-2 py-0.5 rounded shrink-0">Expired</span>
                                ) : (
                                  <span className="bg-green-50 text-green-600 text-[9px] font-semibold px-2 py-0.5 rounded shrink-0">Aktif</span>
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-1.5">
                                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                  {v.minOrder && <span>Min. {fmt(v.minOrder)}</span>}
                                  {v.type === 'percentage' && v.maxDiscount && <span>Maks. {fmt(v.maxDiscount)}</span>}
                                </div>
                                {v.expiresAt && (
                                  <span className={`text-[10px] font-medium ${isExpired ? 'text-red-400' : 'text-gray-400'}`}>
                                    s/d {new Date(v.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </motion.div>
            )}



            {/* Login prompt for non-logged-in users */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-5"
              >
                <button onClick={() => setPage('login')} className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm hover:bg-white/25 border border-white/20 rounded-xl px-4 py-2.5 transition-all group">
                  <User className="w-4 h-4 text-white/80 group-hover:text-white" />
                  <span className="text-white/80 group-hover:text-white text-sm font-medium">Masuk untuk mendapatkan poin & voucher</span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/60 group-hover:text-white" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L48 54C96 48 192 36 288 30C384 24 480 24 576 28C672 32 768 40 864 42C960 44 1056 40 1152 36C1248 32 1344 28 1392 26L1440 24V60H0Z" fill="#F97316" />
          </svg>
        </div>
      </section>

      {/* ═══ SEDANG PROMO ═══ */}
      <section className="bg-orange-500 py-5 sm:py-7 relative">
        <div className="relative max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg">
                <Percent className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight">Sedang Promo 🔥</h2>
                <p className="text-orange-100 text-[10px] sm:text-xs">Penawaran terbatas, buruan sebelum habis!</p>
              </div>
            </div>
            <button onClick={() => setPage('menu')} className="text-orange-100 hover:text-white text-xs font-medium flex items-center gap-0.5 transition-colors">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {renderProductScroll(promoProducts, 'Sedang Promo', 'Penawaran terbatas', 'bg-red-500', 'text-red-500', null, 'Belum ada promo saat ini')}
        </div>
      </section>

      {/* ═══ TERLARIS ═══ */}
      <section className="bg-white py-5 sm:py-7 relative">
        <div className="relative max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg">
                <Flame className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Terlaris</h2>
                <p className="text-gray-400 text-[10px] sm:text-xs">Menu paling banyak dipesan pelanggan</p>
              </div>
            </div>
            <button onClick={() => setPage('menu')} className="text-gray-400 hover:text-gray-600 text-xs font-medium flex items-center gap-0.5 transition-colors">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {renderProductScroll(terlarisProducts, 'Terlaris', 'Menu paling laris', 'bg-orange-500', 'text-orange-500', 'terlaris', 'Belum ada produk terlaris')}
        </div>
      </section>

      {/* ═══ POPULER ═══ */}
      <section className="bg-gray-50 py-5 sm:py-7 relative">
        <div className="relative max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Populer</h2>
                <p className="text-gray-400 text-[10px] sm:text-xs">Menu favorit yang banyak disukai</p>
              </div>
            </div>
            <button onClick={() => setPage('menu')} className="text-gray-400 hover:text-gray-600 text-xs font-medium flex items-center gap-0.5 transition-colors">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {renderProductScroll(populerProducts, 'Populer', 'Menu favorit', 'bg-amber-500', 'text-amber-500', 'populer', 'Belum ada produk populer')}
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="bg-orange-500 py-8 sm:py-10 relative">
        <div className="absolute inset-0 aceh-pattern opacity-50" />
        <div className="relative max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { icon: <Star className="w-5 h-5 sm:w-7 sm:h-7" />, title: 'Rasa Autentik' },
              { icon: <Truck className="w-5 h-5 sm:w-7 sm:h-7" />, title: 'Pengiriman Cepat' },
              { icon: <CreditCard className="w-5 h-5 sm:w-7 sm:h-7" />, title: 'Bayar Mudah' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i }}
                className="bg-white/95 rounded-xl p-3 sm:p-4 text-center shadow-lg"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 text-orange-500 mb-1.5 sm:mb-2">
                  {f.icon}
                </div>
                <p className="text-[11px] sm:text-sm font-bold text-gray-800">{f.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="bg-orange-500 py-8 sm:py-10 relative">
        <div className="absolute inset-0 aceh-pattern opacity-30" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-lg sm:text-2xl font-bold text-white mb-3">Siap Memesan?</h2>
          <p className="text-orange-100 text-sm text-justify max-w-lg mx-auto mb-5 leading-relaxed">
            Jangan tunggu lagi! Pesan ayam geprek sambal ijo favorit Anda sekarang juga. Pilih menu, tambahkan ke keranjang, dan selesaikan pesanan dalam beberapa langkah mudah.
          </p>
          <Button
            onClick={() => setPage('menu')}
            size="lg"
            className="bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-lg px-10"
          >
            <UtensilsCrossed className="w-4 h-4 mr-2" />
            Pesan Sekarang
          </Button>
        </div>
      </section>
    </div>
  )
}

/* ─────────────────────── MENU PAGE ─────────────────────── */
interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number | null
  image: string
  category: string
  tag?: string | null
  available: boolean
}

function MenuPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const addToCart = useAppStore((s) => s.addToCart)
  const addToast = useAppStore((s) => s.addToast)

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        addToast('Gagal memuat menu', 'error')
      })
  }, [addToast])

  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category)))]

  const filtered = products
    .filter((p) => activeCategory === 'Semua' || p.category === activeCategory)
    .filter((p) => !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))

  const handleAdd = (p: Product) => {
    if (!p.available) return
    addToCart({ productId: p.id, productName: p.name, price: p.price, quantity: 1, image: p.image })
    addToast(`${p.name} ditambahkan ke keranjang`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/80">
      {/* Header + Search Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                Menu
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Temukan menu favorit kamu</p>
            </div>
            {!loading && (
              <span className="text-[11px] text-gray-500 bg-orange-50 border border-orange-100 rounded-full px-3 py-1 font-medium">
                {filtered.length} item
              </span>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Category Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-orange-200 hover:text-orange-600 hover:shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <Skeleton className="w-full aspect-[4/3]" />
                <div className="p-3 space-y-2.5">
                  <Skeleton className="h-3.5 w-3/4 rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-8 w-16 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {searchQuery.trim() ? (
                <Search className="w-7 h-7 text-gray-300" />
              ) : (
                <UtensilsCrossed className="w-7 h-7 text-gray-300" />
              )}
            </div>
            <p className="text-gray-500 text-sm font-semibold mb-1">
              {searchQuery.trim() ? 'Tidak ditemukan' : 'Tidak ada menu'}
            </p>
            <p className="text-gray-400 text-xs">
              {searchQuery.trim()
                ? `Tidak ada menu untuk "${searchQuery.trim()}"`
                : 'Tidak ada menu di kategori ini'}
            </p>
            {searchQuery.trim() && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs text-orange-500 font-semibold hover:text-orange-600 transition-colors"
              >
                Reset pencarian
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.4) }}
                className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group ${
                  !p.available ? 'opacity-60' : 'hover:-translate-y-0.5'
                }`}
              >
                {/* Image Area */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UtensilsCrossed className="w-8 h-8 text-gray-200" />
                    </div>
                  )}

                  {/* Badges */}
                  {p.originalPrice && p.originalPrice > p.price && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                      -{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%
                    </span>
                  )}
                  {p.tag === 'terlaris' && !(p.originalPrice && p.originalPrice > p.price) && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5" /> Laris
                    </span>
                  )}
                  {p.tag === 'populer' && !(p.originalPrice && p.originalPrice > p.price) && (
                    <span className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-0.5">
                      <TrendingUp className="w-2.5 h-2.5" /> Populer
                    </span>
                  )}
                  {p.tag === 'terbaru' && !(p.originalPrice && p.originalPrice > p.price) && p.tag !== 'terlaris' && p.tag !== 'populer' && (
                    <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> Baru
                    </span>
                  )}

                  {/* Sold Out Overlay */}
                  {!p.available && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-lg shadow">Habis</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-semibold text-gray-800 text-[13px] leading-snug line-clamp-2 min-h-[2.5em]">{p.name}</h3>
                  {p.description && (
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{p.description}</p>
                  )}
                  <div className="mt-auto pt-2.5">
                    <div className="flex items-baseline gap-1.5 mb-2.5">
                      <span className="font-extrabold text-orange-600 text-[14px] leading-none">{fmt(p.price)}</span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="text-[10px] text-gray-300 line-through">{fmt(p.originalPrice)}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAdd(p)}
                      disabled={!p.available}
                      className={`w-full rounded-xl py-2.5 text-[11px] font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                        p.available
                          ? 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 active:scale-[0.97] text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {p.available ? 'Tambah' : 'Habis'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────── CART PAGE ─────────────────────── */
function CartPage() {
  const { cart, updateQuantity, removeFromCart, getCartTotal, setPage, addToast } = useAppStore()
  const total = useAppStore(getCartTotal)
  const [checkingOut, setCheckingOut] = useState(false)

  const handleCheckout = () => {
    if (cart.length === 0) {
      addToast('Keranjang masih kosong', 'error')
      return
    }
    setCheckingOut(true)
  }

  if (checkingOut) {
    return <CheckoutForm onCancel={() => setCheckingOut(false)} />
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-orange-500 to-amber-400 py-8 relative">
        <div className="absolute inset-0 aceh-pattern opacity-30" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            <ShoppingCart className="w-8 h-8 inline-block mr-2 -mt-1" />
            Keranjang
          </h1>
          <p className="text-orange-50 text-sm">Kelola pesanan Anda sebelum melakukan pemesanan.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {cart.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/70 font-medium mb-2">Keranjang Anda masih kosong</p>
            <p className="text-white/50 text-sm text-justify max-w-sm mx-auto leading-relaxed">
              Silakan pilih menu dari halaman Menu dan tambahkan item yang Anda inginkan ke keranjang untuk melanjutkan pemesanan.
            </p>
            <Button className="mt-6 bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-md" onClick={() => setPage('menu')}>
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Lihat Menu
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
              {cart.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-xl p-4 shadow-md flex items-center gap-4"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm truncate">{item.productName}</h3>
                    <p className="text-orange-600 font-semibold text-sm mt-0.5">{fmt(item.price)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center bg-orange-50 rounded-lg">
                        <button
                          className="p-1.5 hover:bg-orange-100 rounded-l-lg transition-colors"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="w-3.5 h-3.5 text-orange-600" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-gray-700">{item.quantity}</span>
                        <button
                          className="p-1.5 hover:bg-orange-100 rounded-r-lg transition-colors"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="w-3.5 h-3.5 text-orange-600" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-gray-700">{fmt(item.price * item.quantity)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Total & Checkout */}
            <div className="bg-white rounded-xl p-5 shadow-lg mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 font-medium">Total Pembayaran</span>
                <span className="text-xl font-extrabold text-orange-600">{fmt(total)}</span>
              </div>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg py-6 text-base" onClick={handleCheckout}>
                <CreditCard className="w-4 h-4 mr-2" />
                Lanjut ke Pemesanan
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────── CHECKOUT FORM ─────────────────────── */
function CheckoutForm({ onCancel }: { onCancel: () => void }) {
  const { cart, getCartTotal, clearCart, setPage, addToast, user, setReceipt } = useAppStore()
  const total = useAppStore(getCartTotal)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerPhone: user?.phone || '',
    customerAddress: '',
    notes: '',
    paymentMethod: 'COD',
    deliveryMethod: 'pickup' as 'pickup' | 'delivery',
  })
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null)
  const [validatingVoucher, setValidatingVoucher] = useState(false)

  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  const finalTotal = appliedVoucher ? appliedVoucher.finalTotal : total

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) {
      addToast('Masukkan kode voucher', 'error')
      return
    }
    setValidatingVoucher(true)
    try {
      const res = await fetch(`/api/vouchers?action=validate&code=${encodeURIComponent(voucherCode.trim())}&total=${total}&customerId=${user?.id || ''}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Voucher tidak valid')
      setAppliedVoucher(data.voucher)
      addToast(`Voucher ${data.voucher.code} berhasil diterapkan! Diskon ${fmt(data.voucher.discount)}`, 'success')
    } catch (err: unknown) {
      setAppliedVoucher(null)
      addToast(err instanceof Error ? err.message : 'Voucher tidak valid', 'error')
    } finally {
      setValidatingVoucher(false)
    }
  }

  const handleRemoveVoucher = () => {
    setVoucherCode('')
    setAppliedVoucher(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customerName || !form.customerPhone) {
      addToast('Mohon lengkapi semua data yang diperlukan', 'error')
      return
    }
    if (form.deliveryMethod === 'delivery') {
      addToast('Fitur pengiriman ke alamat segera hadir!', 'info')
      return
    }
    setSubmitting(true)

    try {
      const items = cart.map((c) => ({
        productId: c.productId,
        productName: c.productName,
        quantity: c.quantity,
        price: c.price,
        subtotal: c.price * c.quantity,
      }))

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          items,
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerAddress: 'Ambil di Toko',
          notes: form.notes,
          paymentMethod: form.paymentMethod,
          voucherCode: appliedVoucher?.code || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal membuat pesanan')

      setReceipt(data)
      clearCart()
      addToast('Pesanan berhasil dibuat!', 'success')
      setPage('receipt')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat pesanan'
      addToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-orange-500 to-amber-400 py-6 relative">
        <div className="absolute inset-0 aceh-pattern opacity-30" />
        <div className="relative max-w-5xl mx-auto px-4">
          <button onClick={onCancel} className="text-white hover:text-orange-100 flex items-center gap-1 text-sm font-medium mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Keranjang
          </button>
          <h1 className="text-2xl font-extrabold text-white text-center">Formulir Pemesanan</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-lg space-y-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />
              Data Pemesan
            </h2>
            <div>
              <Label htmlFor="name" className="text-sm text-gray-600">Nama Lengkap *</Label>
              <Input id="name" value={form.customerName} onChange={(e) => updateField('customerName', e.target.value)} placeholder="Masukkan nama lengkap Anda" className="mt-1" required />
            </div>
            <div>
              <Label className="text-sm text-gray-600">Nomor Telepon *</Label>
              <Input id="phone" value={form.customerPhone} onChange={(e) => updateField('customerPhone', e.target.value)} placeholder="Contoh: 081234567890" className="mt-1" required />
            </div>

            {/* Delivery Method */}
            <div>
              <Label className="text-sm text-gray-600">Cara Ambil Pesanan *</Label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, deliveryMethod: 'pickup' }))}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                    form.deliveryMethod === 'pickup'
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 hover:border-orange-200 bg-white'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${form.deliveryMethod === 'pickup' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold leading-tight ${form.deliveryMethod === 'pickup' ? 'text-orange-700' : 'text-gray-700'}`}>Ambil di Toko</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Langsung datang ke toko</p>
                  </div>
                  {form.deliveryMethod === 'pickup' && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, deliveryMethod: 'delivery' }))}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                    form.deliveryMethod === 'delivery'
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${form.deliveryMethod === 'delivery' ? 'bg-gray-300 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold leading-tight ${form.deliveryMethod === 'delivery' ? 'text-gray-500' : 'text-gray-700'}`}>
                      Pengiriman
                      <span className="ml-1 text-[9px] font-semibold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full align-middle">Segera Hadir</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Antar ke alamat Anda</p>
                  </div>
                  {form.deliveryMethod === 'delivery' && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              </div>
              {form.deliveryMethod === 'delivery' && (
                <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700 leading-relaxed">Fitur pengiriman ke alamat sedang dalam pengembangan. Silakan pilih <strong>"Ambil di Toko"</strong> untuk saat ini.</p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm text-gray-600">Catatan (Opsional)</Label>
              <Textarea id="notes" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Contoh: Jangan terlalu pedas, tambah sambal, dll" className="mt-1" rows={2} />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl p-5 shadow-lg">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-orange-500" />
              Metode Pembayaran
            </h2>
            <p className="text-sm text-gray-500 text-justify leading-relaxed mb-3">
              Pilih metode pembayaran yang paling nyaman untuk Anda. Kami menyediakan opsi COD (bayar di tempat) dan transfer bank untuk kemudahan transaksi.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => updateField('paymentMethod', 'COD')}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                  form.paymentMethod === 'COD'
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-500 hover:border-orange-200'
                }`}
              >
                <Banknote className="w-5 h-5" />
                COD
              </button>
              <button
                type="button"
                onClick={() => updateField('paymentMethod', 'Transfer')}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                  form.paymentMethod === 'Transfer'
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-500 hover:border-orange-200'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Transfer
              </button>
            </div>
          </div>

          {/* Voucher */}
          <div className="bg-white rounded-xl p-5 shadow-lg">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-orange-500" />
              Kode Voucher
            </h2>
            {appliedVoucher ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-bold text-green-800">{appliedVoucher.code}</p>
                      <p className="text-xs text-green-600">
                        {appliedVoucher.type === 'percentage' ? `Diskon ${appliedVoucher.value}%` : `Diskon ${fmt(appliedVoucher.value)}`}
                        {appliedVoucher.type === 'percentage' && appliedVoucher.maxDiscount ? ` (maks ${fmt(appliedVoucher.maxDiscount)})` : ''}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={handleRemoveVoucher} className="text-red-500 hover:text-red-700 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-green-700 font-medium">Hemat {fmt(appliedVoucher.discount)}</span>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode voucher"
                  className="flex-1 uppercase tracking-wider font-mono text-sm"
                  maxLength={10}
                  disabled={validatingVoucher}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50 px-4 disabled:opacity-50"
                  onClick={handleValidateVoucher}
                  disabled={validatingVoucher || !voucherCode.trim()}
                >
                  {validatingVoucher ? (
                    <span className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
                  ) : (
                    'Pakai'
                  )}
                </Button>
              </div>
            )}
            <p className="text-[10px] text-gray-400 mt-2 text-justify leading-relaxed">
              * Voucher hanya berlaku 1x pakai per kode dan tidak dapat digabungkan dengan voucher lainnya.
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl p-5 shadow-lg">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
              <ReceiptText className="w-4 h-4 text-orange-500" />
              Ringkasan Pesanan
            </h2>
            <div className="space-y-2 max-h-40 overflow-y-auto card-scrollbar">
              {cart.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.productName} x{item.quantity}</span>
                  <span className="font-medium text-gray-800">{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-700">{fmt(total)}</span>
              </div>
              {appliedVoucher && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex justify-between text-sm">
                  <span className="text-green-600 font-medium">Diskon Voucher</span>
                  <span className="text-green-600 font-bold">-{fmt(appliedVoucher.discount)}</span>
                </motion.div>
              )}
              <div className="flex justify-between items-center pt-1.5 border-t border-gray-100">
                <span className="font-bold text-gray-700">Total</span>
                <span className="text-lg font-extrabold text-orange-600">{fmt(finalTotal)}</span>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg py-6 text-base disabled:opacity-50">
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Konfirmasi Pesanan
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

/* ─────────────────────── ORDERS PAGE ─────────────────────── */
function OrdersPage() {
  const { user, setPage, setReceipt, addToast } = useAppStore()
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)

  const loadOrders = useCallback(async () => {
    try {
      const url = user?.id ? `/api/orders?userId=${user.id}` : '/api/orders'
      const res = await fetch(url)
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      addToast('Gagal memuat pesanan', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, addToast])

  useEffect(() => { loadOrders() }, [loadOrders])

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-orange-500 to-amber-400 py-8 relative">
        <div className="absolute inset-0 aceh-pattern opacity-30" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            <Package className="w-8 h-8 inline-block mr-2 -mt-1" />
            Pesanan Saya
          </h1>
          <p className="text-orange-50 text-sm max-w-lg mx-auto text-justify leading-relaxed">
            Lihat riwayat dan status pesanan Anda di sini. Setiap pesanan akan menampilkan detail lengkap termasuk produk yang dipesan, total pembayaran, dan status pengiriman terkini.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Package className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/70 font-medium mb-2">Belum ada pesanan</p>
            <p className="text-white/50 text-sm text-justify max-w-sm mx-auto leading-relaxed">
              Anda belum memiliki riwayat pesanan. Silakan lakukan pemesanan terlebih dahulu dari halaman Menu untuk melihat status pesanan Anda di sini.
            </p>
            <Button className="mt-6 bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-md" onClick={() => setPage('menu')}>
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Pesan Sekarang
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {fmtDate(order.createdAt)}
                    </p>
                    <p className="text-sm font-bold text-gray-700 mt-1">#{order.id.slice(-6)}</p>
                  </div>
                  <Badge className={statusColor[order.status] || 'bg-gray-100 text-gray-600'}>
                    {statusLabel[order.status] || order.status}
                  </Badge>
                </div>
                <div className="space-y-1 mb-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-gray-500">
                      <span>{item.productName} x{item.quantity}</span>
                      <span>{fmt(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="mb-3" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total: <span className="font-bold text-orange-600">{fmt(order.total)}</span></span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-orange-200 text-orange-600 hover:bg-orange-50 text-xs"
                    onClick={() => { setReceipt(order); setPage('receipt') }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Detail
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────── RECEIPT / STRUK PAGE ─────────────────────── */
function ReceiptPage() {
  const { currentReceipt, setPage, addToast } = useAppStore()
  const receipt = currentReceipt

  if (!receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/70 font-medium mb-4">Tidak ada struk untuk ditampilkan</p>
          <Button className="bg-white text-orange-600 hover:bg-orange-50 font-semibold" onClick={() => setPage('home')}>
            <Home className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    )
  }

  const handlePrintPDF = () => {
    const statusText = statusLabel[receipt.status] || receipt.status
    const pointsText = receipt.status === 'delivered' && receipt.pointsEarned > 0
      ? `\n+${receipt.pointsEarned} poin didapatkan` : ''

    const subtotal = receipt.items.reduce((s, i) => s + i.subtotal, 0)
    const discountAmount = receipt.discount || 0

    const itemsHtml = receipt.items.map((item) => `
      <tr>
        <td style="padding:3px 0;vertical-align:top;text-align:left;width:55%">${item.productName}<br><span style="font-size:10px;color:#999">${item.quantity} x ${fmt(item.price)}</span></td>
        <td style="padding:3px 0;vertical-align:top;text-align:right;font-weight:600">${fmt(item.subtotal)}</td>
      </tr>
    `).join('')

    const discountHtml = discountAmount > 0 ? `
    <div style="display:flex;justify-content:space-between;color:#16a34a"><span>Diskon Voucher${receipt.voucherCode ? ` (${receipt.voucherCode})` : ''}</span><span style="font-weight:600">-${fmt(discountAmount)}</span></div>
    ` : ''

    const printHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width:320px; margin:0 auto; padding:20px 16px; color:#333; }
  .header { text-align:center; border-bottom:2px dashed #ddd; padding-bottom:14px; margin-bottom:14px; }
  .header h1 { font-size:16px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:2px; }
  .header p { font-size:10px; color:#888; line-height:1.4; }
  .header .phone { font-size:10px; color:#888; margin-top:2px; }
  .info { font-size:11px; line-height:1.7; margin-bottom:12px; }
  .info span { font-weight:600; color:#555; }
  .divider { border:none; border-top:1px dashed #ccc; margin:10px 0; }
  .items-table { width:100%; border-collapse:collapse; margin-bottom:10px; font-size:12px; }
  .items-table td { font-size:12px; }
  .total-section { font-size:12px; line-height:1.8; }
  .total-section .grand { font-size:15px; font-weight:800; color:#ea580c; }
  .status { text-align:center; margin:12px 0; }
  .status span { display:inline-block; padding:4px 16px; border-radius:20px; font-size:11px; font-weight:700; background:#f3f4f6; color:#374151; }
  .points { text-align:center; font-size:11px; color:#ea580c; font-weight:600; margin-top:4px; }
  .footer { text-align:center; font-size:10px; color:#999; margin-top:14px; padding-top:12px; border-top:1px dashed #ddd; line-height:1.5; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style></head><body>
  <div class="header">
    <h1>Ayam Geprek Sambal Ijo</h1>
    <p>${STORE_INFO.address}</p>
    <p class="phone">${STORE_INFO.phone}</p>
  </div>
  <div class="info">
    <div><span>No. Pesanan:</span> #${receipt.id.slice(-6)}</div>
    <div><span>Tanggal:</span> ${fmtDate(receipt.createdAt)}</div>
    <div><span>Pemesan:</span> ${receipt.customerName}</div>
    <div><span>Telepon:</span> ${receipt.customerPhone}</div>
    <div><span>Pengambilan:</span> ${receipt.customerAddress}</div>
    ${receipt.notes ? `<div><span>Catatan:</span> ${receipt.notes}</div>` : ''}
  </div>
  <hr class="divider">
  <p style="text-align:center;font-size:11px;font-weight:700;margin-bottom:8px;color:#555">DETAIL PESANAN</p>
  <table class="items-table">${itemsHtml}</table>
  <hr class="divider">
  <div class="total-section">
    <div style="display:flex;justify-content:space-between"><span>Subtotal</span><span style="font-weight:600">${fmt(subtotal)}</span></div>
    ${discountHtml}
    <hr class="divider">
    <div class="grand" style="display:flex;justify-content:space-between"><span>TOTAL</span><span>${fmt(receipt.total)}</span></div>
    <hr class="divider">
    <div style="display:flex;justify-content:space-between"><span>Pembayaran</span><span style="font-weight:600">${receipt.paymentMethod}</span></div>
  </div>
  <hr class="divider">
  <div class="status"><span>${statusText}</span></div>
  ${pointsText ? `<div class="points">⭐ ${pointsText}</div>` : ''}
  <div class="footer">
    Terima kasih telah memesan di Ayam Geprek Sambal Ijo.<br>
    Pesanan Anda sedang diproses. Selamat menikmati!
  </div>
  <script>window.onload=function(){window.print();}</script>
</body></html>`

    const printWin = window.open('', '_blank', 'width=380,height=700')
    if (printWin) {
      printWin.document.write(printHtml)
      printWin.document.close()
    } else {
      addToast('Gagal membuka jendela cetak. Izinkan popup untuk mencetak struk.', 'error')
    }
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-orange-500 to-amber-400 py-6 relative">
        <div className="absolute inset-0 aceh-pattern opacity-30" />
        <div className="relative max-w-5xl mx-auto px-4">
          <button onClick={() => setPage('orders')} className="text-white hover:text-orange-100 flex items-center gap-1 text-sm font-medium mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <h1 className="text-2xl font-extrabold text-white text-center">Struk Pembelian</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden"
        >
          {/* Header struk */}
          <div className="bg-orange-500 p-5 text-center">
            <ChefHat className="w-10 h-10 text-white mx-auto mb-2" />
            <h2 className="text-lg font-extrabold text-white uppercase">Ayam Geprek Sambal Ijo</h2>
            <p className="text-orange-100 text-xs mt-1">{STORE_INFO.address}</p>
            <p className="text-orange-200 text-[10px] mt-0.5">{STORE_INFO.phone}</p>
          </div>

          <div className="p-5 space-y-4">
            {/* Order info */}
            <div className="text-justify text-xs text-gray-500 space-y-1 leading-relaxed">
              <p><span className="font-medium text-gray-700">No. Pesanan:</span> #{receipt.id.slice(-6)}</p>
              <p><span className="font-medium text-gray-700">Tanggal:</span> {fmtDate(receipt.createdAt)}</p>
              <p><span className="font-medium text-gray-700">Pemesan:</span> {receipt.customerName}</p>
              <p><span className="font-medium text-gray-700">Telepon:</span> {receipt.customerPhone}</p>
              <p><span className="font-medium text-gray-700">Pengambilan:</span> {receipt.customerAddress}</p>
              {receipt.notes && <p><span className="font-medium text-gray-700">Catatan:</span> {receipt.notes}</p>}
            </div>

            <Separator />

            {/* Items */}
            <div>
              <h3 className="font-bold text-gray-700 text-sm mb-2 text-center">Detail Pesanan</h3>
              <div className="space-y-2">
                {receipt.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-justify">
                    <div className="flex-1">
                      <p className="text-gray-700">{item.productName}</p>
                      <p className="text-xs text-gray-400">{item.quantity} x {fmt(item.price)}</p>
                    </div>
                    <span className="font-medium text-gray-800 ml-4">{fmt(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="text-justify text-sm space-y-1 leading-relaxed">
              {(receipt.discount && receipt.discount > 0) && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-700 font-medium">{fmt(receipt.items.reduce((s, i) => s + i.subtotal, 0) + receipt.discount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600 font-medium">Diskon Voucher {receipt.voucherCode ? `(${receipt.voucherCode})` : ''}</span>
                    <span className="text-green-600 font-bold">-{fmt(receipt.discount)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-extrabold text-orange-600">{fmt(receipt.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pembayaran</span>
                <span className="font-medium text-gray-700">{receipt.paymentMethod}</span>
              </div>
            </div>

            <Separator />

            {/* Status */}
            <div className="text-center">
              <Badge className={`${statusColor[receipt.status]} text-sm px-4 py-1`}>
                {statusLabel[receipt.status]}
              </Badge>
              {receipt.status === 'delivered' && receipt.pointsEarned > 0 && (
                <p className="text-xs text-orange-600 font-semibold mt-2 flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5" />
                  +{receipt.pointsEarned} poin didapatkan
                </p>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center text-justify leading-relaxed">
              Terima kasih telah memesan di Ayam Geprek Sambal Ijo. Pesanan Anda sedang diproses. Selamat menikmati!
            </p>
          </div>

          {/* Actions */}
          <div className="border-t border-orange-100 p-4 flex gap-2">
            <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm" onClick={handlePrintPDF}>
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Cetak Struk PDF
            </Button>
            <Button variant="outline" className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50 text-sm" onClick={() => setPage('home')}>
              <Home className="w-3.5 h-3.5 mr-1.5" />
              Kembali
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/* ─────────────────────── LOGIN PAGE ─────────────────────── */
function LoginPage() {
  const { setPage, setUser, addToast } = useAppStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      addToast('Email dan password harus diisi', 'error')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUser(data)
      addToast(`Selamat datang, ${data.name}!`)
      setPage('home')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Login gagal', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 aceh-pattern opacity-20" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <ChefHat className="w-12 h-12 text-orange-500 mx-auto mb-3" />
          <h1 className="text-xl font-extrabold text-gray-800 uppercase">Ayam Geprek Sambal Ijo</h1>
          <p className="text-sm text-gray-500 text-justify mt-2 leading-relaxed">
            Masuk ke akun Anda untuk melihat riwayat pesanan dan menikmati kemudahan pemesanan yang lebih cepat dan terpersonalisasi.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm text-gray-600 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Username / Email
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="Masukkan email Anda"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm text-gray-600 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Password
            </Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="Masukkan password Anda"
              className="mt-1.5"
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-5 shadow-lg disabled:opacity-50">
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </span>
            ) : (
              'LOGIN'
            )}
          </Button>
        </form>

        <div className="mt-5 space-y-2 text-center">
          <button onClick={() => addToast('Fitur lupa password akan segera hadir', 'info')} className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1 mx-auto transition-colors">
            <KeyRound className="w-3 h-3" /> Lupa Password
          </button>
          <p className="text-xs text-gray-400">
            Belum punya akun?{' '}
            <button onClick={() => setPage('register')} className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
              Daftar Akun
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

/* ─────────────────────── REGISTER PAGE ─────────────────────── */
function RegisterPage() {
  const { setPage, addToast } = useAppStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      addToast('Nama, email, dan password harus diisi', 'error')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      addToast('Registrasi berhasil! Silakan login.', 'success')
      setPage('login')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Registrasi gagal', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 aceh-pattern opacity-20" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <ChefHat className="w-12 h-12 text-orange-500 mx-auto mb-3" />
          <h1 className="text-xl font-extrabold text-gray-800 uppercase">Daftar Akun Baru</h1>
          <p className="text-sm text-gray-500 text-justify mt-2 leading-relaxed">
            Buat akun baru untuk memudahkan proses pemesanan Anda. Dengan akun, Anda dapat melihat riwayat pesanan dan mendapatkan penawaran spesial.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <Label htmlFor="reg-name" className="text-sm text-gray-600 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Nama Lengkap
            </Label>
            <Input id="reg-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nama lengkap" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="reg-email" className="text-sm text-gray-600 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </Label>
            <Input id="reg-email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="email@contoh.com" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="reg-phone" className="text-sm text-gray-600 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Nomor Telepon
            </Label>
            <Input id="reg-phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="081234567890" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="reg-password" className="text-sm text-gray-600 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Password
            </Label>
            <Input id="reg-password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Minimal 6 karakter" className="mt-1" />
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-5 shadow-lg disabled:opacity-50 mt-2">
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </span>
            ) : (
              <><UserPlus className="w-4 h-4 mr-2" /> DAFTAR</>
            )}
          </Button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-5">
          Sudah punya akun?{' '}
          <button onClick={() => setPage('login')} className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
            Login di sini
          </button>
        </p>
      </motion.div>
    </div>
  )
}

/* ─────────────────────── PROFILE PAGE (Customer + Admin) ─────────────────────── */
function ProfilePage() {
  const { user, setUser, setPage, logout, setReceipt, addToast } = useAppStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'settings' | 'admin' | 'products' | 'vouchers' | 'chat'>('overview')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', phone: '', password: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [orders, setOrders] = useState<OrderData[]>([])
  const [allOrders, setAllOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const isAdmin = user?.role === 'admin'

  // Load orders on mount
  const loadOrders = useCallback(async () => {
    try {
      if (isAdmin) {
        const res = await fetch('/api/orders')
        const data = await res.json()
        setAllOrders(Array.isArray(data) ? data : [])
        setOrders(Array.isArray(data) ? data : [])
      } else if (user?.id) {
        const res = await fetch(`/api/orders?userId=${user.id}`)
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      }
    } catch {
      addToast('Gagal memuat data', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, isAdmin, addToast])

  useEffect(() => { loadOrders() }, [loadOrders])

  // Listen for "go to admin orders" event from notification popup
  useEffect(() => {
    const handler = () => { setActiveTab('admin'); loadOrders() }
    window.addEventListener('admin-goto-orders', handler)
    return () => window.removeEventListener('admin-goto-orders', handler)
  }, [loadOrders])

  // Computed stats
  const safeOrders = Array.isArray(orders) ? orders : []
  const safeAllOrders = Array.isArray(allOrders) ? allOrders : []

  const customerStats = {
    totalOrders: safeOrders.length,
    completed: safeOrders.filter((o: any) => o.status === 'delivered').length,
    pending: safeOrders.filter((o: any) => ['pending', 'confirmed', 'preparing'].includes(o.status)).length,
    totalSpent: safeOrders.filter((o: any) => o.status === 'delivered').reduce((s: number, o: any) => s + o.total, 0),
    firstOrder: safeOrders.length > 0 ? safeOrders[safeOrders.length - 1].createdAt : null,
    lastOrder: safeOrders.length > 0 ? safeOrders[0].createdAt : null,
  }

  const adminStats = {
    total: safeAllOrders.length,
    pending: safeAllOrders.filter((o: any) => o.status === 'pending').length,
    confirmed: safeAllOrders.filter((o: any) => o.status === 'confirmed').length,
    preparing: safeAllOrders.filter((o: any) => o.status === 'preparing').length,
    delivered: safeAllOrders.filter((o: any) => o.status === 'delivered').length,
    cancelled: safeAllOrders.filter((o: any) => o.status === 'cancelled').length,
    revenue: safeAllOrders.filter((o: any) => o.status === 'delivered').reduce((s: number, o: any) => s + o.total, 0),
    avgOrder: safeAllOrders.length > 0 ? Math.round(safeAllOrders.reduce((s: number, o: any) => s + o.total, 0) / safeAllOrders.length) : 0,
  }

  const startEdit = () => {
    setEditForm({ name: user?.name || '', phone: user?.phone || '', password: '', confirmPassword: '' })
    setEditing(true)
  }

  const saveProfile = async () => {
    if (!editForm.name.trim()) {
      addToast('Nama tidak boleh kosong', 'error')
      return
    }
    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      addToast('Konfirmasi password tidak cocok', 'error')
      return
    }
    if (editForm.password && editForm.password.length < 6) {
      addToast('Password minimal 6 karakter', 'error')
      return
    }

    setSaving(true)
    try {
      const body: Record<string, string> = { id: user!.id, name: editForm.name.trim() }
      if (editForm.phone) body.phone = editForm.phone.trim()
      if (editForm.password) body.password = editForm.password

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setUser({ ...user!, name: data.name, phone: data.phone })
      setEditing(false)
      addToast('Profil berhasil diperbarui', 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Gagal menyimpan', 'error')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      if (data.pointsInfo?.awarded) {
        addToast(`Pesanan selesai! +${data.pointsInfo.points} poin untuk pelanggan`, 'success')
      } else {
        addToast('Status pesanan berhasil diupdate', 'success')
      }
      loadOrders()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengupdate status'
      addToast(msg, 'error')
    }
  }

  const handleLogout = () => {
    logout()
    addToast('Anda telah keluar dari akun', 'info')
  }

  const confirmLogout = () => {
    setShowLogoutDialog(false)
    handleLogout()
  }

  const memberSince = user ? new Date(user.id.slice(0, 8) === 'cmr08ugr' ? '2026-06-30' : '2026-06-30').toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }) : ''

  // ─── Tab definitions ───
  // ─── Product Management State ───
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', originalPrice: '', category: 'Makanan', tag: '', available: true })
  const [productImage, setProductImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [savingProduct, setSavingProduct] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── Voucher Management State ───
  const [vouchers, setVouchers] = useState<any[]>([])
  const [allCustomers, setAllCustomers] = useState<{ id: string; name: string; email: string }[]>([])
  const [showVoucherForm, setShowVoucherForm] = useState(false)
  const [savingVoucher, setSavingVoucher] = useState(false)
  const [deletingVoucher, setDeletingVoucher] = useState<string | null>(null)
  const [voucherForm, setVoucherForm] = useState({
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minOrder: '',
    maxDiscount: '',
    userId: '',
    expiresAt: '',
  })

  const loadVouchers = useCallback(async () => {
    try {
      const res = await fetch('/api/vouchers')
      const data = await res.json()
      if (Array.isArray(data)) setVouchers(data)
    } catch { /* silent */ }
  }, [])

  const loadCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/profile?admin=true')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setAllCustomers(data)
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => { if (isAdmin) { loadVouchers(); loadCustomers() } }, [isAdmin, loadVouchers, loadCustomers])

  const handleCreateVoucher = async () => {
    if (!voucherForm.value) {
      addToast('Nilai voucher wajib diisi', 'error'); return
    }
    setSavingVoucher(true)
    try {
      const body: any = {
        type: voucherForm.type,
        value: Number(voucherForm.value),
        minOrder: voucherForm.minOrder ? Number(voucherForm.minOrder) : undefined,
        maxDiscount: voucherForm.type === 'percentage' && voucherForm.maxDiscount ? Number(voucherForm.maxDiscount) : undefined,
        userId: voucherForm.userId || undefined,
        expiresAt: voucherForm.expiresAt || undefined,
      }
      const res = await fetch('/api/vouchers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal membuat voucher')
      addToast(`Voucher ${data.code} berhasil dibuat!`, 'success')
      setVoucherForm({ type: 'percentage', value: '', minOrder: '', maxDiscount: '', userId: '', expiresAt: '' })
      setShowVoucherForm(false)
      loadVouchers()
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Gagal membuat voucher', 'error')
    } finally {
      setSavingVoucher(false)
    }
  }

  const handleDeleteVoucher = async (id: string) => {
    setDeletingVoucher(id)
    try {
      const res = await fetch(`/api/vouchers?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      addToast('Voucher berhasil dihapus', 'success')
      loadVouchers()
    } catch {
      addToast('Gagal menghapus voucher', 'error')
    } finally {
      setDeletingVoucher(null)
      setDeleteTarget(null)
    }
  }

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code)
    addToast(`Kode ${code} disalin!`, 'success')
  }

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?all=true')
      const data = await res.json()
      if (Array.isArray(data)) setAllProducts(data)
    } catch { /* silent */ }
  }, [])

  useEffect(() => { if (isAdmin) loadProducts() }, [isAdmin, loadProducts])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        throw new Error('Server error: respons bukan JSON')
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengunggah gambar')
      setProductImage(data.url)
    } catch (err: any) {
      addToast(err.message || 'Gagal mengunggah gambar', 'error')
    } finally {
      setUploading(false)
    }
  }

  const resetProductForm = () => {
    setProductForm({ name: '', description: '', price: '', originalPrice: '', category: 'Makanan', tag: '', available: true })
    setProductImage('')
    setEditingProduct(null)
    setShowProductForm(false)
  }

  const openEditProduct = (p: any) => {
    setEditingProduct(p)
    setProductForm({ name: p.name, description: p.description, price: String(p.price), originalPrice: p.originalPrice ? String(p.originalPrice) : '', category: p.category, tag: p.tag || '', available: p.available })
    setProductImage(p.image)
    setShowProductForm(true)
  }

  const saveProduct = async () => {
    if (!productForm.name.trim() || !productForm.price) {
      addToast('Nama dan harga wajib diisi', 'error'); return
    }
    setSavingProduct(true)
    try {
      const body: any = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : null,
        category: productForm.category,
        tag: productForm.tag || null,
        available: productForm.available,
        image: productImage || '/images/products/default.png',
      }
      if (editingProduct) {
        body.id = editingProduct.id
        const res = await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (!res.ok) throw new Error('Gagal update produk')
        addToast('Produk berhasil diupdate', 'success')
      } else {
        const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (!res.ok) throw new Error('Gagal menambah produk')
        addToast('Produk berhasil ditambahkan', 'success')
      }
      resetProductForm()
      loadProducts()
    } catch (err: any) {
      addToast(err.message, 'error')
    } finally {
      setSavingProduct(false)
    }
  }

  const deleteProduct = async (id: string) => {
    setDeletingProduct(id)
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus')
      addToast('Produk dihapus', 'success')
      loadProducts()
    } catch {
      addToast('Gagal menghapus produk', 'error')
    } finally {
      setDeletingProduct(null)
      setDeleteTarget(null)
    }
  }

  const confirmDeleteProduct = () => {
    if (!deleteTarget) return
    // Check if it's a voucher (name starts with "Voucher")
    if (deleteTarget.name.startsWith('Voucher')) {
      handleDeleteVoucher(deleteTarget.id)
    } else {
      deleteProduct(deleteTarget.id)
    }
  }

  const tabs = isAdmin
    ? [
        { id: 'overview' as const, label: 'Ringkasan', icon: <UserCircle className="w-4 h-4" /> },
        { id: 'admin' as const, label: 'Pesanan', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'products' as const, label: 'Produk', icon: <UtensilsCrossed className="w-4 h-4" /> },
        { id: 'vouchers' as const, label: 'Voucher', icon: <Tag className="w-4 h-4" /> },
        { id: 'chat' as const, label: 'Chat', icon: <MessageCircle className="w-4 h-4" /> },
        { id: 'orders' as const, label: 'Riwayat', icon: <ReceiptText className="w-4 h-4" /> },
        { id: 'settings' as const, label: 'Pengaturan', icon: <Settings className="w-4 h-4" /> },
      ]
    : [
        { id: 'overview' as const, label: 'Ringkasan', icon: <UserCircle className="w-4 h-4" /> },
        { id: 'orders' as const, label: 'Pesanan Saya', icon: <Package className="w-4 h-4" /> },
        { id: 'chat' as const, label: 'Chat', icon: <MessageCircle className="w-4 h-4" /> },
        { id: 'settings' as const, label: 'Pengaturan', icon: <Settings className="w-4 h-4" /> },
      ]

  return (
    <div className="min-h-screen pb-4">
      {/* ─── Profile Header ─── */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 relative overflow-visible">
        <div className="absolute inset-0 aceh-pattern opacity-20" />
        <div className="relative max-w-2xl mx-auto px-4 pt-8 pb-8">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/30 flex-shrink-0">
              {isAdmin ? (
                <Shield className="w-9 h-9 sm:w-10 sm:h-10 text-white" />
              ) : (
                <User className="w-9 h-9 sm:w-10 sm:h-10 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white truncate">{user?.name}</h1>
                <Badge className={`${isAdmin ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 text-white'} text-[10px] border-0 flex-shrink-0`}>
                  {isAdmin ? 'Admin' : 'Customer'}
                </Badge>
              </div>
              <p className="text-orange-100 text-xs sm:text-sm truncate">{user?.email}</p>
              {user?.phone && (
                <p className="text-orange-200/70 text-xs flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" /> {user.phone}
                </p>
              )}
              <p className="text-orange-200/50 text-[10px] mt-1">Bergabung sejak {memberSince}</p>
            </div>
          </div>

        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="sticky top-[52px] z-40 bg-orange-500 shadow-sm">
        <div className="max-w-2xl mx-auto px-2">
          <div className="flex gap-1 p-1 bg-orange-400/50 rounded-xl overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-white text-orange-600 shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Tab Content ─── */}
      <div className="max-w-2xl mx-auto px-4 mt-5 space-y-4">
        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === 'overview' && (
          <>
            {/* Quick Stats */}
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            ) : isAdmin ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Pesanan', value: adminStats.total, icon: <Package className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Menunggu', value: adminStats.pending, icon: <Clock className="w-5 h-5" />, color: 'bg-yellow-50 text-yellow-600' },
                  { label: 'Selesai', value: adminStats.delivered, icon: <CheckCircle2 className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
                  { label: 'Pendapatan', value: fmt(adminStats.revenue), icon: <TrendingUp className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl p-4 shadow-md"
                  >
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-2 ${s.color}`}>
                      {s.icon}
                    </div>
                    <p className="text-[11px] text-gray-500 text-justify leading-relaxed">{s.label}</p>
                    <p className="text-lg font-extrabold text-gray-800 mt-0.5">{s.value}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Pesanan', value: customerStats.totalOrders, icon: <Package className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Sedang Proses', value: customerStats.pending, icon: <Clock className="w-5 h-5" />, color: 'bg-yellow-50 text-yellow-600' },
                  { label: 'Selesai', value: customerStats.completed, icon: <CheckCircle2 className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
                  { label: 'Total Belanja', value: fmt(customerStats.totalSpent), icon: <CreditCard className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl p-4 shadow-md"
                  >
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-2 ${s.color}`}>
                      {s.icon}
                    </div>
                    <p className="text-[11px] text-gray-500 text-justify leading-relaxed">{s.label}</p>
                    <p className="text-lg font-extrabold text-gray-800 mt-0.5">{s.value}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Info Cards */}
            <div className="bg-white rounded-xl p-5 shadow-md">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-orange-500" />
                Informasi Akun
              </h3>
              <div className="space-y-3">
                {[
                  { icon: <User className="w-4 h-4 text-gray-400" />, label: 'Nama', value: user?.name || '-' },
                  { icon: <Mail className="w-4 h-4 text-gray-400" />, label: 'Email', value: user?.email || '-' },
                  { icon: <Phone className="w-4 h-4 text-gray-400" />, label: 'Telepon', value: user?.phone || 'Belum diatur' },
                  { icon: <Shield className="w-4 h-4 text-gray-400" />, label: 'Role', value: isAdmin ? 'Administrator' : 'Customer' },
                  { icon: <Calendar className="w-4 h-4 text-gray-400" />, label: 'Bergabung', value: memberSince },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {row.icon}
                    <div className="flex-1">
                      <p className="text-[11px] text-gray-400">{row.label}</p>
                      <p className="text-sm text-gray-700 font-medium">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={startEdit} variant="outline" className="w-full mt-4 border-orange-200 text-orange-600 hover:bg-orange-50 text-sm">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profil
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {[
                { icon: <Package className="w-5 h-5" />, label: 'Lihat Pesanan Saya', desc: 'Lihat riwayat dan status pesanan Anda', onClick: () => setActiveTab('orders') },
                { icon: <UtensilsCrossed className="w-5 h-5" />, label: 'Jelajahi Menu', desc: 'Temukan varian ayam geprek favorit Anda', onClick: () => setPage('menu') },
                { icon: <HelpCircle className="w-5 h-5" />, label: 'Bantuan', desc: 'Hubungi kami untuk pertanyaan dan bantuan', onClick: () => addToast('Fitur bantuan segera hadir', 'info') },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className="w-full flex items-center gap-3 p-4 hover:bg-orange-50 transition-colors text-left border-b border-orange-50 last:border-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{action.label}</p>
                    <p className="text-[11px] text-gray-400 text-justify leading-relaxed">{action.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </button>
              ))}
            </div>

            {/* Logout */}
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="w-full flex items-center justify-center gap-2 bg-white rounded-xl p-4 shadow-md text-red-500 hover:bg-red-50 transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              Keluar dari Akun
            </button>
          </>
        )}

        {/* ═══ ORDERS TAB (Customer) ═══ */}
        {activeTab === 'orders' && !isAdmin && (
          <>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-500" />
                Riwayat Pesanan Saya
              </h3>
              <p className="text-xs text-gray-400 text-justify mt-1 leading-relaxed">
                Berikut adalah daftar semua pesanan yang pernah Anda buat. Klik detail untuk melihat informasi lengkap setiap pesanan termasuk produk yang dipesan dan status pengiriman saat ini.
              </p>
            </div>

            {loading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow-md text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium mb-1">Belum ada pesanan</p>
                <p className="text-xs text-gray-400 text-justify max-w-xs mx-auto leading-relaxed">
                  Anda belum pernah membuat pesanan. Mulai dengan menjelajahi menu kami dan tambahkan item favorit ke keranjang.
                </p>
                <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white text-sm" onClick={() => setPage('menu')}>
                  <UtensilsCrossed className="w-4 h-4 mr-2" /> Pesan Sekarang
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto card-scrollbar pr-1">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-4 shadow-md"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {fmtDate(order.createdAt)}
                        </p>
                        <p className="text-sm font-bold text-gray-700 mt-1">#{order.id.slice(-6)}</p>
                      </div>
                      <Badge className={`${statusColor[order.status]} text-xs`}>{statusLabel[order.status]}</Badge>
                    </div>
                    <div className="space-y-1 mb-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between text-xs text-gray-500">
                          <span className="truncate mr-2">{item.productName} x{item.quantity}</span>
                          <span className="flex-shrink-0">{fmt(item.subtotal)}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-[11px] text-gray-400">+{order.items.length - 3} item lainnya</p>
                      )}
                    </div>
                    <Separator className="mb-2" />
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">
                        <span>{order.items.length} item</span>
                        <span className="mx-1">&middot;</span>
                        <span>{order.paymentMethod}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-orange-600 text-sm">{fmt(order.total)}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-200 text-orange-600 hover:bg-orange-50 text-xs"
                          onClick={() => { setReceipt(order); setPage('receipt') }}
                        >
                          <Eye className="w-3 h-3 mr-1" /> Detail
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══ ADMIN TAB ═══ */}
        {activeTab === 'admin' && isAdmin && (
          <>
            {/* Admin Stats Expanded */}
            {loading ? (
              <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { label: 'Pending', value: adminStats.pending, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                  { label: 'Dikonfirmasi', value: adminStats.confirmed, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { label: 'Diproses', value: adminStats.preparing, color: 'bg-orange-50 text-orange-700 border-orange-200' },
                  { label: 'Selesai', value: adminStats.delivered, color: 'bg-green-50 text-green-700 border-green-200' },
                  { label: 'Dibatalkan', value: adminStats.cancelled, color: 'bg-red-50 text-red-700 border-red-200' },
                  { label: 'Rata-rata', value: fmt(adminStats.avgOrder), color: 'bg-purple-50 text-purple-700 border-purple-200' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`rounded-xl p-3 text-center border ${s.color}`}
                  >
                    <p className="text-lg sm:text-xl font-extrabold">{s.value}</p>
                    <p className="text-[10px] sm:text-xs font-medium opacity-70">{s.label}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Order Management */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-orange-100">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-orange-500" />
                  Kelola Semua Pesanan
                </h2>
                <p className="text-xs text-gray-400 text-justify mt-1 leading-relaxed">
                  Kelola semua pesanan yang masuk dari pelanggan. Anda dapat mengubah status pesanan sesuai tahap pemrosesan: konfirmasi, proses, hingga selesai dikirim ke pelanggan.
                </p>
              </div>
              <div className="max-h-[55vh] overflow-y-auto card-scrollbar">
                {loading ? (
                  <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>
                ) : allOrders.length === 0 ? (
                  <div className="p-8 text-center">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Belum ada pesanan masuk</p>
                  </div>
                ) : (
                  <div className="divide-y divide-orange-50">
                    {allOrders.map((order) => (
                      <div key={order.id} className="p-4 hover:bg-orange-50/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-gray-400">#{order.id.slice(-6)}</span>
                              <Badge className={`${statusColor[order.status]} text-xs`}>{statusLabel[order.status]}</Badge>
                            </div>
                            <p className="text-sm font-medium text-gray-700 truncate">{order.customerName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {order.items.length} item &middot; {fmt(order.total)} &middot; {fmtDate(order.createdAt)}
                            </p>
                            <p className="text-xs text-gray-400 text-justify mt-0.5 leading-relaxed truncate">
                              <MapPin className="w-3 h-3 inline mr-0.5" />{order.customerAddress}
                            </p>
                            <p className="text-xs text-gray-400">
                              <Phone className="w-3 h-3 inline mr-0.5" />{order.customerPhone}
                              {order.notes && <span className="ml-2"><Bell className="w-3 h-3 inline mr-0.5" />{order.notes}</span>}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-orange-200 text-orange-600 hover:bg-orange-50 text-xs"
                              onClick={() => { setReceipt(order); setPage('receipt') }}
                            >
                              <Eye className="w-3 h-3 mr-1" /> Detail
                            </Button>
                            {order.status === 'pending' && (
                              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white text-xs" onClick={() => updateStatus(order.id, 'confirmed')}>
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Konfirmasi
                              </Button>
                            )}
                            {order.status === 'confirmed' && (
                              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white text-xs" onClick={() => updateStatus(order.id, 'preparing')}>
                                <Clock className="w-3 h-3 mr-1" /> Proses
                              </Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white text-xs" onClick={() => updateStatus(order.id, 'delivered')}>
                                <Truck className="w-3 h-3 mr-1" /> Selesai
                              </Button>
                            )}
                            {['pending', 'confirmed'].includes(order.status) && (
                              <Button size="sm" variant="outline" className="border-red-200 text-red-500 hover:bg-red-50 text-xs" onClick={() => updateStatus(order.id, 'cancelled')}>
                                <XCircle className="w-3 h-3 mr-1" /> Batal
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ═══ ORDERS TAB (Admin — read-only history) ═══ */}
        {activeTab === 'orders' && isAdmin && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-orange-100">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-orange-500" />
                Riwayat Semua Pesanan
              </h3>
              <p className="text-xs text-gray-400 text-justify mt-1 leading-relaxed">
                Daftar lengkap semua pesanan yang pernah masuk termasuk yang sudah selesai dan dibatalkan. Data ini dapat digunakan untuk analisis penjualan dan evaluasi performa layanan.
              </p>
            </div>
            <div className="max-h-[55vh] overflow-y-auto card-scrollbar">
              {loading ? (
                <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
              ) : allOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">Belum ada data pesanan</div>
              ) : (
                <div className="divide-y divide-orange-50">
                  {allOrders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => { setReceipt(order); setPage('receipt') }}
                      className="w-full p-3 hover:bg-orange-50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-gray-400">#{order.id.slice(-6)}</span>
                        <Badge className={`${statusColor[order.status]} text-[10px]`}>{statusLabel[order.status]}</Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-700">{order.customerName}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-400">{fmtDate(order.createdAt)}</span>
                        <span className="text-sm font-bold text-orange-600">{fmt(order.total)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ PRODUCTS TAB (Admin — manage products) ═══ */}
        {activeTab === 'products' && isAdmin && (
          <>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-orange-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                    Kelola Produk
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Tambah, edit, atau hapus menu produk</p>
                </div>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs" onClick={() => { resetProductForm(); setShowProductForm(true) }}>
                  <Plus className="w-4 h-4 mr-1" /> Tambah
                </Button>
              </div>

              {showProductForm && (
                <div className="p-4 border-b border-orange-100 bg-orange-50/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-gray-700">{editingProduct ? 'Edit Produk' : 'Produk Baru'}</h3>
                    <Button size="sm" variant="ghost" onClick={resetProductForm}><X className="w-4 h-4" /></Button>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Gambar Produk</Label>
                    <div className="mt-1 flex items-center gap-3">
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-20 h-20 rounded-xl border-2 border-dashed border-orange-300 flex flex-col items-center justify-center text-orange-400 hover:border-orange-500 hover:text-orange-600 transition-colors disabled:opacity-50 flex-shrink-0 overflow-hidden">
                        {uploading ? (
                          <span className="w-5 h-5 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
                        ) : productImage ? (
                          <img src={productImage} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <><Camera className="w-5 h-5" /><span className="text-[9px] mt-0.5">Upload</span></>
                        )}
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleImageUpload} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-gray-400 text-justify leading-relaxed">Klik untuk upload gambar. Maksimal 2MB. Format: JPG, PNG, GIF, WebP.</p>
                        {productImage && <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Gambar berhasil diupload</p>}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-600">Nama Produk *</Label>
                      <Input className="mt-1 h-9 text-sm" value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ayam Geprek Sambal Ijo" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-600">Deskripsi</Label>
                      <Textarea className="mt-1 text-sm" rows={2} value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} placeholder="Deskripsi singkat produk" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Harga *</Label>
                      <Input type="number" className="mt-1 h-9 text-sm" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} placeholder="15000" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Harga Asli</Label>
                      <Input type="number" className="mt-1 h-9 text-sm" value={productForm.originalPrice} onChange={(e) => setProductForm((p) => ({ ...p, originalPrice: e.target.value }))} placeholder="18000 (opsional)" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Kategori</Label>
                      <select className="mt-1 h-9 w-full rounded-md border border-orange-200 bg-white px-3 text-sm" value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}>
                        <option value="Makanan">Makanan</option>
                        <option value="Minuman">Minuman</option>
                        <option value="Paket">Paket</option>
                        <option value="Tambahan">Tambahan</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Tag</Label>
                      <select className="mt-1 h-9 w-full rounded-md border border-orange-200 bg-white px-3 text-sm" value={productForm.tag} onChange={(e) => setProductForm((p) => ({ ...p, tag: e.target.value }))}>
                        <option value="">Tanpa Tag</option>
                        <option value="terbaru">Terbaru</option>
                        <option value="terlaris">Terlaris</option>
                        <option value="populer">Populer</option>
                        <option value="promo">Promo</option>
                      </select>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <input type="checkbox" id="prod-available" checked={productForm.available} onChange={(e) => setProductForm((p) => ({ ...p, available: e.target.checked }))} className="rounded border-orange-300" />
                      <Label htmlFor="prod-available" className="text-xs text-gray-600">Tersedia untuk dipesan</Label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button onClick={saveProduct} disabled={savingProduct} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm disabled:opacity-50">
                      {savingProduct ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><BadgeCheck className="w-4 h-4 mr-1" /> {editingProduct ? 'Update' : 'Simpan'}</>}
                    </Button>
                    <Button onClick={resetProductForm} variant="outline" className="border-orange-200 text-orange-600 text-sm hover:bg-orange-50">Batal</Button>
                  </div>
                </div>
              )}

              <div className="max-h-[55vh] overflow-y-auto card-scrollbar">
                {allProducts.length === 0 ? (
                  <div className="p-8 text-center"><PackageSearch className="w-10 h-10 text-gray-300 mx-auto mb-2" /><p className="text-gray-400 text-sm">Belum ada produk</p></div>
                ) : (
                  <div className="divide-y divide-orange-50">
                    {allProducts.map((p: any) => (
                      <div key={p.id} className="p-3 hover:bg-orange-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-orange-100 flex-shrink-0">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                              {!p.available && <Badge className="bg-gray-100 text-gray-500 text-[9px]">Nonaktif</Badge>}
                            </div>
                            <p className="text-xs text-gray-400">{p.category}{p.tag ? ` · ${p.tag}` : ''}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm font-bold text-orange-600">{fmt(p.price)}</span>
                              {p.originalPrice && p.originalPrice > p.price && <span className="text-[10px] text-gray-400 line-through">{fmt(p.originalPrice)}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button size="sm" variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50 text-[11px] h-8 px-2" onClick={() => openEditProduct(p)}>
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-200 text-red-500 hover:bg-red-50 text-[11px] h-8 px-2" onClick={() => setDeleteTarget({ id: p.id, name: p.name })} disabled={deletingProduct === p.id}>
                              {deletingProduct === p.id ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ═══ VOUCHER TAB ═══ */}
        {activeTab === 'vouchers' && isAdmin && (
          <>
            <div className="bg-white rounded-xl p-5 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4 text-orange-500" />
                  Kelola Voucher
                </h3>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
                  onClick={() => setShowVoucherForm(!showVoucherForm)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Buat Voucher
                </Button>
              </div>

              {/* Create Voucher Form */}
              {showVoucherForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border border-orange-100 rounded-lg p-4 mb-4 bg-orange-50/50 space-y-3">
                  <h4 className="font-semibold text-gray-700 text-xs">Buat Voucher Baru</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[11px] text-gray-500">Tipe Diskon</Label>
                      <select
                        value={voucherForm.type}
                        onChange={(e) => setVoucherForm((p) => ({ ...p, type: e.target.value as 'percentage' | 'fixed' }))}
                        className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                      >
                        <option value="percentage">Persentase (%)</option>
                        <option value="fixed">Nominal Tetap (Rp)</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500">Nilai Diskon</Label>
                      <Input
                        type="number"
                        value={voucherForm.value}
                        onChange={(e) => setVoucherForm((p) => ({ ...p, value: e.target.value }))}
                        placeholder={voucherForm.type === 'percentage' ? '20' : '5000'}
                        className="mt-1 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[11px] text-gray-500">Min. Pesanan (Rp)</Label>
                      <Input
                        type="number"
                        value={voucherForm.minOrder}
                        onChange={(e) => setVoucherForm((p) => ({ ...p, minOrder: e.target.value }))}
                        placeholder="Opsional, kosongkan"
                        className="mt-1 text-sm"
                      />
                    </div>
                    {voucherForm.type === 'percentage' && (
                      <div>
                        <Label className="text-[11px] text-gray-500">Maks. Diskon (Rp)</Label>
                        <Input
                          type="number"
                          value={voucherForm.maxDiscount}
                          onChange={(e) => setVoucherForm((p) => ({ ...p, maxDiscount: e.target.value }))}
                          placeholder="Opsional, kosongkan"
                          className="mt-1 text-sm"
                        />
                      </div>
                    )}
                    {voucherForm.type === 'fixed' && <div />}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[11px] text-gray-500">Untuk Member</Label>
                      <select
                        value={voucherForm.userId}
                        onChange={(e) => setVoucherForm((p) => ({ ...p, userId: e.target.value }))}
                        className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                      >
                        <option value="">Semua Customer</option>
                        {allCustomers.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500">Masa Berlaku</Label>
                      <Input
                        type="date"
                        value={voucherForm.expiresAt}
                        onChange={(e) => setVoucherForm((p) => ({ ...p, expiresAt: e.target.value }))}
                        className="mt-1 text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    * Kode voucher akan dibuat otomatis secara unik. Voucher hanya dapat digunakan 1x pakai dan tidak berlaku kelipatan.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button onClick={handleCreateVoucher} disabled={savingVoucher} size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs disabled:opacity-50">
                      {savingVoucher ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus className="w-3.5 h-3.5 mr-1" /> Buat</>}
                    </Button>
                    <Button onClick={() => setShowVoucherForm(false)} variant="outline" size="sm" className="flex-1 border-orange-200 text-orange-600 text-xs hover:bg-orange-50">
                      Batal
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Voucher List */}
              {vouchers.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Belum ada voucher</p>
                  <p className="text-xs text-gray-300 mt-1">Klik "Buat Voucher" untuk menambahkan</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto card-scrollbar">
                  {vouchers.map((v) => {
                    const isExpired = v.expiresAt && new Date(v.expiresAt) < new Date()
                    return (
                      <motion.div
                        key={v.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`border rounded-lg p-3 ${v.used ? 'border-gray-200 bg-gray-50 opacity-60' : isExpired ? 'border-red-200 bg-red-50/50 opacity-60' : 'border-orange-100 bg-white'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-bold text-sm text-gray-800 tracking-wider">{v.code}</span>
                              {v.used && <Badge className="bg-gray-200 text-gray-600 text-[9px] border-0">Digunakan</Badge>}
                              {isExpired && !v.used && <Badge className="bg-red-100 text-red-600 text-[9px] border-0">Expired</Badge>}
                              {!v.used && !isExpired && <Badge className="bg-green-100 text-green-700 text-[9px] border-0">Aktif</Badge>}
                            </div>
                            <div className="flex flex-wrap gap-1.5 text-[10px] text-gray-500">
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                                {v.type === 'percentage' ? `Diskon ${v.value}%` : `Diskon ${fmt(v.value)}`}
                              </span>
                              {v.minOrder > 0 && <span className="bg-gray-100 px-1.5 py-0.5 rounded">Min. {fmt(v.minOrder)}</span>}
                              {v.maxDiscount > 0 && <span className="bg-gray-100 px-1.5 py-0.5 rounded">Maks {fmt(v.maxDiscount)}</span>}
                              {v.expiresAt && <span className="bg-gray-100 px-1.5 py-0.5 rounded">s/d {new Date(v.expiresAt).toLocaleDateString('id-ID')}</span>}
                            </div>
                            {v.user && (
                              <p className="text-[10px] text-gray-400 mt-1">
                                <User className="w-3 h-3 inline mr-0.5" />{v.user.name} ({v.user.email})
                              </p>
                            )}
                            {!v.user && (
                              <p className="text-[10px] text-orange-500 mt-1 font-medium">
                                <Gift className="w-3 h-3 inline mr-0.5" />Berlaku untuk semua customer
                              </p>
                            )}
                            {v.used && v.usedAt && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Digunakan: {fmtDate(v.usedAt)}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            {!v.used && (
                              <button
                                onClick={() => copyVoucherCode(v.code)}
                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-orange-100 text-gray-400 hover:text-orange-600 transition-colors"
                                title="Salin kode"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteTarget({ id: v.id, name: `Voucher ${v.code}` })}
                              disabled={deletingVoucher === v.id || v.used}
                              className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                              title="Hapus"
                            >
                              {deletingVoucher === v.id ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Voucher Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Voucher', value: vouchers.length, color: 'bg-blue-50 text-blue-600' },
                { label: 'Aktif', value: (Array.isArray(vouchers) ? vouchers : []).filter((v) => !v.used && (!v.expiresAt || new Date(v.expiresAt) >= new Date())).length, color: 'bg-green-50 text-green-600' },
                { label: 'Digunakan', value: (Array.isArray(vouchers) ? vouchers : []).filter((v) => v.used).length, color: 'bg-orange-50 text-orange-600' },
              ].map((s, i) => (
                <div key={i} className={`rounded-xl p-3 text-center ${s.color}`}>
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[10px] font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══ SETTINGS TAB ═══ */}
        {/* ═══ CHAT TAB ═══ */}
        {activeTab === 'chat' && isAdmin && (
          <AdminChatPanel />
        )}
        {activeTab === 'chat' && !isAdmin && (
          <CustomerChatPanel />
        )}
        {activeTab === 'settings' && (
          <>
            {/* Edit Profile */}
            <div className="bg-white rounded-xl p-5 shadow-md">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-4">
                <Edit3 className="w-4 h-4 text-orange-500" />
                {editing ? 'Edit Profil' : 'Data Profil'}
              </h3>

              {editing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="edit-name" className="text-xs text-gray-600">Nama Lengkap</Label>
                    <Input id="edit-name" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className="mt-1" placeholder="Nama lengkap" />
                  </div>
                  <div>
                    <Label htmlFor="edit-phone" className="text-xs text-gray-600">Nomor Telepon</Label>
                    <Input id="edit-phone" value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} className="mt-1" placeholder="081234567890" />
                  </div>
                  <Separator />
                  <div>
                    <Label htmlFor="edit-pw" className="text-xs text-gray-600">Password Baru (Opsional)</Label>
                    <Input id="edit-pw" type="password" value={editForm.password} onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))} className="mt-1" placeholder="Kosongkan jika tidak ingin diubah" />
                  </div>
                  {editForm.password && (
                    <div>
                      <Label htmlFor="edit-pw2" className="text-xs text-gray-600">Konfirmasi Password</Label>
                      <Input id="edit-pw2" type="password" value={editForm.confirmPassword} onChange={(e) => setEditForm((p) => ({ ...p, confirmPassword: e.target.value }))} className="mt-1" placeholder="Ulangi password baru" />
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button onClick={saveProfile} disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm disabled:opacity-50">
                      {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><BadgeCheck className="w-4 h-4 mr-1" /> Simpan</>}
                    </Button>
                    <Button onClick={() => setEditing(false)} variant="outline" className="flex-1 border-orange-200 text-orange-600 text-sm hover:bg-orange-50">
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: 'Nama', value: user?.name || '-' },
                    { label: 'Email', value: user?.email || '-' },
                    { label: 'Telepon', value: user?.phone || 'Belum diatur' },
                    { label: 'Password', value: '••••••••' },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center py-1">
                      <span className="text-xs text-gray-400">{row.label}</span>
                      <span className="text-sm text-gray-700 font-medium">{row.value}</span>
                    </div>
                  ))}
                  <Button onClick={startEdit} variant="outline" className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 text-sm mt-2">
                    <Edit3 className="w-4 h-4 mr-2" /> Ubah Data Profil
                  </Button>
                </div>
              )}
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 p-4 pb-0">
                <Settings className="w-4 h-4 text-orange-500" />
                Preferensi
              </h3>
              <div className="divide-y divide-orange-50">
                {[
                  { icon: <Bell className="w-5 h-5" />, label: 'Notifikasi Pesanan', desc: 'Terima notifikasi ketika status pesanan diperbarui', onClick: () => addToast('Notifikasi aktif', 'success') },
                  { icon: <ReceiptText className="w-5 h-5" />, label: 'Struk Digital', desc: 'Simpan struk pembelian secara otomatis di riwayat pesanan', onClick: () => addToast('Struk digital aktif', 'success') },
                  { icon: <Star className="w-5 h-5" />, label: 'Favorit', desc: 'Atur menu favorit untuk akses cepat saat pemesanan', onClick: () => addToast('Fitur favorit segera hadir', 'info') },
                ].map((item, i) => (
                  <button key={i} onClick={item.onClick} className="w-full flex items-center gap-3 p-4 hover:bg-orange-50 transition-colors text-left">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                      <p className="text-[11px] text-gray-400 text-justify leading-relaxed">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="w-full flex items-center justify-center gap-2 bg-white rounded-xl p-4 shadow-md text-red-500 hover:bg-red-50 transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              Keluar dari Akun
            </button>
          </>
        )}
      </div>

      {/* ═══ LOGOUT CONFIRMATION DIALOG ═══ */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="rounded-2xl bg-white border border-gray-200">
          <AlertDialogHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-2">
              <LogOut className="w-7 h-7 text-red-500" />
            </div>
            <AlertDialogTitle className="text-center text-lg text-gray-900">Keluar dari Akun?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-justify leading-relaxed text-gray-600">
              Anda akan keluar dari sesi saat ini. Pastikan semua pesanan telah diproses sebelum meninggalkan halaman admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="m-0 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 border-0">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="m-0 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold"
            >
              <LogOut className="w-4 h-4 mr-1.5 inline" /> Ya, Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ═══ DELETE PRODUCT CONFIRMATION DIALOG ═══ */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-2">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <AlertDialogTitle className="text-center text-lg">Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-justify leading-relaxed">
              Produk <strong>&quot;{deleteTarget?.name}&quot;</strong> akan dihapus secara permanen dari menu. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="m-0 rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
              className="m-0 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold"
            >
              <Trash2 className="w-4 h-4 mr-1.5 inline" /> Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ─────────────────────── CHAT HOOK ─────────────────────── */
function useChatSocket(roomId: string | null, userId: string, role: string) {
  const socketRef = useRef<any>(null)
  const [connected, setConnected] = useState(false)
  const { addToast } = useAppStore()

  useEffect(() => {
    if (!roomId || !userId) return

    let socket: any
    let cancelled = false

    // Dynamic import to avoid SSR issues
    import('socket.io-client').then(({ io }) => {
      if (cancelled) return
      socket = io('/?XTransformPort=3003', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      })
      socketRef.current = socket

      socket.on('connect', () => {
        setConnected(true)
        socket.emit('join-room', { roomId, userId, role })
      })
      socket.on('disconnect', () => setConnected(false))
      socket.on('connect_error', () => setConnected(false))
    }).catch(() => {
      // Socket.IO not available, fallback to REST only
    })

    return () => {
      cancelled = true
      if (socket) {
        socket.emit('leave-room')
        socket.disconnect()
      }
      socketRef.current = null
    }
  }, [roomId, userId, role])

  const sendMessage = useCallback((data: { roomId: string; senderId: string; senderName: string; senderRole: string; content: string }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send-message', data)
    } else {
      // Fallback to REST
      fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => addToast('Gagal mengirim pesan', 'error'))
    }
  }, [addToast])

  const emitTyping = useCallback((data: { roomId: string; userId: string; name: string }) => {
    socketRef.current?.emit('typing', data)
  }, [])

  const emitStopTyping = useCallback((data: { roomId: string; userId: string }) => {
    socketRef.current?.emit('stop-typing', data)
  }, [])

  return { socket: socketRef, connected, sendMessage, emitTyping, emitStopTyping }
}

/* ─────────────────────── CUSTOMER CHAT PANEL (inside Profile) ─────────────────────── */
function CustomerChatPanel() {
  const { user, setPage, addToast, setUnreadChats } = useAppStore()
  const [messages, setMessages] = useState<any[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { socket, connected, sendMessage, emitTyping, emitStopTyping } = useChatSocket(roomId, user?.id || '', user?.role || '')

  // Initialize room
  useEffect(() => {
    if (!user) return  // Wait for hydration, don't navigate away
    ;(async () => {
      try {
        const res = await fetch(`/api/chat/rooms?userId=${encodeURIComponent(user.id)}&role=${encodeURIComponent(user.role)}&name=${encodeURIComponent(user.name)}`)
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          addToast(errData.error || 'Gagal memuat chat', 'error')
          return
        }
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setRoomId(data[0].id)
          setUnreadChats(data[0].unreadCustomer || 0)
        } else {
          // No room returned — try POST to create one
          const postRes = await fetch('/api/chat/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, name: user.name }),
          })
          if (postRes.ok) {
            const room = await postRes.json()
            if (room.id) setRoomId(room.id)
          } else {
            addToast('Gagal membuat room chat', 'error')
          }
        }
      } catch {
        addToast('Gagal memuat chat', 'error')
      } finally {
        setLoading(false)
      }
    })()
  }, [user, setPage, addToast, setUnreadChats, retryKey])

  // Load messages when room changes
  useEffect(() => {
    if (!roomId) return
    ;(async () => {
      try {
        const res = await fetch(`/api/chat/messages?roomId=${roomId}`)
        const data = await res.json()
        setMessages(Array.isArray(data) ? data : [])
      } catch { /* ignore */ }
    })()
  }, [roomId])

  // REST polling for new messages when socket is not connected
  useEffect(() => {
    if (!roomId || connected) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/messages?roomId=${roomId}`)
        const data = await res.json()
        if (Array.isArray(data)) {
          setMessages((prev) => {
            if (data.length > prev.length) {
              setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
              return data
            }
            return prev
          })
        }
      } catch { /* ignore */ }
    }, 3000)
    return () => clearInterval(interval)
  }, [roomId, connected])

  // Mark as read
  useEffect(() => {
    if (!roomId || !user) return
    fetch('/api/chat/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, role: user.role }),
    }).then(() => setUnreadChats(0)).catch(() => {})
  }, [roomId, user, setUnreadChats])

  // Listen for new messages
  useEffect(() => {
    if (!socket.current) return
    const s = socket.current

    const handleNewMessage = (msg: any) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
      // Auto-scroll
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }

    const handleRead = () => {
      setUnreadChats(0)
      setMessages((prev) => prev.map((m) => ({ ...m, read: true })))
    }

    const handleTyping = (data: { name: string }) => {
      setTypingUser(data.name)
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(() => setTypingUser(null), 2000)
    }

    const handleStopTyping = () => setTypingUser(null)

    s.on('new-message', handleNewMessage)
    s.on('messages-read', handleRead)
    s.on('user-typing', handleTyping)
    s.on('user-stop-typing', handleStopTyping)

    return () => {
      s.off('new-message', handleNewMessage)
      s.off('messages-read', handleRead)
      s.off('user-typing', handleTyping)
      s.off('user-stop-typing', handleStopTyping)
    }
  }, [socket, setUnreadChats])

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMsg.trim() || !roomId || !user || sending) return
    const content = newMsg.trim()
    setNewMsg('')
    emitStopTyping({ roomId, userId: user.id })
    setSending(true)
    try {
      // Always use REST as primary — more reliable
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, senderId: user.id, senderName: user.name, senderRole: user.role, content }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        addToast(err.error || 'Gagal mengirim pesan', 'error')
        return
      }
      const data = await res.json()
      if (data.id) {
        setMessages((prev) => [...prev, data])
      } else if (data.error) {
        addToast(data.error, 'error')
      }
    } catch {
      addToast('Gagal mengirim pesan', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleInputChange = (val: string) => {
    setNewMsg(val)
    if (roomId && user) {
      if (val.trim()) {
        emitTyping({ roomId, userId: user.id, name: user.name })
      } else {
        emitStopTyping({ roomId, userId: user.id })
      }
    }
  }

  const fmtTime = (d: string) => {
    const date = new Date(d)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-md">
        <Skeleton className="w-32 h-5 mb-4" />
        <Skeleton className="w-full h-48" />
      </div>
    )
  }

  if (!user) return null

  // Show error when room couldn't be created
  if (!roomId) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col items-center justify-center gap-3 p-8" style={{ height: '65vh' }}>
        <MessageCircle className="w-12 h-12 text-gray-300" />
        <p className="text-sm text-gray-500">Gagal memuat chat</p>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
          onClick={() => { setLoading(true); setRoomId(null); setRetryKey((k) => k + 1) }}
        >
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col" style={{ height: '65vh' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 border-b border-orange-100 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-sm">Customer Service</h3>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-gray-300'}`} />
            <span className="text-[11px] text-gray-400">
              {typingUser ? `${typingUser} sedang mengetik...` : connected ? 'Online' : 'Terhubung via REST'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50/80 px-4 py-4 space-y-3" style={{ scrollbarWidth: 'thin' }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <MessageCircle className="w-12 h-12 opacity-30" />
            <p className="text-sm">Belum ada pesan. Mulai percakapan!</p>
            <p className="text-xs text-gray-300">Kami siap membantu Anda</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === user.id
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${isMe ? 'order-1' : 'order-1'}`}>
                <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                  isMe
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-md'
                    : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
                <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                  {fmtTime(msg.createdAt)}
                  {isMe && msg.read && ' ✓✓'}
                </p>
              </div>
            </motion.div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-orange-100 p-3 flex-shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Input
              value={newMsg}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Ketik pesan..."
              className="pr-10 rounded-xl border-orange-200 focus:border-orange-400 text-sm"
              disabled={sending}
            />
            <Smile className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          </div>
          <Button
            onClick={handleSend}
            disabled={!newMsg.trim() || sending}
            className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-3 h-10 w-10 flex items-center justify-center flex-shrink-0 shadow-md"
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────── ADMIN CHAT PANEL (inside Profile) ─────────────────────── */
function AdminChatPanel() {
  const { user, setPage, addToast, setUnreadChats } = useAppStore()
  const [rooms, setRooms] = useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { socket, connected, sendMessage, emitTyping, emitStopTyping } = useChatSocket(selectedRoom, user?.id || '', 'admin')

  // Load rooms
  useEffect(() => {
    if (!user?.id) return
    ;(async () => {
      try {
        const res = await fetch(`/api/chat/rooms?userId=${user.id}&role=admin`)
        const data = await res.json()
        const list = Array.isArray(data) ? data : []
        setRooms(list)
        const totalUnread = list.reduce((s: number, r: any) => s + (r.unreadAdmin || 0), 0)
        setUnreadChats(totalUnread)
        // Auto-select first room
        if (list.length > 0 && !selectedRoom) {
          setSelectedRoom(list[0].id)
        }
      } catch {
        addToast('Gagal memuat chat', 'error')
      } finally {
        setLoading(false)
      }
    })()
  }, [user, addToast, setUnreadChats])

  // Load messages when room changes
  useEffect(() => {
    if (!selectedRoom) return
    setMessages([])
    ;(async () => {
      try {
        const res = await fetch(`/api/chat/messages?roomId=${selectedRoom}`)
        const data = await res.json()
        setMessages(Array.isArray(data) ? data : [])
      } catch { /* ignore */ }
    })()
  }, [selectedRoom])

  // REST polling for new messages when socket is not connected
  useEffect(() => {
    if (!selectedRoom || connected) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/messages?roomId=${selectedRoom}`)
        const data = await res.json()
        if (Array.isArray(data)) {
          setMessages((prev) => {
            if (data.length > prev.length) {
              setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
              return data
            }
            return prev
          })
        }
      } catch { /* ignore */ }
    }, 3000)
    return () => clearInterval(interval)
  }, [selectedRoom, connected])

  // REST polling for rooms list when socket is not connected (admin)
  useEffect(() => {
    if (connected) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/rooms?userId=${user?.id}&role=admin`)
        const data = await res.json()
        if (Array.isArray(data)) {
          setRooms(data)
        }
      } catch { /* ignore */ }
    }, 5000)
    return () => clearInterval(interval)
  }, [connected, user?.id])

  // Sync unread count from rooms state
  useEffect(() => {
    const total = rooms.reduce((s: number, r: any) => s + (r.unreadAdmin || 0), 0)
    setUnreadChats(total)
  }, [rooms, setUnreadChats])

  // Mark as read
  useEffect(() => {
    if (!selectedRoom) return
    fetch('/api/chat/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: selectedRoom, role: 'admin' }),
    }).then(() => {
      setRooms((prev) => prev.map((r) => r.id === selectedRoom ? { ...r, unreadAdmin: 0 } : r))
    }).catch(() => {})
  }, [selectedRoom])

  // Listen for new messages
  useEffect(() => {
    if (!socket.current) return
    const s = socket.current

    const handleNewMessage = (msg: any) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
      // Update room list (last message, unread)
      setRooms((prev) =>
        prev.map((r) =>
          r.id === msg.roomId
            ? { ...r, lastMessage: msg.content.slice(0, 100), lastMessageAt: msg.createdAt, unreadAdmin: msg.senderRole === 'customer' ? (r.unreadAdmin || 0) + 1 : r.unreadAdmin }
            : r
        )
      )
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }

    const handleRead = () => {
      setMessages((prev) => prev.map((m) => ({ ...m, read: true })))
    }

    const handleTyping = (data: { name: string }) => {
      setTypingUser(data.name)
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(() => setTypingUser(null), 2000)
    }

    const handleStopTyping = () => setTypingUser(null)

    s.on('new-message', handleNewMessage)
    s.on('messages-read', handleRead)
    s.on('user-typing', handleTyping)
    s.on('user-stop-typing', handleStopTyping)

    return () => {
      s.off('new-message', handleNewMessage)
      s.off('messages-read', handleRead)
      s.off('user-typing', handleTyping)
      s.off('user-stop-typing', handleStopTyping)
    }
  }, [socket, selectedRoom, setUnreadChats])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedRoom || !user || sending) return
    const content = newMsg.trim()
    setNewMsg('')
    emitStopTyping({ roomId: selectedRoom, userId: user.id })
    setSending(true)
    try {
      // Always use REST as primary — more reliable
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: selectedRoom, senderId: user.id, senderName: user.name, senderRole: 'admin', content }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        addToast(err.error || 'Gagal mengirim pesan', 'error')
        return
      }
      const data = await res.json()
      if (data.id) {
        setMessages((prev) => [...prev, data])
      }
      // Update room last message
      setRooms((prev) => prev.map((r) =>
        r.id === selectedRoom ? { ...r, lastMessage: content.slice(0, 100) } : r
      ))
    } catch {
      addToast('Gagal mengirim pesan', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleInputChange = (val: string) => {
    setNewMsg(val)
    if (selectedRoom && user) {
      if (val.trim()) {
        emitTyping({ roomId: selectedRoom, userId: user.id, name: user.name })
      } else {
        emitStopTyping({ roomId: selectedRoom, userId: user.id })
      }
    }
  }

  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-md">
        <Skeleton className="w-32 h-5 mb-4" />
        <Skeleton className="w-full h-48" />
      </div>
    )
  }

  const currentRoom = rooms.find((r) => r.id === selectedRoom)

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden" style={{ height: '70vh' }}>
      <div className="flex h-full">
        {/* Room list (sidebar) */}
        <div className={`border-r border-orange-100 flex flex-col ${selectedRoom ? 'hidden sm:flex w-64' : 'w-full'} flex-shrink-0`}>
          <div className="px-4 py-3 border-b border-orange-100 bg-orange-50/50">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-orange-500" />
              Chat Pelanggan
              {rooms.length > 0 && (
                <Badge className="bg-orange-500 text-white text-[10px] border-0 ml-auto">{rooms.length}</Badge>
              )}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <MessageCircle className="w-8 h-8 opacity-30 mb-2" />
                <p className="text-xs">Belum ada chat</p>
              </div>
            ) : (
              rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-orange-50/50 transition-colors ${
                    selectedRoom === room.id ? 'bg-orange-50 border-l-2 border-l-orange-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {room.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-800 truncate">{room.customerName}</p>
                        {room.unreadAdmin > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 flex-shrink-0">
                            {room.unreadAdmin}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {room.lastMessage || 'Belum ada pesan'}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        {selectedRoom && currentRoom ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-orange-100 flex items-center gap-3 bg-orange-50/30">
              <button onClick={() => setSelectedRoom(null)} className="sm:hidden p-1 text-gray-400 hover:text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {currentRoom.customerName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-sm truncate">{currentRoom.customerName}</h4>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-gray-300'}`} />
                  <span className="text-[10px] text-gray-400">
                    {typingUser ? `${typingUser} sedang mengetik...` : connected ? 'Online' : 'Menghubungkan...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 px-4 py-3 space-y-2" style={{ scrollbarWidth: 'thin' }}>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                  <MessageCircle className="w-10 h-10 opacity-30" />
                  <p className="text-xs">Belum ada pesan</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.senderRole === 'admin'
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[80%]">
                      {!isMe && (
                        <p className="text-[10px] text-gray-400 mb-0.5 ml-1">{msg.senderName}</p>
                      )}
                      <div className={`rounded-2xl px-3 py-2 shadow-sm ${
                        isMe
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-md'
                          : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      <p className={`text-[10px] text-gray-400 mt-0.5 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                        {fmtTime(msg.createdAt)}
                        {isMe && msg.read && ' ✓✓'}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-2.5 border-t border-orange-100 flex-shrink-0">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={newMsg}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder="Ketik balasan..."
                    className="pr-10 rounded-xl border-orange-200 focus:border-orange-400 text-sm"
                    disabled={sending}
                  />
                  <Smile className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!newMsg.trim() || sending}
                  className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-3 h-9 w-9 flex items-center justify-center flex-shrink-0"
                >
                  {sending ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : !selectedRoom && (
          <div className="hidden sm:flex flex-1 items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 opacity-20 mx-auto mb-3" />
              <p className="text-sm font-medium">Pilih pelanggan untuk memulai chat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────── ORDER NOTIFICATION POPUP (Admin) ─────────────────────── */
function OrderNotificationPopup() {
  const user = useAppStore((s) => s.user)
  const isAdmin = user?.role === 'admin'
  const [popupQueue, setPopupQueue] = useState<OrderData[]>([])
  const [currentPopup, setCurrentPopup] = useState<OrderData | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const knownOrderIds = useRef<Set<string>>(new Set())
  const hasInitialLoaded = useRef(false)

  // Poll orders every 8 seconds
  useEffect(() => {
    if (!isAdmin) return
    const poll = async () => {
      try {
        const res = await fetch('/api/orders')
        const data: OrderData[] = await res.json()
        if (!Array.isArray(data)) return

        if (!hasInitialLoaded.current) {
          // First load: mark all existing pending orders as "known"
          data.forEach((o) => knownOrderIds.current.add(o.id))
          hasInitialLoaded.current = true
          return
        }

        // Detect new orders
        const newOrders = data.filter(
          (o) => !knownOrderIds.current.has(o.id) && o.status === 'pending'
        )
        if (newOrders.length > 0) {
          newOrders.forEach((o) => knownOrderIds.current.add(o.id))
          playNotifSound()
          setPopupQueue((prev) => [...prev, ...newOrders])
        }
      } catch { /* silent */ }
    }

    poll()
    const interval = setInterval(poll, 8000)
    return () => clearInterval(interval)
  }, [isAdmin])

  // Process queue
  useEffect(() => {
    if (!currentPopup && popupQueue.length > 0) {
      setCurrentPopup(popupQueue[0])
      setPopupQueue((prev) => prev.slice(1))
    }
  }, [currentPopup, popupQueue])

  // Repeat sound every 5 seconds while popup is visible (until admin responds)
  useEffect(() => {
    if (!currentPopup) return
    playNotifSound()
    const repeatSound = setInterval(() => {
      playNotifSound()
    }, 5000)
    return () => clearInterval(repeatSound)
  }, [currentPopup])

  const handleAction = async (orderId: string, status: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      if (data.pointsInfo?.awarded) {
        useAppStore.getState().addToast(`Pesanan selesai! +${data.pointsInfo.points} poin untuk pelanggan`, 'success')
      }
      setCurrentPopup(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengupdate status'
      useAppStore.getState().addToast(msg, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleGoToOrders = () => {
    setCurrentPopup(null)
    useAppStore.getState().setPage('profile')
    // Navigate to admin tab — we need to trigger a custom event
    window.dispatchEvent(new CustomEvent('admin-goto-orders'))
  }

  if (!currentPopup) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop — not dismissible */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 30 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header — white background */}
        <div className="bg-white border-b border-gray-100 p-4 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center animate-pulse">
                <BellRing className="w-6 h-6 text-orange-500" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base text-gray-800">Pesanan Baru!</h3>
              <p className="text-xs text-gray-400">Menunggu tindakan Anda</p>
            </div>
            <div className="flex items-center gap-1 text-xs bg-orange-100 text-orange-600 rounded-full px-2.5 py-1 font-medium">
              <Volume2 className="w-3 h-3" />
              {popupQueue.length > 0 ? `+${popupQueue.length} lagi` : 'Baru saja'}
            </div>
          </div>
        </div>

        {/* Order details */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400">#{currentPopup.id.slice(-6)}</span>
            <Badge className="bg-yellow-100 text-yellow-800 text-xs">{statusLabel[currentPopup.status]}</Badge>
          </div>

          <div className="flex items-center gap-3 bg-orange-50 rounded-xl p-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{currentPopup.customerName}</p>
              <p className="text-xs text-gray-500">
                <Phone className="w-3 h-3 inline mr-0.5" />{currentPopup.customerPhone}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-600">Item Pesanan:</p>
            <div className="max-h-32 overflow-y-auto card-scrollbar space-y-1">
              {currentPopup.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-1.5">
                  <span className="truncate mr-2">{item.productName} x{item.quantity}</span>
                  <span className="flex-shrink-0 font-medium">{fmt(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
            <div className="text-xs text-gray-400">
              <MapPin className="w-3 h-3 inline mr-0.5" />
              <span className="truncate max-w-[200px] inline-block align-bottom">{currentPopup.customerAddress}</span>
            </div>
          </div>

          {currentPopup.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <p className="text-xs text-amber-700">
                <Bell className="w-3 h-3 inline mr-1" />
                <strong>Catatan:</strong> {currentPopup.notes}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <span className="text-sm text-gray-500">Total Pembayaran</span>
            <span className="text-lg font-extrabold text-orange-600">{fmt(currentPopup.total)}</span>
          </div>
        </div>

        {/* Action buttons — NOT dismissible without action */}
        <div className="p-4 pt-0 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold"
              onClick={() => handleAction(currentPopup.id, 'confirmed')}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-1" /> Konfirmasi</>
              )}
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold"
              onClick={() => handleAction(currentPopup.id, 'preparing')}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Clock className="w-4 h-4 mr-1" /> Proses Langsung</>
              )}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 text-sm"
              onClick={handleGoToOrders}
            >
              <LayoutDashboard className="w-4 h-4 mr-1" /> Lihat Semua
            </Button>
            <Button
              variant="outline"
              className="border-red-200 text-red-500 hover:bg-red-50 text-sm"
              onClick={() => handleAction(currentPopup.id, 'cancelled')}
              disabled={actionLoading}
            >
              <XCircle className="w-4 h-4 mr-1" /> Tolak
            </Button>
          </div>
          {popupQueue.length > 0 && (
            <p className="text-center text-xs text-gray-400">
              {popupQueue.length} pesanan lain menunggu di antrian
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

/* ─────────────────────── ERROR BOUNDARY ─────────────────────── */
interface EBState { hasError: boolean; error: Error | null }
class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { hasError: false, error: null }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('ErrorBoundary:', error, info.componentStack) }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-orange-500 p-6 text-center">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="font-bold text-lg text-gray-800 mb-2">Terjadi Kesalahan</h2>
            <p className="text-sm text-gray-500 mb-4 break-all">{this.state.error?.message || 'Error tidak diketahui'}</p>
            <Button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              Muat Ulang Halaman
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

/* ─────────────────────── MAIN APP ─────────────────────── */
export default function AppPage() {
  const currentPage = useAppStore((s) => s.currentPage)
  const user = useAppStore((s) => s.user)
  const logout = useAppStore((s) => s.logout)
  const addToast = useAppStore((s) => s.addToast)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

  useEffect(() => {
    useAppStore.persist.rehydrate()
  }, [])

  // Validate user session after hydration
  useEffect(() => {
    if (!mounted || !user) return
    fetch(`/api/auth/profile?userId=${encodeURIComponent(user.id)}`)
      .then((res) => {
        if (!res.ok) {
          // User no longer exists in DB — clear session
          logout()
          addToast('Sesi Anda telah berakhir. Silakan login kembali.', 'info')
        }
      })
      .catch(() => {})
  }, [mounted, user, logout, addToast])

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-orange-500">
        <div className="fixed inset-0 aceh-pattern opacity-[0.03] pointer-events-none z-0" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <header className="sticky top-0 z-50"><div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 h-14" /></header>
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full bg-white/20" />
              <Skeleton className="w-40 h-4 bg-white/20" />
            </div>
          </main>
          <nav className="fixed bottom-0 left-0 right-0 z-50"><div className="bg-white border-t h-16" /></nav>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />
      case 'menu': return <MenuPage />
      case 'cart': return <CartPage />
      case 'orders': return <OrdersPage />
      case 'login': return <LoginPage />
      case 'register': return <RegisterPage />
      case 'profile': return <ProfilePage />
      case 'receipt': return <ReceiptPage />
      default: return <HomePage />
    }
  }

  return (
    <ErrorBoundary>
    <div className="min-h-screen flex flex-col bg-orange-500">
      <div className="fixed inset-0 aceh-pattern opacity-[0.03] pointer-events-none z-0" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 pb-24">
          <AnimatePresence mode="wait">
            <motion.div key={currentPage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
        <BottomNav />
      </div>
      <ToastContainer />
      <OrderNotificationPopup />
    </div>
    </ErrorBoundary>
  )
}