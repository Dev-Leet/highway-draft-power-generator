/* require("dotenv").config();
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
 */
require("dotenv").config();
const express    = require("express");
const http       = require("http");
const { Server } = require("socket.io");
const cors       = require("cors");
const connectDB      = require("./config/db");
const { startStream } = require("./socket/dataStream");

connectDB();

const app        = express();
const httpServer = http.createServer(app);
const io         = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ["GET", "POST"] },
});

// Expose io instance to route handlers via req.app.get("io")
app.set("io", io);

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use("/api/auth",     require("./routes/auth"));
app.use("/api/data",     require("./routes/data"));
app.use("/api/admin",    require("./routes/admin"));
app.use("/api/hardware", require("./routes/hardware"));

io.on("connection", (socket) => {
  console.log(`Client connected:    ${socket.id}`);
  socket.on("disconnect", () => console.log(`Client disconnected: ${socket.id}`));
});

if (process.env.USE_SIMULATION !== "false") {
  startStream(io);
  console.log("DataStreamService: SIMULATION MODE active");
} else {
  console.log("DataStreamService: DISABLED — listening for hardware on POST /api/hardware/ingest");
}

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on http://0.0.0.0:${PORT}`)
);

//netsh advfirewall firewall add rule name="HDPG Node Server" dir=in action=allow protocol=TCP localport=5000