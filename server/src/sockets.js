const ACTIONS = require('./actions');

const userSocketMap = new Map();

function getClientsInRoom(io, roomId) {
  const room = io.sockets.adapter.rooms.get(roomId) || new Set();
  return [...room].map(socketId => {
    const u = userSocketMap.get(socketId);
    return { socketId, username: u?.username || 'Anonymous' };
  });
}

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
      userSocketMap.set(socket.id, { username, roomId });
      socket.join(roomId);

      const clients = getClientsInRoom(io, roomId);

      socket.to(roomId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });

      socket.emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
      socket.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
      io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on('disconnecting', () => {
      const u = userSocketMap.get(socket.id);
      if (u?.roomId) {
        socket.to(u.roomId).emit(ACTIONS.DISCONNECTED, {
          socketId: socket.id,
          username: u.username,
        });
      }
      userSocketMap.delete(socket.id);
    });

    // sockets.js (or wherever you register events)
    socket.on(ACTIONS.LANGUAGE_CHANGE, ({ roomId, language }) => {
      socket.to(roomId).emit(ACTIONS.LANGUAGE_CHANGE, { language });
    });
    socket.on(ACTIONS.THEME_CHANGE, ({ roomId, theme }) => {
      socket.to(roomId).emit(ACTIONS.THEME_CHANGE, { theme });
    });

  });
}

module.exports = { registerSocketHandlers };
