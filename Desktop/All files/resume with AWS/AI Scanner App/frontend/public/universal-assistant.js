// Define global functions OUTSIDE the IIFE first
window.cancelSelection = function() {
  console.log('Cancel button clicked - truly global');
  if (window.universalAssistantInstance && window.universalAssistantInstance.endSelection) {
    window.universalAssistantInstance.endSelection();
    window.universalAssistantInstance.addMessage('Selection cancelled. You can try again!', 'bot');
  }
};

window.analyzeSelection = function() {
  console.log('Analyze button clicked - truly global');
  if (window.universalAssistantInstance && window.universalAssistantInstance.analyzeSelectedArea) {
    if (!window.universalAssistantInstance.selectionStart || !window.universalAssistantInstance.selectionEnd) {
      window.universalAssistantInstance.addMessage('Please select an area first.', 'bot');
      return;
    }
    window.universalAssistantInstance.analyzeSelectedArea();
  }
};

console.log('Functions defined OUTSIDE IIFE:', {
  analyzeSelection: typeof window.analyzeSelection,
  cancelSelection: typeof window.cancelSelection
});

// Force global assignment and test immediately
window.testGlobalFunctions = function() {
  console.log('Testing global functions access:', {
    analyzeSelection: typeof window.analyzeSelection,
    cancelSelection: typeof window.cancelSelection,
    windowKeys: Object.keys(window).filter(k => k.includes('Selection'))
  });
};

// Call test immediately
window.testGlobalFunctions();

// Universal AI Assistant - Can be injected into any webpage
(function() {
  'use strict';
  
  // Check if assistant is already loaded
  if (window.universalAssistantLoaded) return;
  window.universalAssistantLoaded = true;
  
  console.log('Inside IIFE - functions available:', {
    analyzeSelection: typeof window.analyzeSelection,
    cancelSelection: typeof window.cancelSelection
  });
  
  // Configuration
  const API_BASE = 'http://localhost:8054/api/scanner';
  
  // Create styles
  const styles = `
    .universal-assistant-container {
      position: fixed !important;
      bottom: 24px !important;
      right: 24px !important;
      z-index: 999999 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
    
    .assistant-button {
      width: 64px !important;
      height: 64px !important;
      border-radius: 50% !important;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
      border: none !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3), 0 6px 12px rgba(139, 92, 246, 0.3) !important;
      transition: all 0.3s ease !important;
      color: white !important;
    }
    
    .assistant-button:hover {
      transform: scale(1.1) !important;
      box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4), 0 8px 16px rgba(139, 92, 246, 0.4) !important;
    }
    
    .assistant-chat {
      width: 384px !important;
      height: 600px !important;
      background: white !important;
      border-radius: 24px !important;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 24px rgba(0, 0, 0, 0.1) !important;
      overflow: hidden !important;
      display: none !important;
      flex-direction: column !important;
    }
    
    .assistant-chat.visible {
      display: flex !important;
    }
    
    .assistant-header {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
      color: white !important;
      padding: 16px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
    }
    
    .assistant-messages {
      flex: 1 !important;
      overflow-y: auto !important;
      padding: 16px !important;
      max-height: 400px !important;
    }
    
    .assistant-message {
      margin-bottom: 12px !important;
      display: flex !important;
    }
    
    .assistant-message.user {
      justify-content: flex-end !important;
    }
    
    .assistant-message.bot {
      justify-content: flex-start !important;
    }
    
    .message-bubble {
      max-width: 80% !important;
      padding: 12px 16px !important;
      border-radius: 18px !important;
      font-size: 14px !important;
      line-height: 1.4 !important;
    }
    
    .message-bubble.user {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
      color: white !important;
    }
    
    .message-bubble.bot {
      background: #f3f4f6 !important;
      color: #374151 !important;
    }
    
    .assistant-input-area {
      padding: 16px !important;
      border-top: 1px solid #e5e7eb !important;
      display: flex !important;
      gap: 8px !important;
    }
    
    .assistant-input {
      flex: 1 !important;
      padding: 12px 16px !important;
      border: 1px solid #d1d5db !important;
      border-radius: 12px !important;
      font-size: 14px !important;
      outline: none !important;
      resize: none !important;
    }
    
    .assistant-input:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
    
    .scan-button {
      padding: 8px 16px !important;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
      color: white !important;
      border: none !important;
      border-radius: 8px !important;
      cursor: pointer !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      transition: all 0.2s ease !important;
    }
    
    .scan-button:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3) !important;
    }
    
    .send-button {
      padding: 12px !important;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
      color: white !important;
      border: none !important;
      border-radius: 12px !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
    }
    
    .send-button:hover {
      opacity: 0.9 !important;
    }
    
    .close-button {
      background: rgba(255, 255, 255, 0.2) !important;
      border: none !important;
      color: white !important;
      padding: 8px !important;
      border-radius: 8px !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
    }
    
    .close-button:hover {
      background: rgba(255, 255, 255, 0.3) !important;
    }
    
    .loading {
      opacity: 0.6 !important;
      pointer-events: none !important;
    }
    
    /* Selection Overlay Styles */
    .selection-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0, 0, 0, 0.3) !important;
      z-index: 1000000 !important;
      cursor: crosshair !important;
      user-select: none !important;
    }
    
    .selection-box {
      position: absolute !important;
      border: 2px solid #3b82f6 !important;
      background: rgba(59, 130, 246, 0.15) !important;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.8), inset 0 0 0 1px rgba(59, 130, 246, 0.3) !important;
      pointer-events: none !important;
      z-index: 1000001 !important;
    }
    
    .selection-instructions {
      position: fixed !important;
      top: 20px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      background: rgba(0, 0, 0, 0.8) !important;
      color: white !important;
      padding: 12px 24px !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      z-index: 1000001 !important;
      animation: fadeIn 0.3s ease !important;
    }
    
    .selection-controls {
      position: fixed !important;
      bottom: 20px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      display: flex !important;
      gap: 12px !important;
      z-index: 1000001 !important;
    }
    
    .selection-btn {
      padding: 10px 20px !important;
      border: none !important;
      border-radius: 6px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
    }
    
    .selection-btn.primary {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
      color: white !important;
    }
    
    .selection-btn.secondary {
      background: rgba(255, 255, 255, 0.9) !important;
      color: #374151 !important;
      border: 1px solid #d1d5db !important;
    }
    
    .selection-btn:hover {
      transform: translateY(-1px) !important;
      opacity: 0.9 !important;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `;
  
  // Add styles to page
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
  
  // Create assistant HTML
  const assistantHTML = `
    <div class="universal-assistant-container">
      <button class="assistant-button" id="assistantToggle">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.5 2A7.5 7.5 0 0 0 4 12v8a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H6v-4a5.5 5.5 0 1 1 11 0v4h-1a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-8A7.5 7.5 0 0 0 14.5 2h-5z" fill="currentColor"/>
        </svg>
      </button>
      
      <div class="assistant-chat" id="assistantChat">
        <div class="assistant-header">
          <div>
            <div style="font-weight: 600; font-size: 14px;">Universal AI Assistant</div>
            <div style="font-size: 12px; opacity: 0.9;">Ready to analyze any page</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="scan-button" id="scanButton">📐 Select & Scan</button>
            <button class="close-button" id="closeButton">✕</button>
          </div>
        </div>
        
        <div class="assistant-messages" id="messagesContainer">
          <div class="assistant-message bot">
            <div class="message-bubble bot">
              Hi! I'm your Universal AI Assistant. I can analyze any webpage you're on. Click "📐 Select & Scan" to choose a specific area to analyze, or ask me anything about web forms!
            </div>
          </div>
        </div>
        
        <div class="assistant-input-area">
          <textarea class="assistant-input" id="messageInput" placeholder="Ask about this page or any form..." rows="1"></textarea>
          <button class="send-button" id="sendButton">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add assistant to page
  document.body.insertAdjacentHTML('beforeend', assistantHTML);
  
  // Get elements
  const toggleButton = document.getElementById('assistantToggle');
  const chatContainer = document.getElementById('assistantChat');
  const closeButton = document.getElementById('closeButton');
  const scanButton = document.getElementById('scanButton');
  const sendButton = document.getElementById('sendButton');
  const messageInput = document.getElementById('messageInput');
  const messagesContainer = document.getElementById('messagesContainer');
  
  let currentPageAnalysis = null;
  let isLoading = false;
  let isSelecting = false;
  let isDragging = false;
  let selectionStart = null;
  let selectionEnd = null;
  let selectionOverlay = null;
  let selectionBox = null;
  
  // Create global instance object for functions to access
  window.universalAssistantInstance = {
    isSelecting: false,
    selectionStart: null,
    selectionEnd: null,
    addMessage: null,
    endSelection: null,
    analyzeSelectedArea: null
  };
  
  // Remove duplicate definitions - using the ones at top of IIFE
  
  // Helper functions
  function addMessage(content, type = 'bot') {
    const messageElement = document.createElement('div');
    messageElement.className = `assistant-message ${type}`;
    messageElement.innerHTML = `<div class="message-bubble ${type}">${content}</div>`;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Assign to global instance
  window.universalAssistantInstance.addMessage = addMessage;
  
  function setLoading(loading) {
    isLoading = loading;
    if (loading) {
      chatContainer.classList.add('loading');
      addMessage('🤔 Thinking...', 'bot');
    } else {
      chatContainer.classList.remove('loading');
    }
  }
  
  // Selection functionality
  function startSelection() {
    if (isSelecting) return;
    
    console.log('Starting selection mode...');
    isSelecting = true;
    
    // Create simple overlay that covers entire viewport
    selectionOverlay = document.createElement('div');
    selectionOverlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0, 0, 0, 0.3) !important;
      z-index: 999999 !important;
      cursor: crosshair !important;
    `;
    
    // Create instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      background: rgba(0, 0, 0, 0.8) !important;
      color: white !important;
      padding: 12px 24px !important;
      border-radius: 8px !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 14px !important;
      z-index: 1000000 !important;
    `;
    instructions.textContent = '🖱️ Drag to select the area you want to analyze';
    
    // Create selection box
    selectionBox = document.createElement('div');
    selectionBox.style.cssText = `
      position: fixed !important;
      border: 2px solid #3b82f6 !important;
      background: rgba(59, 130, 246, 0.15) !important;
      pointer-events: none !important;
      z-index: 1000000 !important;
      display: none !important;
    `;
    
    // Create controls
    const controls = document.createElement('div');
    controls.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      display: flex !important;
      gap: 12px !important;
      z-index: 1000000 !important;
    `;
    
    controls.innerHTML = `
      <button id="analyzeSelectionBtn" style="
        padding: 10px 20px !important;
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
        color: white !important;
        border: none !important;
        border-radius: 6px !important;
        cursor: pointer !important;
        font-size: 14px !important;
        font-weight: 600 !important;
      ">🔍 Analyze Selection</button>
      <button id="cancelSelectionBtn" style="
        padding: 10px 20px !important;
        background: rgba(255, 255, 255, 0.9) !important;
        color: #374151 !important;
        border: 1px solid #d1d5db !important;
        border-radius: 6px !important;
        cursor: pointer !important;
        font-size: 14px !important;
        font-weight: 600 !important;
      ">❌ Cancel</button>
    `;
    
    // Add event listeners directly
    setTimeout(() => {
      const analyzeBtn = document.getElementById('analyzeSelectionBtn');
      const cancelBtn = document.getElementById('cancelSelectionBtn');
      
      console.log('Buttons found:', { analyzeBtn: !!analyzeBtn, cancelBtn: !!cancelBtn });
      console.log('Functions available when adding listeners:', {
        analyzeSelection: typeof window.analyzeSelection,
        cancelSelection: typeof window.cancelSelection
      });
      
      if (analyzeBtn) {
        analyzeBtn.addEventListener('click', function() {
          console.log('Analyze button clicked via event listener');
          if (typeof window.analyzeSelection === 'function') {
            window.analyzeSelection();
          } else {
            console.error('window.analyzeSelection not available');
            console.log('Available functions:', Object.keys(window).filter(k => k.includes('Selection')));
          }
        });
      }
      
      if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
          console.log('Cancel button clicked via event listener');
          if (typeof window.cancelSelection === 'function') {
            window.cancelSelection();
          } else {
            console.error('window.cancelSelection not available');
            console.log('Available functions:', Object.keys(window).filter(k => k.includes('Selection')));
          }
        });
      }
    }, 100);
    
    // Add elements to page
    document.body.appendChild(selectionOverlay);
    document.body.appendChild(instructions);
    document.body.appendChild(selectionBox);
    document.body.appendChild(controls);
    
    // Simple event handling
    selectionOverlay.onmousedown = function(e) {
      console.log('Mouse down at:', e.clientX, e.clientY);
      isDragging = true;
      selectionStart = { x: e.clientX, y: e.clientY };
      
      selectionBox.style.display = 'block';
      selectionBox.style.left = e.clientX + 'px';
      selectionBox.style.top = e.clientY + 'px';
      selectionBox.style.width = '0px';
      selectionBox.style.height = '0px';
      
      e.preventDefault();
    };
    
    document.onmousemove = function(e) {
      if (!isDragging || !selectionStart) return;
      
      const left = Math.min(selectionStart.x, e.clientX);
      const top = Math.min(selectionStart.y, e.clientY);
      const width = Math.abs(e.clientX - selectionStart.x);
      const height = Math.abs(e.clientY - selectionStart.y);
      
      selectionBox.style.left = left + 'px';
      selectionBox.style.top = top + 'px';
      selectionBox.style.width = width + 'px';
      selectionBox.style.height = height + 'px';
      
      e.preventDefault();
    };
    
    document.onmouseup = function(e) {
      if (!isDragging) return;
      
      console.log('Mouse up at:', e.clientX, e.clientY);
      isDragging = false;
      selectionEnd = { x: e.clientX, y: e.clientY };
      
      // Update global instance
      window.universalAssistantInstance.selectionStart = selectionStart;
      window.universalAssistantInstance.selectionEnd = selectionEnd;
      window.universalAssistantInstance.isSelecting = true;
      
      const width = Math.abs(selectionEnd.x - selectionStart.x);
      const height = Math.abs(selectionEnd.y - selectionStart.y);
      
      if (width < 20 || height < 20) {
        instructions.textContent = '⚠️ Selection too small. Please drag to create a larger area.';
        instructions.style.background = 'rgba(220, 38, 38, 0.9)';
        selectionBox.style.display = 'none';
        selectionStart = null;
        selectionEnd = null;
      } else {
        instructions.textContent = '✅ Area selected! Click "Analyze Selection" to continue.';
        instructions.style.background = 'rgba(16, 185, 129, 0.9)';
      }
    };
    
    // Global functions are already set up
    
    // ESC key support
    document.onkeydown = function(e) {
      if (e.key === 'Escape' && isSelecting) {
        window.cancelSelection();
      }
    };
  }
  

  
  function endSelection() {
    isSelecting = false;
    isDragging = false;
    
    // Update global instance
    window.universalAssistantInstance.isSelecting = false;
    window.universalAssistantInstance.selectionStart = null;
    window.universalAssistantInstance.selectionEnd = null;
    
    // Clean up global event handlers
    document.onmousemove = null;
    document.onmouseup = null;
    document.onkeydown = null;
    
    // Remove all selection elements
    const elementsToRemove = document.querySelectorAll('[style*="z-index: 999999"], [style*="z-index: 1000000"]');
    elementsToRemove.forEach(el => {
      if (el !== toggleButton && el !== chatContainer) {
        el.remove();
      }
    });
    
    // Reset variables
    selectionOverlay = null;
    selectionBox = null;
    selectionStart = null;
    selectionEnd = null;
    
    // Reopen the chat
    chatContainer.classList.add('visible');
  }
  
  // Assign to global instance
  window.universalAssistantInstance.endSelection = endSelection;
  
  function extractSelectedContent() {
    if (!selectionStart || !selectionEnd) {
      console.log('No selection coordinates');
      return null;
    }
    
    const left = Math.min(selectionStart.x, selectionEnd.x);
    const top = Math.min(selectionStart.y, selectionEnd.y);
    const right = Math.max(selectionStart.x, selectionEnd.x);
    const bottom = Math.max(selectionStart.y, selectionEnd.y);
    
    console.log('Selection bounds:', { left, top, right, bottom });
    
    // Find all elements within the selection bounds (more inclusive)
    const selectedElements = [];
    const allElements = document.querySelectorAll('*:not(.universal-assistant-container):not([style*="z-index: 999999"]):not([style*="z-index: 1000000"])');
    
    console.log('Total elements to check:', allElements.length);
    
    for (const element of allElements) {
      const rect = element.getBoundingClientRect();
      
      // More generous overlap detection
      const overlaps = !(rect.right < left || rect.left > right || rect.bottom < top || rect.top > bottom);
      
      if (overlaps && (rect.width > 0 && rect.height > 0)) {
        selectedElements.push(element);
      }
    }
    
    console.log('Elements in selection:', selectedElements.length);
    
    // Extract content from selected elements
    let selectedText = '';
    let selectedCode = '';
    let selectedFields = [];
    let allTextContent = '';
    
    for (const element of selectedElements) {
      try {
        // Skip style, script, and other non-content elements
        if (['STYLE', 'SCRIPT', 'NOSCRIPT', 'META', 'LINK', 'HEAD'].includes(element.tagName)) {
          continue;
        }
        
        // Skip elements with display: none or visibility: hidden
        const style = getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') {
          continue;
        }
        
        // Get only the direct text content (not from all descendants)
        const directText = Array.from(element.childNodes)
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent.trim())
          .filter(text => text.length > 0)
          .join(' ');
        
        // For leaf elements (elements with only text), get their text content
        const hasTextChildren = element.children.length === 0 && element.textContent.trim();
        
        let textToAdd = '';
        if (hasTextChildren) {
          textToAdd = element.textContent.trim();
        } else if (directText) {
          textToAdd = directText;
        }
        
        // Skip very long chunks that are likely code/scripts/css
        if (textToAdd && textToAdd.length > 0 && textToAdd.length < 1000) {
          const className = element.className || '';
          const classNameStr = typeof className === 'string' ? className : (className.toString ? className.toString() : '');
          
          // Check if this is a code element
          const isCodeElement = element.tagName === 'CODE' || element.tagName === 'PRE' || 
                               (classNameStr && (classNameStr.includes('code') || classNameStr.includes('highlight') || classNameStr.includes('language-')));
          
          // Check if text looks like actual code (be more specific)
          const looksLikeJavaCode = (textToAdd.includes('public class') && textToAdd.includes('{')) || 
                                   (textToAdd.includes('public static void main') && textToAdd.includes('String[] args')) ||
                                   textToAdd.includes('System.out.println(');
          
          // Check for other programming patterns but be more strict
          const looksLikeCode = (textToAdd.match(/function\s*\(/g) && textToAdd.includes('{')) ||
                               (textToAdd.includes('var ') && textToAdd.includes('=') && textToAdd.includes(';')) ||
                               (textToAdd.includes('const ') && textToAdd.includes('=') && textToAdd.includes(';'));
          
          if (isCodeElement || looksLikeJavaCode || looksLikeCode) {
            selectedCode += textToAdd + '\n';
          } else {
            // Only add as regular text if it looks like natural language content
            const hasLotsOfSymbols = (textToAdd.match(/[{}();=]/g) || []).length > textToAdd.length * 0.1;
            const hasReasonableWords = textToAdd.split(/\s+/).some(word => word.length > 2 && /^[a-zA-Z]+$/.test(word));
            
            if (!hasLotsOfSymbols && hasReasonableWords) {
              selectedText += textToAdd + ' ';
              allTextContent += textToAdd + ' ';
            }
          }
        }
        
        // Extract form fields
        if (element.tagName && ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(element.tagName)) {
          const fieldInfo = {
            name: element.name || element.id || 'unnamed',
            type: element.type || element.tagName.toLowerCase(),
            label: '',
            placeholder: element.placeholder || '',
            required: element.required || false,
            value: element.value || ''
          };
          
          // Try to find associated label (with error handling)
          try {
            const label = element.closest && element.closest('label') || 
                         (element.id && document.querySelector(`label[for="${element.id}"]`));
            if (label && label.textContent) {
              fieldInfo.label = label.textContent.trim();
            }
          } catch (labelError) {
            console.log('Label extraction error:', labelError);
          }
          
          selectedFields.push(fieldInfo);
        }
      } catch (elementError) {
        console.log('Element processing error:', elementError, element);
        // Continue processing other elements
      }
    }
    
    // If no specific content found, use all text as fallback
    if (!selectedText && !selectedCode && selectedFields.length === 0 && allTextContent) {
      selectedText = allTextContent;
    }
    
    const result = {
      text: selectedText.trim(),
      code: selectedCode.trim(),
      fields: selectedFields,
      elementCount: selectedElements.length,
      rawText: allTextContent.trim()
    };
    
    console.log('Extracted content:', {
      textLength: result.text.length,
      codeLength: result.code.length,
      fieldsCount: result.fields.length,
      elementCount: result.elementCount,
      textSample: result.text.substring(0, 100) + (result.text.length > 100 ? '...' : ''),
      codeSample: result.code.substring(0, 200) + (result.code.length > 200 ? '...' : ''),
      fullCode: result.code // For debugging
    });
    
    return result;
  }
  
  async function analyzeSelectedArea() {
    if (!selectionStart || !selectionEnd) {
      addMessage('Please select an area first by dragging your mouse.', 'bot');
      return;
    }
    
    // Preserve selection coordinates before clearing UI
    const savedStart = { ...selectionStart };
    const savedEnd = { ...selectionEnd };
    
    endSelection();
    setLoading(true);
    
    // Restore coordinates for extraction
    selectionStart = savedStart;
    selectionEnd = savedEnd;
    
    try {
      const selectedContent = extractSelectedContent();
      
      if (!selectedContent) {
        addMessage('❌ Failed to extract content from the selected area. Please try again.', 'bot');
        setLoading(false);
        return;
      }
      
      // Check if we have any content at all (including raw text)
      const hasContent = selectedContent.text || selectedContent.code || selectedContent.fields.length > 0 || selectedContent.rawText;
      
      if (!hasContent) {
        addMessage('❌ No content found in the selected area. Please try selecting an area with text, forms, or code.', 'bot');
        setLoading(false);
        return;
      }
      
      // Use rawText as fallback if main text is empty
      const contentToAnalyze = selectedContent.text || selectedContent.rawText || 'Selected area content';
      
      // Create analysis request for selected content only
      const analysisRequest = {
        url: window.location.href,
        pageContent: contentToAnalyze,
        codeContent: selectedContent.code || '',
        questionsContent: ''
      };
      
      // For selected content, use chat endpoint for more focused analysis
      let question;
      if (selectedContent.code && selectedContent.code.trim()) {
        question = `What will be the output of this Java code? Please analyze and explain step by step:\n\n${selectedContent.code}`;
      } else {
        question = `Analyze this selected content and explain what it means:\n\n${contentToAnalyze}`;
      }
      
      console.log('Sending question to AI:', question);
      
      const response = await makeAPICall('/chat', {
        question: question,
        url: window.location.href,
        pageContent: contentToAnalyze
      });
      
      if (response && response.answer) {
        // Store the scanned content for future questions
        currentPageAnalysis = {
          ...response,
          scannedContent: {
            text: contentToAnalyze,
            code: selectedContent.code,
            fields: selectedContent.fields,
            elementCount: selectedContent.elementCount
          }
        };
        
        // Enhanced display of scanned content
        let scanSummary = `🎯 **CONTENT SCANNED SUCCESSFULLY!**\n\n`;
        scanSummary += `📊 **Scan Results:**\n`;
        scanSummary += `• Elements Found: ${selectedContent.elementCount}\n`;
        
        if (selectedContent.fields.length > 0) {
          scanSummary += `• Form Fields: ${selectedContent.fields.length}\n`;
        }
        
        if (selectedContent.code && selectedContent.code.trim()) {
          scanSummary += `• Code Detected: ✅ Yes\n`;
        }
        
        if (selectedContent.text && selectedContent.text.trim()) {
          scanSummary += `• Text Content: ✅ Yes\n`;
        }
        
        addMessage(scanSummary, 'bot');
        
        // Show the actual scanned content in a structured way
        if (selectedContent.code && selectedContent.code.trim()) {
          addMessage(`💻 **SCANNED CODE:**\n\`\`\`java\n${selectedContent.code.trim()}\n\`\`\``, 'bot');
        }
        
        if (selectedContent.text && selectedContent.text.trim()) {
          const displayText = selectedContent.text.length > 500 ? 
                             selectedContent.text.substring(0, 500) + '...\n\n*(Content truncated for display)*' : 
                             selectedContent.text;
          addMessage(`📋 **SCANNED TEXT:**\n\n"${displayText}"`, 'bot');
        }
        
        // Show form fields in a structured way
        if (selectedContent.fields.length > 0) {
          let fieldsMessage = '📝 **FORM FIELDS DETECTED:**\n\n';
          selectedContent.fields.forEach((field, index) => {
            fieldsMessage += `${index + 1}. **${field.label || field.name}**\n`;
            fieldsMessage += `   • Type: ${field.type}\n`;
            if (field.placeholder) fieldsMessage += `   • Placeholder: "${field.placeholder}"\n`;
            if (field.required) fieldsMessage += `   • Required: Yes\n`;
            fieldsMessage += '\n';
          });
          addMessage(fieldsMessage, 'bot');
        }
        
        // Content is ready for questions
        addMessage(`✅ **Ready to answer your questions about the scanned content!**`, 'bot');
        
      } else {
        addMessage('✅ **Content scanned!** You can now ask me questions about the selected content.', 'bot');
      }
    } catch (error) {
      console.error('Selection analysis failed:', error);
      addMessage('❌ Failed to analyze the selected area. Please try again.', 'bot');
    } finally {
      setLoading(false);
      // Clear the saved coordinates
      selectionStart = null;
      selectionEnd = null;
    }
  }
  
  // Assign to global instance
  window.universalAssistantInstance.analyzeSelectedArea = analyzeSelectedArea;
  
  async function makeAPICall(endpoint, data) {
    try {
      console.log('Making API call to:', `${API_BASE}${endpoint}`);
      console.log('Request data:', data);
      
      // First, try to check if the backend is accessible
      const healthCheck = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'text/plain',
        },
      }).catch(() => null);
      
      if (!healthCheck || !healthCheck.ok) {
        throw new Error('Backend server is not accessible. Please make sure the AI Scanner backend is running on localhost:8054');
      }
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(data),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Response data:', result);
      return result;
    } catch (error) {
      console.error('API call failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  }
  
  // Event handlers
  toggleButton.addEventListener('click', () => {
    chatContainer.classList.toggle('visible');
    if (chatContainer.classList.contains('visible')) {
      messageInput.focus();
    }
  });
  
  closeButton.addEventListener('click', () => {
    chatContainer.classList.remove('visible');
  });
  
  scanButton.addEventListener('click', () => {
    if (isLoading || isSelecting) return;
    
    // Close chat and start selection mode
    chatContainer.classList.remove('visible');
    startSelection();
  });
  
  async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isLoading) return;
    
    // Add user message
    addMessage(message, 'user');
    messageInput.value = '';
    
    setLoading(true);
    
    try {
      // Use scanned content if available, otherwise use page analysis
      let contextContent = '';
      if (currentPageAnalysis?.scannedContent) {
        // Prioritize scanned content for questions
        contextContent = [
          currentPageAnalysis.scannedContent.code ? `Code: ${currentPageAnalysis.scannedContent.code}` : '',
          currentPageAnalysis.scannedContent.text ? `Text: ${currentPageAnalysis.scannedContent.text}` : '',
          currentPageAnalysis.scannedContent.fields?.length > 0 ? 
            `Form Fields: ${currentPageAnalysis.scannedContent.fields.map(f => `${f.label || f.name} (${f.type})`).join(', ')}` : ''
        ].filter(content => content.trim()).join('\n\n');
      } else {
        // Fallback to full page analysis
        contextContent = [
          currentPageAnalysis?.pageSummary || '',
          currentPageAnalysis?.pageContent || '',
          currentPageAnalysis?.codeContent || '',
          currentPageAnalysis?.questionsContent || ''
        ].filter(content => content.trim()).join('\n\n');
      }
      
              // Smart context-aware response system
      let enhancedQuestion = message;
      if (currentPageAnalysis?.scannedContent) {
        const scannedText = currentPageAnalysis.scannedContent.text || '';
        const scannedCode = currentPageAnalysis.scannedContent.code || '';
        const allContent = (scannedText + ' ' + scannedCode).trim();
        
        // Detect content type and user intent
        const isCodingRequest = message.toLowerCase().includes('code') || 
                               message.toLowerCase().includes('solution') || 
                               message.toLowerCase().includes('implement') || 
                               message.toLowerCase().includes('write') ||
                               message.toLowerCase().includes('program') ||
                               message.toLowerCase().includes('method') ||
                               message.toLowerCase().includes('function') ||
                               message.toLowerCase().includes('solve') ||
                               message.toLowerCase().includes('algorithm') ||
                               message.toLowerCase().includes('generate');
        
        const isExplanationRequest = message.toLowerCase().includes('explain') ||
                                   message.toLowerCase().includes('what') ||
                                   message.toLowerCase().includes('how') ||
                                   message.toLowerCase().includes('why') ||
                                   message.toLowerCase().includes('mean') ||
                                   message.toLowerCase().includes('understand');
        
        const isAnalysisRequest = message.toLowerCase().includes('analyze') ||
                                message.toLowerCase().includes('output') ||
                                message.toLowerCase().includes('result') ||
                                message.toLowerCase().includes('happen');
        
        // Detect content type
        const hasCodingContent = allContent.includes('method') || 
                               allContent.includes('function') || 
                               allContent.includes('algorithm') || 
                               allContent.includes('implement') || 
                               allContent.includes('write a program') ||
                               allContent.includes('public class') ||
                               allContent.includes('System.out.println') ||
                               allContent.includes('objects') ||
                               allContent.includes('array') ||
                               allContent.includes('list') ||
                               scannedCode.length > 0;
        
        const hasEducationalContent = allContent.includes('Tutorial') ||
                                    allContent.includes('learn') ||
                                    allContent.includes('introduction') ||
                                    allContent.includes('guide') ||
                                    allContent.includes('examples');
        
        // Create context-aware prompts
        if (isCodingRequest && hasCodingContent) {
          enhancedQuestion = `CODING TASK: You are an expert programming instructor. Based on the SCANNED CONTENT from the user: "${allContent}"

IMPORTANT: Answer based ONLY on the scanned content above. Do NOT reference any webpage content.

The user selected and scanned this specific content, and they want programming help related to it.

Please provide a complete, working solution with:
1. 📝 **Complete Code Implementation** (with proper class definitions if needed)
2. 💡 **Clear Comments** explaining each part
3. 🎯 **Example Usage** showing how to use the code
4. ✅ **Expected Output** (if applicable)
5. 🔍 **Code Explanation** in simple terms

User Question: ${message}

Format your response with proper headings and code blocks for maximum clarity. Focus entirely on the scanned content, not the webpage.`;

        } else if (isExplanationRequest) {
          enhancedQuestion = `EXPLANATION REQUEST: You are an expert teacher. Based on the SCANNED CONTENT from the user: "${allContent}"

IMPORTANT: Answer based ONLY on the scanned content above. Do NOT reference any webpage content.

The user selected and scanned this specific content and wants an explanation about it.

Please provide a comprehensive explanation with:
1. 🎯 **Simple Summary** (what this scanned content is about)
2. 📚 **Detailed Explanation** (how it works based on the scanned content)
3. 💡 **Key Points** (important concepts from the scanned content)
4. 🌟 **Real-world Examples** (practical applications related to the scanned content)
5. ❓ **Common Questions** (FAQ style if relevant to the scanned content)

User Question: ${message}

Make your explanation clear, structured, and easy to understand. Focus entirely on the scanned content.`;

        } else if (isAnalysisRequest && hasCodingContent) {
          enhancedQuestion = `CODE ANALYSIS: You are an expert code analyzer. Based on the SCANNED CONTENT from the user: "${allContent}"

IMPORTANT: Answer based ONLY on the scanned content above. Do NOT reference any webpage content.

The user selected and scanned this specific content and wants analysis of it.

Please analyze and provide:
1. 🔍 **Code Analysis** (what the scanned content shows)
2. ⚡ **Step-by-Step Execution** (how it works based on scanned content)
3. 📊 **Expected Output** (what will happen based on scanned content)
4. 💭 **Logic Explanation** (why it works this way based on scanned content)
5. 🚨 **Potential Issues** (if any, related to scanned content)

User Question: ${message}

Present your analysis in a clear, structured format. Focus entirely on the scanned content.`;

        } else {
          // Detect if user wants a brief/focused answer
          const isBriefQuestion = message.split(' ').length <= 5 || // Short questions
                                 message.toLowerCase().startsWith('what is') ||
                                 message.toLowerCase().startsWith('what are') ||
                                 message.toLowerCase().startsWith('define') ||
                                 message.toLowerCase().startsWith('meaning of');
          
          if (isBriefQuestion) {
            enhancedQuestion = `FOCUSED QUESTION: You are a helpful AI assistant. Based on the SCANNED CONTENT from the user: "${allContent}"

IMPORTANT: Answer based ONLY on the scanned content above. Do NOT reference any webpage content.

The user asked a specific, focused question and wants a BRIEF, DIRECT answer.

User Question: ${message}

Please provide a CONCISE response with ONLY:
🎯 **Direct Answer** (2-3 sentences maximum based on scanned content)

Keep it short, focused, and directly answer what they asked. Do NOT include sections like "Simple Summary", "Detailed Explanation", "Key Points", "Real-world Examples", or "Common Questions". Just give the direct answer.`;
          } else {
            enhancedQuestion = `GENERAL QUESTION: You are a helpful AI assistant. Based on the SCANNED CONTENT from the user: "${allContent}"

IMPORTANT: Answer based ONLY on the scanned content above. Do NOT reference any webpage content.

The user selected and scanned this specific content and has a question about it.

User Question: ${message}

Please provide a helpful response based on the scanned content. Keep it clear and focused. Do NOT include structured sections like "Simple Summary", "Detailed Explanation", "Key Points", "Real-world Examples", or "Common Questions". Just answer the question directly and conversationally.`;
          }
        }
      } else {
        // Enhanced general responses when no content is scanned
        const isCodingQuestion = message.toLowerCase().includes('code') || 
                               message.toLowerCase().includes('program') || 
                               message.toLowerCase().includes('java') || 
                               message.toLowerCase().includes('algorithm') || 
                               message.toLowerCase().includes('method') ||
                               message.toLowerCase().includes('function') ||
                               message.toLowerCase().includes('class') ||
                               message.toLowerCase().includes('array') ||
                               message.toLowerCase().includes('loop');
        
        const isFormQuestion = message.toLowerCase().includes('form') || 
                             message.toLowerCase().includes('field') || 
                             message.toLowerCase().includes('input') || 
                             message.toLowerCase().includes('button') || 
                             message.toLowerCase().includes('submit');
        
        const isWebQuestion = message.toLowerCase().includes('web') || 
                            message.toLowerCase().includes('html') || 
                            message.toLowerCase().includes('css') || 
                            message.toLowerCase().includes('javascript') ||
                            message.toLowerCase().includes('website');
        
        if (isCodingQuestion) {
          enhancedQuestion = `PROGRAMMING HELP: You are an expert programming tutor. Please provide comprehensive help for this programming question:

"${message}"

Please structure your response with:
1. 📝 **Code Example** (working solution with proper syntax)
2. 💡 **Explanation** (how the code works step by step)
3. 🎯 **Key Concepts** (important programming principles)
4. 🌟 **Best Practices** (professional tips)
5. 🔗 **Related Topics** (what to learn next)

Make your response educational and include practical examples.`;

        } else if (isFormQuestion) {
          enhancedQuestion = `WEB FORMS EXPERT: You are a web forms and UX specialist. Please provide detailed help for this form-related question:

"${message}"

Please structure your response with:
1. 🎯 **Direct Answer** (addressing the specific question)
2. 📝 **Form Best Practices** (UX and accessibility guidelines)
3. 💡 **Implementation Tips** (practical advice)
4. ✅ **Examples** (real-world scenarios)
5. 🚨 **Common Mistakes** (what to avoid)

Focus on user experience and accessibility.`;

        } else if (isWebQuestion) {
          enhancedQuestion = `WEB DEVELOPMENT GUIDE: You are a web development expert. Please provide comprehensive help for this web development question:

"${message}"

Please structure your response with:
1. 🎯 **Direct Answer** (clear solution)
2. 💻 **Code Examples** (if applicable)
3. 📚 **Explanation** (how it works)
4. 🌟 **Best Practices** (industry standards)
5. 🔗 **Resources** (additional learning)

Make it practical and actionable.`;

        } else {
          enhancedQuestion = `GENERAL AI ASSISTANT: You are a helpful AI assistant specializing in web development, programming, and form analysis. Please provide a comprehensive and helpful response to this question:

"${message}"

Please structure your response clearly with:
1. 🎯 **Direct Answer** (addressing the main question)
2. 📝 **Detailed Explanation** (providing context and details)
3. 💡 **Helpful Tips** (practical advice)
4. 🌟 **Examples** (if relevant)

Be informative, accurate, and user-friendly in your response.`;
        }
      }
      
      const response = await makeAPICall('/chat', {
        question: enhancedQuestion,
        url: window.location.href,
        pageContent: contextContent
      });
      
      // Remove loading message
      const loadingMessage = messagesContainer.lastElementChild;
      if (loadingMessage) loadingMessage.remove();
      
      addMessage(response.answer || "I apologize, but I couldn't generate a response right now.", 'bot');
      
    } catch (error) {
      // Remove loading message
      const loadingMessage = messagesContainer.lastElementChild;
      if (loadingMessage) loadingMessage.remove();
      
      addMessage('Sorry, I encountered an error while processing your question. Please try again.', 'bot');
    } finally {
      setLoading(false);
    }
  }
  
  sendButton.addEventListener('click', sendMessage);
  
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Auto-resize textarea
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 100) + 'px';
  });
  
  console.log('Universal AI Assistant loaded successfully!');
})();
