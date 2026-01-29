## Amazon Bedrock Model Integration in MitraSetu

This document explains **which Amazon models we use** from the hackathon list, **where they are wired into the codebase**, and **how to configure them**.

---

### 1. Chosen Models from the Hackathon List

From the allowed Amazon models, this project uses:

- **Primary text generation (chatbot)**:  
  - **Amazon Nova Pro** – `amazon.nova-pro-v1:0`  
  - **Why**: Strong reasoning quality, good for supportive, context-aware mental health conversations. This is the main LLM behind the `/api/chat` endpoint.

- **Optional / future extensions (not yet wired, but recommended)**:
  - **Cheaper text model** (fallback or A/B testing): `amazon.nova-2-lite-v1:0`
  - **Text embeddings for RAG / search**: `amazon.titan-embed-text-v2:0`
  - **Speech (STT/TTS) for voice**: `amazon.nova-2-sonic-v1:0`

Only **Amazon models** are used for online inference; all Gemini-specific code paths have been disabled or removed from critical flows.

---

### 2. Backend: Where Amazon Nova Pro Is Used

#### 2.1. Bedrock client utility

- **File**: `backend/utils/bedrockClient.js`
- **Purpose**: Centralized helper to talk to Amazon Bedrock using the **Converse API**.
- **Key function**:
  - `sendTextMessageToNova({ message, systemPrompt, maxTokens, temperature, topP })`  
    - Sends a single user message (plus an optional safety/persona system prompt) to the configured **Nova** model.
    - Returns the model’s reply as a plain string.

Configuration inside `bedrockClient.js`:

- **Region resolution**:
  - `AWS_REGION` or `BEDROCK_REGION` (env)  
  - Falls back to: `us-east-1`
- **Model ID resolution**:
  - `BEDROCK_MODEL_ID` (env)  
  - Falls back to: `amazon.nova-pro-v1:0`

These defaults make Nova Pro the primary model but let you switch models just by changing environment variables.

#### 2.2. Chat controller (user-facing assistant)

- **File**: `backend/controllers/chatController.js`
- **Route**: `POST /api/chat` (see `backend/routes/chat.js`)

Behavior:

1. **Input validation**  
   - Requires a non-empty `message` in `req.body`.

2. **Stores the user message**  
   - Saves an encrypted copy of the user’s message to the `Chat` collection, maintaining **DPDP compliance** by encrypting content at rest (`utils/encryption.js`).

3. **Calls Amazon Nova via Bedrock**  
   - Uses `sendTextMessageToNova` from `bedrockClient.js`.
   - Prepends a **system prompt** instructing the model to:
     - Act as “Mitra”, a warm, non-judgmental mental health companion for young people in India.
     - Avoid claiming to be a doctor or emergency service.
     - Encourage reaching out to professionals, trusted adults, or helplines such as Tele-MANAS (14416) when there is any risk of harm.

4. **Responds to the client**  
   - Returns JSON of the form:
     ```json
     {
       "reply": "<model reply text>",
       "model": "amazon.nova-pro-v1:0"
     }
     ```

5. **Stores the bot response (encrypted)**  
   - Saves the assistant’s reply back into the `Chat` collection in the background (no extra latency to the user).

Net effect: **All chatbot replies now come from Amazon Nova Pro via Bedrock**, not from Gemini.

---

### 3. Gemini Clean-Up and Compatibility Stubs

Previously, the backend exposed several Gemini-specific endpoints and used Google SDKs. For this Amazon-only hackathon:

- **Google dependencies removed**:
  - `@google/genai`
  - `@google/generative-ai`
  - These have been deleted from `backend/package.json`.

- **Gemini endpoints converted to stubs** in `backend/index.js`:
  - `GET /api/gemini/webrtc/ping`
  - `GET /api/gemini/models`
  - `GET /api/gemini/token`
  - `GET /api/gemini/model/:id`
  - `POST /api/gemini/live/turn`
  - `POST /api/gemini/webrtc/offer`

Instead of making external calls, these routes now:

- Return **501 (Not Implemented)** with a clear message that **Gemini is disabled**.
- Point developers toward using the new **Bedrock-backed `/api/chat`** for AI functionality.

This keeps older frontends from crashing with 500 errors while ensuring **no non-Amazon models are used**.

---

### 4. Dependencies and Setup

#### 4.1. New dependency

In `backend/package.json`:

- Added:
  - `"@aws-sdk/client-bedrock-runtime": "^3.972.0"`

You should install backend dependencies from the `backend` directory:

```bash
cd backend
npm install
```

Ensure your environment (local machine, EC2, or other) has IAM permissions for:

- `bedrock:InvokeModel`
- `bedrock:InvokeModelWithResponseStream` (if you later add streaming)

#### 4.2. Required environment variables

Minimum for this integration:

- **Backend (Node)**:
  - `AWS_REGION` – e.g. `us-east-1` (or use `BEDROCK_REGION` instead)
  - `BEDROCK_MODEL_ID` – recommended: `amazon.nova-pro-v1:0`

Example `.env` snippet for the backend:

```env
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.nova-pro-v1:0
```

AWS credentials are picked up via the standard AWS mechanisms (environment variables, shared credentials file, IAM role, etc.).

**⚠️ Important**: You must configure AWS credentials before using Bedrock. See `backend/AWS_SETUP.md` for detailed setup instructions.

---

### 5. How Frontends Use the Amazon Models

Existing frontends (React / Flutter) don’t talk to Bedrock directly. Instead, they:

- Call the **Node backend**:
  - `POST /api/chat` with `{ "message": "<user text>" }`.
  - Receive `{ "reply": "<assistant reply>", "model": "amazon.nova-pro-v1:0" }`.

Because the Bedrock call happens **entirely on the server**:

- No API keys or AWS credentials are exposed to the browser or mobile clients.
- It stays compliant with the hackathon rule that **only Amazon models are used**.

---

### 6. Future Extensions (Optional, Amazon-Only)

The current integration focuses on **text chat** with Nova Pro. You can extend it, still using only Amazon models:

- **Cheaper text model** for low-resource modes:
  - Swap `BEDROCK_MODEL_ID` to `amazon.nova-2-lite-v1:0` when cost/latency is more important than depth.

- **RAG / knowledge retrieval**:
  - Add another utility that calls **Titan Text Embeddings V2** – `amazon.titan-embed-text-v2:0` – to embed:
    - Crisis resources
    - FAQs
    - Psychoeducation content
  - Use those embeddings for semantic search, then feed retrieved context into Nova Pro via the `systemPrompt` and messages.

- **Voice support**:
  - Use **Nova 2 Sonic** – `amazon.nova-2-sonic-v1:0` – for speech-to-text and text-to-speech.
  - Keep all audio processing on the backend to maintain privacy and to avoid exposing credentials.

All of these can reuse the same pattern established in `bedrockClient.js`: **centralized Bedrock client + small helper functions per use case.**

---

### 7. Testing the Amazon Nova Pro Integration

#### 7.1. Quick Test (PowerShell on Windows)

Since PowerShell aliases `curl` to `Invoke-WebRequest` (which has different syntax), use PowerShell-native commands:

**Option A: Use the provided test script**

```powershell
# Run the test script (gets guest token + sends chat message)
.\test-chat-api.ps1
```

**Option B: Manual PowerShell commands**

```powershell
# Step 1: Get a guest token
$tokenResponse = Invoke-RestMethod -Uri "http://localhost:5000/auth/guest" -Method POST -ContentType "application/json"
$token = $tokenResponse.token

# Step 2: Send a chat message
# Note: The backend expects 'x-auth-token' header (not 'Authorization: Bearer')
$headers = @{
    "Content-Type" = "application/json"
    "x-auth-token" = $token
}
$body = @{ message = "I have been feeling very anxious lately. Can you help me?" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/chat" -Method POST -Headers $headers -Body $body

# Display the response
Write-Host "Model: $($response.model)"
Write-Host "Reply: $($response.reply)"
```

**Option C: Use curl.exe directly (if available)**

```powershell
# Use curl.exe explicitly (not the PowerShell alias)
curl.exe -X POST http://localhost:5000/api/chat `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -d '{\"message\": \"Hello, how are you?\"}'
```

#### 7.2. Testing with cURL (Linux/Mac/Git Bash)

```bash
# Step 1: Get guest token
TOKEN=$(curl -X POST http://localhost:5000/auth/guest \
  -H "Content-Type: application/json" | jq -r '.token')

# Step 2: Send chat message
# Note: The backend expects 'x-auth-token' header (not 'Authorization: Bearer')
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $TOKEN" \
  -d '{"message": "I have been feeling very anxious lately. Can you help me?"}'
```

#### 7.3. Expected Response

```json
{
  "reply": "I understand that feeling anxious can be really overwhelming...",
  "model": "amazon.nova-pro-v1:0"
}
```

If you see this response with `model: "amazon.nova-pro-v1:0"`, **Amazon Nova Pro is working correctly** via Bedrock!

