import React, { useState, useEffect } from 'react';
import moment from 'moment';

const AttendanceList = ({ attendances = [], loading = false, onDateRangeChange }) => {
  const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [filteredAttendances, setFilteredAttendances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Initialize filtered attendances
  useEffect(() => {
    setFilteredAttendances(attendances);
  }, [attendances]);

  // Apply filters
  useEffect(() => {
    let filtered = attendances;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(attendance =>
        attendance.naran_funsionario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendance.posisaun?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendance.departamentu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendance.fatin?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(attendance => attendance.status === statusFilter);
    }

    setFilteredAttendances(filtered);
  }, [attendances, searchTerm, statusFilter]);

  const handleDateRangeSubmit = (e) => {
    e.preventDefault();
    if (onDateRangeChange) {
      onDateRangeChange(startDate, endDate);
    }
  };

  // Status configuration
  const STATUS_CONFIG = {
    Presente: { label: 'Presente', color: 'bg-green-100 text-green-800 border border-green-200' },
    Atraza: { label: 'Atraza', color: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
    Lisensa: { label: 'Lisensa', color: 'bg-blue-100 text-blue-800 border border-blue-200' },
    Moras: { label: 'Moras', color: 'bg-orange-100 text-orange-800 border border-orange-200' },
    Cuty: { label: 'Cuty', color: 'bg-purple-100 text-purple-800 border border-purple-200' },
    alpha: { label: 'Alpha', color: 'bg-red-100 text-red-800 border border-red-200' }
  };

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.Presente;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // so sai icon 
  const getAttendanceIcon = (attendance) => {
    const { status, oras_tama, oras_sai } = attendance;
    
    // se wain hira status lizensa ou Moras sei hamoru sinal L
    if (status === 'Lisensa' || status === 'Moras') {
      return {
        orasTamaIcon: <span className="text-red-500 font-bold text-lg">L</span>,
        orasSaiIcon: <span className="text-red-500 font-bold text-lg">L</span>,
        tooltip: 'Absensi Manual'
      };
    }
    
    // Jika ada waktu masuk dan keluar (QR Code), tampilkan ✅
    if (oras_tama && oras_sai) {
      return {
        orasTamaIcon: <span className="text-green-500 text-lg">✅</span>,
        orasSaiIcon: <span className="text-green-500 text-lg">✅</span>,
        tooltip: 'QR Code Scan'
      };
    }
    
    // Jika hanya ada waktu masuk saja
    if (oras_tama && !oras_sai) {
      return {
        orasTamaIcon: <span className="text-green-500 text-lg">✅</span>,
        orasSaiIcon: <span className="text-gray-400 text-sm">✅</span>,
        tooltip: 'Hanya Absen Masuk'
      };
    }
    
    // Jika hanya ada waktu keluar saja (jarang terjadi)
    if (!oras_tama && oras_sai) {
      return {
        orasTamaIcon: <span className="text-gray-400 text-sm">✅</span>,
        orasSaiIcon: <span className="text-green-500 text-lg">✅</span>,
        tooltip: 'Hanya Absen Keluar'
      };
    }
    
    // Default case - tidak ada data waktu
    return {
      orasTamaIcon: <span className="text-gray-400 text-sm">--:--</span>,
      orasSaiIcon: <span className="text-gray-400 text-sm">--:--</span>,
      tooltip: 'Tidak Ada Data Waktu'
    };
  };

  // ✅ FUNGSI: Format waktu untuk display
  const formatTime = (time) => {
    if (!time) return null;
    return moment(time, 'HH:mm:ss').format('HH:mm');
  };

  // ✅ FUNGSI: Hitung total jam kerja
  const calculateWorkingHours = (oras_tama, oras_sai) => {
    if (!oras_tama || !oras_sai) return '-';
    
    const start = moment(oras_tama, 'HH:mm:ss');
    const end = moment(oras_sai, 'HH:mm:ss');
    const duration = moment.duration(end.diff(start));
    
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    
    return `${hours}j ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg">
                <div className="md:col-span-3 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="md:col-span-9 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Husi
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data To'o
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buska
              </label>
              <input
                type="text"
                placeholder="Naran, posisaun, departamentu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Hotu Status</option>
                <option value="Presente">Presente</option>
                <option value="Atraza">Atraza</option>
                <option value="Lisensa">Lisensa</option>
                <option value="Moras">Moras</option>
                <option value="Cuty">Cuty</option>
                <option value="alpha">Alpha</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Reset
            </button>
            <button
              onClick={handleDateRangeSubmit}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Hili Data
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-gray-900">{filteredAttendances.length}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-green-600">
            {filteredAttendances.filter(a => a.status === 'Presente').length}
          </div>
          <div className="text-sm text-gray-500">Presente</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredAttendances.filter(a => a.status === 'Atraza').length}
          </div>
          <div className="text-sm text-gray-500">Atraza</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-blue-600">
            {filteredAttendances.filter(a => a.status === 'Lisensa').length}
          </div>
          <div className="text-sm text-gray-500">Lisensa</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-orange-600">
            {filteredAttendances.filter(a => a.status === 'Moras').length}
          </div>
          <div className="text-sm text-gray-500">Moras</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-2xl font-bold text-red-600">
            {filteredAttendances.filter(a => a.status === 'alpha').length}
          </div>
          <div className="text-sm text-gray-500">Alpha</div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200 p-6 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Lista Absensi
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Total: {filteredAttendances.length} rejistu • 
                Periodu: {moment(startDate).format('DD/MM/YYYY')} to'o {moment(endDate).format('DD/MM/YYYY')}
              </p>
            </div>
            <div className="mt-2 md:mt-0">
              <span className="text-sm text-gray-500">
                Legend: ✅ = QR Code • L = Manual
              </span>
            </div>
          </div>
        </div>

        {filteredAttendances.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">La iha Dadus Absensi</h3>
            <p className="text-gray-500">
              La iha rejistu absensi iha periodu data hirak ne'e
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funsionariu
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oras Tama
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oras Sai
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Oras
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fatin
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observasaun
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendances.map((attendance) => {
                  const { orasTamaIcon, orasSaiIcon, tooltip } = getAttendanceIcon(attendance);
                  const formattedTama = formatTime(attendance.oras_tama);
                  const formattedSai = formatTime(attendance.oras_sai);
                  
                  return (
                    <tr key={attendance.id_prezensa} className="hover:bg-gray-50">
                      {/* Funsionariu */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold text-sm">
                              {attendance.naran_funsionario?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {attendance.naran_funsionario}
                            </div>
                            <div className="text-sm text-gray-500">
                              {attendance.posisaun}
                            </div>
                            <div className="text-xs text-gray-400">
                              {attendance.departamentu}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Data */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {moment(attendance.data).format('DD/MM/YYYY')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {moment(attendance.data).format('dddd')}
                        </div>
                      </td>
                      
                      {/* Oras Tama */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2" title={tooltip}>
                          <div className="text-lg">
                            {orasTamaIcon}
                          </div>
                          {formattedTama && (
                            <div className="text-sm font-medium text-gray-900">
                              {formattedTama}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Oras Sai */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2" title={tooltip}>
                          <div className="text-lg">
                            {orasSaiIcon}
                          </div>
                          {formattedSai && (
                            <div className="text-sm font-medium text-gray-900">
                              {formattedSai}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Total Oras */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {calculateWorkingHours(attendance.oras_tama, attendance.oras_sai)}
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(attendance.status)}
                      </td>
                      
                      {/* Fatin */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendance.fatin || '--'}
                      </td>
                      
                      {/* Observasaun */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                        {attendance.observasaun || '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceList; 