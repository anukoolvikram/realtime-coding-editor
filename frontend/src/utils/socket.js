import { io } from 'socket.io-client';

const isProduction = import.meta.env.PROD;
const URL = isProduction ? import.meta.env.VITE_API_BASE_URL : "/";

export function initSocket() {
  const options = {
    forceNew: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    transports: ['websocket'],
    autoConnect: false
  };
  return io(URL, options);
}