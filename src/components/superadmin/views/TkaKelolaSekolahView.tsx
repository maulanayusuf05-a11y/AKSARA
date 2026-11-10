import React, { useState } from 'react';
import { tenantStore } from '../../../lib/supabase';
import { School, SchoolStatus, SchoolType } from '../../../types/database';
import {
  Building2,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Users,
  BookOpen,
  MonitorCheck,
  MapPin,
  KeyRound,
  Trash2,
  ExternalLink,
  ChevronRight,
  Database,
  RefreshCw,
} from 'lucide-react';

interface TkaKelolaSekolahViewProps {
  onOpenSqlModal?: () => void;
}

export const TkaKelolaSekolahView: React.FC<TkaKelolaSekolahViewProps> = ({ onOpenSqlModal }) => {
  const [schools, setSchools] = useState<School[]>(() => tenantStore.getSchools());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvince, setFilterProvince] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Modal Tambah Sekolah Resmi Pusat
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNpsn, setNewNpsn] = useState('');
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState<'SD' | 'MI'>('SD');
  const [newType, setNewType] = useState<SchoolType>('negeri');
  const [newProvince, setNewProvince] = useState('DKI Jakarta');
  const [newCity, setNewCity] = useState('Kota Jakarta Pusat');
  const [newDistrict, setNewDistrict] = useState('Gambir');
  const [newAddress, setNewAddress] = useState('');
  const [newPrincipal, setNewPrincipal] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Password reset modal feedback
  const [resetSuccessModal, setResetSuccessModal] = useState<{ school: School; tempPass: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Extract unique provinces
  const provinces = Array.from(new Set(schools.map((s) => s.province))).filter(Boolean);

  const filteredSchools = schools.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.npsn.includes(searchTerm) ||
      s.principal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city_regency.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProvince = filterProvince === 'all' || s.province === filterProvince;
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchType = filterType === 'all' || s.school_type === filterType;
    return matchSearch && matchProvince && matchStatus && matchType;
  });

  const handleToggleStatus = (school: School) => {
    const newStatus: SchoolStatus = school.status === 'active' ? 'suspended' : 'active';
    tenantStore.updateSchoolStatus(school.id, newStatus, `Diubah status menjadi ${newStatus} oleh Superadmin`);
    setSchools(tenantStore.getSchools());
    setStatusMessage(`Status sekolah ${school.name} berhasil diubah menjadi: ${newStatus.toUpperCase()}`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleResetPassword = (school: School) => {
    const tempPass = 'Aksara#' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const profiles = tenantStore.getProfiles();
    const admin = profiles.find((p) => p.school_id === school.id);
    if (admin) {
      tenantStore.saveProfile({ ...admin, password: tempPass });
    }
    setResetSuccessModal({ school, tempPass });
  };

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNpsn || !newName) return;

    const newSchoolRecord: School = {
      id: 'sch-' + Math.random().toString(36).substring(2, 10),
      npsn: newNpsn.trim(),
      name: newName.trim(),
      education_level: newLevel,
      school_type: newType,
      address: newAddress.trim() || 'Jl. Pendidikan Nasional',
      province: newProvince,
      city_regency: newCity,
      district: newDistrict,
      email: newEmail.trim() || `admin@${newNpsn}.sch.id`,
      phone: newPhone.trim() || '021-000000',
      principal_name: newPrincipal.trim() || 'Kepala Sekolah',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    tenantStore.saveSchool(newSchoolRecord);
    setSchools(tenantStore.getSchools());
    setShowAddModal(false);
    setStatusMessage(`Sekolah resmi "${newName}" (NPSN: ${newNpsn}) berhasil ditambahkan ke basis data pusat!`);
    setTimeout(() => setStatusMessage(null), 4000);

    // Reset form
    setNewNpsn('');
    setNewName('');
    setNewAddress('');
    setNewPrincipal('');
    setNewEmail('');
  };

  const handleExportCsv = () => {
    const headers = ['ID,NPSN,Nama Sekolah,Jenjang,Jenis,Provinsi,Kabupaten/Kota,Kepala Sekolah,Status'];
    const rows = filteredSchools.map(
      (s) =>
        `"${s.id}","${s.npsn}","${s.name}","${s.education_level}","${s.school_type}","${s.province}","${s.city_regency}","${s.principal_name}","${s.status}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_sekolah_nasional_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
              Pangkalan Data Nasional
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-500">Cakupan Seluruh Indonesia</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Manajemen Satuan Pendidikan (Seluruh Sekolah)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola, pantau kuota, tangguhkan atau aktifkan akses ujian sekolah, dan audit tenant sekolah di seluruh Indonesia.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Sekolah Pusat</span>
          </button>
        </div>
      </div>

      {/* Status Notification Message */}
      {statusMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Filter and Search Box */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search text */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama, NPSN, kepsek..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 bg-slate-50 focus:bg-white"
            >
              <option value="all">Semua Status (Aktif / Pending / Suspend)</option>
              <option value="active">Hanya Aktif</option>
              <option value="pending">Hanya Menunggu Verifikasi</option>
              <option value="suspended">Hanya Ditangguhkan (Suspended)</option>
            </select>
          </div>

          {/* Filter Provinsi */}
          <div>
            <select
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 bg-slate-50 focus:bg-white"
            >
              <option value="all">Semua Provinsi</option>
              {provinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Jenis */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 bg-slate-50 focus:bg-white"
            >
              <option value="all">Semua Jenis (Negeri & Swasta)</option>
              <option value="negeri">Negeri</option>
              <option value="swasta">Swasta</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table of Schools */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Sekolah & NPSN</th>
                <th className="py-3 px-4">Bentuk / Jenis</th>
                <th className="py-3 px-4">Wilayah</th>
                <th className="py-3 px-4">Kepala Sekolah</th>
                <th className="py-3 px-4 text-center">Status Akses</th>
                <th className="py-3 px-4 text-center">Peserta</th>
                <th className="py-3 px-4 text-right">Kewenangan Superadmin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Tidak ditemukan data sekolah dengan filter saat ini.
                  </td>
                </tr>
              ) : (
                filteredSchools.map((school) => {
                  const studentCount = tenantStore.getStudents(school.id).length;
                  const classCount = tenantStore.getClasses(school.id).length;
                  return (
                    <tr key={school.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{school.name}</div>
                        <div className="font-mono text-[11px] text-blue-600 flex items-center gap-1.5 mt-0.5">
                          <span>NPSN: {school.npsn}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{school.education_level}</span>{' '}
                        <span className="capitalize text-slate-500">({school.school_type})</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{school.city_regency}</div>
                        <div className="text-[11px] text-slate-500">{school.province}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{school.principal_name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{school.email}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            school.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : school.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {school.status === 'active'
                            ? 'Aktif'
                            : school.status === 'pending'
                            ? 'Pending'
                            : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-slate-800">{studentCount}</span>
                        <span className="text-[10px] text-slate-400 block">{classCount} Rombel</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedSchool(school)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Lihat Detail Tenant Sekolah"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(school)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                            title="Reset Password Admin Sekolah"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(school)}
                            className={`p-1.5 rounded transition ${
                              school.status === 'active'
                                ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={
                              school.status === 'active'
                                ? 'Tangguhkan (Suspend) Sekolah'
                                : 'Aktifkan Kembali Sekolah'
                            }
                          >
                            {school.status === 'active' ? (
                              <ShieldAlert className="w-4 h-4 text-rose-500" />
                            ) : (
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Tenant */}
      {selectedSchool && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-base">Profil & Statistik Tenant Sekolah</h3>
              </div>
              <button
                onClick={() => setSelectedSchool(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Sekolah:</span>
                  <span className="font-bold text-slate-900">{selectedSchool.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NPSN:</span>
                  <span className="font-mono font-bold text-blue-700">{selectedSchool.npsn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">UUID Tenant:</span>
                  <span className="font-mono text-[11px] text-slate-600">{selectedSchool.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kepala Sekolah:</span>
                  <span className="font-semibold text-slate-800">{selectedSchool.principal_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Operasional:</span>
                  <span className="font-bold uppercase text-slate-800">{selectedSchool.status}</span>
                </div>
              </div>

              {/* Counts */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="text-lg font-black text-blue-700">
                    {tenantStore.getStudents(selectedSchool.id).length}
                  </div>
                  <div className="text-[11px] text-blue-600 font-medium">Siswa Terdaftar</div>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
                  <div className="text-lg font-black text-purple-700">
                    {tenantStore.getClasses(selectedSchool.id).length}
                  </div>
                  <div className="text-[11px] text-purple-600 font-medium">Rombel / Kelas</div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="text-lg font-black text-emerald-700">
                    {tenantStore.getProctors(selectedSchool.id).length}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium">Proktor Lab</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-500 font-semibold text-xs">Alamat Lengkap:</div>
                <div className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                  {selectedSchool.address}, Kec. {selectedSchool.district}, {selectedSchool.city_regency}, {selectedSchool.province}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <button
                onClick={() => handleToggleStatus(selectedSchool)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  selectedSchool.status === 'active'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {selectedSchool.status === 'active' ? 'Tangguhkan (Suspend)' : 'Aktifkan Kembali'}
              </button>

              <button
                onClick={() => setSelectedSchool(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {resetSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Kata Sandi Baru Dibuat</h3>
            <p className="text-xs text-slate-500">
              Kata sandi akun Admin Sekolah untuk <strong>{resetSuccessModal.school.name}</strong> telah direset menjadi:
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl font-mono text-base font-black text-amber-900 tracking-wider">
              {resetSuccessModal.tempPass}
            </div>
            <p className="text-[11px] text-slate-400">
              Berikan kata sandi sementara ini kepada penanggung jawab Admin Sekolah untuk login kembali.
            </p>
            <button
              onClick={() => setResetSuccessModal(null)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Modal Tambah Sekolah Resmi Pusat */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-base">Tambah Satuan Pendidikan (Pusat)</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchool} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">NPSN (8 Digit Unik) *</label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={newNpsn}
                  onChange={(e) => setNewNpsn(e.target.value)}
                  placeholder="Contoh: 20101999"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Satuan Pendidikan *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: SDN 03 Pondok Labu"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jenjang</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as 'SD' | 'MI')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="SD">Sekolah Dasar (SD)</option>
                    <option value="MI">Madrasah Ibtidaiyah (MI)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bentuk Satuan</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as SchoolType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="negeri">Negeri</option>
                    <option value="swasta">Swasta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={newProvince}
                    onChange={(e) => setNewProvince(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kabupaten / Kota</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  value={newPrincipal}
                  onChange={(e) => setNewPrincipal(e.target.value)}
                  placeholder="Drs. H. Ahmad..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Resmi</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="sdn@sekolah.sch.id"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Simpan Satuan Pendidikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
