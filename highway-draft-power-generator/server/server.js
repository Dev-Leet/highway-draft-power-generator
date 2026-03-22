require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const { startStream } = require("./socket/dataStream");

connectDB();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ["GET", "POST"] },
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/data", require("./routes/data"));
app.use("/api/admin", require("./routes/admin"));

// Socket.io connection
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on("disconnect", () =>
    console.log(`Client disconnected: ${socket.id}`)
  );
});

// Start simulated hardware data stream
startStream(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
