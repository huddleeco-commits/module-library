/**
 * AgentChat Component
 * AI agent chat interface for the admin dashboard
 *
 * Integrates with /api/admin/ai endpoints for multi-agent chat
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../src/context/AppContext';
import { apiCall } from '../../src/hooks/useApi';
import {
  Bot,
  Send,
  Loader2,
  AlertCircle,
  Headphones,
  PenTool,
  BarChart3,
  MessageSquare,
  Sparkles,
  RefreshCw
} from 'lucide-react';

// Map icon names to Lucide components
const ICON_MAP = {
  'Headphones': Headphones,
  'PenTool': PenTool,
  'BarChart3': BarChart3,
  'Bot': Bot,
  'MessageSquare': MessageSquare,
  'Sparkles': Sparkles
};

function getIcon(iconName) {
  return ICON_MAP[iconName] || Bot;
}

export default function AgentChat({ defaultAgent = null, showAgentList = true }) {
  const { business, theme } = useApp();
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load agents on mount
  useEffect(() => {
    async function fetchAgents() {
      try {
        setLoadingAgents(true);
        const data = await apiCall('/admin/ai/agents');

        if (data.success && data.agents) {
          setAgents(data.agents);

          // Auto-select default agent or first agent
          if (data.agents.length > 0) {
            const toSelect = defaultAgent
              ? data.agents.find(a => a.id === defaultAgent)
              : data.agents[0];
            if (toSelect) {
              setSelectedAgent(toSelect);
            }
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load agents');
      } finally {
        setLoadingAgents(false);
      }
    }
    fetchAgents();
  }, [defaultAgent]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when agent selected
  useEffect(() => {
    if (selectedAgent && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedAgent]);

  const selectAgent = useCallback((agent) => {
    setSelectedAgent(agent);
    setMessages([]);
    setError(null);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || !selectedAgent || loading) return;

    setInput('');
    setLoading(true);
    setError(null);

    // Add user message
    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const data = await apiCall('/admin/ai/chat', 'POST', {
        agentId: selectedAgent.id,
        message: text,
        conversationHistory: messages
      });

      if (!data.success) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      // Add assistant message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        agentName: data.agentName,
        agentIcon: data.agentIcon,
        timestamp: new Date().toISOString(),
        usage: data.usage
      }]);

    } catch (err) {
      setError(err.message);
      setMessages(prev => [...prev, {
        role: 'error',
        content: err.message,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, selectedAgent, loading, messages]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  if (loadingAgents) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-xl">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-400">Loading agents...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[500px] bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
      {/* Agent selector */}
      {showAgentList && agents.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-gray-800/50 border-b border-gray-700 overflow-x-auto">
          {agents.map(agent => {
            const IconComponent = getIcon(agent.icon);
            const isSelected = selectedAgent?.id === agent.id;

            return (
              <button
                key={agent.id}
                onClick={() => selectAgent(agent)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                  transition-all duration-200 whitespace-nowrap
                  ${isSelected
                    ? 'text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
                style={isSelected ? {
                  backgroundColor: agent.color + '20',
                  borderColor: agent.color,
                  border: `2px solid ${agent.color}`
                } : {}}
              >
                <IconComponent
                  className="w-4 h-4"
                  style={{ color: isSelected ? agent.color : undefined }}
                />
                <span>{agent.name}</span>
              </button>
            );
          })}

          {/* Clear chat button */}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="ml-auto flex items-center gap-1 px-3 py-2 text-gray-400 hover:text-white text-sm"
              title="Clear chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!selectedAgent ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bot className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">Select an agent to start chatting</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            {(() => {
              const IconComponent = getIcon(selectedAgent.icon);
              return (
                <>
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: selectedAgent.color + '20' }}
                  >
                    <IconComponent
                      className="w-10 h-10"
                      style={{ color: selectedAgent.color }}
                    />
                  </div>
                  <p className="text-lg font-medium text-white mb-1">
                    Chat with {selectedAgent.name}
                  </p>
                  <p className="text-sm text-gray-400">{selectedAgent.role}</p>
                  {selectedAgent.capabilities && (
                    <div className="flex flex-wrap gap-2 mt-4 justify-center">
                      {selectedAgent.capabilities.map(cap => (
                        <span
                          key={cap}
                          className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              const isError = msg.role === 'error';
              const IconComponent = !isUser && !isError ? getIcon(msg.agentIcon) : null;

              return (
                <div
                  key={i}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[85%] rounded-2xl px-4 py-3
                      ${isUser
                        ? 'bg-blue-600 text-white'
                        : isError
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-gray-800 text-gray-100'
                      }
                    `}
                  >
                    {!isUser && !isError && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        {IconComponent && (
                          <IconComponent
                            className="w-3 h-3"
                            style={{ color: selectedAgent?.color }}
                          />
                        )}
                        <span>{msg.agentName}</span>
                      </div>
                    )}
                    {isError && (
                      <div className="flex items-center gap-2 text-xs text-red-400 mb-2">
                        <AlertCircle className="w-3 h-3" />
                        <span>Error</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl px-4 py-3 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{selectedAgent?.name} is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 bg-gray-800/50 border-t border-gray-700">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              selectedAgent
                ? `Ask ${selectedAgent.name}...`
                : 'Select an agent first'
            }
            disabled={!selectedAgent || loading}
            className="
              flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl
              text-white placeholder-gray-500 text-sm
              focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
          <button
            onClick={sendMessage}
            disabled={!selectedAgent || loading || !input.trim()}
            className="
              px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700
              text-white font-medium rounded-xl
              transition-colors duration-200
              disabled:cursor-not-allowed disabled:text-gray-500
              flex items-center gap-2
            "
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {error && (
          <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
