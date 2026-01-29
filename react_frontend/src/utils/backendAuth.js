// Utility to get and manage backend JWT tokens
// Uses guest login for simplicity; can be extended to use Auth0 tokens later

import { API_BASE } from '../config';

const TOKEN_STORAGE_KEY = 'mitrasetu_backend_token';
const TOKEN_EXPIRY_KEY = 'mitrasetu_backend_token_expiry';

/**
 * Get a valid backend JWT token, fetching a new one if needed
 * @returns {Promise<string>} JWT token
 */
export async function getBackendToken() {
  // Check if we have a valid cached token
  const cachedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (cachedToken && expiry && Date.now() < parseInt(expiry, 10)) {
    return cachedToken;
  }

  // Fetch a new guest token
  try {
    const response = await fetch(`${API_BASE}/auth/guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get backend token: ${response.status}`);
    }

    const data = await response.json();
    const token = data.token;

    if (!token) {
      throw new Error('No token in backend response');
    }

    // Cache the token (JWT tokens typically expire in 1 hour, cache for 50 minutes)
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + 50 * 60 * 1000));

    return token;
  } catch (error) {
    console.error('Error fetching backend token:', error);
    throw error;
  }
}

/**
 * Clear cached backend token (useful for logout)
 */
export function clearBackendToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}
