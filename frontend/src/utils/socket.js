import { io } from 'socket.io-client';

export function initSocket() {
  const options = {
    forceNew: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    transports: ['websocket'],
  };
  
  return io(options);
}