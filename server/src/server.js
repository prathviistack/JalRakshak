require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const initSockets = require("./sockets");
const { startWeatherAlertJob } = require("./jobs/weatherAlertJob");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  initSockets(io);
  app.set("io", io); // makes io available in controllers via req.app.get("io")

  startWeatherAlertJob(io);

  httpServer.listen(PORT, () => {
    console.log(`[server] JalRakshak API listening on port ${PORT} (${process.env.NODE_ENV || "development"})`);
  });
};

startServer();
