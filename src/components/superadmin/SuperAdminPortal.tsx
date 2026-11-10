import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TutWuriLogo } from '../common/TutWuriLogo';
import { TkaDashboardView } from './views/TkaDashboardView';
import { TkaVerifikasiPendaftaranView } from './views/TkaVerifikasiPendaftaranView';
import { TkaKelolaSekolahView } from './views/TkaKelolaSekolahView';
import { TkaDataPesertaView } from './views/TkaDataPesertaView';
import { TkaRekapLaporanView } from './views/TkaRekapLaporanView';
import { TkaBlankSpotView } from './views/TkaBlankSpotView';
import { TkaAdministrasiTesView } from './views/TkaAdministrasiTesView';
import { TkaSimulasiView } from './views/TkaSimulasiView';
import { TkaTiketBantuanView } from './views/TkaTiketBantuanView';
import { TkaMultiTenantView } from './views/TkaMultiTenantView';
import { TkaPengaturanAkunView } from './views/TkaPengaturanAkunView';
import { tenantStore } from '../../lib/supabase';
import { tkaStore } from '../../lib/tkaStore';
import {
  Menu,
  ChevronDown,
  ChevronRight,
  Home,
  Settings,
  LogOut,
  LayoutDashboard,
  FolderOpen,
  Users,
  BarChart2,
  WifiOff,
  MonitorCheck,
  RefreshCw,
  Ticket,
  Building2,
  ShieldCheck,
  Radio,
  UserCog,
  Bell,
  MessageSquare,
  Sparkles,
  Search,
  ExternalLink,
  Layers,
  KeyRound,
  FileCheck2,
} from 'lucide-react';

interface SuperAdminPortalProps {
  onOpenSqlModal: () => void;
}

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({ onOpenSqlModal }) => {
  const { user, logout, switchRoleForDemo, allSchools } = useAuth();

  // Navigation State
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [activeSubMenu, setActiveSubMenu] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    pengawasan: true,
    kebijakan: true,
    layanan: true,
  });

  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
  const schools = tenantStore.getSchools();
  const pendingCount = schools.filter((s) => s.status === 'pending').length;
  const tickets = tkaStore.getTickets();
  const openTicketCount = tickets.filter((t) => t.status === 'open').length;

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navigateTo = (menu: string, sub = '') => {
    setActiveMenu(menu);
    setActiveSubMenu(sub);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-sans text-slate-800 antialiased">
      {/* 1. TOP HEADER / APP BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 h-14 flex items-center justify-between px-3 sm:px-6 shadow-xs">
        {/* Left: Sidebar toggle + Simulated TKA URL */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            title="Sembunyikan / Tampilkan Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Browser Address Simulation */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-xs text-slate-600 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>tka.kemendikdasmen.go.id/pusat/superadmin</span>
          </div>
        </div>

        {/* Right: Role Switcher, Pending Badge, Notification, User Avatar */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Demo Switch Role */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              title="Uji coba tampilan peran lain"
            >
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              <span className="hidden sm:inline">Peran:</span>
              <span>Super Admin Pusat</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">
                  Beralih Mode Peran
                </div>
                <button
                  onClick={() => {
                    switchRoleForDemo('school_admin', allSchools[0]?.id);
                    setShowRoleDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-semibold text-slate-800">Admin Sekolah (Portal Mandiri)</div>
                    <div className="text-[10px] text-slate-400">Kelola sekolah sendiri, siswa, kartu ujian</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    switchRoleForDemo('proctor', allSchools[0]?.id);
                    setShowRoleDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                >
                  <MonitorCheck className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-semibold text-slate-800">Ruang Proktor</div>
                    <div className="text-[10px] text-slate-400">Pengawasan tes di lab sekolah</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    switchRoleForDemo('student', allSchools[0]?.id);
                    setShowRoleDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-semibold text-slate-800">Peserta Ujian (Siswa)</div>
                    <div className="text-[10px] text-slate-400">Lembar soal digital</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Pending School Registrations Indicator */}
          {pendingCount > 0 && (
            <button
              onClick={() => navigateTo('verifikasi_pendaftaran')}
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1.5 transition animate-pulse"
              title={`${pendingCount} sekolah menunggu verifikasi`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>{pendingCount} Verifikasi</span>
            </button>
          )}

          {/* Tickets Indicator */}
          <div
            onClick={() => navigateTo('tiket_bantuan')}
            className="relative p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
            title="Tiket Bantuan Terbuka"
          >
            <MessageSquare className="w-5 h-5" />
            {openTicketCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {openTicketCount}
              </span>
            )}
          </div>

          {/* Orange Circular User Avatar */}
          <div
            onClick={() => navigateTo('pengaturan_akun')}
            className="w-8 h-8 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer hover:ring-2 hover:ring-orange-300 transition"
            title="Profil Pengguna Super Admin"
          >
            <span>SA</span>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SIDEBAR + MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: SUPERADMIN NATIONAL AUTHORITY */}
        {sidebarOpen && (
          <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-x-hidden overflow-y-auto no-scrollbar max-h-[calc(100vh-3.5rem)] select-none">
            {/* Kemdikbud Header */}
            <div className="p-4 flex flex-col items-center text-center border-b border-slate-100">
              <TutWuriLogo size={52} className="mb-2 shrink-0" />
              <div className="font-black text-[14px] tracking-wide text-slate-800 uppercase leading-snug break-words">
                AKSARA PUSAT
              </div>
              <div className="text-[10px] font-semibold text-slate-500 leading-tight mt-0.5 max-w-[240px]">
                Portal Pengawas Nasional & Manajemen Multi-Tenant
              </div>
            </div>

            {/* Dark Blue 3-Action Sub-Bar: [Dashboard] [Pengaturan] [Keluar] */}
            <div className="bg-[#1b365d] text-white px-2 py-2 grid grid-cols-3 gap-1 text-[11px] font-medium border-b border-slate-900">
              <button
                onClick={() => navigateTo('dashboard')}
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded transition whitespace-nowrap ${
                  activeMenu === 'dashboard'
                    ? 'bg-[#294c7a] font-bold text-white shadow-xs'
                    : 'text-slate-200 hover:bg-[#23426b]'
                }`}
                title="Menuju Dashboard Nasional"
              >
                <Home className="w-3.5 h-3.5 shrink-0" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => navigateTo('pengaturan_akun')}
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded transition whitespace-nowrap ${
                  activeMenu === 'pengaturan_akun'
                    ? 'bg-[#294c7a] font-bold text-white shadow-xs'
                    : 'text-slate-200 hover:bg-[#23426b]'
                }`}
                title="Pengaturan Akun Superadmin"
              >
                <Settings className="w-3.5 h-3.5 shrink-0" />
                <span>Pengaturan</span>
              </button>

              <button
                onClick={logout}
                className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-slate-200 hover:text-red-300 hover:bg-[#23426b] transition whitespace-nowrap"
                title="Keluar dari Portal"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>Keluar</span>
              </button>
            </div>

            {/* Navigation Menu List */}
            <nav className="p-2 space-y-1 text-xs">
              {/* SECTION 1: PENGAWASAN NASIONAL */}
              <div className="px-3 pt-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                PENGAWASAN NASIONAL
              </div>

              {/* 1. Dashboard Nasional */}
              <button
                onClick={() => navigateTo('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <LayoutDashboard className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="leading-snug break-words">Dashboard Nasional</span>
                </div>
              </button>

              {/* 2. Verifikasi Pendaftaran Sekolah (DEDICATED SUPERADMIN ONLY) */}
              <button
                onClick={() => navigateTo('verifikasi_pendaftaran')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'verifikasi_pendaftaran'
                    ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                    : 'text-slate-700 hover:bg-amber-50/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="leading-snug break-words">Verifikasi Pendaftaran</span>
                </div>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                    {pendingCount}
                  </span>
                )}
              </button>

              {/* 3. Manajemen Satuan Pendidikan (Seluruh Sekolah) */}
              <button
                onClick={() => navigateTo('kelola_sekolah')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'kelola_sekolah'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="leading-snug break-words">Satuan Pendidikan</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">{schools.length}</span>
              </button>

              {/* 4. Monitoring Ujian Nasional */}
              <button
                onClick={() => navigateTo('monitoring_nasional')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'monitoring_nasional'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Radio className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="leading-snug break-words">Monitoring Ujian Live</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              </button>

              {/* SECTION 2: KEBIJAKAN & OPERASIONAL PUSAT */}
              <div className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                KEBIJAKAN & OPERASIONAL PUSAT
              </div>

              {/* 5. Kebijakan & Token Nasional */}
              <button
                onClick={() => navigateTo('administrasi_pusat')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'administrasi_pusat'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <KeyRound className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="leading-snug break-words">Rilis Token & Jadwal</span>
                </div>
              </button>

              {/* 6. Pengawasan Blank Spot & 3T */}
              <button
                onClick={() => navigateTo('blankspot_nasional')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'blankspot_nasional'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <WifiOff className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="leading-snug break-words">Blank Spot & Moda VHD</span>
                </div>
              </button>

              {/* 7. Rekapitulasi & Statistik Nasional */}
              <button
                onClick={() => navigateTo('rekap_nasional')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'rekap_nasional'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <BarChart2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="leading-snug break-words">Rekapitulasi Nasional</span>
                </div>
              </button>

              {/* SECTION 3: LAYANAN & SISTEM */}
              <div className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-wider text-purple-700 uppercase flex items-center justify-between">
                <span>LAYANAN & SISTEM</span>
              </div>

              {/* 8. Pusat Tiket Bantuan (Helpdesk) */}
              <button
                onClick={() => navigateTo('tiket_bantuan')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'tiket_bantuan'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Ticket className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="leading-snug break-words">Pusat Tiket Bantuan</span>
                </div>
                {openTicketCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {openTicketCount}
                  </span>
                )}
              </button>

              {/* 9. Keamanan & Arsitektur Multi-Tenant */}
              <button
                onClick={() => navigateTo('keamanan_multitenant')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'keamanan_multitenant'
                    ? 'bg-purple-100 text-purple-900 font-bold'
                    : 'text-slate-700 hover:bg-purple-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Layers className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="leading-snug break-words">Keamanan Multi-Tenant</span>
                </div>
              </button>

              {/* 10. Pengaturan Akun Superadmin */}
              <button
                onClick={() => navigateTo('pengaturan_akun')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'pengaturan_akun'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <UserCog className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="leading-snug break-words">Akun Superadmin</span>
                </div>
              </button>
            </nav>
          </aside>
        )}

        {/* 3. CENTER / MAIN VIEW AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeMenu === 'dashboard' && (
            <TkaDashboardView onNavigate={(menu, sub) => navigateTo(menu, sub)} />
          )}

          {activeMenu === 'verifikasi_pendaftaran' && (
            <TkaVerifikasiPendaftaranView onSchoolApproved={() => {}} />
          )}

          {activeMenu === 'kelola_sekolah' && (
            <TkaKelolaSekolahView onOpenSqlModal={onOpenSqlModal} />
          )}

          {activeMenu === 'monitoring_nasional' && (
            <TkaAdministrasiTesView subTab="monitor" />
          )}

          {activeMenu === 'administrasi_pusat' && (
            <TkaAdministrasiTesView subTab={activeSubMenu || 'token'} />
          )}

          {activeMenu === 'blankspot_nasional' && (
            <TkaBlankSpotView subTab={activeSubMenu || 'status'} />
          )}

          {activeMenu === 'rekap_nasional' && (
            <TkaRekapLaporanView subTab={activeSubMenu || 'kehadiran'} />
          )}

          {activeMenu === 'tiket_bantuan' && <TkaTiketBantuanView />}

          {activeMenu === 'keamanan_multitenant' && (
            <TkaMultiTenantView subTab={activeSubMenu || 'isolation'} onOpenSqlModal={onOpenSqlModal} />
          )}

          {activeMenu === 'pengaturan_akun' && <TkaPengaturanAkunView />}
        </main>
      </div>
    </div>
  );
};
