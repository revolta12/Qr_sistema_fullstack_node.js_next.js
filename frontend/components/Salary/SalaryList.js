import React, { useState } from 'react';
import { MONTHS } from '../../utils/constants';

const SalaryList = ({ salaries, loading, onStatusUpdate, onDateChange }) => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const handleStatusUpdate = async (salaryId, newStatus) => {
    if (window.confirm(`Ita boot hakarak altera status gaji ba "${newStatus}"?`)) {
      await onStatusUpdate(salaryId, newStatus);
    }
  };

  const handleDateSubmit = (e) => {
    e.preventDefault();
    onDateChange(month, year);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="animate-pulse">
          <div className="border-b border-gray-200 p-4 bg-gray-50">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <form onSubmit={handleDateSubmit} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-end">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Hili
          </button>
        </form>
      </div>

      {/* Salary List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Lista Gaji ({salaries.length})
          </h3>
        </div>

        {salaries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1m6-13a2 2 0 11-4 0 2 2 0 014 0zM4 13a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">La iha Dadus Gaji</h3>
            <p className="text-gray-500">
              La iha rejistu gaji iha fulan hirak ne'e
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {salaries.map((salary) => (
              <div key={salary.id_gaji} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {salary.naran_funsionario}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {salary.posisaun} • {salary.departamentu}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(salary.gaji_final)}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        salary.status === 'dibayar' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {salary.status === 'dibayar' ? 'Ona Selu' : 'Prosesu'}
                      </span>
                      
                      {salary.status === 'pending' ? (
                        <button
                          onClick={() => handleStatusUpdate(salary.id_gaji, 'dibayar')}
                          className="text-xs text-green-600 hover:text-green-800 font-medium"
                        >
                          Marka hanesan Selu
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusUpdate(salary.id_gaji, 'pending')}
                          className="text-xs text-yellow-600 hover:text-yellow-800 font-medium"
                        >
                          Marka hanesan Prosesu
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Salary Details */}
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Salariu Baziku</p>
                    <p className="font-medium">{formatCurrency(salary.salariu_baziku)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Hadir</p>
                    <p className="font-medium">{salary.total_prezente} dia</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Potongan</p>
                    <p className="font-medium text-red-600">-{formatCurrency(salary.potongan)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Bonus</p>
                    <p className="font-medium text-green-600">+{formatCurrency(salary.bonus)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryList;