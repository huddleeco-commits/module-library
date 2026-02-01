/**
 * ChatWidget Component
 * A reusable floating chat widget for AI conversations
 */

import React, { useState, useRef, useEffect } from 'react';

const styles = {
  // Floating button
  floatingButton: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
    transition: 'all 0.3s ease',
    zIndex: 1000
  },
  floatingButtonHover: {
    transform: 'scale(1.1)',
    boxShadow: '0 6px 24px rgba(99, 102, 241, 0.5)'
  },
  // Badge for unread messages
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#ef4444',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  // Chat panel
  panel: {
    position: 'fixed',
    bottom: '96px',
    right: '24px',
    width: '380px',
    maxHeight: '520px',
    background: '#1a1a2e',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 1000,
    animation: 'slideUp 0.3s ease'
  },
  panelHidden: {
    display: 'none'
  },
  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  headerIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem'
  },
  headerInfo: {
    flex: 1
  },
  headerTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0
  },
  headerSubtitle: {
    fontSize: '0.75rem',
    color: '#888',
    margin: 0
  },
  closeBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    color: '#888',
    fontSize: '1.2rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  // Messages area
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minHeight: '200px',
    maxHeight: '320px'
  },
  // Empty state
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    padding: '20px'
  },
  emptyIcon: {
    fontSize: '2.5rem',
    marginBottom: '12px'
  },
  emptyTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px'
  },
  emptyText: {
    fontSize: '0.85rem',
    color: '#888',
    marginBottom: '16px'
  },
  // Quick prompts
  quickPrompts: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center'
  },
  quickPrompt: {
    padding: '8px 14px',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '20px',
    color: '#a5b4fc',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  // Message styles
  message: {
    display: 'flex',
    gap: '10px',
    maxWidth: '100%'
  },
  messageUser: {
    flexDirection: 'row-reverse'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    flexShrink: 0
  },
  avatarAI: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
  },
  avatarUser: {
    background: 'rgba(255, 255, 255, 0.1)'
  },
  bubble: {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: '16px',
    fontSize: '0.85rem',
    lineHeight: '1.5',
    wordBreak: 'break-word'
  },
  bubbleAI: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#e4e4e4',
    borderBottomLeftRadius: '4px'
  },
  bubbleUser: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    borderBottomRightRadius: '4px'
  },
  // Loading indicator
  loading: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start'
  },
  loadingBubble: {
    padding: '16px 20px',
    background: 'rgba(99, 102, 241, 0.15)',
    borderRadius: '16px',
    borderBottomLeftRadius: '4px',
    display: 'flex',
    gap: '6px'
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#6366f1',
    animation: 'bounce 1.4s infinite ease-in-out'
  },
  // Input area
  inputArea: {
    display: 'flex',
    gap: '10px',
    padding: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(0, 0, 0, 0.2)'
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  },
  inputFocused: {
    borderColor: 'rgba(99, 102, 241, 0.5)'
  },
  sendBtn: {
    width: '44px',
    height: '44px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '1.1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  sendBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  // Timestamp
  timestamp: {
    fontSize: '0.65rem',
    color: '#666',
    marginTop: '4px',
    textAlign: 'center'
  }
};

// CSS keyframes (injected once)
const injectStyles = () => {
  if (typeof document !== 'undefined' && !document.getElementById('chat-widget-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'chat-widget-styles';
    styleSheet.textContent = `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes bounce {
        0%, 80%, 100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(styleSheet);
  }
};

export default function ChatWidget({
  title = 'AI Assistant',
  subtitle = 'Ask me anything',
  placeholder = 'Type your message...',
  welcomeTitle = 'Hi there! 👋',
  welcomeMessage = 'How can I help you today?',
  quickPrompts = [],
  onSendMessage,
  initialMessages = [],
  position = 'bottom-right'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Inject keyframe animations
  useEffect(() => {
    injectStyles();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async (messageText = input) => {
    const text = messageText.trim();
    if (!text || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (onSendMessage) {
        const response = await onSendMessage(text, messages);
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);

        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      }
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate position styles
  const getPositionStyles = () => {
    const positions = {
      'bottom-right': { bottom: '24px', right: '24px' },
      'bottom-left': { bottom: '24px', left: '24px' },
      'top-right': { top: '24px', right: '24px' },
      'top-left': { top: '24px', left: '24px' }
    };
    return positions[position] || positions['bottom-right'];
  };

  const positionStyles = getPositionStyles();
  const panelPosition = position.includes('bottom')
    ? { bottom: '96px', ...positionStyles, bottom: undefined }
    : { top: '96px', ...positionStyles, top: undefined };

  return (
    <>
      {/* Chat Panel */}
      <div style={{
        ...styles.panel,
        ...panelPosition,
        right: positionStyles.right,
        left: positionStyles.left,
        ...(isOpen ? {} : styles.panelHidden)
      }}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>🤖</div>
          <div style={styles.headerInfo}>
            <h3 style={styles.headerTitle}>{title}</h3>
            <p style={styles.headerSubtitle}>{subtitle}</p>
          </div>
          <button
            style={styles.closeBtn}
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div style={styles.messagesArea}>
          {messages.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>💬</div>
              <div style={styles.emptyTitle}>{welcomeTitle}</div>
              <div style={styles.emptyText}>{welcomeMessage}</div>
              {quickPrompts.length > 0 && (
                <div style={styles.quickPrompts}>
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      style={styles.quickPrompt}
                      onClick={() => handleSend(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    ...styles.message,
                    ...(msg.role === 'user' ? styles.messageUser : {})
                  }}
                >
                  <div style={{
                    ...styles.avatar,
                    ...(msg.role === 'assistant' ? styles.avatarAI : styles.avatarUser)
                  }}>
                    {msg.role === 'assistant' ? '🤖' : '👤'}
                  </div>
                  <div>
                    <div style={{
                      ...styles.bubble,
                      ...(msg.role === 'assistant' ? styles.bubbleAI : styles.bubbleUser)
                    }}>
                      {msg.content}
                    </div>
                    {msg.timestamp && (
                      <div style={{
                        ...styles.timestamp,
                        textAlign: msg.role === 'user' ? 'right' : 'left'
                      }}>
                        {formatTime(msg.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={styles.loading}>
                  <div style={{...styles.avatar, ...styles.avatarAI}}>🤖</div>
                  <div style={styles.loadingBubble}>
                    <div style={{...styles.dot, animationDelay: '0s'}} />
                    <div style={{...styles.dot, animationDelay: '0.16s'}} />
                    <div style={{...styles.dot, animationDelay: '0.32s'}} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div style={styles.inputArea}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder={placeholder}
            style={{
              ...styles.input,
              ...(inputFocused ? styles.inputFocused : {})
            }}
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            style={{
              ...styles.sendBtn,
              ...(!input.trim() || loading ? styles.sendBtnDisabled : {})
            }}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>

      {/* Floating Button */}
      <button
        style={{
          ...styles.floatingButton,
          ...positionStyles
        }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>
    </>
  );
}
