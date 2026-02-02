class Utilisateur {
  final int id;
  final String username;
  final String nom;
  final String prenoms;
  final String role;
  final String? telephone;

  Utilisateur({
    required this.id,
    required this.username,
    required this.nom,
    required this.prenoms,
    required this.role,
    this.telephone,
  });

  String get nomComplet => '$prenoms $nom'.trim();

  factory Utilisateur.fromJson(Map<String, dynamic> json) {
    return Utilisateur(
      id: json['id'] as int,
      username: json['username'] as String,
      nom: json['nom'] as String,
      prenoms: json['prenoms'] as String,
      role: json['role'] as String,
      telephone: json['telephone'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'nom': nom,
      'prenoms': prenoms,
      'role': role,
      'telephone': telephone,
    };
  }
}
