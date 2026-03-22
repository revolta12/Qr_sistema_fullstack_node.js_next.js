import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/Layout/DashboardLayout';
import EmployeeList from '../../../components/Employees/EmployeeList';
import EmployeeForm from '../../../components/Employees/EmployeeForm';
import Modal from '../../../components/Common/Modal';
import { employeeAPI } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchEmployees();
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    filterEmployees();
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAll();
      
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      setError('Erro durante loading lista funsionariu');
      console.error('Employees fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter(employee =>
      employee.naran_funsionario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.posisaun.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.departamentu.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredEmployees(filtered);
  };

  const handleCreateEmployee = async (formData) => {
    try {
      setFormLoading(true);
      const response = await employeeAPI.create(formData);
      
      if (response.data.success) {
        await fetchEmployees(); // Refresh list
        setShowForm(false);
        setError('');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erro durante rejistu funsionariu foun');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateEmployee = async (formData) => {
    try {
      setFormLoading(true);
      const response = await employeeAPI.update(editingEmployee.id_funsionario, formData);
      
      if (response.data.success) {
        await fetchEmployees(); // Refresh list
        setShowForm(false);
        setEditingEmployee(null);
        setError('');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erro durante atualiza funsionariu');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await employeeAPI.delete(id);
      await fetchEmployees(); // Refresh list
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Erro durante halakon funsionariu');
    }
  };

  const handleStatusToggle = async (id, newStatus) => {
    try {
      await employeeAPI.toggleStatus(id);
      await fetchEmployees(); // Refresh list
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Erro durante muda status funsionariu');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleFormSubmit = (formData) => {
    if (editingEmployee) {
      handleUpdateEmployee(formData);
    } else {
      handleCreateEmployee(formData);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Jere Funsionariu">
      {/* Header with Search and Add Button */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Funsionariu</h1>
          <p className="text-gray-600">Jere dadus funsionariu sira</p>
        </div>
        
        <div className="flex space-x-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Buka funsionariu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Add Employee Button */}
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Funsionariu Foun
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm font-medium text-gray-600">Total Funsionariu</p>
          <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm font-medium text-gray-600">Aktif</p>
          <p className="text-2xl font-bold text-green-600">
            {employees.filter(e => e.status_aktif).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm font-medium text-gray-600">Inaktif</p>
          <p className="text-2xl font-bold text-red-600">
            {employees.filter(e => !e.status_aktif).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm font-medium text-gray-600">Display</p>
          <p className="text-2xl font-bold text-blue-600">{filteredEmployees.length}</p>
        </div>
      </div>

      {/* Employee List */}
      <EmployeeList
        employees={filteredEmployees}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteEmployee}
        onStatusToggle={handleStatusToggle}
        searchTerm={searchTerm}
      />

      {/* Employee Form Modal */}
      <Modal
        open={showForm}
        onClose={handleFormClose}
        title={editingEmployee ? 'Edita Funsionariu' : 'Rejistu Funsionariu Foun'}
        maxWidth="2xl"
      >
        <EmployeeForm
          employee={editingEmployee}
          onSubmit={handleFormSubmit}
          onCancel={handleFormClose}
          loading={formLoading}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default Employees;