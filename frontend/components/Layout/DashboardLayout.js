import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import {
  Bars3Icon,
  UserCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const DashboardLayout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    window.location.href = '/login';
  };

  return (
    <div className="d-flex vh-100 bg-light">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content */}
      <div className="flex-fill d-flex flex-column overflow-hidden position-relative">
        {/* Header */}
        <header className="bg-white shadow-sm border-bottom sticky-top z-2">
          <div className="container-fluid px-3 px-md-4 py-3">
            <div className="row align-items-center">
              {/* Left Section */}
              <div className="col-md-6 d-flex align-items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="btn btn-outline-primary btn-sm d-lg-none me-3"
                  style={{width: '40px', height: '40px'}}
                >
                  <Bars3Icon className="w-4 h-4" />
                </button>
                
                <div className="d-none d-lg-block">
                  <h1 className="h4 mb-1 text-dark fw-bold">{title}</h1>
                  <p className="text-muted small mb-0">
                    <i className="bi bi-qr-code me-1"></i>
                    Sistema jestaun absensi ho QR Code
                  </p>
                </div>
              </div>

              {/* Right Section */}
              <div className="col-md-6 d-flex align-items-center justify-content-end">
                {/* User Menu */}
                <div className="dropdown">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="btn btn-light border dropdown-toggle d-flex align-items-center gap-2 py-2 px-3"
                    type="button"
                    aria-expanded="false"
                  >
                    <div className="rounded-circle bg-gradient-primary text-white d-flex align-items-center justify-content-center" 
                         style={{width: '36px', height: '36px'}}>
                      <span className="fw-bold small">A</span>
                    </div>
                    <div className="d-none d-sm-block text-start">
                      <div className="small fw-semibold">Administrador</div>
                    </div>
                    <ChevronDownIcon className="w-3 h-3 text-muted" />
                  </button>

                  {/* User Dropdown */}
                  <div className={`dropdown-menu dropdown-menu-end shadow border-0 mt-2 ${showUserMenu ? 'show' : ''}`} 
                       style={{minWidth: '280px'}}>
                    {/* Header */}
                    <div className="px-4 py-3 bg-primary text-white rounded-top">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-white bg-opacity-20 d-flex align-items-center justify-content-center" 
                             style={{width: '50px', height: '50px'}}>
                          <span className="fw-bold">A</span>
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">Administrador</h6>
                          <small className="opacity-75">admin@sistema.tl</small>
                          <div className="mt-1">
                            <span className="badge bg-warning text-dark small">
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="p-2">
                      <button className="dropdown-item d-flex align-items-center gap-3 py-2">
                        <div className="bg-primary bg-opacity-10 rounded p-2">
                          <UserCircleIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-fill">
                          <div className="small fw-semibold">Hare Perfil</div>
                          <div className="x-small text-muted">Informasaun personal</div>
                        </div>
                        <i className="bi bi-chevron-right text-muted"></i>
                      </button>
                      
                      <hr className="my-2" />
                      
                      <button 
                        onClick={handleLogout}
                        className="dropdown-item d-flex align-items-center gap-3 py-2 text-danger"
                      >
                        <div className="bg-danger bg-opacity-10 rounded p-2">
                          <div ArrowRightOnRectangleIcon className="w-4 h-4 text-danger" />
                        </div>
                        <div className="flex-fill">
                          <div className="small fw-semibold">Sai Sistema</div>
                          <div className="x-small text-muted">Logout husi sistema</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-fill overflow-auto bg-light">
          <div className="container-fluid px-3 px-md-4 py-4">
            <div className="row">
              <div className="col-12">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;