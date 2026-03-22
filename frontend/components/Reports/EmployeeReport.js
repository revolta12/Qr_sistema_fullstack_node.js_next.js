import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../../utils/api';
import moment from 'moment';

const EmployeeReport = () => {
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    departamentu: '',
    posisaun: '',
    status_aktif: '',
    jeneru: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allEmployees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAll();
      
      if (response.data.success) {
        // Validasaun no kórreksaun dadus
        const validatedEmployees = response.data.data.map(emp => ({
          ...emp,
          data_moris: validateDate(emp.data_moris),
          data_rejistu: validateDate(emp.data_rejistu)
        }));
        
        setAllEmployees(validatedEmployees);
        setEmployees(validatedEmployees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funsaun validasaun data
  const validateDate = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    
    const date = new Date(dateString);
    const today = new Date();
    
    // Se data iha futuru, muda ba data ohin
    if (date > today) {
      console.warn(`Data invalidu iha futuru: ${dateString}, muda ba data ohin`);
      return today.toISOString().split('T')[0];
    }
    
    // Se data la validu, muda ba data default
    if (isNaN(date.getTime())) {
      console.warn(`Data invalidu: ${dateString}, muda ba data ohin`);
      return today.toISOString().split('T')[0];
    }
    
    return dateString;
  };

  const calculateAge = (dataMoris) => {
    if (!dataMoris) return 0;
    
    const birthDate = new Date(dataMoris);
    const today = new Date();
    
    // Verifika se data moris validu
    if (isNaN(birthDate.getTime()) || birthDate > today) {
      return 0;
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Idade mínimu 18 anu (aduldu)
    return Math.max(age, 18);
  };

  const calculateTenure = (dataRejistu) => {
    if (!dataRejistu) return '0 Loron';
    
    const startDate = new Date(dataRejistu);
    const today = new Date();
    
    // Verifika se data rejistu validu
    if (isNaN(startDate.getTime()) || startDate > today) {
      return '0 Loron';
    }
    
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} Loron`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} Fulan`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} Tinan${remainingMonths > 0 ? ` ${remainingMonths} Fulan` : ''}`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'La iha';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data Invalidu';
    
    return moment(date).format('DD/MM/YYYY');
  };

  const applyFilters = () => {
    let filteredData = [...allEmployees];

    if (filters.departamentu) {
      filteredData = filteredData.filter(emp => 
        emp.departamentu === filters.departamentu
      );
    }

    if (filters.posisaun) {
      filteredData = filteredData.filter(emp => 
        emp.posisaun === filters.posisaun
      );
    }

    if (filters.status_aktif) {
      filteredData = filteredData.filter(emp => 
        emp.status_aktif === (filters.status_aktif === 'true')
      );
    }

    if (filters.jeneru) {
      filteredData = filteredData.filter(emp => 
        emp.jeneru === filters.jeneru
      );
    }

    setEmployees(filteredData);
  };

  const getDepartments = () => {
    const departments = [...new Set(allEmployees.map(emp => emp.departamentu))];
    return departments.filter(dept => dept).sort();
  };

  const getPositions = () => {
    const positions = [...new Set(allEmployees.map(emp => emp.posisaun))];
    return positions.filter(pos => pos).sort();
  };

  const exportToPDF = () => {
    const printContent = document.getElementById('employee-report-content');
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const exportToExcel = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `relatoriu-funsionariu-${moment().format('YYYY-MM-DD')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSV = () => {
    const headers = [
      'Naran Funsionariu', 'Data Moris', 'Idade', 'Jeneru', 'Email', 
      'Telefone', 'Posisaun', 'Departamentu', 'Salariu Baziku', 
      'Data Rejistu', 'Tempo Servisu', 'Status', 'Alamat'
    ];
    
    const csvRows = [headers.join(',')];

    employees.forEach(emp => {
      const row = [
        `"${emp.naran_funsionario}"`,
        `"${formatDate(emp.data_moris)}"`,
        calculateAge(emp.data_moris),
        `"${emp.jeneru === 'M' ? 'Manee' : 'Feto'}"`,
        `"${emp.email}"`,
        `"${emp.no_telp}"`,
        `"${emp.posisaun}"`,
        `"${emp.departamentu}"`,
        `"${emp.salariu_baziku.toLocaleString('pt-TL')}"`,
        `"${formatDate(emp.data_rejistu)}"`,
        `"${calculateTenure(emp.data_rejistu)}"`,
        `"${emp.status_aktif ? 'Ativu' : 'La Ativu'}"`,
        `"${emp.alamat || 'La iha'}"`
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  };

  const calculateSummary = () => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status_aktif).length;
    const maleEmployees = employees.filter(emp => emp.jeneru === 'M').length;
    const femaleEmployees = employees.filter(emp => emp.jeneru === 'F').length;
    
    const totalSalary = employees.reduce((sum, emp) => sum + emp.salariu_baziku, 0);
    const avgSalary = totalEmployees > 0 ? totalSalary / totalEmployees : 0;

    const departments = [...new Set(employees.map(emp => emp.departamentu))];
    const positions = [...new Set(employees.map(emp => emp.posisaun))];

    return {
      totalEmployees,
      activeEmployees,
      maleEmployees,
      femaleEmployees,
      totalSalary,
      avgSalary: avgSalary.toLocaleString('pt-TL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalDepartments: departments.length,
      totalPositions: positions.length
    };
  };

  const clearFilters = () => {
    setFilters({
      departamentu: '',
      posisaun: '',
      status_aktif: '',
      jeneru: ''
    });
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatoriu Funsionariu</h1>
            <p className="text-gray-600">Analiza dadus funsionariu sira</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamentu
            </label>
            <select
              value={filters.departamentu}
              onChange={(e) => setFilters({ ...filters, departamentu: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Hotu-Hotu</option>
              {getDepartments().map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Posisaun
            </label>
            <select
              value={filters.posisaun}
              onChange={(e) => setFilters({ ...filters, posisaun: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Hotu-Hotu</option>
              {getPositions().map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status_aktif}
              onChange={(e) => setFilters({ ...filters, status_aktif: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Hotu-Hotu</option>
              <option value="true">Ativu</option>
              <option value="false">La Ativu</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jeneru
            </label>
            <select
              value={filters.jeneru}
              onChange={(e) => setFilters({ ...filters, jeneru: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Hotu-Hotu</option>
              <option value="M">Manee</option>
              <option value="F">Feto</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hamos Filtru
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{employees.length}</span> funsionariu hetan
            {filters.departamentu && <span> iha departamentu <strong>{filters.departamentu}</strong></span>}
            {filters.posisaun && <span>, posisaun <strong>{filters.posisaun}</strong></span>}
            {filters.status_aktif && <span>, status <strong>{filters.status_aktif === 'true' ? 'Ativu' : 'La Ativu'}</strong></span>}
            {filters.jeneru && <span>, jeneru <strong>{filters.jeneru === 'M' ? 'Manee' : 'Feto'}</strong></span>}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Funsionariu</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ativu</p>
              <p className="text-2xl font-bold text-gray-900">{summary.activeEmployees}</p>
              <p className="text-xs text-gray-500">
                ({Math.round((summary.activeEmployees / summary.totalEmployees) * 100)}%)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">👨‍💼</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Manee/Feto</p>
              <p className="text-2xl font-bold text-gray-900">{summary.maleEmployees}/{summary.femaleEmployees}</p>
              <p className="text-xs text-gray-500">
                {Math.round((summary.maleEmployees / summary.totalEmployees) * 100)}%/
                {Math.round((summary.femaleEmployees / summary.totalEmployees) * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 text-xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Média Salariu</p>
              <p className="text-2xl font-bold text-gray-900">${summary.avgSalary}</p>
              <p className="text-xs text-gray-500">
                Total: ${summary.totalSalary.toLocaleString('pt-TL')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Report Table */}
      <div id="employee-report-content" className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Lista Funsionariu
            </h3>
            <span className="text-sm text-gray-600">
              Total: <strong>{employees.length}</strong> funsionariu
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading relatoriu...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">La iha Funsionariu</h3>
            <p className="text-gray-500">La iha funsionariu rejistu iha sistema</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funsionariu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Informasaun Pessoal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posisaun
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salariu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Rejistu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id_funsionario} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-blue-600">
                            {employee.naran_funsionario?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.naran_funsionario || 'Naran La iha'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.email || 'Email La iha'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 space-y-1">
                        <div className="flex items-center">
                          <span className="text-gray-500 w-20">Moris:</span>
                          <span>{formatDate(employee.data_moris)}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-500 w-20">Idade:</span>
                          <span>{calculateAge(employee.data_moris)} Tinan</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-500 w-20">Jeneru:</span>
                          <span>{employee.jeneru === 'M' ? 'Manee' : employee.jeneru === 'F' ? 'Feto' : 'La iha'}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-500 w-20">Tel:</span>
                          <span>{employee.no_telp || 'La iha'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{employee.posisaun || 'La iha'}</div>
                        <div className="text-gray-500">{employee.departamentu || 'La iha'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${employee.salariu_baziku?.toLocaleString('pt-TL', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        }) || '0.00'}
                      </div>
                      <div className="text-gray-500 text-xs">
                        Baziku
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(employee.data_rejistu)}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {calculateTenure(employee.data_rejistu)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        employee.status_aktif 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.status_aktif ? '✅ Ativu' : '❌ La Ativu'}
                      </span>
                      {employee.alamat && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={employee.alamat}>
                          📍 {employee.alamat}
                        </div>
                      )}
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

export default EmployeeReport;