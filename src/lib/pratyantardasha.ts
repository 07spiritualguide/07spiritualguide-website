/**
 * Pratyantardasha (sub-period) calculation utilities
 * Calculates sub-periods within each Antardasha year
 */

export interface PratyantardashaEntry {
    fromDate: string;
    toDate: string;
    pratyantardasha: number;
}

export interface YearPratyantardasha {
    year: number;
    fromDate: string;
    toDate: string;
    periods: PratyantardashaEntry[];
}

/**
 * Format date as DD MMM YYYY
 */
function formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

/**
 * Parse date from DD MMM YYYY format
 */
function parseDate(str: string): Date {
    const months: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    const parts = str.split(' ');
    return new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
}

/**
 * Add days to a date
 */
function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Get next number in sequence (1→2→...→9→1)
 */
function nextNumber(num: number): number {
    return num === 9 ? 1 : num + 1;
}

/**
 * Calculate Pratyantardasha periods for a single year
 * 
 * CORRECT FORMULA (from numerologist):
 * Total = (8 × Current_Planet) + Carry
 * 
 * Where:
 * - 8 = Always multiply by 8 (table of eight)
 * - Current_Planet = Cycles through planets (starts at Antardasha number)
 * - First Carry = BIRTH DAY
 * - Subsequent Carry = Remainder from previous calculation (end day of previous period)
 * - Antardasha = ONLY determines starting planet number
 * - Always use 30-day months
 * 
 * @param birthDay - Day of birth (for first carry)
 * @param antardasha - The Antardasha number (starting planet only)
 * @param startDate - Starting date (birthday in that year)
 * @param endDate - Ending date (day before next birthday)
 * @returns Array of Pratyantardasha periods
 */
function calculatePeriodsForYear(
    birthDay: number,
    antardasha: number,
    startDate: Date,
    endDate: Date
): PratyantardashaEntry[] {
    const periods: PratyantardashaEntry[] = [];

    let currentDate = new Date(startDate);
    let currentPlanet = antardasha; // Starting planet = Antardasha number
    let carry = birthDay; // FIRST CARRY = BIRTH DAY

    while (currentDate < endDate) {
        // CORRECT FORMULA: Total = (8 × Current Planet) + Carry
        // Always multiply by 8, NOT by Antardasha
        const total = (8 * currentPlanet) + carry;

        // Split into 30-day months (always 30, regardless of actual month length)
        const fullMonths = Math.floor(total / 30);
        carry = total % 30; // This carry becomes the end day AND next period's carry

        // If carry is 0, it means exactly divisible - end on 30th of previous month
        const endDay = carry === 0 ? 30 : carry;
        const monthsToAdd = carry === 0 ? fullMonths - 1 : fullMonths;

        // Calculate end date by adding months and setting the day
        let endMonth = currentDate.getMonth() + monthsToAdd;
        let endYear = currentDate.getFullYear();

        // Handle year overflow
        while (endMonth > 11) {
            endMonth -= 12;
            endYear += 1;
        }

        // Create end date
        let periodEndDate = new Date(endYear, endMonth, endDay);

        // Don't go past the year end date
        if (periodEndDate > endDate) {
            periodEndDate = new Date(endDate);
        }

        // Period starts from currentDate
        const periodStartDate = new Date(currentDate);

        periods.push({
            fromDate: formatDate(periodStartDate),
            toDate: formatDate(periodEndDate),
            pratyantardasha: currentPlanet,
        });

        // Move to next period (same day as end date, not day after)
        currentDate = new Date(periodEndDate);
        currentPlanet = nextNumber(currentPlanet);

        // Safety check to prevent infinite loop
        if (periods.length > 50) break;
    }

    return periods;
}

/**
 * Calculate full Pratyantardasha timeline from Antardasha data
 * @param birthDay - Day of birth (used as first carry for each year)
 * @param antardashaTimeline - Array of Antardasha entries with fromDate, toDate, antardasha
 * @returns Array of yearly Pratyantardasha data
 */
export function calculatePratyantardasha(
    birthDay: number,
    antardashaTimeline: { fromDate: string; toDate: string; antardasha: number }[]
): YearPratyantardasha[] {
    const timeline: YearPratyantardasha[] = [];

    for (let i = 0; i < antardashaTimeline.length; i++) {
        const entry = antardashaTimeline[i];

        // Antardasha number determines starting planet for this year
        const antardasha = entry.antardasha;

        const startDate = parseDate(entry.fromDate);
        const endDate = parseDate(entry.toDate);
        const year = startDate.getFullYear();

        const periods = calculatePeriodsForYear(
            birthDay,
            antardasha,
            startDate,
            endDate
        );

        timeline.push({
            year,
            fromDate: entry.fromDate,
            toDate: entry.toDate,
            periods,
        });
    }

    return timeline;
}

/**
 * Check if a Pratyantardasha period is currently active
 */
export function isCurrentPratyantardasha(entry: PratyantardashaEntry): boolean {
    if (!entry.fromDate || !entry.toDate) return false;

    const today = new Date();
    const from = parseDate(entry.fromDate);
    const to = parseDate(entry.toDate);

    return today >= from && today <= to;
}

/**
 * Find the current year's Pratyantardasha data
 */
export function getCurrentYearPratyantardasha(timeline: YearPratyantardasha[]): YearPratyantardasha | null {
    const currentYear = new Date().getFullYear();
    return timeline.find(entry => entry.year === currentYear) || null;
}
