class Statut {
  final int? id;
  final String codeStatut;
  final String libelle;

  Statut({
    this.id,
    required this.codeStatut,
    required this.libelle,
  });

  factory Statut.fromJson(Map<String, dynamic> json) {
    final codeStatutStr = (json['codeStatut'] ?? json['code_statut'] ?? '').toString().trim();
    final libelleStr = (json['libelle'] ?? '').toString().trim();
    
    if (codeStatutStr.isEmpty) {
      throw Exception('Le code du statut ne peut pas être vide');
    }
    
    return Statut(
      id: json['id'] is int ? json['id'] : (json['id'] as num?)?.toInt(),
      codeStatut: codeStatutStr,
      libelle: libelleStr,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'codeStatut': codeStatut,
      'libelle': libelle,
    };
  }
}
