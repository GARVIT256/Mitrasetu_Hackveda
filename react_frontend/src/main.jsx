import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ConversationProvider } from './context/ConversationContext.jsx'
import { Auth0Provider } from '@auth0/auth0-react';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
    domain="dev-lm21osyfy12h32np.us.auth0.com"
    clientId="Sv2AIyge8UZ9XsXWCxP6987Ov62YhNWj"
    authorizationParams={{
      redirect_uri: `${window.location.origin}/home`
    }}
  >
    <ConversationProvider>
      <App />
    </ConversationProvider>

  </Auth0Provider>

  </StrictMode>
)