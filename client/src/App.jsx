import React, { useState } from 'react';
import ChatRoom from './components/ChatRoom';
import { io } from 'socket.io-client';
import './index.css';
import { socket, connectSocket } from './socket/socket';

function App() {
  const [username, setUsername] = useState('');
  const [input, setInput] = useState('');

  const handleJoin = () => {
    if (input) {
      connectSocket(input);
      setUsername(input);
    }
  };

  return (
    <div className="container text-center">
      {!username ? (
        <div>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter your username"
            className="mb-2"
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