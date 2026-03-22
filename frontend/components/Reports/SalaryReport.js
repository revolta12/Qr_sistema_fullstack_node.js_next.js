import React, { useState, useEffect } from 'react';
import { salaryAPI } from '../../utils/api';
import { MONTHS } from '../../utils/constants';
import * as XLSX from 'xlsx';

const SalaryReport = () => {
  const [reportData, setReportData] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    try {
      setLoading(true);
      
      const response = await salaryAPI.getAll(month, year);
      
      if (response.data.success) {
        setReportData(response.data.data);
        
        // Calculate statistics
        const salaryStats = calculateStatistics(response.data.data);
        setStats(salaryStats);
      }
    } catch (error) {
      console.error('Error generating salary report:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data) => {
    if (data.length === 0) return null;

    const totals = data.reduce((acc, item) => ({
      totalSalary: acc.totalSalary + parseFloat(item.gaji_final),
      totalDeductions: acc.totalDeductions + parseFloat(item.potongan),
      totalBonus: acc.totalBonus + parseFloat(item.bonus),
      paidCount: acc.paidCount + (item.status === 'dibayar' ? 1 : 0),
      pendingCount: acc.pendingCount + (item.status === 'pending' ? 1 : 0)
    }), {
      totalSalary: 0,
      totalDeductions: 0,
      totalBonus: 0,
      paidCount: 0,
      pendingCount: 0
    });

    return {
      ...totals,
      averageSalary: totals.totalSalary / data.length,
      paymentRate: (totals.paidCount / data.length) * 100
    };
  };

  const handleFilterChange = () => {
    generateReport();
  };

  // 🔥 NEW: Export to Excel Function
  const exportToExcel = async () => {
    try {
      setExportingExcel(true);
      
      // Prepare data for Excel
      const excelData = reportData.map((item, index) => ({
        'No': index + 1,
        'Naran Funsionario': item.naran_funsionario,
        'Posisaun': item.posisaun,
        'Departamentu': item.departamentu || '-',
        'Salariu Baziku ($)': parseFloat(item.salariu_baziku),
        'Total Hadir (Dia)': item.total_prezente,
        'Total Terlambat (Dia)': item.total_tatraza,
        'Potongan ($)': parseFloat(item.potongan),
        'Bonus ($)': parseFloat(item.bonus),
        'Gaji Final ($)': parseFloat(item.gaji_final),
        'Status': item.status === 'dibayar' ? 'Ona Selu' : 'Prosesu'
      }));

      // Add summary row
      if (stats) {
        excelData.push(
          {},
          {
            'No': 'TOTAL',
            'Naran Funsionario': 'RESUMU JERÁL',
            'Salariu Baziku ($)': stats.totalSalary + stats.totalDeductions - stats.totalBonus,
            'Potongan ($)': -stats.totalDeductions,
            'Bonus ($)': stats.totalBonus,
            'Gaji Final ($)': stats.totalSalary
          },
          {
            'No': 'STATISTIKA',
            'Naran Funsionario': `Ona Selu: ${stats.paidCount} (${Math.round(stats.paymentRate)}%)`,
            'Posisaun': `Prosesu: ${stats.pendingCount}`
          }
        );
      }

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData, { skipHeader: false });

      // Style the header row
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F46E5" } },
        alignment: { horizontal: "center" }
      };

      // Set column widths
      const colWidths = [
        { wch: 5 },  // No
        { wch: 25 }, // Naran Funsionario
        { wch: 20 }, // Posisaun
        { wch: 15 }, // Departamentu
        { wch: 15 }, // Salariu Baziku
        { wch: 12 }, // Total Hadir
        { wch: 15 }, // Total Terlambat
        { wch: 12 }, // Potongan
        { wch: 12 }, // Bonus
        { wch: 15 }, // Gaji Final
        { wch: 12 }  // Status
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, `Gaji_${MONTHS[month-1]}_${year}`);

      // Create second sheet for statistics
      const statsData = [
        ['RESUMU GAJI - SISTEMA ABSENSI QR'],
        [`Periodu: ${MONTHS[month-1]} ${year}`],
        [''],
        ['STATISTIKA JERÁL', 'VALOR'],
        ['Total Funsionariu', reportData.length],
        ['Total Gaji ($)', stats?.totalSalary || 0],
        ['Total Potongan ($)', stats?.totalDeductions || 0],
        ['Total Bonus ($)', stats?.totalBonus || 0],
        ['Ona Selu', stats?.paidCount || 0],
        ['Prosesu', stats?.pendingCount || 0],
        ['Persentase Ona Selu', `${Math.round(stats?.paymentRate || 0)}%`],
        ['Média Gaji ($)', stats?.averageSalary || 0],
        [''],
        ['Generated on:', new Date().toLocaleDateString('id-ID')]
      ];

      const ws2 = XLSX.utils.aoa_to_sheet(statsData);
      ws2['!cols'] = [{ wch: 25 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws2, 'Statistika');

      // Generate file and download
      const fileName = `Relatoriu_Gaji_${MONTHS[month-1]}_${year}.xlsx`;
      XLSX.writeFile(wb, fileName);

      console.log('✅ Excel file exported successfully');

    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Erro durante exporta relatoriu Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  // 🔥 NEW: Export to CSV (Alternative)
  const exportToCSV = () => {
    try {
      const csvData = reportData.map(item => ({
        'Naran Funsionario': item.naran_funsionario,
        'Posisaun': item.posisaun,
        'Salariu Baziku': item.salariu_baziku,
        'Total Hadir': item.total_prezente,
        'Total Terlambat': item.total_tatraza,
        'Potongan': item.potongan,
        'Bonus': item.bonus,
        'Gaji Final': item.gaji_final,
        'Status': item.status
      }));

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => 
            `"${row[header] || ''}"`
          ).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `Relatoriu_Gaji_${MONTHS[month-1]}_${year}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Erro durante exporta CSV');
    }
  };

  const exportToPDF = async () => {
    try {
      setExporting(true);
      
      const printWindow = window.open('', '_blank');
      const reportTitle = `Relatoriu Gaji - ${MONTHS[month-1]} ${year}`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .header h1 { margin: 0; color: #333; }
            .header .subtitle { color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .total-row { background-color: #e9ecef; font-weight: bold; }
            .status-paid { color: green; }
            .status-pending { color: orange; }
            .footer { margin-top: 30px; text-align: right; font-size: 12px; color: #666; }
            .summary { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
            .summary-item { text-align: center; }
            .summary-value { font-size: 24px; font-weight: bold; margin: 5px 0; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportTitle}</h1>
            <div class="subtitle">Generated on: ${new Date().toLocaleDateString('id-ID')}</div>
          </div>
          
          ${stats ? `
          <div class="summary">
            <h3>Resumu Jerál</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <div>Total Gaji</div>
                <div class="summary-value">${formatCurrency(stats.totalSalary)}</div>
              </div>
              <div class="summary-item">
                <div>Total Potongan</div>
                <div class="summary-value">${formatCurrency(stats.totalDeductions)}</div>
              </div>
              <div class="summary-item">
                <div>Ona Selu</div>
                <div class="summary-value">${stats.paidCount}</div>
              </div>
              <div class="summary-item">
                <div>Prosesu</div>
                <div class="summary-value">${stats.pendingCount}</div>
              </div>
            </div>
          </div>
          ` : ''}
          
          <table>
            <thead>
              <tr>
                <th>Naran Funsionario</th>
                <th>Posisaun</th>
                <th>Salariu Baziku</th>
                <th>Total Hadir</th>
                <th>Potongan</th>
                <th>Bonus</th>
                <th>Gaji Final</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.map(item => `
                <tr>
                  <td>${item.naran_funsionario}</td>
                  <td>${item.posisaun}</td>
                  <td>${formatCurrency(item.salariu_baziku)}</td>
                  <td>${item.total_prezente}</td>
                  <td style="color: red;">-${formatCurrency(item.potongan)}</td>
                  <td style="color: green;">+${formatCurrency(item.bonus)}</td>
                  <td><strong>${formatCurrency(item.gaji_final)}</strong></td>
                  <td class="${item.status === 'dibayar' ? 'status-paid' : 'status-pending'}">
                    ${item.status === 'dibayar' ? '✅ Ona Selu' : '⏰ Prosesu'}
                  </td>
                </tr>
              `).join('')}
              ${generateSummaryRow()}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Sistema Absensi QR - Relatoriu Gaji</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Erro durante exporta relatoriu');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const generateSummaryRow = () => {
    if (reportData.length === 0) return '';

    const totals = reportData.reduce((acc, item) => ({
      baseSalary: acc.baseSalary + parseFloat(item.salariu_baziku),
      deductions: acc.deductions + parseFloat(item.potongan),
      bonus: acc.bonus + parseFloat(item.bonus),
      final: acc.final + parseFloat(item.gaji_final)
    }), { baseSalary: 0, deductions: 0, bonus: 0, final: 0 });

    return `
      <tr class="total-row">
        <td colspan="2"><strong>Total Jerál</strong></td>
        <td><strong>${formatCurrency(totals.baseSalary)}</strong></td>
        <td></td>
        <td><strong>-${formatCurrency(totals.deductions)}</strong></td>
        <td><strong>+${formatCurrency(totals.bonus)}</strong></td>
        <td><strong>${formatCurrency(totals.final)}</strong></td>
        <td></td>
      </tr>
    `;
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="space-y-6">
      {/* Report Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtru Relatoriu Gaji</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fulan
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MONTHS.map((monthName, index) => (
                <option key={index + 1} value={index + 1}>
                  {monthName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tinan
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={handleFilterChange}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Generando...' : 'Hili'}
            </button>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t">
          <button
            onClick={exportToExcel}
            disabled={exportingExcel || reportData.length === 0}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {exportingExcel ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Exportando...
              </>
            ) : (
              <>
                <span className="mr-2">📊</span>
                Exporta Excel
              </>
            )}
          </button>

          <button
            onClick={exportToPDF}
            disabled={exporting || reportData.length === 0}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-100 border border-transparent rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                Exportando...
              </>
            ) : (
              <>
                <span className="mr-2">📄</span>
                Exporta PDF
              </>
            )}
          </button>

          <button
            onClick={exportToCSV}
            disabled={reportData.length === 0}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-purple-600 bg-purple-100 border border-transparent rounded-lg hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            <span className="mr-2">📋</span>
            Exporta CSV
          </button>
        </div>
      </div>

      {/* Statistics Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm font-medium text-gray-600">Total Gaji</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalSalary)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm font-medium text-gray-600">Total Potongan</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalDeductions)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm font-medium text-gray-600">Ona Selu</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.paidCount} (${Math.round(stats.paymentRate)}%)
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm font-medium text-gray-600">Prosesu</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pendingCount}
            </p>
          </div>
        </div>
      )}

      {/* Report Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Detallu Relatoriu Gaji - {MONTHS[month-1]} {year}
            </h3>
            <span className="text-sm text-gray-500">
              Total: {reportData.length} Funsionariu
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Generando relatoriu...</p>
          </div>
        ) : reportData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1m6-13a2 2 0 11-4 0 2 2 0 014 0zM4 13a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">La iha Dadus Gaji</h3>
            <p className="text-gray-500">
              La iha dadus gaji ba fulan hirak ne'e
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funsionario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posisaun
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salariu Baziku
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hadir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Potongan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bonus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gaji Final
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.naran_funsionario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.posisaun}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.salariu_baziku)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {item.total_prezente}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      -{formatCurrency(item.potongan)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      +{formatCurrency(item.bonus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatCurrency(item.gaji_final)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'dibayar' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status === 'dibayar' ? 'Ona Selu' : 'Prosesu'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryReport;