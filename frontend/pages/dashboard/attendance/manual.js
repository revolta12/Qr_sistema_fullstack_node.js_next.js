import React from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/Layout/DashboardLayout';
import ManualAttendanceForm from '../../../components/Attendance/ManualAttendanceForm';

const ManualAttendancePage = () => {
  const router = useRouter();

  const handleSuccess = () => {
    // Optional: Redirect or show success message
    console.log('Absensi manual susesu!');
  };

  return (
    <DashboardLayout title="Absensi Manual">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Absensi Manual</h1>
              <p className="text-gray-600 mt-1">
                Rejistu absensi Moras, Lisensa, Cyuty ka alpha ba funsionariu
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/attendance')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Fila ba Lista Absensi
            </button>
          </div>
        </div>

        {/* Manual Attendance Form */}
        <ManualAttendanceForm onSuccess={handleSuccess} />

        {/* Information Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Informasaun kona-ba Absensi Manual
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="space-y-2">
              <p><strong>moras:</strong>funsionario labele tama serviso tamaba Moras</p>
              <p><strong>lisensa:</strong> Funsionario husi permisasu husi chefia</p>
            </div>
            <div className="space-y-2">
              <p><strong>Cuty:</strong> Funsionario iha direitu atu deskansa</p>
              <p><strong>Alpha:</strong> Funsionario la hanesan ho la iha justifikasaun</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManualAttendancePage;