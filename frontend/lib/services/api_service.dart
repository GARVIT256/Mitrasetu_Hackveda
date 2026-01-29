import 'dart:convert';
import 'package:http/http.dart' as http;
import 'services/storage_service.dart';

class ApiService {
  // IMPORTANT: Replace with your computer's local IP address. Do not use localhost.
  final String _baseUrl = "http://192.168.1.7:5000/api"; 
  final StorageService _storageService = StorageService();

  Future<Map<String, String>> _getHeaders() async {
    final token = await _storageService.getToken();
    return {
      'Content-Type': 'application/json; charset=UTF-8',
      if (token != null) 'x-auth-token': token,
    };
  }

  Future<http.Response> register(String name, String email, String password) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/register'),
      headers: await _getHeaders(),
      body: jsonEncode({'name': name, 'email': email, 'password': password}),
    );
    return response;
  }

  Future<http.Response> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/login'),
      headers: await _getHeaders(),
      body: jsonEncode({'email': email, 'password': password}),
    );
    return response;
  }
  
  Future<http.Response> submitPhq9(List<int> answers) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/screening/phq9'),
      headers: await _getHeaders(),
      body: jsonEncode({'answers': answers}),
    );
    return response;
  }

  Future<http.Response> submitGad7(List<int> answers) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/screening/gad7'),
      headers: await _getHeaders(),
      body: jsonEncode({'answers': answers}),
    );
    return response;
  }

  Future<http.Response> createCircle(String name) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/circle/create'),
      headers: await _getHeaders(),
      body: jsonEncode({'name': name}),
    );
    return response;
  }

  Future<http.Response> postCircleMessage(String circleId, String message) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/circle/$circleId/message'),
      headers: await _getHeaders(),
      body: jsonEncode({'message': message}),
    );
    return response;
  }

  Future<http.Response> getCircle(String circleId) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/circle/$circleId'),
      headers: await _getHeaders(),
    );
    return response;
  }
}
