import { io } from 'socket.io-client';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const SOCKET_URL = API.replace(/\/api\/?$/, '');

let socket = null;

export function connectAdminSocket(onOtpSubmitted) {
  const token = localStorage.getItem('adminToken');
  if (!token) return null;

  if (socket?.connected) {
    socket.off('otp:submitted');
    socket.on('otp:submitted', onOtpSubmitted);
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('otp:submitted', onOtpSubmitted);
  return socket;
}

export function disconnectAdminSocket() {
  socket?.disconnect();
  socket = null;
}
