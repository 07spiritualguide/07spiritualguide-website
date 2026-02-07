import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Colors for sections
const COLORS = {
    primary: [0, 111, 238] as [number, number, number],      // Blue
    secondary: [120, 40, 200] as [number, number, number],   // Purple
    accent: [23, 201, 100] as [number, number, number],      // Green
    text: [50, 50, 50] as [number, number, number],
    lightGray: [240, 240, 240] as [number, number, number],
    mediumGray: [180, 180, 180] as [number, number, number],
};

/**
 * Add branding header to PDF with logo and title
 */
export async function addBranding(doc: jsPDF): Promise<number> {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Try to load logo
    try {
        const logoUrl = '/icon.png';
        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = logoUrl;
        });

        // Add logo
        doc.addImage(img, 'PNG', 14, 10, 20, 20);
    } catch {
        // Logo failed to load, continue without it
    }

    // Title
    doc.setFontSize(24);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('Numerosense Report', pageWidth / 2, 22, { align: 'center' });

    // Decorative line
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(14, 35, pageWidth - 14, 35);

    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'normal');

    return 40; // Return Y position after header
}

/**
 * Add a section header with styling
 */
export function addSectionHeader(doc: jsPDF, title: string, y: number, color: [number, number, number] = COLORS.primary): number {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Background bar
    doc.setFillColor(...color);
    doc.rect(14, y, pageWidth - 28, 8, 'F');

    // Title text
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 18, y + 5.5);

    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'normal');

    return y + 12;
}

/**
 * Add key-value info row
 */
export function addInfoRow(doc: jsPDF, label: string, value: string, y: number, x: number = 18): number {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, x, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value || '-', x + doc.getTextWidth(`${label}: `), y);
    return y + 6;
}

/**
 * Add a number card (styled box with number)
 */
export function addNumberCard(
    doc: jsPDF,
    label: string,
    value: string | number,
    x: number,
    y: number,
    width: number = 40,
    color: [number, number, number] = COLORS.primary
): void {
    // Card background
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(x, y, width, 25, 3, 3, 'F');

    // Top colored border
    doc.setFillColor(...color);
    doc.roundedRect(x, y, width, 4, 3, 3, 'F');
    doc.setFillColor(245, 247, 250);
    doc.rect(x, y + 2, width, 2, 'F');

    // Label
    doc.setFontSize(8);
    doc.setTextColor(...color);
    doc.setFont('helvetica', 'bold');
    doc.text(label, x + width / 2, y + 10, { align: 'center' });

    // Value
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.text);
    doc.text(String(value), x + width / 2, y + 20, { align: 'center' });

    doc.setFont('helvetica', 'normal');
}

/**
 * Add a styled table
 */
export function addStyledTable(
    doc: jsPDF,
    startY: number,
    headers: string[],
    data: (string | number)[][],
    options?: {
        headerColor?: [number, number, number];
        highlightColumn?: number;
    }
): number {
    const headerColor = options?.headerColor || COLORS.primary;

    autoTable(doc, {
        startY,
        head: [headers],
        body: data,
        theme: 'grid',
        headStyles: {
            fillColor: headerColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 9,
            textColor: COLORS.text,
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250],
        },
        margin: { left: 14, right: 14 },
        didParseCell: (data) => {
            if (options?.highlightColumn !== undefined && data.column.index === options.highlightColumn && data.section === 'body') {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.textColor = headerColor;
            }
        },
    });

    // Return the final Y position
    return (doc as any).lastAutoTable?.finalY || startY + 20;
}

/**
 * Add page footer with branding
 */
export function addFooter(doc: jsPDF, pageNumber?: number): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(8);
    doc.setTextColor(...COLORS.mediumGray);
    doc.text('Generated by Numerosense', pageWidth / 2, pageHeight - 10, { align: 'center' });

    if (pageNumber !== undefined) {
        doc.text(`Page ${pageNumber}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
    }
}

/**
 * Check if we need a new page
 */
export function checkNewPage(doc: jsPDF, currentY: number, requiredSpace: number = 40): number {
    const pageHeight = doc.internal.pageSize.getHeight();

    if (currentY + requiredSpace > pageHeight - 20) {
        addFooter(doc);
        doc.addPage();
        return 20;
    }

    return currentY;
}

/**
 * Add traits list in columns
 */
export function addTraitsList(
    doc: jsPDF,
    title: string,
    traits: string[],
    y: number,
    x: number = 18,
    color: [number, number, number] = COLORS.primary
): number {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    doc.text(title, x, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(9);

    let currentY = y + 5;
    traits.forEach((trait, idx) => {
        doc.text(`• ${trait}`, x + 2, currentY);
        currentY += 4.5;
    });

    return currentY + 2;
}

// Source colors for grid cells (RGB values)
const SOURCE_RGB_COLORS: { [key: string]: [number, number, number] } = {
    natal: [130, 130, 130],
    root: [234, 179, 8],
    destiny: [34, 197, 94],
    mahadasha: [59, 130, 246],
    antardasha: [168, 85, 247],
    pratyantardasha: [236, 72, 153],
};

/**
 * Draw a Lo Shu Grid in PDF
 * Grid layout: 4|9|2  3|5|7  8|1|6
 */
export function drawLoShuGrid(
    doc: jsPDF,
    grid: { position: number; digits: { value: number; source: string }[] }[],
    x: number,
    y: number,
    title?: string,
    cellSize: number = 25
): number {
    // Cell values in position order (0-8)
    const cellValues = [4, 9, 2, 3, 5, 7, 8, 1, 6];

    // Title
    if (title) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 50);
        doc.text(title, x + (cellSize * 3) / 2, y - 3, { align: 'center' });
    }

    // Draw grid lines
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);

    // Draw 3x3 grid
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const cellX = x + col * cellSize;
            const cellY = y + row * cellSize;

            // Cell background
            doc.setFillColor(250, 250, 252);
            doc.rect(cellX, cellY, cellSize, cellSize, 'FD');

            const position = row * 3 + col;
            const cell = grid.find(c => c.position === position);

            // Cell reference number (top-left corner)
            doc.setFontSize(6);
            doc.setTextColor(150, 150, 150);
            doc.text(String(cellValues[position]), cellX + 2, cellY + 4);

            if (cell && cell.digits.length > 0) {
                // FIXED: Show all digits side-by-side with their colors
                // Build a single line with all digits
                const allDigits = cell.digits;
                const fontSize = cellSize > 25 ? 11 : 9;
                doc.setFontSize(fontSize);
                doc.setFont('helvetica', 'bold');

                // Calculate total width needed
                const digitWidth = fontSize * 0.6; // Approximate width per digit
                const gap = 2;
                const totalWidth = allDigits.length * digitWidth + (allDigits.length - 1) * gap;
                let startX = cellX + (cellSize - totalWidth) / 2;
                const digitY = cellY + cellSize / 2 + 3;

                // Draw each digit with its own color, side by side
                allDigits.forEach((d, idx) => {
                    const color = SOURCE_RGB_COLORS[d.source] || [50, 50, 50];
                    doc.setTextColor(...color);
                    doc.text(String(d.value), startX + idx * (digitWidth + gap), digitY);
                });
            }
        }
    }

    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');

    return y + cellSize * 3 + 5;
}

/**
 * Draw grid legend
 */
export function drawGridLegend(
    doc: jsPDF,
    sources: string[],
    x: number,
    y: number
): number {
    doc.setFontSize(7);
    let currentX = x;

    sources.forEach((source, idx) => {
        const color = SOURCE_RGB_COLORS[source] || [50, 50, 50];
        const label = source.charAt(0).toUpperCase() + source.slice(1);

        // Color dot
        doc.setFillColor(...color);
        doc.circle(currentX + 2, y - 1, 2, 'F');

        // Label
        doc.setTextColor(...color);
        doc.text(label, currentX + 6, y);

        currentX += doc.getTextWidth(label) + 12;
    });

    doc.setTextColor(50, 50, 50);
    return y + 6;
}

export { COLORS };
