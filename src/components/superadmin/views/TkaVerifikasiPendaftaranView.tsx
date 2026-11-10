import React, { useState } from 'react';
import { tenantStore } from '../../../lib/supabase';
import { School, SchoolStatus } from '../../../types/database';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Search,
  Filter,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  User,
  AlertCircle,
  FileText,
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface TkaVerifikasiPendaftaranViewProps {
  onSchoolApproved?: () => void;
}

export const TkaVerifikasiPendaftaranView: React.FC<TkaVerifikasiPendaftaranViewProps> = ({
  onSchoolApproved,
}) => {
  const [schools, setSchools] = useState<School[]>(() => tenantStore.getSchools());
  const [filterTab, setFilterTab] = useState<'pending' | 'active' | 'suspended' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const pendingCount = schools.filter((s) => s.status === 'pending').length;
  const activeCount = schools.filter((s) => s.status === 'active').length;
  const suspendedCount = schools.filter((s) => s.status === 'suspended').length;

  const filteredSchools = schools.filter((s) => {
    const matchStatus = filterTab === 'all' || s.status === filterTab;
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.npsn.includes(searchTerm) ||
      s.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city_regency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.principal_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleApprove = (school: School) => {
    tenantStore.updateSchoolStatus(school.id, 'active', 'Pendaftaran sekolah telah diverifikasi dan disetujui oleh Superadmin Pusat');
    const updated = tenantStore.getSchools();
    setSchools(updated);
    if (selectedSchool?.id === school.id) {
      setSelectedSchool({ ...school, status: 'active' });
    }
    setActionFeedback({
      type: 'success',
      message: `Sekolah "${school.name}" (NPSN: ${school.npsn}) berhasil disetujui! Akun Admin Sekolah telah diaktifkan dan dapat login ke aplikasi.`,
    });
    if (onSchoolApproved) onSchoolApproved();
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleOpenReject = (school: School) => {
    setSelectedSchool(school);
    setRejectReason('NPSN tidak terdaftar di pangkalan data Dapodik Kemdikbudristek atau data penanggung jawab tidak valid.');
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (!selectedSchool) return;
    tenantStore.updateSchoolStatus(selectedSchool.id, 'suspended', `Pendaftaran ditolak: ${rejectReason}`);
    const updated = tenantStore.getSchools();
    setSchools(updated);
    setShowRejectModal(false);
    setActionFeedback({
      type: 'error',
      message: `Pendaftaran sekolah "${selectedSchool.name}" ditolak dengan catatan: "${rejectReason}".`,
    });
    setTimeout(() => setActionFeedback(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-blue-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Kewenangan Khusus Super Admin
              </span>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider animate-pulse">
                  {pendingCount} Permohonan Baru
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Verifikasi Pendaftaran Sekolah Baru
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Tinjau, validasi keabsahan NPSN Dapodik, dan setujui permohonan pendaftaran satuan pendidikan
              agar dapat bergabung dan mengakses ekosistem ujian digital AKSARA CBT.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/10 text-center">
              <div className="text-2xl font-black text-amber-300">{pendingCount}</div>
              <div className="text-[11px] text-slate-300 font-medium">Menunggu Validasi</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/10 text-center">
              <div className="text-2xl font-black text-emerald-300">{activeCount}</div>
              <div className="text-[11px] text-slate-300 font-medium">Terverifikasi Aktif</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Feedback Notification */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 text-xs sm:text-sm border transition shadow-xs ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{actionFeedback.message}</div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Tab Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              filterTab === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Menunggu Verifikasi</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                filterTab === 'pending' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('active')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              filterTab === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Telah Disetujui (Aktif)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                filterTab === 'active' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('suspended')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              filterTab === 'suspended'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Ditolak / Ditangguhkan</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                filterTab === 'suspended' ? 'bg-rose-800 text-white' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {suspendedCount}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              filterTab === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Semua Data ({schools.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama sekolah, NPSN, wilayah..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Main List of School Registrations */}
      <div className="space-y-4">
        {filteredSchools.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Tidak ada data pendaftaran sekolah</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Tidak ada permohonan sekolah yang sesuai dengan filter atau kata kunci pencarian saat ini.
            </p>
          </div>
        ) : (
          filteredSchools.map((school) => (
            <div
              key={school.id}
              className={`bg-white rounded-xl border p-5 transition shadow-xs hover:shadow-md ${
                school.status === 'pending'
                  ? 'border-amber-300 bg-amber-50/20'
                  : school.status === 'suspended'
                  ? 'border-rose-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* School Information */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      NPSN: {school.npsn}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                        school.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : school.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {school.status === 'pending'
                        ? '⏳ Menunggu Verifikasi'
                        : school.status === 'active'
                        ? '✓ Terverifikasi Aktif'
                        : '✕ Ditolak / Ditangguhkan'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] font-medium text-slate-500 uppercase">
                      {school.education_level} • {school.school_type}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span>{school.name}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Kepsek: <strong className="text-slate-800">{school.principal_name}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{school.city_regency}, {school.province}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{school.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{school.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:col-span-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Terdaftar: {new Date(school.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                    </div>
                  </div>
                </div>

                {/* Superadmin Verification Action Buttons */}
                <div className="flex flex-wrap lg:flex-col items-stretch sm:items-center lg:items-end justify-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {school.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApprove(school)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
                        title="Setujui dan aktifkan akses ujian sekolah ini"
                      >
                        <Check className="w-4 h-4" />
                        <span>Setujui & Aktivasi</span>
                      </button>
                      <button
                        onClick={() => handleOpenReject(school)}
                        className="flex-1 sm:flex-none px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        title="Tolak pendaftaran sekolah"
                      >
                        <X className="w-4 h-4" />
                        <span>Tolak</span>
                      </button>
                    </>
                  ) : school.status === 'active' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Siap Ujian
                      </span>
                      <button
                        onClick={() => {
                          tenantStore.updateSchoolStatus(school.id, 'suspended', 'Ditangguhkan sementara oleh Superadmin');
                          setSchools(tenantStore.getSchools());
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
                        title="Tangguhkan sementara jika ada pelanggaran"
                      >
                        Tangguhkan
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApprove(school)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Pulihkan / Aktifkan Kembali</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedSchool(school)}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detail Pendaftaran</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Detail Pendaftaran */}
      {selectedSchool && !showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-base">Detail Permohonan Registrasi</h3>
              </div>
              <button
                onClick={() => setSelectedSchool(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Sekolah:</span>
                  <span className="font-bold text-slate-800">{selectedSchool.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NPSN:</span>
                  <span className="font-mono font-bold text-blue-700">{selectedSchool.npsn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jenjang / Bentuk:</span>
                  <span className="font-medium text-slate-800">{selectedSchool.education_level} ({selectedSchool.school_type})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kepala Sekolah:</span>
                  <span className="font-semibold text-slate-800">{selectedSchool.principal_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Permohonan:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-xs ${
                      selectedSchool.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : selectedSchool.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedSchool.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-slate-500 font-semibold">Alamat & Lokasi:</div>
                <div className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {selectedSchool.address}, Kec. {selectedSchool.district}, {selectedSchool.city_regency}, {selectedSchool.province}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-slate-500 font-semibold">Email Koordinator:</div>
                  <div className="text-slate-800 font-mono text-xs truncate bg-slate-50 p-2 rounded border border-slate-200">
                    {selectedSchool.email}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-500 font-semibold">Nomor Telepon:</div>
                  <div className="text-slate-800 font-mono text-xs bg-slate-50 p-2 rounded border border-slate-200">
                    {selectedSchool.phone || '-'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Prosedur Verifikasi:</strong> Memvalidasi NPSN dengan pangkalan data Dapodik memastikan sekolah tidak melakukan pendaftaran ganda dan memiliki otoritas menyelenggarakan ANBK/TKA.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setSelectedSchool(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Tutup
              </button>
              {selectedSchool.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleOpenReject(selectedSchool)}
                    className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-100 transition"
                  >
                    Tolak Pendaftaran
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedSchool);
                      setSelectedSchool(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Setujui & Aktivasi Sekarang</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Tolak Pendaftaran */}
      {showRejectModal && selectedSchool && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3>Tolak Pendaftaran Sekolah</h3>
            </div>

            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menolak permohonan pendaftaran untuk <strong>{selectedSchool.name}</strong> (NPSN: {selectedSchool.npsn})? Silakan sertakan alasan penolakan:
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Tuliskan alasan penolakan untuk dikirim ke pendaftar..."
              className="w-full p-3 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50 focus:bg-white"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                Konfirmasi Tolak Pendaftaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
