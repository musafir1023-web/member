'use client'

import { useState, useEffect, useCallback } from 'react'
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
} from 'lucide-react'

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

/* ─────────────────────── TOP BAR (minimal brand) ─────────────────────── */
function TopBar() {
  const { currentPage, setPage } = useAppStore()
  const showBack = !['home'].includes(currentPage)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => setPage('home')}
              className="p-1.5 -ml-1 text-gray-600 hover:text-orange-500 transition-colors rounded-lg hover:bg-orange-50"
              aria-label="Kembali ke Beranda"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setPage('home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ChefHat className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-xs sm:text-sm text-gray-800 uppercase tracking-wide">
              Ayam Geprek Sambal Ijo
            </span>
          </button>
        </div>
        {showBack && (
          <span className="text-xs text-gray-400 font-medium">
            {currentPage === 'menu' && 'Menu'}
            {currentPage === 'cart' && 'Keranjang'}
            {currentPage === 'orders' && 'Pesanan'}
            {currentPage === 'profile' && 'Profile'}
            {currentPage === 'login' && 'Login'}
            {currentPage === 'register' && 'Daftar'}
            {currentPage === 'receipt' && 'Struk'}
          </span>
        )}
      </div>
    </header>
  )
}

/* ─────────────────────── BOTTOM NAVIGATION ─────────────────────── */
function BottomNav() {
  const { currentPage, setPage, user, logout, getCartCount } = useAppStore()
  const cartCount = useAppStore(getCartCount)

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
                  {item.page === 'cart' && cartCount > 0 && (
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

/* ─────────────────────── FOOTER ─────────────────────── */
function Footer() {
  return (
    <footer className="bg-orange-600 text-white">
      <div className="max-w-5xl mx-auto px-4 py-4 pb-24">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <ChefHat className="w-4 h-4" />
            <span className="font-bold text-xs uppercase tracking-wider">Ayam Geprek Sambal Ijo</span>
          </div>
          <p className="text-orange-100 text-[11px] text-justify max-w-md mx-auto leading-relaxed">
            Menyajikan ayam geprek sambal ijo khas Aceh dengan cita rasa autentik. Pesan online mudah, cepat, dan terpercaya untuk pengalaman kuliner terbaik Anda.
          </p>
          <Separator className="my-2 bg-orange-400/30" />
          <p className="text-orange-200 text-[10px]">&copy; {new Date().getFullYear()} Ayam Geprek Sambal Ijo. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────── HOME PAGE ─────────────────────── */
function HomePage() {
  const setPage = useAppStore((s) => s.setPage)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400">
        {/* Aceh ornament overlay */}
        <div className="absolute inset-0 aceh-pattern" />
        <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-20">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <ChefHat className="w-10 h-10 sm:w-14 sm:h-14 text-white drop-shadow-lg" />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-md">
                  AYAM GEPREK<br />SAMBAL IJO
                </h1>
                <p className="text-orange-50 text-sm sm:text-base max-w-lg mx-auto md:mx-0 leading-relaxed">
                  Nikmati kelezatan ayam geprek dengan sambal ijo khas Aceh yang autentik. Dibuat dari bahan pilihan dengan resep turun-temurun yang menjaga cita rasa asli.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center md:justify-start">
                  <Button
                    onClick={() => setPage('menu')}
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-lg hover:shadow-xl transition-all px-8"
                  >
                    <UtensilsCrossed className="w-4 h-4 mr-2" />
                    Pesan Sekarang
                  </Button>
                  <Button
                    onClick={() => setPage('menu')}
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8"
                  >
                    Lihat Menu
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-shrink-0 w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src="/images/hero-banner.png"
                alt="Ayam Geprek Sambal Ijo"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L48 54C96 48 192 36 288 30C384 24 480 24 576 28C672 32 768 40 864 42C960 44 1056 40 1152 36C1248 32 1344 28 1392 26L1440 24V60H0Z" fill="#F97316" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="bg-orange-500 py-10 sm:py-14 relative">
        <div className="absolute inset-0 aceh-pattern opacity-50" />
        <div className="relative max-w-5xl mx-auto px-4">
          <h2 className="text-center text-xl sm:text-2xl font-bold text-white mb-8">Kenapa Memilih Kami?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: <Star className="w-8 h-8" />, title: 'Rasa Autentik', desc: 'Sambal ijo khas Aceh dengan resep turun-temurun yang menjaga cita rasa asli dan kualitas bahan pilihan terbaik.' },
              { icon: <Truck className="w-8 h-8" />, title: 'Pengiriman Cepat', desc: 'Pesanan diproses dengan cepat dan diantarkan langsung ke lokasi Anda dalam waktu singkat dengan kemasan yang rapi.' },
              { icon: <CreditCard className="w-8 h-8" />, title: 'Pembayaran Mudah', desc: 'Tersedia berbagai metode pembayaran mulai dari COD hingga transfer bank untuk kemudahan dan kenyamanan bertransaksi Anda.' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 text-orange-500 mb-3">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 text-justify leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-orange-500 py-10 relative">
        <div className="absolute inset-0 aceh-pattern opacity-30" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Siap Memesan?</h2>
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
  image: string
  category: string
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
        setProducts(data)
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
      <div className="bg-gradient-to-r from-orange-500 to-amber-400 py-8 relative">
        <div className="absolute inset-0 aceh-pattern opacity-30" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Menu Kami</h1>
          <p className="text-orange-50 text-sm max-w-lg mx-auto text-justify leading-relaxed">
            Pilih berbagai varian ayam geprek sambal ijo dan minuman segar yang kami sediakan. Semua menu dibuat dari bahan pilihan dengan kualitas terbaik untuk kepuasan Anda.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={activeCategory === cat ? 'default' : 'outline'}
              className={activeCategory === cat ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-orange-200 text-gray-600 hover:bg-orange-50'}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md">
                <Skeleton className="w-full h-48" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  <Badge className="absolute top-3 left-3 bg-orange-500 text-white text-xs">{p.category}</Badge>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 mb-1 text-sm leading-snug">{p.name}</h3>
                  <p className="text-xs text-gray-500 text-justify leading-relaxed flex-1 line-clamp-3">{p.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-extrabold text-orange-600 text-base">{fmt(p.price)}</span>
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                      onClick={() => handleAdd(p)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Tambah
                    </Button>
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
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'settings' | 'admin'>('overview')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', phone: '', password: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [orders, setOrders] = useState<OrderData[]>([])
  const [allOrders, setAllOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)

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
  const tabs = isAdmin
    ? [
        { id: 'overview' as const, label: 'Ringkasan', icon: <UserCircle className="w-4 h-4" /> },
        { id: 'admin' as const, label: 'Kelola Pesanan', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'orders' as const, label: 'Riwayat', icon: <ReceiptText className="w-4 h-4" /> },
        { id: 'settings' as const, label: 'Pengaturan', icon: <Settings className="w-4 h-4" /> },
      ]
    : [
        { id: 'overview' as const, label: 'Ringkasan', icon: <UserCircle className="w-4 h-4" /> },
        { id: 'orders' as const, label: 'Pesanan Saya', icon: <Package className="w-4 h-4" /> },
        { id: 'settings' as const, label: 'Pengaturan', icon: <Settings className="w-4 h-4" /> },
      ]

  return (
    <div className="min-h-screen pb-4">
      {/* ─── Profile Header ─── */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 relative overflow-hidden">
        <div className="absolute inset-0 aceh-pattern opacity-20" />
        <div className="relative max-w-2xl mx-auto px-4 pt-8 pb-6">
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
      <div className="sticky top-12 z-40 bg-orange-500 shadow-sm">
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

        {/* ═══ SETTINGS TAB ═══ */}
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

/* ─────────────────────── MAIN APP ─────────────────────── */
export default function AppPage() {
  const currentPage = useAppStore((s) => s.currentPage)

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
      {/* Aceh ornament on entire page */}
      <div className="fixed inset-0 aceh-pattern opacity-[0.03] pointer-events-none z-0" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
        <BottomNav />
      </div>
      <ToastContainer />
    </div>
  )
}