import React, { useState, useEffect } from 'react';
import { DEPARTMENTS, EMPLOYEE_POSITIONS } from '../../utils/constants';

const EmployeeForm = ({ employee, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    naran_funsionario: '',
    data_moris: '',
    jeneru: 'M',
    email: '',
    no_telp: '',
    posisaun: '',
    departamentu: '',
    salariu_baziku: '',
    data_rejistu: new Date().toISOString().split('T')[0],
    alamat: '',
    status_aktif: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        naran_funsionario: employee.naran_funsionario || '',
        data_moris: employee.data_moris || '',
        jeneru: employee.jeneru || 'M',
        email: employee.email || '',
        no_telp: employee.no_telp || '',
        posisaun: employee.posisaun || '',
        departamentu: employee.departamentu || '',
        salariu_baziku: employee.salariu_baziku || '',
        data_rejistu: employee.data_rejistu || new Date().toISOString().split('T')[0],
        alamat: employee.alamat || '',
        status_aktif: employee.status_aktif !== undefined ? employee.status_aktif : true
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.naran_funsionario.trim()) {
      newErrors.naran_funsionario = 'Naran funsionario obrigatoriu';
    }

    if (!formData.data_moris) {
      newErrors.data_moris = 'Data moris obrigatoriu';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email obrigatoriu';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email formatu invalidu';
    }

    if (!formData.no_telp.trim()) {
      newErrors.no_telp = 'Numeru telefone obrigatoriu';
    }

    if (!formData.posisaun) {
      newErrors.posisaun = 'Posisaun obrigatoriu';
    }

    if (!formData.departamentu) {
      newErrors.departamentu = 'Departamentu obrigatoriu';
    }

    if (!formData.salariu_baziku || parseFloat(formData.salariu_baziku) <= 0) {
      newErrors.salariu_baziku = 'Salariu baziku tenki positivu';
    }

    if (!formData.data_rejistu) {
      newErrors.data_rejistu = 'Data rejistu obrigatoriu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Naran Funsionario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Naran Funsionario *
          </label>
          <input
            type="text"
            name="naran_funsionario"
            value={formData.naran_funsionario}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.naran_funsionario ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Naran kompletu funsionario"
            disabled={loading}
          />
          {errors.naran_funsionario && (
            <p className="mt-1 text-sm text-red-600">{errors.naran_funsionario}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="email@empresa.com"
            disabled={loading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Data Moris */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Moris *
          </label>
          <input
            type="date"
            name="data_moris"
            value={formData.data_moris}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.data_moris ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.data_moris && (
            <p className="mt-1 text-sm text-red-600">{errors.data_moris}</p>
          )}
        </div>

        {/* Jeneru */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jeneru *
          </label>
          <select
            name="jeneru"
            value={formData.jeneru}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="M">Manne</option>
            <option value="F">Feto</option>
          </select>
        </div>

        {/* No Telp */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numeru Telefone *
          </label>
          <input
            type="tel"
            name="no_telp"
            value={formData.no_telp}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.no_telp ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+670 123 4567"
            disabled={loading}
          />
          {errors.no_telp && (
            <p className="mt-1 text-sm text-red-600">{errors.no_telp}</p>
          )}
        </div>

        {/* Posisaun */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Posisaun *
          </label>
          <select
            name="posisaun"
            value={formData.posisaun}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.posisaun ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            <option value="">Hili Posisaun</option>
            {EMPLOYEE_POSITIONS.map(position => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
          {errors.posisaun && (
            <p className="mt-1 text-sm text-red-600">{errors.posisaun}</p>
          )}
        </div>

        {/* Departamentu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departamentu *
          </label>
          <select
            name="departamentu"
            value={formData.departamentu}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.departamentu ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            <option value="">Hili Departamentu</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          {errors.departamentu && (
            <p className="mt-1 text-sm text-red-600">{errors.departamentu}</p>
          )}
        </div>

        {/* Salariu Baziku */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Salariu Baziku ($) *
          </label>
          <input
            type="number"
            name="salariu_baziku"
            value={formData.salariu_baziku}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.salariu_baziku ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={loading}
          />
          {errors.salariu_baziku && (
            <p className="mt-1 text-sm text-red-600">{errors.salariu_baziku}</p>
          )}
        </div>

        {/* Data Rejistu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Rejistu *
          </label>
          <input
            type="date"
            name="data_rejistu"
            value={formData.data_rejistu}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.data_rejistu ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.data_rejistu && (
            <p className="mt-1 text-sm text-red-600">{errors.data_rejistu}</p>
          )}
        </div>
      </div>

      {/* Alamat */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alamat
        </label>
        <textarea
          name="alamat"
          value={formData.alamat}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Alamat kompletu"
          disabled={loading}
        />
      </div>

      {/* Status Aktif */}
      <div className="flex items-center">
        <input
          type="checkbox"
          name="status_aktif"
          checked={formData.status_aktif}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          disabled={loading}
        />
        <label className="ml-2 text-sm text-gray-700">
          Funsionario Aktif
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          Kansela
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Prosesando...' : (employee ? 'Atualiza' : 'Rejistu')}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;