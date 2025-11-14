
// src/components/Chat/ChatBubble.jsx
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import notificationManager from "../../utils/NotificationManager";
import "./ChatBubble.css";

/**
 * ChatBubble will:
 *  - Render Markdown using react-markdown.
 *  - Within each line, look for any substring that "looks like" an image URL:
 *      e.g.  https://cdn.shopify.com/.../something_200x200.jpg
 *    and render that substring as <img> instead of plain text.
 *  - Trigger notifications when Grace sends a message.
 */
const ChatBubble = ({ sender, text, timestamp, isProactive = false }) => {
  // Helper to decode Unicode escape sequences and clean malformed media tags
  const decodeUnicode = (str) => {
    try {
      // Replace \\u with \u and then decode
      let cleaned = str.replace(/\\\\u/g, '\\u').replace(/\\u[\dA-F]{4}/gi, (match) => {
        return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
      });
      
      // Clean up malformed media tags
      cleaned = cleaned.replace(/￼/g, ''); // Remove object replacement characters
      cleaned = cleaned.replace(/<Media>.*?<\/Media>/g, ''); // Remove malformed media tags
      
      return cleaned;
    } catch (e) {
      return str;
    }
  };

  // Helper to check if text is a JSON array
  let isCatalogueArray = false;
  let catalogue = [];
  
  if (typeof text === "string") {
    console.log('Original text received:', text);
    
    try {
      // First, try to fix common JSON issues
      let cleanedText = text;
      
      // Check if it looks like a JSON array but is incomplete
      if (text.trim().startsWith('[{') && !text.trim().endsWith('}]')) {
        // Try to fix incomplete JSON by adding missing closing brackets
        const openBraces = (text.match(/\{/g) || []).length;
        const closeBraces = (text.match(/\}/g) || []).length;
        const missingBraces = openBraces - closeBraces;
        
        if (missingBraces > 0) {
          cleanedText = text + '}]';
          console.log('Attempting to fix incomplete JSON:', cleanedText);
        }
      }
      
      const parsed = JSON.parse(cleanedText);
      if (Array.isArray(parsed) && parsed.length) {
        // Filter only valid catalogue items
        catalogue = parsed.filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.name === "string" &&
            typeof item.price === "string"
        ).map(item => ({
          ...item,
          // Decode Unicode characters in name and price
          name: decodeUnicode(item.name),
          price: decodeUnicode(item.price),
          // Ensure image is a string, even if empty
          image: typeof item.image === "string" ? item.image.trim() : ""
        }));
        
        if (catalogue.length > 0) {
          isCatalogueArray = true;
          console.log('Successfully parsed catalogue:', catalogue);
          console.log('Image URLs found:', catalogue.map(item => ({ name: item.name, image: item.image })));
        }
      }
    } catch (e) {
      console.log('JSON parse failed:', e.message);
      console.log('Full text that failed to parse:', text);
      
      // Check if the text looks like it was meant to be a catalogue
      if (text.includes('"name"') && text.includes('"price"') && text.includes('[{')) {
        console.log('Text appears to be malformed catalogue JSON');
        // Try to extract product information using regex as fallback
        try {
          const nameMatches = text.match(/"name":\s*"([^"]+)"/g);
          const priceMatches = text.match(/"price":\s*"([^"]+)"/g);
          const imageMatches = text.match(/"image":\s*"([^"]*?)"/g);
          
          console.log('Regex matches found:', {
            names: nameMatches?.length || 0,
            prices: priceMatches?.length || 0,
            images: imageMatches?.length || 0
          });
          
          if (nameMatches && priceMatches && nameMatches.length === priceMatches.length) {
            const extractedItems = [];
            for (let i = 0; i < nameMatches.length; i++) {
              const name = nameMatches[i].match(/"name":\s*"([^"]+)"/)[1];
              const price = priceMatches[i].match(/"price":\s*"([^"]+)"/)[1];
              
              // Try to extract image URL if available
              let image = "";
              if (imageMatches && imageMatches[i]) {
                const imageMatch = imageMatches[i].match(/"image":\s*"([^"]*?)"/);
                if (imageMatch && imageMatch[1]) {
                  image = imageMatch[1].trim();
                }
              }
              
              extractedItems.push({
                name: decodeUnicode(name),
                price: decodeUnicode(price),
                image: image
              });
            }
            
            if (extractedItems.length > 0) {
              catalogue = extractedItems;
              isCatalogueArray = true;
              console.log('Extracted catalogue from malformed JSON:', catalogue);
              console.log('Extracted image URLs:', extractedItems.map(item => ({ name: item.name, image: item.image })));
            }
          }
        } catch (extractError) {
          console.log('Failed to extract from malformed JSON:', extractError);
        }
      }
    }
  }

  // Trigger notification when Grace sends a message
  useEffect(() => {
    // Only trigger notifications for Grace's messages (not user messages)
    if (sender === "Grace" && text) {
      // Extract first line of text for notification preview
      let notificationText = text;
      if (typeof text === 'string') {
        notificationText = decodeUnicode(text);
        // Get first sentence or up to 100 characters
        const firstLine = notificationText.split('\n')[0];
        notificationText = firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine;
      }
      
      // Use different notification text for proactive messages
      if (isProactive) {
        notificationManager.notifyNewMessage(`Grace: ${notificationText}`);
      } else {
        notificationManager.notifyNewMessage(notificationText);
      }
    }
  }, [sender, text, isProactive]); // Dependencies: re-run when these change

  if (isCatalogueArray) {
    return (
      <div
        className={clsx(
          "chat-bubble",
          sender === "user" ? "chat-bubble-user" : "chat-bubble-grace"
        )}
      >
        <div className="catalogue-grid">
          {catalogue.map((item, idx) => (
            <div key={idx} className="product-card">
              <div className="product-image-container">
                {item.image && item.image.trim() !== "" ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="product-image"
                    onError={(e) => {
                      console.log(`Failed to load image for ${item.name}:`, item.image);
                      e.target.onerror = null;
                      // Use a relative path so the placeholder resolves correctly when the
                      // SPA is served under a sub-path (e.g. /chat/). An absolute leading
                      // slash would point to the site root and fail to load in that case.
                      e.target.src = "placeholder.svg";
                    }}
                  />
                ) : (
                  <div className="product-image-placeholder">
                    <span>📷</span>
                    <span>No Image Available</span>
                  </div>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-name">{item.name}</h3>
                <p className="product-price">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
        {timestamp && (
          <div className="chat-timestamp">{timestamp}</div>
        )}
      </div>
    );
  }

  // Clean and decode the text first
  let cleanedText = typeof text === 'string' ? decodeUnicode(text) : text;
  
  // Enhanced regex to match image URLs, including Shopify CDN URLs
  // Negative lookbehind for '![' and '(', so we don't double-wrap
  const URL_REGEX = /(?<!\!\[.*?\]\()(https?:\/\/(?:cdn\.shopify\.com|[^\s]+)\/[^\s]*\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?[^\s]*)?)/gi;

  // Replace plain image URLs with markdown image syntax, leave markdown images untouched
  let processedText = cleanedText.replace(URL_REGEX, (url) => `![](${url})`);

  // Custom components for ReactMarkdown to ensure proper image rendering
  const markdownComponents = {
    img: ({ node, ...props }) => (
      <img
        {...props}
        style={{
          maxWidth: '300px',
          maxHeight: '200px',
          borderRadius: '8px',
          margin: '10px 0',
          display: 'block'
        }}
        onError={(e) => {
          console.log('Failed to load markdown image:', props.src);
          e.target.style.display = 'none';
        }}
      />
    ),
    a: ({ node, children, href, ...props }) => {
      // Check if this is an image URL (including Shopify CDN URLs) or if text content indicates it's an image
      const childText = Array.isArray(children) ? children.join('') : children || '';
      
      // Debug logging to see what we're getting
      console.log('Link detected:', { href, childText, children });
      
      const isImageLink = href && (
        href.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) || // Standard image extensions
        href.includes('cdn.shopify.com') || // Shopify CDN URLs
        href.includes('/files/') || // Generic file URLs
        childText.toLowerCase().includes('image') || // Grace uses "Product Image" text for product images
        childText.toLowerCase() === 'image' || // Fallback for just "Image"
        childText.toLowerCase().includes('view image') || // Handle "View Image" links
        href.match(/\.(jpg|jpeg|png|gif|webp|svg)/i) // Image extensions anywhere in URL
      );
      
      console.log('Is image link?', isImageLink, 'for URL:', href);
      
      if (isImageLink) {
        // Use the href directly - it's already a full URL from Shopify
        console.log('Rendering as image:', href);
        
        return (
          <img
            src={href}
            alt={childText.toLowerCase().includes('image') ? 'Product Image' : childText}
            style={{
              maxWidth: '300px',
              maxHeight: '200px',
              borderRadius: '8px',
              margin: '10px 0',
              display: 'block',
              cursor: 'pointer'
            }}
            onClick={() => window.open(href, '_blank')}
            onError={(e) => {
              console.log('Failed to load linked image:', href);
              e.target.style.display = 'none';
            }}
          />
        );
      }
      
      // For non-image links, render as normal external links
      return (
        <a
          {...props}
          href={href}
          target={href?.startsWith('http') ? '_blank' : undefined}
          rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      );
    }
  };

  return (
    <div
      className={clsx(
        "chat-bubble",
        sender === "user" ? "chat-bubble-user" : "chat-bubble-grace",
        isProactive && "chat-bubble-proactive"
      )}
    >
      <ReactMarkdown components={markdownComponents}>{processedText}</ReactMarkdown>
      {timestamp && (
        <div className="chat-timestamp">{timestamp}</div>
      )}
    </div>
  );
};

ChatBubble.propTypes = {
  sender: PropTypes.oneOf(["user", "grace"]).isRequired,
  text: PropTypes.string.isRequired,
  timestamp: PropTypes.string,
  isProactive: PropTypes.bool,
};

export default ChatBubble;
