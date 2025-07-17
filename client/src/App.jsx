import React, { useState } from 'react';
import ChatRoom from './components/ChatRoom';
import { io } from 'socket.io-client';
import './index.css';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

function App() {
  const [username, setUsername] = useState('');
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);

  const handleJoin = () => {
    if (input) {
      const s = io(SOCKET_URL, {
        query: { username: input },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      setSocket(s);
      setUsername(input);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
      {!username ? (
        <div>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter your username"
            style={{ width: '60%', marginRight: 8 }}
          />
          <button onClick={handleJoin}>Join Chat</button>
        </div>
      ) : (
        <ChatRoom username={username} socket={socket} />
      )}
    </div>
  );
}

export default App;