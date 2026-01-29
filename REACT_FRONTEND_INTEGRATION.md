# React Frontend Integration with Amazon Nova Pro

This document explains how the React frontend has been integrated with the Amazon Nova Pro backend.

## Summary of Changes

### 1. Created Backend Authentication Utility

**File**: `react_frontend/src/utils/backendAuth.js`

- **Purpose**: Manages backend JWT token acquisition and caching
- **Key Function**: `getBackendToken()`
  - Fetches a guest token from `/auth/guest` endpoint
  - Caches the token in localStorage for 50 minutes (tokens expire in 1 hour)
  - Automatically refreshes expired tokens

### 2. Updated AIAssistant Component

**File**: `react_frontend/src/components/AIAssistant.jsx`

**Changes Made**:
- ✅ Removed direct Gemini API calls (`https://generativelanguage.googleapis.com/...`)
- ✅ Added imports for `getBackendToken` and `API_BASE`
- ✅ Updated `sendMessage` function to:
  1. Get a backend JWT token using `getBackendToken()`
  2. Call `POST ${API_BASE}/api/chat` with:
     - Header: `x-auth-token: <token>` (backend expects this header name)
     - Body: `{ message: "<user input>" }`
  3. Extract `data.reply` from the response (which comes from Amazon Nova Pro)
  4. Display the reply in the chat UI

**How It Works**:
```
User types message → AIAssistant.sendMessage()
  ↓
getBackendToken() → GET /auth/guest → Returns JWT token
  ↓
POST /api/chat with token → Backend calls Amazon Nova Pro via Bedrock
  ↓
Backend returns { reply: "<Nova Pro response>", model: "amazon.nova-pro-v1:0" }
  ↓
Frontend displays the reply in the chat UI
```

## Configuration

The React frontend uses the backend API base URL from `react_frontend/src/config.js`:
- `API_BASE = 'http://localhost:5000'` (default)

Make sure your backend is running on port 5000, or update this value if your backend runs on a different port.

## Testing

1. **Start the backend**:
   ```powershell
   cd backend
   npm start
   ```

2. **Start the React frontend**:
   ```powershell
   cd react_frontend
   npm run dev
   ```

3. **Open the chat page** (`http://localhost:5173/journey` or wherever your chat route is)

4. **Send a message** - it should now use Amazon Nova Pro via your backend!

## What Happens Behind the Scenes

1. **First message**: Frontend calls `/auth/guest` to get a JWT token, caches it
2. **Subsequent messages**: Uses cached token (refreshes automatically when expired)
3. **Each chat message**: Frontend sends `POST /api/chat` with the token
4. **Backend**: Validates token, calls Amazon Nova Pro via Bedrock, returns response
5. **Frontend**: Displays the Amazon Nova Pro reply in the chat UI

## Error Handling

- If token fetch fails → Shows error message to user
- If `/api/chat` returns non-200 → Shows friendly error message
- If backend is down → Shows: "I'm sorry, I'm having trouble connecting right now..."

## Security Notes

- ✅ **No API keys exposed**: All AWS/Bedrock calls happen server-side
- ✅ **Token caching**: Reduces unnecessary `/auth/guest` calls
- ✅ **Guest authentication**: Uses anonymous guest login (can be upgraded to Auth0 later)

## Next Steps (Optional Enhancements)

- Replace guest login with Auth0 token exchange for authenticated users
- Add retry logic for failed requests
- Add request/response logging for debugging
- Implement streaming responses if Bedrock streaming is added to backend
