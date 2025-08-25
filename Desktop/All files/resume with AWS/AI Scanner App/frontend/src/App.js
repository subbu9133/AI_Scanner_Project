import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, Globe, Eye, Info, CheckCircle, AlertCircle, Loader2, Brain, Shield, Lightbulb, Users, FileText, ExternalLink } from 'lucide-react';
import axios from 'axios';
import ChatBot, { ActionButton } from './components/ChatBot';
import UniversalAssistant from './components/UniversalAssistant';

function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [isChatBotVisible, setIsChatBotVisible] = useState(false);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysis(null);
    setShowDemoForm(false);

    try {
      const response = await axios.post('/api/scanner/analyze', { url: url.trim() });
      setAnalysis(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze page. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  const openDemoForm = () => {
    if (analysis && analysis.demoForm) {
      // Create a new window/tab with the demo form
      const demoWindow = window.open('', '_blank');
      demoWindow.document.write(analysis.demoForm);
      demoWindow.document.close();
    }
  };

  const toggleChatBot = () => {
    setIsChatBotVisible(!isChatBotVisible);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 px-4"
      >
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mr-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold gradient-text">AI Scanner Pro</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Analyze any webpage with advanced AI (Gemini) for intelligent insights into form fields, UX, and business logic
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Brain className="w-4 h-4 text-purple-500" />
            Powered by Google Gemini AI
          </div>
        </motion.div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-12">
        {/* URL Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-3xl p-8 mb-8 shadow-2xl"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Enter Website URL
            </h2>
            <p className="text-gray-600">
              Paste any website URL and let Gemini AI analyze the page structure intelligently
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="https://example.com"
                className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-lg"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalyze}
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Analyze with AI
                </>
              )}
            </motion.button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 max-w-2xl mx-auto"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </motion.div>

        {/* Analysis Results */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-effect rounded-3xl p-8 shadow-2xl"
            >
              {/* Page Summary */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-semibold text-gray-800">AI-Powered Page Analysis</h2>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{analysis.title}</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-600 mb-4 whitespace-pre-line">{analysis.pageSummary}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {analysis.url}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {analysis.fields?.length || 0} fields detected
                    </span>
                    <span className="flex items-center gap-1">
                      <Brain className="w-4 h-4 text-purple-500" />
                      Gemini AI Analysis
                    </span>
                  </div>
                </div>
              </div>

              {/* Demo Form Button */}
              {analysis.demoForm && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 text-center"
                >
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <FileText className="w-8 h-8 text-green-600" />
                      <h3 className="text-2xl font-semibold text-green-800">Demo Form Generated!</h3>
                    </div>
                    <p className="text-green-700 mb-4">
                      Based on the AI analysis, we've generated a realistic demo form that matches the structure and fields of the original page.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={openDemoForm}
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 mx-auto"
                    >
                      <ExternalLink className="w-5 h-5" />
                      View Demo Form
                    </motion.button>
                    <p className="text-sm text-green-600 mt-3">
                      Opens in a new tab - perfect for understanding the form structure!
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Enhanced AI Analysis Details */}
              {analysis.aiAnalysis && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Brain className="w-6 h-6 text-purple-500" />
                    <h3 className="text-xl font-semibold text-gray-800">AI Business Insights</h3>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {analysis.aiAnalysis.pagePurpose && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-blue-800">Page Purpose</h4>
                        </div>
                        <p className="text-blue-700 text-sm">{analysis.aiAnalysis.pagePurpose}</p>
                      </div>
                    )}
                    
                    {analysis.aiAnalysis.userExperienceAssessment && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-5 h-5 text-green-600" />
                          <h4 className="font-semibold text-green-800">UX Assessment</h4>
                        </div>
                        <p className="text-green-700 text-sm">{analysis.aiAnalysis.userExperienceAssessment}</p>
                      </div>
                    )}
                    
                    {analysis.aiAnalysis.formComplexity && (
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="w-5 h-5 text-purple-600" />
                          <h4 className="font-semibold text-purple-800">Form Complexity</h4>
                        </div>
                        <p className="text-purple-700 text-sm">{analysis.aiAnalysis.formComplexity}</p>
                      </div>
                    )}
                    
                    {analysis.aiAnalysis.potentialImprovements && (
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="w-5 h-5 text-yellow-600" />
                          <h4 className="font-semibold text-yellow-800">Improvements</h4>
                        </div>
                        <p className="text-yellow-700 text-sm">{analysis.aiAnalysis.potentialImprovements}</p>
                      </div>
                    )}
                    
                    {analysis.aiAnalysis.accessibilityConsiderations && (
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border border-indigo-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="w-5 h-5 text-indigo-600" />
                          <h4 className="font-semibold text-indigo-800">Accessibility</h4>
                        </div>
                        <p className="text-indigo-700 text-sm">{analysis.aiAnalysis.accessibilityConsiderations}</p>
                      </div>
                    )}
                    
                    {analysis.aiAnalysis.businessInsights && (
                      <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border border-pink-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className="w-5 h-5 text-pink-600" />
                          <h4 className="font-semibold text-pink-800">Business Insights</h4>
                        </div>
                        <p className="text-pink-700 text-sm">{analysis.aiAnalysis.businessInsights}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fields Analysis */}
              {analysis.fields && analysis.fields.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Info className="w-6 h-6 text-purple-500" />
                    <h3 className="text-xl font-semibold text-gray-800">AI-Enhanced Form Fields Analysis</h3>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {analysis.fields.map((field, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-1">
                              {field.label || field.name || 'Unnamed Field'}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                {field.type}
                              </span>
                              {field.required && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                  Required
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {field.placeholder && (
                          <p className="text-sm text-gray-600 mb-3 italic">
                            "{field.placeholder}"
                          </p>
                        )}
                        
                        <div className="space-y-3">
                          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-3 border border-purple-100">
                            <h5 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                              <Brain className="w-4 h-4" />
                              AI Explanation
                            </h5>
                            <p className="text-sm text-purple-700 leading-relaxed whitespace-pre-line">
                              {field.aiExplanation}
                            </p>
                          </div>
                          
                          {field.validationRules && (
                            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                              <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Validation Rules
                              </h5>
                              <p className="text-sm text-green-700 leading-relaxed">
                                {field.validationRules}
                              </p>
                            </div>
                          )}
                          
                          {field.bestPractices && (
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                              <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                Best Practices
                              </h5>
                              <p className="text-sm text-blue-700 leading-relaxed">
                                {field.bestPractices}
                              </p>
                            </div>
                          )}
                          
                          {field.securityNotes && (
                            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
                              <h5 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Security Notes
                              </h5>
                              <p className="text-sm text-red-700 leading-relaxed">
                                {field.securityNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <AlertCircle className="w-5 h-5 inline mr-2" />
                  {analysis.error}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Powered by Gemini AI</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">1. Smart URL Analysis</h3>
              <p className="text-gray-600">Advanced web scraping with retry logic and error handling</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">2. Gemini AI Processing</h3>
              <p className="text-gray-600">Intelligent analysis using Google's latest AI model</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">3. Demo Form Generation</h3>
              <p className="text-gray-600">Realistic dummy forms based on AI analysis</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">4. Actionable Results</h3>
              <p className="text-gray-600">Detailed field explanations and improvement suggestions</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-8 text-gray-500"
      >
        <p>© 2024 AI Scanner Pro. Powered by ❤️, Spring Boot, React & Google Gemini AI</p>
      </motion.footer>

      {/* Action Button (iPhone-style) */}
      {!isChatBotVisible && (
        <ActionButton 
          onClick={toggleChatBot} 
          hasAnalysis={analysis !== null}
        />
      )}

      {/* ChatBot */}
      <AnimatePresence>
        {isChatBotVisible && (
          <ChatBot 
            analysis={analysis} 
            isVisible={isChatBotVisible}
            onToggle={toggleChatBot}
          />
        )}
      </AnimatePresence>

      {/* Universal AI Assistant - appears on every page */}
      <UniversalAssistant />
    </div>
  );
}

export default App;
