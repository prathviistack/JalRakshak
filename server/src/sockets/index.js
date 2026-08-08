const jwt = require("jsonwebtoken");

/**
 * Wires up Socket.io: authenticates the connection with the same JWT
 * used by the REST API, then joins the socket to a room per user id
 * (so targeted notifications can be sent with io.to(userId).emit(...)).
 *
 * Events emitted elsewhere in the app (see requestController.js):
 *   newEmergency, requestAccepted, requestCompleted
 * Events available for future wiring: newMessage, newNotification,
 *   weatherAlert, newAnnouncement
 */
const initSockets = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(); // allow anonymous read-only connections (e.g. public map)

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.role = decoded.role;
    } catch (err) {
      // invalid token: connect anonymously rather than hard-failing the socket
    }
    next();
  });

  io.on("connection", (socket) => {
    if (socket.userId) {
      socket.join(socket.userId.toString());
      console.log(`[socket] user ${socket.userId} connected (${socket.id})`);
    } else {
      console.log(`[socket] anonymous connection (${socket.id})`);
    }

    socket.on("disconnect", () => {
      console.log(`[socket] disconnected (${socket.id})`);
    });
  });
};

module.exports = initSockets;
