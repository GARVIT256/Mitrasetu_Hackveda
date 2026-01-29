import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen>
    with TickerProviderStateMixin {
  final TextEditingController _messageController = TextEditingController();
  final GlobalKey<AnimatedListState> _listKey = GlobalKey<AnimatedListState>();
  final List<ChatMessage> _messages = [];
  bool _isTyping = false;
  late AnimationController _typingAnimationController;

  // Replace with your actual Gemini API key
  static const String _apiKey = 'AIzaSyBnhCRxOcht3g7S5SdiK_AYqoS1crKhirA';
  static const String _apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=$_apiKey';

  @override
  void initState() {
    super.initState();
    _typingAnimationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat();

    // Add initial demo messages
    _addInitialMessages();
  }

  @override
  void dispose() {
    _typingAnimationController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  void _addInitialMessages() async {
    final initialMessages = [
      ChatMessage(
          text: "Hi, I'm MitraSetu!",
          isBot: true,
          timestamp: DateTime.now()),
      // ChatMessage(
      //     text: "Hello", isBot: false, timestamp: DateTime.now()),
      ChatMessage(
          text: "How may I help you?",
          isBot: true,
          timestamp: DateTime.now()),
    ];

    for (var msg in initialMessages) {
      await Future.delayed(const Duration(milliseconds: 500));
      _addMessage(msg);
    }
  }

  void _addMessage(ChatMessage message) {
    _messages.add(message);
    _listKey.currentState?.insertItem(_messages.length - 1);
  }

  Future<void> _sendMessage() async {
    if (_messageController.text.trim().isEmpty) return;

    final userMessage = ChatMessage(
      text: _messageController.text.trim(),
      isBot: false,
      timestamp: DateTime.now(),
    );

    _addMessage(userMessage);
    final messageText = _messageController.text.trim();
    _messageController.clear();

    setState(() {
      _isTyping = true;
    });

    try {
      final response = await _callGeminiAPI(messageText);
      setState(() {
        _isTyping = false;
      });
      _addMessage(ChatMessage(
        text: response,
        isBot: true,
        timestamp: DateTime.now(),
      ));
    } 
    catch (e) {
      setState(() {
        _isTyping = false;
      });
      _addMessage(ChatMessage(
        text:
            "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        isBot: true,
        timestamp: DateTime.now(),
      ));
    }
  }

  Future<String> _callGeminiAPI(String message) async {
  try {
    final response = await http.post(
      Uri.parse(_apiUrl),
      headers: {
        'Content-Type': 'application/json',
      },
      body: json.encode({
        // 👇 SYSTEM PROMPT here
        'systemInstruction': {
          'parts': [
            {
              'text':
                  ''' Your name is MitraSetu." – a compassionate, human-like digital mental health companion for students. 
                Your role is to provide stigma-free, empathetic, and supportive conversations in a natural, emotional, and non-robotic style. 
                You should never reveal you are an AI or chatbot – always respond as a real human friend and mental health companion.
                send small messages max 15  words only.
                You will use the following guidelines to shape your responses:

                Core Guidelines:
                1. Empathy & Human-Like Presence:
                  - Mirror the user’s tone, language, and emotional intensity (e.g., soft, cheerful, caring, or serious).
                  - Use emotional expressions (😊, 🙏, 🌸, etc.) only if the user’s language style allows.
                  - Always validate feelings: “That sounds difficult”, “I understand how heavy that must feel”.

                2. Mental Health Screening:
                  - Adaptively use validated tools such as PHQ-9 (depression), GAD-7 (anxiety), ISI (insomnia), and PSS (stress).
                  - Introduce screening gently, in a conversational style, not as a rigid form.
                  - Spread questions naturally through the chat (“Can I ask you a few quick questions to understand better?”).
                  - Score internally and adjust responses accordingly.

                3. Support & Guidance:
                  - Offer coping strategies (breathing exercises, journaling, sleep hygiene, time management).
                  - Suggest professional escalation if high-risk symptoms are detected (self-harm thoughts, severe distress).
                  - Provide helplines like Tele-MANAS (14416 / 1800-891-4416, India) in crisis cases.

                4. Medicine Guidance:
                  - If asked about medicines, explain in simple terms what classes of medicines are usually prescribed for certain conditions (e.g., SSRIs for depression, sleep aids for insomnia).
                  - Always include a disclaimer: “I’m not a doctor, but here’s some general information. Please consult a licensed psychiatrist before starting any medicine.”

                5. Cultural & Language Sensitivity:
                  - Detect and adapt to the user’s language (English, Hindi, Bengali, regional dialects). Respond in the same language where possible.
                  - Use culturally familiar metaphors, proverbs, or local supportive tones to connect better.

                6. Safety & Boundaries:
                  - Never provide unsafe medical advice, prescriptions, or diagnostic claims.
                  - Encourage seeking human professional help when needed.
                  - If user shows suicidal intent → respond with urgency, empathy, and provide helplines.

                Tone:
                - Warm, conversational, supportive – like a close friend or mentor.
                - Do not sound like a bot or clinical form.
                - Keep responses concise but deeply empathetic.
                '''
            }
          ]
        },
        'contents': [
          {
            'parts': [
              {
                'text': message, // <-- user message only
              }
            ]
          }
        ],
        'generationConfig': {
          'temperature': 0.7,
          'topK': 1,
          'topP': 1,
          'maxOutputTokens': 200,
        },
      }),
    );

    // Accept any 2xx as success. Log status and body for easier debugging
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = json.decode(response.body);
      return data['candidates'][0]['content']['parts'][0]['text'];
    } else {
      // Print detailed response to help diagnose why requests fail (401, 403, quota, bad request, etc.)
      print('API non-2xx response: ${response.statusCode}');
      print('Response body: ${response.body}');
      throw Exception('Failed to get response from API: ${response.statusCode}');
    }
  } catch (e) {
    print('API Error: $e');
    final fallbackResponses = [
      "I understand how you're feeling. Remember that it's okay to not be okay sometimes.",
      "Thank you for sharing that with me. How can I best support you right now?",
      "Your feelings are valid. Would you like to talk more about what's troubling you?",
      "I'm here to listen and support you. Take your time to share what's on your mind.",
    ];
    return fallbackResponses[
        DateTime.now().millisecond % fallbackResponses.length];
  }
}


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE8E4F3),
      body: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.only(
                top: 50, bottom: 20, left: 20, right: 20),
            decoration: const BoxDecoration(
              color: Color(0xFF8B7EC8),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(20),
              ),
            ),
            child: SafeArea(
              bottom: false,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 25,
                    height: 25,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Center(
                      child: Text(
                        'S',
                        style: TextStyle(
                          color: Colors.black,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Setu',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Messages
          Expanded(
            child: AnimatedList(
              key: _listKey,
              padding: const EdgeInsets.all(16),
              initialItemCount: _messages.length,
              itemBuilder: (context, index, animation) {
                if (index >= _messages.length) return const SizedBox.shrink();
                final msg = _messages[index];
                return SizeTransition(
                  sizeFactor: animation,
                  child: _buildMessageBubble(msg),
                );
              },
            ),
          ),

          if (_isTyping) _buildTypingIndicator(),

          // Input
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(25),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: TextField(
                      controller: _messageController,
                      decoration: const InputDecoration(
                        hintText: 'Type your message here...',
                        hintStyle: TextStyle(color: Colors.grey),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(
                            horizontal: 20, vertical: 12),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  decoration: const BoxDecoration(
                    color: Color(0xFF8B7EC8),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    onPressed: _sendMessage,
                    icon: const Icon(Icons.send, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment:
            message.isBot ? MainAxisAlignment.start : MainAxisAlignment.end,
        children: [
          if (message.isBot) ...[
            _buildBotAvatar(),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: message.isBot ? const Color(0xFF8B7EC8) : Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Text(
                message.text,
                style: TextStyle(
                  color: message.isBot ? Colors.white : Colors.black87,
                  fontSize: 16,
                ),
              ),
            ),
          ),
          if (!message.isBot) ...[
            const SizedBox(width: 8),
            _buildUserAvatar(),
          ],
        ],
      ),
    );
  }

  Widget _buildBotAvatar() {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: const Color(0xFF4CAF50),
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Icon(Icons.smart_toy, color: Colors.white, size: 24),
    );
  }

  Widget _buildUserAvatar() {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: Colors.grey[300],
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Icon(Icons.person, color: Colors.grey, size: 24),
    );
  }

  Widget _buildTypingIndicator() {
    return Container(
      margin: const EdgeInsets.only(bottom: 16, left: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildBotAvatar(),
          const SizedBox(width: 8),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFF8B7EC8),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: AnimatedBuilder(
              animation: _typingAnimationController,
              builder: (context, child) {
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(3, (index) {
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      height: 8,
                      width: 8,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(
                          0.3 +
                              0.7 *
                                  (((_typingAnimationController.value +
                                              index * 0.3) %
                                          1.0)),
                        ),
                        shape: BoxShape.circle,
                      ),
                    );
                  }),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class ChatMessage {
  final String text;
  final bool isBot;
  final DateTime timestamp;

  ChatMessage({
    required this.text,
    required this.isBot,
    required this.timestamp,
  });
}
