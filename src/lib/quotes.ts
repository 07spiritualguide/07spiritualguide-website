/**
 * Quotes Utility
 * Returns a deterministic quote based on 2-hour rotation
 */
import quotesData from '../data/quotes.json';

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

/**
 * Get the current quote based on 2-hour rotation
 * The same quote will be shown for 2 hours, then it changes to the next one
 */
export function getQuoteForCurrentTime(): string {
    const quotes = quotesData.quotes;
    const index = Math.floor(Date.now() / TWO_HOURS_MS) % quotes.length;
    return quotes[index];
}

/**
 * Get quote count
 */
export function getQuoteCount(): number {
    return quotesData.quotes.length;
}
