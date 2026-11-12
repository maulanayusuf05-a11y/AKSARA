import React, { useState, useEffect } from 'react';
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
  Pencil,
  AlertTriangle,
  X,
} from 'lucide-react';

interface SchoolDataPesertaViewProps {
  schoolId: string;
  subTab?: string;
}

const normalizePesertaTab = (t?: string): string => {
  if (t === 'peserta_ujian' || t === 'peserta') return 'peserta_ujian';
  if (t === 'generate_nomor' || t === 'generate') return 'generate_nomor';
  if (t === 'cetak_kartu' || t === 'kartu') return 'cetak_kartu';
  if (t === 'rekap_dnt' || t === 'dnt') return 'rekap_dnt';
  return 'peserta_ujian';
};

export const SchoolDataPesertaView: React.FC<SchoolDataPesertaViewProps> = ({
  schoolId,
  subTab = 'peserta_ujian',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(() => normalizePesertaTab(subTab));

  useEffect(() => {
    if (subTab) {
      setActiveSubTab(normalizePesertaTab(subTab));
    }
  }, [subTab]);
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
      is_active: true,
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

  // Edit & Delete Siswa State & Handlers
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editNisn, setEditNisn] = useState('');
  const [editGender, setEditGender] = useState<'L' | 'P'>('L');
  const [editClassId, setEditClassId] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('2014-05-15');

  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingStudent(s);
    setEditFullName(s.full_name);
    setEditNisn(s.nisn);
    setEditGender(s.gender);
    setEditClassId(s.class_id);
    setEditBirthDate(s.birth_date || '2014-05-15');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editFullName.trim() || !editNisn.trim()) return;
    const selectedCls = classes.find((c) => c.id === editClassId) || classes.find((c) => c.id === editingStudent.class_id);
    const updated: Student = {
      ...editingStudent,
      nisn: editNisn.trim(),
      full_name: editFullName.trim(),
      gender: editGender,
      class_id: editClassId || editingStudent.class_id,
      class_name: selectedCls?.name || editingStudent.class_name,
      birth_date: editBirthDate,
    };
    tenantStore.updateStudent(updated);
    setStudents(tenantStore.getStudents(schoolId));
    setEditingStudent(null);
    showToast(`Data peserta "${updated.full_name}" berhasil diperbarui.`);
  };

  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    tenantStore.deleteStudent(studentToDelete.id);
    setStudents(tenantStore.getStudents(schoolId));
    const name = studentToDelete.full_name;
    setStudentToDelete(null);
    showToast(`Peserta "${name}" berhasil dihapus.`);
  };

  return (
    <div className="space-y-5">
      {/* Scope Banner: Menegaskan cakupan data HANYA peserta sekolah ini dan submenu yang sedang aktif */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-blue-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded text-[10px] font-bold uppercase tracking-wider">
                {activeSubTab === 'generate_nomor' || activeSubTab === 'generate'
                  ? 'Data Peserta • Penomoran Resmi'
                  : activeSubTab === 'cetak_kartu' || activeSubTab === 'kartu'
                  ? 'Data Peserta • Kartu Login Siswa'
                  : activeSubTab === 'rekap_dnt' || activeSubTab === 'dnt'
                  ? 'Data Peserta • Rekapitulasi DNT'
                  : 'Data Peserta • Peserta Ujian'}
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-blue-200 font-mono">NPSN: {school?.npsn}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {activeSubTab === 'generate_nomor' || activeSubTab === 'generate' ? (
                <>
                  <KeyRound className="w-5 h-5 text-blue-400" />
                  <span>Generate Nomor Peserta Ujian • {school?.name}</span>
                </>
              ) : activeSubTab === 'cetak_kartu' || activeSubTab === 'kartu' ? (
                <>
                  <Printer className="w-5 h-5 text-blue-400" />
                  <span>Cetak Kartu Login Peserta • {school?.name}</span>
                </>
              ) : activeSubTab === 'rekap_dnt' || activeSubTab === 'dnt' ? (
                <>
                  <FileCheck2 className="w-5 h-5 text-blue-400" />
                  <span>Rekap Daftar Nominasi Tetap (DNT) • {school?.name}</span>
                </>
              ) : (
                <>
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>Daftar Peserta Ujian • {school?.name}</span>
                </>
              )}
            </h1>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
              {activeSubTab === 'generate_nomor' || activeSubTab === 'generate'
                ? `Pembuatan otomatis nomor peserta asesmen berstandar nasional per rombel untuk seluruh siswa yang terdaftar di ${school?.name}.`
                : activeSubTab === 'cetak_kartu' || activeSubTab === 'kartu'
                ? `Cetak kartu login resmi ujian berisi NISN, akun username, password ujian, dan QR Code untuk seluruh peserta di ${school?.name}.`
                : activeSubTab === 'rekap_dnt' || activeSubTab === 'dnt'
                ? `Dokumen pengesahan resmi Daftar Nominasi Tetap (DNT) peserta asesmen SINTESA yang telah divalidasi untuk ${school?.name}.`
                : `Pengelolaan data biodata peserta tes, penempatan rombel, dan verifikasi status aktif peserta asesmen di ${school?.name}.`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                {activeSubTab === 'generate_nomor' || activeSubTab === 'generate'
                  ? `${filteredStudents.length} Siap Digenerate`
                  : activeSubTab === 'cetak_kartu' || activeSubTab === 'kartu'
                  ? `${students.length} Kartu`
                  : activeSubTab === 'rekap_dnt' || activeSubTab === 'dnt'
                  ? `${students.length} Siswa DNT`
                  : `Total: ${students.length} Peserta`}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 1. SUBTAB: PESERTA UJIAN SEKOLAH SAYA */}
      {(activeSubTab === 'peserta_ujian' || activeSubTab === 'peserta' || (!activeSubTab && activeSubTab !== 'generate_nomor' && activeSubTab !== 'generate' && activeSubTab !== 'cetak_kartu' && activeSubTab !== 'kartu' && activeSubTab !== 'rekap_dnt' && activeSubTab !== 'dnt')) && (
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
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setPrintingStudent(st);
                            setActiveSubTab('kartu');
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-[11px] font-semibold transition"
                          title="Cetak Kartu Login"
                        >
                          Cetak
                        </button>
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1 text-blue-600 hover:bg-blue-100/70 rounded-lg transition"
                          title="Edit Data Peserta"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setStudentToDelete(st)}
                          className="p-1 text-rose-600 hover:bg-rose-100/70 rounded-lg transition"
                          title="Hapus Peserta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. SUBTAB: GENERATE NOMOR PESERTA */}
      {(activeSubTab === 'generate_nomor' || activeSubTab === 'generate') && (
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
      {(activeSubTab === 'cetak_kartu' || activeSubTab === 'kartu') && (
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
                        KARTU PESERTA ASESMEN SINTESA
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
      {(activeSubTab === 'rekap_dnt' || activeSubTab === 'dnt') && (
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

      {/* Modal Edit Peserta */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-600" />
                Edit Data Peserta • {editingStudent.full_name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">NISN (10 Digit Angka)</label>
                <input
                  type="text"
                  value={editNisn}
                  onChange={(e) => setEditNisn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Rombel Kelas</label>
                  <select
                    value={editClassId}
                    onChange={(e) => setEditClassId(e.target.value)}
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

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  value={editBirthDate}
                  onChange={(e) => setEditBirthDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Peserta */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hapus Peserta Ujian?</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              Anda akan menghapus peserta <strong>{studentToDelete.full_name}</strong> (NISN: {studentToDelete.nisn}) dari daftar peserta {school?.name}.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Hapus Peserta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700/60 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
