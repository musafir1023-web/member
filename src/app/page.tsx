'use client'

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, type CartItem, type OrderData, type Page } from '@/lib/store'
import { Button } from '@/components/ui/button'
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
  Copy,
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
  MessageCircle,
  Send,
  Smile,
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
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabel: Record<string, string> = {
  pending: 'Menunggu',
  confirmed: 'Dikonfirmasi',
  preparing: 'Diproses',
  delivered: 'Selesai',
  cancelled: 'Dibatalkan',
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

        {/* ═══ Info Detail Panel (Dropdown) ═══ */}
        <AnimatePresence>
          {showInfo && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-[-1]"
                onClick={() => setShowInfo(false)}
              />
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="bg-white shadow-xl border-b border-orange-100">
                  <div className="max-w-5xl mx-auto px-4 py-4">
                    {/* Aceh ornament top divider */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300/50 to-transparent" />
                      <svg className="w-3.5 h-3.5 text-orange-400/40" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1 L13 7 L7 13 L1 7 Z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.15" />
                      </svg>
                      <span className="text-[10px] text-orange-400 font-semibold uppercase tracking-widest">Informasi Toko</span>
                      <svg className="w-3.5 h-3.5 text-orange-400/40" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1 L13 7 L7 13 L1 7 Z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.15" />
                      </svg>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300/50 to-transparent" />
                    </div>

                    <div className="space-y-3">
                      {/* Status */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          storeStatus.open ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <Clock className={`w-5 h-5 ${storeStatus.open ? 'text-green-600' : 'text-red-500'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{storeStatus.label}</p>
                          <p className="text-xs text-gray-500">{STORE_INFO.hours} {STORE_INFO.timezone} · Setiap Hari</p>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800">Alamat</p>
                          <p className="text-xs text-gray-500 leading-relaxed">{STORE_INFO.address}</p>
                        </div>
                      </div>

                      {/* Phone */}
                      <a
                        href={`tel:${STORE_INFO.phone}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">Telepon</p>
                          <p className="text-xs text-gray-500">{STORE_INFO.phone}</p>
                        </div>
                      </a>

                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/${STORE_INFO.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">WhatsApp</p>
                          <p className="text-xs text-gray-500">{STORE_INFO.phone}</p>
                        </div>
                      </a>

                      {/* Share */}
                      <button
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
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors w-full"
                      >
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <Share2 className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-800">Bagikan</p>
                          <p className="text-xs text-gray-500">Salin info toko ke clipboard</p>
                        </div>
                      </button>
                    </div>

                    {/* Close button */}
                    <button
                      onClick={() => setShowInfo(false)}
                      className="mt-3 w-full py-2 text-center text-sm font-semibold text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl transition-colors"
                    >
                      Tutup
                    </button>
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
  const [products, setProducts] = useState<HomeProduct[]>([])
  const [promoProducts, setPromoProducts] = useState<HomeProduct[]>([])
  const [activeTab, setActiveTab] = useState<'terbaru' | 'terlaris' | 'promo'>('terbaru')
  const [loading, setLoading] = useState(true)
  const [showBarcode, setShowBarcode] = useState(false)
  const barcodeRef = useRef<SVGSVGElement>(null)
  const [showcaseFlipped, setShowcaseFlipped] = useState(false)
  const showcaseBarcodeRef = useRef<SVGSVGElement>(null)

  const memberCode = user ? `AGSI-${user.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)}` : ''

  // Generate barcode when back side is visible
  useEffect(() => {
    if (showBarcode && barcodeRef.current && memberCode) {
      try {
        JsBarcode(barcodeRef.current, memberCode, {
          format: 'CODE128',
          width: 1.5,
          height: 44,
          displayValue: true,
          font: 'monospace',
          fontSize: 11,
          textMargin: 4,
          margin: 0,
          background: 'transparent',
          lineColor: '#ea580c',
        })
      } catch {}
    }
  }, [showBarcode, memberCode])

  // Auto-flip showcase card
  useEffect(() => {
    const timer = setInterval(() => setShowcaseFlipped(f => !f), 6000)
    return () => clearInterval(timer)
  }, [])

  // Generate showcase barcode
  useEffect(() => {
    if (showcaseFlipped && showcaseBarcodeRef.current) {
      try {
        JsBarcode(showcaseBarcodeRef.current, 'AGSI-BATIK2025', {
          format: 'CODE128', width: 1.5, height: 40, displayValue: true, font: 'monospace', fontSize: 10, textMargin: 3, margin: 0, background: 'transparent', lineColor: '#ea580c',
        })
      } catch {}
    }
  }, [showcaseFlipped])

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
    }
  }, [user?.id])

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/products?tag=promo').then((r) => r.json()),
    ])
      .then(([all, promo]) => {
        setProducts(Array.isArray(all) ? all : [])
        setPromoProducts(Array.isArray(promo) ? promo : [])
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

  const filteredProducts = products.filter((p) => p.tag === activeTab)

  const tabItems = [
    { id: 'terbaru' as const, label: 'Terbaru', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'terlaris' as const, label: 'Terlaris', icon: <Flame className="w-4 h-4" /> },
    { id: 'promo' as const, label: 'Promo', icon: <Percent className="w-4 h-4" /> },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400">
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
                 MEMBER CARD — Batik Parang Edition
                 ═══════════════════════════════════════════════════ */}
            {user && user.role !== 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.9, delay: 0.3, type: 'spring', stiffness: 120, damping: 14 }}
                className="mt-8 mx-auto w-full"
                style={{ maxWidth: 400, perspective: 1500 }}
              >
                {/* White firefly particles */}
                <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 30 }}>
                  {[{ left: '5%', delay: 0, dur: 4.2, size: 3 }, { left: '18%', delay: 1.1, dur: 3.5, size: 2.5 }, { left: '32%', delay: 0.5, dur: 4.8, size: 2 }, { left: '48%', delay: 2.0, dur: 3.8, size: 3 }, { left: '62%', delay: 0.8, dur: 4.0, size: 2.5 }, { left: '75%', delay: 1.6, dur: 3.2, size: 2 }, { left: '88%', delay: 0.3, dur: 4.5, size: 2.5 }].map((p, i) => (
                    <div key={i} className="absolute bottom-0 rounded-full" style={{ left: p.left, width: p.size, height: p.size, background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(254,243,199,0.6) 40%, transparent 100%)', animation: `batik-particle ${p.dur}s ease-in-out ${p.delay}s infinite`, boxShadow: '0 0 8px 2px rgba(255,255,255,0.5)' }} />
                  ))}
                </div>

                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="relative w-full cursor-pointer" style={{ perspective: 1200 }} onClick={() => setShowBarcode(!showBarcode)}>
                  <div className="absolute -inset-[2px] rounded-2xl overflow-hidden">
                    <div className="absolute inset-[-100%]" style={{ animation: 'showcase-border-rotate 20s linear infinite', background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.7) 6%, transparent 12%, rgba(254,243,199,0.5) 18%, transparent 24%, rgba(255,255,255,0.6) 30%, transparent 36%)', filter: 'blur(1.5px)' }} />
                  </div>
                  <div className="absolute -inset-8 rounded-3xl pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.3) 0%, rgba(234,88,12,0.15) 50%, transparent 70%)', animation: 'batik-pulse-ring 4s ease-in-out infinite', top: '50%', left: '50%' }} />

                  <div className="relative w-full" style={{ transformStyle: 'preserve-3d', transform: showBarcode ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                    {/* ═══ FRONT FACE ═══ */}
                    <div className="absolute inset-0 rounded-2xl shadow-2xl border border-white/15 overflow-hidden" style={{ backfaceVisibility: 'hidden', background: 'linear-gradient(135deg, #7C2D12 0%, #C2410C 15%, #EA580C 30%, #F97316 50%, #FB923C 65%, #EA580C 80%, #C2410C 90%, #7C2D12 100%)' }}>
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, #7C2D12, #C2410C, #EA580C, #F97316, #FB923C, #F97316, #C2410C, #7C2D12)', opacity: 0.5, backgroundSize: '400% 400%', animation: 'batik-parang-flow 14s ease-in-out infinite' }} />
                      <div className="batik-shine-sweep" />
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: 0.06 }}>
                        <rect width="100" height="100" fill="url(#batik-parang)" />
                      </svg>
                      <div className="absolute top-[52px] left-0 right-0 h-px batik-tepian-top opacity-40" />
                      <div className="absolute bottom-[44px] left-0 right-0 h-px batik-tepian-bottom opacity-30" style={{ animationDelay: '2.5s' }} />
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 252" fill="none" preserveAspectRatio="none">
                        <rect x="5" y="5" width="390" height="242" rx="15" stroke="white" strokeWidth="0.7" strokeOpacity="0.2" />
                        <rect x="10" y="10" width="380" height="232" rx="12" stroke="white" strokeWidth="0.3" strokeOpacity="0.12" strokeDasharray="6 4" style={{ animation: 'batik-border-dash 8s linear infinite' }} />
                        <rect x="15" y="15" width="370" height="222" rx="9" stroke="white" strokeWidth="0.15" strokeOpacity="0.08" />
                      </svg>
                      {['top-1 left-1', 'top-1 right-1', 'bottom-1 left-1', 'bottom-1 right-1'].map((pos, i) => (
                        <svg key={i} className={`absolute ${pos} w-20 h-20 text-white/[0.12]`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" style={{ animation: `batik-kawung-bloom 6s ease-in-out ${i * 1.3}s infinite` }}>
                          {[0, 72, 144, 216, 288].map((a, j) => (<ellipse key={j} cx="50" cy="22" rx="11" ry="18" transform={`rotate(${a},50,50)`} fill="currentColor" fillOpacity="0.025" />))}
                          <circle cx="50" cy="50" r="5" fill="currentColor" fillOpacity="0.06" />
                          <circle cx="50" cy="50" r="2.5" fill="white" fillOpacity="0.12" />
                        </svg>
                      ))}
                      <svg className="absolute top-1/2 left-1/2 pointer-events-none" style={{ width: 220, height: 220, transform: 'translate(-50%,-50%)', animation: 'batik-mega-glow 5s ease-in-out infinite' }} viewBox="0 0 200 200" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" strokeLinecap="round">
                        <path d="M40,120 C40,95 55,75 75,60 C90,48 115,42 130,42 C150,42 170,50 180,65 C188,78 185,95 185,110 C185,125 178,140 165,148 C150,155 125,158 110,158 C95,158 75,150 65,145 C55,140 45,132 40,125 Z" fill="rgba(255,255,255,0.02)" />
                      </svg>
                      {[{ top: '10%', left: '15%', delay: 0, s: 10 }, { top: '22%', left: '85%', delay: 1.5, s: 8 }, { top: '62%', left: '10%', delay: 2.8, s: 9 }, { top: '78%', left: '88%', delay: 0.7, s: 7 }, { top: '40%', left: '52%', delay: 2.0, s: 6 }, { top: '85%', left: '35%', delay: 1.2, s: 8 }].map((sp, i) => (
                        <div key={i} className="absolute" style={{ top: sp.top, left: sp.left, animation: `aceh-sparkle 3.5s ease-in-out ${sp.delay}s infinite` }}>
                          <svg width={sp.s} height={sp.s} viewBox="0 0 10 10" fill="none"><path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="rgba(255,255,255,0.6)" /></svg>
                        </div>
                      ))}
                      <div className="relative z-10 flex flex-col h-full px-5 pt-4 pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <motion.div animate={{ rotate: [0, 5, -5, 3, -3, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/25 shadow-lg shadow-orange-900/20">
                              <Crown className="w-5 h-5 text-white" />
                            </motion.div>
                            <div>
                              <p className="text-[7px] text-white/50 font-bold uppercase tracking-[0.25em] leading-none">Member Card</p>
                              <p className="text-white font-extrabold text-sm sm:text-base truncate max-w-[140px] leading-tight mt-1 batik-text-glow">{user.name}</p>
                            </div>
                          </div>
                          <motion.div animate={{ scale: [1, 1.08, 1], boxShadow: ['0 0 0 0 rgba(255,255,255,0)', '0 0 18px 4px rgba(255,255,255,0.25)', '0 0 0 0 rgba(255,255,255,0)'] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} className="bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/25">
                            <span className="text-[9px] text-white font-extrabold uppercase tracking-wider">Exclusive</span>
                          </motion.div>
                        </div>
                        <div className="flex items-center gap-2 my-2.5">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                          <svg className="w-3 h-3 text-white/40" viewBox="0 0 16 16" fill="none"><path d="M8 1 L15 8 L8 15 L1 8 Z" stroke="currentColor" strokeWidth="0.8" fill="currentColor" fillOpacity="0.15" /><circle cx="8" cy="8" r="2" fill="currentColor" fillOpacity="0.3" /></svg>
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        </div>
                        <div className="flex-1 flex items-end gap-3">
                          <motion.div whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.97 }} className="flex-1 bg-white/[0.12] backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 hover:border-white/35 transition-colors">
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}><Star className="w-3.5 h-3.5 text-white" /></motion.div>
                              <span className="text-[8px] text-white/70 font-bold uppercase tracking-wider">Poin</span>
                            </div>
                            <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.8, type: 'spring', stiffness: 200 }} className="text-white font-extrabold text-xl leading-none">{user.points ?? 0}</motion.p>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.97 }} className="flex-1 bg-white/[0.12] backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 hover:border-white/35 transition-colors">
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                              <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}><Gift className="w-3.5 h-3.5 text-white" /></motion.div>
                              <span className="text-[8px] text-white/70 font-bold uppercase tracking-wider">Voucher</span>
                            </div>
                            <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.9, type: 'spring', stiffness: 200 }} className="text-white font-extrabold text-xl leading-none">{user.voucher ?? 0}</motion.p>
                          </motion.div>
                        </div>
                        <motion.p animate={{ opacity: [0.15, 0.5, 0.15] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} className="text-center text-[7px] text-white/25 font-medium mt-2 tracking-wide">✦ Ketuk untuk melihat barcode ✦</motion.p>
                      </div>
                    </div>
                    {/* ═══ BACK FACE (Barcode) ═══ */}
                    <div className="absolute inset-0 rounded-2xl shadow-2xl border border-white/15 overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg, #7C2D12 0%, #C2410C 15%, #EA580C 30%, #F97316 50%, #FB923C 65%, #EA580C 80%, #C2410C 90%, #7C2D12 100%)' }}>
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, #7C2D12, #C2410C, #EA580C, #F97316, #FB923C, #F97316, #C2410C, #7C2D12)', opacity: 0.5, backgroundSize: '400% 400%', animation: 'batik-parang-flow 14s ease-in-out infinite' }} />
                      <div className="batik-shine-sweep" />
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: 0.04 }}><rect width="100" height="100" fill="url(#batik-parang)" /></svg>
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 252" fill="none" preserveAspectRatio="none">
                        <rect x="5" y="5" width="390" height="242" rx="15" stroke="white" strokeWidth="0.6" strokeOpacity="0.15" /><rect x="10" y="10" width="380" height="232" rx="12" stroke="white" strokeWidth="0.25" strokeOpacity="0.1" strokeDasharray="6 4" style={{ animation: 'batik-border-dash 8s linear infinite' }} /><rect x="15" y="15" width="370" height="222" rx="9" stroke="white" strokeWidth="0.12" strokeOpacity="0.07" />
                      </svg>
                      {['top-1.5 left-1.5', 'top-1.5 right-1.5', 'bottom-1.5 left-1.5', 'bottom-1.5 right-1.5'].map((pos, i) => (
                        <svg key={i} className={`absolute ${pos} w-14 h-14 text-white/[0.08]`} viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="0.3" strokeLinecap="round">
                          {[0, 60, 120, 180, 240, 300].map((a, j) => (<ellipse key={j} cx="30" cy="12" rx="6" ry="11" transform={`rotate(${a + i * 15},30,30)`} fill="currentColor" fillOpacity="0.02" />))}
                          <circle cx="30" cy="30" r="3" fill="currentColor" fillOpacity="0.04" />
                        </svg>
                      ))}
                      <svg className="absolute top-1/2 left-1/2 pointer-events-none" style={{ width: 160, height: 160, transform: 'translate(-50%,-50%)', animation: 'batik-mega-glow 6s ease-in-out infinite' }} viewBox="0 0 200 200" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" strokeLinecap="round"><circle cx="100" cy="100" r="90" strokeDasharray="3 6" /><circle cx="100" cy="100" r="65" /><circle cx="100" cy="100" r="40" /><path d="M100,30 L106,85 L155,60 L115,100 L155,140 L106,115 L100,170 L94,115 L45,140 L85,100 L45,60 L94,85 Z" fill="rgba(255,255,255,0.005)" /></svg>
                      <div className="absolute bottom-[40px] left-0 right-0 h-px batik-tepian-bottom opacity-30" />
                      <div className="relative z-10 flex flex-col h-full px-5 pt-4 pb-3">
                        <div className="flex items-center gap-2.5 mb-2"><motion.div animate={{ rotate: [0, -4, 4, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20"><Crown className="w-4 h-4 text-white" /></motion.div><div className="text-left"><p className="text-[7px] text-white/50 font-bold uppercase tracking-[0.25em] leading-none">Member Card</p><p className="text-white font-bold text-xs truncate max-w-[130px] leading-tight mt-0.5">{user.name}</p></div></div>
                        <div className="flex items-center gap-2 mb-2.5"><div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" /><svg className="w-2.5 h-2.5 text-white/30" viewBox="0 0 16 16" fill="none"><path d="M8 1 L15 8 L8 15 L1 8 Z" stroke="currentColor" strokeWidth="0.8" fill="currentColor" fillOpacity="0.15" /></svg><div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" /></div>
                        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, type: 'spring', stiffness: 200 }} className="flex-1 bg-white/[0.1] backdrop-blur-sm rounded-xl p-3 flex flex-col items-center justify-center min-h-0 border border-white/20 shadow-inner"><svg ref={barcodeRef} className="w-full h-full" style={{ minHeight: 40 }} /></motion.div>
                        <div className="flex items-center justify-between mt-2"><p className="text-[8px] text-white/50 font-mono tracking-[0.2em] font-semibold">{memberCode}</p><motion.p animate={{ opacity: [0.15, 0.5, 0.15] }} transition={{ duration: 3, repeat: Infinity }} className="text-[7px] text-white/30 font-medium">✦ Ketuk untuk kembali ✦</motion.p></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ═════════════════════════════════════════════════
                 SHOWCASE MEMBER CARD — Batik Premium Edition
                 ═══════════════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, scale: 0.82, y: 35, rotateX: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1.2, delay: 0.2, type: 'spring', stiffness: 100, damping: 14 }}
              className="mt-8 mx-auto w-full relative"
              style={{ maxWidth: 380, perspective: 1200 }}
            >
              {/* Rising particles */}
              <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 30 }}>
                {[{ left: '6%', delay: 0, dur: 4.5, size: 3 }, { left: '20%', delay: 1.4, dur: 3.8, size: 2.5 }, { left: '36%', delay: 0.6, dur: 5.0, size: 2 }, { left: '50%', delay: 2.2, dur: 4.0, size: 3 }, { left: '64%', delay: 0.9, dur: 4.3, size: 2.5 }, { left: '78%', delay: 1.8, dur: 3.5, size: 2 }, { left: '93%', delay: 0.3, dur: 4.8, size: 2.5 }].map((p, i) => (
                  <div key={i} className="absolute bottom-0 rounded-full" style={{ left: p.left, width: p.size, height: p.size, background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(254,243,199,0.5) 40%, transparent 100%)', animation: `batik-particle ${p.dur}s ease-in-out ${p.delay}s infinite`, boxShadow: '0 0 8px 2px rgba(255,255,255,0.5)' }} />
                ))}
              </div>

              {/* Float wrapper (uses CSS translate, not transform, to preserve 3D) */}
              <div className="relative w-full" style={{ animation: 'batik-float 6s ease-in-out infinite' }}>
                {/* 3D context parent */}
                <div className="relative w-full cursor-pointer" style={{ transformStyle: 'preserve-3d' }} onClick={() => setShowcaseFlipped(f => !f)}>
                  {/* Rotating conic glow border */}
                  <div className="absolute -inset-[2px] rounded-2xl overflow-hidden" style={{ zIndex: 0 }}>
                    <div className="absolute inset-[-150%]" style={{ animation: 'showcase-border-rotate 12s linear infinite', background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.8) 4%, transparent 8%, rgba(254,215,170,0.6) 12%, transparent 16%, rgba(255,255,255,0.7) 20%, transparent 24%, rgba(249,115,22,0.4) 28%, transparent 32%)', filter: 'blur(2px)' }} />
                  </div>
                  {/* Pulsing glow */}
                  <div className="absolute -inset-10 rounded-3xl pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.35) 0%, rgba(234,88,12,0.15) 40%, transparent 65%)', animation: 'batik-pulse-ring 5s ease-in-out infinite', top: '50%', left: '50%' }} />

                  {/* 3D flip container */}
                  <div className="relative w-full" style={{ transformStyle: 'preserve-3d', transform: showcaseFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)', minHeight: 230 }}>

                    {/* ═══════════ FRONT FACE ═══════════ */}
                    <div className="relative rounded-2xl shadow-2xl border border-white/20 overflow-hidden" style={{ backfaceVisibility: 'hidden', background: 'linear-gradient(145deg, #7C2D12 0%, #9A3412 12%, #C2410C 28%, #EA580C 45%, #F97316 58%, #FB923C 72%, #EA580C 85%, #C2410C 95%, #7C2D12 100%)' }}>
                      {/* Aurora bg */}
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, #7C2D12, #C2410C, #EA580C, #F97316, #FB923C, #F97316, #C2410C, #7C2D12)', opacity: 0.5, backgroundSize: '400% 400%', animation: 'batik-parang-flow 14s ease-in-out infinite' }} />
                      <div className="batik-shine-sweep" />

                      {/* ── BATIK PARANG (Diagonal Dagger) Pattern ── */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: 0.07 }}>
                        <defs><pattern id="batik-parang" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                          {/* Parang diagonal blades */}
                          <path d="M0,20 L20,0 L40,20 L20,40 Z" fill="none" stroke="white" strokeWidth="0.5" />
                          <path d="M10,10 L30,10 L30,30 L10,30 Z" fill="none" stroke="white" strokeWidth="0.3" />
                          {/* Isen dots (filling) */}
                          <circle cx="10" cy="0" r="1.2" fill="white" fillOpacity="0.3" />
                          <circle cx="30" cy="0" r="1.2" fill="white" fillOpacity="0.3" />
                          <circle cx="0" cy="10" r="1" fill="white" fillOpacity="0.2" />
                          <circle cx="20" cy="10" r="1" fill="white" fillOpacity="0.2" />
                          <circle cx="40" cy="10" r="1" fill="white" fillOpacity="0.2" />
                          <circle cx="10" cy="20" r="1" fill="white" fillOpacity="0.2" />
                          <circle cx="30" cy="20" r="1" fill="white" fillOpacity="0.2" />
                          <circle cx="20" cy="30" r="1" fill="white" fillOpacity="0.2" />
                          <circle cx="0" cy="40" r="1.2" fill="white" fillOpacity="0.3" />
                          <circle cx="40" cy="40" r="1.2" fill="white" fillOpacity="0.3" />
                          {/* Isen tiny curves */}
                          <path d="M5,5 Q8,3 10,5 Q12,7 15,5" fill="none" stroke="white" strokeWidth="0.2" />
                          <path d="M25,15 Q28,13 30,15 Q34,17 39,15" fill="none" stroke="white" strokeWidth="0.2" />
                          <path d="M5,25 Q8,23 10,25 Q12,27 15,25" fill="none" stroke="white" strokeWidth="0.2" />
                          <path d="M25,35 Q28,33 30,35 Q34,37 39,35" fill="none" stroke="white" strokeWidth="0.2" />
                        </pattern></defs>
                        <rect width="100" height="100" fill="url(#batik-parang)" />
                      </svg>

                      {/* ── BATIK KAWUNG (Palm Fruit) Corner Ornaments ── */}
                      {[
                        { pos: 'top-1 left-1', size: 'w-20 h-20', angles: [0, 72, 144, 216, 288], op: 0.12, petalRx: 11, petalRy: 18, cxR: 5 },
                        { pos: 'top-1 right-1', size: 'w-20 h-20', angles: [36, 108, 180, 252, 324], op: 0.12, petalRx: 11, petalRy: 18, cxR: 5 },
                        { pos: 'bottom-1 left-1', size: 'w-16 h-16', angles: [15, 87, 159, 231, 303], op: 0.10, petalRx: 9, petalRy: 15, cxR: 4 },
                        { pos: 'bottom-1 right-1', size: 'w-16 h-16', angles: [50, 122, 194, 266, 338], op: 0.10, petalRx: 9, petalRy: 15, cxR: 4 },
                      ].map((c, i) => (
                        <svg key={i} className={`absolute ${c.pos} ${c.size} text-white/[${c.op}]`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" style={{ animation: `batik-kawung-bloom 6s ease-in-out ${i * 1.3}s infinite` }}>
                          {c.angles.map((a, j) => (
                            <ellipse key={j} cx="50" cy="22" rx={c.petalRx} ry={c.petalRy} transform={`rotate(${a},50,50)`} fill="currentColor" fillOpacity="0.03" />
                          ))}
                          <circle cx="50" cy="50" r={c.cxR} fill="currentColor" fillOpacity="0.08" />
                          <circle cx="50" cy="50" r={c.cxR * 0.5} fill="white" fillOpacity="0.15" />
                        </svg>
                      ))}

                      {/* ── BATIK TEPIAN (Ornate Wavy Border) ── */}
                      <svg className="absolute top-[54px] left-0 right-0 h-[3px] pointer-events-none" viewBox="0 0 400 4" preserveAspectRatio="none">
                        <defs><pattern id="batik-tepian" x="0" y="0" width="40" height="4" patternUnits="userSpaceOnUse">
                          <path d="M0,2 Q5,0 10,2 Q15,4 20,2 Q30,0 40,2" fill="none" stroke="white" strokeWidth="0.5" />
                          <circle cx="10" cy="2" r="0.8" fill="white" fillOpacity="0.3" />
                          <circle cx="30" cy="2" r="0.8" fill="white" fillOpacity="0.3" />
                        </pattern></defs>
                        <rect width="400" height="4" fill="url(#batik-tepian)" style={{ animation: 'batik-tepian-wave 4s linear infinite' }} />
                      </svg>
                      <svg className="absolute bottom-[40px] left-0 right-0 h-[3px] pointer-events-none" viewBox="0 0 400 4" preserveAspectRatio="none">
                        <rect width="400" height="4" fill="url(#batik-tepian)" style={{ animation: 'batik-tepian-wave 5s linear infinite reverse' }} />
                      </svg>

                      {/* ── Triple ornate border frame ── */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 380 230" fill="none" preserveAspectRatio="none">
                        <rect x="5" y="5" width="370" height="220" rx="16" stroke="white" strokeWidth="0.7" strokeOpacity="0.2" />
                        <rect x="10" y="10" width="360" height="210" rx="12" stroke="white" strokeWidth="0.3" strokeOpacity="0.12" strokeDasharray="5 3" style={{ animation: 'batik-border-dash 8s linear infinite' }} />
                        <rect x="15" y="15" width="350" height="200" rx="9" stroke="white" strokeWidth="0.15" strokeOpacity="0.08" />
                      </svg>

                      {/* ── BATIK MEGA MENDUNG (Cloud) Watermark (center) ── */}
                      <svg className="absolute top-1/2 left-1/2 pointer-events-none" style={{ width: 220, height: 220, transform: 'translate(-50%,-50%)', animation: 'batik-mega-glow 5s ease-in-out infinite' }} viewBox="0 0 200 200" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" strokeLinecap="round">
                        {/* Main cloud shape */}
                        <path d="M40,120 C40,95 55,75 75,60 C90,48 115,42 130,42 C150,42 170,50 180,65 C188,78 185,95 185,110 C185,125 178,140 165,148 C150,155 125,158 110,158 C95,158 75,150 65,145 C55,140 45,128 40,120 Z" fill="rgba(255,255,255,0.03)" />
                        <path d="M50,115 C50,92 62,74 80,60 C93,48 122,42 138,42 C156,42 178,48 190,62 C196,75 200,92 200,108 C200,124 192,140 178,148 C162,156 132,160 118,160 C104,160 75,152 65,148 C55,145 45,132 40,125 C35,118 42,108 50,95 Z" fill="rgba(255,255,255,0.02)" />
                        <path d="M60,110 C60,90 70,74 85,60 C97,48 130,42 145,42 C162,42 188,48 198,62 C204,75 210,90 210,105 C210,120 202,135 188,143 C175,150 158,155 145,155 C132,155 97,148 85,143 C72,140 52,132 45,125 C38,118 42,108 60,95 Z" fill="rgba(255,255,255,0.015)" />
                        {/* Inner cloud */}
                        <path d="M80,105 C80,90 88,78 98,72 C108,62 125,56 138,56 C152,56 175,62 185,75 C190,85 195,98 195,110 C195,122 190,135 185,143 C175,150 160,155 148,155 C136,155 108,148 98,143 C88,140 65,132 58,125" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
                        {/* Cloud detail dots */}
                        <circle cx="65" cy="58" r="1.5" fill="white" fillOpacity="0.06" /><circle cx="135" cy="58" r="1.5" fill="white" fillOpacity="0.06" />
                        <circle cx="50" cy="72" r="1" fill="white" fillOpacity="0.05" /><circle cx="150" cy="72" r="1" fill="white" fillOpacity="0.05" />
                      </svg>

                      {/* ═══ FRONT CONTENT ═══ */}
                      <div className="relative z-10 flex flex-col h-full px-5 pt-4 pb-3.5" style={{ minHeight: 230 }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <motion.div animate={{ rotate: [0, 5, -5, 3, -3, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/25 shadow-lg" style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.2), 0 0 20px rgba(249,115,22,0.15)' }}>
                              <Crown className="w-5 h-5 text-white" />
                            </motion.div>
                            <div>
                              <p className="text-[7px] text-white/50 font-bold uppercase tracking-[0.3em] leading-none">Member Card</p>
                              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8, duration: 0.6 }} className="text-white font-extrabold text-sm sm:text-[15px] truncate max-w-[130px] leading-tight mt-1 batik-text-glow">
                                Ahmad Rizky
                              </motion.p>
                            </div>
                          </div>
                          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="batik-badge-pulse bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/30">
                            <span className="text-[9px] text-white font-extrabold uppercase tracking-wider">Gold</span>
                          </motion.div>
                        </div>

                        <div className="flex items-center gap-2 my-2">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                          <svg className="w-3 h-3 text-white/40" viewBox="0 0 16 16" fill="none">
                            <path d="M8 1 L15 8 L8 15 L1 8 Z" stroke="currentColor" strokeWidth="0.8" fill="currentColor" fillOpacity="0.2" />
                            <circle cx="8" cy="8" r="2" fill="currentColor" fillOpacity="0.35" />
                          </svg>
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        </div>

                        {/* Member Number */}
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.5 }} className="text-center mb-2">
                          <p className="text-[8px] text-white/40 font-medium uppercase tracking-[0.2em] mb-0.5">No. Member</p>
                          <p className="text-white/90 font-mono text-[11px] sm:text-xs font-bold tracking-[0.25em]">AGSI-BATIK2025</p>
                        </motion.div>

                        <div className="flex-1 flex items-end gap-3">
                          <motion.div initial={{ opacity: 0, scale: 0.8, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.6, type: 'spring', stiffness: 180 }} className="flex-1 bg-white/[0.12] backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/20">
                            <div className="flex items-center justify-center gap-1 mb-0.5">
                              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>
                                <Star className="w-3.5 h-3.5 text-amber-300" />
                              </motion.div>
                              <span className="text-[7px] text-white/60 font-bold uppercase tracking-wider">Poin</span>
                            </div>
                            <p className="text-white font-extrabold text-xl leading-none">1.250</p>
                          </motion.div>
                          <motion.div initial={{ opacity: 0, scale: 0.8, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1.4, duration: 0.6, type: 'spring', stiffness: 180 }} className="flex-1 bg-white/[0.12] backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/20">
                            <div className="flex items-center justify-center gap-1 mb-0.5">
                              <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
                                <Gift className="w-3.5 h-3.5 text-amber-300" />
                              </motion.div>
                              <span className="text-[7px] text-white/60 font-bold uppercase tracking-wider">Voucher</span>
                            </div>
                            <p className="text-white font-extrabold text-xl leading-none">3</p>
                          </motion.div>
                        </div>

                        <motion.p animate={{ opacity: [0.1, 0.45, 0.1] }} transition={{ duration: 3, repeat: Infinity, delay: 2 }} className="text-center text-[7px] text-white/25 font-medium mt-1.5 tracking-wide">
                          ✦ Ketuk untuk melihat barcode ✦
                        </motion.p>
                      </div>
                    </div>

                    {/* ═══ BACK FACE (Barcode) ═══ */}
                    <div className="absolute inset-0 rounded-2xl shadow-2xl border border-white/20 overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(145deg, #7C2D12 0%, #9A3412 12%, #C2410C 28%, #EA580C 45%, #F97316 58%, #FB923C 72%, #EA580C 85%, #C2410C 95%, #7C2D12 100%)' }}>
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, #7C2D12, #C2410C, #EA580C, #F97316, #FB923C, #F97316, #C2410C, #7C2D12)', opacity: 0.5, backgroundSize: '400% 400%', animation: 'batik-parang-flow 14s ease-in-out infinite' }} />
                      <div className="batik-shine-sweep" />
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: 0.04 }}>
                        <rect width="100" height="100" fill="url(#batik-parang)" />
                      </svg>
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 380 230" fill="none" preserveAspectRatio="none">
                        <rect x="5" y="5" width="370" height="220" rx="16" stroke="white" strokeWidth="0.6" strokeOpacity="0.18" />
                        <rect x="10" y="10" width="360" height="210" rx="12" stroke="white" strokeWidth="0.25" strokeOpacity="0.12" strokeDasharray="5 3" style={{ animation: 'batik-border-dash 8s linear infinite' }} />
                        <rect x="15" y="15" width="350" height="200" rx="9" stroke="white" strokeWidth="0.12" strokeOpacity="0.07" />
                      </svg>
                      {/* Kawung corners (back) */}
                      {['top-1.5 left-1.5', 'top-1.5 right-1.5', 'bottom-1.5 left-1.5', 'bottom-1.5 right-1.5'].map((pos, i) => (
                        <svg key={i} className={`absolute ${pos} w-12 h-12 text-white/[0.08]`} viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="0.3" strokeLinecap="round">
                          {[0, 60, 120, 180, 240, 300].map((a, j) => (
                            <ellipse key={j} cx="30" cy="12" rx="5" ry="10" transform={`rotate(${a + i * 15},30,30)`} fill="currentColor" fillOpacity="0.02" />
                          ))}
                          <circle cx="30" cy="30" r="3" fill="currentColor" fillOpacity="0.05" />
                        </svg>
                      ))}
                      {/* Mega Mendung watermark (back) */}
                      <svg className="absolute top-1/2 left-1/2 pointer-events-none" style={{ width: 150, height: 150, transform: 'translate(-50%,-50%)', animation: 'batik-mega-glow 6s ease-in-out infinite' }} viewBox="0 0 200 200" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" strokeLinecap="round">
                        <circle cx="100" cy="100" r="90" strokeDasharray="3 6" /><circle cx="100" cy="100" r="65" /><circle cx="100" cy="100" r="40" />
                        <path d="M100,30 L106,85 L155,60 L115,100 L155,140 L106,115 L100,170 L94,115 L45,140 L85,100 L45,60 L94,85 Z" fill="rgba(255,255,255,0.005)" />
                      </svg>
                      <div className="absolute bottom-[42px] left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 80%, transparent 100%)', backgroundSize: '200% 100%', animation: 'batik-tepian-wave 5s linear infinite' }} />
                      {/* ═══ BACK CONTENT ═══ */}
                      <div className="relative z-10 flex flex-col h-full px-5 pt-4 pb-3" style={{ minHeight: 230 }}>
                        <div className="flex items-center gap-2.5 mb-2">
                          <motion.div animate={{ rotate: [0, -4, 4, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                            <Crown className="w-4 h-4 text-white" />
                          </motion.div>
                          <div className="text-left">
                            <p className="text-[7px] text-white/50 font-bold uppercase tracking-[0.25em] leading-none">Member Card</p>
                            <p className="text-white font-bold text-[11px] leading-tight mt-0.5">Ahmad Rizky</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                          <svg className="w-2.5 h-2.5 text-white/30" viewBox="0 0 16 16" fill="none"><path d="M8 1 L15 8 L8 15 L1 8 Z" stroke="currentColor" strokeWidth="0.8" fill="currentColor" fillOpacity="0.15" /></svg>
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                        </div>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, type: 'spring', stiffness: 200 }} className="flex-1 bg-white/[0.1] backdrop-blur-sm rounded-xl p-3 border border-white/20 flex flex-col items-center justify-center">
                          <svg ref={showcaseBarcodeRef} className="w-full" style={{ minHeight: 44 }} />
                        </motion.div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[8px] text-white/45 font-mono tracking-[0.2em] font-semibold">AGSI-BATIK2025</p>
                          <motion.p animate={{ opacity: [0.15, 0.5, 0.15] }} transition={{ duration: 2.5, repeat: Infinity }} className="text-[7px] text-white/25 font-medium">✦ Ketuk untuk kembali ✦</motion.p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

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

      {/* ═══ PROMO BANNER ═══ */}
      <section className="bg-orange-500 py-6 sm:py-8 relative">
        <div className="absolute inset-0 aceh-pattern opacity-30" />
        <div className="relative max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-md">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">Promo Spesial</h2>
              <p className="text-orange-100 text-[10px] sm:text-xs">Penawaran terbatas, jangan sampai ketinggalan!</p>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {loading ? (
              <div className="flex gap-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="w-72 h-40 sm:h-44 rounded-2xl flex-shrink-0" />
                ))}
              </div>
            ) : promoProducts.length === 0 ? (
              <p className="text-orange-100 text-sm">Belum ada promo saat ini</p>
            ) : (
              promoProducts.map((p, i) => {
                const disc = getDiscount(p)
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex-shrink-0 w-72 sm:w-80 bg-white rounded-2xl shadow-xl overflow-hidden relative group cursor-pointer"
                    onClick={() => handleAdd(p)}
                  >
                    {/* Discount Badge */}
                    {disc > 0 && (
                      <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] sm:text-xs font-extrabold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <Flame className="w-3 h-3" /> HEMAT {disc}%
                      </div>
                    )}
                    <div className="flex h-40 sm:h-44">
                      <div className="w-28 sm:w-32 flex-shrink-0 bg-orange-50 flex items-center justify-center p-2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-amber-100/50" />
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain relative z-10 group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wide">{p.category}</p>
                          <h3 className="font-bold text-gray-800 text-xs sm:text-sm leading-tight mt-0.5 line-clamp-2">{p.name}</h3>
                        </div>
                        <div>
                          <div className="flex items-baseline gap-1.5 mb-2">
                            <span className="text-base sm:text-lg font-extrabold text-orange-600">{fmt(p.price)}</span>
                            {p.originalPrice && p.originalPrice > p.price && (
                              <span className="text-[10px] sm:text-xs text-gray-400 line-through">{fmt(p.originalPrice)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 bg-orange-500 text-white rounded-lg px-2.5 py-1.5 w-fit text-[10px] sm:text-xs font-bold group-hover:bg-orange-600 transition-colors shadow-sm">
                            <Plus className="w-3 h-3" />
                            Tambah
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
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

      {/* ═══ PRODUCT GRID BY TAB ═══ */}
      <section className="bg-orange-500 py-6 sm:py-8 relative">
        <div className="relative max-w-5xl mx-auto px-4">
          {/* Tab Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-300" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Rekomendasi</h2>
            </div>
            <button onClick={() => setPage('menu')} className="text-orange-100 hover:text-white text-xs sm:text-sm font-medium flex items-center gap-0.5 transition-colors">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 mb-5 bg-orange-400/40 p-1 rounded-xl">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-orange-600 shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-52 sm:h-56 rounded-xl" />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-md">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Belum ada produk</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((p, i) => {
                const disc = getDiscount(p)
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    {/* Image */}
                    <div className="relative h-28 sm:h-36 bg-orange-50 flex items-center justify-center p-3">
                      {disc > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm z-10">
                          -{disc}%
                        </div>
                      )}
                      {p.tag === 'terlaris' && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm z-10 flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5" /> Laris
                        </div>
                      )}
                      <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">{p.category}</p>
                      <h3 className="font-bold text-gray-800 text-xs sm:text-sm leading-tight line-clamp-2 mb-2 min-h-[2rem] sm:min-h-[2.5rem]">{p.name}</h3>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-sm sm:text-base font-extrabold text-orange-600">{fmt(p.price)}</span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="text-[10px] text-gray-400 line-through">{fmt(p.originalPrice)}</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white text-[11px] sm:text-xs h-8"
                        onClick={() => handleAdd(p)}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Tambah
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
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
  const filtered = activeCategory === 'Semua' ? products : products.filter((p) => p.category === activeCategory)

  const handleAdd = (p: Product) => {
    addToCart({ productId: p.id, productName: p.name, price: p.price, quantity: 1, image: p.image })
    addToast(`${p.name} ditambahkan ke keranjang`)
  }

  return (
    <div className="min-h-screen">
      {/* Hero mini */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-400 py-5 relative">
        <div className="absolute inset-0 aceh-pattern opacity-30" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-xl font-extrabold text-white mb-1">
            <UtensilsCrossed className="w-6 h-6 inline-block mr-1.5 -mt-1" />
            Menu Kami
          </h2>
          <p className="text-orange-50 text-xs max-w-md mx-auto leading-relaxed">
            Pilih berbagai varian ayam geprek sambal ijo dan minuman segar dengan kualitas terbaik.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Category filter — horizontal scroll */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product count */}
        {!loading && (
          <p className="text-xs text-gray-400 mb-3">{filtered.length} menu tersedia</p>
        )}

        {/* Product grid — 2 col mobile, 3 col tablet+ */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <Skeleton className="w-full aspect-square" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <UtensilsCrossed className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60 text-sm">Tidak ada menu di kategori ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.97 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {p.originalPrice && p.originalPrice > p.price && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      -{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%
                    </span>
                  )}
                  {p.tag === 'terlaris' && !p.originalPrice && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5" /> Laris
                    </span>
                  )}
                  {/* Quick add button overlay */}
                  <button
                    onClick={() => handleAdd(p)}
                    className="absolute bottom-2 right-2 w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-90"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">{p.name}</h3>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed flex-1 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                    <div className="flex items-baseline gap-1">
                      <span className="font-extrabold text-orange-600 text-sm">{fmt(p.price)}</span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="text-[10px] text-gray-300 line-through">{fmt(p.originalPrice)}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAdd(p)}
                      className="sm:hidden bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-2.5 py-1.5 text-[11px] font-semibold shadow-sm active:scale-95 transition-all"
                    >
                      + Tambah
                    </button>
                    <button
                      onClick={() => handleAdd(p)}
                      className="hidden sm:flex bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah
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
  })

  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customerName || !form.customerPhone || !form.customerAddress) {
      addToast('Mohon lengkapi semua data yang diperlukan', 'error')
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
          customerAddress: form.customerAddress,
          notes: form.notes,
          paymentMethod: form.paymentMethod,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal membuat pesanan')

      setReceipt(data)
      clearCart()
      addToast('Pesanan berhasil dibuat!', 'success')
      setPage('receipt')
    } catch {
      addToast('Gagal membuat pesanan. Silakan coba lagi.', 'error')
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
              <Label htmlFor="phone" className="text-sm text-gray-600">Nomor Telepon *</Label>
              <Input id="phone" value={form.customerPhone} onChange={(e) => updateField('customerPhone', e.target.value)} placeholder="Contoh: 081234567890" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="address" className="text-sm text-gray-600">Alamat Pengiriman *</Label>
              <Textarea id="address" value={form.customerAddress} onChange={(e) => updateField('customerAddress', e.target.value)} placeholder="Masukkan alamat lengkap pengiriman Anda" className="mt-1" rows={3} required />
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
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-700">Total</span>
              <span className="text-lg font-extrabold text-orange-600">{fmt(total)}</span>
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
      setOrders(data)
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

  const handleCopy = () => {
    const text = `AYAM GEPREK SAMBAL IJO\nNo: #${receipt.id.slice(-6)}\n${fmtDate(receipt.createdAt)}\n\n${receipt.items.map((i) => `${i.productName} x${i.quantity}\t${fmt(i.subtotal)}`).join('\n')}\n\nTotal: ${fmt(receipt.total)}\nPembayaran: ${receipt.paymentMethod}`
    navigator.clipboard.writeText(text)
    addToast('Struk disalin ke clipboard', 'info')
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
            <p className="text-orange-100 text-xs mt-1">Jl. Teuku Nyak Arief, Banda Aceh</p>
          </div>

          <div className="p-5 space-y-4">
            {/* Order info */}
            <div className="text-justify text-xs text-gray-500 space-y-1 leading-relaxed">
              <p><span className="font-medium text-gray-700">No. Pesanan:</span> #{receipt.id.slice(-6)}</p>
              <p><span className="font-medium text-gray-700">Tanggal:</span> {fmtDate(receipt.createdAt)}</p>
              <p><span className="font-medium text-gray-700">Pemesan:</span> {receipt.customerName}</p>
              <p><span className="font-medium text-gray-700">Telepon:</span> {receipt.customerPhone}</p>
              <p><span className="font-medium text-gray-700">Alamat:</span> {receipt.customerAddress}</p>
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
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-700">{fmt(receipt.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ongkos Kirim</span>
                <span className="font-medium text-green-600">GRATIS</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
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
            </div>

            <p className="text-xs text-gray-400 text-center text-justify leading-relaxed">
              Terima kasih telah memesan di Ayam Geprek Sambal Ijo. Pesanan Anda sedang diproses dan akan segera diantarkan. Selamat menikmati!
            </p>
          </div>

          {/* Actions */}
          <div className="border-t border-orange-100 p-4 flex gap-2">
            <Button variant="outline" className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50 text-sm" onClick={handleCopy}>
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Salin Struk
            </Button>
            <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm" onClick={() => setPage('home')}>
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
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'settings' | 'admin' | 'products' | 'chat'>('overview')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', phone: '', password: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [orders, setOrders] = useState<OrderData[]>([])
  const [allOrders, setAllOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [showBarcode, setShowBarcode] = useState(false)
  const barcodeRef = useRef<SVGSVGElement>(null)
  const memberCode = user ? `AGSI-${user.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)}` : ''

  // Barcode rendering
  useEffect(() => {
    if (showBarcode && barcodeRef.current && memberCode) {
      try {
        JsBarcode(barcodeRef.current, memberCode, {
          format: 'CODE128',
          width: 2,
          height: 50,
          displayValue: false,
          background: 'transparent',
          lineColor: '#f97316',
        })
      } catch { /* ignore */ }
    }
  }, [showBarcode, memberCode])

  const isAdmin = user?.role === 'admin'

  // Load orders on mount
  const loadOrders = useCallback(async () => {
    try {
      if (isAdmin) {
        const res = await fetch('/api/orders')
        const data = await res.json()
        setAllOrders(data)
        setOrders(data)
      } else if (user?.id) {
        const res = await fetch(`/api/orders?userId=${user.id}`)
        const data = await res.json()
        setOrders(data)
      }
    } catch {
      addToast('Gagal memuat data', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, isAdmin, addToast])

  useEffect(() => { loadOrders() }, [loadOrders])

  // Computed stats
  const customerStats = {
    totalOrders: orders.length,
    completed: orders.filter((o) => o.status === 'delivered').length,
    pending: orders.filter((o) => ['pending', 'confirmed', 'preparing'].includes(o.status)).length,
    totalSpent: orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0),
    firstOrder: orders.length > 0 ? orders[orders.length - 1].createdAt : null,
    lastOrder: orders.length > 0 ? orders[0].createdAt : null,
  }

  const adminStats = {
    total: allOrders.length,
    pending: allOrders.filter((o) => o.status === 'pending').length,
    confirmed: allOrders.filter((o) => o.status === 'confirmed').length,
    preparing: allOrders.filter((o) => o.status === 'preparing').length,
    delivered: allOrders.filter((o) => o.status === 'delivered').length,
    cancelled: allOrders.filter((o) => o.status === 'cancelled').length,
    revenue: allOrders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0),
    avgOrder: allOrders.length > 0 ? Math.round(allOrders.reduce((s, o) => s + o.total, 0) / allOrders.length) : 0,
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
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error()
      addToast('Status pesanan berhasil diupdate', 'success')
      loadOrders()
    } catch {
      addToast('Gagal mengupdate status', 'error')
    }
  }

  const handleLogout = () => {
    logout()
    addToast('Anda telah keluar dari akun', 'info')
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
    if (!confirm('Hapus produk ini?')) return
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
    }
  }

  const tabs = isAdmin
    ? [
        { id: 'overview' as const, label: 'Ringkasan', icon: <UserCircle className="w-4 h-4" /> },
        { id: 'admin' as const, label: 'Pesanan', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'products' as const, label: 'Produk', icon: <UtensilsCrossed className="w-4 h-4" /> },
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

          {/* ═══ Admin Member Card — Batik Parang Edition ═══ */}
          {isAdmin && user && (
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }} className="mt-6 max-w-sm mx-auto w-full">
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="relative w-full cursor-pointer" style={{ perspective: 1000 }} onClick={() => setShowBarcode(!showBarcode)}>
                <div className="absolute -inset-[2px] rounded-2xl overflow-hidden">
                  <motion.div className="absolute inset-[-50%]" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} style={{ background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.3) 10%, transparent 20%)' }} />
                </div>
                <div className="relative w-full" style={{ transformStyle: 'preserve-3d', transform: showBarcode ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                  {/* FRONT FACE */}
                  <div className="relative bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 rounded-2xl shadow-2xl border border-white/20 overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, #7C2D12, #C2410C, #EA580C, #F97316, #FB923C, #F97316, #C2410C, #7C2D12)', opacity: 0.5, backgroundSize: '400% 400%', animation: 'batik-parang-flow 14s ease-in-out infinite' }} />
                    <div className="batik-shine-sweep" />
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: 0.06 }}><rect width="100" height="100" fill="url(#batik-parang)" /></svg>
                    <svg className="absolute top-[48px] left-0 right-0 h-px batik-tepian-top opacity-40" />
                    <svg className="absolute bottom-[38px] left-0 right-0 h-px batik-tepian-bottom opacity-30" style={{ animationDelay: '2s' }} />
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 200" fill="none" preserveAspectRatio="none">
                      <rect x="5" y="5" width="390" height="190" rx="14" stroke="white" strokeWidth="0.7" strokeOpacity="0.2" />
                      <rect x="10" y="10" width="380" height="180" rx="10" stroke="white" strokeWidth="0.3" strokeOpacity="0.12" strokeDasharray="5 3" style={{ animation: 'batik-border-dash 6s linear infinite' }} />
                      <rect x="15" y="15" width="370" height="170" rx="7" stroke="white" strokeWidth="0.15" strokeOpacity="0.08" />
                    </svg>
                    {/* Kawung corners */}
                    {['top-1 left-1', 'top-1 right-1', 'bottom-1 left-1', 'bottom-1 right-1'].map((pos, i) => (
                      <svg key={i} className={`absolute ${pos} w-16 h-16 text-white/[${i < 2 ? 0.12 : 0.10}]`} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="0.4" strokeLinecap="round" style={{ animation: `batik-kawung-bloom 6s ease-in-out ${i * 1.5}s infinite` }}>
                        {[0, 60, 120, 180, 240, 300].map((a, j) => (<ellipse key={j} cx="40" cy="16" rx={i < 2 ? 8 : 7} ry={i < 2 ? 14 : 12} transform={`rotate(${a + i * 15},40,40)`} fill="currentColor" fillOpacity="0.025" />))}<circle cx="40" cy="40" r="4" fill="currentColor" fillOpacity="0.06" />
                      </svg>
                    ))}
                    {/* Mega Mendung watermark */}
                    <svg className="absolute top-1/2 left-1/2 pointer-events-none" style={{ width: 140, height: 140, transform: 'translate(-50%,-50%)', animation: 'batik-mega-glow 5s ease-in-out infinite' }} viewBox="0 0 200 200" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" strokeLinecap="round"><circle cx="100" cy="100" r="90" strokeDasharray="3 6" /><circle cx="100" cy="100" r="65" /><circle cx="100" cy="100" r="40" /><path d="M100,30 L106,85 L155,60 L115,100 L155,140 L106,115 L100,170 L94,115 L45,140 L85,100 L45,60 L94,85 Z" fill="rgba(255,255,255,0.005)" /></svg>
                    <div className="relative z-10 px-4 pt-3 pb-5 sm:px-5 sm:pt-4 sm:pb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <motion.div animate={{ rotate: [0, 5, -5, 3, -3, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/25 shadow-lg"><Crown className="w-4 h-4 text-white" /></motion.div>
                          <div className="text-left"><p className="text-[7px] text-white/50 font-bold uppercase tracking-[0.15em] leading-none">Admin Card</p><p className="text-white font-extrabold text-xs truncate max-w-[120px] leading-tight mt-0.5">{user.name}</p></div>
                        </div>
                        <motion.div animate={{ scale: [1, 1.1, 1], boxShadow: ['0 0 0 0 rgba(255,255,255,0)', '0 0 14px 3px rgba(255,255,255,0.3)', '0 0 0 0 rgba(255,255,255,0)'] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} className="bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-white/25"><span className="text-[8px] text-white font-extrabold uppercase tracking-wider">Admin</span></motion.div>
                      </div>
                      <div className="flex items-center gap-2 my-2"><div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" /><svg className="w-2.5 h-2.5 text-white/30" viewBox="0 0 16 16" fill="none"><path d="M6 1 L11 6 L6 11 L1 6 Z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.15" /></svg><div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" /></div>
                      <div className="flex-1 flex items-end gap-2.5">
                        <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} className="flex-1 bg-white/[0.12] backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/20">
                          <div className="flex items-center justify-center gap-1 mb-0.5"><Star className="w-3 h-3 text-white" /><span className="text-[7px] text-white/70 font-bold uppercase tracking-wider">Poin</span></div>
                          <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.5, type: 'spring', stiffness: 200 }} className="text-white font-extrabold text-lg leading-none">{user.points ?? 0}</motion.p>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} className="flex-1 bg-white/[0.12] backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/20">
                          <div className="flex items-center justify-center gap-1 mb-0.5"><Gift className="w-3 h-3 text-white" /><span className="text-[7px] text-white/70 font-bold uppercase tracking-wider">Voucher</span></div>
                          <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.6, type: 'spring', stiffness: 200 }} className="text-white font-extrabold text-lg leading-none">{user.voucher ?? 0}</motion.p>
                        </motion.div>
                      </div>
                      <motion.p animate={{ opacity: [0.15, 0.5, 0.15] }} transition={{ duration: 3, repeat: Infinity }} className="text-center text-[7px] text-white/30 font-medium mt-1.5">✦ Ketuk untuk melihat barcode ✦</motion.p>
                    </div>
                  </div>
                  {/* BACK FACE */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 rounded-2xl shadow-2xl border border-white/20 overflow-hidden flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg, #7C2D12 0%, #C2410C 15%, #EA580C 30%, #F97316 50%, #FB923C 65%, #EA580C 80%, #C2410C 90%, #7C2D12 100%)' }}>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, #7C2D12, #C2410C, #EA580C, #F97316, #FB923C, #F97316, #C2410C, #7C2D12)', opacity: 0.5, backgroundSize: '400% 400%', animation: 'batik-parang-flow 14s ease-in-out infinite' }} />
                    <div className="batik-shine-sweep" />
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: 0.04 }}><rect width="100" height="100" fill="url(#batik-parang)" /></svg>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 200" fill="none" preserveAspectRatio="none">
                      <rect x="5" y="5" width="390" height="190" rx="14" stroke="white" strokeWidth="0.6" strokeOpacity="0.15" /><rect x="10" y="10" width="380" height="180" rx="10" stroke="white" strokeWidth="0.25" strokeOpacity="0.1" strokeDasharray="5 3" style={{ animation: 'batik-border-dash 6s linear infinite' }} /><rect x="15" y="15" width="370" height="170" rx="7" stroke="white" strokeWidth="0.12" strokeOpacity="0.07" />
                    </svg>
                    {['top-1 left-1', 'top-1 right-1', 'bottom-1 left-1', 'bottom-1 right-1'].map((pos, i) => (
                      <svg key={i} className={`absolute ${pos} w-12 h-12 text-white/[0.08]`} viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="0.3" strokeLinecap="round">
                        {[0, 60, 120, 180, 240, 300].map((a, j) => (<ellipse key={j} cx="30" cy="12" rx="5" ry="10" transform={`rotate(${a + i * 15},30,30)`} fill="currentColor" fillOpacity="0.02" />))}
                        <circle cx="30" cy="30" r="3" fill="currentColor" fillOpacity="0.05" />
                      </svg>
                    ))}
                    <svg className="absolute top-1/2 left-1/2 pointer-events-none" style={{ width: 140, height: 140, transform: 'translate(-50%,-50%)', animation: 'batik-mega-glow 5s ease-in-out infinite' }} viewBox="0 0 200 200" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" strokeLinecap="round"><circle cx="100" cy="100" r="90" strokeDasharray="3 6" /><circle cx="100" cy="100" r="65" /><circle cx="100" cy="100" r="40" /><path d="M100,30 L106,85 L155,60 L115,100 L155,140 L106,115 L100,170 L94,115 L45,140 L85,100 L45,60 L94,85 Z" fill="rgba(255,255,255,0.005)" /></svg>
                    <div className="absolute bottom-[42px] left-0 right-0 h-px batik-tepian-bottom opacity-30" />
                    <div className="relative z-10 w-full flex flex-col items-center px-4 pt-3 pb-2.5">
                      <div className="flex items-center gap-2 mb-2"><motion.div animate={{ rotate: [0, -4, 4, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="w-7 h-7 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20"><Crown className="w-3.5 h-3.5 text-white" /></motion.div><div className="text-left"><p className="text-[7px] text-white/50 font-bold uppercase tracking-[0.15em] leading-none">Admin Card</p><p className="text-white font-bold text-[10px] truncate max-w-[110px] leading-tight mt-0.5">{user.name}</p></div></div>
                      <div className="flex items-center gap-2 mb-2 w-full"><div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" /><svg className="w-2 h-2 text-white/30" viewBox="0 0 12 12" fill="none"><path d="M6 1 L11 6 L6 11 L1 6 Z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.15" /></svg><div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" /></div>
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="bg-white/[0.1] backdrop-blur-sm rounded-xl p-2.5 border border-white/20 w-full flex items-center justify-center"><svg ref={barcodeRef} className="w-full" /></motion.div>
                      <div className="flex items-center justify-between mt-2"><p className="text-[8px] text-white/50 font-mono tracking-[0.15em] font-semibold">{memberCode}</p><motion.p animate={{ opacity: [0.25, 0.6, 0.25] }} transition={{ duration: 2.5, repeat: Infinity }} className="text-[7px] text-white/40 font-medium">Ketuk untuk kembali</motion.p></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
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
              onClick={handleLogout}
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
                            <Button size="sm" variant="outline" className="border-red-200 text-red-500 hover:bg-red-50 text-[11px] h-8 px-2" onClick={() => deleteProduct(p.id)} disabled={deletingProduct === p.id}>
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

            {/* App Info */}
            <div className="bg-white rounded-xl p-5 shadow-md">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-orange-500" />
                Tentang Aplikasi
              </h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Nama Aplikasi', value: 'Ayam Geprek Sambal Ijo' },
                  { label: 'Versi', value: '1.0.0' },
                  { label: 'Developer', value: 'Z.ai Team' },
                  { label: 'Deskripsi', value: 'Aplikasi pemesanan online ayam geprek sambal ijo khas Aceh dengan fitur lengkap untuk kemudahan pemesanan dan pengelolaan usaha kuliner Anda.' },
                ].map((row, i) => (
                  <div key={i}>
                    <p className="text-[11px] text-gray-400">{row.label}</p>
                    <p className={`text-sm text-gray-700 ${row.label === 'Deskripsi' ? 'text-justify leading-relaxed' : 'font-medium'}`}>{row.value}</p>
                  </div>
                ))}
              </div>
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
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-white rounded-xl p-4 shadow-md text-red-500 hover:bg-red-50 transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              Keluar dari Akun
            </button>
          </>
        )}
      </div>
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
    </div>
  )
}