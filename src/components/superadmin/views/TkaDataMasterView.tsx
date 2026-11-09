import React, { useState } from 'react';
import { tenantStore } from '../../../lib/supabase';
import { School, Subject, QuestionBank } from '../../../types/database';
import {
  Building2,
  BookOpen,
  FileSpreadsheet,
  Monitor,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';

interface TkaDataMasterViewProps {
  subTab?: string;
  onOpenSqlModal?: () => void;
}

export const TkaDataMasterView: React.FC<TkaDataMasterViewProps> = ({
  subTab = 'schools',
  onOpenSqlModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(subTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schools, setSchools] = useState<School[]>(tenantStore.getSchools());
  const [subjects, setSubjects] = useState<Subject[]>(tenantStore.getSubjects());
  const [banks, setBanks] = useState<QuestionBank[]>(tenantStore.getQuestionBanks());

  // Modal create school
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [newNpsn, setNewNpsn] = useState('');
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState<'SD' | 'MI'>('SD');
  const [newType, setNewType] = useState<'negeri' | 'swasta'>('negeri');
  const [newCity, setNewCity] = useState('Kota Jakarta Pusat');
  const [newPrincipal, setNewPrincipal] = useState('');

  const handleToggleSchoolStatus = (school: School) => {
    const nextStatus = school.status === 'active' ? 'suspended' : 'active';
    const updated = { ...school, status: nextStatus as any };
    tenantStore.saveSchool(updated);
    setSchools(tenantStore.getSchools());
  };

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNpsn || !newName) return;

    const newSch: School = {
      id: 'sch-' + Math.random().toString(36).substring(2, 9),
      npsn: newNpsn.trim(),
      name: newName.trim(),
      education_level: newLevel,
      school_type: newType,
      address: 'Jl. Pendidikan No. ' + Math.floor(Math.random() * 50 + 1),
      province: 'DKI Jakarta',
      city_regency: newCity,
      district: 'Kecamatan Wilayah',
      email: `admin@${newNpsn}.sch.id`,
      principal_name: newPrincipal.trim() || 'Drs. H. Suwandi, M.Pd.',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    tenantStore.saveSchool(newSch);
    setSchools(tenantStore.getSchools());
    setShowAddSchoolModal(false);
    setNewNpsn('');
    setNewName('');
    setNewPrincipal('');
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
          <span>Satuan Pendidikan ({schools.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('subjects')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'subjects'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Mata Pelajaran ({subjects.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('banks')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'banks'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Bank Soal Standar ({banks.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sarpras')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'sarpras'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>Sarpras & Laboratorium</span>
        </button>
      </div>

      {/* CONTENT: Satuan Pendidikan */}
      {activeSubTab === 'schools' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Data Satuan Pendidikan (Sekolah Dasar Terdaftar)
              </h2>
              <p className="text-xs text-slate-500">
                Pangkalan data sekolah penyelenggara asesmen dan ujian digital terintegrasi Dapodik
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama atau NPSN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => setShowAddSchoolModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Sekolah</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">NPSN & Nama Sekolah</th>
                  <th className="py-2.5 px-3">Bentuk / Jenis</th>
                  <th className="py-2.5 px-3">Kab/Kota & Provinsi</th>
                  <th className="py-2.5 px-3">Kepala Sekolah</th>
                  <th className="py-2.5 px-3">Status Ujian</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools
                  .filter(
                    (s) =>
                      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.npsn.includes(searchTerm)
                  )
                  .map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{sch.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          NPSN: <span className="text-blue-700 font-semibold">{sch.npsn}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                          {sch.education_level} • {sch.school_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <div>{sch.city_regency}</div>
                        <div className="text-[10px] text-slate-400">{sch.province}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{sch.principal_name}</td>
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
                          onClick={() => setSelectedSchool(sch)}
                          className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-medium"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleToggleSchoolStatus(sch)}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium border ${
                            sch.status === 'active'
                              ? 'text-red-700 border-red-200 hover:bg-red-50'
                              : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          {sch.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENT: Mata Pelajaran */}
      {activeSubTab === 'subjects' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Daftar Mata Pelajaran & Standar Asesmen SD
            </h2>
            <p className="text-xs text-slate-500">
              Mata uji kompetensi mencakup Literasi Membaca, Numerasi, IPAS, dan Survei Karakter
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2 hover:border-blue-300 transition"
              >
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-700">
                  {sub.code}
                </span>
                <div className="font-bold text-slate-900 text-sm">{sub.name}</div>
                <div className="text-[11px] text-slate-500">Jenjang: Kelas {sub.grade_level || 6} SD/MI</div>
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Standar Nasional
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT: Bank Soal */}
      {activeSubTab === 'banks' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              Katalog Bank Soal Terstandarisasi Pusmendik
            </h2>
            <p className="text-xs text-slate-500">
              Paket butir soal terenkripsi siap disinkronkan ke server sekolah daring maupun semi daring
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {banks.map((b) => (
              <div key={b.id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{b.title}</div>
                  <div className="text-slate-500 mt-0.5">{b.description}</div>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                    <span className="font-semibold text-blue-600">{b.subject_name}</span>
                    <span>•</span>
                    <span>{b.total_questions} Butir Soal Pilihan Ganda & Isian</span>
                    <span>•</span>
                    <span className="font-mono">Terenkripsi AES-256</span>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Paket bank soal "${b.title}" siap didistribusikan ke seluruh tenant.`)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition shrink-0"
                >
                  Distribusi Paket
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT: Sarpras & Lab */}
      {activeSubTab === 'sarpras' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-600" />
              Kesiapan Sarana Prasarana & Laboratorium Komputer
            </h2>
            <p className="text-xs text-slate-500">
              Inventarisasi spesifikasi PC Proktor dan Klien di seluruh satuan pendidikan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 text-sm">Standar Minimal Server Proktor</div>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                <li>• Processor: 4 Core, 2.0 GHz atau lebih tinggi</li>
                <li>• RAM: Minimal 8 GB (16 GB disarankan untuk semi-daring VHD)</li>
                <li>• Ruang Harddisk: 50 GB Free Space (SSD diutamakan)</li>
                <li>• OS: Windows 10/11 64-bit atau Linux Ubuntu LTS</li>
                <li>• Jaringan: 2 Unit LAN Card (Gigabit Ethernet)</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 text-sm">Standar Minimal Komputer Klien (Siswa)</div>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                <li>• PC / Laptop / Chromebook Lab Sekolah</li>
                <li>• Layar minimal 11.6 inch, resolusi 1366x768</li>
                <li>• RAM: Minimal 2 GB (4 GB disarankan)</li>
                <li>• Aplikasi Klien: Exambrowser Client Build 26.2</li>
                <li>• Keyboard & Mouse berfungsi normal</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add School */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateSchool}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Tambah Satuan Pendidikan (Tenant)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSchoolModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">NPSN (8 Digit)</label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="Contoh: 20109999"
                    value={newNpsn}
                    onChange={(e) => setNewNpsn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Jenjang & Jenis</label>
                  <div className="flex gap-2">
                    <select
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value as any)}
                      className="w-1/2 px-2 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="SD">SD</option>
                      <option value="MI">MI</option>
                    </select>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-1/2 px-2 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="negeri">Negeri</option>
                      <option value="swasta">Swasta</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Resmi Sekolah</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SDN 05 Rawamangun Pagi"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  placeholder="Nama beserta gelar lengkap"
                  value={newPrincipal}
                  onChange={(e) => setNewPrincipal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Kabupaten / Kota</label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddSchoolModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Simpan Sekolah Baru
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAIL MODAL FOR SCHOOL */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedSchool.name}</h3>
                <div className="text-[11px] font-mono text-blue-700">NPSN: {selectedSchool.npsn}</div>
              </div>
              <button
                onClick={() => setSelectedSchool(null)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div>Kepala Sekolah: <strong>{selectedSchool.principal_name}</strong></div>
                <div>Status: <strong className="capitalize">{selectedSchool.school_type} • {selectedSchool.education_level}</strong></div>
                <div>Alamat: {selectedSchool.address}, {selectedSchool.city_regency}</div>
                <div>Kontak: {selectedSchool.phone || '-'} | {selectedSchool.email}</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSchool(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
