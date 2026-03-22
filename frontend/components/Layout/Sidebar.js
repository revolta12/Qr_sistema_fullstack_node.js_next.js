import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  HomeIcon,
  UsersIcon,
  QrCodeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  XMarkIcon,
  SparklesIcon,
  FireIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: HomeIcon, 
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600'
    },
    { 
      name: 'Funsionariu', 
      href: '/dashboard/employees', 
      icon: UsersIcon, 
      color: 'teal',
      gradient: 'from-teal-500 to-cyan-600'
    },
    { 
      name: 'Absensi', 
      href: '/dashboard/attendance', 
      icon: QrCodeIcon, 
      color: 'green',
      gradient: 'from-green-500 to-emerald-600'
    },
    { 
      name: 'Gaji', 
      href: '/dashboard/salary', 
      icon: CurrencyDollarIcon, 
      color: 'lime',
      gradient: 'from-lime-500 to-green-600'
    },
    { 
      name: 'Relatoriu', 
      href: '/dashboard/reports', 
      icon: ChartBarIcon, 
      color: 'cyan',
      gradient: 'from-cyan-500 to-teal-600'
    },
    // ✅ MENU BARU UNTUK ADMIN & SYSTEM
    { 
      name: 'Admin', 
      href: '/dashboard/admin', 
      icon: UserGroupIcon, 
      color: 'violet',
      gradient: 'from-violet-500 to-purple-600'
    },
    { 
      name: 'Konfigurasaun', 
      href: '/dashboard/settings', 
      icon: CogIcon, 
      color: 'slate',
      gradient: 'from-slate-500 to-gray-600',
      submenu: [
        { name: 'Log Sistema', href: '/dashboard/system/logs'},
        { name: 'Email', href: '/dashboard/settings/email'}
      ]
    },
  ];

  const [openSubmenu, setOpenSubmenu] = useState(null);

  const isActive = (href) => {
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  const getColorClasses = (color) => {
    const colors = {
      emerald: {
        active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500',
        icon: 'text-emerald-400',
        iconBg: 'bg-emerald-500/20',
        glow: 'shadow-emerald-500/50'
      },
      teal: {
        active: 'bg-teal-500/20 text-teal-400 border-teal-500', 
        icon: 'text-teal-400',
        iconBg: 'bg-teal-500/20',
        glow: 'shadow-teal-500/50'
      },
      green: {
        active: 'bg-green-500/20 text-green-400 border-green-500',
        icon: 'text-green-400', 
        iconBg: 'bg-green-500/20',
        glow: 'shadow-green-500/50'
      },
      lime: {
        active: 'bg-lime-500/20 text-lime-400 border-lime-500',
        icon: 'text-lime-400',
        iconBg: 'bg-lime-500/20',
        glow: 'shadow-lime-500/50'
      },
      cyan: {
        active: 'bg-cyan-500/20 text-cyan-400 border-cyan-500',
        icon: 'text-cyan-400',
        iconBg: 'bg-cyan-500/20',
        glow: 'shadow-cyan-500/50'
      },
      slate: {
        active: 'bg-slate-500/20 text-slate-400 border-slate-500',
        icon: 'text-slate-400',
        iconBg: 'bg-slate-500/20',
        glow: 'shadow-slate-500/50'
      },
      violet: {
        active: 'bg-violet-500/20 text-violet-400 border-violet-500',
        icon: 'text-violet-400',
        iconBg: 'bg-violet-500/20',
        glow: 'shadow-violet-500/50'
      },
      orange: {
        active: 'bg-orange-500/20 text-orange-400 border-orange-500',
        icon: 'text-orange-400',
        iconBg: 'bg-orange-500/20',
        glow: 'shadow-orange-500/50'
      }
    };

    return colors[color] || colors.emerald;
  };

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  return (
    <>
      {/* Mobile overlay dengan blur effect */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      {/* Sidebar dengan gradient hijau tua */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-gray-900 via-emerald-950 to-gray-900 shadow-2xl transform transition-all duration-500 ease-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500 to-teal-500 animate-pulse"></div>
          <div className="absolute top-20 right-10 w-40 h-40 bg-emerald-500 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-teal-500 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative flex flex-col h-full">
          {/* Logo Section - Premium Hijau */}
          <div className="relative px-6 py-6 border-b border-emerald-900/50">
            {/* Close button untuk mobile */}
            <button
              onClick={onClose}
              className="lg:hidden absolute top-6 right-6 p-2 rounded-xl bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-400 transition-all duration-300 hover:rotate-90"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4">
              {/* Logo dengan gradient hijau & glow */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <QrCodeIcon className="w-7 h-7 text-white" />
                </div>
              </div>
              
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  QR Absensi
                </h1>
                <div className="flex items-center space-x-1 mt-1">
                  <ShieldCheckIcon className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400 font-semibold">Enterprise Edition</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation - Premium dengan warna per menu */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-transparent">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const colorClasses = getColorClasses(item.color);
              const hasSubmenu = item.submenu;
              
              return (
                <div key={item.name} className="space-y-1">
                  {/* Main Menu Item */}
                  <div
                    className={`
                      group relative flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer
                      ${active 
                        ? `${colorClasses.active} border-l-4 shadow-lg ${colorClasses.glow} scale-105` 
                        : 'text-gray-300 hover:bg-emerald-900/20 hover:scale-105'
                      }
                    `}
                    onClick={() => hasSubmenu ? toggleSubmenu(index) : (onClose(), router.push(item.href))}
                    onMouseEnter={() => setHoveredItem(index)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Active indicator glow */}
                    {active && (
                      <div className="absolute inset-0 bg-white/5 rounded-2xl"></div>
                    )}

                    {/* Hover shimmer effect */}
                    {hoveredItem === index && !active && (
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 animate-shimmer"></div>
                    )}

                    {/* Active pulse indicator */}
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full animate-pulse"></div>
                    )}

                    {/* Icon dengan gradient background */}
                    <div className={`
                      relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                      ${active 
                        ? `${colorClasses.iconBg} backdrop-blur-sm` 
                        : 'bg-white/5 group-hover:bg-white/10'
                      }
                    `}>
                      <Icon className={`w-5 h-5 ${
                        active ? colorClasses.icon : 'text-gray-400 group-hover:text-emerald-400'
                      } transition-colors ${active ? 'scale-110' : ''}`} />
                    </div>

                    {/* Menu text */}
                    <div className="flex-1 flex items-center justify-between">
                      <span className={`relative z-10 font-semibold transition-all duration-200 ${
                        active ? 'text-white' : 'text-gray-300 group-hover:text-white'
                      }`}>
                        {item.name}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        {/* Emoji badge */}
                        <span className={`text-lg transition-all duration-300 ${
                          active ? 'scale-110' : 'scale-90 opacity-50 group-hover:scale-110 group-hover:opacity-100'
                        }`}>
                          {item.emoji}
                        </span>

                        {/* Submenu arrow */}
                        {hasSubmenu && (
                          <svg 
                            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                              openSubmenu === index ? 'rotate-180' : ''
                            }`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Active pulse dot */}
                    {active && (
                      <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-ping"></div>
                    )}

                    {/* Hover gradient effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl"></div>
                  </div>

                  {/* Submenu Items */}
                  {hasSubmenu && openSubmenu === index && (
                    <div className="ml-4 space-y-1 animate-slideDown">
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block"
                          onClick={onClose}
                        >
                          <div className={`
                            group flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-300
                            ${isActive(subItem.href)
                              ? 'bg-white/10 text-white border-l-2 border-emerald-400'
                              : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                            }
                          `}>
                            <span className="text-lg">{subItem.emoji}</span>
                            <span className={`text-sm font-medium transition-colors ${
                              isActive(subItem.href) ? 'text-white' : 'group-hover:text-white'
                            }`}>
                              {subItem.name}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quick Actions Section - Hijau */}
            <div className="pt-4 mt-4 border-t border-emerald-900/30">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">Akses Lalais</p>
              
              <button 
                onClick={() => {
                  onClose();
                  router.push('/dashboard/attendance/manual');
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300 group hover:scale-105"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <ClipboardDocumentListIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-emerald-400 group-hover:text-emerald-300">Absensi Manual</span>
              </button>

              <button 
                onClick={() => {
                  onClose();
                  router.push('/dashboard/attendance/scanner');
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 group hover:scale-105 mt-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <QrCodeIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-blue-400 group-hover:text-blue-300">Scan QR Code</span>
              </button>
            </div>
          </nav>

          {/* Version Info - Hijau Theme */}
          <div className="relative border-t border-emerald-900/30 px-4 py-4">
            {/* Premium Badge */}
          
            {/* Version Info Card */}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        
        /* Custom Scrollbar - Hijau */
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgb(16, 185, 129);
          border-radius: 20px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgb(5, 150, 105);
        }
      `}</style>
    </>
  );
};

export default Sidebar;