import React, { useState, useEffect, useRef } from 'react';
import {
  joinRoom,
  sendRoomMessage,
  sendFileMessage,
  reactToMessage,
  socket,
} from '../socket/socket';

const ChatRoom = ({ username }) => {
  const [currentRoom, setCurrentRoom] = useState('general');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [rooms] = useState(['general', 'tech', 'random']);
  const [file, setFile] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [privateRecipient, setPrivateRecipient] = useState('');
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    joinRoom(currentRoom);

    socket.emit('getOnlineUsers', currentRoom);

    socket.on('chatMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (Notification.permission === 'granted') {
        new Notification(`${msg.username}: ${msg.message}`);
      }
    });

    socket.on('fileMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (Notification.permission === 'granted') {
        new Notification(`${msg.username} sent a file: ${msg.filename}`);
      }
    });

    socket.on('messageReaction', ({ messageId, reaction }) => {
      setMessages((prev) =>
        prev.map((m, idx) =>
          idx === messageId
            ? { ...m, reaction }
            : m
        )
      );
    });

    socket.on('userTyping', ({ username: typingUser }) => {
      setTypingUsers((prev) =>
        prev.includes(typingUser) ? prev : [...prev, typingUser]
      );
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== typingUser));
      }, 2000);
    });

    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    socket.on('privateMessage', (msg) => {
      setMessages((prev) => [...prev, { ...msg, private: true }]);
      if (Notification.permission === 'granted') {
        new Notification(`Private from ${msg.username}: ${msg.message}`);
      }
    });

    return () => {
      socket.off('chatMessage');
      socket.off('fileMessage');
      socket.off('messageReaction');
      socket.off('userTyping');
      socket.off('onlineUsers');
      socket.off('privateMessage');
    };
  }, [currentRoom]);

  const handleSend = () => {
    if (message.trim()) {
      if (privateRecipient) {
        socket.emit('privateMessage', {
          to: privateRecipient,
          message,
          username,
          timestamp: new Date().toISOString(),
        });
      } else {
        sendRoomMessage(currentRoom, message, username);
      }
      setMessage('');
      setPrivateRecipient('');
    }
  };

  const handleRoomChange = (e) => {
    setCurrentRoom(e.target.value);
    setMessages([]);
    joinRoom(e.target.value);
    socket.emit('getOnlineUsers', e.target.value);
  };

  const handleFileChange = (e) => {
    const fileObj = e.target.files[0];
    if (!fileObj) return;
    const reader = new FileReader();
    reader.onload = () => {
      sendFileMessage(currentRoom, reader.result, fileObj.name, username);
    };
    reader.readAsDataURL(fileObj);
    setFile(null);
  };

  const handleReaction = (idx, reaction) => {
    reactToMessage(idx, reaction, currentRoom);
  };

  const handleTyping = () => {
    socket.emit('typing', { room: currentRoom, username });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {}, 2000);
  };

  return (
    <div style={{ maxWidth: 500, margin: 'auto' }}>
      <h2>Room: {currentRoom}</h2>
      <select value={currentRoom} onChange={handleRoomChange}>
        {rooms.map((room) => (
          <option key={room} value={room}>{room}</option>
        ))}
      </select>
      <div style={{ margin: '10px 0', fontSize: '0.9em', color: '#555' }}>
        <strong>Online users:</strong> {onlineUsers.join(', ')}
      </div>
      <div style={{ border: '1px solid #ccc', height: 300, overflowY: 'auto', margin: '10px 0', padding: 10 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 10, background: msg.private ? '#ffe' : 'inherit' }}>
            <strong>{msg.username}</strong> [{new Date(msg.timestamp).toLocaleTimeString()}]:
            {msg.private && <span style={{ color: 'red' }}> (private)</span>}
            {msg.message && <span> {msg.message}</span>}
            {msg.file && (
              <div>
                <a href={msg.file} download={msg.filename}>{msg.filename}</a>
                <br />
                {msg.file.startsWith('data:image') && (
                  <img src={msg.file} alt={msg.filename} style={{ maxWidth: 200 }} />
                )}
              </div>
            )}
            <div>
              <button onClick={() => handleReaction(idx, '👍')}>👍</button>
              <button onClick={() => handleReaction(idx, '😂')}>😂</button>
              <button onClick={() => handleReaction(idx, '❤️')}>❤️</button>
              {msg.reaction && <span> {msg.reaction}</span>}
            </div>
          </div>
        ))}
        {typingUsers.length > 0 && (
          <div style={{ fontStyle: 'italic', color: '#888' }}>
            {typingUsers.join(', ')} typing...
          </div>
        )}
      </div>
      <div>
        <input
          type="text"
          value={message}
          placeholder="Type a message..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            handleTyping();
            if (e.key === 'Enter') handleSend();
          }}
          style={{ width: '60%' }}
        />
        <button onClick={handleSend}>Send</button>
        <input type="file" onChange={handleFileChange} style={{ marginLeft: 10 }} />
      </div>
      <div style={{ marginTop: 10 }}>
        <label>
          Send private message to:
          <select
            value={privateRecipient}
            onChange={(e) => setPrivateRecipient(e.target.value)}
            style={{ marginLeft: 5 }}
          >
            <option value="">--none--</option>
            {onlineUsers.filter(u => u !== username).map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};

export default ChatRoom;

