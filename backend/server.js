const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
// });

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5175", "http://localhost:5174"],
    credentials: true,
  },
});

let users = {}; // username -> socket.id

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // Register username
  socket.on("register", (username) => {
    users[username] = socket.id;
    console.log("Users:", users);
  });



socket.on("private_message", ({ to, sender, text }) => {
  const targetSocket = users[to];

  const messageData = {
    sender,
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
      }
    }
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});