import React, { useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/Layout/DashboardLayout';
import AttendanceReport from '../../../components/Reports/AttendanceReport';
import SalaryReport from '../../../components/Reports/SalaryReport';
import EmployeeReport from '../../../components/Reports/EmployeeReport';
import { useAuth } from '../../../contexts/AuthContext';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('attendance');
  
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

  const reportTabs = [
    { id: 'attendance', name: 'Relatoriu Absensi', icon: '📊' },
    { id: 'salary', name: 'Relatoriu Gaji', icon: '💰' },
    { id: 'employee', name: 'Relatoriu Funsionariu', icon: '👥' }
  ];

  const renderReportContent = () => {
    switch (activeReport) {
      case 'attendance':
        return <AttendanceReport />;
      case 'salary':
        return <SalaryReport />;
      case 'employee':
        return <EmployeeReport />;
      default:
        return <AttendanceReport />;
    }
  };

  return (
    <DashboardLayout title="Relatoriu">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Relatoriu</h1>
        <p className="text-gray-600">Analiza dadus sistema no genera relatoriu</p>
      </div>

      {/* Report Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {reportTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeReport === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {renderReportContent()}

    </DashboardLayout>
  );
};

export default Reports;