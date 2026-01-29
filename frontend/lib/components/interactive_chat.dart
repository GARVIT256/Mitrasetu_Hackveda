import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import '../services/webrtc_service.dart';
import '../services/interactive_ai_service.dart';

class InteractiveChatScreen extends StatefulWidget {
  const InteractiveChatScreen({super.key});

  @override
  State<InteractiveChatScreen> createState() => _InteractiveChatScreenState();
}

class _InteractiveChatScreenState extends State<InteractiveChatScreen> {
  final _webrtc = WebRTCService();
  final _ai = InteractiveAIService();
  final _localRenderer = RTCVideoRenderer();
  final List<RTCVideoRenderer> _remoteRenderers = [];
  final _chatScroll = ScrollController();
  final _msgController = TextEditingController();

  final List<_ChatLine> _lines = [];
  StreamSubscription? _remoteStreamSub;
  StreamSubscription? _aiSub;

  bool _isCreating = false;
  bool _mute = false;
  bool _videoEnabled = true;
  bool _aiStreaming = false;

  @override
  void initState() {
    super.initState();
    _setup();
  }

  Future<void> _setup() async {
    await _localRenderer.initialize();
    await _ai.init();
    final stream = await _webrtc.getLocalStream();
    if (stream != null) {
      _localRenderer.srcObject = stream;
    }
    _remoteStreamSub = _webrtc.remoteStreams.listen((ms) async {
      final r = RTCVideoRenderer();
      await r.initialize();
      r.srcObject = ms;
      setState(() => _remoteRenderers.add(r));
    });
    _aiSub = _ai.events.listen((evt) {
      switch (evt.type) {
        case AIEventType.user:
          _lines.add(_ChatLine('You', evt.text ?? ''));
          break;
        case AIEventType.modelFragment:
          if (_aiStreaming && _lines.isNotEmpty && _lines.last.sender == 'AI') {
            _lines.last = _lines.last.copyWith(message: (_lines.last.message + evt.text!));
          } else {
            _aiStreaming = true;
            _lines.add(_ChatLine('AI', evt.text ?? ''));
          }
          break;
        case AIEventType.modelEnd:
          _aiStreaming = false;
          break;
        case AIEventType.error:
          _lines.add(_ChatLine('Error', evt.text ?? 'Unknown error'));
          _aiStreaming = false;
          break;
      }
      setState(() {});
      _scrollToBottom();
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_chatScroll.hasClients) {
        _chatScroll.animateTo(
          _chatScroll.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _createRoom() async {
    setState(() => _isCreating = true);
    final id = await _webrtc.createRoom();
    setState(() => _isCreating = false);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Room created. Share ID: $id')),
    );
  }

  Future<void> _joinRoom() async {
    final controller = TextEditingController();
    final id = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Join Room'),
        content: TextField(controller: controller, decoration: const InputDecoration(labelText: 'Room ID')), 
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(onPressed: () => Navigator.pop(ctx, controller.text.trim()), child: const Text('Join')),
        ],
      ),
    );
    if (id != null && id.isNotEmpty) {
      await _webrtc.joinRoom(id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Joined room: $id')),
      );
    }
  }

  Future<void> _sendMessage() async {
    final text = _msgController.text.trim();
    if (text.isEmpty) return;
    _msgController.clear();
    await _ai.sendUserMessage(text);
  }

  @override
  void dispose() {
    _remoteStreamSub?.cancel();
    _aiSub?.cancel();
    for (final r in _remoteRenderers) {
      r.dispose();
    }
    _localRenderer.dispose();
    _msgController.dispose();
    super.dispose();
  }

  Widget _buildVideoSection() {
    return AspectRatio(
      aspectRatio: 16 / 9,
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: _VideoTile(label: 'You', renderer: _localRenderer),
          ),
          Expanded(
            flex: 3,
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2),
              itemCount: _remoteRenderers.length,
              itemBuilder: (c, i) => _VideoTile(label: 'Peer ${i + 1}', renderer: _remoteRenderers[i]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChat() {
    return Expanded(
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Expanded(
              child: ListView.builder(
                controller: _chatScroll,
                itemCount: _lines.length,
                itemBuilder: (c, i) {
                  final l = _lines[i];
                  return ListTile(
                    dense: true,
                    title: Text(l.sender, style: TextStyle(fontWeight: l.sender == 'You' ? FontWeight.w600 : FontWeight.w500)),
                    subtitle: Text(l.message),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _msgController,
                      onSubmitted: (_) => _sendMessage(),
                      decoration: const InputDecoration(hintText: 'Message the AI...'),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.send),
                    onPressed: _sendMessage,
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildControls() {
    return Wrap(
      spacing: 12,
      children: [
        ElevatedButton.icon(
          onPressed: _isCreating ? null : _createRoom,
          icon: const Icon(Icons.video_call),
          label: const Text('Create Room'),
        ),
        OutlinedButton.icon(
          onPressed: _joinRoom,
          icon: const Icon(Icons.group_add),
          label: const Text('Join Room'),
        ),
        IconButton(
          onPressed: () {
            _mute = !_mute;
            _webrtc.toggleMuteAudio(_mute);
            setState(() {});
          },
          icon: Icon(_mute ? Icons.mic_off : Icons.mic),
        ),
        IconButton(
          onPressed: () {
            _videoEnabled = !_videoEnabled;
            _webrtc.toggleVideo(_videoEnabled);
            setState(() {});
          },
          icon: Icon(_videoEnabled ? Icons.videocam : Icons.videocam_off),
        ),
        IconButton(
          onPressed: () => _webrtc.startScreenShare(),
          icon: const Icon(Icons.screen_share),
        ),
        IconButton(
          onPressed: () => _webrtc.stopScreenShare(),
          icon: const Icon(Icons.stop_screen_share),
        ),
        IconButton(
          onPressed: () => _webrtc.hangUp(),
          icon: const Icon(Icons.call_end, color: Colors.red),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Interactive Chat (Beta)')),
      body: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          children: [
            _buildVideoSection(),
            const SizedBox(height: 12),
            _buildControls(),
            const SizedBox(height: 12),
            _buildChat(),
          ],
        ),
      ),
    );
  }
}

class _VideoTile extends StatelessWidget {
  final String label;
  final RTCVideoRenderer renderer;
  const _VideoTile({required this.label, required this.renderer});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Stack(
        children: [
          Positioned.fill(child: RTCVideoView(renderer, mirror: true)),
          Positioned(
            left: 4,
            bottom: 4,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(label, style: const TextStyle(color: Colors.white, fontSize: 12)),
            ),
          ),
        ],
      ),
    );
  }
}

class _ChatLine {
  final String sender;
  final String message;
  const _ChatLine(this.sender, this.message);
  _ChatLine copyWith({String? sender, String? message}) => _ChatLine(sender ?? this.sender, message ?? this.message);
}
