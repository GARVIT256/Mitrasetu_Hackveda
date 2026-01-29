import 'dart:async';
import 'dart:typed_data';
import 'package:google_generative_ai/google_generative_ai.dart' as gen;
import 'package:flutter/foundation.dart';

/// Wraps Gemini (Vertex AI via Firebase) streaming for interactive chat.
/// Supports sending text and optional image frames (still snapshots).
/// Real-time audio output synth is not yet supported client-side in this stub.
class InteractiveAIService {
  static final InteractiveAIService _instance = InteractiveAIService._internal();
  factory InteractiveAIService() => _instance;
  InteractiveAIService._internal();

  final _responsesController = StreamController<AIEvent>.broadcast();
  Stream<AIEvent> get events => _responsesController.stream;

  gen.GenerativeModel? _model;
  bool get initialized => _model != null;

  /// Initialize with provided API key. Keep API key outside source control.
  Future<void> init({required String apiKey, String model = 'gemini-1.5-flash'}) async {
    if (_model != null) return;
    _model = gen.GenerativeModel(model: model, apiKey: apiKey);
  }

  Future<void> sendUserMessage(String text, {List<gen.Part>? extraParts}) async {
    final model = _model;
    if (model == null) throw StateError('InteractiveAIService not initialized');
    final content = <gen.Content>[
      gen.Content.multi([
        gen.TextPart(text),
        ...?extraParts,
      ])
    ];
    _responsesController.add(AIEvent.user(text));
    final stream = model.generateContentStream(content);
    stream.listen((event) {
      final frag = event.text;
      if (frag != null && frag.isNotEmpty) {
        _responsesController.add(AIEvent.modelFragment(frag));
      }
    }, onError: (e, st) {
      _responsesController.add(AIEvent.error(e.toString()));
    }, onDone: () => _responsesController.add(AIEvent.modelEnd()));
  }

  gen.DataPart buildImagePart(Uint8List bytes, {String mimeType = 'image/jpeg'}) =>
      gen.DataPart(mimeType, bytes);

  Future<void> dispose() async => _responsesController.close();
}

/// Lightweight sealed-ish class for events.
class AIEvent {
  final AIEventType type;
  final String? text;

  AIEvent._(this.type, this.text);

  factory AIEvent.user(String t) => AIEvent._(AIEventType.user, t);
  factory AIEvent.modelFragment(String t) => AIEvent._(AIEventType.modelFragment, t);
  factory AIEvent.modelEnd() => AIEvent._(AIEventType.modelEnd, null);
  factory AIEvent.error(String t) => AIEvent._(AIEventType.error, t);
}

enum AIEventType { user, modelFragment, modelEnd, error }
