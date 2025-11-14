import React, { useState } from "react";
import "./ChatInput.css";

const ChatInput = ({ onSend, onImageUpload }) => {
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() || file) {
      if (file) {
        onImageUpload(file, input); // Send both the file and the message
        setFile(null); // Clear the file after sending
      } else {
        onSend(input); // Send only the message
      }
      setInput(""); // Clear the input field
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile); // Store the selected file
    }
  };

  const handleRemoveFile = () => {
    setFile(null); // Remove the selected file
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      {/* Attachment */}
      <label className="image-upload-label">
        +
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </label>

      {/* Text input with integrated file preview and voice input */}
      <div className="input-container">
        {/* File Preview inside input */}
        {file && (
          <div className="file-preview-inline">
            <span className="file-name">{file.name}</span>
            <button
              type="button"
              className="remove-file-button-inline"
              onClick={handleRemoveFile}
            >
              ×
            </button>
          </div>
        )}
        
        <div className="input-with-voice">
          <input
            type="text"
            placeholder={file ? "Add a message to your image..." : "Type a message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="chat-input"
          />
          
          {/* Voice/Microphone Button - integrated in input */}
          <button
            type="button"
            className={`voice-button ${isListening ? 'listening' : ''}`}
            onClick={handleVoiceInput}
            title="Start voice input"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 15C13.66 15 15 13.66 15 12V6C15 4.34 13.66 3 12 3C10.34 3 9 4.34 9 6V12C9 13.66 10.34 15 12 15Z" />
              <path d="M19 12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12" />
              <path d="M12 19V22" />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
