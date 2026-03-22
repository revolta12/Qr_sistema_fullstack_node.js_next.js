import React, { useState, useEffect } from 'react';
import QRScanner from '../Common/QRScanner';
import axios from 'axios';
import moment from 'moment';

const AttendanceScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scanType, setScanType] = useState('jam 8 dader');

  // 🔊 preload audio biar ga delay pertama kali
  const [audio, setAudio] = useState({ success: null, error: null });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const successSound = new Audio('/success.mp3');
    const errorSound = new Audio('/error.mp3');
    successSound.load();
    errorSound.load();
    setAudio({ success: successSound, error: errorSound });
  }, []);

  // 🔊 Fungsi play sound cepat (non-blocking)
  const playSuccessSound = () => {
    try {
      if (audio.success) {
        setTimeout(() => audio.success.play(), 0);
      }
    } catch (e) {
      console.warn('⚠️ Gagal play success sound:', e);
    }
  };

  const playErrorSound = () => {
    try {
      if (audio.error) {
        setTimeout(() => audio.error.play(), 0);
      }
    } catch (e) {
      console.warn('⚠️ Gagal play error sound:', e);
    }
  };

  const getScanMessage = () => {
    switch (scanType) {
      case 'jam 8:15 dader':
        return 'Scan QR Code ba Absensi Tama';
      case 'jm 2:30 loraik':
        return 'Scan QR Code ba Absensi fila';
      default:
        return 'Scan QR Code ba Absensi';
    }
  };

  const handleScan = async (qrData) => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Scanning QR:', qrData);

      const response = await axios.post('http://localhost:5000/api/attendance/record', {
        qr_code: qrData,
        fatin: 'Office',
      });

      console.log('✅ API Response:', response.data);

      if (response.data.success) {
        // mainkan suara dulu, jangan tunggu render
        setTimeout(() => playSuccessSound(), 0);

        setScanResult(response.data);
        setScanning(false);

        setTimeout(() => {
          setScanResult(null);
        }, 8000);
      }
    } catch (error) {
      // mainkan error sound segera
      setTimeout(() => playErrorSound(), 0);

      if (error.response?.status !== 400) {
        console.error('❌ Attendance scan error:', error);
      }

      if (error.response?.data?.message) {
        setError(`❌ ${error.response.data.message}`);
      } else if (error.response?.status === 400) {
        setError('❌ Funsionario ona halo absensi 2x iha loron nee. La bele halo absensi tan!');
      } else {
        setError('❌ Erro durante rejistu absensi');
      }

      setScanning(false);
    } finally {
      setLoading(false);
    }
  };

  const handleScanError = (error) => {
    console.error('QR Scanner error:', error);
    setTimeout(() => playErrorSound(), 0);
    setError('❌ Erro durante scan QR code. Favor asegura kamera loos.');
    setScanning(false);
  };

  const handleStartScan = () => {
    setScanning(true);
    setScanResult(null);
    setError('');
  };

  const handleStopScan = () => setScanning(false);
  const handleScanAgain = () => {
    setScanResult(null);
    setScanning(true);
    setError('');
  };
  const handleCloseResult = () => {
    setScanResult(null);
    setError('');
  };
  const handleCloseError = () => setError('');

  return (
    <div className="max-w-2xl mx-auto">
      {/* Time & Status Display */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Oras Agora</p>
            <p className="text-2xl font-bold text-gray-900">{moment(currentTime).format('HH:mm:ss')}</p>
            <p className="text-sm text-gray-500">{moment(currentTime).format('DD/MM/YYYY')}</p>
          </div>
          <div className="text-right">
            <div className="flex space-x-3">
              <button
                onClick={() => setScanType('jam 8:15 dader')}
                className={`px-3 py-1 text-sm rounded ${
                  scanType === 'jam 8:15 dader' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Entra/Tama
              </button>
              <button
                onClick={() => setScanType('jm 2:30 loraik')}
                className={`px-3 py-1 text-sm rounded ${
                  scanType === 'jm 2:30 loraik' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Sai/Upsen sai
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Section */}
      {!scanning && !scanResult && !error && (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan QR Code Absensi</h2>
          <p className="text-gray-600 mb-6">{getScanMessage()}</p>

          <button
            onClick={handleStartScan}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            {scanType === 'jam 8:15 dader' ? 'Scan Ba Tama' : 'Scan Ba fila'}
          </button>
        </div>
      )}

      {/* Scanner Interface */}
      {scanning && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Scan QR Code - {scanType === 'jam 8:15 dader' ? 'jam 8:15 dader' : 'jm 2:30 loraik'}
          </h3>
          <QRScanner onScan={handleScan} onError={handleScanError} onClose={handleStopScan} />

          {loading && (
            <div className="text-center mt-4">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                <div className="w-4 h-4 border-2 border-blue-800 border-t-transparent rounded-full animate-spin mr-2"></div>
                Prosesando scan...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
            <button onClick={handleCloseError} className="text-red-400 hover:text-red-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-3 flex space-x-3">
            <button
              onClick={handleScanAgain}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Scan Tan
            </button>
            <button
              onClick={handleCloseError}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Fila
            </button>
          </div>
        </div>
      )}

      {/* Scan Result */}
      {scanResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-8 h-8 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-green-800">✅ Absensi Susesu!</h3>
                <p className="text-green-700">
                  {scanResult.data.naran_funsionario} - {scanResult.data.oras_tama}
                  {scanResult.data.oras_sai && ` / ${scanResult.data.oras_sai}`}
                </p>
                <p className="text-sm text-green-600 mt-1">{scanResult.message}</p>
              </div>
            </div>
            <button onClick={handleCloseResult} className="text-green-400 hover:text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleScanAgain}
              className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Scan Tan
            </button>
            <button
              onClick={handleCloseResult}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Tara
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceScanner;
