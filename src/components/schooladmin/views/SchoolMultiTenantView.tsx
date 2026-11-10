import React, { useState } from 'react';
import { tenantStore } from '../../../lib/supabase';
import {
  Building2,
  ShieldCheck,
  RefreshCw,
  Lock,
  Database,
  CheckCircle,
  FileCode,
  ArrowUpDown,
  Layers,
} from 'lucide-react';

interface SchoolMultiTenantViewProps {
  schoolId: string;
  subTab?: string;
  onOpenSqlModal?: () => void;
}

export const SchoolMultiTenantView: React.FC<SchoolMultiTenantViewProps> = ({
  schoolId,
  subTab = 'schools',
  onOpenSqlModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(subTab);
  const school = tenantStore.getSchoolById(schoolId) || tenantStore.getSchools()[0];
  const students = tenantStore.getStudents(schoolId);
  const classes = tenantStore.getClasses(schoolId);
  const auditLogs = tenantStore.getAuditLogs(schoolId);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handlePerformSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      tenantStore.addAuditLog({
        school_id: schoolId,
        user_id: 'admin',
        user_role: 'school_admin',
        user_email: school?.email || '',
        action: 'TWO_WAY_SYNC_WITH_CENTER',
        entity_type: 'MULTI_TENANT',
        entity_id: schoolId,
        details: { synced_students: students.length, status: 'SUCCESS' },
      });
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 700);
  };

  return (
    <div className="space-y-5">
      {/* Scope Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-purple-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded text-[10px] font-bold uppercase tracking-wider">
                Cakupan Data Sekolah Saya
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-purple-200 font-mono">Tenant ID: {school?.id}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              <span>Fitur Multi-Tenant • {school?.name}</span>
            </h1>
            <p className="text-xs text-purple-200 mt-1 max-w-2xl leading-relaxed">
              Status isolasi data (Row Level Security), hak akses tenant independen, dan sinkronisasi dua arah antara <strong>{school?.name}</strong> dengan Super Admin Pusat.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>RLS Enforced: Aktif</span>
            </span>
          </div>
        </div>
      </div>

      {/* Subtab Navigation matching Super Admin 1:1 */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 flex flex-wrap gap-1 shadow-xs">
        <button
          onClick={() => setActiveSubTab('schools')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'schools'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Manajemen Tenant (Sekolah Binaan)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('isolation')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'isolation'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Isolasi Data & Hak Akses (RLS)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sync')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'sync'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Pusat Sinkronisasi Multi-Tenant</span>
        </button>
      </div>

      {/* 1. SUBTAB: STATUS TENANT SEKOLAH SAYA */}
      {activeSubTab === 'schools' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              Status Satuan Pendidikan sebagai Tenant ({school?.name})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identitas tenant sekolah yang terdaftar pada sistem terpusat Super Admin
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
              <div className="text-slate-500 font-semibold">Tenant Identifier (School ID)</div>
              <div className="font-mono font-bold text-purple-900 text-sm">{school?.id}</div>
              <div className="text-[10px] text-purple-700 mt-1">Kunci partisi database (Multi-Tenant)</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="text-slate-500 font-semibold">Status Keanggotaan Binaan</div>
              <div className="font-bold text-emerald-700 text-sm flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Terdaftar & Terverifikasi</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">NPSN Resmi: {school?.npsn}</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="text-slate-500 font-semibold">Kuota Peserta Didik</div>
              <div className="font-bold text-slate-900 text-sm">{students.length} / 500 Siswa Terdaftar</div>
              <div className="text-[10px] text-blue-600 mt-1">{classes.length} Rombel Kelas Aktif</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUBTAB: ISOLASI DATA (RLS) */}
      {activeSubTab === 'isolation' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              Jaminan Isolasi Data (Row Level Security / RLS)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pembuktian teknis bahwa seluruh data {school?.name} tidak dapat diakses atau bocor ke sekolah lain
            </p>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-2">
            <div className="font-bold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Isolasi Data Database Berjalan Aktif (Strict RLS Enforced)</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Setiap query SQL pada tabel <code>students</code>, <code>exams</code>, <code>scores</code>, dan <code>attendance</code> secara otomatis menerapkan klausa <code>WHERE school_id = '{school?.id}'</code>. Administrator sekolah lain hanya dapat melihat data sekolah mereka sendiri.
            </p>
          </div>

          {onOpenSqlModal && (
            <div className="flex justify-start">
              <button
                onClick={onOpenSqlModal}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Lihat Kode Aturan Keamanan SQL (Schema Viewer)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. SUBTAB: PUSAT SINKRONISASI */}
      {activeSubTab === 'sync' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-purple-600" />
                Sinkronisasi Dua Arah dengan Super Admin Pusat
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kirim data siswa, presensi, dan hasil ujian ke server pusat Super Admin, serta terima paket soal dan token terbaru
              </p>
            </div>

            <button
              onClick={handlePerformSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sedang Menyinkronkan...' : 'Sinkronkan Data Sekarang'}</span>
            </button>
          </div>

          {syncSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Data {school?.name} berhasil disinkronkan secara real-time dengan Super Admin Pusat!</span>
            </div>
          )}

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="font-bold text-xs text-slate-800">Riwayat Log Sinkronisasi ({school?.name}):</div>
            <div className="divide-y divide-slate-200 text-xs font-mono">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="py-2 flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-[10px] text-slate-400">({log.entity_type})</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{new Date(log.created_at).toLocaleTimeString('id-ID')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
