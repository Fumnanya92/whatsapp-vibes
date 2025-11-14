import React, { useState, useEffect, useRef } from "react";
import ChatBubble from "../components/Chat/ChatBubble";
import ChatInput from "../components/Chat/ChatInput";
import ProductCard from "../components/Catalog/ProductCard";
import useSpeechRecognition from "../hooks/useSpeechRecognition"; // Import the hook
import notificationManager from "../utils/NotificationManager";
import "../styles/common.css"; // Global CSS variables (colors, fonts, etc.)
import "./ChatPage.css"; // ChatPage‐specific styles
import { API_BASE_URL, graceApiFetch, GRACE_API_ENDPOINTS } from "../utils/constants";

// Get API base URL from constants (includes /grace prefix)

/**
 * Create or reuse a per-browser session id so each visitor has a private conversation.
 * Stored in localStorage as `grace_session_id`.
 */
const getSessionId = () => {
  try {
    const key = 'grace_session_id';
    let sid = window.localStorage.getItem(key);
    if (!sid) {
      // Prefer native crypto.randomUUID when available
      if (window.crypto && window.crypto.randomUUID) {
        sid = window.crypto.randomUUID();
      } else {
        // Fallback UUID v4
        sid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }
      window.localStorage.setItem(key, sid);
    }
    return sid;
  } catch (e) {
    // If localStorage is unavailable, fallback to a transient in-memory id
    if (!window.__grace_fallback_id) {
      window.__grace_fallback_id = 'guest-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    }
    return window.__grace_fallback_id;
  }
};

const ChatPage = () => {
  // Registration state: store simple visitor identity (name + phone) locally
  const [visitor, setVisitor] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regInstagram, setRegInstagram] = useState("");
  const [regCountryCode, setRegCountryCode] = useState("+234"); // Default to Nigeria

  // Common country codes for the dropdown
  const countryCodes = [
    { code: "+234", country: "Nigeria", flag: "🇳🇬" },
    { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+27", country: "South Africa", flag: "🇿🇦" },
    { code: "+233", country: "Ghana", flag: "🇬🇭" },
    { code: "+254", country: "Kenya", flag: "🇰🇪" },
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+86", country: "China", flag: "🇨🇳" },
    { code: "+33", country: "France", flag: "🇫🇷" },
    { code: "+49", country: "Germany", flag: "🇩🇪" },
  ];

  const getStoredVisitor = () => {
    try {
      const j = window.localStorage.getItem("grace_user");
      return j ? JSON.parse(j) : null;
    } catch (e) {
      return null;
    }
  };

  const setStoredVisitor = (obj) => {
    try {
      window.localStorage.setItem("grace_user", JSON.stringify(obj));
      setVisitor(obj);
    } catch (e) {
      console.warn("Could not store visitor info", e);
    }
  };
  
  // Fetch catalog products handled below with improved availability logic
    /** Fetch catalog products for preview */
    const fetchCatalogProducts = async () => {
      try {
        const response = await graceApiFetch("/shopify/catalog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({})
        });
        const data = await response.json();

        let products = data.products || [];

        const variantIsAvailable = (variant) => {
          if (!variant) return false;
          if (variant.available === false) return false;
          if (typeof variant.inventory_quantity === 'number') return variant.inventory_quantity > 0;
          if (variant.inventory_management === 'shopify') return false;
          return variant.available !== false;
        };

        const productIsAvailable = (product) => {
          if (!product) return false;
          if (product.available === false) return false;
          if (product.status === 'unavailable' || product.status === 'archived') return false;
          if (product.variants && product.variants.length > 0) return product.variants.some(variantIsAvailable);
          if (typeof product.inventory_quantity === 'number') return product.inventory_quantity > 0;
          return product.available !== false;
        };

        // Filter and sort
        products = products.filter(productIsAvailable);
        products.sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0));

        // Take first 6 products for preview
        setCatalogProducts(products.slice(0, 6));
      } catch (error) {
        console.error("Failed to fetch catalog:", error);
        setCatalogProducts([]);
      }
  };
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isVoiceInputOpen, setIsVoiceInputOpen] = useState(false); // Track if the voice input box is open
  const [speechError, setSpeechError] = useState(null); // Track speech recognition errors
  const [isListeningLoading, setIsListeningLoading] = useState(false); // Track loading state for speech recognition
  const [lastMessageCount, setLastMessageCount] = useState(0); // Track message count for proactive detection
  const [historyLoaded, setHistoryLoaded] = useState(false); // Track if initial history is loaded

  const debounceTimeout = useRef(null); // Ref for debouncing speech recognition updates
  const pollingInterval = useRef(null); // Ref for message polling interval

  const { listening, toggle, error: speechRecognitionError } = useSpeechRecognition({
    onResult: (text) => {
      // Debounce updates to the query state
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        setQuery((prevQuery) => `${prevQuery} ${text}`.trim());
        setIsVoiceInputOpen(true); // Keep the voice input box open
      }, 300); // 300ms debounce
    },
    lang: "en-US",
  });

  /** Scroll to bottom whenever messages change */
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50); // Small delay to ensure DOM updates are complete
  };
  useEffect(scrollToBottom, [messages, isLoading]);

  /** Handle speech recognition errors */
  useEffect(() => {
    if (speechRecognitionError) {
      setSpeechError("Microphone access denied or unavailable.");
    } else {
      setSpeechError(null);
    }
  }, [speechRecognitionError]);

  /** Load initial chat history once on component mount */
  const loadInitialHistory = async () => {
    try {
      const stored = getStoredVisitor();
      const userId = stored?.phone || getSessionId();
  const res = await graceApiFetch(`${GRACE_API_ENDPOINTS.CHAT_HISTORY}/${encodeURIComponent(userId)}`);
  const data = await res.json();
      const chatHistory = data.history || [];
      
      // Load all existing messages from history - regular conversations only
      const existingMessages = [];
      for (const entry of chatHistory) {
        if (!entry.user_message.includes('[PROACTIVE_TRIGGER]')) {
          // Regular conversation - add both user and bot messages
          if (entry.user_message) {
            existingMessages.push({ sender: "user", text: entry.user_message });
          }
          existingMessages.push({ sender: "grace", text: entry.bot_reply });
        }
      }
      
      setMessages(existingMessages);
      setLastMessageCount(chatHistory.length);
      setHistoryLoaded(true);
      
      console.log(`Loaded ${existingMessages.length} existing messages, tracking ${chatHistory.length} total entries`);
    } catch (error) {
      console.error("Error loading initial history:", error);
      setHistoryLoaded(true); // Still mark as loaded to start polling
    }
  };

  /** Check for new proactive messages from chat history */
  const checkForNewMessages = async () => {
    if (!historyLoaded) return; // Don't check until initial history is loaded
    
    try {
  const stored = getStoredVisitor();
  const userId = stored?.phone || getSessionId();
  const res2 = await graceApiFetch(`${GRACE_API_ENDPOINTS.CHAT_HISTORY}/${encodeURIComponent(userId)}`);
    const data = await res2.json();
      const chatHistory = data.history || [];
      
      if (chatHistory.length > lastMessageCount) {
        console.log(`New entries detected: ${chatHistory.length - lastMessageCount} new entries`);
        
        // New messages detected - process only the new ones
        const newEntries = chatHistory.slice(lastMessageCount);
        const newMessages = [];
        
        for (const entry of newEntries) {
          if (entry.user_message.includes('[PROACTIVE_TRIGGER]') && entry.bot_reply) {
            // New proactive message - add with special styling indicator
            console.log("Adding new proactive message:", entry.bot_reply);
            newMessages.push({ 
              sender: "grace", 
              text: entry.bot_reply,
              isProactive: true 
            });
          }
          // Note: Regular conversation messages are handled by sendMessage function, not here
        }
        
        if (newMessages.length > 0) {
          setMessages(prev => [...prev, ...newMessages]);
          console.log(`Added ${newMessages.length} new proactive messages`);
        }
        setLastMessageCount(chatHistory.length);
      }
    } catch (error) {
      console.error("Error checking for new messages:", error);
    }
  };

  /** Load initial history and start polling for new messages when component mounts */
  useEffect(() => {
    // Load visitor info and initial chat history once
    const stored = getStoredVisitor();
    if (stored) {
      setVisitor(stored);
      loadInitialHistory();
    } else {
      // No visitor recorded: show quick registration modal so we can tie a phone to the session
      setShowRegister(true);
      // Still load session-scoped history so the visitor sees their session messages before registering
      loadInitialHistory();
    }
  }, []);

  // Re-enabled polling for proactive messages with reduced frequency
  useEffect(() => {
    if (!historyLoaded) return; // Don't start polling until history is loaded
    
    // Poll every 30 seconds for new proactive messages only (reduced from 10s to prevent spam)
    pollingInterval.current = setInterval(checkForNewMessages, 30000);
    
    // Cleanup on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [historyLoaded, lastMessageCount]);

  // Add notification polling for sound triggers and real-time updates
  useEffect(() => {
    if (!historyLoaded || !visitor?.phone) return; // Don't start until loaded and user registered
    
    const pollNotifications = async () => {
      try {
        const userId = encodeURIComponent(visitor.phone);
        console.log('📡 Polling notifications for user:', userId);
        const response = await graceApiFetch(`/chat/notifications/${userId}?clear=true`);
        const data = await response.json();
        
        console.log('📥 Notification response:', data);
        
        if (data.notifications && data.notifications.length > 0) {
          console.log('📢 Received notifications:', data.notifications);
          
          data.notifications.forEach(notification => {
            // Play sound if requested
            if (notification.play_sound) {
              console.log('🔊 Playing notification sound...');
              notificationManager.notifyNewMessage(notification.message || 'New message from Grace');
            }
            
            // Add message to chat if it's a proactive message
            if (notification.message && notification.type === 'proactive') {
              setMessages(prev => [...prev, { sender: "grace", text: notification.message, isProactive: true }]);
              console.log('📩 Added proactive message to chat:', notification.message);
            }
          });
        }
      } catch (error) {
        console.warn('Error polling notifications:', error);
      }
    };
    
    // Poll every 5 seconds for notifications
    const notificationInterval = setInterval(pollNotifications, 5000);
    
    // Cleanup on unmount or when dependencies change
    return () => {
      if (notificationInterval) {
        clearInterval(notificationInterval);
      }
    };
  }, [historyLoaded, visitor?.phone]);

  /** Register visitor: POST mapping to backend and merge session history */
  const handleRegisterSubmit = async () => {
    const phone = regPhone.trim();
    const name = regName.trim();
    if (!phone) {
      alert("Please enter a phone number");
      return;
    }

    // Combine country code with phone number
    const fullPhone = regCountryCode + phone;
    const instagram = regInstagram.trim();

  // Persist locally first (store both phone and number for compatibility)
  setStoredVisitor({ phone: fullPhone, number: fullPhone, name, instagram });

    try {
      const sessionId = getSessionId();
      const res = await graceApiFetch(GRACE_API_ENDPOINTS.SESSION_REGISTER, {
        method: "POST",
        // Send both `number` (preferred) and `phone` (legacy) to remain compatible with older backends
        body: JSON.stringify({ session_id: sessionId, number: fullPhone, phone: fullPhone, name, instagram }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("Register failed:", err);
      } else {
        // Use the server-returned canonical phone/session info when available
        try {
          const payload = await res.json();
          const returnedPhone = payload.phone || payload.number || fullPhone;
          const returnedSession = payload.session_id || sessionId;
          // Persist the canonical phone/number and session id locally
          setStoredVisitor({ phone: returnedPhone, number: returnedPhone, name, instagram });
          try {
            window.localStorage.setItem('grace_session_id', returnedSession);
          } catch (e) {
            console.warn('Could not persist session id locally', e);
          }
        } catch (e) {
          // If JSON parse fails, fall back to the prior local value
          console.warn('Could not parse register response, keeping local visitor data');
        }
      }
    } catch (e) {
      console.error("Error registering session:", e);
    }

    // Hide modal and reload history by phone id
    setShowRegister(false);
    await loadInitialHistory();
  };

  /** Helper – hit /webhook with FormData the way Twilio would */
  const callWebhook = async (formData) => {
    const res = await graceApiFetch(GRACE_API_ENDPOINTS.WEBHOOK, {
      method: "POST",
      body: formData,
    });
    const mime = res.headers.get("content-type") || "";
    if (mime.includes("application/json")) {
      const json = await res.json();
      return json.reply ?? JSON.stringify(json);
    }
    const text = await res.text();
    const match = text.match(/<Message[^>]*>([\s\S]*?)<\/Message>/i);
    return match ? match[1].trim() : text;
  };

  /** Send a plain text message */
  const sendMessage = async (messageText) => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    // Check if user is registered before allowing chat
    const stored = getStoredVisitor();
    if (!stored?.phone || !stored?.name) {
      setShowRegister(true);
      return;
    }

    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setIsLoading(true);

    try {
      const formData = new FormData();
  // Use the visitor phone if available, otherwise per-browser session id
  const stored = getStoredVisitor();
  formData.append("From", stored?.phone || getSessionId());
      formData.append("Body", trimmed);
      formData.append("Source", "web_client"); // Identify this as a web client request
      const reply = await callWebhook(formData);

      // Split the reply into lines and add each as a separate bubble
      const lines = reply.split(/\r?\n\r?\n/).flatMap((chunk) => chunk.split(/\r?\n/));
      setMessages((prev) => [
        ...prev,
        ...lines.map((line) => ({ sender: "grace", text: line.trim() })),
      ]);
      
      // Show notification for new message from Grace
      const firstLine = lines[0]?.trim();
      if (firstLine) {
        notificationManager.notifyNewMessage(firstLine.slice(0, 50) + (firstLine.length > 50 ? '...' : ''));
      }
      
      // Update message count to reflect new conversation entry
      setLastMessageCount(prev => prev + 2); // +2 for user message and bot reply
      
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "grace", text: "❌ Network error." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /** Handle image upload */
  const handleImageUpload = async (file, messageText = "") => {
    if (!file) return;

    // Check if user is registered before allowing chat
    const stored = getStoredVisitor();
    if (!stored?.phone || !stored?.name) {
      setShowRegister(true);
      return;
    }

    const trimmedMessage = messageText.trim();
    const uploadingMessage = trimmedMessage || "[Uploading Image...]";
    
    // Add user message once
    setMessages((prev) => [...prev, { sender: "user", text: uploadingMessage }]);
    setIsLoading(true);

    try {
      // Upload the image to get a public URL
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      const uploadResponse = await graceApiFetch(GRACE_API_ENDPOINTS.UPLOAD_IMAGE, {
        method: "POST",
        body: uploadFormData,
      });
      const uploadJson = await uploadResponse.json();
      const publicUrl = uploadJson.url;

      // Send the public URL and optional message to the webhook
      const formData = new FormData();
      formData.append("From", stored?.phone || getSessionId());
      formData.append("MediaUrl0", publicUrl);
      formData.append("MediaContentType0", file.type);
      if (trimmedMessage) {
        formData.append("Body", trimmedMessage);
      }
      const reply = await callWebhook(formData);

      // Update the user message and add Grace's reply in one operation
      setMessages((prev) => {
        const newMessages = [...prev];
        // Update the last message (user's upload message) if needed
        if (!trimmedMessage) {
          newMessages[newMessages.length - 1] = { sender: "user", text: publicUrl };
        }
        // Add Grace's reply
        const lines = reply.split(/\r?\n\r?\n/).flatMap((chunk) => chunk.split(/\r?\n/));
        newMessages.push(...lines.map((line) => ({ sender: "grace", text: line.trim() })));
        
        // Show notification for Grace's response to image
        const firstLine = lines[0]?.trim();
        if (firstLine) {
          notificationManager.notifyNewMessage(firstLine.slice(0, 50) + (firstLine.length > 50 ? '...' : ''));
        }
        
        return newMessages;
      });
      
      // Update message count to reflect new conversation entry
      setLastMessageCount(prev => prev + 2); // +2 for user message and bot reply
      
    } catch (err) {
      console.error("Error uploading image:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "grace", text: "❌ Failed to upload image." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /** Send a query using webhook endpoint */
  const handleSend = async () => {
    try {
      const formData = new FormData();
      const stored = getStoredVisitor();
      formData.append("From", stored?.phone || getSessionId());
      formData.append("Body", query);
      const reply = await callWebhook(formData);
      setResponse(reply || "No response");
      setIsVoiceInputOpen(false); // Close the voice input box after sending
    } catch (error) {
      console.error("Error sending query:", error);
      setIsVoiceInputOpen(false); // Close the voice input box after sending
    }
  };

  /** Handle Enter key press */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent adding a new line
      sendMessage(query); // Send the message
      setQuery(""); // Clear the input field
    }
  };

  return (
    <div className="chat-page-container">
      {/* Header */}
      <header className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Atuche Woman" className="chat-logo" />
          <div>
            <h2 className="chat-title">Grace Chat</h2>
            <div className="brand-text">Powered by Atuche Woman</div>
          </div>
        </div>
      </header>

      {/* Registration modal (enhanced with country codes) */}
      {showRegister && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Welcome to Grace! ✨</h3>
            <p>Please share your details so we can provide you with a personalized shopping experience and save your conversation history.</p>
            
            <input
              type="text"
              placeholder="Your full name"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
            />
            
            <input
              type="text"
              placeholder="Instagram handle (optional, e.g. @yourhandle)"
              value={regInstagram}
              onChange={(e) => setRegInstagram(e.target.value)}
            />
            
            <div className="country-phone-group">
              <select
                className="country-code-select"
                value={regCountryCode}
                onChange={(e) => setRegCountryCode(e.target.value)}
              >
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.code}
                  </option>
                ))}
              </select>
              
              <input
                type="tel"
                className="phone-number-input"
                placeholder="Phone number (without country code)"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
              />
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => { 
                  fetchCatalogProducts();
                  setShowCatalog(true); 
                }} 
                className="btn btn-muted"
              >
                View Catalog
              </button>
              <button onClick={handleRegisterSubmit} className="btn btn-primary">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog preview modal */}
      {showCatalog && (
        <div className="modal-overlay">
          <div className="modal-card catalog-modal">
            <h3>✨ Newest Available Designs</h3>
            <p>Here are our latest and most popular designs - all currently available for purchase! To chat with Grace for personalized styling advice and recommendations, please register first.</p>
            
            {catalogProducts.length > 0 ? (
              <>
                <div className="catalog-header">
                  <span className="catalog-stats">
                    Showing {catalogProducts.length} newest available designs
                  </span>
                </div>
                <div className="catalog-grid">
                  {catalogProducts.map((product, idx) => (
                    <ProductCard key={idx} item={product} isNew={idx < 3} />
                  ))}
                </div>
              </>
            ) : (
              <div className="catalog-loading">
                <div className="loading-spinner"></div>
                <p>Loading our beautiful designs...</p>
              </div>
            )}
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowCatalog(false)} 
                className="btn btn-muted"
              >
                Close
              </button>
              <button 
                onClick={() => { 
                  setShowCatalog(false);
                  setShowRegister(true);
                }} 
                className="btn btn-primary"
              >
                Register to Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <main className="chat-messages-area">
        {messages.map((msg, idx) => (
          <div key={idx} className={`bubble-wrapper ${msg.sender}`}>
            <ChatBubble 
              sender={msg.sender} 
              text={msg.text} 
              isProactive={msg.isProactive || false}
            />
          </div>
        ))}
        {isLoading && (
          <div className="bubble-wrapper grace">
            <div className="typing-indicator">
              <div className="typing-avatar">
                <span className="grace-icon">G</span>
              </div>
              <div className="typing-bubble">
                <div className="typing-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
                <span className="typing-text">Grace is typing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Chat Input (existing component) */}
      <div className="chat-input-wrapper">
        {(!visitor?.phone || !visitor?.name) ? (
          <div className="registration-notice">
            <p>
              <span>👋</span> Welcome! Please <button 
                onClick={() => setShowRegister(true)} 
                className="register-link-btn"
              >
                register here
              </button> to start chatting with Grace
            </p>
            {/* Show input even when not registered for better UX */}
            <ChatInput
              onSend={sendMessage} // Pass the sendMessage function from ChatPage
              onImageUpload={(file, message) => handleImageUpload(file, message)} // Pass the handleImageUpload function
            />
          </div>
        ) : (
          <ChatInput
            onSend={sendMessage} // Pass the sendMessage function from ChatPage
            onImageUpload={(file, message) => handleImageUpload(file, message)} // Pass the handleImageUpload function
          />
        )}
      </div>

      {/* Conditionally render the voice input box */}
      {(listening || isVoiceInputOpen) && (
        <div className="voice-query-wrapper">
          <textarea
            className="voice-query-textarea"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown} // Listen for Enter key
            placeholder="Listening... Speak your query"
          />
          <div className="voice-buttons">
            <button className="voice-send-btn" onClick={() => sendMessage(query)}>
              Send
            </button>
          </div>
        </div>
      )}

      {/* Speech recognition error feedback */}
      {speechError && <div className="speech-error">{speechError}</div>}

      {/* Assistant’s LLM response */}
      {response && <div className="llm-response-box">{response}</div>}
    </div>
  );
};

export default ChatPage;
