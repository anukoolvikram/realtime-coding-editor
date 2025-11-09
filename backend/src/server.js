require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const { registerSocketHandlers } = require('./sockets');
const executeRoutes = require('./routes/execute');
const { PORT, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX, CORS_ORIGINS } = require('./config');
const errorHandler = require('./middlewares/errorHandler');

function buildServer() {
  const ALLOW = CORS_ORIGINS;

  const corsOptions = {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (ALLOW.length === 0 || ALLOW.includes(origin)) return cb(null, true);
      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  const app = express();
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '200kb' }));

  const limiter = rateLimit({ windowMs: RATE_LIMIT_WINDOW_MS, max: RATE_LIMIT_MAX });
  app.use(limiter);

  app.get('/', (_req, res) => res.send('Realtime Notepad backend OK'));
  app.use('/api', executeRoutes);
  app.use(errorHandler);

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: ALLOW.length ? ALLOW : '*', methods: ['GET', 'POST'] },
  });

  registerSocketHandlers(io);
  const close = () => new Promise((resolve) => server.close(() => resolve()));
  return { app, server, io, close };
}

module.exports = { buildServer };
