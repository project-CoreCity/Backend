require("dotenv").config();
require("./src/config/firebaseAdmin");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const usersRouter = require("./src/routes/users");
const connectDatabase = require("./src/config/database");
const corsMiddleware = require("./src/middlewares/cors");
const setupMonitoringSocket = require("./src/sockets/monitor");
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.LOCALHOST_FRONTEND,
    methods: "GET",
  },
});

setupMonitoringSocket(io);

connectDatabase();

app.use(corsMiddleware);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/v1/users", usersRouter);
app.use((req, res) => {
  res.status(404).send("Not Found");
});
app.use((err, req, res) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      status: err.status,
    },
  });
});

module.exports = { app, httpServer, io };
