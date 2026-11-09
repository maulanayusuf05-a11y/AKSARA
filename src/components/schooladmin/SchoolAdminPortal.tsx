import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TutWuriLogo } from '../common/TutWuriLogo';
import { tenantStore } from '../../lib/supabase';
import { tkaStore, DOWNLOAD_FILES } from '../../lib/tkaStore';
import { DownloadableFile, Announcement, HelpdeskTicket } from '../../types/tka';
import { ClassRoom, Student, Proctor, Subject, QuestionBank, Exam, ExamToken } from '../../types/database';
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

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    master: false,
    peserta: false,
    rekap: false,
    blankspot: false,
    administrasi: false,
    simulasi: false,
    sync: true, // open by default so user sees bidirectional sync
    pengguna: false,
  });

  // DATA DARI SUPERADMIN (DITERIMA OLEH SEKOLAH)
  const [announcements] = useState<Announcement[]>(() => tkaStore.getAnnouncements());
  const [activeCenterToken] = useState(() => tkaStore.getActiveToken());
  const [allTickets, setAllTickets] = useState<HelpdeskTicket[]>(() => tkaStore.getTickets(schoolId));

  // DATA LOKAL SEKOLAH (DIKIRIM KE SUPERADMIN)
  const [classes, setClasses] = useState<ClassRoom[]>(() => tenantStore.getClasses(schoolId));
  const [students, setStudents] = useState<Student[]>(() => tenantStore.getStudents(schoolId));
  const [proctors, setProctors] = useState<Proctor[]>(() => tenantStore.getProctors(schoolId));
  const [subjects] = useState<Subject[]>(() => tenantStore.getSubjects(schoolId));
  const [questionBanks] = useState<QuestionBank[]>(() => tenantStore.getQuestionBanks(schoolId));
  const [exams, setExams] = useState<Exam[]>(() => tenantStore.getExams(schoolId));
  const [tokens, setTokens] = useState<ExamToken[]>(() => tenantStore.getTokens(schoolId));

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('24-02-2026 07:15:30 WIB');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Modals & form state
  const [selectedFile, setSelectedFile] = useState<DownloadableFile | null>(null);
  const [showContactModal, setShowContactModal] = useState<string | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    full_name: '',
    nisn: '',
    gender: 'L' as 'L' | 'P',
    class_id: classes[0]?.id || '',
  });

  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamSubject, setNewExamSubject] = useState(subjects[0]?.id || '');
  const [newExamDuration, setNewExamDuration] = useState(60);

  // Ticket creation
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<HelpdeskTicket['category']>('RESET_LOGIN');
  const [ticketDescription, setTicketDescription] = useState('');

  // Participant Card Print Preview
  const [printingStudent, setPrintingStudent] = useState<Student | null>(null);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navigateTo = (menu: string, sub = '') => {
    setActiveMenu(menu);
    setActiveSubMenu(sub);
  };

  // Perform Bidirectional Sync with SuperAdmin
  const handlePerformSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      // 1. Ambil data terbaru dari Super Admin (pengumuman, tiket, token nasional)
      setAllTickets(tkaStore.getTickets(schoolId));
      // 2. Kirim update siswa & proktor sekolah ke Super Admin
      setStudents(tenantStore.getStudents(schoolId));
      setProctors(tenantStore.getProctors(schoolId));
      setClasses(tenantStore.getClasses(schoolId));
      setExams(tenantStore.getExams(schoolId));

      const nowStr = new Date().toLocaleTimeString('id-ID') + ' WIB';
      setLastSyncTime(nowStr);
      setIsSyncing(false);
      setSyncFeedback('Sinkronisasi 2 arah berhasil! Data sekolah dan instruksi Super Admin telah selaras 100%.');
      setTimeout(() => setSyncFeedback(null), 4000);
    }, 1000);
  };

  // Add Student (Data sent to SuperAdmin)
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.full_name || !newStudent.nisn) return;

    const selectedClass = classes.find((c) => c.id === newStudent.class_id);
    const studentRecord: Student = {
      id: 's-' + Math.random().toString(36).substring(2, 9),
      school_id: schoolId,
      user_id: null,
      full_name: newStudent.full_name.trim(),
      nisn: newStudent.nisn.trim(),
      gender: newStudent.gender,
      class_id: newStudent.class_id,
      class_name: selectedClass?.name || 'Kelas 6-A',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    tenantStore.addStudent(studentRecord);
    setStudents(tenantStore.getStudents(schoolId));

    // Audit log (terbaca juga oleh Super Admin)
    tenantStore.addAuditLog({
      school_id: schoolId,
      user_id: user?.id || 'admin',
      user_role: 'school_admin',
      user_email: user?.email || '',
      action: 'ADD_STUDENT',
      entity_type: 'STUDENT',
      entity_id: studentRecord.id,
      details: { name: studentRecord.full_name, nisn: studentRecord.nisn },
    });

    setShowAddStudentModal(false);
    setNewStudent({ full_name: '', nisn: '', gender: 'L', class_id: classes[0]?.id || '' });
    alert(`Siswa ${studentRecord.full_name} berhasil didaftarkan dan data telah disinkronkan ke Super Admin.`);
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
    alert(`Tiket bantuan "${newT.id}" telah dikirim ke Posko Super Admin Pusat.`);
  };

  const openTicketCount = allTickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-sans text-slate-800 antialiased">
      {/* 1. TOP HEADER MATCHING SUPERADMIN PORTAL */}
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
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>tka.kemendikdasmen.go.id/sekolah/home</span>
          </div>

          {/* School Badge in Header */}
          <div className="hidden lg:flex items-center gap-2 border-l border-slate-200 pl-3">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <span className="font-bold text-xs text-slate-800">{currentSchool?.name || 'SDN 01 Menteng'}</span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              NPSN: {currentSchool?.npsn || '20101001'}
            </span>
          </div>
        </div>

        {/* Right: Notifications, Live Sync Status, Avatar, and Demo Switcher */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Live Sync Badge with SuperAdmin */}
          <div
            onClick={handlePerformSync}
            className="cursor-pointer hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold transition"
            title="Klik untuk menyinkronkan data dengan Super Admin sekarang"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Pusat Tersinkronisasi</span>
          </div>

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
              <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
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
                    <div className="text-[10px] text-slate-400">Kendali nasional seluruh sekolah</div>
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
                    <div className="text-[10px] text-slate-400">Pengawasan tes real-time</div>
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
              {openTicketCount}
            </span>
          </div>

          {/* Orange Circular User Avatar matching screenshot */}
          <div
            onClick={() => navigateTo('pengaturan_akun')}
            className="w-8 h-8 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer hover:ring-2 hover:ring-orange-300 transition"
            title="Profil Pengguna Admin Sekolah"
          >
            <span>S</span>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SIDEBAR + MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: Hilangkan scroll ke samping dan atas-bawah (overflow-x-hidden no-scrollbar) */}
        {sidebarOpen && (
          <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-x-hidden overflow-y-auto no-scrollbar max-h-[calc(100vh-3.5rem)] select-none">
            {/* Logo & Kemdikbud Header matching screenshot */}
            <div className="p-4 flex flex-col items-center text-center border-b border-slate-100">
              <TutWuriLogo size={52} className="mb-2" />
              <div className="font-extrabold text-[12px] tracking-tight text-slate-800 uppercase leading-snug">
                TES KEMAMPUAN AKADEMIK
              </div>
              <div className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
                PUSAT ASESMEN PENDIDIKAN
              </div>
              <div className="mt-1 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-[10px] text-blue-700 font-bold truncate max-w-[220px]">
                {currentSchool?.name || 'SDN 01 Menteng'}
              </div>
            </div>

            {/* Dark Blue 3-Action Sub-Bar: [Dashboard] [Pengaturan] [Keluar] */}
            <div className="bg-[#1b365d] text-white px-2 py-2 flex items-center justify-around text-[11px] font-medium border-b border-slate-900">
              <button
                onClick={() => navigateTo('dashboard')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition ${
                  activeMenu === 'dashboard'
                    ? 'bg-[#294c7a] font-bold text-white shadow-xs'
                    : 'text-slate-200 hover:bg-[#23426b]'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => navigateTo('pengaturan_akun')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition ${
                  activeMenu === 'pengaturan_akun'
                    ? 'bg-[#294c7a] font-bold text-white shadow-xs'
                    : 'text-slate-200 hover:bg-[#23426b]'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Pengaturan</span>
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-slate-200 hover:text-red-300 hover:bg-[#23426b] transition"
                title="Keluar dari Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
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
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-slate-500" />
                  <span>Dashboard</span>
                </div>
              </button>

              {/* 2. Data Master Sekolah */}
              <div>
                <button
                  onClick={() => toggleSection('master')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderOpen className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">Data Master Sekolah</span>
                  </div>
                  {openSections.master ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {openSections.master && (
                  <div className="pl-8 pr-2 py-1 space-y-1 text-[11px]">
                    <button
                      onClick={() => navigateTo('master', 'profile')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 ${
                        activeMenu === 'master' && activeSubMenu === 'profile'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Profil Sekolah & NPSN
                    </button>
                    <button
                      onClick={() => navigateTo('master', 'classes')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 ${
                        activeMenu === 'master' && activeSubMenu === 'classes'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Data Kelas (1-6 SD)
                    </button>
                    <button
                      onClick={() => navigateTo('master', 'subjects')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 ${
                        activeMenu === 'master' && activeSubMenu === 'subjects'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Mata Pelajaran Ujian
                    </button>
                    <button
                      onClick={() => navigateTo('master', 'banks')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 ${
                        activeMenu === 'master' && activeSubMenu === 'banks'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Bank Soal (Nasional & Mandiri)
                    </button>
                    <button
                      onClick={() => navigateTo('master', 'proctors')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 ${
                        activeMenu === 'master' && activeSubMenu === 'proctors'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Data Guru / Pengawas
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Data Peserta Sekolah */}
              <div>
                <button
                  onClick={() => toggleSection('peserta')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">Data Peserta Didik</span>
                  </div>
                  {openSections.peserta ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {openSections.peserta && (
                  <div className="pl-8 pr-2 py-1 space-y-1 text-[11px]">
                    <button
                      onClick={() => navigateTo('peserta', 'list')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 ${
                        activeMenu === 'peserta' && activeSubMenu === 'list'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Peserta Didik ({students.length})
                    </button>
                    <button
                      onClick={() => navigateTo('peserta', 'kartu')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 ${
                        activeMenu === 'peserta' && activeSubMenu === 'kartu'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Cetak Kartu Login Ujian
                    </button>
                    <button
                      onClick={() => navigateTo('peserta', 'dnt')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 ${
                        activeMenu === 'peserta' && activeSubMenu === 'dnt'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Daftar Nominasi Tetap (DNT)
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
                  <div className="flex items-center gap-2.5">
                    <BarChart2 className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">Rekap dan Laporan</span>
                  </div>
                  {openSections.rekap ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {openSections.rekap && (
                  <div className="pl-8 pr-2 py-1 space-y-1 text-[11px]">
                    <button
                      onClick={() => navigateTo('rekap', 'kehadiran')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 ${
                        activeMenu === 'rekap' && activeSubMenu === 'kehadiran'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Presensi Kehadiran Ujian
                    </button>
                    <button
                      onClick={() => navigateTo('rekap', 'laporan')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 ${
                        activeMenu === 'rekap' && activeSubMenu === 'laporan'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Hasil & Nilai Ujian Siswa
                    </button>
                    <button
                      onClick={() => navigateTo('rekap', 'bap')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 ${
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
                  <div className="flex items-center gap-2.5">
                    <WifiOff className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">Moda Offline / VHD</span>
                  </div>
                  {openSections.blankspot ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {openSections.blankspot && (
                  <div className="pl-8 pr-2 py-1 space-y-1 text-[11px]">
                    <button
                      onClick={() => navigateTo('blankspot', 'status')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 ${
                        activeMenu === 'blankspot' && activeSubMenu === 'status'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Status Moda Ujian Sekolah
                    </button>
                    <button
                      onClick={() => navigateTo('blankspot', 'pengajuan')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 ${
                        activeMenu === 'blankspot' && activeSubMenu === 'pengajuan'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Pengajuan Semi Daring
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
                  <div className="flex items-center gap-2.5">
                    <MonitorCheck className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">Administrasi Tes</span>
                  </div>
                  {openSections.administrasi ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {openSections.administrasi && (
                  <div className="pl-8 pr-2 py-1 space-y-1 text-[11px]">
                    <button
                      onClick={() => navigateTo('administrasi', 'status')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 ${
                        activeMenu === 'administrasi' && activeSubMenu === 'status'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Paket & Status Ujian ({exams.length})
                    </button>
                    <button
                      onClick={() => navigateTo('administrasi', 'token')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 ${
                        activeMenu === 'administrasi' && activeSubMenu === 'token'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Token Akses Ujian
                    </button>
                    <button
                      onClick={() => navigateTo('administrasi', 'monitor')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 ${
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
                  <div className="flex items-center gap-2.5">
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">Simulasi & Proktor</span>
                  </div>
                  {openSections.simulasi ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {openSections.simulasi && (
                  <div className="pl-8 pr-2 py-1 space-y-1 text-[11px]">
                    <button
                      onClick={() => navigateTo('simulasi', 'proktor')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 ${
                        activeMenu === 'simulasi' && activeSubMenu === 'proktor'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Akun Komputer Proktor
                    </button>
                    <button
                      onClick={() => navigateTo('simulasi', 'gladi')}
                      className={`w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 ${
                        activeMenu === 'simulasi' && activeSubMenu === 'gladi'
                          ? 'text-blue-700 font-bold bg-blue-50'
                          : 'text-slate-600'
                      }`}
                    >
                      Jadwal Gladi Bersih Nasional
                    </button>
                  </div>
                )}
              </div>

              {/* 8. Tiket Bantuan ke SuperAdmin */}
              <button
                onClick={() => navigateTo('tiket_bantuan')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'tiket_bantuan'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Ticket className="w-4 h-4 text-slate-500" />
                  <span>Tiket Bantuan ke Pusat</span>
                </div>
                {openTicketCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                    {openTicketCount}
                  </span>
                )}
              </button>

              {/* SECTION: SINKRONISASI PUSAT & SUPERADMIN */}
              <div className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-wider text-emerald-700 uppercase flex items-center justify-between">
                <span>INTEGRASI DUA ARAH</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
              </div>

              <button
                onClick={() => navigateTo('sync')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  activeMenu === 'sync'
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                    : 'text-slate-700 hover:bg-emerald-50/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ArrowUpDown className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-950">Sinkronisasi Super Admin</span>
                </div>
              </button>

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
                <div className="flex items-center gap-2.5">
                  <UserCog className="w-4 h-4 text-slate-500" />
                  <span>Pengaturan Akun</span>
                </div>
              </button>
            </nav>
          </aside>
        )}

        {/* 3. CENTER / MAIN VIEW AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* DASHBOARD VIEW: Displays live announcements from Super Admin + Right Column Downloads/Contacts */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-4">
              {/* Top Banner */}
              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-md text-[10px] font-bold tracking-wider uppercase">
                      Satuan Pendidikan Terhubung
                    </span>
                    <span className="text-white/60 text-xs">•</span>
                    <span className="text-xs font-mono text-blue-200">NPSN: {currentSchool?.npsn}</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                    {currentSchool?.name || 'Sekolah Dasar'}
                  </h1>
                  <p className="text-xs text-blue-100 max-w-2xl mt-1">
                    Terhubung langsung dengan Pusat Asesmen Pendidikan Kemendikdasmen RI • Token Aktif Hari Ini: <strong className="text-yellow-300 font-mono">{activeCenterToken.code}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePerformSync}
                    className="px-3.5 py-2 bg-white text-blue-800 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-700 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sinkronkan ke Super Admin</span>
                  </button>
                </div>
              </div>

              {/* 4 Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Siswa Terdata</div>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">{students.length} Siswa</div>
                    <div className="text-[10px] text-emerald-600 font-medium">Tervalidasi DNT Pusat</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Rombel Kelas</div>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">{classes.length} Kelas</div>
                    <div className="text-[10px] text-blue-600 font-medium">Tingkat 1 s/d 6 SD</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Guru / Proktor</div>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">{proctors.length} Orang</div>
                    <div className="text-[10px] text-amber-600 font-medium">Akun Proktor Aktif</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <MonitorCheck className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">Token Sesi Pusat</div>
                    <div className="text-xl font-mono font-bold text-blue-700 mt-0.5">{activeCenterToken.code}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Kelompok 1 (s/d 15.30 WIB)</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Feed Announcements from Super Admin + Right Column Downloads */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Announcements Feed Received from Super Admin (8 cols) */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
                      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                        Instruksi Resmi Diterima dari Super Admin (Posko Pusat)
                      </h2>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      Sinkronisasi Otomatis
                    </span>
                  </div>

                  {announcements.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
                    >
                      {/* Header Box: Blue accent bar matching screenshot */}
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
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 opacity-80" />
                              <span>{item.time}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content with highlighted text */}
                      <div className="p-4 sm:p-5 text-xs text-slate-700 leading-relaxed space-y-3">
                        {item.content.split('\n\n').map((paragraph, pIdx) => {
                          if (paragraph.includes('pada Pukul 07.00 - 15.30 WIB')) {
                            return (
                              <div key={pIdx} className="space-y-1">
                                {paragraph.split('\n').map((line, lIdx) => {
                                  if (line.includes('pada Pukul 07.00 - 15.30 WIB')) {
                                    const parts = line.split('pada Pukul 07.00 - 15.30 WIB');
                                    return (
                                      <p key={lIdx} className="text-slate-800">
                                        {parts[0]}
                                        <mark className="bg-sky-500 text-white font-bold px-1.5 py-0.5 rounded text-[11px] select-all">
                                          pada Pukul 07.00 - 15.30 WIB
                                        </mark>
                                        {parts[1]}
                                      </p>
                                    );
                                  }
                                  return (
                                    <p
                                      key={lIdx}
                                      className={
                                        line.startsWith('A. MODA') || line.startsWith('B. MODA') || line.startsWith('Catatan')
                                          ? 'font-bold text-slate-900 pt-1'
                                          : 'text-slate-700'
                                      }
                                    >
                                      {line}
                                    </p>
                                  );
                                })}
                              </div>
                            );
                          }
                          return (
                            <div key={pIdx} className="space-y-1">
                              {paragraph.split('\n').map((line, lIdx) => (
                                <p
                                  key={lIdx}
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
                          );
                        })}
                      </div>

                      <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Diterbitkan resmi oleh Pusat Asesmen Pendidikan</span>
                        </span>
                        <button
                          onClick={() => navigateTo('administrasi', 'token')}
                          className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1"
                        >
                          <span>Buka Token Ujian</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Petugas Bantuan */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Petugas Bantuan Teknis
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
                        onClick={() => setShowContactModal('Tim Teknis Provinsi')}
                        className="py-3 px-2 flex items-center gap-3 hover:bg-slate-50 rounded-lg cursor-pointer transition group"
                      >
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
                          <Headphones className="w-5 h-5 text-indigo-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-800 group-hover:text-blue-600 transition truncate">
                            Tim Teknis Provinsi
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Standby</span>
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

                  {/* Download Berkas */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                      <Download className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Download Berkas
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

          {/* SINKRONISASI PUSAT & SUPERADMIN (Bidirectional Sync Hub) */}
          {activeMenu === 'sync' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-emerald-600" />
                    Pusat Sinkronisasi Data Dua Arah (Super Admin ⇄ Sekolah)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Menjamin integritas data peserta, bank soal nasional, token aktif, dan berita acara antara sekolah dan Pusmendik
                  </p>
                </div>

                <button
                  onClick={handlePerformSync}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi Sekarang'}</span>
                </button>
              </div>

              {syncFeedback && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{syncFeedback}</span>
                </div>
              )}

              {/* Visual 2-Way Flow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* INCOMING FROM SUPERADMIN */}
                <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 text-sm flex items-center gap-2">
                      <span>📥 Data Diterima Dari Super Admin</span>
                    </span>
                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                      Incoming
                    </span>
                  </div>

                  <ul className="space-y-2 text-blue-950 text-[11px]">
                    <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-blue-200">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Pengumuman Resmi Posko Pusat:</strong>
                        <div className="text-slate-600">Instruksi jadwal moda daring dan semi daring hari kedua.</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-blue-200">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Token Ujian Nasional Hari Ini:</strong>
                        <div className="text-slate-600">Kode Token: <strong className="font-mono text-blue-700">{activeCenterToken.code}</strong> (Kelompok 1).</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-blue-200">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Bank Soal Standar Nasional:</strong>
                        <div className="text-slate-600">Paket Soal Literasi & Numerasi Terenkripsi AES-256.</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-blue-200">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Tanggapan & Solusi Tiket Bantuan:</strong>
                        <div className="text-slate-600">Respon tiket kendala siswa dan reset login proktor.</div>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* OUTGOING TO SUPERADMIN */}
                <div className="p-5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 text-sm flex items-center gap-2">
                      <span>📤 Data Dikirim Ke Super Admin</span>
                    </span>
                    <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-bold">
                      Outgoing
                    </span>
                  </div>

                  <ul className="space-y-2 text-purple-950 text-[11px]">
                    <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-purple-200">
                      <CheckCircle className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Data Peserta Didik Sekolah ({students.length} Siswa):</strong>
                        <div className="text-slate-600">Tersinkron ke Daftar Nominasi Tetap (DNT) nasional.</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-purple-200">
                      <CheckCircle className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Daftar Guru / Proktor Lab ({proctors.length} Akun):</strong>
                        <div className="text-slate-600">Kredensial proktor aktif dan status ruang komputer.</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-purple-200">
                      <CheckCircle className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Rekapitulasi Kehadiran & Berita Acara (BAP):</strong>
                        <div className="text-slate-600">Hasil pengerjaan dan log integritas ruang ujian sekolah.</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-purple-200">
                      <CheckCircle className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Pengajuan Tiket Masalah & Bantuan:</strong>
                        <div className="text-slate-600">Permohonan bantuan reset peserta atau kendala koneksi.</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
                <span>Sinkronisasi Terakhir: <strong className="text-slate-900 font-mono">{lastSyncTime}</strong></span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Kanal Terenkripsi TLS 1.3
                </span>
              </div>
            </div>
          )}

          {/* DATA MASTER VIEW */}
          {activeMenu === 'master' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                    Data Master Satuan Pendidikan ({currentSchool?.name})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pengelolaan kelas, rombel, mata pelajaran, dan bank soal terintegrasi
                  </p>
                </div>
              </div>

              {/* Subtab Classes */}
              {activeSubMenu === 'classes' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xs text-slate-800">Daftar Rombel Kelas 1 s/d 6 SD:</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {classes.map((c) => (
                      <div key={c.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-slate-500 text-[11px]">Tingkat {c.grade_level} SD • Bagian {c.section}</div>
                        <div className="text-blue-700 font-semibold text-[11px] pt-1">
                          {students.filter((s) => s.class_id === c.id).length} Siswa Terdaftar
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab Subjects */}
              {activeSubMenu === 'subjects' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-xs text-slate-800">Mata Pelajaran Standar Ujian SD:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {subjects.map((sub) => (
                      <div key={sub.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                          {sub.code}
                        </span>
                        <div className="font-bold text-slate-800 text-sm mt-1">{sub.name}</div>
                        <div className="text-[11px] text-slate-500">Standar Kurikulum Nasional</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab Banks */}
              {activeSubMenu === 'banks' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-xs text-slate-800">Bank Soal yang Diterima dari Super Admin:</h3>
                  <div className="divide-y divide-slate-100 text-xs">
                    {questionBanks.map((b) => (
                      <div key={b.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{b.title}</div>
                          <div className="text-slate-500 text-[11px]">{b.description}</div>
                          <div className="text-blue-600 font-medium text-[10px] mt-0.5">
                            {b.total_questions} Butir Soal • Terverifikasi Pusmendik
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded font-bold text-[10px] border border-emerald-200">
                          Tersinkron
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab Proctors */}
              {activeSubMenu === 'proctors' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-xs text-slate-800">Daftar Guru Pengawas Ruang:</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Nama Guru Pengawas</th>
                          <th className="py-2 px-3">NIP</th>
                          <th className="py-2 px-3">Kontak</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {proctors.map((pr) => (
                          <tr key={pr.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-bold text-slate-800">{pr.full_name}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">{pr.nip || '-'}</td>
                            <td className="py-2.5 px-3 text-slate-600">{pr.phone || '-'}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Aktif
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Default Profile */}
              {(!activeSubMenu || activeSubMenu === 'profile') && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-800 text-sm">Informasi Satuan Pendidikan:</div>
                  <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-slate-200">
                    <div>NPSN: <strong className="font-mono text-blue-700">{currentSchool?.npsn}</strong></div>
                    <div>Bentuk: <strong className="capitalize">{currentSchool?.school_type} • {currentSchool?.education_level}</strong></div>
                    <div>Kepala Sekolah: <strong>{currentSchool?.principal_name}</strong></div>
                    <div>Status Akreditasi: <strong>Akreditasi A</strong></div>
                    <div>Alamat: {currentSchool?.address}, {currentSchool?.city_regency}</div>
                    <div>Email Resmi: {currentSchool?.email}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DATA PESERTA VIEW: List Siswa, Cetak Kartu, DNT */}
          {activeMenu === 'peserta' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    Data Peserta Didik ({students.length} Siswa Terdaftar)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Data siswa ini otomatis tersinkronisasi ke server Super Admin Pusat
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Siswa</span>
                  </button>
                </div>
              </div>

              {activeSubMenu === 'kartu' ? (
                /* Cetak Kartu Login Peserta */
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-700">Pratinjau Kartu Peserta Ujian:</span>
                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Semua Kartu Siswa</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {students.slice(0, 4).map((st, idx) => {
                      const usernameCbt = `U26${currentSchool?.npsn || '20101001'}${String(idx + 1).padStart(3, '0')}`;
                      return (
                        <div
                          key={st.id}
                          className="bg-white border-2 border-slate-800 rounded-xl p-4 shadow-sm text-slate-900 space-y-3"
                        >
                          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2.5">
                            <div className="flex items-center gap-2.5">
                              <TutWuriLogo size={36} />
                              <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  KEMENTERIAN PENDIDIKAN DASAR & MENENGAH
                                </div>
                                <div className="text-xs font-black tracking-tight text-slate-900">
                                  KARTU LOGIN TES KEMAMPUAN AKADEMIK
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                              SD 2026
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="col-span-2 space-y-1">
                              <div>Nama: <strong>{st.full_name}</strong></div>
                              <div>NISN: <span className="font-mono font-bold">{st.nisn}</span></div>
                              <div>Sekolah: {currentSchool?.name}</div>
                              <div>Rombel: {st.class_name || 'Kelas 6-A'}</div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-lg">
                              <QrCode className="w-12 h-12 text-slate-700" />
                              <span className="text-[9px] font-mono text-slate-500 mt-1">CBT SECURE</span>
                            </div>
                          </div>

                          <div className="bg-slate-100 border border-slate-300 rounded-lg p-2.5 grid grid-cols-2 gap-2 text-xs font-mono">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Username</span>
                              <span className="font-bold text-blue-700 text-sm">{usernameCbt}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Password</span>
                              <span className="font-bold text-emerald-700 text-sm">P@ss{st.nisn.slice(-4)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Tabel Siswa Biasa */
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">NISN</th>
                        <th className="py-2.5 px-3">Nama Lengkap Siswa</th>
                        <th className="py-2.5 px-3">Kelas</th>
                        <th className="py-2.5 px-3">L/P</th>
                        <th className="py-2.5 px-3">Status Pusat</th>
                        <th className="py-2.5 px-3 text-right">Kartu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{st.nisn}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">{st.full_name}</td>
                          <td className="py-2.5 px-3 text-slate-600">{st.class_name || 'Kelas SD'}</td>
                          <td className="py-2.5 px-3">{st.gender}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Tervalidasi Super Admin
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setPrintingStudent(st)}
                              className="px-2.5 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-[11px] font-semibold"
                            >
                              Lihat Kartu
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ADMINISTRASI TES & TOKEN */}
          {activeMenu === 'administrasi' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MonitorCheck className="w-4 h-4 text-blue-600" />
                    Administrasi Pelaksanaan Tes Sekolah
                  </h2>
                  <p className="text-xs text-slate-500">
                    Menerima rilis token dari Super Admin dan mengaktifkan sesi ujian siswa
                  </p>
                </div>
                <button
                  onClick={() => setShowAddExamModal(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Paket Ujian</span>
                </button>
              </div>

              {/* Active Token Center received from SuperAdmin */}
              <div className="p-5 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                    Token Resmi dari Super Admin Pusat
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-mono border border-emerald-500/30">
                    Online (07.00 - 15.30 WIB)
                  </span>
                </div>
                <div className="flex items-baseline gap-4">
                  <div className="font-mono text-4xl font-black text-yellow-300 tracking-widest">
                    {activeCenterToken.code}
                  </div>
                  <div className="text-xs text-slate-300">
                    Kode Tes: <strong className="text-white">{activeCenterToken.testCode}</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 pt-1">
                  Bagikan token ini kepada guru pengawas ruang untuk diumumkan ke peserta didik saat ujian dimulai.
                </p>
              </div>

              {/* Table of exams */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Judul Ujian</th>
                      <th className="py-2.5 px-3">Mata Pelajaran</th>
                      <th className="py-2.5 px-3">Durasi</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {exams.map((ex) => (
                      <tr key={ex.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-bold text-slate-900">{ex.title}</td>
                        <td className="py-3 px-3 text-slate-700">{ex.subject_name || 'Matematika SD'}</td>
                        <td className="py-3 px-3 text-slate-600">{ex.duration_minutes} Menit</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            Terjadwal
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TIKET BANTUAN KE SUPERADMIN VIEW */}
          {activeMenu === 'tiket_bantuan' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-blue-600" />
                    Kirim Tiket Pengaduan Kendala ke Super Admin Pusat
                  </h2>
                  <p className="text-xs text-slate-500">
                    Ajukan kendala teknis (reset siswa, token, listrik padam) langsung ke Posko Pusmendik
                  </p>
                </div>
                <button
                  onClick={() => setShowTicketModal(true)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Tiket Baru</span>
                </button>
              </div>

              <div className="space-y-3">
                {allTickets.map((t) => (
                  <div key={t.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[10px]">
                        {t.id} • {t.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          t.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status === 'resolved' ? 'Selesai Diberi Solusi' : 'Menunggu Tindakan Posko'}
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 text-sm">{t.subject}</div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{t.description}</p>

                    {/* SuperAdmin response box */}
                    {t.response && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] space-y-1 mt-2">
                        <div className="font-bold text-emerald-900 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tanggapan dari Super Admin Pusat:</span>
                        </div>
                        <div className="text-emerald-800">{t.response}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REKAP & LAPORAN VIEW */}
          {activeMenu === 'rekap' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-blue-600" />
                    Rekapitulasi Kehadiran & Berita Acara Pelaksanaan (BAP)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Laporan kehadiran dan BAP otomatis dikirim ke server Super Admin Pusat
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Berita Acara</span>
                </button>
              </div>

              <div className="border border-slate-300 rounded-xl p-5 space-y-3 text-xs max-w-xl mx-auto bg-slate-50/40">
                <div className="text-center pb-2 border-b-2 border-slate-800">
                  <div className="font-bold text-[10px] text-slate-500 uppercase">
                    KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH
                  </div>
                  <div className="font-black text-sm uppercase text-slate-900">
                    BERITA ACARA UJIAN TKA - {currentSchool?.name}
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div>Satuan Pendidikan: <strong>{currentSchool?.name}</strong> (NPSN: {currentSchool?.npsn})</div>
                  <div>Jumlah Peserta Hadir: <strong>{students.length} Siswa (100%)</strong></div>
                  <div>Status Pelaksanaan: <strong className="text-emerald-700">Lancar & Tervalidasi</strong></div>
                </div>

                <div className="pt-2 text-[10px] text-slate-500 font-mono">
                  Dokumen ini telah tersinkronisasi otomatis ke dashboard pemantauan Super Admin Pusat.
                </div>
              </div>
            </div>
          )}

          {/* PENGATURAN AKUN VIEW */}
          {activeMenu === 'pengaturan_akun' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 max-w-xl">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <UserCog className="w-4 h-4 text-blue-600" />
                Pengaturan Akun Admin Sekolah
              </h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Nama Lengkap Admin</label>
                  <input
                    type="text"
                    disabled
                    value={user?.full_name || 'Admin Sekolah'}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email Sekolah</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'admin@sekolah.id'}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Sekolah Terkait</label>
                  <input
                    type="text"
                    disabled
                    value={currentSchool?.name || 'Sekolah'}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: Tambah Siswa */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form onSubmit={handleAddStudent} className="bg-white rounded-2xl max-w-md w-full p-6 text-slate-800 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Tambah Peserta Didik Baru</h3>
              <button type="button" onClick={() => setShowAddStudentModal(false)}>✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Bintang"
                  value={newStudent.full_name}
                  onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">NISN (10 Digit)</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="0123456789"
                    value={newStudent.nisn}
                    onChange={(e) => setNewStudent({ ...newStudent, nisn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setShowAddStudentModal(false)} className="px-3 py-1.5 border border-slate-300 rounded-lg">Batal</button>
              <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold shadow-xs">Simpan & Sinkronkan</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: Tambah Paket Ujian */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newExamTitle) return;
              const newEx: Exam = {
                id: 'exam-' + Math.random().toString(36).substring(2, 8),
                school_id: schoolId,
                subject_id: newExamSubject,
                subject_name: subjects.find((s) => s.id === newExamSubject)?.name || 'Mata Pelajaran',
                question_bank_id: questionBanks[0]?.id || 'qb-01',
                title: newExamTitle,
                grade_level: 6,
                duration_minutes: newExamDuration,
                passing_grade: 75,
                status: 'scheduled',
                randomize_questions: true,
                randomize_options: true,
                created_by: user?.id || 'admin',
                created_at: new Date().toISOString(),
              };
              tenantStore.addExam(newEx);
              setExams(tenantStore.getExams(schoolId));
              setShowAddExamModal(false);
              setNewExamTitle('');
              alert(`Paket ujian "${newEx.title}" berhasil dibuat dan dikirimkan ke Super Admin.`);
            }}
            className="bg-white rounded-2xl max-w-md w-full p-6 text-slate-800 space-y-4 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Jadwalkan Paket Ujian Baru</h3>
              <button type="button" onClick={() => setShowAddExamModal(false)}>✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Judul Paket Ujian</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Asesmen Sumatif Akhir Jenjang Matematika"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Mata Pelajaran</label>
                  <select
                    value={newExamSubject}
                    onChange={(e) => setNewExamSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    value={newExamDuration}
                    onChange={(e) => setNewExamDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setShowAddExamModal(false)} className="px-3 py-1.5 border border-slate-300 rounded-lg">Batal</button>
              <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold shadow-xs">Jadwalkan Ujian</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Buat Tiket ke SuperAdmin */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form onSubmit={handleCreateTicket} className="bg-white rounded-2xl max-w-md w-full p-6 text-slate-800 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Kirim Tiket ke Super Admin Pusat</h3>
              <button type="button" onClick={() => setShowTicketModal(false)}>✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Kategori Masalah</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="RESET_LOGIN">Reset Login Siswa</option>
                  <option value="TOKEN">Token Ujian Kedaluwarsa</option>
                  <option value="JARINGAN">Kendala Jaringan ISP</option>
                  <option value="SERVER_OFFLINE">Komputer Proktor Mati / Restart</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Judul Kendala</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siswa terputus saat pengerjaan subtes literasi"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Rincian Masalah</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Jelaskan kendala yang dialami di lab sekolah..."
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setShowTicketModal(false)} className="px-3 py-1.5 border border-slate-300 rounded-lg">Batal</button>
              <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold shadow-xs">Kirim ke Super Admin</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: Zoom Print Card */}
      {printingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Kartu Login Peserta Ujian</h3>
              <button onClick={() => setPrintingStudent(null)}>✕</button>
            </div>
            <div className="border-2 border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3 border-b-2 border-slate-800 pb-2">
                <TutWuriLogo size={40} />
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-500">KEMENTERIAN PENDIDIKAN DASAR & MENENGAH</div>
                  <div className="text-xs font-black text-slate-900">KARTU PESERTA TKA 2026</div>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <div>Nama Siswa: <strong>{printingStudent.full_name}</strong></div>
                <div>NISN: <span className="font-mono font-bold text-blue-700">{printingStudent.nisn}</span></div>
                <div>Sekolah: {currentSchool?.name} (NPSN: {currentSchool?.npsn})</div>
                <div>Rombel: {printingStudent.class_name || 'Kelas 6-A'}</div>
              </div>
              <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-300 font-mono text-xs grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] font-sans font-bold text-slate-500 block">USERNAME</span>
                  <span className="font-bold text-blue-700">U26{printingStudent.nisn}</span>
                </div>
                <div>
                  <span className="text-[9px] font-sans font-bold text-slate-500 block">PASSWORD</span>
                  <span className="font-bold text-emerald-700">P@ss{printingStudent.nisn.slice(-4)}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setPrintingStudent(null)} className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs">Tutup</button>
              <button onClick={() => window.print()} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold">Cetak Kartu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
