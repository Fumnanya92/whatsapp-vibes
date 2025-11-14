// Add this for Vite env type support
declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

// Grace API base URL with correct prefix
const GRACE_API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/grace";

// Centralized API utility for Grace UI
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${GRACE_API_BASE_URL}${normalizedEndpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} ${errorText}`);
  }
  return response.json();
}
