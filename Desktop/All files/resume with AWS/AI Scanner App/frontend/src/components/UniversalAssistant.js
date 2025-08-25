import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Minimize2, Scan, Brain, Loader2, Zap, Globe, Eye } from 'lucide-react';
import axios from 'axios';

const UniversalAssistant = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your Universal AI Assistant. I can analyze any webpage you're on. Click the scan button to analyze this page, or ask me anything!",
      timestamp: Date.now()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [currentPageAnalysis, setCurrentPageAnalysis] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Get current page URL
    setCurrentUrl(window.location.href);
  }, []);

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

  const scanCurrentPage = async () => {
    setIsScanning(true);
    
    const scanMessage = {
      id: Date.now(),
      type: 'bot',
      content: "🔍 Scanning current page... Analyzing all form fields and content...",
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, scanMessage]);

    try {
      const response = await axios.post('/api/scanner/analyze', { 
        url: window.location.href 
      });

      setCurrentPageAnalysis(response.data);
      
      const resultMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `✅ Page scan complete! I found ${response.data.fields?.length || 0} form fields on this page.\n\n${response.data.pageSummary}\n\nNow I can answer any questions about this page's forms, fields, or content!`,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, resultMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "❌ Sorry, I couldn't scan this page. This might be due to CORS restrictions or the page might not be accessible. You can still ask me questions about web forms in general!",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsScanning(false);
    }
  };

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
        { question: userMessage.content, url: currentUrl, pageContent: currentPageAnalysis?.pageSummary || '' };

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

  const quickActions = [
    { text: "Scan this page", action: scanCurrentPage, icon: Scan },
    { text: "What forms are here?", action: () => setCurrentMessage("What forms are on this page?") },
    { text: "How do I fill this out?", action: () => setCurrentMessage("How do I fill out the forms on this page?") },
    { text: "What is this page for?", action: () => setCurrentMessage("What is this page for?") },
    { text: "What is MongoDB?", action: () => setCurrentMessage("What is MongoDB?") },
    { text: "Explain databases", action: () => setCurrentMessage("Explain databases") }
  ];

  return (
    <>
      {/* Floating Action Button */}
      {!isVisible && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsVisible(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center z-[9999] hover:shadow-3xl transition-all duration-300"
          style={{
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3), 0 6px 12px rgba(139, 92, 246, 0.3)'
          }}
        >
          <Brain className="w-8 h-8 text-white" />
          
          {/* Pulse animation */}
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-400 opacity-20"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0, 0.2]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.button>
      )}

      {/* Universal Assistant Chat Interface */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`fixed bottom-6 right-6 bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden z-[9999] ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
            }`}
            style={{
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 24px rgba(0, 0, 0, 0.1)'
            }}
          >
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Universal AI Assistant</h3>
                  <p className="text-xs opacity-90">
                    {isLoading ? 'Thinking...' : isScanning ? 'Scanning page...' : 'Ready to help on any page'}
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
                  onClick={() => setIsVisible(false)}
                  className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Quick Actions Bar */}
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex gap-2 overflow-x-auto">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={scanCurrentPage}
                      disabled={isScanning}
                      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-xs font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 whitespace-nowrap"
                    >
                      {isScanning ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Scan className="w-4 h-4" />
                      )}
                      {isScanning ? 'Scanning...' : 'Scan Page'}
                    </motion.button>
                    
                    <div className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-600 rounded-xl text-xs">
                      <Globe className="w-3 h-3" />
                      <span className="truncate max-w-32">{window.location.hostname}</span>
                    </div>
                  </div>
                </div>

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

                {/* Quick Questions */}
                {messages.length <= 2 && (
                  <div className="px-4 pb-2">
                    <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickActions.slice(1, 4).map((action, index) => (
                        <button
                          key={index}
                          onClick={() => action.action()}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                        >
                          {action.text}
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
                        placeholder="Ask about this page or any form..."
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UniversalAssistant;
