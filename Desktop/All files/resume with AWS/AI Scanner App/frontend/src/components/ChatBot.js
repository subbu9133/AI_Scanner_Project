import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Brain, Zap, Loader2, Minimize2 } from 'lucide-react';
import axios from 'axios';

const ChatBot = ({ analysis, isVisible, onToggle }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your AI assistant. I've analyzed this page and I'm ready to answer any questions about the form fields, what to enter, or how to fill them out. What would you like to know?",
      timestamp: Date.now()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isVisible && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isVisible, isMinimized]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentMessage.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Check if this is a general question (not about the current page)
      const isGeneralQuestion = isGeneralQuestionType(userMessage.content);
      
      const endpoint = isGeneralQuestion ? '/api/scanner/ask' : '/api/scanner/chat';
      const requestData = isGeneralQuestion ? 
        { question: userMessage.content } :
        { question: userMessage.content, url: analysis?.url, pageContent: analysis?.pageSummary };

      const response = await axios.post(endpoint, requestData);

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.answer || 'I apologize, but I couldn\'t generate a response right now.',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to detect general questions
  const isGeneralQuestionType = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    // List of general topics that don't require page context
    const generalTopics = [
      'what is', 'explain', 'define', 'describe', 'how does', 'tell me about',
      'mongodb', 'database', 'sql', 'nosql', 'javascript', 'python', 'java',
      'html', 'css', 'react', 'node.js', 'spring', 'docker', 'kubernetes',
      'aws', 'azure', 'cloud', 'api', 'rest', 'graphql', 'microservices',
      'machine learning', 'ai', 'artificial intelligence', 'data science',
      'cybersecurity', 'networking', 'devops', 'agile', 'scrum'
    ];
    
    // Check if the question contains general topics
    for (const topic of generalTopics) {
      if (lowerQuestion.includes(topic)) {
        return true;
      }
    }
    
    // Check if it's a conceptual question (doesn't ask about specific page elements)
    if (lowerQuestion.includes('what is') || 
        lowerQuestion.includes('explain') || 
        lowerQuestion.includes('define') || 
        lowerQuestion.includes('how does') ||
        lowerQuestion.includes('tell me about')) {
      return true;
    }
    
    return false;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "What is this form for?",
    "How do I fill out the name fields?",
    "What loan options are available?",
    "What information do I need to provide?",
    "How do I enter my phone number?",
    "What does each option mean?",
    "What is MongoDB?",
    "Explain databases",
    "What is React?",
    "Tell me about APIs"
  ];

  const handleSuggestedQuestion = (question) => {
    setCurrentMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className={`bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Assistant</h3>
              <p className="text-xs opacity-90">
                {isLoading ? 'Thinking...' : 'Ask me anything about this form'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onToggle}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {message.type === 'bot' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-medium text-purple-600">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-600">AI Assistant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                      <span className="text-sm text-gray-600">Analyzing your question...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.slice(0, 3).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about this form..."
                    className="w-full pr-12 py-3 px-4 border border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none transition-all duration-200 text-sm"
                    rows="1"
                    style={{
                      minHeight: '44px',
                      maxHeight: '88px'
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || isLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-700 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

// Action Button Component (iPhone-style floating button)
export const ActionButton = ({ onClick, hasAnalysis }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center z-40"
      style={{
        background: isHovered 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
      }}
    >
      <AnimatePresence mode="wait">
        {hasAnalysis ? (
          <motion.div
            key="brain"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
        ) : (
          <motion.div
            key="message"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <MessageCircle className="w-8 h-8 text-white" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-white border-opacity-30"
        animate={isHovered ? {
          scale: [1, 1.2, 1],
          opacity: [0.3, 0, 0.3]
        } : {}}
        transition={{
          duration: 2,
          repeat: isHovered ? Infinity : 0,
          ease: "easeInOut"
        }}
      />
    </motion.button>
  );
};

export default ChatBot;
