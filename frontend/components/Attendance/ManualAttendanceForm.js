import React, { useState, useEffect } from 'react';
import { employeeAPI, attendanceAPI } from '../../utils/api';
import { CheckCircle, AlertCircle, Clock, Users } from 'lucide-react';

const ManualAttendanceForm = ({ onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    status: 'Moras',
    observasaun: ''
  });

  // Load employees
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const response = await employeeAPI.getAll();
        if (response.data.success) {
          setEmployees(response.data.data.filter(emp => emp.status_aktif));
        }
      } catch (error) {
        setError('Erro durante loading lista funsionariu');
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  const handleEmployeeSelect = (employeeId) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id_funsionario));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedEmployees.length === 0) {
      setError('Favor hili funsionario ida ka liu tan');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      let response;
      
      if (selectedEmployees.length === 1) {
        // Single employee
        response = await attendanceAPI.createManualAttendance({
          id_funsionario: selectedEmployees[0],
          ...formData
        });
      } else {
        // Multiple employees
        response = await attendanceAPI.createBulkManualAttendance({
          employees: selectedEmployees,
          ...formData
        });
      }

      if (response.data.success) {
        setSuccess(`Absensi ${formData.status} rejistu ho susesu ba ${selectedEmployees.length} funsionario`);
        setSelectedEmployees([]);
        setFormData({
          data: new Date().toISOString().split('T')[0],
          status: 'Moras',
          observasaun: ''
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erro durante rejistu absensi');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ PERBAIKAN: Hanya Moras, Lisensa, Cuty (alpha otomatis)
  const statusOptions = [
    { value: 'Moras', label: 'Moras', icon: AlertCircle, color: 'text-orange-600' },
    { value: 'Lisensa', label: 'Lisensa', icon: Clock, color: 'text-blue-600' },
    { value: 'Cuty', label: 'Cuty', icon: CheckCircle, color: 'text-green-600' }
     ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Absensi Manual</h2>
          <p className="text-sm text-gray-600">Rejistu absensi Moras, Lisensa, no Cuty</p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Absensi
          </label>
          <input
            type="date"
            value={formData.data}
            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Status Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Status Absensi
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = formData.status === option.value;
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: option.value })}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-6 h-6 ${option.color}`} />
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">
                        {option.label}
                      </span>
                      <span className="text-xs text-gray-500 block mt-1">
                        {option.value === 'Moras' && 'Funsionario moras'}
                        {option.value === 'Lisensa' && 'Funsionario husi permisasu'}
                        {option.value === 'Cuty' && 'Funsionario iha direitu deskansa'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Employee Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Funsionario ({selectedEmployees.length} hili)
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {selectedEmployees.length === employees.length ? 'Deselect Hotu' : 'Select Hotu'}
            </button>
          </div>
          
          {loading ? (
            <div className="border border-gray-300 rounded-lg p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading funsionariu...</p>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
              {employees.map((employee) => (
                <div
                  key={employee.id_funsionario}
                  className={`flex items-center space-x-3 p-3 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                    selectedEmployees.includes(employee.id_funsionario) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleEmployeeSelect(employee.id_funsionario)}
                >
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee.id_funsionario)}
                    onChange={() => handleEmployeeSelect(employee.id_funsionario)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-blue-600">
                      {employee.naran_funsionario.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {employee.naran_funsionario}
                    </p>
                    <p className="text-xs text-gray-500">
                      {employee.posisaun} • {employee.departamentu}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Observation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observasaun (Opsional)
          </label>
          <textarea
            value={formData.observasaun}
            onChange={(e) => setFormData({ ...formData, observasaun: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Deskreve motivu ba absensi..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setSelectedEmployees([]);
              setFormData({
                data: new Date().toISOString().split('T')[0],
                status: 'Moras',
                observasaun: ''
              });
              setError('');
              setSuccess('');
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={submitting || selectedEmployees.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Rejistu...
              </div>
            ) : (
              `Rejistu Absensi (${selectedEmployees.length})`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManualAttendanceForm;