/**
 * ATLAS AgentChat Component
 * Standalone AI agent chat interface for Blink-generated projects
 *
 * Usage:
 *   import AgentChat from './components/AgentChat';
 *   <AgentChat apiBase="http://localhost:5000" />
 *
 * Props:
 *   - apiBase: Backend URL (default: '' for same-origin)
 *   - defaultAgent: Agent ID to select by default
 *   - showAgentList: Whether to show agent selector (default: true)
 *   - className: Additional CSS classes
 */

import { useState, useEffect, useRef } from 'react';

const DEFAULT_STYLES = `
.atlas-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
  background: #1a1a2e;
  border-radius: 12px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.atlas-agents {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #16213e;
  border-bottom: 1px solid #2a2a4e;
  flex-wrap: wrap;
}

.atlas-agent-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #2a2a4e;
  border: 2px solid transparent;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.atlas-agent-btn:hover {
  background: #3a3a6e;
}

.atlas-agent-btn.active {
  border-color: var(--agent-color, #10B981);
  background: color-mix(in srgb, var(--agent-color, #10B981) 20%, transparent);
}

.atlas-agent-btn .icon {
  font-size: 16px;
}

.atlas-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.atlas-message {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
}

.atlas-message.user {
  align-self: flex-end;
  background: #3b82f6;
  color: #fff;
}

.atlas-message.assistant {
  align-self: flex-start;
  background: #374151;
  color: #fff;
}

.atlas-message.error {
  background: #ef4444;
  color: #fff;
}

.atlas-message .msg-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.atlas-message .msg-content {
  white-space: pre-wrap;
}

.atlas-message.loading {
  background: #374151;
  color: #9ca3af;
  font-style: italic;
}

.atlas-input-area {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #16213e;
  border-top: 1px solid #2a2a4e;
}

.atlas-input {
  flex: 1;
  padding: 12px 16px;
  background: #2a2a4e;
  border: 1px solid #3a3a6e;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  outline: none;
}

.atlas-input:focus {
  border-color: #10B981;
}

.atlas-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.atlas-send-btn {
  padding: 12px 24px;
  background: #10B981;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.atlas-send-btn:hover:not(:disabled) {
  background: #059669;
}

.atlas-send-btn:disabled {
  background: #4b5563;
  cursor: not-allowed;
}

.atlas-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  text-align: center;
  padding: 20px;
}
`;

export default function AgentChat({
  apiBase = '',
  defaultAgent = null,
  showAgentList = true,
  className = ''
}) {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load agents on mount
  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch(`${apiBase}/api/ai/agents`);
        if (!res.ok) throw new Error('Failed to load agents');
        const data = await res.json();
        setAgents(data.agents || []);

        // Auto-select default agent or first agent
        if (data.agents?.length > 0) {
          const toSelect = defaultAgent
            ? data.agents.find(a => a.id === defaultAgent)
            : data.agents[0];
          if (toSelect) {
            setSelectedAgent(toSelect);
          }
        }
      } catch (err) {
        setError(err.message);
      }
    }
    fetchAgents();
  }, [apiBase, defaultAgent]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when agent selected
  useEffect(() => {
    if (selectedAgent) {
      inputRef.current?.focus();
    }
  }, [selectedAgent]);

  const selectAgent = (agent) => {
    setSelectedAgent(agent);
    setMessages([]);
    setError(null);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !selectedAgent || loading) return;

    setInput('');
    setLoading(true);
    setError(null);

    // Add user message
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch(`${apiBase}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          message: text,
          conversationHistory: messages
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      // Add assistant message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        agentName: data.agentName,
        agentIcon: data.agentIcon
      }]);

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'error',
        content: err.message
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{DEFAULT_STYLES}</style>
      <div className={`atlas-chat ${className}`}>
        {/* Agent selector */}
        {showAgentList && agents.length > 0 && (
          <div className="atlas-agents">
            {agents.map(agent => (
              <button
                key={agent.id}
                className={`atlas-agent-btn ${selectedAgent?.id === agent.id ? 'active' : ''}`}
                style={{ '--agent-color': agent.color }}
                onClick={() => selectAgent(agent)}
              >
                <span className="icon">{agent.icon}</span>
                <span className="name">{agent.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="atlas-messages">
          {!selectedAgent ? (
            <div className="atlas-empty">
              Select an agent to start chatting
            </div>
          ) : messages.length === 0 ? (
            <div className="atlas-empty">
              <div>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{selectedAgent.icon}</div>
                <div>Chat with {selectedAgent.name}</div>
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
                  {selectedAgent.role}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`atlas-message ${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <div className="msg-header">
                      <span>{msg.agentIcon}</span>
                      <span>{msg.agentName}</span>
                    </div>
                  )}
                  <div className="msg-content">{msg.content}</div>
                </div>
              ))}
              {loading && (
                <div className="atlas-message loading">
                  {selectedAgent.icon} Thinking...
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="atlas-input-area">
          <input
            ref={inputRef}
            type="text"
            className="atlas-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={selectedAgent ? `Ask ${selectedAgent.name}...` : 'Select an agent first'}
            disabled={!selectedAgent || loading}
          />
          <button
            className="atlas-send-btn"
            onClick={sendMessage}
            disabled={!selectedAgent || loading || !input.trim()}
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </>
  );
}
