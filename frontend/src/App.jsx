import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";


const socket = io(
  "https://fullstack-chat-messingo-production.up.railway.app"
);

function App() {
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [toUser, setToUser] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  

  const chatRef = useRef(null);

  useEffect(() => {
  socket.on("register_success", () => {
    setLoggedIn(true);
  });

  socket.on("username_error", (msg) => {
    alert(msg);
  });

  return () => {
    socket.off("register_success");
    socket.off("username_error");
  };
}, []);

  // Listen for messages
  useEffect(() => {
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const login = () => {
    if (!username.trim()) return;
    socket.emit("register", username);
  };

  const sendMessage = () => {
    if (!message.trim() || !toUser.trim()) return;

    socket.emit("private_message", {
      to: toUser,
      text: message,
    });

    setMessage("");
  };

  // ---------------- LOGIN SCREEN ----------------
  if (!loggedIn) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>Login to Chat</h2>
          <input
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={login}>Login</button>
        </div>
      </div>
    );
  }

  // ---------------- CHAT SCREEN ----------------
  return (
    <div className="app-container">
      <div className="chat-wrapper">
        <div className="chat-header">
          Logged in as <strong>{username}</strong>
        </div>

        <div className="chat-box" ref={chatRef}>
          {messages.map((msg, index) => {
            const time = msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <div
                key={index}
                className={`message ${
                  msg.sender === username ? "sent" : "received"
                }`}
              >
                <strong>{msg.text}</strong>
                <div className="time">from: {msg.sender}</div>
                <div className="time">{time}</div>
                
              </div>
            );
          })}
        </div>

        <div className="input-group">
          <input
            placeholder="Send to..."
            value={toUser}
            onChange={(e) => setToUser(e.target.value)}
          />
        </div>

        <div className="input-group">
          <input
            placeholder="Message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;