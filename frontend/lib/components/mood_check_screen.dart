import 'package:flutter/material.dart';

class MoodCheckScreen extends StatefulWidget {
  const MoodCheckScreen({super.key});

  @override
  State<MoodCheckScreen> createState() => _MoodCheckScreenState();
}

class _MoodCheckScreenState extends State<MoodCheckScreen> {
  int? selectedMood;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFB8A9D9), // Purple background color
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32.0),
          child: Column(
            children: [
              const SizedBox(height: 80),
              
              // Sun/Moon icon
              Container(
                width: 60,
                height: 60,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
              ),
              
              const SizedBox(height: 40),
              
              // Greeting text
              const Text(
                'Hi, Prantik',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w300,
                  color: Colors.white,
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Question text
              const Text(
                'How are you doing today?',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w300,
                  color: Colors.white,
                ),
              ),
              
              const Spacer(),
              
              // Mood selection row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildMoodOption(0, _buildHappyFace()),
                  _buildMoodOption(1, _buildNeutralFace()),
                  _buildMoodOption(2, _buildSadFace()),
                ],
              ),
              
              const SizedBox(height: 120),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMoodOption(int index, Widget face) {
    bool isSelected = selectedMood == index;
    return GestureDetector(
      onTap: () {
        setState(() {
          selectedMood = index;
        });
        // Navigate to mental health welcome screen after selection
        Future.delayed(const Duration(milliseconds: 300), () {
          Navigator.pushNamed(context, '/ai-chatbot-welcome');
        });
      },
      child: Container(
        width: 80,
        height: 80,
        decoration: BoxDecoration(
          color: isSelected ? Colors.white.withOpacity(0.3) : Colors.transparent,
          shape: BoxShape.circle,
          border: isSelected ? Border.all(color: Colors.white, width: 2) : null,
        ),
        child: Center(child: face),
      ),
    );
  }

  Widget _buildHappyFace() {
    return CustomPaint(
      size: const Size(50, 50),
      painter: HappyFacePainter(),
    );
  }

  Widget _buildNeutralFace() {
    return CustomPaint(
      size: const Size(50, 50),
      painter: NeutralFacePainter(),
    );
  }

  Widget _buildSadFace() {
    return CustomPaint(
      size: const Size(50, 50),
      painter: SadFacePainter(),
    );
  }
}

class HappyFacePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 5;

    // Head circle
    canvas.drawCircle(center, radius, paint);

    // Eyes
    canvas.drawCircle(Offset(center.dx - 8, center.dy - 8), 2, paint..style = PaintingStyle.fill);
    canvas.drawCircle(Offset(center.dx + 8, center.dy - 8), 2, paint);

    // Smile
    paint.style = PaintingStyle.stroke;
    final smilePath = Path();
    smilePath.addArc(
      Rect.fromCenter(center: Offset(center.dx, center.dy + 2), width: 20, height: 15),
      0,
      3.14159,
    );
    canvas.drawPath(smilePath, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class NeutralFacePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 5;

    // Head circle
    canvas.drawCircle(center, radius, paint);

    // Eyes
    canvas.drawCircle(Offset(center.dx - 8, center.dy - 8), 2, paint..style = PaintingStyle.fill);
    canvas.drawCircle(Offset(center.dx + 8, center.dy - 8), 2, paint);

    // Neutral mouth (horizontal line)
    paint.style = PaintingStyle.stroke;
    canvas.drawLine(
      Offset(center.dx - 8, center.dy + 8),
      Offset(center.dx + 8, center.dy + 8),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class SadFacePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 5;

    // Head circle
    canvas.drawCircle(center, radius, paint);

    // Eyes (X marks for sad/sick)
    canvas.drawLine(
      Offset(center.dx - 12, center.dy - 12),
      Offset(center.dx - 4, center.dy - 4),
      paint,
    );
    canvas.drawLine(
      Offset(center.dx - 4, center.dy - 12),
      Offset(center.dx - 12, center.dy - 4),
      paint,
    );
    
    canvas.drawLine(
      Offset(center.dx + 4, center.dy - 12),
      Offset(center.dx + 12, center.dy - 4),
      paint,
    );
    canvas.drawLine(
      Offset(center.dx + 12, center.dy - 12),
      Offset(center.dx + 4, center.dy - 4),
      paint,
    );

    // Frown (upside down smile)
    final frownPath = Path();
    frownPath.addArc(
      Rect.fromCenter(center: Offset(center.dx, center.dy + 12), width: 20, height: 15),
      3.14159,
      3.14159,
    );
    canvas.drawPath(frownPath, paint);

    // Lightning bolt for sick feeling
    final lightningPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final lightningPath = Path();
    lightningPath.moveTo(center.dx + 20, center.dy - 20);
    lightningPath.lineTo(center.dx + 15, center.dy - 10);
    lightningPath.lineTo(center.dx + 18, center.dy - 10);
    lightningPath.lineTo(center.dx + 12, center.dy + 5);
    lightningPath.lineTo(center.dx + 17, center.dy - 5);
    lightningPath.lineTo(center.dx + 14, center.dy - 5);
    lightningPath.close();
    
    canvas.drawPath(lightningPath, lightningPaint..style = PaintingStyle.fill);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}