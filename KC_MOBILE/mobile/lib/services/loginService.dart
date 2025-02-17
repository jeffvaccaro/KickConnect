import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class LoginService {
  final String baseUrl = 'http://localhost:3000';

  Future<void> login(
    BuildContext context,
    String email,
    String password,
  ) async {
    final url = '$baseUrl/login/user-login';
    final body = jsonEncode({'email': email, 'password': password});
    final headers = {'Content-Type': 'application/json'};

    try {
      final response = await http.post(
        Uri.parse(url),
        body: body,
        headers: headers,
      );

      print(response.body); // Check if the response is successful

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['token']);
        await prefs.setString('refreshToken', data['refreshToken']);
        Navigator.pushReplacementNamed(context, '/main');
      } else {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Invalid credentials')));
      }
    } catch (e) {
      print('Error: $e');
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('An error occurred')));
    }
  }

  Future<String> refreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    final refreshToken = prefs.getString('refreshToken') ?? '';

    final response = await http.post(
      Uri.parse('$baseUrl/refresh-token'),
      body: jsonEncode({'refreshToken': refreshToken}),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final newToken = data['token'];
      await prefs.setString('token', newToken);
      return newToken;
    } else {
      throw Exception('Failed to refresh token');
    }
  }

  Future<void> fetchProtectedData() async {
    final prefs = await SharedPreferences.getInstance();
    String token = prefs.getString('token') ?? '';

    var response = await http.get(
      Uri.parse('$baseUrl/protected-route'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 401) {
      // Token expired, try to refresh
      token = await refreshToken();

      // Retry the protected data request with the new token
      response = await http.get(
        Uri.parse('$baseUrl/protected-route'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
    }

    if (response.statusCode == 200) {
      print('Protected data: ${response.body}');
    } else {
      print('Failed to fetch protected data');
    }
  }
}
