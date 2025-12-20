/**
 * Antardasha (Yearly) calculation utilities
 * Calculates yearly planetary periods based on birth date
 */

export interface AntardashaEntry {
    year: number;
    dayName: string;
    antardasha: number;
}

/**
 * Day of week to number mapping
 */
const DAY_TO_NUMBER: { [key: number]: number } = {
    0: 1, // Sunday = 1
    1: 2, // Monday = 2
    2: 9, // Tuesday = 9
    3: 5, // Wednesday = 5
    4: 3, // Thursday = 3
    5: 6, // Friday = 6
    6: 8, // Saturday = 8
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
 * Get the day of the week for a specific date
 * @param day - Day of month
 * @param month - Month (1-12)
 * @param year - Full year
 * @returns Day of week (0 = Sunday, 6 = Saturday)
 */
function getDayOfWeek(day: number, month: number, year: number): number {
    const date = new Date(year, month - 1, day);
    return date.getDay();
}

/**
 * Calculate Antardasha for a specific year
 * Formula: (Birth Day digits) + (Birth Month) + (Last 2 digits of Year) + (Day-of-week number)
 * @param birthDay - Day of birth (1-31)
 * @param birthMonth - Month of birth (1-12)
 * @param targetYear - Year to calculate for
 * @returns Antardasha entry
 */
export function calculateAntardashaForYear(
    birthDay: number,
    birthMonth: number,
    targetYear: number
): AntardashaEntry {
    // Get reduced birth day
    const reducedDay = reduceToSingleDigit(birthDay);

    // Birth month as is
    const month = birthMonth;

    // Last 2 digits of year
    const yearDigits = targetYear % 100;

    // Get day of week for birthday in target year
    const dayOfWeek = getDayOfWeek(birthDay, birthMonth, targetYear);
    const dayNumber = DAY_TO_NUMBER[dayOfWeek];
    const dayName = DAY_NAMES[dayOfWeek];

    // Calculate total and reduce
    const total = reducedDay + month + yearDigits + dayNumber;
    const antardasha = reduceToSingleDigit(total);

    return {
        year: targetYear,
        dayName,
        antardasha,
    };
}

/**
 * Calculate Antardasha timeline from birth year to specified years in future
 * @param birthDay - Day of birth (1-31)
 * @param birthMonth - Month of birth (1-12)
 * @param birthYear - Year of birth
 * @param yearsToCalculate - How many years into future (default 100)
 * @returns Array of Antardasha entries
 */
export function calculateAntardasha(
    birthDay: number,
    birthMonth: number,
    birthYear: number,
    yearsToCalculate: number = 100
): AntardashaEntry[] {
    const timeline: AntardashaEntry[] = [];
    const endYear = birthYear + yearsToCalculate;

    for (let year = birthYear; year <= endYear; year++) {
        timeline.push(calculateAntardashaForYear(birthDay, birthMonth, year));
    }

    return timeline;
}
