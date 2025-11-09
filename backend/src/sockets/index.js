const ACTIONS = require('./actions');
const { sanitizeRoomId, sanitizeUsername } = require('../utils/validators');

const userSocketMap = new Map(); 

function getClientsInRoom(io, roomId) {
  if (!roomId) return [];
  const room = io.sockets.adapter.rooms.get(roomId) || new Set();
  return [...room].map(socketId => {
    const u = userSocketMap.get(socketId) || {};
    return { socketId, username: u.username || 'Anonymous' };
  });
}

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    // join
    socket.on(ACTIONS.JOIN, (payload = {}) => {
      try {
        const roomId = sanitizeRoomId(payload.roomId);
        const username = sanitizeUsername(payload.username);
        if (!roomId) return socket.emit('error', 'invalid room');

        userSocketMap.set(socket.id, { username, roomId });
        socket.join(roomId);

        const clients = getClientsInRoom(io, roomId);

        // notify others
        socket.to(roomId).emit(ACTIONS.JOINED, {
          clients,
          username,
          socketId: socket.id,
        });

        // confirm to the joining socket
        socket.emit(ACTIONS.JOINED, {
          clients,
          username,
          socketId: socket.id,
        });
      } catch (err) {
        console.error('JOIN handler error', err);
        socket.emit('error', 'join failed');
      }
    });

    // code changes
    socket.on(ACTIONS.CODE_CHANGE, (payload = {}) => {
      const roomId = sanitizeRoomId(payload.roomId) || userSocketMap.get(socket.id)?.roomId;
      const code = typeof payload.code === 'string' ? payload.code : null;
      if (!roomId || code === null) return;
      socket.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    // request sync (send specific socket the code)
    socket.on(ACTIONS.SYNC_CODE, (payload = {}) => {
      const target = payload.socketId;
      const code = typeof payload.code === 'string' ? payload.code : null;
      if (!target || code === null) return;
      io.to(target).emit(ACTIONS.CODE_CHANGE, { code });
    });

    // language/theme changes
    socket.on(ACTIONS.LANGUAGE_CHANGE, (payload = {}) => {
      const roomId = sanitizeRoomId(payload.roomId) || userSocketMap.get(socket.id)?.roomId;
      const language = typeof payload.language === 'string' ? payload.language : null;
      if (!roomId || !language) return;
      socket.to(roomId).emit(ACTIONS.LANGUAGE_CHANGE, { language });
    });

    socket.on(ACTIONS.THEME_CHANGE, (payload = {}) => {
      const roomId = sanitizeRoomId(payload.roomId) || userSocketMap.get(socket.id)?.roomId;
      const theme = typeof payload.theme === 'string' ? payload.theme : null;
      if (!roomId || !theme) return;
      socket.to(roomId).emit(ACTIONS.THEME_CHANGE, { theme });
    });

    // handle explicit leave
    socket.on(ACTIONS.LEAVE, () => {
      const data = userSocketMap.get(socket.id);
      if (data?.roomId) {
        socket.to(data.roomId).emit(ACTIONS.DISCONNECTED, { socketId: socket.id, username: data.username });
      }
      userSocketMap.delete(socket.id);
      socket.leave(data?.roomId || null);
    });

    // cleanup on disconnect
    socket.on('disconnect', (reason) => {
      const u = userSocketMap.get(socket.id);
      if (u?.roomId) {
        socket.to(u.roomId).emit(ACTIONS.DISCONNECTED, { socketId: socket.id, username: u.username, reason });
      }
      userSocketMap.delete(socket.id);
    });
  });
}

module.exports = { registerSocketHandlers };
