# MitraSetu Backend

This is the backend for MitraSetu, a digital mental health companion.

## Setup

1.  **Clone the repository**
2.  **Navigate to the `backend` directory**
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Create a `.env` file in the `backend` directory with the following content:**
    ```
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ENCRYPTION_KEY=your_32_character_encryption_key
    GEMINI_API_KEY=your_gemini_api_key
    PORT=5000
    ```
5.  **Start the server:**
    ```bash
    npm start
    ```

## API Endpoints

A Postman collection will be provided to document all endpoints.

### Authentication

*   `POST /api/auth/register`: Register a new user.
*   `POST /api/auth/login`: Authenticate a user.
*   `POST /api/auth/guest`: Anonymous guest login.

### User

*   `GET /api/user/:id`: Get user profile.
*   `PUT /api/user/update`: Update user profile.

### Screening

*   `POST /api/screening/phq9`: Submit PHQ-9 assessment.
*   `POST /api/screening/gad7`: Submit GAD-7 assessment.

### Circles

*   `POST /api/circle/create`: Create a new community circle.
*   `POST /api/circle/:id/message`: Post a message in a circle.
*   `GET /api/circle/:id`: Get messages from a circle.

### Chat

*   `POST /api/chat`: Send a message to the AI chatbot.

### Escalation

*   `GET /api/escalate`: Get helpline information.

## TODO

*   Integrate with Twilio/Exotel for IVR/telephony.
*   Flesh out DPDP compliance measures with audit trails and data access controls.
*   Create a Postman collection for easier API testing.
