import React, { useState } from 'react';
import Modal from '../Common/Modal';
import { employeeAPI } from '../../utils/api';
import { User, Mail, Phone, Building, Calendar, DollarSign, MapPin, QrCode, Activity } from 'lucide-react';

const EmployeeCard = ({ employee, onEdit, onDelete, onStatusToggle }) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const handleGenerateQR = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.generateQR(employee.id_funsionario);
      
      const url = URL.createObjectURL(response.data);
      setQrImageUrl(url);
      setShowQRModal(true);
    } catch (error) {
      console.error('Error generating QR:', error);
      alert('Erro durante generate QR Code');
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = () => {
    setShowDetailModal(true);
  };

  const handleDelete = () => {
    if (window.confirm(`Ita boot hakarak halakon funsionario ${employee.naran_funsionario}?`)) {
      onDelete(employee.id_funsionario);
    }
  };

  // ✅ FUNCTION BARU: Untuk toggle status (pindah ke icon lain)
  const handleStatusToggle = async () => {
    try {
      setStatusLoading(true);
      const response = await employeeAPI.toggleStatus(employee.id_funsionario);
      
      if (response.data.success) {
        onStatusToggle(employee.id_funsionario, !employee.status_aktif);
        alert(`✅ Status ${employee.naran_funsionario} altera ho susesu ba ${!employee.status_aktif ? 'aktif' : 'inaktif'}`);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Erro durante muda status');
    } finally {
      setStatusLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getGenderText = (jeneru) => {
    return jeneru === 'M' ? 'Manee' : 'Feto';
  };

  const calculateAge = (dataMoris) => {
    const today = new Date();
    const birthDate = new Date(dataMoris);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {employee.naran_funsionario}
              </h3>
              <p className="text-sm text-gray-500">{employee.posisaun}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            employee.status_aktif 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {employee.status_aktif ? 'Aktif' : 'Inaktif'}
          </span>
        </div>

        {/* Employee Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            <span className="truncate">{employee.email}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <span>{employee.no_telp}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Building className="w-4 h-4 mr-2" />
            <span>{employee.departamentu}</span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-500">Salariu Baziku</p>
            <p className="font-medium text-gray-900">
              {formatCurrency(employee.salariu_baziku)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Data Rejistu</p>
            <p className="font-medium text-gray-900">
              {formatDate(employee.data_rejistu)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex space-x-2">
            <button
              onClick={handleGenerateQR}
              disabled={loading}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <QrCode className="w-3 h-3 mr-1" />
              {loading ? 'Loading...' : 'QR Code'}
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(employee)}
              className="inline-flex items-center p-1.5 border border-transparent rounded text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Edita"
            >
              <span>✏️</span>
            </button>
            
            {/* ✅ UBAH: Icon 👤 sekarang untuk tampilkan detail, bukan toggle status */}
            <button
              onClick={handleShowDetails}
              className="inline-flex items-center p-1.5 border border-transparent rounded text-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              title="Haree detalhe kompletu"
            >
              <span>👤</span>
            </button>
            
            {/* ✅ TAMBAH: Icon baru untuk toggle status */}
            <button
              onClick={handleStatusToggle}
              disabled={statusLoading}
              className={`inline-flex items-center p-1.5 border border-transparent rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                employee.status_aktif 
                  ? 'text-yellow-600 hover:bg-yellow-50' 
                  : 'text-green-600 hover:bg-green-50'
              }`}
              title={employee.status_aktif ? 'Desativa' : 'Ativa'}
            >
              {statusLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Activity className="w-4 h-4" />
              )}
            </button>
            
            <button
              onClick={handleDelete}
              className="inline-flex items-center p-1.5 border border-transparent rounded text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Halakon"
            >
              <span>🗑️</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <Modal
        open={showQRModal}
        onClose={() => setShowQRModal(false)}
        title={`QR Code - ${employee.naran_funsionario}`}
        maxWidth="sm"
      >
        <div className="text-center">
          {qrImageUrl && (
            <img 
              src={qrImageUrl} 
              alt={`QR Code for ${employee.naran_funsionario}`}
              className="mx-auto mb-4 border rounded-lg max-w-full h-auto"
            />
          )}
          <p className="text-sm text-gray-600 mb-4">
            Scan QR Code ne'e atu halo absensi
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setShowQRModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Tara
            </button>
            <button
              onClick={() => {
                if (qrImageUrl) {
                  const link = document.createElement('a');
                  link.href = qrImageUrl;
                  link.download = `qr-code-${employee.naran_funsionario}.png`;
                  link.click();
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Download
            </button>
          </div>
        </div>
      </Modal>

      {/* Employee Detail Modal - ID CARD STYLE */}
      <Modal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Kartaun Identifikasaun - ${employee.naran_funsionario}`}
        maxWidth="2xl"
      >
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
          {/* ID Card Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{employee.naran_funsionario}</h2>
            <p className="text-lg text-blue-600 font-semibold">{employee.posisaun}</p>
            <p className="text-gray-600">{employee.departamentu}</p>
          </div>

          {/* ID Card Body */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Personal Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informasaun Pessoal</h3>
              
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Data Moris / Idade</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(employee.data_moris)} • {calculateAge(employee.data_moris)} tinan
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Jeneru</p>
                  <p className="font-medium text-gray-900">{getGenderText(employee.jeneru)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{employee.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                <Phone className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="font-medium text-gray-900">{employee.no_telp}</p>
                </div>
              </div>
              
              {employee.alamat && (
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Alamat</p>
                    <p className="font-medium text-gray-900">{employee.alamat}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Work Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informasaun Servisu</h3>
              
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                <Building className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Posisaun</p>
                  <p className="font-medium text-gray-900">{employee.posisaun}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                <Building className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Departamentu</p>
                  <p className="font-medium text-gray-900">{employee.departamentu}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Salariu Baziku</p>
                  <p className="font-medium text-gray-900">{formatCurrency(employee.salariu_baziku)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Data Rejistu</p>
                  <p className="font-medium text-gray-900">{formatDate(employee.data_rejistu)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                <Activity className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`font-medium ${
                    employee.status_aktif ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {employee.status_aktif ? '🟢 Aktif' : '🔴 Inaktif'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="mt-8 text-center">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code Absensi</h3>
              <p className="text-sm text-gray-600 mb-4">
                QR Code uniku ba {employee.naran_funsionario} atu halo absensi
              </p>
              <button
                onClick={handleGenerateQR}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-all"
              >
                <QrCode className="w-5 h-5 mr-2" />
                {loading ? 'Generate...' : 'Generate QR Code'}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Sistema Absensi QR • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EmployeeCard;