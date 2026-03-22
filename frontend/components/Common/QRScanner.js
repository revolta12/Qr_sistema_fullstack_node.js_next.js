import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';

const QRScanner = ({ onScan, onError, onClose }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [scanCompleted, setScanCompleted] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastScanTimeRef = useRef(0);

  // Effects
  useEffect(() => {
    checkCameraPermission();
    return () => {
      cleanupScanner();
    };
  }, []);

  useEffect(() => {
    if (hasPermission && !scanCompleted) { // ✅ HANYA JALAN JIKA BELUM SELESAI
      startCamera();
    }
  }, [facingMode, hasPermission, scanCompleted]);

  // Scanner functions
  const checkCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
    } catch (error) {
      setHasPermission(false);
      onError(error);
    }
  };

  const startCamera = async () => {
    try {
      stopCamera();
      
      const constraints = {
        video: { 
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15, max: 30 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadedmetadata', startQRScanning);
      }

      setScanning(true);
    } catch (error) {
      console.error('Error starting camera:', error);
      onError(error);
    }
  };

  const startQRScanning = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    scanQRCode();
  };

  const scanQRCode = () => {
    // ✅ BERHENTI JIKA SUDAH SCAN BERHASIL
    if (scanCompleted) {
      return;
    }

    const now = Date.now();
    const timeSinceLastScan = now - lastScanTimeRef.current;

    if (timeSinceLastScan < 200) { // Scan interval normal
      animationFrameRef.current = requestAnimationFrame(scanQRCode);
      return;
    }

    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const scale = 0.5;
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });

    if (code && code.data !== lastScanned) {
      setLastScanned(code.data);
      setScanCount(prev => prev + 1);
      lastScanTimeRef.current = now;
      
      // ✅ BERHENTI SCANNING SETELAH BERHASIL
      setScanCompleted(true);
      setScanning(false);
      
      // Kirim data ke parent component
      onScan(code.data);

      // Stop camera setelah berhasil scan
      setTimeout(() => {
        stopCamera();
      }, 1000);

      return;
    }

    animationFrameRef.current = requestAnimationFrame(scanQRCode);
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const cleanupScanner = () => {
    stopCamera();
    setLastScanned('');
    setScanCount(0);
    setScanCompleted(false); // ✅ RESET STATE
  };

  // ✅ FUNCTION BARU UNTUK SCAN LAGI
  const handleScanAgain = () => {
    setScanCompleted(false);
    setLastScanned('');
    setScanning(true);
    startCamera();
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const isFrontCamera = facingMode === 'user';

  if (hasPermission === false) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Permisaun Kamera La Hetan</h3>
          <p className="text-red-100">
            Favor permite asesu ba kamera iha browser ne'e atu uza scanner QR code.
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 font-semibold"
          >
            <span>🚪</span>
            <span>Fila</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📷</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">QR Code Scanner</h2>
              <p className="text-blue-100 text-sm">
                {scanCompleted ? '✅ Scan Kompletu' : '📱 Hili QR Code'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
              Scan: {scanCount}
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Area */}
      <div className="p-6">
        <div className="relative bg-black rounded-2xl overflow-hidden shadow-lg">
          {!scanCompleted ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-80 object-cover ${
                  isFrontCamera ? 'scale-x-[-1]' : ''
                }`}
              />
              
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanner Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <div className="border-4 border-white/80 rounded-2xl w-64 h-64 relative shadow-2xl">
                    <div className="absolute inset-0 border-2 rounded-2xl animate-ping border-green-400"></div>
                    
                    {/* Corners */}
                    <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 rounded-tl-lg border-green-400"></div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 rounded-tr-lg border-green-400"></div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 rounded-bl-lg border-green-400"></div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 rounded-br-lg border-green-400"></div>
                  </div>
                </div>
              </div>

              {/* Scanning Indicator */}
              {scanning && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-2 bg-black/70 text-white px-4 py-2 rounded-full">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-400"></div>
                    <span className="text-sm font-medium">Scanning QR Code...</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            // ✅ TAMPILAN SETELAH SCAN BERHASIL
            <div className="w-full h-80 bg-gradient-to-br from-green-500 to-green-600 flex flex-col items-center justify-center text-white p-6">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold mb-2 text-center">Scan Susesu!</h3>
              <p className="text-green-100 text-center mb-4">
                QR Code ona hetan ho susesu. Dados ona haruka ba sistema.
              </p>
              <div className="bg-white/20 p-3 rounded-lg max-w-full">
                <p className="text-sm font-mono break-all text-center">
                  {lastScanned}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {!scanCompleted ? (
            <>
              <button
                onClick={toggleCamera}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex flex-col items-center justify-center space-y-1"
              >
                <span className="text-lg">🔄</span>
                <span className="text-xs font-medium">Kamera</span>
              </button>
              
              <button
                onClick={onClose}
                className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl flex flex-col items-center justify-center space-y-1"
              >
                <span className="text-lg">✖</span>
                <span className="text-xs font-medium">Taka</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleScanAgain}
                className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl flex flex-col items-center justify-center space-y-1"
              >
                <span className="text-lg">🔄</span>
                <span className="text-xs font-medium">Scan Tan</span>
              </button>
              
              <button
                onClick={onClose}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex flex-col items-center justify-center space-y-1"
              >
                <span className="text-lg">✅</span>
                <span className="text-xs font-medium">OK</span>
              </button>
            </>
          )}
        </div>

        {/* Instructions */}
        {!scanCompleted && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="text-center text-xs text-blue-800">
              <p className="font-semibold mb-1">💡 Instruksaun:</p>
              <p>kartaun  QR code iha area scanner, Depois Scanner sei Scanner automátiku depois sei hamosu de scan susesu.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;