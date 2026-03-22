import React from 'react';
import {
  UsersIcon,
  QrCodeIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const StatsCards = ({ stats, loading }) => {
  const statItems = [
    {
      name: 'Total Funsionariu',
      value: stats?.totalEmployees || 0,
      icon: UsersIcon,
      color: 'blue',
      description: 'Funsionariu aktivu'
    },
    {
      name: 'Absensi Ohin',
      value: stats?.todayAttendance || 0,
      icon: QrCodeIcon,
      color: 'green',
      description: 'Funsionariu mak absensi ohin'
    },
    {
      name: 'Gaji Pending',
      value: stats?.pendingSalaries || 0,
      icon: CurrencyDollarIcon,
      color: 'yellow',
      description: 'Gaji sei laos prosesa'
    },
    {
      name: 'Atividade Foun',
      value: stats?.recentActivities?.length || 0,
      icon: ClockIcon,
      color: 'purple',
      description: 'Atividade rejistu foun'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.name} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${colorClasses[item.color]}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{item.name}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;