export class CouleursUtils {
    static genererCouleurs(nombreBailleurs: number): { background: string[]; hover: string[] } {
        const couleurs = [
            '#3B82F6', // Bleu
            '#10B981', // Vert
            '#F59E0B', // Jaune/Orange
            '#8B5CF6', // Violet
            '#06B6D4', // Cyan
            '#84CC16', // Lime
            '#F97316', // Orange
            '#EC4899', // Rose
            '#6B7280', // Gris
            '#14B8A6', // Teal
            '#F43F5E', // Rose foncé
            '#8B5A2B', // Marron
            '#1E40AF', // Bleu foncé
            '#059669', // Vert foncé
            '#DC2626', // Rouge foncé
            '#7C3AED', // Violet foncé
            '#0891B2', // Cyan foncé
            '#65A30D', // Vert lime
            '#EA580C' // Orange foncé
        ];

        // Générer une palette étendue si nécessaire
        const paletteEtendue = this.genererPaletteEtendue(nombreBailleurs, couleurs);

        const couleursHover = paletteEtendue.map((couleur) => this.assombrirCouleur(couleur));

        return {
            background: paletteEtendue.slice(0, nombreBailleurs),
            hover: couleursHover.slice(0, nombreBailleurs)
        };
    }

    private static genererPaletteEtendue(nombreBailleurs: number, couleursBase: string[]): string[] {
        if (nombreBailleurs <= couleursBase.length) {
            return [...couleursBase];
        }

        const palette = [...couleursBase];

        // Pour un grand nombre de bailleurs, utiliser une approche systématique
        if (nombreBailleurs > 100) {
            // Générer des couleurs basées sur des variations de teinte, saturation et luminosité
            const teintes = 12; // 12 teintes principales
            const saturations = 3; // 3 niveaux de saturation
            const luminosites = 3; // 3 niveaux de luminosité

            let couleurIndex = 0;

            // Générer des couleurs systématiques
            for (let t = 0; t < teintes && couleurIndex < nombreBailleurs; t++) {
                for (let s = 0; s < saturations && couleurIndex < nombreBailleurs; s++) {
                    for (let l = 0; l < luminosites && couleurIndex < nombreBailleurs; l++) {
                        const hue = (t * 360) / teintes;
                        const saturation = 60 + s * 20; // 60%, 80%, 100%
                        const lightness = 40 + l * 15; // 40%, 55%, 70%

                        const couleur = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

                        // Éviter les doublons avec les couleurs de base
                        if (!this.couleurExisteDeja(couleur, couleursBase)) {
                            palette.push(couleur);
                            couleurIndex++;
                        }
                    }
                }
            }

            // Si on n'a toujours pas assez de couleurs, compléter avec des couleurs aléatoires
            while (palette.length < nombreBailleurs) {
                const couleur = this.genererCouleurAleatoire();
                if (!this.couleurExisteDeja(couleur, palette)) {
                    palette.push(couleur);
                }
            }
        } else {
            // Pour un nombre modéré de bailleurs, utiliser l'ancienne méthode
            for (let i = couleursBase.length; i < nombreBailleurs; i++) {
                const couleur = this.genererCouleurAleatoire();
                palette.push(couleur);
            }
        }

        return palette;
    }

    /**
     * Génère une couleur aléatoire
     * @returns Couleur hexadécimale
     */
    private static genererCouleurAleatoire(): string {
        const hue = Math.floor(Math.random() * 360);
        const saturation = 70 + Math.floor(Math.random() * 30); // 70-100%
        const lightness = 45 + Math.floor(Math.random() * 20); // 45-65%
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    /**
     * Assombrit une couleur pour l'effet hover
     * @param couleur Couleur hexadécimale ou HSL
     * @returns Couleur assombrie
     */
    private static assombrirCouleur(couleur: string): string {
        if (couleur.startsWith('#')) {
            const hex = couleur.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);

            const rHover = Math.max(0, r - 20);
            const gHover = Math.max(0, g - 20);
            const bHover = Math.max(0, b - 20);

            return `#${rHover.toString(16).padStart(2, '0')}${gHover.toString(16).padStart(2, '0')}${bHover.toString(16).padStart(2, '0')}`;
        } else if (couleur.startsWith('hsl')) {
            const values = couleur.match(/\d+/g);
            if (values && values.length >= 3) {
                const h = parseInt(values[0]);
                const s = parseInt(values[1]);
                const l = Math.max(20, parseInt(values[2]) - 20);
                return `hsl(${h}, ${s}%, ${l}%)`;
            }
        }
        return couleur;
    }

    /**
     * Vérifie si une couleur existe déjà dans une palette
     * @param couleur Couleur à vérifier
     * @param palette Palette de couleurs existante
     * @returns true si la couleur existe déjà
     */
    private static couleurExisteDeja(couleur: string, palette: string[]): boolean {
        return palette.some((c) => this.couleursSimilaires(c, couleur));
    }

    /**
     * Vérifie si deux couleurs sont similaires (pour éviter les doublons visuels)
     * @param couleur1 Première couleur
     * @param couleur2 Deuxième couleur
     * @returns true si les couleurs sont similaires
     */
    private static couleursSimilaires(couleur1: string, couleur2: string): boolean {
        const rgb1 = this.couleurVersRgb(couleur1);
        const rgb2 = this.couleurVersRgb(couleur2);

        if (!rgb1 || !rgb2) return false;

        // Calculer la distance euclidienne dans l'espace RGB
        const distance = Math.sqrt(Math.pow(rgb1.r - rgb2.r, 2) + Math.pow(rgb1.g - rgb2.g, 2) + Math.pow(rgb1.b - rgb2.b, 2));

        // Considérer comme similaires si la distance est inférieure à 50
        return distance < 50;
    }

    /**
     * Convertit une couleur (hex ou hsl) en RGB
     * @param couleur Couleur à convertir
     * @returns Objet RGB ou null si conversion impossible
     */
    private static couleurVersRgb(couleur: string): { r: number; g: number; b: number } | null {
        if (couleur.startsWith('#')) {
            const hex = couleur.replace('#', '');
            if (hex.length === 6) {
                return {
                    r: parseInt(hex.substr(0, 2), 16),
                    g: parseInt(hex.substr(2, 2), 16),
                    b: parseInt(hex.substr(4, 2), 16)
                };
            }
        } else if (couleur.startsWith('hsl')) {
            const values = couleur.match(/\d+/g);
            if (values && values.length >= 3) {
                const h = parseInt(values[0]) / 360;
                const s = parseInt(values[1]) / 100;
                const l = parseInt(values[2]) / 100;

                const c = (1 - Math.abs(2 * l - 1)) * s;
                const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
                const m = l - c / 2;

                let r = 0,
                    g = 0,
                    b = 0;

                if (h < 1 / 6) {
                    r = c;
                    g = x;
                    b = 0;
                } else if (h < 2 / 6) {
                    r = x;
                    g = c;
                    b = 0;
                } else if (h < 3 / 6) {
                    r = 0;
                    g = c;
                    b = x;
                } else if (h < 4 / 6) {
                    r = 0;
                    g = x;
                    b = c;
                } else if (h < 5 / 6) {
                    r = x;
                    g = 0;
                    b = c;
                } else {
                    r = c;
                    g = 0;
                    b = x;
                }

                return {
                    r: Math.round((r + m) * 255),
                    g: Math.round((g + m) * 255),
                    b: Math.round((b + m) * 255)
                };
            }
        }
        return null;
    }
}
