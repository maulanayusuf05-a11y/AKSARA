import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldAlert,
  Settings,
  GraduationCap,
  BookOpen,
  Calendar,
  KeyRound,
  FileText,
  UserCheck,
  Eye,
  CheckCircle,
  Clock,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { role, currentSchool } = useAuth();

  const renderNavItems = () => {
    switch (role) {
      case 'super_admin':
        return [
          { id: 'overview', label: 'Ringkasan Platform', icon: LayoutDashboard },
          { id: 'schools', label: 'Direktori Seluruh SD', icon: Building2 },
          { id: 'school_admins', label: 'Pengelola Admin Sekolah', icon: Users },
          { id: 'audit_logs', label: 'Audit Log Global', icon: ShieldAlert },
          { id: 'config', label: 'Konfigurasi Sistem', icon: Settings },
        ];

      case 'school_admin':
        return [
          { id: 'overview', label: 'Dashboard Sekolah', icon: LayoutDashboard },
          { id: 'school_profile', label: 'Profil Sekolah', icon: Building2 },
          { id: 'classes', label: 'Data Kelas (1 s/d 6)', icon: BookOpen },
          { id: 'students', label: 'Peserta Didik (Siswa)', icon: GraduationCap },
          { id: 'proctors', label: 'Akun Proktor / Guru', icon: UserCheck },
          { id: 'subjects', label: 'Mata Pelajaran', icon: FileSpreadsheet },
          { id: 'question_banks', label: 'Bank Soal SD', icon: FileText },
          { id: 'exams', label: 'Paket & Jadwal Ujian', icon: Calendar },
          { id: 'tokens', label: 'Token Akses Ujian', icon: KeyRound },
          { id: 'results', label: 'Hasil & Rekap Nilai', icon: CheckCircle },
          { id: 'audit_logs', label: 'Catatan Log Sekolah', icon: ShieldAlert },
        ];

      case 'proctor':
        return [
          { id: 'overview', label: 'Beranda Pengawas', icon: LayoutDashboard },
          { id: 'live_monitoring', label: 'Pemantauan Ujian Live', icon: Eye },
          { id: 'tokens', label: 'Distribusi Token Ujian', icon: KeyRound },
          { id: 'attendance', label: 'Presensi & Kehadiran', icon: Users },
          { id: 'troubleshoot', label: 'Kendala Teknis Siswa', icon: HelpCircle },
        ];

      case 'student':
        return [
          { id: 'overview', label: 'Beranda Peserta', icon: LayoutDashboard },
          { id: 'my_exams', label: 'Daftar Ujian Saya', icon: Calendar },
          { id: 'exam_room', label: 'Ruang Ujian Digital', icon: Clock },
          { id: 'my_history', label: 'Riwayat & Nilai Ujian', icon: CheckCircle },
        ];

      default:
        return [];
    }
  };

  const navItems = renderNavItems();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800 overflow-x-hidden no-scrollbar">
      {/* Role Title in Sidebar */}
      <div className="p-4 border-b border-slate-800">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Ruang Kerja
        </div>
        <div className="text-sm font-bold text-white capitalize mt-0.5 truncate">
          {role === 'super_admin'
            ? 'Super Admin Pusat'
            : role === 'school_admin'
            ? currentSchool?.name || 'Admin Sekolah'
            : role === 'proctor'
            ? 'Ruang Proktor'
            : 'Peserta Ujian SD'}
        </div>
        {currentSchool && role !== 'super_admin' && (
          <div className="text-[11px] text-blue-400 font-mono mt-0.5">
            NPSN: {currentSchool.npsn}
          </div>
        )}
      </div>

      {/* Nav Link List */}
      <nav className="p-3 space-y-1 flex-1 overflow-x-hidden overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
        <div className="flex items-center justify-between mb-1">
          <span>AKSARA CBT v1.0</span>
          <span className="text-emerald-400 font-mono">Online</span>
        </div>
        <div className="text-[10px] text-slate-600">
          Asesmen dan Kompetensi Siswa Terarah
        </div>
      </div>
    </aside>
  );
};
