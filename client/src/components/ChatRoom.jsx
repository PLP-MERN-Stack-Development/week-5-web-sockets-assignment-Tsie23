import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    joinRoom(currentRoom);

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

    return () => {
      socket.off('chatMessage');
      socket.off('fileMessage');
      socket.off('messageReaction');
    };
  }, [currentRoom]);

  const handleSend = () => {
    if (message.trim()) {
      sendRoomMessage(currentRoom, message, username);
      setMessage('');
    }
  };

  const handleRoomChange = (e) => {
    setCurrentRoom(e.target.value);
    setMessages([]);
    joinRoom(e.target.value);
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

  return (
    <div style={{ maxWidth: 500, margin: 'auto' }}>
      <h2>Room: {currentRoom}</h2>
      <select value={currentRoom} onChange={handleRoomChange}>
        {rooms.map((room) => (
          <option key={room} value={room}>{room}</option>
        ))}
      </select>
      <div style={{ border: '1px solid #ccc', height: 300, overflowY: 'auto', margin: '10px 0', padding: 10 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 10 }}>
            <strong>{msg.username}</strong> [{new Date(msg.timestamp).toLocaleTimeString()}]:
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
      </div>
      <input
        type="text"
        value={message}
        placeholder="Type a message..."
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        style={{ width: '70%' }}
      />
      <button onClick={handleSend}>Send</button>
      <input type="file" onChange={handleFileChange} style={{ marginLeft: 10 }} />
    </div>
  );
};

export default ChatRoom;

