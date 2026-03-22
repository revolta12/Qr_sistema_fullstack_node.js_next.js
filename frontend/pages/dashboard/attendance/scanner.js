import React from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/Layout/DashboardLayout';
import AttendanceScanner from '../../../components/Attendance/AttendanceScanner';
import { useAuth } from '../../../contexts/AuthContext';

const AttendanceScannerPage = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <DashboardLayout title="Scan QR Code Absensi">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/attendance')}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Fila ba Lista Absensi
          </button>
        </div>

        {/* Scanner Component */}
        <AttendanceScanner />
      </div>
    </DashboardLayout>
  );
};

export default AttendanceScannerPage;