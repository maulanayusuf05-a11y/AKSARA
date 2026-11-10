import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TutWuriLogo } from '../common/TutWuriLogo';
import { TkaDashboardView } from './views/TkaDashboardView';
import { TkaDataMasterView } from './views/TkaDataMasterView';
import { TkaDataPesertaView } from './views/TkaDataPesertaView';
import { TkaRekapLaporanView } from './views/TkaRekapLaporanView';
import { TkaBlankSpotView } from './views/TkaBlankSpotView';
import { TkaAdministrasiTesView } from './views/TkaAdministrasiTesView';
import { TkaSimulasiView } from './views/TkaSimulasiView';
import { TkaTiketBantuanView } from './views/TkaTiketBantuanView';
import { TkaMultiTenantView } from './views/TkaMultiTenantView';
import { TkaPengaturanAkunView } from './views/TkaPengaturanAkunView';
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
    master: false,
    peserta: false,
    rekap: false,
    blankspot: false,
    administrasi: false,
    simulasi: false,
    multitenant: true, // open by default so user sees multi-tenant options
    pengguna: false,
  });

  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
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
      {/* 1. TOP HEADER / APP BAR MATCHING SCREENSHOT */}
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
            <span>tka.kemendikdasmen.go.id/user/home</span>
          </div>
        </div>

        {/* Right: Notifications, Badges, Avatar, and Demo Switcher */}
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
              <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
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
                    <div className="font-semibold text-slate-800">Admin Sekolah Dasar</div>
                    <div className="text-[10px] text-slate-400">Kelola kelas, bank soal, jadwal</div>
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
                    <div className="text-[10px] text-slate-400">Pengawasan tes real-time</div>
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

          {/* Green Message Badge (0) */}
          <div className="relative p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
              0
            </span>
          </div>

          {/* Red Bell Badge (0) */}
          <div className="relative p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              0
            </span>
          </div>

          {/* Orange Circular User Avatar matching screenshot */}
          <div
            onClick={() => navigateTo('pengaturan_akun')}
            className="w-8 h-8 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer hover:ring-2 hover:ring-orange-300 transition"
            title="Profil Pengguna Super Admin"
          >
            <span>A</span>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SIDEBAR + MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR MATCHING SCREENSHOT */}
        {sidebarOpen && (
          <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-x-hidden overflow-y-auto no-scrollbar max-h-[calc(100vh-3.5rem)] select-none">
            {/* Logo & Kemdikbud Header matching screenshot */}
            <div className="p-4 flex flex-col items-center text-center border-b border-slate-100">
              <TutWuriLogo size={52} className="mb-2 shrink-0" />
              <div className="font-black text-[14px] tracking-wide text-slate-800 uppercase leading-snug break-words">
                AKSARA
              </div>
              <div className="text-[10px] font-semibold text-slate-500 leading-tight mt-0.5 max-w-[240px]">
                Asesmen dan Kompetensi Siswa Terarah
              </div>
            </div>

            {/* Dark Blue 3-Action Sub-Bar matching screenshot: [Dashboard] [Pengaturan] [Keluar] */}
            <div className="bg-[#1b365d] text-white px-2 py-2 grid grid-cols-3 gap-1 text-[11px] font-medium border-b border-slate-900">
              <button
                onClick={() => navigateTo('dashboard')}
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded transition whitespace-nowrap ${
                  activeMenu === 'dashboard'
                    ? 'bg-[#294c7a] font-bold text-white shadow-xs'
                    : 'text-slate-200 hover:bg-[#23426b]'
                }`}
                title="Menuju Dashboard"
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
                title="Pengaturan Akun"
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

            {/* Menu List */}
            <nav className="p-2 space-y-1 text-xs">
              {/* SECTION: MENU UTAMA */}
              <div className="px-3 pt-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                MENU UTAMA
              </div>

              {/* 1. Dashboard */}
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
                  <span className="leading-snug break-words">Dashboard</span>
                </div>
              </button>

              {/* 2. Data Master (Collapsible) */}
              <div>
                <button
                  onClick={() => toggleSection('master')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <FolderOpen className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-medium leading-snug break-words">Data Master</span>
                  </div>
                  {openSections.master ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  )}
                </button>

                {openSections.master && (
                  <div className="pl-7 pr-2.5 py-1 space-y-0.5 text-[11px]">
                    <button
                      onClick={() => navigateTo('master', 'schools')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'master' && activeSubMenu === 'schools'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Satuan Pendidikan
                    </button>
                    <button
                      onClick={() => navigateTo('master', 'subjects')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'master' && activeSubMenu === 'subjects'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Mata Pelajaran
                    </button>
                    <button
                      onClick={() => navigateTo('master', 'banks')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'master' && activeSubMenu === 'banks'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Bank Soal
                    </button>
                    <button
                      onClick={() => navigateTo('master', 'sarpras')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'master' && activeSubMenu === 'sarpras'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Sarpras / Laboratorium
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Data Peserta (Collapsible) */}
              <div>
                <button
                  onClick={() => toggleSection('peserta')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Users className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-medium leading-snug break-words">Data Peserta</span>
                  </div>
                  {openSections.peserta ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  )}
                </button>

                {openSections.peserta && (
                  <div className="pl-7 pr-2.5 py-1 space-y-0.5 text-[11px]">
                    <button
                      onClick={() => navigateTo('peserta', 'peserta')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'peserta' && activeSubMenu === 'peserta'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Peserta Didik
                    </button>
                    <button
                      onClick={() => navigateTo('peserta', 'generate')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'peserta' && activeSubMenu === 'generate'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Generate Nomor Peserta
                    </button>
                    <button
                      onClick={() => navigateTo('peserta', 'kartu')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'peserta' && activeSubMenu === 'kartu'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Cetak Kartu Login Peserta
                    </button>
                    <button
                      onClick={() => navigateTo('peserta', 'dnt')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'peserta' && activeSubMenu === 'dnt'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Rekap DNT
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Rekap dan Laporan */}
              <div>
                <button
                  onClick={() => toggleSection('rekap')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <BarChart2 className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-medium leading-snug break-words">Rekap dan Laporan</span>
                  </div>
                  {openSections.rekap ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  )}
                </button>

                {openSections.rekap && (
                  <div className="pl-7 pr-2.5 py-1 space-y-0.5 text-[11px]">
                    <button
                      onClick={() => navigateTo('rekap', 'kehadiran')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'rekap' && activeSubMenu === 'kehadiran'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Rekap Kehadiran
                    </button>
                    <button
                      onClick={() => navigateTo('rekap', 'laporan')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'rekap' && activeSubMenu === 'laporan'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Laporan Hasil Ujian
                    </button>
                    <button
                      onClick={() => navigateTo('rekap', 'bap')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'rekap' && activeSubMenu === 'bap'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Berita Acara (BAP)
                    </button>
                  </div>
                )}
              </div>

              {/* 5. Sekolah Blank Spot */}
              <div>
                <button
                  onClick={() => toggleSection('blankspot')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <WifiOff className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-medium leading-snug break-words">Sekolah Blank Spot</span>
                  </div>
                  {openSections.blankspot ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  )}
                </button>

                {openSections.blankspot && (
                  <div className="pl-7 pr-2.5 py-1 space-y-0.5 text-[11px]">
                    <button
                      onClick={() => navigateTo('blankspot', 'status')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'blankspot' && activeSubMenu === 'status'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Status Jaringan Moda Offline
                    </button>
                    <button
                      onClick={() => navigateTo('blankspot', 'pengajuan')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'blankspot' && activeSubMenu === 'pengajuan'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Pengajuan Semi Daring
                    </button>
                    <button
                      onClick={() => navigateTo('blankspot', 'sync')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'blankspot' && activeSubMenu === 'sync'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Sync USB / VHD
                    </button>
                  </div>
                )}
              </div>

              {/* 6. Administrasi Tes */}
              <div>
                <button
                  onClick={() => toggleSection('administrasi')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MonitorCheck className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-medium leading-snug break-words">Administrasi Tes</span>
                  </div>
                  {openSections.administrasi ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  )}
                </button>

                {openSections.administrasi && (
                  <div className="pl-7 pr-2.5 py-1 space-y-0.5 text-[11px]">
                    <button
                      onClick={() => navigateTo('administrasi', 'status')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'administrasi' && activeSubMenu === 'status'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Status Tes
                    </button>
                    <button
                      onClick={() => navigateTo('administrasi', 'token')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'administrasi' && activeSubMenu === 'token'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Rilis Token
                    </button>
                    <button
                      onClick={() => navigateTo('administrasi', 'kelompok')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'administrasi' && activeSubMenu === 'kelompok'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Kelompok Tes & Alokasi
                    </button>
                    <button
                      onClick={() => navigateTo('administrasi', 'monitor')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'administrasi' && activeSubMenu === 'monitor'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Live Monitoring Siswa
                    </button>
                  </div>
                )}
              </div>

              {/* 7. Simulasi */}
              <div>
                <button
                  onClick={() => toggleSection('simulasi')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <RefreshCw className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-medium leading-snug break-words">Simulasi</span>
                  </div>
                  {openSections.simulasi ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  )}
                </button>

                {openSections.simulasi && (
                  <div className="pl-7 pr-2.5 py-1 space-y-0.5 text-[11px]">
                    <button
                      onClick={() => navigateTo('simulasi', 'proktor')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'simulasi' && activeSubMenu === 'proktor'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Komputer Proktor
                    </button>
                    <button
                      onClick={() => navigateTo('simulasi', 'gladi')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'simulasi' && activeSubMenu === 'gladi'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Jadwal Gladi Bersih
                    </button>
                    <button
                      onClick={() => navigateTo('simulasi', 'siswa')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'simulasi' && activeSubMenu === 'siswa'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Simulasi Siswa
                    </button>
                  </div>
                )}
              </div>

              {/* 8. Tiket Bantuan */}
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
                  <span className="leading-snug break-words">Tiket Bantuan</span>
                </div>
                {openTicketCount > 0 && (
                  <span className="shrink-0 ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {openTicketCount}
                  </span>
                )}
              </button>

              {/* SECTION: MULTI-TENANT & KELOLA SEKOLAH */}
              <div className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-wider text-purple-700 uppercase flex items-center justify-between">
                <span className="leading-snug break-words">MULTI-TENANT & KELOLA SEKOLAH</span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0 animate-ping ml-1"></span>
              </div>

              <div>
                <button
                  onClick={() => toggleSection('multitenant')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-purple-50 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="font-semibold text-purple-950 leading-snug break-words">Fitur Multi-Tenant</span>
                  </div>
                  {openSections.multitenant ? (
                    <ChevronDown className="w-3.5 h-3.5 text-purple-500 shrink-0 ml-1" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-purple-500 shrink-0 ml-1" />
                  )}
                </button>

                {openSections.multitenant && (
                  <div className="pl-7 pr-2.5 py-1 space-y-0.5 text-[11px]">
                    <button
                      onClick={() => navigateTo('multitenant', 'schools')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-purple-50 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'multitenant' && activeSubMenu === 'schools'
                          ? 'text-purple-700 font-bold bg-purple-100'
                          : 'text-slate-600'
                      }`}
                    >
                      Manajemen Tenant (Sekolah Binaan)
                    </button>
                    <button
                      onClick={() => navigateTo('multitenant', 'isolation')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-purple-50 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'multitenant' && activeSubMenu === 'isolation'
                          ? 'text-purple-700 font-bold bg-purple-100'
                          : 'text-slate-600'
                      }`}
                    >
                      Isolasi Data & Hak Akses (RLS)
                    </button>
                    <button
                      onClick={() => navigateTo('multitenant', 'sync')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-purple-50 leading-snug break-words whitespace-normal transition ${
                        activeMenu === 'multitenant' && activeSubMenu === 'sync'
                          ? 'text-purple-700 font-bold bg-purple-100'
                          : 'text-slate-600'
                      }`}
                    >
                      Pusat Sinkronisasi Multi-Tenant
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION: MANAJEMEN PENGGUNA */}
              <div className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                MANAJEMEN PENGGUNA
              </div>

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
                  <span className="leading-snug break-words">Pengaturan Akun</span>
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

          {activeMenu === 'master' && (
            <TkaDataMasterView subTab={activeSubMenu || 'schools'} onOpenSqlModal={onOpenSqlModal} />
          )}

          {activeMenu === 'peserta' && (
            <TkaDataPesertaView subTab={activeSubMenu || 'peserta'} />
          )}

          {activeMenu === 'rekap' && (
            <TkaRekapLaporanView subTab={activeSubMenu || 'kehadiran'} />
          )}

          {activeMenu === 'blankspot' && (
            <TkaBlankSpotView subTab={activeSubMenu || 'status'} />
          )}

          {activeMenu === 'administrasi' && (
            <TkaAdministrasiTesView subTab={activeSubMenu || 'token'} />
          )}

          {activeMenu === 'simulasi' && (
            <TkaSimulasiView subTab={activeSubMenu || 'proktor'} />
          )}

          {activeMenu === 'tiket_bantuan' && <TkaTiketBantuanView />}

          {activeMenu === 'multitenant' && (
            <TkaMultiTenantView subTab={activeSubMenu || 'schools'} onOpenSqlModal={onOpenSqlModal} />
          )}

          {activeMenu === 'pengaturan_akun' && <TkaPengaturanAkunView />}
        </main>
      </div>
    </div>
  );
};
