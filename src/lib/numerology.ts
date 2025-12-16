/**
 * Numerology calculation utilities
 * Based on Vedic numerology principles
 */

/**
 * Reduce a number to a single digit by adding its digits
 */
function reduceToSingleDigit(num: number): number {
    while (num > 9) {
        num = num
            .toString()
            .split('')
            .reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
}

/**
 * Calculate Root Number from the day of birth
 * Example: Day 28 → 2 + 8 = 10 → 1 + 0 = 1
 */
export function calculateRootNumber(day: number): number {
    return reduceToSingleDigit(day);
}

/**
 * Get Supportive Numbers (individual digits of the day)
 * Example: Day 28 → [2, 8]
 */
export function getSupportiveNumbers(day: number): number[] {
    return day
        .toString()
        .split('')
        .map((digit) => parseInt(digit));
}

/**
 * Calculate Destiny Number from full date of birth
 * Example: 28.09.1982 → 2+8+0+9+1+9+8+2 = 39 → 3+9 = 12 → 1+2 = 3
 */
export function calculateDestinyNumber(dateOfBirth: Date): number {
    const day = dateOfBirth.getDate();
    const month = dateOfBirth.getMonth() + 1; // getMonth() is 0-indexed
    const year = dateOfBirth.getFullYear();

    // Convert to string and get all digits
    const allDigits = `${day}${month}${year}`;
    const sum = allDigits
        .split('')
        .reduce((total, digit) => total + parseInt(digit), 0);

    return reduceToSingleDigit(sum);
}

/**
 * Calculate all numerology numbers from date of birth
 */
export function calculateNumerology(dateOfBirth: Date) {
    const day = dateOfBirth.getDate();

    return {
        rootNumber: calculateRootNumber(day),
        supportiveNumbers: getSupportiveNumbers(day),
        destinyNumber: calculateDestinyNumber(dateOfBirth),
    };
}
