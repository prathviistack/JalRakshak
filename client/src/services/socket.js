import { io } from "socket.io-client";

let socket = null;

// In dev, Vite proxies /socket.io to localhost:5000. In production, set
// VITE_SOCKET_URL to the backend's origin (e.g. https://jalrakshak-api.onrender.com).
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "/";

/**
 * Returns a singleton Socket.io client, authenticated with the current
 * JWT access token (same token used for REST calls). Call connectSocket()
 * once after login/app-load and disconnectSocket() on logout.
 */
export const connectSocket = () => {
  if (socket?.connected) return socket;

  const token = localStorage.getItem("jr_access_token");

  socket = io(SOCKET_URL, {
    path: "/socket.io",
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
