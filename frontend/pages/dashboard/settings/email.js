import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/Layout/DashboardLayout';
import { emailConfigAPI } from '../../../utils/api';

const EmailConfig = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email_host: '',
    email_port: '',
    email_user: '',
    email_password: '',
    email_from_name: '',
    status_aktif: true
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchEmailConfig();
  }, []);

  const fetchEmailConfig = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading email config from API...');
      
      const response = await emailConfigAPI.get();
      console.log('📧 API Response:', response.data);
      
      if (response.data.success) {
        if (response.data.data) {
          const config = response.data.data;
          console.log('✅ Config loaded:', config);
          
          setFormData({
            email_host: config.email_host || 'smtp.gmail.com',
            email_port: config.email_port || '587',
            email_user: config.email_user || '',
            email_password: '',
            email_from_name: config.email_from_name || 'Sistema Absensi QR',
            status_aktif: config.status_aktif !== undefined ? config.status_aktif : true
          });
        } else {
          console.log('ℹ️ No email config found, using defaults');
          setFormData({
            email_host: 'smtp.gmail.com',
            email_port: '587',
            email_user: '',
            email_password: '',
            email_from_name: 'Sistema Absensi QR',
            status_aktif: true
          });
        }
      }
    } catch (error) {
      console.error('❌ Error loading email config:', error);
      setError('Erro durante loading konfigurasaun email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      console.log('📤 Saving email config:', formData);
      
      const response = await emailConfigAPI.update(formData);
      console.log('✅ Save response:', response.data);
      
      setSuccess(response.data.message || 'Konfigurasaun email atualiza ho susesu');
      
      // Refresh config
      setTimeout(() => {
        fetchEmailConfig();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Save error:', error);
      setError(error.response?.data?.message || 'Erro durante atualiza konfigurasaun email');
    } finally {
      setSaving(false);
    }
  };

  const testEmail = async () => {
    try {
      setTesting(true);
      setError('');
      
      console.log('🧪 Testing email config...');
      const response = await emailConfigAPI.test();
      console.log('✅ Test response:', response.data);
      
      setSuccess(response.data.message);
    } catch (error) {
      console.error('❌ Test error:', error);
      setError(error.response?.data?.message || 'Erro durante test email');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Konfigurasaun Email">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading konfigurasaun email...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Konfigurasaun Email">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Konfigurasaun Email</h1>
          <p className="text-gray-600">Konfigura SMTP ba haruka notifikasaun email</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        {/* Email Config Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host *
                </label>
                <input
                  type="text"
                  value={formData.email_host}
                  onChange={(e) => setFormData({ ...formData, email_host: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  E.g.: smtp.gmail.com, smtp.outlook.com
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port *
                </label>
                <input
                  type="number"
                  value={formData.email_port}
                  onChange={(e) => setFormData({ ...formData, email_port: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Porta normal: 587 (TLS) ka 465 (SSL)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email User *
              </label>
              <input
                type="email"
                value={formData.email_user}
                onChange={(e) => setFormData({ ...formData, email_user: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="seu.email@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Password {formData.email_password ? '(Atual)' : '*'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.email_password}
                  onChange={(e) => setFormData({ ...formData, email_password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  placeholder={formData.email_password ? "••••••••" : "Password aplikasaun"}
                  required={!formData.email_password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formData.email_password 
                  ? "Haree deit se ita boot hakarak troka password" 
                  : "Password aplikasaun, laos password konta email"
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naran Remetente
              </label>
              <input
                type="text"
                value={formData.email_from_name}
                onChange={(e) => setFormData({ ...formData, email_from_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.status_aktif}
                onChange={(e) => setFormData({ ...formData, status_aktif: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Ativa konfigurasaun email
              </label>
            </div>

            <div className="flex justify-between items-center pt-6 border-t">
              <button
                type="button"
                onClick={testEmail}
                disabled={testing}
                className="px-4 py-2 text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {testing ? 'Testando...' : 'Test Email'}
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={fetchEmailConfig}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {saving ? 'Atualiza...' : 'Atualiza Konfigurasaun'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Current Config Info */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Konfigurasaun Agora
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Host:</span>
              <span className="ml-2 text-gray-600">{formData.email_host}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Port:</span>
              <span className="ml-2 text-gray-600">{formData.email_port}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">User:</span>
              <span className="ml-2 text-gray-600">{formData.email_user}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                formData.status_aktif 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {formData.status_aktif ? 'Ativu' : 'La Ativu'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmailConfig;