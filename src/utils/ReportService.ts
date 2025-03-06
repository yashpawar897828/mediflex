
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Sample data for reports
export const getSampleData = (type: string) => {
  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();

  if (type === 'sales') {
    return Array(30).fill(0).map((_, i) => ({
      id: i + 1,
      date: new Date(today.getFullYear(), today.getMonth(), i + 1).toLocaleDateString(),
      product: `Medicine ${(i % 10) + 1}`,
      customer: `Customer ${(i % 8) + 1}`,
      quantity: Math.floor(Math.random() * 10) + 1,
      price: Math.floor(Math.random() * 100) + 50,
      total: (Math.floor(Math.random() * 10) + 1) * (Math.floor(Math.random() * 100) + 50),
    }));
  }

  if (type === 'purchase') {
    return Array(20).fill(0).map((_, i) => ({
      id: i + 1,
      date: new Date(today.getFullYear(), today.getMonth(), i + 1).toLocaleDateString(),
      product: `Medicine ${(i % 15) + 1}`,
      supplier: `Supplier ${(i % 5) + 1}`,
      quantity: Math.floor(Math.random() * 50) + 10,
      price: Math.floor(Math.random() * 80) + 20,
      total: (Math.floor(Math.random() * 50) + 10) * (Math.floor(Math.random() * 80) + 20),
    }));
  }

  if (type === 'inventory') {
    return Array(25).fill(0).map((_, i) => ({
      id: i + 1,
      product: `Medicine ${(i % 20) + 1}`,
      category: `Category ${(i % 5) + 1}`,
      stock: Math.floor(Math.random() * 100) + 5,
      reorderLevel: 10,
      expiryDate: new Date(today.getFullYear(), today.getMonth() + Math.floor(Math.random() * 12), 
                          Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
      supplier: `Supplier ${(i % 5) + 1}`,
    }));
  }

  // Default monthly summary data
  return Array(12).fill(0).map((_, i) => {
    const month = new Date(currentYear, i, 1).toLocaleString('default', { month: 'long' });
    return {
      month,
      salesAmount: Math.floor(Math.random() * 10000) + 5000,
      purchaseAmount: Math.floor(Math.random() * 8000) + 3000,
      profit: Math.floor(Math.random() * 3000) + 1000,
      newCustomers: Math.floor(Math.random() * 50) + 10,
    };
  });
};

// Export to Excel
export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save file
  saveAs(blob, `${fileName}.xlsx`);
};

// Export to PDF
export const exportToPDF = (data: any[], fileName: string, title: string) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Get column headers from first data item
  const headers = Object.keys(data[0]);
  const tableData = data.map(item => Object.values(item));
  
  // @ts-ignore - jspdf-autotable is not fully typed
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: 35,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { top: 30 }
  });
  
  // Save file
  doc.save(`${fileName}.pdf`);
};

// Generate monthly report
export const generateMonthlyReport = (format: 'excel' | 'pdf') => {
  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const data = getSampleData('sales');
  
  if (format === 'excel') {
    exportToExcel(data, `Monthly_Report_${currentMonth}`);
  } else {
    exportToPDF(data, `Monthly_Report_${currentMonth}`, `Monthly Report - ${currentMonth}`);
  }
};

// Generate daily report
export const generateDailyReport = (format: 'excel' | 'pdf') => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString().replace(/\//g, '-');
  
  // Use sales data type which has date property for daily reports
  const data = getSampleData('sales').filter(item => {
    // Make sure the item has a date property before trying to access it
    if ('date' in item) {
      return new Date(item.date).toDateString() === today.toDateString();
    }
    return false;
  });
  
  if (format === 'excel') {
    exportToExcel(data, `Daily_Report_${formattedDate}`);
  } else {
    exportToPDF(data, `Daily_Report_${formattedDate}`, `Daily Report - ${formattedDate}`);
  }
};

// Generate custom report based on type
export const generateCustomReport = (
  reportType: 'sales' | 'purchase' | 'inventory',
  format: 'excel' | 'pdf'
) => {
  const data = getSampleData(reportType);
  const today = new Date();
  const formattedDate = today.toLocaleDateString().replace(/\//g, '-');
  
  if (format === 'excel') {
    exportToExcel(data, `${reportType.charAt(0).toUpperCase() + reportType.slice(1)}_Report_${formattedDate}`);
  } else {
    exportToPDF(
      data, 
      `${reportType.charAt(0).toUpperCase() + reportType.slice(1)}_Report_${formattedDate}`,
      `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${formattedDate}`
    );
  }
};
