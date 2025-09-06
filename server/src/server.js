// backend/src/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { registerSocketHandlers } = require('./sockets'); 
const executeRoutes = require('./routes/execute');

function buildServer() {

  const ALLOW = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);

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
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
  app.use(express.json({ limit: '200kb' }));         
  app.get('/', (_req, res) => res.send('Realtime Notepad backend OK'));
  app.use('/api', executeRoutes);                        

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN || '*' },
  });

  registerSocketHandlers(io);
  return { app, server };
}

module.exports = { buildServer };
