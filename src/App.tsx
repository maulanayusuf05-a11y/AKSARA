import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ConnectionBanner } from './components/common/ConnectionBanner';
import { SqlSchemaViewerModal } from './components/common/SqlSchemaViewerModal';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterSchoolPage } from './components/auth/RegisterSchoolPage';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { SuperAdminPortal } from './components/superadmin/SuperAdminPortal';
import { SchoolAdminPortal } from './components/schooladmin/SchoolAdminPortal';
import { SchoolAdminDashboard } from './components/dashboards/SchoolAdminDashboard';
import { ProctorDashboard } from './components/dashboards/ProctorDashboard';
import { StudentDashboard } from './components/dashboards/StudentDashboard';

const MainAppContent: React.FC = () => {
  const { user, role, isLoading } = useAuth();

  // Navigation & View States
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <div className="text-sm font-semibold tracking-wide">Memuat AKSARA CBT...</div>
        <div className="text-xs text-slate-400 mt-1">Asesmen dan Kompetensi Siswa Terarah</div>
      </div>
    );
  }

  // Not logged in: Show Login or Register School
  if (!user) {
    return (
      <div className="min-h-screen bg-[#fcfdfe] flex flex-col font-sans">
        {authView === 'register' && (
          <ConnectionBanner onOpenSqlModal={() => setShowSqlModal(true)} />
        )}

        {authView === 'login' ? (
          <LoginPage
            onGoToRegister={() => setAuthView('register')}
            onOpenForgotPassword={() => setShowForgotModal(true)}
            onOpenSqlModal={() => setShowSqlModal(true)}
          />
        ) : (
          <RegisterSchoolPage
            onBackToLogin={() => setAuthView('login')}
            onOpenSqlModal={() => setShowSqlModal(true)}
          />
        )}

        {/* Global Modals */}
        <SqlSchemaViewerModal
          isOpen={showSqlModal}
          onClose={() => setShowSqlModal(false)}
        />
        <ForgotPasswordModal
          isOpen={showForgotModal}
          onClose={() => setShowForgotModal(false)}
        />
      </div>
    );
  }

  // Khusus Super Admin: Render Dedicated Kemdikbud TKA Portal Layout matching uploaded screenshot
  if (role === 'super_admin') {
    return (
      <>
        <SuperAdminPortal onOpenSqlModal={() => setShowSqlModal(true)} />
        <SqlSchemaViewerModal
          isOpen={showSqlModal}
          onClose={() => setShowSqlModal(false)}
        />
        <ForgotPasswordModal
          isOpen={showForgotModal}
          onClose={() => setShowForgotModal(false)}
        />
      </>
    );
  }

  // Khusus Admin Sekolah: Render Dedicated School Admin Portal Layout matching Super Admin
  if (role === 'school_admin') {
    return (
      <>
        <SchoolAdminPortal onOpenSqlModal={() => setShowSqlModal(true)} />
        <SqlSchemaViewerModal
          isOpen={showSqlModal}
          onClose={() => setShowSqlModal(false)}
        />
        <ForgotPasswordModal
          isOpen={showForgotModal}
          onClose={() => setShowForgotModal(false)}
        />
      </>
    );
  }

  // Logged In: Show Multi-Tenant Application Layout for Proctor and Student
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Top Banner & Status */}
      <ConnectionBanner onOpenSqlModal={() => setShowSqlModal(true)} />

      {/* Main Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Sidebar Nav */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Role-Specific View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {role === 'proctor' && (
            <ProctorDashboard activeTab={activeTab} />
          )}

          {role === 'student' && (
            <StudentDashboard activeTab={activeTab} />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <SqlSchemaViewerModal
        isOpen={showSqlModal}
        onClose={() => setShowSqlModal(false)}
      />
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
