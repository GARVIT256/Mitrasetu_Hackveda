const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');

// Centralized Bedrock client + helper for Amazon Nova text generation.
// This keeps all model/region configuration in one place.

const region =
  process.env.AWS_REGION ||
  process.env.BEDROCK_REGION ||
  'us-east-1';

// Default to Amazon Nova Pro for rich, general-purpose text generation.
const modelId =
  process.env.BEDROCK_MODEL_ID ||
  'amazon.nova-pro-v1:0';

const bedrockClient = new BedrockRuntimeClient({ region });

/**
 * Send a single text message to an Amazon Nova model via Bedrock Converse API.
 *
 * @param {Object} params
 * @param {string} params.message - User message text.
 * @param {string} [params.systemPrompt] - Optional safety / persona instructions.
 * @param {number} [params.maxTokens]
 * @param {number} [params.temperature]
 * @param {number} [params.topP]
 * @returns {Promise<string>} - Model reply text.
 */
async function sendTextMessageToNova({
  message,
  systemPrompt,
  maxTokens = 512,
  temperature = 0.7,
  topP = 0.9,
}) {
  if (!message || !message.trim()) {
    throw new Error('Bedrock: message is required');
  }

  const userText = message.trim();

  // Build messages array - just the user message
  const messages = [
    {
      role: 'user',
      content: [{ text: userText }],
    },
  ];

  // Build command - system prompt goes in the 'system' field, not as a message
  const commandInput = {
    modelId,
    messages,
    inferenceConfig: {
      maxTokens,
      temperature,
      topP,
    },
  };

  // Add system prompt if provided (Converse API expects it in 'system' field)
  if (systemPrompt && systemPrompt.trim()) {
    commandInput.system = [{ text: systemPrompt.trim() }];
  }

  const command = new ConverseCommand(commandInput);

  try {
    const response = await bedrockClient.send(command);

    const outputMessage = response.output && response.output.message;
    if (!outputMessage || !Array.isArray(outputMessage.content)) {
      throw new Error('Bedrock: empty or malformed response from model');
    }

    const textParts = outputMessage.content
      .filter((block) => typeof block.text === 'string' && block.text.length > 0)
      .map((block) => block.text);

    return textParts.join('\n').trim();
  } catch (error) {
    // Enhanced error logging for debugging
    console.error('Bedrock API Error:', {
      message: error.message,
      name: error.name,
      code: error.$metadata?.httpStatusCode,
      region,
      modelId,
    });
    throw new Error(`Bedrock API call failed: ${error.message}`);
  }
}

module.exports = {
  bedrockClient,
  bedrockConfig: { region, modelId },
  sendTextMessageToNova,
};

