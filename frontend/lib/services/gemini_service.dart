/// Deprecated shim. Prefer `InteractiveAIService`.
import 'interactive_ai_service.dart';

class GeminiService {
  GeminiService._();
  static final InteractiveAIService instance = InteractiveAIService();
}
