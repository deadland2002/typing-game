import io from 'socket.io-client';

const socketUrl = import.meta.env.VITE_BASE_URL || "/"
export const socket = io(socketUrl,{autoConnect: false});