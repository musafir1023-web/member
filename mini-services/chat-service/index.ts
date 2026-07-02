import { Server } from 'socket.io'

const PORT = 3003
const API_BASE = 'http://localhost:3000'

const io = new Server(PORT, {
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
})

async function apiPost(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

io.on('connection', (socket) => {
  console.log(`[Chat] Connected: ${socket.id}`)

  // Join a chat room
  socket.on('join-room', async (data: { roomId: string; userId: string; role: string }) => {
    const { roomId, userId, role } = data
    socket.join(`room:${roomId}`)
    socket.data = { roomId, userId, role }

    // Mark messages as read via REST API
    await apiPost('/api/chat/read', { roomId, role }).catch(() => {})

    // Notify the other party
    socket.to(`room:${roomId}`).emit('messages-read', { by: userId, role })
    console.log(`[Chat] ${role} ${userId} joined room ${roomId}`)
  })

  // Leave current room
  socket.on('leave-room', () => {
    if (socket.data?.roomId) {
      socket.leave(`room:${socket.data.roomId}`)
      console.log(`[Chat] Left room: ${socket.data.roomId}`)
    }
  })

  // Send a message
  socket.on('send-message', async (data: { roomId: string; senderId: string; senderName: string; senderRole: string; content: string }) => {
    try {
      const { roomId, senderId, senderName, senderRole, content } = data
      if (!content.trim()) return

      // Save via REST API
      const msgObj = await apiPost('/api/chat/send', { roomId, senderId, senderName, senderRole, content })

      // Broadcast to all clients in the room
      io.to(`room:${roomId}`).emit('new-message', msgObj)
      console.log(`[Chat] Message in room ${roomId} from ${senderRole}: ${content.slice(0, 50)}`)
    } catch (err) {
      console.error('[Chat] Error sending message:', err)
    }
  })

  // Typing indicator
  socket.on('typing', (data: { roomId: string; userId: string; name: string }) => {
    socket.to(`room:${roomId}`).emit('user-typing', { userId: data.userId, name: data.name })
  })

  socket.on('stop-typing', (data: { roomId: string; userId: string }) => {
    socket.to(`room:${roomId}`).emit('user-stop-typing', { userId: data.userId })
  })

  socket.on('disconnect', () => {
    console.log(`[Chat] Disconnected: ${socket.id}`)
  })
})

console.log(`[Chat] Socket.IO server running on port ${PORT}`)