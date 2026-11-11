import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TutWuriLogo } from '../common/TutWuriLogo';
import { TkaDashboardView } from './views/TkaDashboardView';
import { TkaVerifikasiPendaftaranView } from './views/TkaVerifikasiPendaftaranView';
import { TkaKelolaSekolahView } from './views/TkaKelolaSekolahView';
import { TkaRekapLaporanView } from './views/TkaRekapLaporanView';
import { TkaAdministrasiTesView } from './views/TkaAdministrasiTesView';
import { TkaTiketBantuanView } from './views/TkaTiketBantuanView';
import { TkaMultiTenantView } from './views/TkaMultiTenantView';
import { TkaPengaturanAkunView } from './views/TkaPengaturanAkunView';
import { tenantStore } from '../../lib/supabase';
import { tkaStore } from '../../lib/tkaStore';
import { SchoolPermissionRequest } from '../../types/tka';
import {
  Menu,
  Home,
  Settings,
  LogOut,
  LayoutDashboard,
  BarChart2,
  Ticket,
  Building2,
  ShieldCheck,
  Radio,
  UserCog,
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Layers,
  KeyRound,
  FileText,
  UserCheck,
  Plus,
  Send,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface SuperAdminPortalProps {
  onOpenSqlModal: () => void;
}

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({ onOpenSqlModal }) => {
  const { logout } = useAuth();

  // Navigation State
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [activeSubMenu, setActiveSubMenu] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Modals state for Alert (Notification) & User (School Permission Requests)
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  const [permissionFilter, setPermissionFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showNewPermModal, setShowNewPermModal] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // New permission form state
  const [permSchoolName, setPermSchoolName] = useState('SDN 01 Menteng Jakarta');
  const [permNpsn, setPermNpsn] = useState('20101001');
  const [permProctor, setPermProctor] = useState('Hendra Wijaya, S.Pd');
  const [permType, setPermType] = useState<SchoolPermissionRequest['request_type']>('UJIAN_SUSULAN');
  const [permTitle, setPermTitle] = useState('');
  const [permReason, setPermReason] = useState('');
  const [permCount, setPermCount] = useState(5);

  // Data
  const schools = tenantStore.getSchools();
  const pendingSchools = schools.filter((s) => s.status === 'pending');
  const pendingCount = pendingSchools.length;

  const tickets = tkaStore.getTickets();
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress');
  const openTicketCount = openTickets.length;

  const [permissionRequests, setPermissionRequests] = useState<SchoolPermissionRequest[]>(() =>
    tkaStore.getPermissionRequests()
  );
  const pendingPermissions = permissionRequests.filter((p) => p.status === 'pending');
  const pendingPermCount = pendingPermissions.length;

  // Total alert notifications count (Verifikasi pending + Tiket bantuan open + Permohonan izin pending)
  const totalAlertCount = pendingCount + openTicketCount + pendingPermCount;

  const navigateTo = (menu: string, sub = '') => {
    setActiveMenu(menu);
    setActiveSubMenu(sub);
  };

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Handle Approve Permission
  const handleApprovePermission = (perm: SchoolPermissionRequest) => {
    tkaStore.updatePermissionRequest(perm.id, 'approved');
    setPermissionRequests(tkaStore.getPermissionRequests());
    tenantStore.addAuditLog({
      school_id: perm.school_id,
      user_id: 'user-superadmin-01',
      user_role: 'super_admin',
      user_email: 'admin@kemdikbud.edujian.id',
      action: 'APPROVE_PERMISSION',
      entity_type: 'SCHOOL_PERMISSION',
      entity_id: perm.id,
      details: { title: perm.title, school: perm.school_name },
    });
    showToast(`Permohonan izin "${perm.title}" dari ${perm.school_name} telah disetujui!`);
  };

  // Handle Reject Permission
  const handleRejectPermission = (perm: SchoolPermissionRequest) => {
    const reason = prompt('Masukkan alasan penolakan permohonan izin ini:', 'Persyaratan administratif belum lengkap');
    if (reason !== null) {
      tkaStore.updatePermissionRequest(perm.id, 'rejected', reason || 'Ditolak oleh Administrator Pusat');
      setPermissionRequests(tkaStore.getPermissionRequests());
      tenantStore.addAuditLog({
        school_id: perm.school_id,
        user_id: 'user-superadmin-01',
        user_role: 'super_admin',
        user_email: 'admin@kemdikbud.edujian.id',
        action: 'REJECT_PERMISSION',
        entity_type: 'SCHOOL_PERMISSION',
        entity_id: perm.id,
        details: { reason, title: perm.title, school: perm.school_name },
      });
      showToast(`Permohonan izin dari ${perm.school_name} telah ditolak.`);
    }
  };

  // Submit New Permission Request (Simulation)
  const handleCreatePermission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permTitle.trim() || !permReason.trim()) return;

    tkaStore.addPermissionRequest({
      school_id: 'sdn-01-menteng-uuid-001',
      school_name: permSchoolName.trim(),
      npsn: permNpsn.trim(),
      proctor_or_admin: permProctor.trim(),
      request_type: permType,
      title: permTitle.trim(),
      reason: permReason.trim(),
      student_count: permCount,
    });

    setPermissionRequests(tkaStore.getPermissionRequests());
    setShowNewPermModal(false);
    setPermTitle('');
    setPermReason('');
    showToast('Permohonan izin baru dari sekolah berhasil dicatat ke sistem pusat.');
  };

  const filteredPermissions = permissionRequests.filter((p) => {
    if (permissionFilter === 'all') return true;
    return p.status === permissionFilter;
  });

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-sans text-slate-800 antialiased">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackToast}</span>
          <button onClick={() => setFeedbackToast(null)} className="ml-2 text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 1. TOP HEADER / APP BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 h-14 flex items-center justify-between px-3 sm:px-6 shadow-xs">
        {/* Left: Sidebar toggle + Institution Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            title="Sembunyikan / Tampilkan Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Alert Symbol, User Permission Symbol, Superadmin Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* SIMBOL ALERT (Notifikasi Verifikasi Pendaftaran, Tiket Bantuan Admin Sekolah, dll) */}
          <button
            onClick={() => setShowAlertModal(true)}
            className="relative p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition cursor-pointer border border-transparent hover:border-amber-200"
            title="Pusat Notifikasi & Siaga (Verifikasi Pendaftaran & Tiket Bantuan)"
          >
            <Bell className="w-5 h-5" />
            {totalAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse">
                {totalAlertCount}
              </span>
            )}
          </button>

          {/* SIMBOL USER (Sekolah yang Meminta Izin) */}
          <button
            onClick={() => setShowPermissionModal(true)}
            className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer border border-transparent hover:border-blue-200"
            title="Sekolah yang Meminta Izin (Permohonan Izin Operasional, Sesi & Ujian Susulan)"
          >
            <UserCheck className="w-5 h-5" />
            {pendingPermCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                {pendingPermCount}
              </span>
            )}
          </button>

          {/* Super Admin Avatar */}
          <div
            onClick={() => navigateTo('pengaturan_akun')}
            className="w-8 h-8 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer hover:ring-2 hover:ring-orange-300 transition"
            title="Profil Pengguna Super Admin Pusat"
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
                SINTESA PUSAT
              </div>
              <div className="text-[10px] font-semibold text-slate-500 leading-tight mt-0.5 max-w-[240px]">
                Sistem Informasi Tes dan Asesmen
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
                title="Menuju Dashboard SINTESA"
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
              {/* SECTION 1: PENGAWASAN SINTESA */}
              <div className="px-3 pt-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                PENGAWASAN SINTESA
              </div>

              {/* 1. Dashboard SINTESA */}
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
                  <span className="leading-snug break-words">Dashboard SINTESA</span>
                </div>
              </button>

              {/* 2. Verifikasi Pendaftaran Sekolah */}
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

              {/* 4. Monitoring Ujian SINTESA */}
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
                  <span className="leading-snug break-words">Monitoring Ujian SINTESA</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              </button>

              {/* SECTION 2: KEBIJAKAN & OPERASIONAL PUSAT */}
              <div className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                KEBIJAKAN & OPERASIONAL PUSAT
              </div>

              {/* 5. Kebijakan & Token SINTESA */}
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

              {/* 6. Rekapitulasi & Statistik SINTESA */}
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
                  <span className="leading-snug break-words">Rekapitulasi SINTESA</span>
                </div>
              </button>

              {/* SECTION 3: LAYANAN & SISTEM */}
              <div className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-wider text-purple-700 uppercase flex items-center justify-between">
                <span>LAYANAN & SISTEM</span>
              </div>

              {/* 7. Pusat Tiket Bantuan (Helpdesk) */}
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

              {/* 8. Keamanan & Arsitektur Multi-Tenant */}
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

              {/* 9. Pengaturan Akun Superadmin */}
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

      {/* ========================================================================= */}
      {/* MODAL 1: PUSAT NOTIFIKASI & SIAGA (DIPICU OLEH SIMBOL ALERT)             */}
      {/* ========================================================================= */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">Pusat Notifikasi & Siaga SINTESA</h3>
                  <p className="text-xs text-amber-100">
                    Notifikasi verifikasi pendaftaran sekolah, usulan tiket bantuan, dan permohonan izin
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAlertModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Quick KPI Counters */}
            <div className="grid grid-cols-3 gap-2 p-4 bg-amber-50/50 border-b border-amber-100 text-center">
              <div className="p-2.5 bg-white rounded-xl border border-amber-200/80 shadow-xs">
                <div className="text-[10px] font-bold text-amber-700 uppercase">Verifikasi Pending</div>
                <div className="text-lg font-black text-amber-950 mt-0.5">{pendingCount} Sekolah</div>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-amber-200/80 shadow-xs">
                <div className="text-[10px] font-bold text-red-700 uppercase">Tiket Bantuan Aktif</div>
                <div className="text-lg font-black text-red-950 mt-0.5">{openTicketCount} Tiket</div>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-amber-200/80 shadow-xs">
                <div className="text-[10px] font-bold text-blue-700 uppercase">Permohonan Izin</div>
                <div className="text-lg font-black text-blue-950 mt-0.5">{pendingPermCount} Permintaan</div>
              </div>
            </div>

            {/* Notification Items List */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* SECTION A: VERIFIKASI PENDAFTARAN SEKOLAH */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  <span className="flex items-center gap-1.5 text-amber-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Verifikasi Pendaftaran Satuan Pendidikan ({pendingCount})</span>
                  </span>
                  <button
                    onClick={() => {
                      setShowAlertModal(false);
                      navigateTo('verifikasi_pendaftaran');
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Buka Halaman Verifikasi →
                  </button>
                </div>

                {pendingSchools.length === 0 ? (
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-400 text-center text-xs">
                    Semua sekolah telah diverifikasi. Tidak ada pendaftaran pending.
                  </div>
                ) : (
                  pendingSchools.map((sch) => (
                    <div
                      key={sch.id}
                      className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{sch.name}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          NPSN: <span className="font-mono font-semibold">{sch.npsn}</span> • {sch.city_regency}, {sch.province}
                        </div>
                        <div className="text-[10px] text-amber-700 font-medium mt-1">
                          Menunggu verifikasi keabsahan data & penetapan status aktif
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowAlertModal(false);
                          navigateTo('verifikasi_pendaftaran');
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition"
                      >
                        Periksa Berkas
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* SECTION B: ADMIN SEKOLAH YANG MENGUSULKAN TIKET BANTUAN */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  <span className="flex items-center gap-1.5 text-red-800">
                    <Ticket className="w-3.5 h-3.5 text-red-600" />
                    <span>Usulan Tiket Bantuan dari Admin Sekolah ({openTicketCount})</span>
                  </span>
                  <button
                    onClick={() => {
                      setShowAlertModal(false);
                      navigateTo('tiket_bantuan');
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Buka Posko Tiket →
                  </button>
                </div>

                {openTickets.length === 0 ? (
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-400 text-center text-xs">
                    Tidak ada tiket bantuan yang berstatus terbuka saat ini.
                  </div>
                ) : (
                  openTickets.map((tkt) => (
                    <div
                      key={tkt.id}
                      className="p-3.5 bg-red-50/60 border border-red-200 rounded-xl flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                            {tkt.id}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">{tkt.school_name}</span>
                        </div>
                        <div className="font-semibold text-slate-800 text-xs">{tkt.subject}</div>
                        <div className="text-[11px] text-slate-600 line-clamp-1">{tkt.description}</div>
                        <div className="text-[10px] text-slate-400">
                          Diajukan oleh: <span className="font-medium text-slate-700">{tkt.proctor_name}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowAlertModal(false);
                          navigateTo('tiket_bantuan');
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shrink-0 transition"
                      >
                        Tanggapi
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* SECTION C: PERMOHONAN IZIN SEKOLAH PREVIEW */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  <span className="flex items-center gap-1.5 text-blue-800">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Permohonan Izin Sekolah ({pendingPermCount})</span>
                  </span>
                  <button
                    onClick={() => {
                      setShowAlertModal(false);
                      setShowPermissionModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Buka Detail Izin Sekolah →
                  </button>
                </div>

                {pendingPermissions.map((perm) => (
                  <div
                    key={perm.id}
                    className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{perm.school_name}</div>
                      <div className="text-[11px] text-slate-700">{perm.title}</div>
                      <div className="text-[10px] text-blue-700 font-medium mt-0.5">
                        Tipe: {perm.request_type.replace(/_/g, ' ')} • {perm.student_count || 0} Siswa
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowAlertModal(false);
                        setShowPermissionModal(true);
                      }}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0"
                    >
                      Tinjau
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Pusat Komando Asesmen Pendidikan & Sistem Siaga Real-Time
              </span>
              <button
                onClick={() => setShowAlertModal(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SEKOLAH YANG MEMINTA IZIN (DIPICU OLEH SIMBOL USER)             */}
      {/* ========================================================================= */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">
                    Sekolah yang Meminta Izin (Permohonan Izin Satuan Pendidikan)
                  </h3>
                  <p className="text-xs text-blue-100">
                    Otoritas Super Admin Pusat untuk menyetujui ujian susulan, sesi tambahan, reset massal, & dispensasi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNewPermModal(true)}
                  className="px-3 py-1.5 bg-white text-blue-800 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Simulasi Permohonan</span>
                </button>
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPermissionFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    permissionFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua ({permissionRequests.length})
                </button>
                <button
                  onClick={() => setPermissionFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    permissionFilter === 'pending'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Menunggu Persetujuan ({pendingPermCount})
                </button>
                <button
                  onClick={() => setPermissionFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    permissionFilter === 'approved'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Disetujui ({permissionRequests.filter((p) => p.status === 'approved').length})
                </button>
                <button
                  onClick={() => setPermissionFilter('rejected')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    permissionFilter === 'rejected'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Ditolak ({permissionRequests.filter((p) => p.status === 'rejected').length})
                </button>
              </div>

              <span className="text-[11px] text-slate-500 font-medium">
                Persetujuan langsung berlaku otomatis ke server proktor sekolah
              </span>
            </div>

            {/* List of Requests */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {filteredPermissions.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <UserCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <div className="font-semibold text-slate-600">Tidak ada permohonan izin dalam filter ini</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Gunakan tombol "Simulasi Permohonan" untuk mencoba membuat permohonan baru dari sekolah.
                  </div>
                </div>
              ) : (
                filteredPermissions.map((perm) => (
                  <div
                    key={perm.id}
                    className={`p-4 rounded-xl border transition shadow-xs space-y-3 ${
                      perm.status === 'pending'
                        ? 'bg-amber-50/50 border-amber-200'
                        : perm.status === 'approved'
                        ? 'bg-white border-emerald-200'
                        : 'bg-white border-rose-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {perm.id}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{perm.school_name}</span>
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          NPSN: {perm.npsn}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            perm.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                              : perm.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {perm.status === 'pending'
                            ? 'Menunggu Persetujuan'
                            : perm.status === 'approved'
                            ? 'Telah Disetujui'
                            : 'Ditolak'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {perm.request_type.replace(/_/g, ' ')}
                        </span>
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">{perm.title}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-xs">{perm.reason}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <div className="flex items-center gap-3">
                        <span>
                          Pengaju: <strong className="text-slate-700">{perm.proctor_or_admin}</strong>
                        </span>
                        {perm.student_count && (
                          <span>
                            Siswa: <strong className="text-slate-700">{perm.student_count} anak</strong>
                          </span>
                        )}
                        <span>
                          Waktu: {new Date(perm.submitted_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>

                      {/* Action buttons if pending */}
                      {perm.status === 'pending' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleRejectPermission(perm)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg font-bold transition flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                          <button
                            onClick={() => handleApprovePermission(perm)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs transition flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Setujui Izin</span>
                          </button>
                        </div>
                      )}

                      {perm.status === 'approved' && (
                        <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Izin Aktif & Terdistribusi ke Proktor</span>
                        </div>
                      )}

                      {perm.status === 'rejected' && perm.rejection_note && (
                        <div className="text-rose-600 font-medium">
                          Alasan: {perm.rejection_note}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Pusat Layanan Dispensasi & Regulasi Asesmen Sekolah Dasar
              </span>
              <button
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: FORM SIMULASI PERMOHONAN IZIN BARU DARI SEKOLAH                  */}
      {/* ========================================================================= */}
      {showNewPermModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreatePermission}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Simulasi Buat Permohonan Izin Sekolah
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPermModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nama Sekolah</label>
                  <input
                    type="text"
                    required
                    value={permSchoolName}
                    onChange={(e) => setPermSchoolName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NPSN</label>
                  <input
                    type="text"
                    required
                    value={permNpsn}
                    onChange={(e) => setPermNpsn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jenis Izin</label>
                  <select
                    value={permType}
                    onChange={(e) => setPermType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UJIAN_SUSULAN">Ujian Susulan</option>
                    <option value="SESI_TAMBAHAN">Sesi Tambahan</option>
                    <option value="RESET_LOGIN_MASSAL">Reset Kunci Massal</option>
                    <option value="MODA_ASESMEN">Perubahan Moda Asesmen</option>
                    <option value="DISPENSASI_LAB">Dispensasi Kapasitas Lab</option>
                    <option value="TOKEN_DARURAT">Token Darurat Khusus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jumlah Siswa Terkait</label>
                  <input
                    type="number"
                    min={1}
                    value={permCount}
                    onChange={(e) => setPermCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Judul Permohonan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Permohonan Ujian Susulan Siswa Rawat Inap"
                  value={permTitle}
                  onChange={(e) => setPermTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Alasan & Rincian</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan kendala teknis atau alasan permohonan izin ini diajukan ke Super Admin Pusat..."
                  value={permReason}
                  onChange={(e) => setPermReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNewPermModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Permohonan Izin</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
