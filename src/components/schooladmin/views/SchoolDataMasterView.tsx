import React, { useState } from 'react';
import { tenantStore } from '../../../lib/supabase';
import { School, Subject, QuestionBank, ClassRoom } from '../../../types/database';
import {
  Building2,
  BookOpen,
  FileSpreadsheet,
  Monitor,
  Search,
  Plus,
  CheckCircle,
  Save,
  ShieldCheck,
  Cpu,
  Wifi,
  Server,
  Layers,
  Sparkles,
  Users,
} from 'lucide-react';

interface SchoolDataMasterViewProps {
  schoolId: string;
  subTab?: string;
}

export const SchoolDataMasterView: React.FC<SchoolDataMasterViewProps> = ({
  schoolId,
  subTab = 'schools',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(subTab);
  const school = tenantStore.getSchoolById(schoolId) || tenantStore.getSchools()[0];
  const [classes, setClasses] = useState<ClassRoom[]>(tenantStore.getClasses(schoolId));
  const [subjects] = useState<Subject[]>(tenantStore.getSubjects());
  const [banks] = useState<QuestionBank[]>(tenantStore.getQuestionBanks());
  const students = tenantStore.getStudents(schoolId);

  // Form edit profil sekolah
  const [principalName, setPrincipalName] = useState(school?.principal_name || 'Drs. H. Suwandi, M.Pd.');
  const [address, setAddress] = useState(school?.address || 'Jl. Pegangsaan Barat No. 12');
  const [email, setEmail] = useState(school?.email || `admin@${school?.npsn}.sch.id`);
  const [phone, setPhone] = useState('021-3141592');
  const [isSaved, setIsSaved] = useState(false);

  // Form tambah rombel
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newGrade, setNewGrade] = useState<1 | 2 | 3 | 4 | 5 | 6>(6);
  const [newSection, setNewSection] = useState('A');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;
    const updated: School = {
      ...school,
      principal_name: principalName,
      address: address,
      email: email,
      updated_at: new Date().toISOString(),
    };
    tenantStore.saveSchool(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const newC: ClassRoom = {
      id: 'cls-' + Math.random().toString(36).substring(2, 9),
      school_id: schoolId,
      name: newClassName.trim(),
      grade_level: newGrade,
      section: newSection,
      academic_year_id: 'ay-2025-2026',
      created_at: new Date().toISOString(),
    };
    tenantStore.addClass(newC);
    setClasses(tenantStore.getClasses(schoolId));
    setShowAddClass(false);
    setNewClassName('');
  };

  return (
    <div className="space-y-5">
      {/* Scope Banner: Menegaskan cakupan data HANYA sekolah ini */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-blue-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded text-[10px] font-bold uppercase tracking-wider">
                Cakupan Data Sekolah Saya
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-blue-200 font-mono">NPSN: {school?.npsn}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <span>Data Master • {school?.name}</span>
            </h1>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Data master di bawah ini terbatas hanya pada entitas <strong>{school?.name}</strong>. Data tidak dapat dilihat atau diubah oleh sekolah binaan lain sesuai aturan isolasi multi-tenant (RLS).
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Tenant Terisolasi</span>
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
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Satuan Pendidikan</span>
        </button>

        <button
          onClick={() => setActiveSubTab('subjects')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'subjects'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Mata Pelajaran</span>
        </button>

        <button
          onClick={() => setActiveSubTab('banks')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'banks'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Bank Soal</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sarpras')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'sarpras'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Sarpras / Laboratorium</span>
        </button>
      </div>

      {/* 1. SUBTAB: SATUAN PENDIDIKAN (Profil Sekolah Saya & Rombel Kelas) */}
      {activeSubTab === 'schools' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Identitas Satuan Pendidikan ({school?.name})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Informasi resmi sekolah yang terverifikasi di Dapodik dan Pusmendik Kemendikdasmen
                </p>
              </div>
              {isSaved && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Profil Berhasil Disimpan</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Nomor Pokok Sekolah Nasional (NPSN)</label>
                  <input
                    type="text"
                    disabled
                    value={school?.npsn}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-700 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Kunci unik identitas sekolah di Kemendikdasmen</span>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Nama Satuan Pendidikan</label>
                  <input
                    type="text"
                    disabled
                    value={school?.name}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Jenjang & Status</label>
                  <input
                    type="text"
                    disabled
                    value={`${school?.education_level || 'SD'} • ${school?.school_type === 'negeri' ? 'Negeri' : 'Swasta'} (Akreditasi A)`}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nama Kepala Sekolah</label>
                  <input
                    type="text"
                    value={principalName}
                    onChange={(e) => setPrincipalName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Resmi Sekolah / Operator</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nomor Telepon Kantor / WA</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-slate-700 font-semibold mb-1">Alamat Satuan Pendidikan</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan Identitas</span>
                </button>
              </div>
            </form>
          </div>

          {/* Rombel Kelas 1-6 SD Sekolah Saya */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Rombongan Belajar (Rombel) Sekolah Saya
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar kelas 1 s/d 6 SD yang terdaftar di {school?.name}
                </p>
              </div>
              <button
                onClick={() => setShowAddClass(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Rombel</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {classes.map((c) => {
                const count = students.filter((s) => s.class_id === c.id).length;
                return (
                  <div
                    key={c.id}
                    className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2 hover:border-blue-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        Tingkat {c.grade_level} SD
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Bagian {c.section}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-500">Siswa Aktif:</span>
                      <span className="font-bold text-blue-800">{count} Peserta Didik</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. SUBTAB: MATA PELAJARAN UJIAN SEKOLAH SAYA */}
      {activeSubTab === 'subjects' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Mata Pelajaran Ujian di {school?.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mata pelajaran berstandar Asesmen Nasional yang diujikan untuk kelas 5 & 6 SD di sekolah ini
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:shadow-xs transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {sub.code}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Aktif
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm mt-1">{sub.name}</div>
                <p className="text-[11px] text-slate-500">
                  Standar Soal: AKM Literasi & Numerasi Tingkat SD
                </p>
                <div className="text-[10px] text-blue-600 font-medium pt-1">
                  Guru Pengampu: Tim Penguji {school?.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SUBTAB: BANK SOAL SEKOLAH SAYA */}
      {activeSubTab === 'banks' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                Bank Soal Sekolah ({school?.name})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Paket soal resmi tersinkronisasi dari Pusat Asesmen dan paket soal mandiri sekolah
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {banks.map((b) => (
              <div key={b.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-lg transition">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{b.title}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{b.description}</div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span className="font-semibold text-blue-700">{b.total_questions} Butir Soal</span>
                    <span>•</span>
                    <span className="text-slate-500">Tingkat SD / MI</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">Terverifikasi Pusmendik</span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-[11px]">
                  Siap Diujikan
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SUBTAB: SARPRAS / LABORATORIUM SEKOLAH SAYA */}
      {activeSubTab === 'sarpras' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-600" />
                Sarana & Prasarana Laboratorium Komputer ({school?.name})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Spesifikasi komputer proktor, PC klien siswa, dan infrastruktur jaringan lokal sekolah
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 text-sm">Server Proktor Lokal</div>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Processor: Intel Core i5 / AMD Ryzen 5</li>
                <li>• RAM: 16 GB DDR4</li>
                <li>• Penyimpanan: SSD 512 GB (NVMe)</li>
                <li>• OS: Windows 11 Pro 64-bit</li>
                <li>• Status: <strong className="text-emerald-600">Siap & Terkalibrasi</strong></li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 text-sm">Komputer Klien Siswa</div>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• PC Klien Utama: <strong>30 Unit</strong></li>
                <li>• PC Klien Cadangan: <strong>5 Unit</strong></li>
                <li>• Layar: Monitor 19" HD (1366x768)</li>
                <li>• Keyboard & Mouse: Standar USB</li>
                <li>• Browser: Exambro Klien v26.02</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Wifi className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 text-sm">Jaringan & Daya Listrik</div>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Topologi: LAN Gigabit Ethernet (Switch 1Gbps)</li>
                <li>• Kecepatan Internet: <strong>100 Mbps Dedicated</strong></li>
                <li>• Backup Internet: Modem Orbit 4G (Telkomsel)</li>
                <li>• Genset / UPS Cadangan: UPS 2000VA (30 Menit)</li>
                <li>• Status Uji Coba: <strong className="text-emerald-600">Stabil (Latensi 4ms)</strong></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Rombel */}
      {showAddClass && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 text-sm">Tambah Rombel Kelas Baru di {school?.name}</h3>
            <form onSubmit={handleAddClass} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Rombel / Kelas</label>
                <input
                  type="text"
                  placeholder="Contoh: Kelas 6B"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tingkat Kelas</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g}>Kelas {g} SD</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bagian (Seksi)</label>
                  <input
                    type="text"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClass(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Simpan Rombel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
