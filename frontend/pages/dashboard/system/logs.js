import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/Layout/DashboardLayout';
import { systemLogsAPI } from '../../../utils/api';
import moment from 'moment';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    nivel: '',
    modulo: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await systemLogsAPI.getAll(filters);
      
      if (response.data.success) {
        setLogs(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (window.confirm('Ita boot hakarak hamoos hotu-hotu log sistema?')) {
      try {
        await systemLogsAPI.clearAll();
        setLogs([]);
        setPagination({ total: 0 });
        alert('Log sistema hamoos ho susesu');
      } catch (error) {
        alert('Erro durante hamoos log');
      }
    }
  };

  const deleteLog = async (id) => {
    if (window.confirm('Ita boot hakarak hamoos log ida nee?')) {
      try {
        await systemLogsAPI.delete(id);
        fetchLogs(); // Refresh list
      } catch (error) {
        alert('Erro durante hamoos log');
      }
    }
  };

  const getLevelColor = (nivel) => {
    switch (nivel) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (nivel) => {
    switch (nivel) {
      case 'error': return '🔴';
      case 'warning': return '🟡'; 
      case 'info': return '🔵';
      default: return '⚪';
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <DashboardLayout title="Log Sistema">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Log Sistema</h1>
            <p className="text-gray-600">Monitoriza no hatama aktividade sistema</p>
          </div>
          <button
            onClick={clearLogs}
            className="px-4 py-2 text-red-600 bg-white border border-red-600 rounded-lg hover:bg-red-50"
          >
            Hamoos Log Hotu
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel
              </label>
              <select
                value={filters.nivel}
                onChange={(e) => handleFilterChange('nivel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Hotu-Hotu</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modulu
              </label>
              <select
                value={filters.modulo}
                onChange={(e) => handleFilterChange('modulo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Hotu-Hotu</option>
                <option value="AUTH">Autentikasaun</option>
                <option value="ATTENDANCE">Absensi</option>
                <option value="EMAIL">Email</option>
                <option value="SALARY">Gaji</option>
                <option value="SYSTEM">Sistema</option>
                <option value="DATABASE">Database</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Husi
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data To'o
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limit
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="border-b border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Lista Log ({pagination.total || 0})
            </h3>
            
            {/* Pagination Info */}
            {pagination.total > 0 && (
              <div className="text-sm text-gray-600">
                Pájina {pagination.page} husi {pagination.pages}
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading lista log...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">La iha Log Sistema</h3>
              <p className="text-gray-500">La iha atividade sistema rejistu iha periodu ida nee</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id_log} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getLevelColor(log.nivel)}`}>
                        {getLevelIcon(log.nivel)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 capitalize">
                            {log.nivel} - {log.modulo}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {moment(log.created_at).format('DD/MM/YYYY HH:mm')}
                            </span>
                            <button
                              onClick={() => deleteLog(log.id_log)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Hamoos
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {log.mensagem}
                        </p>

                        {log.detalhes && (
                          <div className="mt-2">
                            <details className="text-sm">
                              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                Detalhes
                              </summary>
                              <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs overflow-x-auto">
                                {JSON.stringify(log.detalhes, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.pages > 1 && (
                <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page <= 1}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Foin liu
                    </button>
                    
                    <span className="text-sm text-gray-600">
                      Pájina {filters.page} husi {pagination.pages}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page >= pagination.pages}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Oin mai
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">📊</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Log</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-lg">🔴</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Error</p>
                <p className="text-2xl font-bold text-gray-900">
                  {logs.filter(log => log.nivel === 'error').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-lg">🟡</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Warning</p>
                <p className="text-2xl font-bold text-gray-900">
                  {logs.filter(log => log.nivel === 'warning').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">🟢</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Info</p>
                <p className="text-2xl font-bold text-gray-900">
                  {logs.filter(log => log.nivel === 'info').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemLogs;