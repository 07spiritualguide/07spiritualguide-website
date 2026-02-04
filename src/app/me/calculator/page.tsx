'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    Spinner,
    Tabs,
    Tab,
    Chip,
    Button,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    DatePicker,
    Select,
    SelectItem,
} from '@heroui/react';
import { parseDate, CalendarDate } from '@internationalized/date';
import StudentNavbar from '@/components/StudentNavbar';
import LoShuGridComponent from '@/components/grids/LoShuGrid';
import GridLegend from '@/components/grids/GridLegend';
import {
    DigitSource,
    calculateDestinyGrid,
    calculateMahadashaGrid,
    calculatePersonalYearGrid,
    calculateMonthlyGrid,
    MONTH_NAMES
} from '@/lib/loshu-grid';
import {
    calculateNumerologyReport,
    CalculatedNumerologyReport,
    calculateDailyDashaForDate,
} from '@/lib/calculator-utils';
import { isCurrentMahadasha } from '@/lib/mahadasha';
import { isCurrentAntardasha } from '@/lib/antardasha';
import { isCurrentPratyantardasha, YearPratyantardasha } from '@/lib/pratyantardasha';
import { calculateDailyDasha, calculateAllHourlyDasha, isCurrentHour } from '@/lib/dailydasha';
import { getNameBreakdown } from '@/lib/name-numerology';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CalculatorPage() {
    // Form state
    const [fullName, setFullName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<CalendarDate | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [report, setReport] = useState<CalculatedNumerologyReport | null>(null);

    // Selected dates for dasha calculation
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Grid state - sub-tab and selectors
    const [selectedGridTab, setSelectedGridTab] = useState('basic-grids');
    const [selectedMonthlyYear, setSelectedMonthlyYear] = useState(new Date().getFullYear());
    const [selectedPersonalYearStart, setSelectedPersonalYearStart] = useState(new Date().getFullYear());

    // Clear destiny theme CSS variables on mount - calculator should use default theme
    useEffect(() => {
        const root = document.documentElement;
        root.style.removeProperty('--root-bg');
        root.style.removeProperty('--root-card');
        root.style.removeProperty('--root-accent');
        root.style.removeProperty('--root-primary');
        root.style.removeProperty('--root-tablist');
        root.style.removeProperty('--root-grid-border');
        root.style.removeProperty('--root-grid-bg');
    }, []);

    // Calculate report
    const handleCalculate = async () => {
        if (!fullName.trim() || !dateOfBirth) return;

        setIsCalculating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const dob = new Date(dateOfBirth.year, dateOfBirth.month - 1, dateOfBirth.day);
            const calculatedReport = calculateNumerologyReport(fullName.trim(), dob);
            setReport(calculatedReport);
        } catch (error) {
            console.error('Calculation error:', error);
        } finally {
            setIsCalculating(false);
        }
    };

    // Clear form
    const handleClear = () => {
        setFullName('');
        setDateOfBirth(null);
        setReport(null);
    };

    // Get days in selected month for daily dasha
    const getDaysInMonth = (year: number, month: number) => {
        const days: Date[] = [];
        const date = new Date(year, month, 1);
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    };

    // Generate PDF report
    const handleDownloadPDF = () => {
        if (!report) return;

        const doc = new jsPDF();
        const { basicInfo } = report;

        // Title
        doc.setFontSize(20);
        doc.text('Numerology Report', 105, 20, { align: 'center' });

        // Name and DOB
        doc.setFontSize(14);
        doc.text(`Name: ${basicInfo.fullName}`, 20, 35);
        doc.text(`Date of Birth: ${basicInfo.formattedDob}`, 20, 45);

        // Core Numbers
        doc.setFontSize(16);
        doc.text('Core Numbers', 20, 60);
        doc.setFontSize(12);
        doc.text(`Root Number: ${basicInfo.rootNumber}`, 25, 70);
        doc.text(`Destiny Number: ${basicInfo.destinyNumber}`, 25, 78);
        doc.text(`Name Number: ${basicInfo.nameNumber}`, 25, 86);
        doc.text(`Supportive Numbers: ${basicInfo.supportiveNumbers.join(', ')}`, 25, 94);

        // Lucky Details
        doc.setFontSize(16);
        doc.text('Lucky Details', 20, 110);
        doc.setFontSize(12);
        doc.text(`Lord: ${basicInfo.lord || '-'}`, 25, 120);
        doc.text(`Zodiac: ${basicInfo.zodiacSign || '-'}`, 25, 128);
        doc.text(`Lucky Color: ${basicInfo.luckyColor || '-'}`, 25, 136);
        doc.text(`Lucky Direction: ${basicInfo.luckyDirection || '-'}`, 25, 144);

        // Mahadasha Table
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Mahadasha Timeline', 20, 20);

        autoTable(doc, {
            startY: 30,
            head: [['Period', 'From', 'To', 'Number']],
            body: report.mahadasha.slice(0, 20).map((entry, idx) => [
                `Period ${idx + 1}`,
                entry.fromDate,
                entry.toDate,
                entry.number.toString(),
            ]),
        });

        doc.save(`numerology-report-${basicInfo.firstName}.pdf`);
    };

    // Generate CSV export
    const handleDownloadCSV = () => {
        if (!report) return;

        const { basicInfo, mahadasha, antardasha } = report;

        let csv = 'Numerology Report\n\n';
        csv += 'Basic Information\n';
        csv += `Full Name,${basicInfo.fullName}\n`;
        csv += `Date of Birth,${basicInfo.formattedDob}\n`;
        csv += `Root Number,${basicInfo.rootNumber}\n`;
        csv += `Destiny Number,${basicInfo.destinyNumber}\n`;
        csv += `Name Number,${basicInfo.nameNumber}\n`;
        csv += `Supportive Numbers,"${basicInfo.supportiveNumbers.join(', ')}"\n`;
        csv += `Lord,${basicInfo.lord || ''}\n`;
        csv += `Zodiac Sign,${basicInfo.zodiacSign || ''}\n`;
        csv += `Lucky Color,${basicInfo.luckyColor || ''}\n`;
        csv += `Lucky Direction,${basicInfo.luckyDirection || ''}\n`;

        csv += '\nMahadasha Timeline\n';
        csv += 'From,To,Number\n';
        mahadasha.forEach(entry => {
            csv += `${entry.fromDate},${entry.toDate},${entry.number}\n`;
        });

        csv += '\nAntardasha Timeline\n';
        csv += 'From,To,Number\n';
        antardasha.forEach(entry => {
            csv += `${entry.fromDate},${entry.toDate},${entry.antardasha}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `numerology-report-${basicInfo.firstName}.csv`;
        a.click();
    };

    // Render Basic Info tab content
    const renderBasicInfoContent = () => {
        if (!report) return null;
        const { basicInfo } = report;

        return (
            <div className="space-y-6">
                {/* Number Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-amber-50">
                        <CardBody className="text-center py-6">
                            <p className="text-amber-700 text-sm mb-1">Root Number</p>
                            <p className="text-amber-600 text-4xl font-bold">{basicInfo.rootNumber}</p>
                        </CardBody>
                    </Card>
                    <Card className="bg-emerald-50">
                        <CardBody className="text-center py-6">
                            <p className="text-emerald-700 text-sm mb-1">Destiny Number</p>
                            <p className="text-emerald-600 text-4xl font-bold">{basicInfo.destinyNumber}</p>
                        </CardBody>
                    </Card>
                    <Card className="bg-purple-50">
                        <CardBody className="text-center py-6">
                            <p className="text-purple-700 text-sm mb-1">Name Number</p>
                            <p className="text-purple-600 text-4xl font-bold">{basicInfo.nameNumber}</p>
                        </CardBody>
                    </Card>
                    <Card className="bg-indigo-50">
                        <CardBody className="text-center py-6">
                            <p className="text-indigo-700 text-sm mb-1">Supportive</p>
                            <div className="flex justify-center gap-2 mt-1">
                                {basicInfo.supportiveNumbers.map((num, idx) => (
                                    <Chip key={idx} color="secondary" variant="flat" size="lg">
                                        {num}
                                    </Chip>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Profile Card */}
                <Card>
                    <CardBody>
                        <h3 className="text-lg font-semibold mb-4">Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-default-500">Full Name</p>
                                <p className="text-lg font-medium">
                                    {basicInfo.firstName === basicInfo.lastName
                                        ? basicInfo.firstName
                                        : [basicInfo.firstName, basicInfo.middleName, basicInfo.lastName].filter(Boolean).join(' ')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Date of Birth</p>
                                <p className="text-lg font-medium">{basicInfo.formattedDob}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Lord</p>
                                <p className="text-lg font-medium">{basicInfo.lord || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Zodiac Sign</p>
                                <p className="text-lg font-medium">{basicInfo.zodiacSign || '-'}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Traits Card */}
                <Card>
                    <CardBody>
                        <h3 className="text-lg font-semibold mb-4">Traits</h3>
                        <div className="space-y-4">
                            {basicInfo.positiveTraits && basicInfo.positiveTraits.length > 0 && (
                                <div>
                                    <p className="text-sm text-success-600 font-medium mb-2">Positive Traits</p>
                                    <div className="flex flex-wrap gap-2">
                                        {basicInfo.positiveTraits.map((trait, idx) => (
                                            <Chip key={idx} color="success" variant="flat" size="sm">
                                                {trait}
                                            </Chip>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {basicInfo.negativeTraits && basicInfo.negativeTraits.length > 0 && (
                                <div>
                                    <p className="text-sm text-danger-600 font-medium mb-2">Negative Traits</p>
                                    <div className="flex flex-wrap gap-2">
                                        {basicInfo.negativeTraits.map((trait, idx) => (
                                            <Chip key={idx} color="danger" variant="flat" size="sm">
                                                {trait}
                                            </Chip>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* Lucky Details Card */}
                <Card>
                    <CardBody>
                        <h3 className="text-lg font-semibold mb-4">Lucky Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-default-500">Lucky Color</p>
                                <p className="text-lg font-medium">{basicInfo.luckyColor || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Lucky Direction</p>
                                <p className="text-lg font-medium">{basicInfo.luckyDirection || '-'}</p>
                            </div>
                            {basicInfo.luckyDates && basicInfo.luckyDates.length > 0 && (
                                <div>
                                    <p className="text-sm text-default-500">Lucky Dates</p>
                                    <p className="text-lg font-medium">{basicInfo.luckyDates.join(', ')}</p>
                                </div>
                            )}
                            {basicInfo.favorableDays && basicInfo.favorableDays.length > 0 && (
                                <div>
                                    <p className="text-sm text-default-500">Favorable Days</p>
                                    <p className="text-lg font-medium">{basicInfo.favorableDays.join(', ')}</p>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* Name Numerology Card */}
                <Card>
                    <CardBody>
                        <h3 className="text-lg font-semibold mb-4">Name Numerology</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* First Name */}
                            <div>
                                <p className="text-sm text-default-500 mb-2">First Name: {basicInfo.firstName}</p>
                                <Table aria-label="First name breakdown" removeWrapper>
                                    <TableHeader>
                                        <TableColumn>Letter</TableColumn>
                                        <TableColumn className="text-right">Value</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {getNameBreakdown(basicInfo.firstName).map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{item.letter}</TableCell>
                                                <TableCell className="text-right">{item.value}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Middle Name */}
                            {basicInfo.middleName && (
                                <div>
                                    <p className="text-sm text-default-500 mb-2">Middle Name: {basicInfo.middleName}</p>
                                    <Table aria-label="Middle name breakdown" removeWrapper>
                                        <TableHeader>
                                            <TableColumn>Letter</TableColumn>
                                            <TableColumn className="text-right">Value</TableColumn>
                                        </TableHeader>
                                        <TableBody>
                                            {getNameBreakdown(basicInfo.middleName).map((item, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{item.letter}</TableCell>
                                                    <TableCell className="text-right">{item.value}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {/* Last Name */}
                            {basicInfo.lastName !== basicInfo.firstName && (
                                <div>
                                    <p className="text-sm text-default-500 mb-2">Last Name: {basicInfo.lastName}</p>
                                    <Table aria-label="Last name breakdown" removeWrapper>
                                        <TableHeader>
                                            <TableColumn>Letter</TableColumn>
                                            <TableColumn className="text-right">Value</TableColumn>
                                        </TableHeader>
                                        <TableBody>
                                            {getNameBreakdown(basicInfo.lastName).map((item, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{item.letter}</TableCell>
                                                    <TableCell className="text-right">{item.value}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    };

    // Render Mahadasha tab
    const renderMahadashaContent = () => {
        if (!report) return null;

        return (
            <Card>
                <CardBody>
                    <h3 className="text-lg font-semibold mb-4">Mahadasha Timeline</h3>
                    <Table aria-label="Mahadasha timeline">
                        <TableHeader>
                            <TableColumn>From</TableColumn>
                            <TableColumn>To</TableColumn>
                            <TableColumn>Number</TableColumn>
                            <TableColumn>Status</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {report.mahadasha.map((entry, idx) => (
                                <TableRow key={idx} className={isCurrentMahadasha(entry) ? 'bg-primary-50' : ''}>
                                    <TableCell>{entry.fromDate}</TableCell>
                                    <TableCell>{entry.toDate}</TableCell>
                                    <TableCell>
                                        <Chip color="primary" variant="flat">{entry.number}</Chip>
                                    </TableCell>
                                    <TableCell>
                                        {isCurrentMahadasha(entry) && (
                                            <Chip color="success" size="sm">Current</Chip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        );
    };

    // Render Antardasha tab
    const renderAntardashaContent = () => {
        if (!report) return null;

        return (
            <Card>
                <CardBody>
                    <h3 className="text-lg font-semibold mb-4">Antardasha Timeline</h3>
                    <Table aria-label="Antardasha timeline">
                        <TableHeader>
                            <TableColumn>From</TableColumn>
                            <TableColumn>To</TableColumn>
                            <TableColumn>Number</TableColumn>
                            <TableColumn>Status</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {report.antardasha.map((entry, idx) => (
                                <TableRow key={idx} className={isCurrentAntardasha(entry) ? 'bg-primary-50' : ''}>
                                    <TableCell>{entry.fromDate}</TableCell>
                                    <TableCell>{entry.toDate}</TableCell>
                                    <TableCell>
                                        <Chip color="secondary" variant="flat">{entry.antardasha}</Chip>
                                    </TableCell>
                                    <TableCell>
                                        {isCurrentAntardasha(entry) && (
                                            <Chip color="success" size="sm">Current</Chip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        );
    };

    // Render Pratyantardasha tab
    const renderPratyantardashaContent = () => {
        if (!report) return null;

        const currentYear = report.pratyantardasha.find(
            (y: YearPratyantardasha) => y.year === new Date().getFullYear()
        );

        return (
            <Card>
                <CardBody>
                    <h3 className="text-lg font-semibold mb-4">
                        Pratyantardasha Timeline - {new Date().getFullYear()}
                    </h3>
                    {currentYear ? (
                        <Table aria-label="Pratyantardasha timeline">
                            <TableHeader>
                                <TableColumn>From</TableColumn>
                                <TableColumn>To</TableColumn>
                                <TableColumn>Number</TableColumn>
                                <TableColumn>Status</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {currentYear.periods.map((period, idx) => (
                                    <TableRow key={idx} className={isCurrentPratyantardasha(period) ? 'bg-primary-50' : ''}>
                                        <TableCell>{period.fromDate}</TableCell>
                                        <TableCell>{period.toDate}</TableCell>
                                        <TableCell>
                                            <Chip color="warning" variant="flat">{period.pratyantardasha}</Chip>
                                        </TableCell>
                                        <TableCell>
                                            {isCurrentPratyantardasha(period) && (
                                                <Chip color="success" size="sm">Current</Chip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-default-500">No data available for current year.</p>
                    )}
                </CardBody>
            </Card>
        );
    };

    // Render Daily Dasha tab
    const renderDailyDashaContent = () => {
        if (!report) return null;

        const days = getDaysInMonth(selectedYear, selectedMonth);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        return (
            <Card>
                <CardBody>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Daily Dasha - {monthNames[selectedMonth]} {selectedYear}</h3>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="flat"
                                onPress={() => {
                                    if (selectedMonth === 0) {
                                        setSelectedMonth(11);
                                        setSelectedYear(selectedYear - 1);
                                    } else {
                                        setSelectedMonth(selectedMonth - 1);
                                    }
                                }}
                            >
                                ← Prev
                            </Button>
                            <Button
                                size="sm"
                                variant="flat"
                                onPress={() => {
                                    if (selectedMonth === 11) {
                                        setSelectedMonth(0);
                                        setSelectedYear(selectedYear + 1);
                                    } else {
                                        setSelectedMonth(selectedMonth + 1);
                                    }
                                }}
                            >
                                Next →
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                        {days.map((day, idx) => {
                            const dailyData = calculateDailyDasha(day, report.pratyantardasha);
                            const isToday = day.toDateString() === new Date().toDateString();
                            return (
                                <Card
                                    key={idx}
                                    className={`${isToday ? 'border-2 border-primary' : ''}`}
                                >
                                    <CardBody className="p-2 text-center">
                                        <p className="text-xs text-default-500">{day.getDate()}</p>
                                        <p className="text-lg font-bold text-primary">
                                            {dailyData?.dailyDasha || '-'}
                                        </p>
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </div>
                </CardBody>
            </Card>
        );
    };

    // Render Hourly Dasha tab
    const renderHourlyDashaContent = () => {
        if (!report || !report.dailyDasha) return null;

        const hourlyData = calculateAllHourlyDasha(report.dailyDasha.dailyDasha);

        return (
            <Card>
                <CardBody>
                    <h3 className="text-lg font-semibold mb-4">Hourly Dasha - Today</h3>
                    <div className="text-sm text-default-500 mb-4 flex items-center gap-2">
                        Daily Dasha: <Chip color="primary" size="sm">{report.dailyDasha.dailyDasha}</Chip>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {hourlyData.map((item, idx) => (
                            <Card
                                key={idx}
                                className={isCurrentHour(idx) ? 'border-2 border-primary bg-primary-50' : ''}
                            >
                                <CardBody className="p-2 text-center">
                                    <p className="text-xs text-default-500">{item.hour}</p>
                                    <p className="text-lg font-bold text-secondary">{item.hourlyDasha}</p>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </CardBody>
            </Card>
        );
    };

    // Render Grid tab
    const renderGridContent = () => {
        if (!report) return null;

        const dobISO = report.basicInfo.dateOfBirthISO;

        return (
            <div className="space-y-6">
                <Card>
                    <CardBody>
                        <h3 className="text-lg font-semibold mb-2">Grids</h3>

                        {/* Grid Sub-Tabs */}
                        <Tabs
                            selectedKey={selectedGridTab}
                            onSelectionChange={(key) => setSelectedGridTab(key as string)}
                            aria-label="Grid types"
                            className="mb-0"
                            size="sm"
                            classNames={{
                                tabList: "overflow-x-auto flex-nowrap scrollbar-hide",
                                tab: "min-w-fit px-2 text-xs md:text-sm whitespace-nowrap",
                                base: "w-full"
                            }}
                        >
                            {/* BASIC TAB */}
                            <Tab key="basic-grids" title="Basic">
                                <div className="mt-0">
                                    <GridLegend sources={['natal', 'root', 'destiny'] as DigitSource[]} compact />
                                    <div className="mt-6 flex justify-center">
                                        <div className="flex flex-col items-center">
                                            <LoShuGridComponent
                                                grid={calculateDestinyGrid(
                                                    dobISO,
                                                    report.basicInfo.rootNumber,
                                                    report.basicInfo.destinyNumber
                                                )}
                                                title="Basic Grid"
                                            />
                                            <p className="text-center text-sm text-default-500 mt-3 max-w-md">
                                                Shows your natal digits (birth date), root number, and destiny number all in one grid
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Tab>

                            {/* MAHADASHA TAB */}
                            <Tab key="mahadasha-grid" title="Mahadasha">
                                <div className="mt-0">
                                    <GridLegend sources={['natal', 'destiny', 'mahadasha', 'antardasha', 'pratyantardasha'] as DigitSource[]} compact />
                                    <div className="mt-6 flex justify-center">
                                        <LoShuGridComponent
                                            grid={calculateMahadashaGrid(
                                                dobISO,
                                                report.basicInfo.rootNumber,
                                                report.basicInfo.destinyNumber,
                                                report.mahadasha
                                            )}
                                            title="Current Mahadasha Grid"
                                        />
                                    </div>
                                    <p className="text-center text-sm text-default-500 mt-4">
                                        Destiny + Current Mahadasha Number
                                    </p>
                                </div>
                            </Tab>

                            {/* PERSONAL YEAR TAB */}
                            <Tab key="personal-year" title="Personal Year">
                                <div className="mt-0">
                                    <GridLegend
                                        sources={['natal', 'destiny', 'mahadasha', 'antardasha', 'pratyantardasha'] as DigitSource[]}
                                        compact
                                    />

                                    <div className="flex flex-col md:flex-row justify-between items-center mt-4 mb-4 gap-4">
                                        <Select
                                            label="Select Year Range"
                                            className="max-w-xs"
                                            selectedKeys={[selectedPersonalYearStart.toString()]}
                                            onSelectionChange={(keys) => setSelectedPersonalYearStart(Number(Array.from(keys)[0]))}
                                        >
                                            {Array.from({ length: 10 }, (_, i) => {
                                                const startYear = new Date().getFullYear() - 16 + (i * 16);
                                                const endYear = startYear + 15;
                                                return (
                                                    <SelectItem key={startYear.toString()} textValue={`${startYear} - ${endYear}`}>
                                                        {startYear} - {endYear}
                                                    </SelectItem>
                                                );
                                            })}
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {Array.from({ length: 16 }, (_, i) => {
                                            const year = selectedPersonalYearStart + i;
                                            return (
                                                <div key={year} className="flex flex-col items-center">
                                                    <LoShuGridComponent
                                                        grid={calculatePersonalYearGrid(
                                                            dobISO,
                                                            report.basicInfo.rootNumber,
                                                            report.basicInfo.destinyNumber,
                                                            year,
                                                            report.mahadasha,
                                                            report.antardasha
                                                        )}
                                                        title={year.toString()}
                                                        compact
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </Tab>

                            {/* MONTHLY TAB */}
                            <Tab key="monthly" title="Monthly">
                                <div className="mt-0">
                                    <GridLegend
                                        sources={['natal', 'destiny', 'mahadasha', 'antardasha', 'pratyantardasha'] as DigitSource[]}
                                        compact
                                    />

                                    <div className="mt-4 mb-4">
                                        <Select
                                            label="Select Year"
                                            className="max-w-xs"
                                            selectedKeys={[selectedMonthlyYear.toString()]}
                                            onSelectionChange={(keys) => setSelectedMonthlyYear(Number(Array.from(keys)[0]))}
                                        >
                                            {Array.from({ length: 20 }, (_, i) => {
                                                const year = new Date().getFullYear() - 5 + i;
                                                return (
                                                    <SelectItem key={year.toString()} textValue={year.toString()}>
                                                        {year.toString()}
                                                    </SelectItem>
                                                );
                                            })}
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {MONTH_NAMES.map((monthName, monthIndex) => (
                                            <div key={monthIndex} className="flex flex-col items-center">
                                                <LoShuGridComponent
                                                    grid={calculateMonthlyGrid(
                                                        dobISO,
                                                        report.basicInfo.rootNumber,
                                                        report.basicInfo.destinyNumber,
                                                        selectedMonthlyYear,
                                                        monthIndex,
                                                        report.mahadasha,
                                                        report.antardasha,
                                                        report.pratyantardasha
                                                    )}
                                                    title={monthName}
                                                    compact
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Tab>
                        </Tabs>
                    </CardBody>
                </Card>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background">
            <StudentNavbar />

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Numerology Calculator</h1>
                    <p className="text-default-500">
                        Enter name and date of birth to calculate a complete numerology report.
                        This data is not saved and will be cleared on refresh.
                    </p>
                </div>

                {/* Input Form */}
                {!report ? (
                    <Card className="mb-8">
                        <CardBody className="space-y-6">
                            <Input
                                label="Full Name"
                                placeholder="Enter full name"
                                value={fullName}
                                onValueChange={setFullName}
                                isRequired
                                size="lg"
                            />
                            <DatePicker
                                label="Date of Birth"
                                value={dateOfBirth}
                                onChange={setDateOfBirth}
                                isRequired
                                size="lg"
                                showMonthAndYearPickers
                            />
                            <Button
                                color="primary"
                                size="lg"
                                className="w-full"
                                onPress={handleCalculate}
                                isDisabled={!fullName.trim() || !dateOfBirth || isCalculating}
                                isLoading={isCalculating}
                            >
                                Calculate Numerology
                            </Button>
                        </CardBody>
                    </Card>
                ) : (
                    <>
                        {/* Results Header */}
                        <Card className="mb-6">
                            <CardBody>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            {report.basicInfo.firstName === report.basicInfo.lastName
                                                ? report.basicInfo.firstName
                                                : [report.basicInfo.firstName, report.basicInfo.middleName, report.basicInfo.lastName].filter(Boolean).join(' ')}
                                        </h2>
                                        <p className="text-default-500">{report.basicInfo.formattedDob}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="flat"
                                            color="primary"
                                            onPress={handleDownloadPDF}
                                        >
                                            📄 PDF
                                        </Button>
                                        <Button
                                            variant="flat"
                                            color="secondary"
                                            onPress={handleDownloadCSV}
                                        >
                                            📊 CSV
                                        </Button>
                                        <Button
                                            variant="flat"
                                            color="danger"
                                            onPress={handleClear}
                                        >
                                            ✕ New
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Results Tabs */}
                        <Tabs aria-label="Calculator results" size="lg" color="primary">
                            <Tab key="basic" title="Basic Info">
                                {renderBasicInfoContent()}
                            </Tab>
                            <Tab key="mahadasha" title="Mahadasha">
                                {renderMahadashaContent()}
                            </Tab>
                            <Tab key="antardasha" title="Antardasha">
                                {renderAntardashaContent()}
                            </Tab>
                            <Tab key="pratyantardasha" title="Pratyantardasha">
                                {renderPratyantardashaContent()}
                            </Tab>
                            <Tab key="daily" title="Daily Dasha">
                                {renderDailyDashaContent()}
                            </Tab>
                            <Tab key="hourly" title="Hourly Dasha">
                                {renderHourlyDashaContent()}
                            </Tab>
                            <Tab key="grid" title="Grids">
                                {renderGridContent()}
                            </Tab>
                        </Tabs>
                    </>
                )}
            </div>
        </div>
    );
}
