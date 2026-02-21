const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5175",
      "http://localhost:5174",
      "https://fullstack-chat-messingo.vercel.app",
    ],
    credentials: true,
  },
});

let users = {}; // username -> socket.id

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // Register username
 socket.on("register", (username) => {
  if (!username) return;

  // Check if username already taken
  if (users[username]) {
    socket.emit("username_error", "Username already taken");
    return;
  }

  // Save username
  users[username] = socket.id;
  socket.username = username;

  socket.emit("register_success");
});

  socket.on("private_message", ({ to, sender, text }) => {
    if (!to || !text) return;
    const targetSocket = users[to];

    const messageData = {
      sender: socket.username,
      text,
      createdAt: new Date().toISOString(),
    };

    if (targetSocket) {
      io.to(targetSocket).emit("receive_message", messageData);
    }

    socket.emit("receive_message", messageData);
  });
  socket.on("disconnect", () => {
    // Remove disconnected user
    for (let username in users) {
      if (users[username] === socket.id) {
        delete users[username];
        break;
      }
    }
  });
});
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
