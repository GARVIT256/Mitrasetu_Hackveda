import 'package:cloud_firestore/cloud_firestore.dart';

/// Firestore Document Structure (rooms/{roomId})
/// {
///   offer: {sdp,type},
///   answer: {sdp,type},
///   createdAt: Timestamp,
///   answeredAt: Timestamp?,
///   active: bool
/// }
/// Subcollections:
///  - callerCandidates (ICE)
///  - calleeCandidates (ICE)
class WebRTCRoomMeta {
  final String id;
  final Map<String, dynamic>? offer;
  final Map<String, dynamic>? answer;
  final bool active;
  final Timestamp? createdAt;
  final Timestamp? answeredAt;

  WebRTCRoomMeta({
    required this.id,
    required this.offer,
    required this.answer,
    required this.active,
    required this.createdAt,
    required this.answeredAt,
  });

  factory WebRTCRoomMeta.fromSnapshot(DocumentSnapshot snap) {
    final data = snap.data() as Map<String, dynamic>?;
    return WebRTCRoomMeta(
      id: snap.id,
      offer: data?['offer'] as Map<String, dynamic>?,
      answer: data?['answer'] as Map<String, dynamic>?,
      active: (data?['active'] as bool?) ?? false,
      createdAt: data?['createdAt'] as Timestamp?,
      answeredAt: data?['answeredAt'] as Timestamp?,
    );
  }
}
