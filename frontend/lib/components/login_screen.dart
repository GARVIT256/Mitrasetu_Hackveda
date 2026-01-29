import 'package:flutter/material.dart';
import 'package:auth0_flutter/auth0_flutter.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import 'dart:convert';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late Auth0 auth0;
  UserProfile? _user;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Initialize Auth0
    auth0 = Auth0(
      'dev-ljypk7slwkrihmjw.us.auth0.com', // Replace with your Auth0 domain
      'crzP1w5KcjGM0D54CDX075L35PntuWuz', // Replace with your Auth0 client ID
    );
    _checkExistingLogin();
  }


  // Check if user is already logged in
  Future<void> _checkExistingLogin() async {
    if (kIsWeb) {
      // Use Auth0 SPA SDK for web
      try {
        await _initializeAuth0Web();
      } catch (e) {
        print('Error initializing web auth: $e');
      }
      return;
    }

    try {
      final credentials = await auth0.credentialsManager.credentials();
      final userProfile = await auth0.api.userProfile(accessToken: credentials.accessToken);
      setState(() {
        _user = userProfile;
      });
      await _sendUserDataToBackend(
        isAnonymous: false,
        isMentor: false, // Default to false, update based on your logic
        user: userProfile,
      );
    } catch (e) {
      print('No existing login: $e');
    }
  }

  Future<void> _initializeAuth0Web() async {
    // Initialize Auth0 SPA SDK for web
    try {
      // Web-specific authentication code here
      // This will be handled by the Auth0 SPA SDK loaded in index.html
      final anonymousId = 'anon_${DateTime.now().millisecondsSinceEpoch}';
      final response = await http.post(
        Uri.parse('http://localhost:5000/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'isAnonymous': true,
          'anonymousId': anonymousId,
        }),
      );

      if (response.statusCode == 200) {
        setState(() {
          _user = UserProfile(
            sub: 'anonymous',
            name: 'Anonymous User',
          );
        });
        await _sendUserDataToBackend(
          isAnonymous: true,
          isMentor: false,
          user: _user,
        );
      } else {
        throw Exception('Failed to authenticate anonymously');
      }
    } catch (e) {
      print('Web auth error: $e');
    }
  }

  // Function to send user data to backend
  Future<void> _sendUserDataToBackend({
    required bool isAnonymous,
    required bool isMentor,
    UserProfile? user,
  }) async {
    setState(() => _isLoading = true);
    
    try {
      final Map<String, dynamic> userData = {
        'isAnonymous': isAnonymous,
        'anonymousId': isAnonymous ? 'anon_${DateTime.now().millisecondsSinceEpoch}' : null,
      };

      if (!isAnonymous && user != null) {
        userData.addAll({
          'auth0UserId': user.sub,
          'email': user.email ?? '',
          'name': user.name ?? '',
          'nickname': user.nickname ?? '',
          'picture': user.pictureUrl?.toString(),
          'emailVerified': user.isEmailVerified ?? false,
        });
      }

      const String backendUrl = 'http://localhost:5000/api/auth/login';
      
      final response = await http.post(
        Uri.parse(backendUrl),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: json.encode(userData),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        print('User data sent successfully: ${response.body}');
        // Navigate to mood page on success
        if (mounted) {
          Navigator.pushReplacementNamed(context, '/mood');
        }
      } else {
        print('Failed to send user data: ${response.statusCode}');
        _showErrorDialog('Failed to create account. Please try again.');
      }
    } catch (e) {
      print('Error sending user data: $e');
      _showErrorDialog('Network error. Please check your connection.');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showMentorSelectionDialog({required bool isAnonymous, UserProfile? user}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Icon(Icons.psychology, color: Colors.purple[700]),
            const SizedBox(width: 10),
            const Text('Mentor Program'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Would you like to become a mentor and help others on their mental health journey?',
              style: TextStyle(fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.purple[50],
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                'As a mentor, you\'ll be able to guide and support others while continuing your own journey.',
                style: TextStyle(fontSize: 14, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _sendUserDataToBackend(
                isAnonymous: isAnonymous,
                isMentor: false,
                user: user,
              );
            },
            child: const Text('Not Now'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _sendUserDataToBackend(
                isAnonymous: isAnonymous,
                isMentor: true,
                user: user,
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.purple[700],
              foregroundColor: Colors.white,
            ),
            child: const Text('Yes, I\'ll Mentor'),
          ),
        ],
      ),
    );
  }

  Future<void> _loginWithAuth0() async {
    setState(() => _isLoading = true);
    
    // On web the native plugin methods are not implemented and will throw MissingPluginException.
    // Provide a graceful fallback: prompt for anonymous flow on web or use a JS Auth0 SDK integration.
    if (kIsWeb) {
      print('Web detected: falling back to anonymous login (Auth0 plugin not available on web)');
      // Show mentor dialog as if user logged in anonymously
      _showMentorSelectionDialog(isAnonymous: true);
      setState(() => _isLoading = false);
      return;
    }

    try {
      final credentials = await auth0.webAuthentication(scheme: 'demo').login();
      final userProfile = await auth0.api.userProfile(accessToken: credentials.accessToken);

      setState(() {
        _user = userProfile;
      });

      _showMentorSelectionDialog(isAnonymous: false, user: userProfile);
    } catch (e) {
      print('Auth0 login error: $e');
      _showErrorDialog('Login failed. Please try again.');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _continueAnonymously() {
    _showMentorSelectionDialog(isAnonymous: true);
  }

  Future<void> _logout() async {
    if (kIsWeb) {
      // nothing to do on web for plugin logout fallback
      setState(() {
        _user = null;
      });
      return;
    }

    try {
      await auth0.webAuthentication(scheme: 'demo').logout();
      setState(() {
        _user = null;
      });
    } catch (e) {
      print('Logout error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.purple[100]!,
              Colors.purple[50]!,
              Colors.white,
            ],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo and Title
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(100),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.purple[200]!,
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Icon(
                    Icons.psychology,
                    size: 60,
                    color: Colors.purple[700],
                  ),
                ),
                
                const SizedBox(height: 32),
                
                Text(
                  'Setu',
                  style: TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.bold,
                    color: Colors.purple[700],
                  ),
                ),
                
                const SizedBox(height: 12),
                
                Text(
                  'Your Mental Health Companion',
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                
                const SizedBox(height: 8),
                
                Text(
                  'Start your journey with us',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[500],
                  ),
                ),
                
                const SizedBox(height: 60),
                
                // Show user info if logged in, otherwise show login options
                _user != null ? _buildUserInfo() : _buildLoginOptions(),
                
                const SizedBox(height: 32),
                
                // Privacy Note
                Text(
                  'Your privacy and mental health are our top priorities.\nWe follow strict confidentiality guidelines.',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[500],
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildUserInfo() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.grey[300]!,
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          if (_user!.pictureUrl != null)
            CircleAvatar(
              radius: 40,
              backgroundImage: NetworkImage(_user!.pictureUrl.toString()),
            ),
          const SizedBox(height: 16),
          Text(
            'Welcome, ${_user!.name ?? 'User'}!',
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _user!.email ?? '',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () => _showMentorSelectionDialog(isAnonymous: false, user: _user),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.purple[700],
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text('Continue'),
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: _logout,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.grey[300],
                  foregroundColor: Colors.grey[700],
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: const Text('Logout'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLoginOptions() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.grey[300]!,
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            'Choose your login method',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.grey[800],
            ),
          ),
          
          const SizedBox(height: 32),
          
          // Auth0 Login Button
          SizedBox(
            width: double.infinity,
            height: 54,
            child: ElevatedButton.icon(
              onPressed: _isLoading ? null : _loginWithAuth0,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange[600],
                foregroundColor: Colors.white,
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              icon: _isLoading 
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Icon(Icons.security, size: 20),
              label: Text(
                _isLoading ? 'Signing in...' : 'Login with Auth0',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Divider
          Row(
            children: [
              Expanded(child: Divider(color: Colors.grey[300])),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  'or',
                  style: TextStyle(
                    color: Colors.grey[500],
                    fontSize: 14,
                  ),
                ),
              ),
              Expanded(child: Divider(color: Colors.grey[300])),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Anonymous Button
          SizedBox(
            width: double.infinity,
            height: 54,
            child: ElevatedButton.icon(
              onPressed: _isLoading ? null : _continueAnonymously,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.purple[700],
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              icon: const Icon(Icons.person_off, size: 20),
              label: const Text(
                'Continue Anonymously',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}