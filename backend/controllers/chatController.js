const Chat = require('../models/Chat');
const { encrypt } = require('../utils/encryption');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// DPDP Compliance: Chat history is encrypted to protect user privacy.
// Data is not used for any purpose other than providing the service.
// Users can request to have their chat history deleted.

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Send Message
exports.sendMessage = async (req, res) => {
  const { message } = req.body;

  try {
    // 1. Store user message
    const userMessage = new Chat({
      userId: req.user.id,
      message: encrypt(message),
      isUser: true,
    });
    await userMessage.save();

    // 2. Forward to Gemini Live
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const result = await model.generateContent(message);
    const response = await result.response;
    const botResponse = response.text();

    // Immediately send the response to the user to improve perceived performance
    res.json({ reply: botResponse });

    // 3. Store bot response in the background
    const botMessage = new Chat({
      userId: req.user.id,
      message: encrypt(botResponse),
      isUser: false,
    });
    // No await here, let it save in the background
    botMessage.save();

  } catch (err) {
    console.error('Full error object:', err);
    res.status(500).send('Server error');
  }
};
