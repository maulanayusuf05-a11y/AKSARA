import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TutWuriLogo } from '../common/TutWuriLogo';
import { tenantStore } from '../../lib/supabase';
import { tkaStore, DOWNLOAD_FILES } from '../../lib/tkaStore';
import { DownloadableFile, Announcement, HelpdeskTicket } from '../../types/tka';
import { ClassRoom, Student, Proctor, Subject, QuestionBank, Exam, ExamToken } from '../../types/database';
import { SchoolDataMasterView } from './views/SchoolDataMasterView';
import { SchoolDataPesertaView } from './views/SchoolDataPesertaView';
import { SchoolRekapLaporanView } from './views/SchoolRekapLaporanView';
import { SchoolBlankSpotView } from './views/SchoolBlankSpotView';
import { SchoolAdministrasiTesView } from './views/SchoolAdministrasiTesView';
import { SchoolSimulasiView } from './views/SchoolSimulasiView';
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
  Mail,
  Calendar,
  Clock,
  Download,
  Folder,
  FileText,
  Headphones,
  CheckCircle,
  Plus,
  Send,
  Printer,
  FileCheck2,
  KeyRound,
  PlayCircle,
  Eye,
  Check,
  Lock,
  ArrowUpDown,
  Database,
  Phone,
  QrCode,
  Layers,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

interface SchoolAdminPortalProps {
  onOpenSqlModal: () => void;
}

export const SchoolAdminPortal: React.FC<SchoolAdminPortalProps> = ({ onOpenSqlModal }) => {
  const { user, currentSchool, logout, switchRoleForDemo, allSchools } = useAuth();
  const schoolId = currentSchool?.id || '';

  // Navigation State
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [activeSubMenu, setActiveSubMenu] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);

  // DATA DARI SUPERADMIN (DITERIMA OLEH SEKOLAH)
  const [announcements] = useState<Announcement[]>(() => tkaStore.getAnnouncements());
  const [activeCenterToken] = useState(() => tkaStore.getActiveToken());
  const [allTickets, setAllTickets] = useState<HelpdeskTicket[]>(() => tkaStore.getTickets(schoolId));

  // DATA LOKAL SEKOLAH (TERISOLASI)
  const [classes, setClasses] = useState<ClassRoom[]>(() => tenantStore.getClasses(schoolId));
  const [students, setStudents] = useState<Student[]>(() => tenantStore.getStudents(schoolId));
  const [proctors, setProctors] = useState<Proctor[]>(() => tenantStore.getProctors(schoolId));
  const [subjects, setSubjects] = useState<Subject[]>(() => tenantStore.getSubjects(schoolId));
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>(() => tenantStore.getQuestionBanks(schoolId));
  const [exams, setExams] = useState<Exam[]>(() => tenantStore.getExams(schoolId));
  const [tokens, setTokens] = useState<ExamToken[]>(() => tenantStore.getTokens(schoolId));

  // Sync state with Superadmin
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('24-02-2026 07:15:30 WIB');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Modals & form state
  const [selectedFile, setSelectedFile] = useState<DownloadableFile | null>(null);
  const [showContactModal, setShowContactModal] = useState<string | null>(null);

  // Ticket creation to Superadmin
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<HelpdeskTicket['category']>('RESET_LOGIN');
  const [ticketDescription, setTicketDescription] = useState('');

  const navigateTo = (menu: string, sub = '') => {
    setActiveMenu(menu);
    setActiveSubMenu(sub);
  };

  // Perform Bidirectional Sync with SuperAdmin
  const handlePerformSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      // 1. Ambil instruksi terbaru dari Super Admin (pengumuman, tiket, token nasional)
      setAllTickets(tkaStore.getTickets(schoolId));
      // 2. Refresh data sekolah
      setStudents(tenantStore.getStudents(schoolId));
      setProctors(tenantStore.getProctors(schoolId));
      setClasses(tenantStore.getClasses(schoolId));
      setExams(tenantStore.getExams(schoolId));

      const nowStr = new Date().toLocaleTimeString('id-ID') + ' WIB';
      setLastSyncTime(nowStr);
      setIsSyncing(false);
      setSyncFeedback('Sinkronisasi Berhasil! Data sekolah Anda telah selaras dengan server pusat Super Admin Kemendikdasmen.');
      setTimeout(() => setSyncFeedback(null), 4500);
    }, 900);
  };

  // Create Ticket to SuperAdmin
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;

    const newT = tkaStore.addTicket({
      school_id: schoolId,
      school_name: currentSchool?.name || 'Sekolah Dasar',
      proctor_name: user?.full_name || 'Admin Sekolah',
      subject: ticketSubject.trim(),
      category: ticketCategory,
      priority: 'high',
      status: 'open',
      description: ticketDescription.trim(),
    });

    setAllTickets(tkaStore.getTickets(schoolId));
    setShowTicketModal(false);
    setTicketSubject('');
    setTicketDescription('');
    setSyncFeedback(`Tiket bantuan "${newT.id}" telah dikirim ke Posko Super Admin Pusat!`);
    setTimeout(() => setSyncFeedback(null), 4500);
  };

  const openTicketCount = allTickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-sans text-slate-800 antialiased">
      {/* 1. TOP HEADER: APP BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 h-14 flex items-center justify-between px-3 sm:px-6 shadow-xs">
        {/* Left: Sidebar toggle + Simulated URL */}
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
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>tka.kemendikdasmen.go.id/sekolah/admin</span>
          </div>

          {/* School Badge in Header */}
          <div className="hidden lg:flex items-center gap-2 border-l border-slate-200 pl-3">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <span className="font-bold text-xs text-slate-800">{currentSchool?.name || 'SD Negeri 01'}</span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              NPSN: {currentSchool?.npsn || '20101001'}
            </span>
          </div>
        </div>

        {/* Right: Sync Status, Demo Switcher, Avatar */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Live Sync Button with SuperAdmin */}
          <button
            onClick={handlePerformSync}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold transition"
            title="Klik untuk menyinkronkan data dengan Super Admin sekarang"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sinkronkan ke Pusat</span>
          </button>

          {/* Quick Demo Switch Role */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              title="Uji coba tampilan peran lain"
            >
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span className="hidden sm:inline">Peran:</span>
              <span>Admin Sekolah</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">
                  Beralih Mode Peran
                </div>
                <button
                  onClick={() => {
                    switchRoleForDemo('super_admin');
                    setShowRoleDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-semibold text-slate-800">Super Admin Pusat</div>
                    <div className="text-[10px] text-slate-400">Verifikasi pendaftaran & kendali nasional</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    switchRoleForDemo('proctor', schoolId);
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
                    switchRoleForDemo('student', schoolId);
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

          {/* Ticket Messages to Superadmin */}
          <div
            onClick={() => navigateTo('tiket_bantuan')}
            className="relative p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
            title="Layanan Tiket Bantuan ke Pusat"
          >
            <MessageSquare className="w-5 h-5" />
            {openTicketCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                {openTicketCount}
              </span>
            )}
          </div>

          {/* User Avatar */}
          <div
            onClick={() => navigateTo('pengaturan_akun')}
            className="w-8 h-8 rounded-full bg-[#1b72e8] text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer hover:ring-2 hover:ring-blue-300 transition"
            title="Profil Admin Sekolah"
          >
            <span>AS</span>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SIDEBAR + MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: SCHOOL ADMIN SCOPE */}
        {sidebarOpen && (
          <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-x-hidden overflow-y-auto no-scrollbar max-h-[calc(100vh-3.5rem)] select-none">
            {/* Logo & School Header */}
            <div className="p-4 flex flex-col items-center text-center border-b border-slate-100">
              <TutWuriLogo size={50} className="mb-2 shrink-0" />
              <div className="font-black text-[13px] tracking-tight text-slate-900 uppercase leading-snug break-words">
                {currentSchool?.name || 'ADMIN SEKOLAH'}
              </div>
              <div className="text-[10px] font-bold text-blue-600 mt-0.5">
                NPSN: {currentSchool?.npsn || '20101001'}
              </div>
              <div className="mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Isolasi Data Terlindungi</span>
              </div>
            </div>

            {/* Dark Blue 3-Action Sub-Bar */}
            <div className="bg-[#1b365d] text-white px-2 py-2 grid grid-cols-3 gap-1 text-[11px] font-medium border-b border-slate-900">
              <button
                onClick={() => navigateTo('dashboard')}
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded transition whitespace-nowrap ${
                  activeMenu === 'dashboard'
                    ? 'bg-[#294c7a] font-bold text-white shadow-xs'
                    : 'text-slate-200 hover:bg-[#23426b]'
                }`}
                title="Menuju Beranda Sekolah"
              >
                <Home className="w-3.5 h-3.5 shrink-0" />
                <span>Beranda</span>
              </button>

              <button
                onClick={() => navigateTo('pengaturan_akun')}
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded transition whitespace-nowrap ${
                  activeMenu === 'pengaturan_akun'
                    ? 'bg-[#294c7a] font-bold text-white shadow-xs'
                    : 'text-slate-200 hover:bg-[#23426b]'
                }`}
                title="Pengaturan Akun Sekolah"
              >
                <Settings className="w-3.5 h-3.5 shrink-0" />
                <span>Akun</span>
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

            {/* Navigation Menus for School Administrator */}
            <nav className="p-2 space-y-1 text-xs">
              {/* SECTION 1: OPERASIONAL SEKOLAH */}
              <div className="px-3 pt-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                OPERASIONAL SEKOLAH
              </div>

              {/* 1. Beranda Sekolah */}
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
                  <span className="leading-snug break-words">Beranda Sekolah</span>
                </div>
              </button>

              {/* 2. Profil & Sarpras Sekolah */}
              <button
                onClick={() => navigateTo('profil_sekolah')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'profil_sekolah'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="leading-snug break-words">Profil & Sarpras Sekolah</span>
                </div>
              </button>

              {/* 3. Data Peserta Didik (Siswa) */}
              <button
                onClick={() => navigateTo('peserta_didik')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'peserta_didik'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Users className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="leading-snug break-words">Peserta Didik (Siswa)</span>
                </div>
                <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  {students.length}
                </span>
              </button>

              {/* 4. Rombel & Guru Proktor */}
              <button
                onClick={() => navigateTo('rombel_proktor')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'rombel_proktor'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <FolderOpen className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="leading-snug break-words">Rombel & Guru Proktor</span>
                </div>
              </button>

              {/* SECTION 2: PELAKSANAAN ASESMEN SEKOLAH */}
              <div className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                PELAKSANAAN ASESMEN
              </div>

              {/* 5. Bank Soal & Penjadwalan */}
              <button
                onClick={() => navigateTo('bank_soal_jadwal')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'bank_soal_jadwal'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="leading-snug break-words">Bank Soal & Jadwal Sesi</span>
                </div>
              </button>

              {/* 6. Pelaksanaan & Pengawasan Ujian */}
              <button
                onClick={() => navigateTo('pelaksanaan_tes')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'pelaksanaan_tes'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MonitorCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="leading-snug break-words">Pengawasan Tes & Reset</span>
                </div>
              </button>

              {/* 7. Koneksi Jaringan & Blank Spot */}
              <button
                onClick={() => navigateTo('jaringan_blankspot')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'jaringan_blankspot'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="leading-snug break-words">Koneksi & Pengajuan 3T</span>
                </div>
              </button>

              {/* SECTION 3: PELAPORAN & DUKUNGAN */}
              <div className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                PELAPORAN & DUKUNGAN
              </div>

              {/* 8. Hasil Ujian & Berita Acara (BAP) */}
              <button
                onClick={() => navigateTo('hasil_laporan')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'hasil_laporan'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <BarChart2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="leading-snug break-words">Hasil Ujian & BAP Resmi</span>
                </div>
              </button>

              {/* 9. Layanan Bantuan ke Posko Pusat */}
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
                  <span className="leading-snug break-words">Bantuan ke Posko Pusat</span>
                </div>
                {openTicketCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                    {openTicketCount}
                  </span>
                )}
              </button>

              {/* 10. Pengaturan Akun Admin Sekolah */}
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
                  <span className="leading-snug break-words">Akun Admin Sekolah</span>
                </div>
              </button>
            </nav>
          </aside>
        )}

        {/* 3. CENTER / MAIN VIEW AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Sync Feedback Toast */}
          {syncFeedback && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{syncFeedback}</span>
              </div>
              <button onClick={() => setSyncFeedback(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
          )}

          {/* 1. BERANDA SEKOLAH VIEW */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-4">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-md text-[10px] font-bold tracking-wider uppercase">
                      Satuan Pendidikan Terhubung
                    </span>
                    <span className="text-white/60 text-xs">•</span>
                    <span className="text-xs font-mono text-blue-200">NPSN: {currentSchool?.npsn}</span>
                    <span className="text-white/60 text-xs">•</span>
                    <span className="text-xs text-emerald-300 font-semibold">Status: Terverifikasi Aktif</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                    {currentSchool?.name || 'Sekolah Dasar'}
                  </h1>
                  <p className="text-xs text-blue-100 max-w-2xl mt-1">
                    Kelola administrasi, rombel, peserta didik, kartu login, serta pelaksanaan asesmen mandiri untuk <strong>{currentSchool?.name}</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handlePerformSync}
                    className="px-3.5 py-2 bg-white text-blue-800 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-700 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sinkronkan ke Super Admin</span>
                  </button>
                </div>
              </div>

              {/* 4 Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div 
                  onClick={() => navigateTo('peserta_didik')}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition"
                >
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Siswa Sekolah Ini</div>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">{students.length} Siswa</div>
                    <div className="text-[10px] text-emerald-600 font-medium">Klik untuk kelola & cetak kartu →</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div 
                  onClick={() => navigateTo('rombel_proktor')}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition"
                >
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Rombel Kelas</div>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">{classes.length} Kelas</div>
                    <div className="text-[10px] text-blue-600 font-medium">Tingkat 1 s/d 6 SD</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                <div 
                  onClick={() => navigateTo('rombel_proktor')}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition"
                >
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Guru / Proktor Lab</div>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">{proctors.length} Guru</div>
                    <div className="text-[10px] text-amber-600 font-medium">Ditugaskan di lab</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <MonitorCheck className="w-5 h-5" />
                  </div>
                </div>

                <div 
                  onClick={() => navigateTo('pelaksanaan_tes')}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition"
                >
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Token Sesi Pusat</div>
                    <div className="text-xl font-mono font-bold text-blue-700 mt-0.5">{activeCenterToken.code}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Aktif s/d {activeCenterToken.validUntil}</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Announcements Feed from Super Admin + Right Column Downloads */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Announcements Feed Received from Super Admin (8 cols) */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
                      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                        Instruksi Resmi Diterima dari Super Admin Pusat
                      </h2>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      Tersinkronisasi
                    </span>
                  </div>

                  {announcements.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
                    >
                      <div className="bg-[#1f73b7] text-white px-4 py-3 flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Mail className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-tight leading-snug">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-3 text-[11px] text-blue-100 mt-1">
                            <span className="font-medium">{item.author}</span>
                            <span className="opacity-70">•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 opacity-80" />
                              <span>{item.date}</span>
                            </span>
                            <span className="opacity-70">•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 opacity-80" />
                              <span>{item.time} WIB</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-line space-y-2 max-h-72 overflow-y-auto">
                        {item.content.split('\n\n').map((paragraph, idx) => (
                          <div key={idx} className="space-y-1">
                            {paragraph.split('\n').map((line, lidx) => (
                              <p
                                key={lidx}
                                className={
                                  line.startsWith('A. MODA') || line.startsWith('B. MODA') || line.startsWith('Catatan')
                                    ? 'font-bold text-slate-900 pt-1'
                                    : 'text-slate-700'
                                }
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        ))}
                      </div>

                      <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Diterbitkan resmi oleh Pusat Asesmen Pendidikan Kemendikdasmen</span>
                        </span>
                        <button
                          onClick={() => navigateTo('pelaksanaan_tes')}
                          className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1"
                        >
                          <span>Masuk Pengawasan Lab</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column: Helpdesk Officers & Technical Downloads (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Petugas Bantuan */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Kontak Posko Pusat
                      </h3>
                    </div>

                    <div className="p-3 divide-y divide-slate-100 text-xs">
                      <div
                        onClick={() => setShowContactModal('Tim Teknis Cabang Dinas')}
                        className="py-3 px-2 flex items-center gap-3 hover:bg-slate-50 rounded-lg cursor-pointer transition group"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                          <Headphones className="w-5 h-5 text-blue-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-800 group-hover:text-blue-600 transition truncate">
                            Tim Teknis Cabang Dinas
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Online</span>
                            <span>•</span>
                            <span className="text-blue-600 font-medium">Bantuan Cepat</span>
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => setShowContactModal('Posko Pusat Pusmendik')}
                        className="py-3 px-2 flex items-center gap-3 hover:bg-slate-50 rounded-lg cursor-pointer transition group"
                      >
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
                          <Headphones className="w-5 h-5 text-purple-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-800 group-hover:text-blue-600 transition truncate">
                            Posko Pusat Pusmendik
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                            <span>24 Jam Siaga</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Download Dokumen */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                      <Download className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Unduh Juknis & Pedoman
                      </h3>
                    </div>

                    <div className="p-3 divide-y divide-slate-100 text-xs">
                      {DOWNLOAD_FILES.map((file) => (
                        <div
                          key={file.id}
                          onClick={() => setSelectedFile(file)}
                          className="py-2.5 px-2 flex items-center gap-3 hover:bg-slate-50 rounded-lg cursor-pointer transition group"
                        >
                          {file.category === 'folder' ? (
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                              <Folder className="w-5 h-5 fill-amber-500 text-amber-600" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0 font-bold text-[9px]">
                              <span className="bg-red-600 text-white px-1 py-0.5 rounded-xs font-mono">PDF</span>
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition truncate text-xs">
                              {file.name}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {file.size} • {file.date}
                            </div>
                          </div>

                          <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PROFIL & SARPRAS SEKOLAH */}
          {activeMenu === 'profil_sekolah' && (
            <SchoolDataMasterView
              key={`${activeMenu}-${activeSubMenu}`}
              schoolId={schoolId}
              subTab={activeSubMenu || 'schools'}
            />
          )}

          {/* 3. PESERTA DIDIK (SISWA) */}
          {activeMenu === 'peserta_didik' && (
            <SchoolDataPesertaView
              key={`${activeMenu}-${activeSubMenu}`}
              schoolId={schoolId}
              subTab={activeSubMenu || 'peserta'}
            />
          )}

          {/* 4. ROMBEL & GURU PROKTOR */}
          {activeMenu === 'rombel_proktor' && (
            <SchoolDataMasterView
              key={`${activeMenu}-${activeSubMenu}`}
              schoolId={schoolId}
              subTab="sarpras"
            />
          )}

          {/* 5. BANK SOAL & PENJADWALAN */}
          {activeMenu === 'bank_soal_jadwal' && (
            <SchoolDataMasterView
              key={`${activeMenu}-${activeSubMenu}`}
              schoolId={schoolId}
              subTab="banks"
            />
          )}

          {/* 6. PELAKSANAAN & PENGAWASAN UJIAN */}
          {activeMenu === 'pelaksanaan_tes' && (
            <SchoolAdministrasiTesView
              key={`${activeMenu}-${activeSubMenu}`}
              schoolId={schoolId}
              subTab={activeSubMenu || 'monitor'}
            />
          )}

          {/* 7. KONEKSI JARINGAN & BLANK SPOT */}
          {activeMenu === 'jaringan_blankspot' && (
            <SchoolBlankSpotView
              key={`${activeMenu}-${activeSubMenu}`}
              schoolId={schoolId}
              subTab={activeSubMenu || 'status'}
            />
          )}

          {/* 8. HASIL UJIAN & BERITA ACARA (BAP) */}
          {activeMenu === 'hasil_laporan' && (
            <SchoolRekapLaporanView
              key={`${activeMenu}-${activeSubMenu}`}
              schoolId={schoolId}
              subTab={activeSubMenu || 'kehadiran'}
            />
          )}

          {/* 9. LAYANAN BANTUAN KE POSKO PUSAT (HELPDESK) */}
          {activeMenu === 'tiket_bantuan' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Layanan Bantuan ke Posko Super Admin Pusat
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Kirim pengaduan kendala teknis (reset login siswa, permohonan token, gangguan server) langsung ke tim Posko Pusat Pusmendik.
                  </p>
                </div>

                <button
                  onClick={() => setShowTicketModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Tiket Bantuan Baru</span>
                </button>
              </div>

              {/* Tickets List */}
              <div className="space-y-3">
                {allTickets.length === 0 ? (
                  <div className="bg-white p-10 rounded-xl border border-slate-200 text-center text-slate-400 text-xs shadow-xs">
                    <Ticket className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    Belum ada tiket bantuan yang dibuat oleh sekolah Anda.
                  </div>
                ) : (
                  allTickets.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {t.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              t.status === 'open'
                                ? 'bg-amber-100 text-amber-800'
                                : t.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {t.status === 'open'
                              ? 'Menunggu Respon Pusat'
                              : t.status === 'in_progress'
                              ? 'Sedang Ditangani Pusat'
                              : 'Selesai / Teratasi'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">
                            Kategori: {t.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Dibuat: {new Date(t.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">{t.subject}</h3>
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                        {t.description}
                      </p>

                      {t.response && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>Tanggapan Resmi dari Super Admin Pusat:</span>
                          </div>
                          <p className="leading-relaxed pl-5">{t.response}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 10. PENGATURAN AKUN VIEW */}
          {activeMenu === 'pengaturan_akun' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5 max-w-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <UserCog className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Pengaturan Akun Administrator {currentSchool?.name}
                </h2>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Nama Penanggung Jawab Admin</label>
                  <input
                    type="text"
                    disabled
                    value={user?.full_name || 'Admin Sekolah'}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Email Login Resmi</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'admin@sekolah.id'}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Satuan Pendidikan Terdaftar</label>
                  <input
                    type="text"
                    disabled
                    value={`${currentSchool?.name || 'Sekolah'} (NPSN: ${currentSchool?.npsn})`}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Hak Akses</label>
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 font-medium">
                    Akses Khusus Admin Satuan Pendidikan (Single-Tenant: {currentSchool?.name}). Anda hanya memiliki wewenang mengelola data internal sekolah ini.
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL BUAT TIKET KE SUPERADMIN */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form onSubmit={handleCreateTicket} className="bg-white rounded-2xl max-w-md w-full p-6 text-slate-800 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Buat Tiket Bantuan ke Pusat</h3>
              </div>
              <button type="button" onClick={() => setShowTicketModal(false)} className="text-slate-400 hover:text-slate-600 text-base font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Kategori Kendala *</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="RESET_LOGIN">Reset Login Siswa Terputus</option>
                  <option value="TOKEN">Kendala Token / Alokasi Sesi</option>
                  <option value="JARINGAN">Kendala Jaringan / Permohonan VHD</option>
                  <option value="SERVER_OFFLINE">Sinkronisasi Server Gagal</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Subjek Kendala *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siswa terputus saat subtes numerasi"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Rincian / Deskripsi Masalah *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Jelaskan detail kendala, nomor peserta siswa yang terdampak, atau kode error..."
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition"
              >
                Kirim Tiket ke Pusat
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL UNDUH BERKAS PREVIEW */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-slate-800 space-y-4 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">{selectedFile.name}</h3>
            <p className="text-xs text-slate-500">{selectedFile.description}</p>
            <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600">
              Ukuran: {selectedFile.size} • Versi: {selectedFile.version || 'Resmi Pusmendik'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFile(null)}
                className="flex-1 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  alert(`Mengunduh file: ${selectedFile.name}`);
                  setSelectedFile(null);
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                Unduh Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONTAK POSKO */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-slate-800 space-y-4 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center mx-auto">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">{showContactModal}</h3>
            <p className="text-xs text-slate-500">
              Layanan siaga tanggap darurat teknis penyelenggaraan tes SINTESA.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="text-slate-500">Call Center / WhatsApp:</div>
              <div className="font-bold text-blue-700 font-mono text-sm">0811-2345-6789</div>
              <div className="text-[10px] text-slate-400">Senin - Minggu: 06.00 - 18.00 WIB</div>
            </div>
            <button
              onClick={() => setShowContactModal(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
