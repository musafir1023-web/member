'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io, Socket } from 'socket.io-client'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MessageCircle,
  Send,
  Search,
  ArrowLeft,
  Phone,
  Smile,
  Check,
  CheckCheck,
} from 'lucide-react'

interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderRole: string
  content: string
  type: string
  readByAdmin: boolean
  readByUser: boolean
  createdAt: string
  senderName?: string
}

interface Conversation {
  id: string
  userId: string
  userName: string
  userPhone: string | null
  lastMessage: string | null
  lastMessageAt: string | null
  unreadAdmin: number
  unreadUser: number
  createdAt: string
  _count: { messages: number }
}

interface ChatWidgetProps {
  userId: string
  userName: string
  userRole: string
  userPhone?: string
}

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Hari ini'
  if (d.toDateString() === yesterday.toDateString()) return 'Kemarin'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatMessageDate = (dateStr: string) => {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return `Hari ini, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
  if (d.toDateString() === yesterday.toDateString()) return `Kemarin, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
  return `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
}

export default function ChatWidget({ userId, userName, userRole, userPhone }: ChatWidgetProps) {
  const isAdmin = userRole === 'admin'

  // Socket
  const socketRef = useRef<Socket | null>(null)

  // Admin: conversation list + selected conversation
  // Customer: single conversation
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typingUser, setTypingUser] = useState<{ name: string; role: string } | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [showChatView, setShowChatView] = useState(false) // mobile: toggle between list and chat
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [allLoaded, setAllLoaded] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // selectedConvId is used in callbacks but shouldn't trigger socket re-init
  const selectedConvIdRef = useRef<string | null>(null)
  selectedConvIdRef.current = selectedConvId

  // ─── Initialize Socket ───
  useEffect(() => {
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('[Chat] Socket connected')
      socket.emit('auth', { userId, role: userRole, name: userName })
    })

    socket.on('new_message', (msg: ChatMessage) => {
      if (selectedConvIdRef.current === msg.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev
          return [...prev, msg]
        })
        markAsRead(msg.conversationId)
      }
      refreshConversations()
    })

    socket.on('conversation_update', () => {
      refreshConversations()
    })

    socket.on('user_typing', (data: { conversationId: string; name: string; role: string }) => {
      if (data.conversationId === selectedConvIdRef.current) {
        setTypingUser({ name: data.name, role: data.role })
      }
    })

    socket.on('user_stop_typing', (data: { conversationId: string }) => {
      if (data.conversationId === selectedConvIdRef.current) {
        setTypingUser(null)
      }
    })

    socket.on('messages_read_by', (data: { conversationId: string; role: string }) => {
      if (data.conversationId === selectedConvIdRef.current) {
        setMessages((prev) =>
          prev.map((m) => {
            if (data.role === 'admin') return { ...m, readByAdmin: true }
            return { ...m, readByUser: true }
          })
        )
      }
    })

    socket.on('user_status', (data: { userId: string; online: boolean }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev)
        if (data.online) next.add(data.userId)
        else next.delete(data.userId)
        return next
      })
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [userId, userRole, userName])

  // ─── Join/leave conversation room when selection changes ───
  useEffect(() => {
    if (!socketRef.current) return
    if (selectedConvId) {
      socketRef.current.emit('join_conversation', selectedConvId)
    }
    return () => {
      if (selectedConvId && socketRef.current) {
        socketRef.current.emit('leave_conversation', selectedConvId)
      }
    }
  }, [selectedConvId])

  // ─── Auto-scroll to bottom on new messages ───
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUser])

  // ─── Load conversations ───
  const refreshConversations = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/conversations?userId=${userId}&role=${userRole}`)
      const data = await res.json()
      setConversations(data)
      if (data.length > 0) {
        // For customer, auto-select their conversation
        if (!isAdmin) {
          setSelectedConvId(data[0].id)
        }
      }
    } catch {
      // silent
    } finally {
      setLoadingConvs(false)
    }
  }, [userId, userRole, isAdmin])

  useEffect(() => { refreshConversations() }, [refreshConversations])

  // ─── Load messages for a conversation ───
  const loadMessages = useCallback(async (convId: string) => {
    setLoadingMessages(true)
    setAllLoaded(false)
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${convId}&limit=50`)
      const data = await res.json()
      setMessages(data)
    } catch {
      // silent
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    if (selectedConvId) {
      loadMessages(selectedConvId)
      if (!isAdmin) setShowChatView(true)
    }
  }, [selectedConvId, loadMessages, isAdmin])

  // ─── Mark as read ───
  const markAsRead = async (convId: string) => {
    try {
      await fetch('/api/chat/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId, role: userRole }),
      })
      socketRef.current?.emit('messages_read', { conversationId: convId, role: userRole })
    } catch {
      // silent
    }
  }

  // ─── Send message ───
  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    const content = newMessage.trim()
    setNewMessage('')
    setSending(true)
    setShowEmojiPicker(false)

    try {
      // Auto-create conversation for customer if none exists
      let convId = selectedConvId
      if (!convId && !isAdmin) {
        const conv = await startConversation()
        if (!conv) throw new Error('Gagal membuat percakapan')
        convId = conv.id
      }
      if (!convId) return

      // Save to DB first
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: convId,
          senderId: userId,
          senderRole: userRole,
          content,
          type: 'text',
        }),
      })

      const savedMsg = await res.json()

      // Emit via socket
      socketRef.current?.emit('send_message', {
        conversationId: convId,
        messageId: savedMsg.id,
        senderId: userId,
        senderRole: userRole,
        content,
        type: 'text',
        senderName: userName,
      })

      // Add to local messages
      setMessages((prev) => [...prev, {
        ...savedMsg,
        conversationId: convId,
        senderName: userName,
      }])

      // Refresh conversations
      refreshConversations()
    } catch {
      // Could add the message back
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  // ─── Create conversation (for customer) ───
  const startConversation = async () => {
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName, userPhone: userPhone || null }),
      })
      const conv = await res.json()
      setSelectedConvId(conv.id)
      return conv
    } catch {
      return null
    }
  }

  // Auto-create conversation for customer on mount if none exists
  useEffect(() => {
    if (!isAdmin && !loadingConvs && conversations.length === 0) {
      startConversation()
    }
  }, [isAdmin, loadingConvs, conversations.length])

  // ─── Typing handler ───
  const handleTyping = () => {
    if (!selectedConvId || !socketRef.current) return
    socketRef.current.emit('typing', { conversationId: selectedConvId, name: userName })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { conversationId: selectedConvId })
    }, 2000)
  }

  // ─── Emoji data ───
  const emojiCategories = [
    { label: 'Senyum', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘'] },
    { label: 'Reaksi', emojis: ['👍', '👎', '👏', '🙏', '💪', '❤️', '🔥', '⭐', '💯', '🎉', '🎊', '✅', '❌', '⚠️', '💬'] },
    { label: 'Makanan', emojis: ['🍗', '🍖', '🍚', '🥤', '☕', '🌶️', '🧡', '😋', '🤤', '🫶', '👌', '✨', '👏', '🙏', '💯'] },
  ]

  // ─── Filtered conversations for admin search ───
  const filteredConversations = searchQuery
    ? conversations.filter((c) =>
        c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations

  // ─── Group messages by date ───
  const getMessageGroups = () => {
    const groups: { date: string; messages: ChatMessage[] }[] = []
    let currentDate = ''

    for (const msg of messages) {
      const msgDate = formatDate(msg.createdAt)
      if (msgDate !== currentDate) {
        currentDate = msgDate
        groups.push({ date: msgDate, messages: [msg] })
      } else {
        groups[groups.length - 1].messages.push(msg)
      }
    }
    return groups
  }

  // ─── RENDER ───
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">
              {isAdmin ? 'Chat Pelanggan' : 'Chat Admin'}
            </h3>
            <p className="text-orange-100 text-[10px]">
              {isAdmin
                ? `${conversations.length} percakapan${conversations.reduce((sum, c) => sum + c.unreadAdmin, 0) > 0 ? ` · ${conversations.reduce((sum, c) => sum + c.unreadAdmin, 0)} belum dibaca` : ''}`
                : onlineUsers.has('admin') ? '🟢 Admin sedang online' : '⚫ Admin offline · Pesan tetap terkirim'}
            </p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white border-0 text-[10px]">
              {conversations.reduce((sum, c) => sum + c.unreadAdmin, 0)} Baru
            </Badge>
          </div>
        )}
      </div>

      {/* Chat Body */}
      <div className="flex" style={{ height: '420px' }}>
        {/* ─── CONVERSATION LIST (Admin) ─── */}
        {isAdmin && (
          <div className={`${showChatView ? 'hidden sm:flex' : 'flex'} flex-col w-full sm:w-80 border-r border-orange-100 bg-orange-50/30`}>
            {/* Search */}
            <div className="p-3 border-b border-orange-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari percakapan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs bg-white border-orange-200 rounded-xl"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loadingConvs ? (
                <div className="p-3 space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                  <MessageCircle className="w-10 h-10 text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">
                    {searchQuery ? 'Tidak ditemukan' : 'Belum ada percakapan'}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConvId === conv.id
                  const isOnline = onlineUsers.has(conv.userId)
                  return (
                    <motion.button
                      key={conv.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedConvId(conv.id)
                        setShowChatView(true)
                        markAsRead(conv.id)
                      }}
                      className={`w-full flex items-start gap-3 p-3 hover:bg-white transition-colors text-left border-b border-orange-50 ${
                        isSelected ? 'bg-white' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ${
                          isSelected ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'
                        }`}>
                          {conv.userName.charAt(0).toUpperCase()}
                        </div>
                        {isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-semibold truncate ${isSelected ? 'text-gray-800' : 'text-gray-700'}`}>
                            {conv.userName}
                          </p>
                          {conv.lastMessageAt && (
                            <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                              {formatTime(conv.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {conv.lastMessage || 'Belum ada pesan'}
                        </p>
                      </div>

                      {/* Unread Badge */}
                      {conv.unreadAdmin > 0 && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {conv.unreadAdmin > 9 ? '9+' : conv.unreadAdmin}
                        </div>
                      )}
                    </motion.button>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ─── CHAT MESSAGES ─── */}
        <div className={`${showChatView ? 'flex' : 'hidden sm:flex'} ${isAdmin && selectedConvId ? 'flex' : ''} flex-col flex-1 ${!isAdmin && !selectedConvId ? 'items-center justify-center' : ''}`}>
          {/* No conversation selected (admin) */}
          {isAdmin && !selectedConvId && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-orange-300" />
              </div>
              <p className="font-semibold text-gray-600 text-sm">Pilih Percakapan</p>
              <p className="text-xs text-gray-400 mt-1">Pilih percakapan dari daftar untuk mulai chat</p>
            </div>
          )}

          {/* Customer: no conversation yet → show input directly */}
          {!isAdmin && !selectedConvId && !loadingConvs && (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-orange-100 flex items-center gap-3 bg-white">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm shadow-md">A</div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm">Admin Toko</p>
                  <p className="text-[10px] text-gray-400">⚫ Offline</p>
                </div>
              </div>

              {/* Empty messages area */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-gray-50/50">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-3">
                  <MessageCircle className="w-8 h-8 text-orange-300" />
                </div>
                <p className="text-xs text-gray-400 text-justify leading-relaxed max-w-[200px]">
                  Ketik pesan di bawah untuk mulai percakapan dengan admin.
                </p>
              </div>

              {/* Message Input — always visible for customer */}
              <div className="p-3 bg-white border-t border-orange-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      showEmojiPicker ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-orange-500'
                    }`}
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      placeholder="Ketik pesan..."
                      className="pr-10 h-10 text-sm bg-gray-50 border-gray-200 rounded-xl focus:ring-orange-300 focus:border-orange-300"
                      disabled={sending}
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      newMessage.trim()
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 hover:bg-orange-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </>
          )}

          {/* Chat View */}
          {selectedConvId && (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-orange-100 flex items-center gap-3 bg-white">
                {isAdmin && (
                  <button
                    onClick={() => { setShowChatView(false); setSelectedConvId(null) }}
                    className="sm:hidden w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center"
                  >
                    <ArrowLeft className="w-4 h-4 text-orange-600" />
                  </button>
                )}
                {(() => {
                  const conv = conversations.find((c) => c.id === selectedConvId)
                  const chatName = isAdmin ? (conv?.userName || 'Customer') : 'Admin Toko'
                  const isOnline = isAdmin ? (conv ? onlineUsers.has(conv.userId) : false) : onlineUsers.has('admin')
                  return (
                    <>
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {isAdmin ? (conv?.userName?.charAt(0).toUpperCase() || 'C') : 'A'}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          isOnline ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm">{chatName}</p>
                        <p className="text-[10px] text-gray-400">
                          {isOnline ? '🟢 Sedang online' : '⚫ Offline'}
                          {typingUser && ' · Mengetik...'}
                        </p>
                      </div>
                      {isAdmin && conv?.userPhone && (
                        <a
                          href={`tel:${conv.userPhone}`}
                          className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center hover:bg-green-100 transition-colors"
                        >
                          <Phone className="w-4 h-4 text-green-600" />
                        </a>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Messages Area */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar bg-gray-50/50"
              >
                {/* Offline banner for customer */}
                {!isAdmin && !onlineUsers.has('admin') && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2 flex items-start gap-2">
                    <span className="text-sm mt-0.5">💡</span>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Admin sedang offline. Pesan Anda akan tetap tersimpan dan akan dibalas saat admin kembali online.
                    </p>
                  </div>
                )}
                {loadingMessages ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className={`h-12 rounded-2xl max-w-[75%] ${i % 2 === 0 ? 'ml-auto' : ''}`} />
                    ))}
                  </div>
                ) : (
                  <>
                    {getMessageGroups().map((group) => (
                      <div key={group.date}>
                        {/* Date separator */}
                        <div className="flex items-center justify-center my-3">
                          <span className="bg-white text-gray-400 text-[10px] px-3 py-1 rounded-full shadow-sm border border-gray-100">
                            {group.date}
                          </span>
                        </div>
                        {group.messages.map((msg) => {
                          const isMine = msg.senderRole === userRole
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 8, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1.5`}
                            >
                              <div className={`max-w-[80%] sm:max-w-[70%] ${isMine ? 'order-1' : 'order-1'}`}>
                                {/* Sender name (admin view) */}
                                {isAdmin && !isMine && (
                                  <p className="text-[10px] text-gray-400 ml-1 mb-0.5">
                                    {msg.senderId === userId ? 'Anda' : (conversations.find(c => c.id === msg.conversationId)?.userName || 'Customer')}
                                  </p>
                                )}
                                <div
                                  className={`px-3.5 py-2.5 text-sm leading-relaxed relative ${
                                    isMine
                                      ? 'bg-gradient-to-br from-orange-500 to-orange-400 text-white rounded-2xl rounded-br-md shadow-md'
                                      : 'bg-white text-gray-700 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                                  }`}
                                >
                                  {/* Link detection */}
                                  {msg.content.includes('http') ? (
                                    <p className="break-all">
                                      {msg.content.split(/(https?:\/\/[^\s]+)/).map((part, i) =>
                                        part.match(/^https?:\/\//) ? (
                                          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={`underline ${isMine ? 'text-orange-100' : 'text-orange-500'}`}>
                                            {part}
                                          </a>
                                        ) : (
                                          <span key={i}>{part}</span>
                                        )
                                      )}
                                    </p>
                                  ) : (
                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                  )}

                                  {/* Time & read receipt */}
                                  <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-end'}`}>
                                    <span className={`text-[10px] ${isMine ? 'text-orange-100/70' : 'text-gray-400'}`}>
                                      {formatMessageDate(msg.createdAt)}
                                    </span>
                                    {isMine && (
                                      msg.readByAdmin
                                        ? <CheckCheck className="w-3.5 h-3.5 text-orange-100" />
                                        : msg.readByUser
                                          ? <Check className="w-3.5 h-3.5 text-orange-100/70" />
                                          : null
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    ))}

                    {/* Typing indicator */}
                    {typingUser && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-1">
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                              className="w-2 h-2 rounded-full bg-gray-400"
                            />
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}
                              className="w-2 h-2 rounded-full bg-gray-400"
                            />
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
                              className="w-2 h-2 rounded-full bg-gray-400"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Emoji Picker */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-orange-100 bg-white"
                  >
                    <div className="p-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {emojiCategories.map((cat) => (
                        <div key={cat.label}>
                          <p className="text-[10px] text-gray-400 font-medium mb-1">{cat.label}</p>
                          <div className="flex flex-wrap gap-1">
                            {cat.emojis.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  setNewMessage((prev) => prev + emoji)
                                  inputRef.current?.focus()
                                }}
                                className="w-8 h-8 rounded-lg hover:bg-orange-50 flex items-center justify-center text-lg transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message Input */}
              <div className="p-3 bg-white border-t border-orange-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      showEmojiPicker ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-orange-500'
                    }`}
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value)
                        handleTyping()
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      placeholder="Ketik pesan..."
                      className="pr-10 h-10 text-sm bg-gray-50 border-gray-200 rounded-xl focus:ring-orange-300 focus:border-orange-300"
                      disabled={sending}
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      newMessage.trim()
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 hover:bg-orange-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}