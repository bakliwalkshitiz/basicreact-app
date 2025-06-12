import React, { useState, useRef, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'ByteXLSecretKey123!';
const USERS = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];

const ChatDemoDualPrivateBoxes = () => {
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [mode, setMode] = useState('public'); // public or private
  const [privateTo, setPrivateTo] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const encryptMessage = (msg) => CryptoJS.AES.encrypt(msg, SECRET_KEY).toString();
  const decryptMessage = (cipher) => {
    try {
      const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8) || '[Decryption error]';
    } catch {
      return '[Decryption error]';
    }
  };

  const joinChat = () => {
    if (username) setJoined(true);
  };

  // For private mode, track which box (user) is currently typing
  const [typingUser, setTypingUser] = useState('');

  // Send message from given user (for private mode)
  const sendPrivateMessage = (fromUser, toUser, msg) => {
    if (!msg.trim()) return;
    if (fromUser === toUser) {
      alert('Sender and receiver cannot be same.');
      return;
    }
    const encrypted = encryptMessage(msg.trim());
    setChat((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: fromUser,
        encrypted,
        mode: 'private',
        to: toUser,
      },
    ]);
  };

  // Send message from current user (for public mode)
  const sendPublicMessage = () => {
    if (!message.trim()) return;
    const encrypted = encryptMessage(message.trim());
    setChat((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: username,
        encrypted,
        mode: 'public',
        to: null,
      },
    ]);
    setMessage('');
  };

  if (!joined) {
    return (
      <div style={{ maxWidth: 400, margin: '3rem auto', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#2563eb' }}>Select User</h2>
        <select
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
        >
          <option value="">-- Select your username --</option>
          {USERS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <button
          onClick={joinChat}
          disabled={!username}
          style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: 4 }}
        >
          Join Chat
        </button>
      </div>
    );
  }

  // Filter messages for public or private conversation between two users
  const privateMessages = chat.filter(
    (msg) =>
      msg.mode === 'private' &&
      ((msg.user === username && msg.to === privateTo) || (msg.user === privateTo && msg.to === username))
  );

  // Public messages
  const publicMessages = chat.filter((msg) => msg.mode === 'public');

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#2563eb' }}>User: {username}</h2>

      <div style={{ marginBottom: '1rem' }}>
        <strong>Users: </strong>
        {mode === 'public' ? USERS.join(', ') : privateTo || 'Select a user'}
      </div>

      <div style={{ marginBottom: 20 }}>
        <select
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
            setMessage('');
            setPrivateTo('');
            setTypingUser('');
          }}
          style={{ padding: '0.5rem', fontSize: '1rem', marginRight: 10 }}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        {mode === 'private' && (
          <select
            value={privateTo}
            onChange={(e) => {
              setPrivateTo(e.target.value);
              setTypingUser(e.target.value); // default typing box to selected user
            }}
            style={{ padding: '0.5rem', fontSize: '1rem' }}
          >
            <option value="">Select user</option>
            {USERS.filter((u) => u !== username).map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        )}
      </div>

      {mode === 'public' && (
        <>
          {/* Public chat box */}
          <div
            style={{
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              height: 350,
              overflowY: 'auto',
              padding: '1rem',
              backgroundColor: '#f1f5f9',
              marginBottom: 10,
            }}
          >
            {publicMessages.length === 0 && <p style={{ color: '#64748b' }}>No messages yet.</p>}
            {publicMessages.map(({ id, user, encrypted }) => (
              <div
                key={id}
                style={{
                  marginBottom: '1rem',
                  textAlign: user === username ? 'right' : 'left',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: user === username ? '#2563eb' : '#e2e8f0',
                    color: user === username ? 'white' : '#1e293b',
                    padding: '0.5rem 1rem',
                    borderRadius: 20,
                    maxWidth: '70%',
                    wordBreak: 'break-word',
                  }}
                  title={`Encrypted: ${encrypted}`}
                >
                  {decryptMessage(encrypted)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{user}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input for public */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ flexGrow: 1, padding: '0.5rem', fontSize: '1rem' }}
              onKeyDown={(e) => e.key === 'Enter' && sendPublicMessage()}
            />
            <button
              onClick={sendPublicMessage}
              disabled={!message.trim()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: 4,
              }}
            >
              Send
            </button>
          </div>
        </>
      )}

      {mode === 'private' && privateTo && (
        <div style={{ display: 'flex', gap: 20 }}>
          {/* Your chat box */}
          <PrivateChatBox
            user={username}
            otherUser={privateTo}
            messages={privateMessages}
            onSend={(msg) => sendPrivateMessage(username, privateTo, msg)}
            isTyping={typingUser === username}
            setTypingUser={setTypingUser}
          />

          {/* Other user's chat box */}
          <PrivateChatBox
            user={privateTo}
            otherUser={username}
            messages={privateMessages}
            onSend={(msg) => sendPrivateMessage(privateTo, username, msg)}
            isTyping={typingUser === privateTo}
            setTypingUser={setTypingUser}
          />
        </div>
      )}
    </div>
  );
};

const PrivateChatBox = ({ user, otherUser, messages, onSend, isTyping, setTypingUser }) => {
  const [input, setInput] = useState('');
  const boxEndRef = useRef(null);

  useEffect(() => {
    boxEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div
      style={{
        border: '1px solid #2563eb',
        borderRadius: 8,
        width: 400,
        height: 400,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f0f9ff',
      }}
    >
      <div
        style={{
          padding: '0.5rem 1rem',
          borderBottom: '1px solid #2563eb',
          fontWeight: 'bold',
          backgroundColor: '#2563eb',
          color: 'white',
          userSelect: 'none',
        }}
      >
        {user} (Chat with {otherUser})
      </div>
      <div
        style={{
          flexGrow: 1,
          padding: '1rem',
          overflowY: 'auto',
          backgroundColor: 'white',
        }}
      >
        {messages.length === 0 && <p style={{ color: '#64748b' }}>No messages yet.</p>}
        {messages.map(({ id, user: msgUser, encrypted }) => (
          <div
            key={id}
            style={{
              marginBottom: 10,
              textAlign: msgUser === user ? 'right' : 'left',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                backgroundColor: msgUser === user ? '#2563eb' : '#e2e8f0',
                color: msgUser === user ? 'white' : '#1e293b',
                padding: '0.4rem 0.8rem',
                borderRadius: 16,
                maxWidth: '75%',
                wordBreak: 'break-word',
                fontStyle: 'italic',
              }}
              title={`Encrypted: ${encrypted}`}
            >
              {CryptoJS.AES.decrypt(encrypted, SECRET_KEY).toString(CryptoJS.enc.Utf8)}
            </div>
          </div>
        ))}
        <div ref={boxEndRef} />
      </div>
      <div style={{ display: 'flex', padding: '0.5rem', borderTop: '1px solid #2563eb' }}>
        <input
          type="text"
          placeholder={`Message as ${user}...`}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setTypingUser(user);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{ flexGrow: 1, padding: '0.5rem', fontSize: '1rem' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            marginLeft: 8,
            padding: '0.5rem 1rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 4,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatDemoDualPrivateBoxes;