// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/grace";

// Grace API endpoints are mounted at /grace prefix
export const GRACE_API_ENDPOINTS = {
  CHAT_HISTORY: "/chat/history",
  DEV_STATS: "/dev/stats", 
  SHOPIFY_CATALOG: "/shopify/catalog",
  DEV_CHAT: "/dev/chat",
  WEBHOOK: "/webhook",
  UPLOAD_IMAGE: "/upload-image",
  SESSION_REGISTER: "/session/register"
};

// Helper function for API calls with cache busting and error handling
export const graceApiFetch = async (endpoint, options = {}) => {
  // Add cache busting for returning users
  const separator = endpoint.includes('?') ? '&' : '?';
  const cacheBuster = `${separator}_cb=${Date.now()}&v=${Date.now()}`;
  const url = `${API_BASE_URL}${endpoint}${cacheBuster}`;
  
  console.log('[API] Making request to:', url);
  
  const isNgrok = API_BASE_URL.includes('ngrok');
  const body = options.body;
  
  // Don't set Content-Type when sending FormData (browser will set the multipart boundary)
  const headers = {
    // Force no cache for all requests
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...(options.headers || {}),
  };
  
  if (!(body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  
  if (isNgrok) {
    // Add ngrok header to skip the browser warning interstitial for API calls
    headers['ngrok-skip-browser-warning'] = '1';
  }

  try {
    console.log('[API] Request headers:', headers);
    
    const response = await fetch(url, {
      ...options,
      headers,
      // Force network request, avoid any browser cache
      cache: 'no-store'
    });

    console.log('[API] Response status:', response.status);
    console.log('[API] Response ok:', response.ok);

    // Add response debugging
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('[API] Error response:', errorText);
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return response;
  } catch (error) {
    console.error('[API] Fetch error:', error);
    console.error('[API] Failed URL:', url);
    
    // Check if it's a network error vs API error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network connection error. Please check your internet connection and try again.');
    }
    
    throw error;
  }
};