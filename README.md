[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19912169&assignment_repo_type=AssignmentRepo)
# 🔄 Real-Time Chat Application with Socket.io

## Project Overview
This project is a real-time chat application built with React, Express, and Socket.io. It supports global and private messaging, multiple chat rooms, file/image sharing, message reactions, typing indicators, delivery/read receipts, notifications, message search, pagination, and is optimized for both desktop and mobile devices.

## Features Implemented
- [x] Real-time messaging using Socket.io
- [x] User authentication (simple username)
- [x] Global chat room
- [x] Multiple chat rooms/channels
- [x] Private messaging
- [x] Display sender's name and timestamp
- [x] Typing indicators
- [x] Online/offline status
- [x] File/image sharing
- [x] Message reactions (like, love, etc.)
- [x] Read receipts (green checkmark)
- [x] Delivery acknowledgment (gray checkmark)
- [x] Unread message count
- [x] Browser notifications
- [x] Sound notifications
- [x] Message pagination (load older messages)
- [x] Message search
- [x] Responsive/mobile design
- [x] Error handling and loading states

## Setup Instructions

### Prerequisites
- Node.js v18+
- pnpm (recommended for this project)

### Installation
1. Clone the repository:
   ```sh
   git clone <your-repo-url>
   cd week-5-web-sockets-assignment-Tsie23
   ```
2. Install dependencies for both server and client:
   ```sh
   cd server
   pnpm install
   cd ../client
   pnpm install
   ```

### Running the App
1. Start the server:
   ```sh
   cd server
   pnpm run dev
   ```
2. Start the client:
   ```sh
   cd ../client
   pnpm run dev
   ```
3. Open your browser and go to the client URL (usually http://localhost:5173)

## Screenshots / GIFs
<!-- Add screenshots or GIFs of your application here -->
![Chat Screenshot Placeholder](https://via.placeholder.com/600x300?text=Chat+App+Screenshot)

## Deployment (Optional)
- Deploy the server to Render, Railway, or Heroku
- Deploy the client to Vercel, Netlify, or GitHub Pages
- Add the deployed URLs here

## Credits
- Built for Week 5: Real-Time Communication with Socket.io assignment
- Powered by React, Express, and Socket.io