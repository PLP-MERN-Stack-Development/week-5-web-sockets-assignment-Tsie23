# 🔄 Real-Time Chat Application with Socket.io

## 🚀 Project Overview

This project is a full-stack real-time chat application built with **React**, **Express**, and **Socket.io**. It supports global and private messaging, multiple chat rooms, file/image sharing, message reactions, typing indicators, delivery/read receipts, notifications, message search, pagination, and is optimized for both desktop and mobile devices.

---

## ✨ Features

- **User Authentication:** Simple username-based login.
- **Global & Multiple Chat Rooms:** Join "general", "tech", or "random" rooms, or create your own.
- **Private Messaging:** Send direct messages to any online user in the same room.
- **Real-Time Messaging:** Instant message delivery using Socket.io.
- **File & Image Sharing:** Upload and share files or images in chat.
- **Message Reactions:** React to messages with emojis (like, laugh, love, etc.).
- **Read Receipts & Delivery Acknowledgment:** See when your messages are delivered and read.
- **Typing Indicators:** See when other users are typing.
- **Online/Offline Status:** View who is currently online in each room.
- **System Messages:** Notifications when users join or leave a room.
- **Unread Message Count:** See how many messages you missed.
- **Sound & Browser Notifications:** Get notified of new messages even when the tab is inactive.
- **Message Pagination:** Load older messages as you scroll up.
- **Message Search:** Search messages in the current room.
- **Responsive Design:** Works well on both desktop and mobile devices.
- **Error Handling & Loading States:** User-friendly error and loading feedback.

---

## 🏗️ Project Structure

```
week-5-web-sockets-assignment-Tsie23/
  ├── client/         # React frontend
  │   ├── src/
  │   │   ├── components/
  │   │   │   ├── ChatRoom.jsx
  │   │   │   ├── MessageItem.jsx
  │   │   │   └── UserList.jsx
  │   │   ├── socket/
  │   │   │   └── socket.js
  │   │   ├── App.jsx
  │   │   ├── index.css
  │   │   └── main.jsx
  │   ├── index.html
  │   └── package.json
  ├── server/         # Express + Socket.io backend
  │   ├── routes/
  │   │   ├── messageRoutes.js
  │   │   └── userRoutes.js
  │   ├── server.js
  │   ├── store.js
  │   └── package.json
  ├── README.md
  └── Week5-Assignment.md
```

---

## ⚙️ Setup Instructions

### Prerequisites

- **Node.js** v18+ (recommended)
- **pnpm** (recommended) or **npm**

### Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd week-5-web-sockets-assignment-Tsie23
   ```

2. **Install dependencies for both server and client:**
   ```sh
   cd server
   pnpm install         # or npm install
   cd ../client
   pnpm install         # or npm install
   ```

### Running the App

1. **Start the server:**
   ```sh
   cd server
   pnpm run dev         # or npm run dev
   ```

2. **Start the client:**
   ```sh
   cd ../client
   pnpm run dev         # or npm run dev
   ```

3. **Open your browser and go to:**
   ```
   http://localhost:5173
   ```

---

## 🖥️ Usage

- **Enter a username** to join the chat.
- **Select a room** or create your own.
- **Send messages, files, or images** to the room.
- **React to messages** with emojis.
- **Send private messages** using the dropdown.
- **See who is online** and who is typing.
- **Search messages** or load older messages.
- **Receive notifications** for new messages.

---

## 📸 Screenshots / GIFs

**Chat App Screenshot:** (client/src/chat-screenshot.png)


---

## 🌐 Deployment

You can deploy the server to services like **Render**, **Railway**, or **Heroku**, and the client to **Vercel**, **Netlify**, or **GitHub Pages**.

- **Server:** Deploy `/server` and set the appropriate CORS and environment variables.
- **Client:** Deploy `/client` and set `VITE_SOCKET_URL` to your server’s public URL.

---

## 📝 Assignment & Credits

This project was built as part of a Socket.io real-time communication assignment.  
See `Week5-Assignment.md` for the full requirements.

---

## 🛠️ Troubleshooting

- **Notifications Blocked:** If browser notifications are not working, check your browser’s notification permissions.
- **Duplicate Message Key Warning:** If you see a React warning about duplicate keys, ensure each message has a unique `id` (see code comments for a fix).
- **WebSocket Issues:** Make sure both client and server are running and the client is configured to connect to the correct server URL.

---

## 📚 License

MIT (or specify your license here)

---

**Happy chatting! 🚀**