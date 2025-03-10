
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

import { dashboardService } from "@/services/DashboardService";

export interface ReportMetadata {
  id: number;
  name: string;
  type: 'excel' | 'pdf';
  date: string;
  path: string;
}

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(blob, `${fileName}.xlsx`);
};

export const exportToPDF = (data: any[], fileName: string, title: string): ReportMetadata => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  const headers = Object.keys(data[0]);
  const tableData = data.map(item => Object.values(item));
  
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 35,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { top: 30 }
  });
  
  doc.save(`${fileName}.pdf`);
  
  dashboardService.trackReport();
  dashboardService.addActivity('report', `Report generated: ${title}`);
  
  return {
    id: Date.now(),
    name: fileName,
    type: 'pdf',
    date: new Date().toISOString(),
    path: `${fileName}.pdf`
  };
};

export const generateMonthlyReport = (format: 'excel' | 'pdf'): ReportMetadata => {
  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  // Return empty report structure with current date
  const emptyData = [{ note: "No data available for this period" }];
  
  if (format === 'excel') {
    exportToExcel(emptyData, `Monthly_Report_${currentMonth}`);
    return {
      id: Date.now(),
      name: `Monthly_Report_${currentMonth}`,
      type: 'excel',
      date: new Date().toISOString(),
      path: `Monthly_Report_${currentMonth}.xlsx`
    };
  } else {
    return exportToPDF(emptyData, `Monthly_Report_${currentMonth}`, `Monthly Report - ${currentMonth}`);
  }
};

export const generateDailyReport = (format: 'excel' | 'pdf'): ReportMetadata => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString().replace(/\//g, '-');
  
  // Return empty report structure with current date
  const emptyData = [{ note: "No data available for this period" }];
  
  if (format === 'excel') {
    exportToExcel(emptyData, `Daily_Report_${formattedDate}`);
    return {
      id: Date.now(),
      name: `Daily_Report_${formattedDate}`,
      type: 'excel',
      date: new Date().toISOString(),
      path: `Daily_Report_${formattedDate}.xlsx`
    };
  } else {
    return exportToPDF(emptyData, `Daily_Report_${formattedDate}`, `Daily Report - ${formattedDate}`);
  }
};

export const generateCustomReport = (
  reportType: 'sales' | 'purchase' | 'inventory',
  format: 'excel' | 'pdf'
): ReportMetadata => {
  // Return empty report structure with current date
  const emptyData = [{ note: "No data available for this report type" }];
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString().replace(/\//g, '-');
  const reportName = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)}_Report_${formattedDate}`;
  
  if (format === 'excel') {
    exportToExcel(emptyData, reportName);
    return {
      id: Date.now(),
      name: reportName,
      type: 'excel',
      date: new Date().toISOString(),
      path: `${reportName}.xlsx`
    };
  } else {
    return exportToPDF(
      emptyData, 
      reportName,
      `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${formattedDate}`
    );
  }
};

export const generateReport = (data: any, type: string) => {
  dashboardService.trackReport();
  dashboardService.addActivity('report', `Report generated: ${type}`);
  
  if (type === 'excel') {
    exportToExcel(data, `Report_${type}`);
  } else {
    exportToPDF(data, `Report_${type}`, `Report - ${type}`);
  }
};
