import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { tenantStore } from '../../lib/supabase';
import { School, AuditLog, SchoolStatus } from '../../types/database';
import {
  Building2,
  Users,
  GraduationCap,
  FileCheck2,
  ShieldAlert,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Shield,
  Clock,
  Sparkles,
  Layers,
  Activity,
  AlertTriangle,
} from 'lucide-react';

interface SuperAdminDashboardProps {
  activeTab: string;
  onOpenSqlModal: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ activeTab, onOpenSqlModal }) => {
  const { allSchools, refreshSchoolData, user } = useAuth();

  // Data queries
  const allProfiles = tenantStore.getProfiles();
  const allStudents = tenantStore.getStudents();
  const allProctors = tenantStore.getProctors();
  const allExams = tenantStore.getExams();
  const allLogs = tenantStore.getAuditLogs();

  // Local state for School Directory
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Toggle school status
  const handleToggleSchoolStatus = (school: School) => {
    const nextStatus: SchoolStatus = school.status === 'active' ? 'suspended' : 'active';
    const updated: School = { ...school, status: nextStatus };
    tenantStore.saveSchool(updated);
    tenantStore.addAuditLog({
      school_id: school.id,
      user_id: user?.id || 'superadmin',
      user_role: 'super_admin',
      user_email: user?.email || 'admin@kemdikbud.edujian.id',
      action: nextStatus === 'active' ? 'ACTIVATE_SCHOOL' : 'SUSPEND_SCHOOL',
      entity_type: 'SCHOOL',
      entity_id: school.id,
      details: { school_name: school.name, previous_status: school.status, new_status: nextStatus },
    });
    refreshSchoolData();
  };

  const filteredSchools = allSchools.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.npsn.includes(searchTerm) ||
      s.city_regency.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Platform Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 bg-purple-400/20 text-purple-200 border border-purple-300/30 rounded-md text-[10px] font-bold tracking-wider uppercase">
              Super Admin Pengendali Utama
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-purple-200">Kementerian Pendidikan Dasar & Menengah RI</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Dashboard Pemantauan Nasional
          </h1>
          <p className="text-xs text-purple-200/90 max-w-2xl mt-1">
            Pengawasan terpusat ekosistem ujian sekolah dasar lintas sekolah dengan perlindungan data multi-tenant dan audit log keamanan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSqlModal}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-xs flex items-center gap-2 transition"
          >
            <Layers className="w-4 h-4 text-purple-200" />
            <span>Skema Database Supabase</span>
          </button>
        </div>
      </div>

      {/* 5 KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Sekolah SD</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{allSchools.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>{allSchools.filter((s) => s.status === 'active').length} Sekolah Aktif</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Admin Sekolah</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {allProfiles.filter((p) => p.role === 'school_admin').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Pengelola Ujian Sekolah</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Guru / Proktor</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{allProctors.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Pengawas Terdaftar</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Peserta Didik (SD)</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{allStudents.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Siswa Terdata Nasional</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Paket Ujian Dibuat</span>
            <FileCheck2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{allExams.length}</div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">Seluruh Sekolah</div>
        </div>
      </div>

      {/* SECTION TABS CONTENT */}
      {activeTab === 'overview' || activeTab === 'schools' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Direktori Satuan Pendidikan Terdaftar
              </h2>
              <p className="text-xs text-slate-500">
                Pusat data sekolah dasar dengan kendali status operasional dan isolasi data per NPSN
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama, NPSN, kota..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1.5 px-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="suspended">Nonaktif (Suspended)</option>
              </select>
            </div>
          </div>

          {/* Table List of Schools */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">NPSN & Nama Sekolah</th>
                  <th className="py-2.5 px-3">Jenjang / Status</th>
                  <th className="py-2.5 px-3">Wilayah</th>
                  <th className="py-2.5 px-3">Kepala Sekolah</th>
                  <th className="py-2.5 px-3">Status Sistem</th>
                  <th className="py-2.5 px-3 text-right">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchools.map((sch) => {
                  const studentCount = tenantStore.getStudents(sch.id).length;
                  const examCount = tenantStore.getExams(sch.id).length;
                  return (
                    <tr key={sch.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{sch.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          NPSN: <span className="text-blue-700 font-semibold">{sch.npsn}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                          {sch.education_level} • {sch.school_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <div>{sch.city_regency}</div>
                        <div className="text-[10px] text-slate-400">{sch.province}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {sch.principal_name}
                      </td>
                      <td className="py-3 px-3">
                        {sch.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 text-red-600" />
                            Dinonaktifkan
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedSchool(sch)}
                          className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-medium transition"
                          title="Lihat Detail Profil Sekolah"
                        >
                          Detail
                        </button>

                        <button
                          onClick={() => handleToggleSchoolStatus(sch)}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium border transition ${
                            sch.status === 'active'
                              ? 'text-red-700 border-red-200 hover:bg-red-50'
                              : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          {sch.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* TAB: AUDIT LOGS GLOBAL */}
      {activeTab === 'audit_logs' || activeTab === 'overview' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-600" />
                Catatan Audit Log Keamanan Platform (Immutability Log)
              </h2>
              <p className="text-xs text-slate-500">
                Mencatat setiap aksi administratif, perubahan status sekolah, pendaftaran, dan pengawasan ujian
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total {allLogs.length} Rekaman Log
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2 px-3">Waktu & Tanggal</th>
                  <th className="py-2 px-3">Peran & Pengguna</th>
                  <th className="py-2 px-3">Tindakan (Action)</th>
                  <th className="py-2 px-3">Entitas</th>
                  <th className="py-2 px-3">Rincian Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {allLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-bold text-slate-800">{log.user_email}</div>
                      <span className="text-[10px] uppercase text-purple-600 bg-purple-50 px-1 py-0.2 rounded font-sans">
                        {log.user_role}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600">{log.entity_type}</td>
                    <td className="py-2 px-3 text-slate-500 max-w-xs truncate font-sans text-xs">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* TAB: SCHOOL ADMIN MANAGERS */}
      {activeTab === 'school_admins' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Daftar Akun Pengelola Admin Sekolah
              </h2>
              <p className="text-xs text-slate-500">
                Akun berwenang mengelola bank soal, siswa, dan pelaksanaan ujian di tiap sekolah
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Nama Lengkap</th>
                  <th className="py-2.5 px-3">Alamat Email</th>
                  <th className="py-2.5 px-3">Sekolah Terkait</th>
                  <th className="py-2.5 px-3">No. Telepon</th>
                  <th className="py-2.5 px-3">Terdaftar Sejak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allProfiles
                  .filter((p) => p.role === 'school_admin')
                  .map((p) => {
                    const sch = allSchools.find((s) => s.id === p.school_id);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-bold text-slate-800">{p.full_name}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{p.email}</td>
                        <td className="py-2.5 px-3 font-semibold text-blue-700">
                          {sch ? sch.name : 'Belum Terhubung'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{p.phone || '-'}</td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {new Date(p.created_at).toLocaleDateString('id-ID')}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SYSTEM CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              Konfigurasi Global Aplikasi & Kebijakan Keamanan
            </h2>
            <p className="text-xs text-slate-500">
              Pengaturan operasional ujian yang berlaku bagi seluruh penyewa (multi-tenant)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-xs text-slate-800">
                Batas Masa Berlaku Token Ujian Default
              </div>
              <p className="text-[11px] text-slate-500">
                Secara default, token ujian di-generate dengan masa berlaku 120 menit untuk menjaga integritas ruang ujian.
              </p>
              <div className="font-mono text-xs font-semibold text-blue-700">120 Menit (2 Jam)</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-xs text-slate-800">
                Pencegahan Kecurangan Siswa SD (Exam Mode)
              </div>
              <p className="text-[11px] text-slate-500">
                Siswa dibatasi dari berpindah tab atau aplikasi selama pengerjaan soal ujian digital.
              </p>
              <div className="font-mono text-xs font-semibold text-emerald-700">Aktif (Auto-Warning)</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-xs text-slate-800">
                Pemisahan Data Pilihan Jawaban Benar (RLS)
              </div>
              <p className="text-[11px] text-slate-500">
                Kolom is_correct pada opsi jawaban ditutupi dari API siswa menggunakan Row Level Security Supabase.
              </p>
              <div className="font-mono text-xs font-semibold text-emerald-700">Terenkripsi & Terisolasi RLS</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-xs text-slate-800">
                Pencadangan & Replikasi Database
              </div>
              <p className="text-[11px] text-slate-500">
                Pencadangan otomatis setiap malam dengan retensi 30 hari untuk data seluruh sekolah.
              </p>
              <div className="font-mono text-xs font-semibold text-blue-700">Daily Automated Backup</div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR SELECTED SCHOOL */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">{selectedSchool.name}</h3>
              </div>
              <button
                onClick={() => setSelectedSchool(null)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 bg-slate-100 rounded"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">NPSN</span>
                  <span className="font-mono font-bold text-blue-700">{selectedSchool.npsn}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Status Sekolah</span>
                  <span className="capitalize font-semibold">{selectedSchool.school_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Kepala Sekolah</span>
                  <span className="font-semibold text-slate-800">{selectedSchool.principal_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Status Akses</span>
                  <span className="font-semibold text-emerald-700 capitalize">{selectedSchool.status}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block uppercase mb-0.5">Alamat Lengkap</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {selectedSchool.address}, Kec. {selectedSchool.district}, {selectedSchool.city_regency}, {selectedSchool.province}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-blue-600 text-[10px] block uppercase">Jumlah Siswa</span>
                  <span className="text-lg font-bold text-blue-900">
                    {tenantStore.getStudents(selectedSchool.id).length} Siswa
                  </span>
                </div>
                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
                  <span className="text-purple-600 text-[10px] block uppercase">Jumlah Ujian</span>
                  <span className="text-lg font-bold text-purple-900">
                    {tenantStore.getExams(selectedSchool.id).length} Paket
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
