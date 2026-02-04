/**
 * Calculator Utility Functions
 * Pure calculation functions for generating numerology reports
 * No database interactions - all data is computed and ephemeral
 */

import { calculateRootNumber, calculateDestinyNumber, getSupportiveNumbers, calculateNumerology } from './numerology';
import { calculateMahadasha, MahadashaEntry, isCurrentMahadasha } from './mahadasha';
import { calculateAntardasha, AntardashaEntry, isCurrentAntardasha } from './antardasha';
import { calculatePratyantardasha, YearPratyantardasha, getCurrentYearPratyantardasha, isCurrentPratyantardasha } from './pratyantardasha';
import { calculateDailyDasha, calculateAllHourlyDasha, formatDateForDisplay } from './dailydasha';
import { extractNameParts, calculateNameNumber } from './name-numerology';
import { getNumerologyDataForRoot } from './numerologyData';
import {
    LoShuGrid,
    calculateDestinyGrid,
    calculateMahadashaGrid,
    calculatePersonalYearGrid,
    calculateMonthlyGrid,
    MONTH_NAMES
} from './loshu-grid';

/**
 * Basic Info structure for calculator
 */
export interface CalculatorBasicInfo {
    // Profile
    fullName: string;
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: Date;
    dateOfBirthISO: string; // YYYY-MM-DD format for grid calculations
    formattedDob: string;

    // Core Numbers
    rootNumber: number;
    destinyNumber: number;
    nameNumber: number;
    supportiveNumbers: number[];

    // From numerology data
    lord: string | null;
    zodiacSign: string | null;
    positiveTraits: string[] | null;
    negativeTraits: string[] | null;
    luckyDates: string[] | null;
    favorableDays: string[] | null;
    luckyColor: string | null;
    luckyDirection: string | null;
    favorableAlphabets: string[] | null;
    favourableProfession: string[] | null;
}

/**
 * Daily Dasha Info for a specific date
 */
export interface CalculatorDailyDashaInfo {
    date: Date;
    formattedDate: string;
    dayName: string;
    dayNumber: number;
    pratyantardasha: number | null;
    dailyDasha: number;
}

/**
 * Hourly Dasha Info
 */
export interface CalculatorHourlyDashaInfo {
    hour: string;
    hourlyDasha: number;
}

/**
 * Complete calculated numerology report
 */
export interface CalculatedNumerologyReport {
    basicInfo: CalculatorBasicInfo;
    mahadasha: MahadashaEntry[];
    antardasha: AntardashaEntry[];
    pratyantardasha: YearPratyantardasha[];
    currentMahadasha: MahadashaEntry | null;
    currentAntardasha: AntardashaEntry | null;
    currentPratyantardasha: YearPratyantardasha | null;
    dailyDasha: CalculatorDailyDashaInfo | null;
    hourlyDasha: CalculatorHourlyDashaInfo[];
    grids: {
        basic: LoShuGrid;
        mahadasha: LoShuGrid;
        personalYear: LoShuGrid;
        monthly: LoShuGrid;
    };
}

/**
 * Format date as YYYY-MM-DD for grid calculation (ISO format)
 */
function formatDateForGridISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format date for display
 */
function formatDateDisplay(date: Date): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Main calculation function - generates complete numerology report
 * This is a pure function with no side effects or database calls
 */
export function calculateNumerologyReport(fullName: string, dateOfBirth: Date): CalculatedNumerologyReport {
    // Extract name parts
    const { firstName, middleName, lastName } = extractNameParts(fullName);

    // Calculate core numbers
    const numerology = calculateNumerology(dateOfBirth);
    const { rootNumber, destinyNumber, supportiveNumbers } = numerology;
    const nameNumber = calculateNameNumber(firstName, middleName, lastName);

    // Get numerology data for root number
    const rootData = getNumerologyDataForRoot(rootNumber);

    // Calculate dasha timelines
    const birthDay = dateOfBirth.getDate();
    const birthMonth = dateOfBirth.getMonth() + 1;
    const birthYear = dateOfBirth.getFullYear();

    const mahadasha = calculateMahadasha(birthDay, birthMonth, birthYear, rootNumber);
    const antardasha = calculateAntardasha(birthDay, birthMonth, birthYear);
    const pratyantardasha = calculatePratyantardasha(birthDay, antardasha);

    // Find current periods
    const currentMahadasha = mahadasha.find(isCurrentMahadasha) || null;
    const currentAntardasha = antardasha.find(isCurrentAntardasha) || null;
    const currentPratyantardasha = getCurrentYearPratyantardasha(pratyantardasha);

    // Calculate daily dasha for today
    const today = new Date();
    const dailyDashaResult = calculateDailyDasha(today, pratyantardasha);
    let dailyDasha: CalculatorDailyDashaInfo | null = null;
    let hourlyDasha: CalculatorHourlyDashaInfo[] = [];

    if (dailyDashaResult) {
        dailyDasha = {
            date: today,
            formattedDate: formatDateForDisplay(today),
            dayName: dailyDashaResult.dayName,
            dayNumber: dailyDashaResult.dayNumber,
            pratyantardasha: dailyDashaResult.pratyantardasha,
            dailyDasha: dailyDashaResult.dailyDasha,
        };
        hourlyDasha = calculateAllHourlyDasha(dailyDashaResult.dailyDasha);
    }

    // Calculate grids - use ISO format (YYYY-MM-DD) for proper parsing
    const dateStringISO = formatDateForGridISO(dateOfBirth);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const grids = {
        basic: calculateDestinyGrid(dateStringISO, rootNumber, destinyNumber),
        mahadasha: calculateMahadashaGrid(dateStringISO, rootNumber, destinyNumber, mahadasha),
        personalYear: calculatePersonalYearGrid(dateStringISO, rootNumber, destinyNumber, currentYear, mahadasha, antardasha),
        monthly: calculateMonthlyGrid(dateStringISO, rootNumber, destinyNumber, currentYear, currentMonth, mahadasha, antardasha, pratyantardasha),
    };

    // Build basic info
    const basicInfo: CalculatorBasicInfo = {
        fullName,
        firstName,
        middleName,
        lastName,
        dateOfBirth,
        dateOfBirthISO: dateStringISO,
        formattedDob: formatDateDisplay(dateOfBirth),
        rootNumber,
        destinyNumber,
        nameNumber,
        supportiveNumbers,
        lord: rootData?.lord || null,
        zodiacSign: rootData?.zodiac_sign || null,
        positiveTraits: rootData?.positive_traits || null,
        negativeTraits: rootData?.negative_traits || null,
        luckyDates: rootData?.lucky_dates || null,
        favorableDays: rootData?.favorable_days || null,
        luckyColor: rootData?.lucky_color || null,
        luckyDirection: rootData?.lucky_direction || null,
        favorableAlphabets: rootData?.favorable_alphabets || null,
        favourableProfession: rootData?.favourable_profession || null,
    };

    return {
        basicInfo,
        mahadasha,
        antardasha,
        pratyantardasha,
        currentMahadasha,
        currentAntardasha,
        currentPratyantardasha,
        dailyDasha,
        hourlyDasha,
        grids,
    };
}

/**
 * Calculate daily dasha for a specific date
 */
export function calculateDailyDashaForDate(
    date: Date,
    pratyantardasha: YearPratyantardasha[]
): CalculatorDailyDashaInfo | null {
    const result = calculateDailyDasha(date, pratyantardasha);
    if (!result) return null;

    return {
        date,
        formattedDate: formatDateForDisplay(date),
        dayName: result.dayName,
        dayNumber: result.dayNumber,
        pratyantardasha: result.pratyantardasha,
        dailyDasha: result.dailyDasha,
    };
}

/**
 * Calculate hourly dasha for a daily dasha number
 */
export function calculateHourlyDashaForDay(dailyDashaNumber: number): CalculatorHourlyDashaInfo[] {
    return calculateAllHourlyDasha(dailyDashaNumber);
}

// Re-export for convenience
export { MONTH_NAMES };
