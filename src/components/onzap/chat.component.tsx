import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'contact';
  text: string;
  timestamp: Date;
  read: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface ChatProps {
  contactId: string;
  contactName: string;
}

export const OnzapChat: React.FC<ChatProps> = ({ contactId, contactName }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'contact',
      text: 'Olá! Quanto custa?',
      timestamp: new Date(Date.now() - 300000),
      read: true,
      status: 'read',
    },
    {
      id: '2',
      sender: 'user',
      text: 'Olá! Nossos planos começam em R$ 199/mês. Qual é seu interesse?',
      timestamp: new Date(Date.now() - 240000),
      read: true,
      status: 'read',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
      read: false,
      status: 'sent',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/onzap/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          contactId,
          message: input,
        }),
      });

      const aiResponse = await response.json();
      setIsTyping(false);

      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: aiResponse.message,
        timestamp: new Date(),
        read: true,
        status: 'delivered',
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="chat-header-info">
          <h2>{contactName}</h2>
          <span className="chat-status">🟢 Online agora</span>
        </div>
        <button className="chat-menu-btn">⋮</button>
      </header>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender === 'user' ? 'user' : 'contact'}`}
          >
            <div className="message-bubble">
              <p>{msg.text}</p>
              <span className="message-time">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {msg.sender === 'user' && (
              <span className="message-status">
                {msg.status === 'read' && '✓✓'}
                {msg.status === 'delivered' && '✓'}
                {msg.status === 'sent' && '○'}
              </span>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="message contact typing">
            <div className="message-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Escreva uma mensagem..."
          className="chat-input"
        />
        <button onClick={sendMessage} className="send-btn">
          ➤
        </button>
      </div>

      <style>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #1a1a1a;
          color: #fff;
          border-radius: 12px;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #333;
          background: #2d2d2d;
        }

        .chat-header-info h2 {
          margin: 0;
          font-size: 18px;
        }

        .chat-status {
          font-size: 12px;
          color: #00d084;
          margin-top: 4px;
          display: block;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message.user {
          justify-content: flex-end;
        }

        .message-bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 16px;
          word-wrap: break-word;
        }

        .message.user .message-bubble {
          background: #00d084;
          color: #1a1a1a;
          border-radius: 16px 4px 16px 16px;
        }

        .message.contact .message-bubble {
          background: #444;
          color: #fff;
          border-radius: 4px 16px 16px 16px;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 4px;
          display: block;
        }

        .message-status {
          font-size: 12px;
          color: #999;
          margin-left: 4px;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 4px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #999;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }

        .chat-input-area {
          display: flex;
          gap: 8px;
          padding: 16px;
          border-top: 1px solid #333;
          background: #2d2d2d;
        }

        .chat-input {
          flex: 1;
          background: #1a1a1a;
          border: 1px solid #444;
          border-radius: 20px;
          padding: 12px 16px;
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: all 0.3s;
        }

        .chat-input:focus {
          border-color: #00d084;
          box-shadow: 0 0 8px rgba(0, 208, 132, 0.3);
        }

        .send-btn {
          background: #00d084;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: #1a1a1a;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .send-btn:hover {
          background: #00b86a;
          transform: scale(1.05);
        }

        .send-btn:active {
          transform: scale(0.95);
        }

        @media (max-width: 768px) {
          .message-bubble {
            max-width: 85%;
          }
        }
      `}</style>
    </div>
  );
};
