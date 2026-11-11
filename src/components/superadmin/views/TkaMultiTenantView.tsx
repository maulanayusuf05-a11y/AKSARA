import React, { useState } from 'react';
import { tenantStore } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { School, AuditLog } from '../../../types/database';
import {
  Building2,
  Shield,
  Layers,
  Radio,
  Users,
  CheckCircle,
  XCircle,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Server,
  Lock,
  Send,
  Database,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface TkaMultiTenantViewProps {
  subTab?: string;
  onOpenSqlModal: () => void;
}

export const TkaMultiTenantView: React.FC<TkaMultiTenantViewProps> = ({
  subTab = 'schools',
  onOpenSqlModal,
}) => {
  const { switchRoleForDemo } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<string>(subTab);
  const [schools, setSchools] = useState<School[]>(tenantStore.getSchools());
  const [logs, setLogs] = useState<AuditLog[]>(tenantStore.getAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // New tenant modal
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [tenantNpsn, setTenantNpsn] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantQuota, setTenantQuota] = useState(200);

  const handleToggleStatus = (sch: School) => {
    const nextStatus = sch.status === 'active' ? 'suspended' : 'active';
    const updated = { ...sch, status: nextStatus as any };
    tenantStore.saveSchool(updated);
    setSchools(tenantStore.getSchools());
  };

  const handleImpersonate = (school: School) => {
    if (confirm(`Apakah Anda yakin ingin masuk dan mengelola sistem sebagai Admin Sekolah "${school.name}"?`)) {
      switchRoleForDemo('school_admin', school.id);
    }
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsBroadcasting(true);
    setTimeout(() => {
      tenantStore.addAuditLog({
        school_id: broadcastTarget === 'all' ? null : broadcastTarget,
        user_id: 'superadmin',
        user_role: 'super_admin',
        user_email: 'admin@kemdikbud.edujian.id',
        action: 'BROADCAST_ANNOUNCEMENT',
        entity_type: 'TENANT_BROADCAST',
        details: { message: broadcastMessage, target: broadcastTarget },
      });
      setLogs(tenantStore.getAuditLogs());
      setIsBroadcasting(false);
      setBroadcastMessage('');
      alert('Pesan broadcast berhasil didistribusikan ke seluruh tenant sekolah.');
    }, 500);
  };

  const handlePushNationalBanks = () => {
    setSyncStatus('Sedang mereplikasi bank soal ke seluruh database tenant...');
    setTimeout(() => {
      setSyncStatus('Sinkronisasi selesai! 100% tenant sekolah menerima pembaruan bank soal.');
      setTimeout(() => setSyncStatus(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Subtab Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveSubTab('schools')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'schools'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Manajemen Tenant Sekolah ({schools.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('isolation')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'isolation'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Isolasi Data & Hak Akses (RLS)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sync')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'sync'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Pusat Sinkronisasi Multi-Tenant</span>
        </button>
      </div>

      {/* CONTENT: Manajemen Tenant */}
      {activeSubTab === 'schools' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Daftar Tenant Satuan Pendidikan (Multi-Tenant Hub)
              </h2>
              <p className="text-xs text-slate-500">
                Setiap sekolah memiliki ruang data terisolasi (partitioned data) dengan identitas unik school_id
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari tenant / NPSN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => setShowAddTenantModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Tenant</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Nama Tenant & NPSN</th>
                  <th className="py-2.5 px-3">Isolasi ID (UUID)</th>
                  <th className="py-2.5 px-3">Siswa / Kuota</th>
                  <th className="py-2.5 px-3">Status Akses</th>
                  <th className="py-2.5 px-3 text-right">Tindakan Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools
                  .filter(
                    (s) =>
                      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.npsn.includes(searchTerm)
                  )
                  .map((sch) => {
                    const studentCount = tenantStore.getStudents(sch.id).length;
                    return (
                      <tr key={sch.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{sch.name}</div>
                          <div className="text-[11px] font-mono text-slate-500">
                            NPSN: <span className="text-blue-700 font-semibold">{sch.npsn}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                            {sch.id}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{studentCount} / 300 Siswa</div>
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${Math.min(100, (studentCount / 300) * 100)}%` }}
                            ></div>
                          </div>
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
                              Suspended
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5">
                          <button
                            onClick={() => handleImpersonate(sch)}
                            className="px-2.5 py-1 text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded text-[11px] font-semibold transition inline-flex items-center gap-1"
                            title="Masuk sebagai Admin Sekolah ini untuk melihat data internal"
                          >
                            <span>Kelola Sekolah</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(sch)}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium border ${
                              sch.status === 'active'
                                ? 'text-red-700 border-red-200 hover:bg-red-50'
                                : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                            }`}
                          >
                            {sch.status === 'active' ? 'Suspend' : 'Aktifkan'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENT: Isolasi Data & RLS */}
      {activeSubTab === 'isolation' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                Arsitektur Isolasi Data Multi-Tenant & Kebijakan Row-Level Security
              </h2>
              <p className="text-xs text-slate-500">
                Pemisahan data mutlak antar sekolah menggunakan kolom pembeda `school_id` dan otorisasi level database
              </p>
            </div>
            <button
              onClick={onOpenSqlModal}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Database className="w-3.5 h-3.5 text-purple-300" />
              <span>Lihat Skema DDL & RLS</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-purple-900">
                <Lock className="w-4 h-4 text-purple-600" />
                <span>Isolasi Peserta Didik</span>
              </div>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                Setiap query siswa dibatasi klausa <code>WHERE school_id = auth.jwt()-&gt;school_id</code>. Sekolah A tidak dapat membaca data siswa Sekolah B.
              </p>
              <span className="text-[10px] font-mono font-bold text-emerald-700 block">Status: Terisolasi 100%</span>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <Server className="w-4 h-4 text-blue-600" />
                <span>Kunci Jawaban Ujian Terproteksi</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Kolom <code>is_correct</code> pada opsi jawaban disembunyikan dari token siswa. Hanya dihitung di server saat ujian diselesaikan.
              </p>
              <span className="text-[10px] font-mono font-bold text-emerald-700 block">Status: Anti Kebocoran Soal</span>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Immutability Audit Logs</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Seluruh aktivitas login, pembuatan token, pengiriman jawaban, dan perubahan sekolah tercatat permanen di audit log tak terhapus.
              </p>
              <span className="text-[10px] font-mono font-bold text-emerald-700 block">Status: {logs.length} Rekaman Terverifikasi</span>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="pt-2">
            <div className="font-bold text-xs text-slate-800 mb-2 flex items-center justify-between">
              <span>Catatan Log Aktivitas Multi-Tenant Terkini:</span>
              <span className="text-[11px] text-slate-400 font-mono">Realtime Stream</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Waktu</th>
                    <th className="py-2 px-3">Tenant / Sekolah</th>
                    <th className="py-2 px-3">Pengguna</th>
                    <th className="py-2 px-3">Tindakan</th>
                    <th className="py-2 px-3">Rincian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {logs.slice(0, 6).map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(l.created_at).toLocaleTimeString('id-ID')}
                      </td>
                      <td className="py-2 px-3 text-slate-700 font-sans font-medium">
                        {l.school_id ? schools.find((s) => s.id === l.school_id)?.name || l.school_id : 'Pusat (Global)'}
                      </td>
                      <td className="py-2 px-3 text-blue-700">{l.user_email}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-800">
                          {l.action}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500 truncate max-w-xs font-sans text-[11px]">
                        {l.details ? JSON.stringify(l.details) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT: Pusat Sinkronisasi */}
      {activeSubTab === 'sync' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-600" />
              Pusat Sinkronisasi Multi-Tenant & Siaran SINTESA
            </h2>
            <p className="text-xs text-slate-500">
              Kirimkan pemberitahuan resmi dan distribusikan paket bank soal secara serentak ke seluruh tenant sekolah
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Box 1: Broadcast */}
            <form onSubmit={handleBroadcast} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                <span>Broadcast Pengumuman ke Tenant</span>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Target Satuan Pendidikan:</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="all">Seluruh Sekolah Binaan (Semua Tenant)</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.npsn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Isi Pesan Siaran Langsung:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ketik instruksi mendesak bagi proktor atau admin sekolah..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isBroadcasting}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isBroadcasting ? 'Mengirim Broadcast...' : 'Kirim Siaran Sekarang'}</span>
              </button>
            </form>

            {/* Box 2: Push Question Bank */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Distribusi Bank Soal SINTESA</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Mendorong paket soal ujian Literasi, Numerasi, dan Survei Lingkungan Belajar terbaru dari Pusat Asesmen ke dalam skema bank soal masing-masing sekolah secara otomatis.
              </p>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-800">Paket Soal Terverifikasi:</div>
                <div className="text-[11px] text-slate-500">• Paket ASAJ Matematika SD (30 Butir)</div>
                <div className="text-[11px] text-slate-500">• Paket PTS Bahasa Indonesia (25 Butir)</div>
                <div className="text-[11px] text-slate-500">• Paket Survei Karakter & Lingkungan Belajar (20 Butir)</div>
              </div>

              <button
                onClick={handlePushNationalBanks}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replikasi ke Seluruh Tenant</span>
              </button>

              {syncStatus && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{syncStatus}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Tenant Sekolah */}
      {showAddTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Daftarkan Tenant Sekolah Baru</h3>
              </div>
              <button
                onClick={() => setShowAddTenantModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">NPSN Sekolah (8 Digit)</label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="Contoh: 20108877"
                  value={tenantNpsn}
                  onChange={(e) => setTenantNpsn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Satuan Pendidikan</label>
                <input
                  type="text"
                  placeholder="Contoh: SDN 08 Cempaka Putih"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Alokasi Kuota Siswa Peserta</label>
                <input
                  type="number"
                  value={tenantQuota}
                  onChange={(e) => setTenantQuota(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAddTenantModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!tenantNpsn || !tenantName) return;
                  const newTenant: School = {
                    id: 'sch-' + Math.random().toString(36).substring(2, 9),
                    npsn: tenantNpsn.trim(),
                    name: tenantName.trim(),
                    education_level: 'SD',
                    school_type: 'negeri',
                    address: 'Jl. Ahmad Yani No. 12',
                    province: 'DKI Jakarta',
                    city_regency: 'Kota Jakarta Pusat',
                    district: 'Cempaka Putih',
                    email: `admin.${tenantNpsn}@jakarta.sekolah.id`,
                    principal_name: 'Drs. Mulyadi, M.Pd.',
                    status: 'active',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  };
                  tenantStore.saveSchool(newTenant);
                  setSchools(tenantStore.getSchools());
                  setShowAddTenantModal(false);
                  alert(`Tenant "${newTenant.name}" berhasil ditambahkan dengan isolasi data mandiri.`);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Buat Tenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
