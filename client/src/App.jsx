import { useEffect, useState } from 'react';
import { useSocket } from './socket/socket';

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [privateId, setPrivateId] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const {
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    messages,
    users,
    typingUsers,
    isConnected,
  } = useSocket();

  useEffect(() => {
    setTyping(isTyping);
  }, [isTyping]);

  const handleSend = () => {
    if (privateId) {
      sendPrivateMessage(privateId, message);
    } else {
      sendMessage(message);
    }
    setMessage('');
    setIsTyping(false);
  };

  const handleJoin = () => {
    connect(username);
  };

  return (
    <div className="container">
      {!isConnected ? (
        <div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username (e.g. Thato)"
          />
          <button onClick={handleJoin}>Join Chat</button>
        </div>
      ) : (
        <div>
          <div>
            <input
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setIsTyping(true);
              }}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <input
              value={privateId}
              onChange={(e) => setPrivateId(e.target.value)}
              placeholder="Private recipient ID (optional)"
            />
            <button onClick={handleSend}>Send</button>
            <button onClick={disconnect}>Leave Chat</button>
          </div>

          <div>
            {typingUsers.length > 0 && <p>{typingUsers.join(', ')} is typing...</p>}
            {messages.map((msg) => (
              <p key={msg.id}>
                <strong>{msg.sender}:</strong> {msg.message}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default App;