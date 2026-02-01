/**
 * CardFlowAssistant Component
 * AI-powered assistant for the CardFlow setup wizard
 * Provides contextual help, suggestions, and guidance during onboarding
 */

import React, { useState, useRef, useEffect } from 'react';

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : '';

const styles = {
  container: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 1000
  },
  toggleButton: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
    transition: 'all 0.3s ease',
    fontSize: '1.5rem'
  },
  toggleButtonActive: {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 28px rgba(99, 102, 241, 0.5)'
  },
  panel: {
    position: 'absolute',
    bottom: '70px',
    right: '0',
    width: '380px',
    maxHeight: '500px',
    background: 'linear-gradient(180deg, #1a1a2e 0%, #16162a 100%)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideUp 0.3s ease'
  },
  panelHidden: {
    display: 'none'
  },
  header: {
    padding: '16px 20px',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))',
    borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  headerIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem'
  },
  headerText: {
    flex: 1
  },
  headerTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0
  },
  headerSubtitle: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0
  },
  closeBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    transition: 'all 0.2s ease'
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '300px'
  },
  message: {
    display: 'flex',
    gap: '10px',
    animation: 'fadeIn 0.2s ease'
  },
  messageUser: {
    flexDirection: 'row-reverse'
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    flexShrink: 0
  },
  avatarAI: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
  },
  avatarUser: {
    background: 'rgba(255, 255, 255, 0.15)'
  },
  messageBubble: {
    maxWidth: '80%',
    padding: '10px 14px',
    borderRadius: '14px',
    fontSize: '0.85rem',
    lineHeight: 1.5
  },
  messageBubbleAI: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#e4e4e4',
    borderBottomLeftRadius: '4px'
  },
  messageBubbleUser: {
    background: 'rgba(255, 255, 255, 0.12)',
    color: '#fff',
    borderBottomRightRadius: '4px'
  },
  suggestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px'
  },
  suggestionChip: {
    padding: '6px 12px',
    background: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '20px',
    fontSize: '0.75rem',
    color: '#22c55e',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  emptyState: {
    textAlign: 'center',
    padding: '24px 16px',
    color: '#888'
  },
  emptyIcon: {
    fontSize: '2.5rem',
    marginBottom: '12px',
    display: 'block'
  },
  emptyTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '8px'
  },
  emptyDesc: {
    fontSize: '0.8rem',
    color: '#888',
    marginBottom: '16px'
  },
  quickPrompts: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  quickPrompt: {
    padding: '10px 14px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#aaa',
    fontSize: '0.8rem',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease'
  },
  inputArea: {
    padding: '12px 16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    gap: '10px',
    background: 'rgba(0, 0, 0, 0.2)'
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.85rem',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  },
  sendBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    transition: 'all 0.2s ease'
  },
  sendBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    background: 'rgba(99, 102, 241, 0.1)',
    borderRadius: '14px',
    fontSize: '0.8rem',
    color: '#a5b4fc'
  },
  loadingDots: {
    display: 'flex',
    gap: '4px'
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#6366f1',
    animation: 'pulse 1.4s infinite ease-in-out both'
  },
  contextBadge: {
    padding: '6px 12px',
    background: 'rgba(99, 102, 241, 0.15)',
    borderRadius: '8px',
    fontSize: '0.7rem',
    color: '#a5b4fc',
    marginBottom: '8px'
  },
  tipCard: {
    padding: '12px 14px',
    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))',
    border: '1px solid rgba(251, 191, 36, 0.2)',
    borderRadius: '10px',
    marginBottom: '12px'
  },
  tipTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#fbbf24',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  tipText: {
    fontSize: '0.8rem',
    color: '#e4e4e4',
    lineHeight: 1.5,
    margin: 0
  }
};

// Step-specific tips for contextual help
const STEP_TIPS = {
  welcome: {
    title: 'Getting Started',
    tip: 'Blink uses AI to generate professional websites based on your business. Take your time with the setup - it helps us create a better result!'
  },
  'project-type': {
    title: 'Choosing a Project Type',
    tip: 'Each project type has different features. A Business Website is great for most businesses. Web Apps work better for interactive tools.'
  },
  business: {
    title: 'Business Information',
    tip: 'The more details you provide, the better AI can personalize your content. Industry and location help us match the right style.'
  },
  preferences: {
    title: 'Workflow Selection',
    tip: 'Guided Mode is recommended for beginners. Instant Mode is fastest. Custom Mode gives you full control over every decision.'
  },
  review: {
    title: 'Review Your Setup',
    tip: 'You can always change these settings later. Click Launch Builder when you\'re ready to start creating!'
  }
};

// Context-aware quick prompts based on current step
const STEP_PROMPTS = {
  welcome: [
    'What can I build with Blink?',
    'How long does it take to create a website?',
    'Do I need coding experience?'
  ],
  'project-type': [
    'What\'s the difference between a website and web app?',
    'Which project type is best for a small business?',
    'Can I change the project type later?'
  ],
  business: [
    'Why does industry matter?',
    'What if I don\'t have a business name yet?',
    'How is location used?'
  ],
  preferences: [
    'What\'s the difference between the workflow modes?',
    'Should I enable tutorials?',
    'What does auto-save do?'
  ],
  review: [
    'What happens after I launch?',
    'Can I edit my settings later?',
    'How do I deploy my website?'
  ]
};

export default function CardFlowAssistant({
  currentStep = 'welcome',
  wizardContext = {},
  onSuggestion
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const messagesEndRef = useRef(null);

  const currentTip = STEP_TIPS[currentStep] || STEP_TIPS.welcome;
  const currentPrompts = STEP_PROMPTS[currentStep] || STEP_PROMPTS.welcome;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset tip visibility when step changes
  useEffect(() => {
    setShowTip(true);
  }, [currentStep]);

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() || loading) return;

    const userMessage = messageText.trim();
    setInput('');
    setShowTip(false);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/ai/cardflow-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          currentStep,
          wizardContext,
          conversationHistory: messages.slice(-10)
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage = {
          role: 'assistant',
          content: data.response,
          suggestions: data.suggestions || null
        };
        setMessages(prev => [...prev, aiMessage]);

        // If AI provides actionable suggestions, notify parent
        if (data.suggestions && onSuggestion) {
          onSuggestion(data.suggestions);
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I'm having trouble right now. Try asking again or continue with the wizard - I'll be here if you need help!"
        }]);
      }
    } catch (err) {
      console.error('CardFlow AI error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't connect. The wizard is still fully functional - you can continue setup and come back to me anytime!"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (onSuggestion) {
      onSuggestion(suggestion);
    }
  };

  const stepDisplayName = {
    'welcome': 'Welcome',
    'project-type': 'Project Type',
    'business': 'Business Info',
    'preferences': 'Preferences',
    'review': 'Review'
  }[currentStep] || 'Setup';

  return (
    <div style={styles.container}>
      {/* Chat Panel */}
      <div style={isOpen ? styles.panel : styles.panelHidden}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <span role="img" aria-label="assistant">🤖</span>
          </div>
          <div style={styles.headerText}>
            <h4 style={styles.headerTitle}>Blink Assistant</h4>
            <p style={styles.headerSubtitle}>Here to help with your setup</p>
          </div>
          <button
            style={styles.closeBtn}
            onClick={() => setIsOpen(false)}
            aria-label="Close assistant"
          >
            ×
          </button>
        </div>

        {/* Chat Area */}
        <div style={styles.chatArea}>
          {/* Context Badge */}
          <div style={styles.contextBadge}>
            Currently on: {stepDisplayName} step
          </div>

          {/* Tip Card */}
          {showTip && messages.length === 0 && (
            <div style={styles.tipCard}>
              <div style={styles.tipTitle}>
                <span>💡</span> {currentTip.title}
              </div>
              <p style={styles.tipText}>{currentTip.tip}</p>
            </div>
          )}

          {/* Empty State with Quick Prompts */}
          {messages.length === 0 && (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>💬</span>
              <div style={styles.emptyTitle}>How can I help?</div>
              <p style={styles.emptyDesc}>Ask me anything about setting up your project</p>
              <div style={styles.quickPrompts}>
                {currentPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    style={styles.quickPrompt}
                    onClick={() => sendMessage(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, idx) => (
            <div
              key={idx}
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
                  ...styles.messageBubble,
                  ...(msg.role === 'assistant' ? styles.messageBubbleAI : styles.messageBubbleUser)
                }}>
                  {msg.content}
                </div>

                {/* Suggestion chips */}
                {msg.suggestions && (
                  <div style={styles.suggestions}>
                    {msg.suggestions.projectType && (
                      <button
                        style={styles.suggestionChip}
                        onClick={() => handleSuggestionClick({ projectType: msg.suggestions.projectType })}
                      >
                        Select: {msg.suggestions.projectType}
                      </button>
                    )}
                    {msg.suggestions.workflowMode && (
                      <button
                        style={styles.suggestionChip}
                        onClick={() => handleSuggestionClick({ workflowMode: msg.suggestions.workflowMode })}
                      >
                        Use: {msg.suggestions.workflowMode} mode
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div style={styles.loading}>
              <div style={styles.loadingDots}>
                <div style={{...styles.dot, animationDelay: '0s'}} />
                <div style={{...styles.dot, animationDelay: '0.2s'}} />
                <div style={{...styles.dot, animationDelay: '0.4s'}} />
              </div>
              Thinking...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={styles.inputArea}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything..."
            style={styles.input}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              ...styles.sendBtn,
              ...(!input.trim() || loading ? styles.sendBtnDisabled : {})
            }}
            aria-label="Send message"
          >
            →
          </button>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        style={{
          ...styles.toggleButton,
          ...(isOpen ? styles.toggleButtonActive : {})
        }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
      >
        {isOpen ? '×' : '🤖'}
      </button>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
