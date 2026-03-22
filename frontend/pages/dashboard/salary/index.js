import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/Layout/DashboardLayout';
import SalaryCalculator from '../../../components/Salary/SalaryCalculator';
import SalaryList from '../../../components/Salary/SalaryList';
import { salaryAPI } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';

const Salary = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchSalaries();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchSalaries = async (month = null, year = null) => {
    try {
      setLoading(true);
      const currentMonth = month || selectedPeriod.month;
      const currentYear = year || selectedPeriod.year;

      const response = await salaryAPI.getAll(currentMonth, currentYear);
      
      if (response.data.success) {
        setSalaries(response.data.data);
      }
    } catch (error) {
      setError('Erro durante loading lista gaji');
      console.error('Salary fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (data, calculateAll = false) => {
    try {
      setCalculating(true);
      setError('');
      setSuccess('');

      let response;
      if (calculateAll) {
        response = await salaryAPI.calculateAll(data);
      } else {
        response = await salaryAPI.calculate(data);
      }

      if (response.data.success) {
        setSuccess(response.data.message);
        setSelectedPeriod({ month: data.fulan, year: data.tinan });
        await fetchSalaries(data.fulan, data.tinan);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erro durante kalkulasaun gaji');
    } finally {
      setCalculating(false);
    }
  };

  const handleStatusUpdate = async (salaryId, newStatus) => {
    try {
      await salaryAPI.updateStatus(salaryId, newStatus);
      setSuccess('Status gaji atualiza ho susesu');
      fetchSalaries();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro durante atualiza status gaji');
    }
  };

  const handleDateChange = (month, year) => {
    setSelectedPeriod({ month, year });
    fetchSalaries(month, year);
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Calculate statistics
  const stats = {
    totalSalary: salaries.reduce((sum, salary) => sum + parseFloat(salary.gaji_final || 0), 0),
    totalDeductions: salaries.reduce((sum, salary) => sum + parseFloat(salary.potongan || 0), 0),
    paidCount: salaries.filter(s => s.status === 'dibayar').length,
    pendingCount: salaries.filter(s => s.status === 'pending').length,
    totalEmployees: salaries.length
  };

  const getMonthName = (month) => {
    const months = [
      'Janeiru', 'Fevereiru', 'Marsu', 'Abril', 'Maiu', 'Juñu',
      'Jullu', 'Agustu', 'Setembru', 'Outubru', 'Novembru', 'Dezembru'
    ];
    return months[month - 1] || '';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Jere Gaji">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
              Sistema Gaji
            </h1>
            <p className="text-gray-600 mt-2">Kalkula no jere pagamentu gaji funsionariu</p>
          </div>
          
          <div className="flex items-center space-x-3 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3">
            <span className="text-lg">📅</span>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {getMonthName(selectedPeriod.month)} {selectedPeriod.year}
              </p>
              <p className="text-xs text-gray-500">Periodu Atual</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 animate-fade-in">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              !
            </div>
            <span className="ml-3 text-red-800 font-medium">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 animate-fade-in">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">
              ✓
            </div>
            <span className="ml-3 text-emerald-800 font-medium">{success}</span>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Gaji</p>
              <p className="text-xl font-bold mt-1">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'USD'
                }).format(stats.totalSalary)}
              </p>
            </div>
            <span className="text-2xl">💰</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Potongan</p>
              <p className="text-xl font-bold mt-1">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'USD'
                }).format(stats.totalDeductions)}
              </p>
            </div>
            <span className="text-2xl">📉</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Ona Selu</p>
              <p className="text-2xl font-bold mt-1">{stats.paidCount}</p>
            </div>
            <span className="text-2xl">✅</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Prosesu</p>
              <p className="text-2xl font-bold mt-1">{stats.pendingCount}</p>
            </div>
            <span className="text-2xl">⏳</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Funsionariu</p>
              <p className="text-2xl font-bold mt-1">{stats.totalEmployees}</p>
            </div>
            <span className="text-2xl">👥</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Calculator Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
              <h3 className="text-lg font-bold text-white flex items-center">
                <span className="mr-2 text-xl">🧮</span>
                Kalkuladora Gaji
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                Kalkula gaji individual ka hotu-hotu
              </p>
            </div>
            <div className="p-6">
              <SalaryCalculator 
                onCalculate={handleCalculate}
                loading={calculating}
                currentPeriod={selectedPeriod}
              />
            </div>
          </div>

          {/* Quick Stats */}
          {salaries.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📈</span>
                Resumu Gaji
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Gaji Média:</span>
                  <span className="font-semibold text-gray-900">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(stats.totalSalary / (stats.totalEmployees || 1))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa Selu:</span>
                  <span className="font-semibold text-emerald-600">
                    {Math.round((stats.paidCount / (stats.totalEmployees || 1)) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Média Potongan:</span>
                  <span className="font-semibold text-rose-600">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(stats.totalDeductions / (stats.totalEmployees || 1))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Salary List */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Lista Gaji
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {salaries.length} funsionariu iha periodu {getMonthName(selectedPeriod.month)} {selectedPeriod.year}
                  </p>
                </div>
                <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Dibayar</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Pending</span>
                  </div>
                </div>
              </div>
            </div>

            <SalaryList
              salaries={salaries}
              loading={loading}
              onStatusUpdate={handleStatusUpdate}
              onDateChange={handleDateChange}
              currentPeriod={selectedPeriod}
            />
          </div>
        </div>
      </div>

      {/* Additional Features */}
      {salaries.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white mr-3">
                💰
              </div>
              <h4 className="font-semibold text-gray-900">Total Pagamentu</h4>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'USD'
              }).format(stats.totalSalary)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total gaji ne'ebé tenke selu</p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white mr-3">
                ✅
              </div>
              <h4 className="font-semibold text-gray-900">Selesa Ona</h4>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.paidCount}</p>
            <p className="text-sm text-gray-600 mt-1">Funsionariu sira ne'ebé ona selu</p>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-yellow-100 rounded-2xl p-6 border border-amber-200">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white mr-3">
                ⚡
              </div>
              <h4 className="font-semibold text-gray-900">Efisiénsia</h4>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {Math.round((stats.paidCount / (stats.totalEmployees || 1)) * 100)}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Taxa prosesu gaji</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Salary;