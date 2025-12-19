import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

const StudyBuddy = ({ className }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi! I'm your AI study buddy. Ask me anything about your studies, and I'll help explain concepts in simple terms. What would you like to learn about today?",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      // Prepare history for context (last 10 messages)
      const history = messages.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          prompt: userMessage.text,
          history: history,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.log('Frontend AI Error:', err);
      console.error('AI Chat Error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className={cn("flex flex-col h-[600px]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Study Buddy</h3>
          <p className="text-sm text-gray-500">Your AI tutor is here to help</p>
        </div>
        {error && (
          <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex w-full",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-2",
                message.role === 'user'
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <p
                className={cn(
                  "text-xs mt-1",
                  message.role === 'user' ? "text-blue-100" : "text-gray-500"
                )}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              <span className="text-sm text-gray-600">Thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your studies..."
              className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            variant="primary"
            size="md"
            className="px-3 py-2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </Card>
  );
};

export default StudyBuddy;