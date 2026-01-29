const Chat = require('../models/Chat');
const { encrypt } = require('../utils/encryption');
const { sendTextMessageToNova, bedrockConfig } = require('../utils/bedrockClient');
require('dotenv').config();

// DPDP Compliance: Chat history is encrypted to protect user privacy.
// Data is not used for any purpose other than providing the service.
// Users can request to have their chat history deleted.

// Send Message
exports.sendMessage = async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ msg: 'Message is required' });
  }

  try {
    // 1. Store user message
    const userMessage = new Chat({
      userId: req.user.id,
      message: encrypt(message),
      isUser: true,
    });
    await userMessage.save();

    // 2. Forward to Amazon Nova (via Bedrock)
    const systemPrompt = [
      'You are Mitra, a supportive mental health companion for young people in India.',
      'Respond in a warm, non-judgmental, and concise way.',
      'You are not a doctor or emergency service and you must not give medical, legal, or financial advice.',
      'Encourage users to seek help from qualified professionals, trusted adults, or local helplines (e.g., Tele-MANAS: 14416) when there is any risk of harm.',
    ].join(' ');

    const botResponse = await sendTextMessageToNova({
      message,
      systemPrompt,
      maxTokens: 512,
      temperature: 0.7,
      topP: 0.9,
    });

    // Immediately send the response to the user to improve perceived performance
    res.json({ reply: botResponse, model: bedrockConfig.modelId });

    // 3. Store bot response in the background
    const botMessage = new Chat({
      userId: req.user.id,
      message: encrypt(botResponse),
      isUser: false,
    });
    // No await here, let it save in the background
    botMessage.save();
  } catch (err) {
    console.error('Chat sendMessage error:', err);
    // Return more detailed error in development, generic in production
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? err.message || 'Server error'
      : 'Server error';
    res.status(500).json({ error: errorMessage, details: err.message });
  }
};

