import React, { useState, useEffect } from 'react';
import { employeeAPI, salaryAPI } from '../../utils/api';
import { MONTHS } from '../../utils/constants';

const SalaryCalculator = ({ onCalculate, loading }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [employeeLoading, setEmployeeLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setEmployeeLoading(true);
      const response = await employeeAPI.getAll();
      
      if (response.data.success) {
        // Filter only active employees
        const activeEmployees = response.data.data.filter(emp => emp.status_aktif);
        setEmployees(activeEmployees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setEmployeeLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedEmployee) {
      alert('Favor hili funsionario');
      return;
    }

    onCalculate({
      id_funsionario: selectedEmployee,
      fulan: parseInt(month),
      tinan: parseInt(year)
    });
  };

  const handleCalculateAll = () => {
    onCalculate({
      fulan: parseInt(month),
      tinan: parseInt(year)
    }, true);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  if (employeeLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Kalkula Gaji</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Funsionario
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Hili Funsionario</option>
            {employees.map(employee => (
              <option key={employee.id_funsionario} value={employee.id_funsionario}>
                {employee.naran_funsionario} - {employee.posisaun}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading || !selectedEmployee}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Kalkulando...' : 'Kalkula Gaji'}
          </button>
          
          <button
            type="button"
            onClick={handleCalculateAll}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-transparent rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? 'Kalkulando...' : 'Kalkula Hotu'}
          </button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Nota:</strong> Kalkulasaun gaji inklui:
        </p>
        <ul className="text-sm text-blue-600 mt-1 list-disc list-inside">
          <li>Salariu baziku</li>
          <li>Potongan ba terlambat ($5/dia)</li>
          <li>Potongan ba absent ($20/dia)</li>
          <li>Bonus overtime (se iha)</li>
        </ul>
      </div>
    </div>
  );
};

export default SalaryCalculator;