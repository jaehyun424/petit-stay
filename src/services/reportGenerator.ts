// ============================================
// Petit Stay - PDF Report Generator
// Uses jsPDF + jspdf-autotable for professional reports
// ============================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '../utils/format';

// ----------------------------------------
// Types
// ----------------------------------------
interface RevenueDataPoint {
    label: string;
    revenue: number;
    bookings: number;
    avgRevenue: number;
}

interface SitterRow {
    name: string;
    tier: string;
    rating: number;
    sessions: number;
    safetyDays: number;
}

interface SLAMetrics {
    avgResponseMinutes: number;
    fulfillmentRate: number;
    cancelRate: number;
    avgSessionDuration: number;
    repeatBookingRate: number;
    onTimeRate: number;
}

export interface HotelMonthlyReportData {
    hotelName: string;
    month: string;
    revenueData: RevenueDataPoint[];
    totalRevenue: number;
    totalBookings: number;
    completionRate: number;
    sitters: SitterRow[];
    slaMetrics: SLAMetrics;
}

// ----------------------------------------
// Brand Colors
// ----------------------------------------
const COLORS = {
    charcoal: [42, 42, 42] as [number, number, number],
    gold: [197, 160, 89] as [number, number, number],
    cream: [250, 247, 240] as [number, number, number],
    primary: [99, 102, 241] as [number, number, number],
    textSecondary: [120, 120, 120] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    success: [74, 111, 88] as [number, number, number],
};

// ----------------------------------------
// Helper Functions
// ----------------------------------------
function drawHeader(doc: jsPDF, hotelName: string, month: string) {
    // Gold accent bar
    doc.setFillColor(...COLORS.gold);
    doc.rect(0, 0, 210, 3, 'F');

    // Brand name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.charcoal);
    doc.text('Petit Stay', 20, 22);

    // Hotel name & period
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.textSecondary);
    doc.text(`${hotelName} \u2014 Monthly Report`, 20, 30);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.charcoal);
    doc.text(month, 20, 40);

    // Generated date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textSecondary);
    const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Generated: ${now}`, 20, 47);

    // Separator line
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.5);
    doc.line(20, 50, 190, 50);
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.charcoal);
    doc.text(title, 20, y);
    return y + 8;
}

function drawKpiCard(doc: jsPDF, x: number, y: number, width: number, label: string, value: string) {
    doc.setFillColor(...COLORS.cream);
    doc.roundedRect(x, y, width, 24, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.charcoal);
    doc.text(value, x + width / 2, y + 10, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textSecondary);
    doc.text(label, x + width / 2, y + 18, { align: 'center' });
}

function drawRevenueChart(doc: jsPDF, x: number, y: number, width: number, height: number, data: RevenueDataPoint[]) {
    if (data.length === 0) return y + height;

    const maxRevenue = Math.max(...data.map(d => d.revenue));
    const barWidth = Math.min(16, (width - (data.length - 1) * 4) / data.length);
    const barGap = (width - barWidth * data.length) / (data.length + 1);

    // Background
    doc.setFillColor(252, 250, 245);
    doc.roundedRect(x, y, width, height, 3, 3, 'F');

    // Grid lines
    doc.setDrawColor(230, 225, 218);
    doc.setLineWidth(0.2);
    for (let i = 0; i <= 4; i++) {
        const lineY = y + 8 + (height - 24) * (1 - i / 4);
        doc.line(x + 4, lineY, x + width - 4, lineY);
    }

    // Bars
    data.forEach((d, i) => {
        const barH = maxRevenue > 0 ? (d.revenue / maxRevenue) * (height - 28) : 0;
        const barX = x + barGap + i * (barWidth + barGap);
        const barY = y + 8 + (height - 24) - barH;

        doc.setFillColor(...COLORS.primary);
        doc.roundedRect(barX, barY, barWidth, barH, 1.5, 1.5, 'F');

        // Label
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(...COLORS.textSecondary);
        doc.text(d.label, barX + barWidth / 2, y + height - 4, { align: 'center' });
    });

    return y + height + 6;
}

function drawFooter(doc: jsPDF, pageNum: number) {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textSecondary);
    doc.text('Petit Stay \u2014 Premium Hotel Childcare Infrastructure', 20, pageHeight - 10);
    doc.text(`Page ${pageNum}`, 190, pageHeight - 10, { align: 'right' });

    // Bottom gold accent
    doc.setFillColor(...COLORS.gold);
    doc.rect(0, pageHeight - 3, 210, 3, 'F');
}

// ----------------------------------------
// Main Generator
// ----------------------------------------
export function generateHotelMonthlyReport(data: HotelMonthlyReportData): Blob {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    let pageNum = 1;

    // ---- Page 1: Header + KPIs + Revenue Table ----
    drawHeader(doc, data.hotelName, data.month);

    // Executive Summary
    let y = 58;
    y = drawSectionTitle(doc, 'Executive Summary', y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.charcoal);
    const avgPerBooking = data.totalBookings > 0 ? Math.round(data.totalRevenue / data.totalBookings) : 0;
    const summaryText = `This report covers ${data.month} for ${data.hotelName}. During this period, ${data.totalBookings} childcare bookings were processed with a total revenue of ${formatCurrency(data.totalRevenue)} (avg. ${formatCurrency(avgPerBooking)}/booking). The completion rate stands at ${data.completionRate}%, with ${data.sitters.length} sitters on the roster. Service quality remains strong with a ${data.slaMetrics.fulfillmentRate}% fulfillment rate and ${data.slaMetrics.onTimeRate}% on-time delivery.`;
    const lines = doc.splitTextToSize(summaryText, 170);
    doc.text(lines, 20, y);
    y += lines.length * 4.5 + 8;

    // KPI Cards
    y = drawSectionTitle(doc, 'Key Performance Indicators', y);

    const cardWidth = 40;
    const gap = 3;
    const startX = 20;

    drawKpiCard(doc, startX, y, cardWidth, 'Total Revenue', formatCurrency(data.totalRevenue));
    drawKpiCard(doc, startX + cardWidth + gap, y, cardWidth, 'Total Bookings', String(data.totalBookings));
    drawKpiCard(doc, startX + (cardWidth + gap) * 2, y, cardWidth, 'Completion Rate', `${data.completionRate}%`);
    drawKpiCard(doc, startX + (cardWidth + gap) * 3, y, cardWidth, 'Avg / Booking', formatCurrency(data.totalBookings > 0 ? Math.round(data.totalRevenue / data.totalBookings) : 0));

    y += 34;

    // Revenue Chart
    y = drawSectionTitle(doc, 'Revenue Trend', y);
    y = drawRevenueChart(doc, 20, y, 170, 50, data.revenueData);
    y += 4;

    // Revenue Breakdown Table
    y = drawSectionTitle(doc, 'Revenue Breakdown', y);

    autoTable(doc, {
        startY: y,
        head: [['Period', 'Revenue', 'Bookings', 'Avg Revenue/Booking']],
        body: data.revenueData.map((d) => [
            d.label,
            formatCurrency(d.revenue),
            String(d.bookings),
            formatCurrency(d.avgRevenue),
        ]),
        foot: [['Total', formatCurrency(data.totalRevenue), String(data.totalBookings), formatCurrency(data.totalBookings > 0 ? Math.round(data.totalRevenue / data.totalBookings) : 0)]],
        theme: 'grid',
        headStyles: {
            fillColor: COLORS.charcoal,
            textColor: COLORS.white,
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 9,
            textColor: COLORS.charcoal,
        },
        footStyles: {
            fillColor: COLORS.cream,
            textColor: COLORS.charcoal,
            fontStyle: 'bold',
            fontSize: 9,
        },
        alternateRowStyles: {
            fillColor: [252, 250, 245],
        },
        margin: { left: 20, right: 20 },
    });

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

    // SLA Metrics
    y = drawSectionTitle(doc, 'SLA Metrics', y);

    autoTable(doc, {
        startY: y,
        head: [['Metric', 'Value', 'Status']],
        body: [
            ['Avg. Response Time', `${data.slaMetrics.avgResponseMinutes} min`, data.slaMetrics.avgResponseMinutes <= 10 ? 'OK' : 'Warning'],
            ['Fulfillment Rate', `${data.slaMetrics.fulfillmentRate}%`, data.slaMetrics.fulfillmentRate >= 95 ? 'OK' : 'Warning'],
            ['Cancellation Rate', `${data.slaMetrics.cancelRate}%`, data.slaMetrics.cancelRate <= 5 ? 'OK' : 'Warning'],
            ['Avg. Session Duration', `${data.slaMetrics.avgSessionDuration}h`, '-'],
            ['Repeat Booking Rate', `${data.slaMetrics.repeatBookingRate}%`, '-'],
            ['On-Time Rate', `${data.slaMetrics.onTimeRate}%`, data.slaMetrics.onTimeRate >= 95 ? 'OK' : 'Warning'],
        ],
        theme: 'grid',
        headStyles: {
            fillColor: COLORS.charcoal,
            textColor: COLORS.white,
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 9,
            textColor: COLORS.charcoal,
        },
        alternateRowStyles: {
            fillColor: [252, 250, 245],
        },
        margin: { left: 20, right: 20 },
        didParseCell(hookData) {
            if (hookData.section === 'body' && hookData.column.index === 2) {
                const val = hookData.cell.raw as string;
                if (val === 'OK') {
                    hookData.cell.styles.textColor = COLORS.success;
                    hookData.cell.styles.fontStyle = 'bold';
                } else if (val === 'Warning') {
                    hookData.cell.styles.textColor = COLORS.gold;
                    hookData.cell.styles.fontStyle = 'bold';
                }
            }
        },
    });

    drawFooter(doc, pageNum);

    // ---- Page 2: Sitter Performance ----
    doc.addPage();
    pageNum++;

    // Gold accent bar on new page
    doc.setFillColor(...COLORS.gold);
    doc.rect(0, 0, 210, 3, 'F');

    y = 18;
    y = drawSectionTitle(doc, 'Sitter Performance', y);

    if (data.sitters.length > 0) {
        autoTable(doc, {
            startY: y,
            head: [['Sitter', 'Tier', 'Rating', 'Sessions', 'Safety Days']],
            body: data.sitters.map((s) => [
                s.name,
                s.tier.toUpperCase(),
                s.rating.toFixed(1),
                String(s.sessions),
                `${s.safetyDays} days`,
            ]),
            theme: 'grid',
            headStyles: {
                fillColor: COLORS.charcoal,
                textColor: COLORS.white,
                fontStyle: 'bold',
                fontSize: 9,
            },
            bodyStyles: {
                fontSize: 9,
                textColor: COLORS.charcoal,
            },
            alternateRowStyles: {
                fillColor: [252, 250, 245],
            },
            margin: { left: 20, right: 20 },
            didParseCell(hookData) {
                if (hookData.section === 'body' && hookData.column.index === 1) {
                    const tier = hookData.cell.raw as string;
                    if (tier === 'GOLD') {
                        hookData.cell.styles.textColor = COLORS.gold;
                        hookData.cell.styles.fontStyle = 'bold';
                    }
                }
            },
        });
    } else {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.textSecondary);
        doc.text('No sitter data available for this period.', 20, y + 8);
    }

    // Safety & Compliance section
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? y + 16;
    y += 12;

    y = drawSectionTitle(doc, 'Safety & Compliance', y);

    const totalSafetyDays = data.sitters.length > 0
        ? Math.round(data.sitters.reduce((sum, s) => sum + s.safetyDays, 0) / data.sitters.length)
        : 0;
    const goldCount = data.sitters.filter(s => s.tier.toLowerCase() === 'gold').length;

    autoTable(doc, {
        startY: y,
        head: [['Metric', 'Value']],
        body: [
            ['Average Safety Days (incident-free)', `${totalSafetyDays} days`],
            ['Gold Tier Sitters', `${goldCount} / ${data.sitters.length}`],
            ['Fulfillment Rate', `${data.slaMetrics.fulfillmentRate}%`],
            ['On-Time Rate', `${data.slaMetrics.onTimeRate}%`],
            ['Cancellation Rate', `${data.slaMetrics.cancelRate}%`],
        ],
        theme: 'grid',
        headStyles: {
            fillColor: COLORS.success,
            textColor: COLORS.white,
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 9,
            textColor: COLORS.charcoal,
        },
        alternateRowStyles: {
            fillColor: [252, 250, 245],
        },
        margin: { left: 20, right: 20 },
    });

    drawFooter(doc, pageNum);

    return doc.output('blob');
}
