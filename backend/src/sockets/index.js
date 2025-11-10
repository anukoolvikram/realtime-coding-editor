const ACTIONS = require('./actions');

async function getClientsInRoom(io, roomId) {
  const sockets = await io.in(roomId).fetchSockets(); 
  return sockets.map(socket => {
    return {
      socketId: socket.id,
      username: socket.username || 'Anonymous',
    };
  });
}

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    //JOIN
    socket.on(ACTIONS.JOIN, async (payload = {}) => {
      try {
        const { roomId, username = 'Anonymous' } = payload;
        if (!roomId) return socket.emit('error', 'invalid room');
        socket.username = username;
        await socket.join(roomId);
        const clients = await getClientsInRoom(io, roomId);
        console.log(`User ${username} (${socket.id}) joined room ${roomId}`);

        io.in(roomId).emit(ACTIONS.JOINED, {
          clients,
          username,
          socketId: socket.id,
        });
      } catch (err) {
        console.error('JOIN handler error', err);
        socket.emit('error', 'join failed');
      }
    });

    // CODE CHANGES
    socket.on(ACTIONS.CODE_CHANGE, (payload = {}) => {
      const { roomId, code } = payload;
      socket.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    // request sync (send specific socket the code)
    socket.on(ACTIONS.SYNC_CODE, (payload = {}) => {
      const { socketId, code } = payload;
      io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    // language/theme changes
    socket.on(ACTIONS.LANGUAGE_CHANGE, (payload = {}) => {
      const { roomId, language } = payload;
      socket.to(roomId).emit(ACTIONS.LANGUAGE_CHANGE, { language });
    });

    socket.on(ACTIONS.THEME_CHANGE, (payload = {}) => {
      const { roomId, theme } = payload;
      socket.to(roomId).emit(ACTIONS.THEME_CHANGE, { theme });
    });

    socket.on('disconnecting', () => {
      const username = socket.username || 'Anonymous';
      console.log(`Socket disconnecting: ${socket.id}, User: ${username}`);
      
      socket.rooms.forEach(roomId => {
        if (roomId !== socket.id) { 
          socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
            socketId: socket.id,
            username: username,
          });
        }
      });
    });
  });
}

module.exports = { registerSocketHandlers };