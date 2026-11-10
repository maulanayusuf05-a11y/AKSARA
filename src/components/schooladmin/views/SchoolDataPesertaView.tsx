import React, { useState } from 'react';
import { tenantStore } from '../../../lib/supabase';
import { Student, School, ClassRoom } from '../../../types/database';
import { TutWuriLogo } from '../../common/TutWuriLogo';
import {
  Users,
  KeyRound,
  Printer,
  FileCheck2,
  Search,
  Plus,
  QrCode,
  ShieldCheck,
  CheckCircle,
  FileSpreadsheet,
  Download,
  Trash2,
  Edit,
} from 'lucide-react';

interface SchoolDataPesertaViewProps {
  schoolId: string;
  subTab?: string;
}

export const SchoolDataPesertaView: React.FC<SchoolDataPesertaViewProps> = ({
  schoolId,
  subTab = 'peserta',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(subTab);
  const school = tenantStore.getSchoolById(schoolId) || tenantStore.getSchools()[0];
  const [students, setStudents] = useState<Student[]>(tenantStore.getStudents(schoolId));
  const classes = tenantStore.getClasses(schoolId);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [printingStudent, setPrintingStudent] = useState<Student | null>(null);

  // Form Tambah Siswa
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [nisn, setNisn] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [classId, setClassId] = useState(classes[0]?.id || '');

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState<number | null>(null);

  const filteredStudents = students.filter((s) => {
    const matchClass = selectedClassId === 'all' || s.class_id === selectedClassId;
    const matchSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm);
    return matchClass && matchSearch;
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !nisn.trim()) return;

    const selectedCls = classes.find((c) => c.id === classId);
    const newStudent: Student = {
      id: 'std-' + Math.random().toString(36).substring(2, 9),
      school_id: schoolId,
      class_id: classId,
      class_name: selectedCls?.name || 'Kelas 6A',
      nisn: nisn.trim(),
      full_name: fullName.trim(),
      gender: gender,
      birth_date: '2014-05-15',
      created_at: new Date().toISOString(),
    };

    tenantStore.addStudent(newStudent);
    setStudents(tenantStore.getStudents(schoolId));
    setShowAddModal(false);
    setFullName('');
    setNisn('');
  };

  const handleGenerateNumbers = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedCount(filteredStudents.length);
      setIsGenerating(false);
    }, 500);
  };

  return (
    <div className="space-y-5">
      {/* Scope Banner: Menegaskan cakupan data HANYA peserta sekolah ini */}
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
              <Users className="w-5 h-5 text-blue-400" />
              <span>Data Peserta Didik • {school?.name}</span>
            </h1>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Daftar peserta didik di bawah ini hanya mencakup siswa yang terdaftar di <strong>{school?.name}</strong>. Anda mengelola nomor peserta, cetak kartu ujian, dan daftar nominasi tetap khusus untuk sekolah ini.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Total: {students.length} Siswa</span>
            </span>
          </div>
        </div>
      </div>

      {/* Subtab Navigation matching Super Admin 1:1 */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 flex flex-wrap gap-1 shadow-xs">
        <button
          onClick={() => setActiveSubTab('peserta')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'peserta'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Peserta Didik ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('generate')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'generate'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Generate Nomor Peserta</span>
        </button>

        <button
          onClick={() => setActiveSubTab('kartu')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'kartu'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Kartu Login Peserta</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dnt')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'dnt'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Rekap DNT</span>
        </button>
      </div>

      {/* 1. SUBTAB: PESERTA DIDIK SEKOLAH SAYA */}
      {activeSubTab === 'peserta' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Daftar Peserta Didik ({school?.name})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola data biodata peserta tes yang terdaftar pada rombel di sekolah ini
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Siswa</span>
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3 text-xs">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama lengkap atau NISN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Filter Rombel:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="all">Semua Rombel ({students.length} Siswa)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">NISN</th>
                  <th className="py-2.5 px-3">Nama Lengkap</th>
                  <th className="py-2.5 px-3">L/P</th>
                  <th className="py-2.5 px-3">Rombel Kelas</th>
                  <th className="py-2.5 px-3">Status DNT</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{st.nisn}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{st.full_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{st.gender}</td>
                    <td className="py-2.5 px-3 text-slate-700">{st.class_name || 'Kelas 6A'}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Tervalidasi
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          setPrintingStudent(st);
                          setActiveSubTab('kartu');
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-[11px] font-semibold transition"
                      >
                        Cetak Kartu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. SUBTAB: GENERATE NOMOR PESERTA */}
      {activeSubTab === 'generate' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600" />
              Generate Nomor Peserta Ujian Resmi ({school?.name})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Format standar penomoran nasional: [Kode Wilayah]-[Tahun]-[NPSN]-[Kode Rombel]-[Nomor Urut Siswa]
            </p>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 text-xs text-blue-900">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>Struktur Kode Peserta {school?.name}:</span>
            </div>
            <div className="font-mono bg-white p-3 rounded-lg border border-blue-200 text-slate-800 text-sm font-bold tracking-wider">
              01-26-{school?.npsn}-01-0001
            </div>
            <p className="text-slate-600 leading-relaxed">
              Nomor peserta dibuat otomatis berdasarkan urutan abjad siswa per rombel kelas yang terdaftar di sekolah ini.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-xs font-bold text-slate-800">
                Total Siap Digenerate: {filteredStudents.length} Peserta
              </div>
              <div className="text-[11px] text-slate-500">
                {classes.length} Rombel Kelas di {school?.name}
              </div>
            </div>

            <button
              onClick={handleGenerateNumbers}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isGenerating ? 'Memproses Penomoran...' : 'Generate Nomor Peserta Sekolah Ini'}</span>
            </button>
          </div>

          {generatedCount !== null && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-800">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold">Berhasil Mengenerate Nomor Peserta!</div>
                <div>{generatedCount} peserta di {school?.name} kini telah memiliki Nomor Peserta resmi TKA 2026.</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. SUBTAB: CETAK KARTU LOGIN PESERTA */}
      {activeSubTab === 'kartu' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Printer className="w-4 h-4 text-blue-600" />
                  Cetak Kartu Login Peserta Ujian ({school?.name})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cetak kartu peserta resmi berisi NISN, username, dan password login ujian siswa
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Semua Kartu ({filteredStudents.length})</span>
                </button>
              </div>
            </div>

            {/* Filter class for printing */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Pilih Kelas untuk Dicetak:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="all">Semua Kelas ({students.length} Siswa)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid of Student Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(printingStudent ? [printingStudent] : filteredStudents.slice(0, 4)).map((st, i) => (
                <div
                  key={st.id}
                  className="bg-white border-2 border-slate-300 rounded-2xl p-4 shadow-sm relative overflow-hidden space-y-3"
                >
                  {/* Card Header with Tut Wuri Logo */}
                  <div className="flex items-center gap-3 pb-2.5 border-b border-slate-200">
                    <TutWuriLogo size={36} className="shrink-0" />
                    <div className="min-w-0 flex-1 text-center">
                      <div className="font-extrabold text-[11px] text-slate-900 uppercase tracking-tight">
                        KARTU PESERTA ASESMEN & KOMPETENSI (AKSARA)
                      </div>
                      <div className="text-[10px] text-slate-600 font-bold">{school?.name}</div>
                      <div className="text-[9px] text-slate-400 font-mono">NPSN: {school?.npsn} • Tahun 2026</div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="col-span-2 space-y-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Nomor Peserta Ujian:</span>
                        <span className="font-mono font-black text-blue-800 text-[11px]">
                          01-26-{school?.npsn}-01-{String(i + 1).padStart(4, '0')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Nama Lengkap:</span>
                        <span className="font-bold text-slate-900">{st.full_name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">NISN / Rombel:</span>
                        <span className="font-mono font-semibold text-slate-700">
                          {st.nisn} • {st.class_name || 'Kelas 6'}
                        </span>
                      </div>
                    </div>

                    {/* QR Code and Credentials */}
                    <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                      <QrCode className="w-10 h-10 text-slate-800" />
                      <div className="text-[9px] font-mono text-slate-500">Kredensial Login</div>
                      <div className="font-mono font-bold text-xs text-blue-700">P-{st.nisn.slice(-4)}</div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Ruang: Lab Komputer 1</span>
                    <span className="font-semibold text-slate-700">Kepala Sekolah: {school?.principal_name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. SUBTAB: REKAP DNT SEKOLAH SAYA */}
      {activeSubTab === 'dnt' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                Daftar Nominasi Tetap (DNT) Resmi ({school?.name})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dokumen pengesahan resmi peserta didik yang berhak mengikuti asesmen di {school?.name}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cetak Form DNT Sekolah</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
            <div className="font-bold text-slate-800 text-sm">Pengesahan DNT Satuan Pendidikan:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600">
              <div>• Satuan Pendidikan: <strong>{school?.name}</strong></div>
              <div>• NPSN: <strong>{school?.npsn}</strong></div>
              <div>• Jumlah Siswa Disahkan: <strong>{filteredStudents.length} Siswa</strong></div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Nomor Peserta Resmi</th>
                  <th className="py-2.5 px-3">NISN</th>
                  <th className="py-2.5 px-3">Nama Lengkap Peserta</th>
                  <th className="py-2.5 px-3">L/P</th>
                  <th className="py-2.5 px-3">Rombel</th>
                  <th className="py-2.5 px-3">Tanda Tangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st, i) => (
                  <tr key={st.id} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3 text-slate-400 font-mono">{i + 1}</td>
                    <td className="py-2 px-3 font-mono font-bold text-blue-700">
                      01-26-{school?.npsn}-01-{String(i + 1).padStart(4, '0')}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600">{st.nisn}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{st.full_name}</td>
                    <td className="py-2 px-3 text-slate-600">{st.gender}</td>
                    <td className="py-2 px-3 text-slate-700">{st.class_name || 'Kelas 6A'}</td>
                    <td className="py-2 px-3 text-slate-300 font-mono">..................</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah Siswa */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 text-sm">Pendaftaran Peserta Didik Baru di {school?.name}</h3>
            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  placeholder="Nama sesuai akta lahir / kartu keluarga"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">NISN (10 Digit Angka)</label>
                <input
                  type="text"
                  placeholder="Contoh: 0148291032"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Rombel Kelas</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Daftarkan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
