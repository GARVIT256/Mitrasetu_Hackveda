import 'package:flutter/material.dart';

class AiChatbotWelcomeScreen extends StatelessWidget {
  const AiChatbotWelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFD4C4E8), // Light purple background
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            children: [
              const SizedBox(height: 60),
              
              // Robot illustration with floating elements
              SizedBox(
                height: 300,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Main robot
                    CustomPaint(
                      size: const Size(200, 250),
                      painter: RobotIllustrationPainter(),
                    ),
                    
                    // Floating elements around robot
                    // Top left document
                    Positioned(
                      top: 20,
                      left: 20,
                      child: Container(
                        width: 60,
                        height: 45,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            const SizedBox(height: 8),
                            Container(
                              width: 40,
                              height: 20,
                              decoration: BoxDecoration(
                                color: const Color(0xFFFF6B6B),
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFFFF6B6B),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFFFF6B6B),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFFFF6B6B),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    
                    // Top right bubble
                    Positioned(
                      top: 40,
                      right: 30,
                      child: Container(
                        width: 50,
                        height: 50,
                        decoration: const BoxDecoration(
                          color: Color(0xFFFFB4A2),
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                    
                    // Bottom right document
                    Positioned(
                      bottom: 40,
                      right: 20,
                      child: Container(
                        width: 70,
                        height: 50,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 25,
                                height: 15,
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFF6B6B),
                                  borderRadius: BorderRadius.circular(3),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Container(
                                width: 40,
                                height: 3,
                                decoration: BoxDecoration(
                                  color: Colors.grey[300],
                                  borderRadius: BorderRadius.circular(1),
                                ),
                              ),
                              const SizedBox(height: 2),
                              Container(
                                width: 35,
                                height: 3,
                                decoration: BoxDecoration(
                                  color: Colors.grey[300],
                                  borderRadius: BorderRadius.circular(1),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    
                    // Bottom left gears
                    Positioned(
                      bottom: 60,
                      left: 40,
                      child: Row(
                        children: [
                          const Icon(
                            Icons.settings,
                            color: Color(0xFF666666),
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Container(
                            width: 15,
                            height: 15,
                            decoration: const BoxDecoration(
                              color: Color(0xFFFF6B6B),
                              shape: BoxShape.circle,
                            ),
                          ),
                        ],
                      ),
                    ),
                    
                    // Small plant
                    Positioned(
                      bottom: 20,
                      left: 60,
                      child: CustomPaint(
                        size: const Size(20, 25),
                        painter: PlantPainter(),
                      ),
                    ),
                    
                    // Small bubble
                    Positioned(
                      top: 80,
                      left: 60,
                      child: Container(
                        width: 25,
                        height: 25,
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 40),
              
              // Title text
              const Text(
                'Welcome to Ai\nChatbot',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                  height: 1.2,
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Subtitle text
              const Text(
                'Compassion meets care right\nwhere you are',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w400,
                  color: Colors.black54,
                  height: 1.4,
                ),
              ),
              
              const Spacer(),
              
              // Get Started button
              Container(
                width: double.infinity,
                height: 56,
                margin: const EdgeInsets.only(bottom: 16),
                child: ElevatedButton(
                  onPressed: () {
                    // Navigate to chat screen
                    Navigator.pushNamed(context, '/chat');
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
                    'Get Started',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
              
              // Terms and Conditions
              TextButton(
                onPressed: () {
                  // Handle terms and conditions
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Terms and Conditions'),
                      content: const Text('Terms and Conditions content would go here.'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Close'),
                        ),
                      ],
                    ),
                  );
                },
                child: const Text(
                  'Terms and Conditions',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w400,
                    color: Colors.black54,
                  ),
                ),
              ),
              
              const SizedBox(height: 20),
              
              // Bottom indicator (blue line)
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFF4A90E2),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class RobotIllustrationPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;

    // Robot body (main torso)
    paint.color = const Color(0xFFFF6B6B); // Red/orange color
    final bodyRect = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: Offset(size.width * 0.5, size.height * 0.65),
        width: size.width * 0.4,
        height: size.height * 0.35,
      ),
      const Radius.circular(20),
    );
    canvas.drawRRect(bodyRect, paint);

    // Robot head
    paint.color = const Color(0xFFFF6B6B);
    final headRect = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: Offset(size.width * 0.5, size.height * 0.35),
        width: size.width * 0.35,
        height: size.height * 0.25,
      ),
      const Radius.circular(15),
    );
    canvas.drawRRect(headRect, paint);

    // Robot visor/eyes
    paint.color = const Color(0xFF2D2D2D); // Dark color
    final visorRect = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: Offset(size.width * 0.5, size.height * 0.35),
        width: size.width * 0.25,
        height: size.height * 0.08,
      ),
      const Radius.circular(8),
    );
    canvas.drawRRect(visorRect, paint);

    // Robot arms
    paint.color = const Color(0xFFFF6B6B);
    
    // Left arm (raised)
    final leftArmPath = Path();
    leftArmPath.addRRect(RRect.fromRectAndRadius(
      Rect.fromLTWH(size.width * 0.15, size.height * 0.4, size.width * 0.15, size.height * 0.08),
      const Radius.circular(15),
    ));
    canvas.drawPath(leftArmPath, paint);

    // Right arm (raised)
    final rightArmPath = Path();
    rightArmPath.addRRect(RRect.fromRectAndRadius(
      Rect.fromLTWH(size.width * 0.7, size.height * 0.4, size.width * 0.15, size.height * 0.08),
      const Radius.circular(15),
    ));
    canvas.drawPath(rightArmPath, paint);

    // Robot hands
    paint.color = const Color(0xFFFF6B6B);
    canvas.drawCircle(Offset(size.width * 0.2, size.height * 0.38), 12, paint);
    canvas.drawCircle(Offset(size.width * 0.8, size.height * 0.38), 12, paint);

    // Robot legs
    paint.color = const Color(0xFFFF6B6B);
    
    // Left leg
    final leftLegRect = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: Offset(size.width * 0.4, size.height * 0.85),
        width: size.width * 0.12,
        height: size.height * 0.15,
      ),
      const Radius.circular(10),
    );
    canvas.drawRRect(leftLegRect, paint);

    // Right leg
    final rightLegRect = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: Offset(size.width * 0.6, size.height * 0.85),
        width: size.width * 0.12,
        height: size.height * 0.15,
      ),
      const Radius.circular(10),
    );
    canvas.drawRRect(rightLegRect, paint);

    // Robot feet
    paint.color = const Color(0xFF2D2D2D);
    final leftFootRect = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: Offset(size.width * 0.4, size.height * 0.95),
        width: size.width * 0.15,
        height: size.height * 0.06,
      ),
      const Radius.circular(8),
    );
    canvas.drawRRect(leftFootRect, paint);

    final rightFootRect = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: Offset(size.width * 0.6, size.height * 0.95),
        width: size.width * 0.15,
        height: size.height * 0.06,
      ),
      const Radius.circular(8),
    );
    canvas.drawRRect(rightFootRect, paint);

    // Body details (chest panel)
    paint.color = const Color(0xFF2D2D2D);
    final chestPanel = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: Offset(size.width * 0.5, size.height * 0.6),
        width: size.width * 0.25,
        height: size.height * 0.15,
      ),
      const Radius.circular(8),
    );
    canvas.drawRRect(chestPanel, paint);

    // Chest circle detail
    paint.color = Colors.white;
    canvas.drawCircle(Offset(size.width * 0.5, size.height * 0.6), 8, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class PlantPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;

    // Plant stem
    paint.color = const Color(0xFF4CAF50);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(
          center: Offset(size.width * 0.5, size.height * 0.7),
          width: 3,
          height: size.height * 0.6,
        ),
        const Radius.circular(2),
      ),
      paint,
    );

    // Leaves
    paint.color = const Color(0xFF4CAF50);
    final leftLeaf = Path();
    leftLeaf.addOval(Rect.fromCenter(
      center: Offset(size.width * 0.3, size.height * 0.4),
      width: 8,
      height: 12,
    ));
    canvas.drawPath(leftLeaf, paint);

    final rightLeaf = Path();
    rightLeaf.addOval(Rect.fromCenter(
      center: Offset(size.width * 0.7, size.height * 0.3),
      width: 8,
      height: 12,
    ));
    canvas.drawPath(rightLeaf, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}