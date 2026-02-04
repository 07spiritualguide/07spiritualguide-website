// Chaldean Numerology Name Calculator
// No number 9 in Chaldean system

const CHALDEAN_MAP: { [key: string]: number } = {
    'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1,
    'B': 2, 'K': 2, 'R': 2,
    'C': 3, 'G': 3, 'L': 3, 'S': 3,
    'D': 4, 'M': 4, 'T': 4,
    'E': 5, 'H': 5, 'N': 5, 'X': 5,
    'U': 6, 'V': 6, 'W': 6,
    'O': 7, 'Z': 7,
    'F': 8, 'P': 8
};

/**
 * Extract first, middle, and last name from full name
 * First word = first name, last word = last name
 * All words in between = middle name (combined)
 */
export function extractNameParts(fullName: string): { firstName: string; middleName: string; lastName: string } {
    const trimmed = fullName.trim();
    const words = trimmed.split(/\s+/).filter(word => word.length > 0);

    if (words.length === 0) {
        return { firstName: '', middleName: '', lastName: '' };
    }

    if (words.length === 1) {
        // Single name - use same for first and last, no middle
        return { firstName: words[0], middleName: '', lastName: words[0] };
    }

    if (words.length === 2) {
        // Two words - first and last only, no middle
        return {
            firstName: words[0],
            middleName: '',
            lastName: words[1]
        };
    }

    // Three or more words - first, middle (all in between), and last
    return {
        firstName: words[0],
        middleName: words.slice(1, -1).join(' '),
        lastName: words[words.length - 1]
    };
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use extractNameParts instead
 */
export function extractFirstLastName(fullName: string): { firstName: string; lastName: string } {
    const { firstName, lastName } = extractNameParts(fullName);
    return { firstName, lastName };
}

/**
 * Clean name - remove special characters, convert to uppercase
 */
function cleanName(name: string): string {
    return name.toUpperCase().replace(/[^A-Z]/g, '');
}

/**
 * Get Chaldean value for a letter
 */
export function getLetterValue(letter: string): number {
    return CHALDEAN_MAP[letter.toUpperCase()] || 0;
}

/**
 * Get letter-by-letter breakdown with Chaldean values
 */
export function getNameBreakdown(name: string): Array<{ letter: string; value: number }> {
    const cleaned = cleanName(name);
    return cleaned.split('').map(letter => ({
        letter: letter,
        value: getLetterValue(letter)
    }));
}

/**
 * Reduce number to single digit
 */
function reduceToSingleDigit(num: number): number {
    while (num > 9) {
        num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
}

/**
 * Calculate name number using Chaldean system
 * Includes first name, middle name, and last name
 */
export function calculateNameNumber(firstName: string, middleName: string, lastName: string): number {
    // Combine all names
    const fullName = `${firstName}${middleName}${lastName}`;

    // Clean the name
    const cleaned = cleanName(fullName);

    // Convert each letter to number and sum
    const sum = cleaned.split('').reduce((total, letter) => {
        return total + getLetterValue(letter);
    }, 0);

    // Reduce to single digit
    return reduceToSingleDigit(sum);
}

