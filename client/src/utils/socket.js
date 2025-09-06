// import { io } from 'socket.io-client';

// export const initSocket = async () => {
//   const options = {
//     forceNew: true,                
//     reconnectionAttempts: Infinity,
//     timeout: 10000,
//     transports: ['websocket'],
//   };
//   return io(import.meta.env.VITE_BACKEND_URL, options);
// };


import { io } from 'socket.io-client';

const BACKEND_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : `${location.protocol}//${location.host}`);

export function initSocket() {
  const options = {
    forceNew: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    transports: ['websocket'], 
  };

  if (!BACKEND_URL) {
    console.warn('No BACKEND_URL resolved; socket.io will try same-origin. Set VITE_BACKEND_URL.');
  } else {
    console.log('Connecting socket.io to:', BACKEND_URL);
  }

  return io(BACKEND_URL, options);
}
