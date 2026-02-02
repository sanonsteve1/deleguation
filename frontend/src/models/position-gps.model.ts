export interface PositionGps {
    id: number;
    sessionId: number;
    timestamp: string; // ISO date string
    latitude: number;
    longitude: number;
    precision?: number; // nullable
    synchronise: boolean;
}

export interface PositionGpsDto {
    id: number;
    sessionId: number;
    timestamp: string;
    latitude: number;
    longitude: number;
    precision?: number;
    synchronise: boolean;
}

/**
 * Calcule la distance entre deux points GPS en kilomètres (formule de Haversine)
 */
export function calculerDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Calcule la distance totale parcourue pour une liste de positions GPS
 */
export function calculerDistanceTotale(positions: PositionGps[]): number {
    if (positions.length < 2) {
        return 0;
    }

    let distanceTotale = 0;
    for (let i = 1; i < positions.length; i++) {
        const prev = positions[i - 1];
        const curr = positions[i];
        distanceTotale += calculerDistance(
            prev.latitude,
            prev.longitude,
            curr.latitude,
            curr.longitude
        );
    }
    return distanceTotale;
}

function toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
}
