import 'package:flutter/material.dart';



class Screen extends StatelessWidget {
  const Screen({super.key});


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // appBar: AppBar(
      //   title: const Text('Mon écran'),
      // ),
      body: const Center(
        child: Text(
          'Bonjour',
          style: TextStyle(fontSize: 24),
        ),
      ),
    );
  }
}
