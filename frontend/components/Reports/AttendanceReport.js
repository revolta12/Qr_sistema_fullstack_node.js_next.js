import React, { useState, useEffect } from 'react';
import { attendanceAPI, employeeAPI } from '../../utils/api';
import { MONTHS, ATTENDANCE_STATUS_LABELS } from '../../utils/constants';
import moment from 'moment';

const AttendanceReport = () => {
  const [reportData, setReportData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchEmployees();
    generateReport();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      
      // Get monthly summary
      const summaryResponse = await attendanceAPI.getMonthlySummary(month, year);
      
      if (summaryResponse.data.success) {
        setReportData(summaryResponse.data.data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    generateReport();
  };

  const exportToPDF = async () => {
    try {
      setExporting(true);
      
      // Simple PDF export using window.print with custom styles
      const printWindow = window.open('', '_blank');
      const reportTitle = `Relatoriu Absensi - ${MONTHS[month-1]} ${year}`;
      
      const filteredData = selectedEmployee === 'all' 
        ? reportData 
        : reportData.filter(item => item.id_funsionario === parseInt(selectedEmployee));

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
            .footer { margin-top: 30px; text-align: right; font-size: 12px; color: #666; }
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
          
          <table>
            <thead>
              <tr>
                <th>Naran Funsionario</th>
                <th>Posisaun</th>
                <th>Departamentu</th>
                <th>Total Presente</th>
                <th>Total Atraza</th>
                <th>Total Lisensa</th>
                <th>Total Moras</th>
                <th>Persentase Presente</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(item => `
                <tr>
                  <td>${item.naran_funsionario}</td>
                  <td>${item.posisaun}</td>
                  <td>${item.departamentu}</td>
                  <td>${item.total_Presente || 0}</td>
                  <td>${item.total_Atraza || 0}</td>
                  <td>${item.total_Lisensa || 0}</td>
                  <td>${item.total_Moras || 0}</td>
                  <td>${calculateAttendanceRate(item)}%</td>
                </tr>
              `).join('')}
              ${generateSummaryRow(filteredData)}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Sistema Absensi QR - Relatoriu Jerál</p>
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

  const calculateAttendanceRate = (item) => {
    const totalDays = item.total_Presente + item.total_Atraza + item.total_Lisensa + item.total_Moras;
    return totalDays > 0 ? Math.round((item.total_Presente / totalDays) * 100) : 0;
  };

  const generateSummaryRow = (data) => {
    const totals = data.reduce((acc, item) => ({
      Presente: acc.Presente + (item.total_Presente || 0),
      Atraza: acc.Atraza + (item.total_Atraza || 0),
      Lisensa: acc.Lisensa + (item.total_Lisensa || 0),
      Moras: acc.Moras + (item.total_Moras || 0)
    }), { Presente: 0, Atraza: 0, Lisensa: 0, Moras: 0 });

    return `
      <tr class="total-row">
        <td colspan="3"><strong>Total Jerál</strong></td>
        <td><strong>${totals.Presente}</strong></td>
        <td><strong>${totals.Atraza}</strong></td>
        <td><strong>${totals.Lisensa}</strong></td>
        <td><strong>${totals.Moras}</strong></td>
        <td><strong>${Math.round((totals.Presente / (totals.Presente + totals.Atraza + totals.Lisensa + totals.Moras)) * 100) || 0}%</strong></td>
      </tr>
    `;
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="space-y-6">
      {/* Report Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtru Relatoriu</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Funsionario
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Hotu-Hotu</option>
              {employees.map(employee => (
                <option key={employee.id_funsionario} value={employee.id_funsionario}>
                  {employee.naran_funsionario}
                </option>
              ))}
            </select>
          </div>

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

          <div className="flex items-end space-x-3">
            <button
              onClick={handleFilterChange}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Generando...' : 'Hili'}
            </button>
            
            <button
              onClick={exportToPDF}
              disabled={exporting || reportData.length === 0}
              className="flex-1 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-transparent rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {exporting ? 'Exportando...' : 'Exporta PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Summary Cards */}
      {reportData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm font-medium text-gray-600">Total Funsionariu</p>
            <p className="text-2xl font-bold text-gray-900">{reportData.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm font-medium text-gray-600">Média Presente</p>
            <p className="text-2xl font-bold text-green-600">
              {Math.round(reportData.reduce((sum, item) => sum + (item.total_Presente || 0), 0) / reportData.length)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm font-medium text-gray-600">Total Atraza</p>
            <p className="text-2xl font-bold text-yellow-600">
              {reportData.reduce((sum, item) => sum + (item.total_Atraza || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm font-medium text-gray-600">Média Persentase</p>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(reportData.reduce((sum, item) => {
                const totalDays = (item.total_Presente || 0) + (item.total_Atraza || 0) + (item.total_Lisensa || 0) + (item.total_Moras || 0);
                return totalDays > 0 ? sum + ((item.total_Presente || 0) / totalDays) * 100 : sum;
              }, 0) / reportData.length)}%
            </p>
          </div>
        </div>
      )}

      {/* Report Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Detallu Relatoriu Absensi - {MONTHS[month-1]} {year}
          </h3>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">La iha Dadus</h3>
            <p className="text-gray-500">
              La iha dadus absensi ba periodu ida ne'e
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
                    Departamentu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Presente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Atraza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lisensa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Moras
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Persentase
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.departamentu}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {item.total_Presente || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {item.total_Atraza || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.total_Lisensa || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {item.total_Moras || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        calculateAttendanceRate(item) >= 90 
                          ? 'bg-green-100 text-green-800'
                          : calculateAttendanceRate(item) >= 80
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {calculateAttendanceRate(item)}%
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

export default AttendanceReport;