import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { fmt, pct, getMonthKey } from './format';
import { CATEGORIES, MONTHS_FR, SALARY, MAX_DEPENSES } from './constants';

export function generateReport({ expenses, savings, brvmInvests, dateFrom, dateTo }) {
  const doc = new jsPDF();
  const gold = [200, 169, 98];
  const dark = [11, 15, 26];
  const gray = [107, 114, 128];

  // Header
  doc.setFillColor(...dark);
  doc.rect(0, 0, 210, 45, 'F');
  doc.setTextColor(...gold);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Michel Arnaud Finance', 15, 22);
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text(`Rapport du ${dateFrom} au ${dateTo}`, 15, 32);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 15, 38);

  // Filter data by period
  const filteredExpenses = expenses.filter(e => e.date >= dateFrom && e.date <= dateTo);
  const filteredSavings = savings.filter(s => s.date >= dateFrom && s.date <= dateTo);
  const filteredBrvm = brvmInvests.filter(b => b.date >= dateFrom && b.date <= dateTo);

  const totalExp = filteredExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalSav = filteredSavings.reduce((s, e) => s + Number(e.amount), 0);
  const totalBrv = filteredBrvm.reduce((s, e) => s + Number(e.amount), 0);

  // Summary KPIs
  let y = 55;
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Résumé de la période', 15, y);
  y += 10;

  const kpis = [
    ['Total dépenses', fmt(totalExp), totalExp > 0 ? '#EF4444' : '#10B981'],
    ['Total épargne', fmt(totalSav), '#3B82F6'],
    ['Total investissement BRVM', fmt(totalBrv), '#F59E0B'],
    ['Transactions', `${filteredExpenses.length + filteredSavings.length + filteredBrvm.length}`, '#6B7280'],
  ];

  doc.autoTable({
    startY: y,
    head: [['Indicateur', 'Montant']],
    body: kpis.map(([label, value]) => [label, value]),
    theme: 'grid',
    headStyles: { fillColor: dark, textColor: gold, fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    margin: { left: 15, right: 15 },
  });

  // Expenses by category
  y = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Dépenses par catégorie', 15, y);
  y += 5;

  const catData = CATEGORIES.map(cat => {
    const total = filteredExpenses.filter(e => e.category === cat.id).reduce((s, e) => s + Number(e.amount), 0);
    return [cat.icon + ' ' + cat.label, fmt(total), pct(total, totalExp) + '%'];
  }).filter(([, , p]) => p !== '0%');

  if (catData.length > 0) {
    doc.autoTable({
      startY: y,
      head: [['Catégorie', 'Montant', '% du total']],
      body: [...catData, ['TOTAL', fmt(totalExp), '100%']],
      theme: 'grid',
      headStyles: { fillColor: dark, textColor: gold, fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'center' } },
      margin: { left: 15, right: 15 },
    });
  }

  // Expense details
  if (filteredExpenses.length > 0) {
    y = doc.lastAutoTable.finalY + 15;
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Détail des dépenses', 15, y);
    y += 5;

    doc.autoTable({
      startY: y,
      head: [['Date', 'Catégorie', 'Montant', 'Note']],
      body: filteredExpenses.map(e => {
        const cat = CATEGORIES.find(c => c.id === e.category);
        return [e.date, cat?.label || e.category, fmt(e.amount), e.note || '—'];
      }),
      theme: 'striped',
      headStyles: { fillColor: dark, textColor: gold, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 2: { halign: 'right' } },
      margin: { left: 15, right: 15 },
    });
  }

  // Savings details
  if (filteredSavings.length > 0) {
    y = doc.lastAutoTable.finalY + 15;
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Détail des versements épargne', 15, y);
    y += 5;

    doc.autoTable({
      startY: y,
      head: [['Date', 'Objectif', 'Montant', 'Note']],
      body: filteredSavings.map(s => [s.date, s.goal || '—', fmt(s.amount), s.note || '—']),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 2: { halign: 'right' } },
      margin: { left: 15, right: 15 },
    });
  }

  // BRVM details
  if (filteredBrvm.length > 0) {
    y = doc.lastAutoTable.finalY + 15;
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Détail des investissements BRVM', 15, y);
    y += 5;

    doc.autoTable({
      startY: y,
      head: [['Date', 'Ticker', 'Montant', 'Note']],
      body: filteredBrvm.map(b => [b.date, b.ticker || '—', fmt(b.amount), b.note || '—']),
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: dark, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 2: { halign: 'right' } },
      margin: { left: 15, right: 15 },
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text(`Michel Arnaud Finance — Page ${i}/${pageCount}`, 105, 290, { align: 'center' });
  }

  doc.save(`empire-finance-rapport-${dateFrom}-${dateTo}.pdf`);
}
