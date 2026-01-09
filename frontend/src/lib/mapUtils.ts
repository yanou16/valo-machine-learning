/**
 * Map Name Normalization Utility
 * Converts internal asset names to display names
 */

// Internal code name -> Display name mapping
const MAP_CODE_NAMES: Record<string, string> = {
    // Internal code names (from GRID API)
    'corrode': 'BIND',
    'triad': 'HAVEN',
    'ascent': 'ASCENT',
    'bonsai': 'SPLIT',
    'duality': 'BIND',
    'port': 'ICEBOX',
    'foxtrot': 'BREEZE',
    'canyon': 'FRACTURE',
    'pitt': 'PEARL',
    'jam': 'LOTUS',
    'kasbah': 'SUNSET',
    'drift': 'ABYSS',

    // Already proper names (lowercase)
    'bind': 'BIND',
    'haven': 'HAVEN',
    'split': 'SPLIT',
    'icebox': 'ICEBOX',
    'breeze': 'BREEZE',
    'fracture': 'FRACTURE',
    'pearl': 'PEARL',
    'lotus': 'LOTUS',
    'sunset': 'SUNSET',
    'abyss': 'ABYSS',
};

/**
 * Formats raw map name from API to display format
 * Handles internal code names, lowercase, and unknown maps
 * 
 * @param name - Raw map name from API
 * @returns Formatted display name (uppercase)
 * 
 * @example
 * formatMapName('corrode') // 'BIND'
 * formatMapName('icebox')  // 'ICEBOX'
 * formatMapName('Lotus')   // 'LOTUS'
 */
export function formatMapName(name: string): string {
    if (!name) return 'UNKNOWN';

    const normalized = name.toLowerCase().trim();

    // Check if it's a known code name or standard name
    if (MAP_CODE_NAMES[normalized]) {
        return MAP_CODE_NAMES[normalized];
    }

    // Fallback: just uppercase the input
    return name.toUpperCase();
}

/**
 * Gets a short version of the map name (3 chars)
 * Useful for compact displays
 */
export function getMapShortName(name: string): string {
    const formatted = formatMapName(name);
    return formatted.substring(0, 3);
}

/**
 * Returns the map's signature color for UI styling
 */
export function getMapColor(name: string): string {
    const colors: Record<string, string> = {
        'BIND': '#e67e22',
        'HAVEN': '#27ae60',
        'SPLIT': '#9b59b6',
        'ASCENT': '#3498db',
        'ICEBOX': '#00bcd4',
        'BREEZE': '#2ecc71',
        'FRACTURE': '#e74c3c',
        'PEARL': '#1abc9c',
        'LOTUS': '#f39c12',
        'SUNSET': '#e91e63',
        'ABYSS': '#673ab7',
    };

    const formatted = formatMapName(name);
    return colors[formatted] || '#94a3b8';
}
