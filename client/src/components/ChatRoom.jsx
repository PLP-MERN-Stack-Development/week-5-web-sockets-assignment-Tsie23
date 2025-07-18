import React, { useState, useEffect, useRef } from 'react';
import {
  joinRoom,
  sendRoomMessage,
  sendFileMessage,
  reactToMessage,
} from '../socket/socket';
import axios from 'axios';

const ChatRoom = ({ username, socket }) => {
  const [currentRoom, setCurrentRoom] = useState('general');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [rooms] = useState(['general', 'tech', 'random']);
  const [file, setFile] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [privateRecipient, setPrivateRecipient] = useState('');
  const typingTimeout = useRef(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const notificationAudioRef = useRef(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  // Fetch paginated messages
  const fetchMessages = async (room, pageNum = 1, prepend = false) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/messages/${room}?page=${pageNum}`);
      const msgs = res.data;
      if (msgs.length === 0) setHasMore(false);
      if (prepend) {
        setMessages((prev) => Array.isArray(msgs) ? [...msgs, ...prev] : prev);
      } else {
        setMessages(Array.isArray(msgs) ? msgs : []);
      }
    } catch (err) {
      setHasMore(false);
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket) return;
    // Always join the current room after socket connects or room changes
    socket.emit('joinRoom', currentRoom);
    socket.emit('getOnlineUsers', currentRoom);
  }, [socket, currentRoom]);

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    if (!socket) return;
    // Remove all listeners before adding new ones to avoid duplicates
    socket.off('chatMessage');
    socket.off('fileMessage');
    socket.off('systemMessage');
    socket.off('messageReaction');
    socket.off('userTyping');
    socket.off('onlineUsers');
    socket.off('privateMessage');
    socket.off('delivered');
    socket.off('read');
    socket.off('connect');
    socket.off('disconnect');

    socket.on('chatMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (Notification.permission === 'granted') {
        new Notification(`${msg.username}: ${msg.message}`);
      }
      if (notificationAudioRef.current) notificationAudioRef.current.play();
    });
    socket.on('fileMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (Notification.permission === 'granted') {
        new Notification(`${msg.username} sent a file: ${msg.filename}`);
      }
      if (notificationAudioRef.current) notificationAudioRef.current.play();
    });
    socket.on('systemMessage', (msg) => {
      setMessages((prev) => [...prev, { ...msg, system: true }]);
    });
    socket.on('messageReaction', ({ messageId, reaction }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, reaction } : m
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
      if (notificationAudioRef.current) notificationAudioRef.current.play();
    });
    socket.on('delivered', ({ messageId }) => {
      setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, delivered: true } : m));
    });
    socket.on('read', ({ messageId }) => {
      setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, read: true } : m));
    });
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    return () => {
      socket.off('chatMessage');
      socket.off('fileMessage');
      socket.off('systemMessage');
      socket.off('messageReaction');
      socket.off('userTyping');
      socket.off('onlineUsers');
      socket.off('privateMessage');
      socket.off('delivered');
      socket.off('read');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket, currentRoom]);

  useEffect(() => {
    if (!socket) return;
    setPage(1);
    setHasMore(true);
    fetchMessages(currentRoom, 1, false);
  }, [socket, currentRoom]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('readMessages', currentRoom);
  }, [socket, currentRoom]);

  const handleSend = () => {
    if (!socket) return;
    if (message.trim()) {
      if (privateRecipient) {
        socket.emit('privateMessage', {
          to: privateRecipient,
          message,
          username,
          timestamp: new Date().toISOString(),
        });
      } else {
        socket.emit('roomMessage', { room: currentRoom, message, username });
      }
      setMessage('');
      setPrivateRecipient('');
    }
  };

  const handleRoomChange = (e) => {
    setCurrentRoom(e.target.value);
    setMessages([]);
    if (socket) {
      socket.emit('joinRoom', e.target.value);
      socket.emit('getOnlineUsers', e.target.value);
    }
  };

  const handleFileChange = (e) => {
    if (!socket) return;
    const fileObj = e.target.files[0];
    if (!fileObj) return;
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('fileMessage', { room: currentRoom, file: reader.result, filename: fileObj.name, username });
    };
    reader.readAsDataURL(fileObj);
    setFile(null);
  };

  const handleReaction = (msgId, reaction) => {
    if (socket) {
      socket.emit('reactMessage', { messageId: msgId, reaction, room: currentRoom });
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing', { room: currentRoom, username });
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {}, 2000);
  };

  // Load older messages
  const handleLoadOlder = async () => {
    const nextPage = page + 1;
    await fetchMessages(currentRoom, nextPage, true);
    setPage(nextPage);
  };

  return (
    <div style={{ maxWidth: 500, margin: 'auto' }}>
      {!isConnected && (
        <div style={{ color: 'red', marginBottom: 8 }}>Connection lost. Trying to reconnect...</div>
      )}
      {error && (
        <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>
      )}
      <h2>Room: {currentRoom}</h2>
      <select value={currentRoom} onChange={handleRoomChange}>
        {rooms.map((room) => (
          <option key={room} value={room}>{room}</option>
        ))}
      </select>
      <div style={{ margin: '10px 0', fontSize: '0.9em', color: '#555' }}>
        <strong>Online users:</strong> {onlineUsers.join(', ')}
      </div>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search messages..."
        style={{ width: '100%', marginBottom: 8 }}
      />
      <div style={{ border: '1px solid #ccc', height: 300, overflowY: 'auto', margin: '10px 0', padding: 10 }}>
        {hasMore && (
          <button onClick={handleLoadOlder} disabled={loading} style={{ width: '100%' }}>
            {loading ? <span>Loading <span className="spinner" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #ccc', borderTop: '2px solid #333', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span></span> : 'Load older messages'}
          </button>
        )}
        {messages.filter(m => m.message && (!search || m.message.toLowerCase().includes(search.toLowerCase()))).map((msg) => (
          <div key={msg.id || msg.timestamp} style={{ marginBottom: 10, background: msg.private ? '#ffe' : msg.system ? '#eef' : 'inherit', fontStyle: msg.system ? 'italic' : 'normal', color: msg.system ? '#555' : 'inherit' }}>
            {msg.system ? (
              <span>{msg.message}</span>
            ) : (
              <>
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
                {/* Delivery/read checkmark for own messages */}
                {msg.username === username && (
                  <span style={{ marginLeft: 8 }}>
                    {msg.read ? (
                      <span title="Read" style={{ color: 'green' }}>✔</span>
                    ) : msg.delivered ? (
                      <span title="Delivered" style={{ color: 'gray' }}>✔</span>
                    ) : null}
                  </span>
                )}
                <div>
                  <button onClick={() => handleReaction(msg.id, '👍')}>👍</button>
                  <button onClick={() => handleReaction(msg.id, '😂')}>😂</button>
                  <button onClick={() => handleReaction(msg.id, '❤️')}>❤️</button>
                  {msg.reaction && <span> {msg.reaction}</span>}
                </div>
              </>
            )}
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
      <audio ref={notificationAudioRef} src="https://upload.wikimedia.org/wikipedia/commons/8/8e/Beep-sound.mp3" preload="auto" />
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ChatRoom;

