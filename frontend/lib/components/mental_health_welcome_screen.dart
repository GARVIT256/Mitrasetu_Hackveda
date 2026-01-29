import 'package:flutter/material.dart';

class MentalHealthWelcomeScreen extends StatelessWidget {
  const MentalHealthWelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE8F4F8), // Light blue-green background
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            children: [
              const SizedBox(height: 60),
              
              // Setu logo and text
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo icon (simplified version)
                  Container(
                    width: 30,
                    height: 30,
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Center(
                      child: Text(
                        'S',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Setu',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 80),
              
              // Illustration
              Container(
                width: 200,
                height: 200,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFFFFE8D6), // Light peach background
                ),
                child: Center(
                  child: CustomPaint(
                    size: const Size(160, 160),
                    painter: FriendshipIllustrationPainter(),
                  ),
                ),
              ),
              
              const SizedBox(height: 60),
              
              // Title text
              const Text(
                'Your Mental\nHealth Matters',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                  height: 1.2,
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Subtitle text
              const Text(
                'Start your journey with us',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w400,
                  color: Colors.black54,
                ),
              ),
              
              const Spacer(),
              
              // Let's Start Now button
              Container(
                width: double.infinity,
                height: 56,
                margin: const EdgeInsets.only(bottom: 40),
                child: ElevatedButton(
                  onPressed: () {
                    // Navigate to AI chatbot welcome screen
                    Navigator.pushNamed(context, '/mood');
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2D2D2D), // Dark gray
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(28),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Let\'s Start Now!',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class FriendshipIllustrationPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;

    // Person 1 (left - dark skin, orange shirt)
    // Head
    paint.color = const Color(0xFF8B4513); // Brown skin
    canvas.drawCircle(Offset(size.width * 0.35, size.height * 0.3), 25, paint);
    
    // Hair
    paint.color = const Color(0xFF2D2D2D); // Dark hair
    canvas.drawCircle(Offset(size.width * 0.35, size.height * 0.25), 28, paint);
    
    // Body
    paint.color = const Color(0xFFFF8C42); // Orange shirt
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(
          center: Offset(size.width * 0.35, size.height * 0.65),
          width: 45,
          height: 60,
        ),
        const Radius.circular(15),
      ),
      paint,
    );
    
    // Arm reaching to friend
    paint.color = const Color(0xFF8B4513); // Skin color
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.width * 0.45, size.height * 0.45, 25, 15),
        const Radius.circular(7),
      ),
      paint,
    );

    // Person 2 (right - light skin, blue shirt)
    // Head
    paint.color = const Color(0xFFFFDBB5); // Light skin
    canvas.drawCircle(Offset(size.width * 0.65, size.height * 0.3), 25, paint);
    
    // Hair
    paint.color = const Color(0xFFFFB366); // Blonde hair
    canvas.drawCircle(Offset(size.width * 0.65, size.height * 0.25), 28, paint);
    
    // Body
    paint.color = const Color(0xFF4A90E2); // Blue shirt
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(
          center: Offset(size.width * 0.65, size.height * 0.65),
          width: 45,
          height: 60,
        ),
        const Radius.circular(15),
      ),
      paint,
    );
    
    // Arm reaching to friend
    paint.color = const Color(0xFFFFDBB5); // Light skin
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.width * 0.3, size.height * 0.45, 25, 15),
        const Radius.circular(7),
      ),
      paint,
    );

    // Legs for person 1
    paint.color = const Color(0xFF8B4513);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.width * 0.3, size.height * 0.85, 12, 25),
        const Radius.circular(6),
      ),
      paint,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.width * 0.44, size.height * 0.85, 12, 25),
        const Radius.circular(6),
      ),
      paint,
    );

    // Legs for person 2
    paint.color = const Color(0xFFFFDBB5);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.width * 0.58, size.height * 0.85, 12, 25),
        const Radius.circular(6),
      ),
      paint,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.width * 0.72, size.height * 0.85, 12, 25),
        const Radius.circular(6),
      ),
      paint,
    );

    // Smiles
    paint.color = Colors.white;
    paint.style = PaintingStyle.stroke;
    paint.strokeWidth = 3;
    paint.strokeCap = StrokeCap.round;

    // Person 1 smile
    final smile1Path = Path();
    smile1Path.addArc(
      Rect.fromCenter(
        center: Offset(size.width * 0.35, size.height * 0.32),
        width: 15,
        height: 10,
      ),
      0,
      3.14159,
    );
    canvas.drawPath(smile1Path, paint);

    // Person 2 smile
    final smile2Path = Path();
    smile2Path.addArc(
      Rect.fromCenter(
        center: Offset(size.width * 0.65, size.height * 0.32),
        width: 15,
        height: 10,
      ),
      0,
      3.14159,
    );
    canvas.drawPath(smile2Path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}