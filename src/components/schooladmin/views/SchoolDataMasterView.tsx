import React, { useState, useEffect } from 'react';
import { tenantStore } from '../../../lib/supabase';
import { School, Subject, QuestionBank, ClassRoom, Student } from '../../../types/database';
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
  Pencil,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';

interface SchoolDataMasterViewProps {
  schoolId: string;
  subTab?: string;
}

const normalizeMasterTab = (t?: string): string => {
  if (t === 'data_sekolah' || t === 'schools') return 'data_sekolah';
  if (t === 'data_kelas' || t === 'classes') return 'data_kelas';
  if (t === 'data_siswa' || t === 'students') return 'data_siswa';
  if (t === 'sarpras') return 'sarpras';
  return 'data_sekolah';
};

export const SchoolDataMasterView: React.FC<SchoolDataMasterViewProps> = ({
  schoolId,
  subTab = 'data_sekolah',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(() => normalizeMasterTab(subTab));
  const school = tenantStore.getSchoolById(schoolId) || tenantStore.getSchools()[0];
  const [classes, setClasses] = useState<ClassRoom[]>(() => tenantStore.getClasses(schoolId));
  const [subjects] = useState<Subject[]>(tenantStore.getSubjects());
  const [banks] = useState<QuestionBank[]>(tenantStore.getQuestionBanks());
  const [students, setStudents] = useState<Student[]>(() => tenantStore.getStudents(schoolId));

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter & Search Siswa di Data Master
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('all');

  useEffect(() => {
    if (subTab) {
      setActiveSubTab(normalizeMasterTab(subTab));
    }
  }, [subTab]);

  const filteredMasterStudents = students.filter((s) => {
    const matchClass = studentClassFilter === 'all' || s.class_id === studentClassFilter;
    const matchSearch =
      s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.nisn.includes(studentSearch);
    return matchClass && matchSearch;
  });

  // 1. DATA SEKOLAH FORM EDIT STATE
  const [schoolName, setSchoolName] = useState(school?.name || '');
  const [educationLevel, setEducationLevel] = useState<'SD' | 'MI'>(school?.education_level || 'SD');
  const [schoolType, setSchoolType] = useState<'negeri' | 'swasta'>(school?.school_type || 'negeri');
  const [principalName, setPrincipalName] = useState(school?.principal_name || 'Drs. H. Suwandi, M.Pd.');
  const [address, setAddress] = useState(school?.address || 'Jl. Pegangsaan Barat No. 12');
  const [email, setEmail] = useState(school?.email || `admin@${school?.npsn}.sch.id`);
  const [phone, setPhone] = useState(school?.phone || '021-3141592');
  const [isSaved, setIsSaved] = useState(false);

  // 2. DATA KELAS (ROMBEL) CRUD STATE
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newGrade, setNewGrade] = useState<1 | 2 | 3 | 4 | 5 | 6>(6);
  const [newSection, setNewSection] = useState('A');

  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editClassGrade, setEditClassGrade] = useState<1 | 2 | 3 | 4 | 5 | 6>(6);
  const [editClassSection, setEditClassSection] = useState('A');

  const [classToDelete, setClassToDelete] = useState<ClassRoom | null>(null);

  // 3. DATA SISWA CRUD STATE
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentNisn, setNewStudentNisn] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'L' | 'P'>('L');
  const [newStudentClassId, setNewStudentClassId] = useState(classes[0]?.id || '');
  const [newStudentBirthDate, setNewStudentBirthDate] = useState('2014-05-15');

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentNisn, setEditStudentNisn] = useState('');
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentGender, setEditStudentGender] = useState<'L' | 'P'>('L');
  const [editStudentClassId, setEditStudentClassId] = useState('');
  const [editStudentBirthDate, setEditStudentBirthDate] = useState('');

  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // HANDLERS FOR DATA SEKOLAH
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;
    const updated: School = {
      ...school,
      name: schoolName.trim() || school.name,
      education_level: educationLevel,
      school_type: schoolType,
      principal_name: principalName.trim(),
      address: address.trim(),
      email: email.trim(),
      phone: phone.trim(),
      updated_at: new Date().toISOString(),
    };
    tenantStore.saveSchool(updated);
    setIsSaved(true);
    showToast('Identitas dan profil sekolah berhasil diperbarui.');
    setTimeout(() => setIsSaved(false), 2500);
  };

  // HANDLERS FOR DATA KELAS
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const newC: ClassRoom = {
      id: 'cls-' + Math.random().toString(36).substring(2, 9),
      school_id: schoolId,
      name: newClassName.trim(),
      grade_level: newGrade,
      section: newSection.trim() || 'A',
      academic_year_id: 'ay-2025-2026',
      created_at: new Date().toISOString(),
    };
    tenantStore.addClass(newC);
    setClasses(tenantStore.getClasses(schoolId));
    setShowAddClass(false);
    setNewClassName('');
    showToast(`Rombel "${newC.name}" berhasil ditambahkan.`);
  };

  const handleOpenEditClass = (c: ClassRoom) => {
    setEditingClass(c);
    setEditClassName(c.name);
    setEditClassGrade(c.grade_level);
    setEditClassSection(c.section);
  };

  const handleSaveEditClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editClassName.trim()) return;
    const updated: ClassRoom = {
      ...editingClass,
      name: editClassName.trim(),
      grade_level: editClassGrade,
      section: editClassSection.trim() || 'A',
    };
    tenantStore.updateClass(updated);
    setClasses(tenantStore.getClasses(schoolId));
    setEditingClass(null);
    showToast(`Perubahan rombel "${updated.name}" berhasil disimpan.`);
  };

  const handleConfirmDeleteClass = () => {
    if (!classToDelete) return;
    tenantStore.deleteClass(classToDelete.id);
    setClasses(tenantStore.getClasses(schoolId));
    const name = classToDelete.name;
    setClassToDelete(null);
    showToast(`Rombel "${name}" telah dihapus.`);
  };

  // HANDLERS FOR DATA SISWA
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentNisn.trim() || !newStudentName.trim()) return;
    const targetClass = classes.find((c) => c.id === newStudentClassId) || classes[0];
    const newS: Student = {
      id: 'std-' + Math.random().toString(36).substring(2, 9),
      school_id: schoolId,
      class_id: targetClass?.id || '',
      class_name: targetClass?.name || 'Kelas 6A',
      nisn: newStudentNisn.trim(),
      full_name: newStudentName.trim(),
      gender: newStudentGender,
      birth_date: newStudentBirthDate || '2014-05-15',
      is_active: true,
      created_at: new Date().toISOString(),
    };
    tenantStore.addStudent(newS);
    setStudents(tenantStore.getStudents(schoolId));
    setShowAddStudent(false);
    setNewStudentNisn('');
    setNewStudentName('');
    showToast(`Siswa "${newS.full_name}" berhasil ditambahkan.`);
  };

  const handleOpenEditStudent = (s: Student) => {
    setEditingStudent(s);
    setEditStudentNisn(s.nisn);
    setEditStudentName(s.full_name);
    setEditStudentGender(s.gender);
    setEditStudentClassId(s.class_id);
    setEditStudentBirthDate(s.birth_date || '2014-05-15');
  };

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editStudentNisn.trim() || !editStudentName.trim()) return;
    const targetClass = classes.find((c) => c.id === editStudentClassId) || classes.find((c) => c.id === editingStudent.class_id);
    const updated: Student = {
      ...editingStudent,
      nisn: editStudentNisn.trim(),
      full_name: editStudentName.trim(),
      gender: editStudentGender,
      class_id: editStudentClassId || editingStudent.class_id,
      class_name: targetClass?.name || editingStudent.class_name,
      birth_date: editStudentBirthDate,
    };
    tenantStore.updateStudent(updated);
    setStudents(tenantStore.getStudents(schoolId));
    setEditingStudent(null);
    showToast(`Data siswa "${updated.full_name}" berhasil diperbarui.`);
  };

  const handleConfirmDeleteStudent = () => {
    if (!studentToDelete) return;
    tenantStore.deleteStudent(studentToDelete.id);
    setStudents(tenantStore.getStudents(schoolId));
    const name = studentToDelete.full_name;
    setStudentToDelete(null);
    showToast(`Siswa "${name}" telah dihapus.`);
  };

  return (
    <div className="space-y-5">
      {/* Scope Banner: Menegaskan cakupan data HANYA sekolah ini dan submenu yang sedang aktif */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-blue-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded text-[10px] font-bold uppercase tracking-wider">
                {activeSubTab === 'data_kelas' || activeSubTab === 'classes'
                  ? 'Data Master • Kelas & Rombel'
                  : activeSubTab === 'data_siswa' || activeSubTab === 'students'
                  ? 'Data Master • Siswa Terdaftar'
                  : 'Data Master • Satuan Pendidikan'}
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-blue-200 font-mono">NPSN: {school?.npsn}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {activeSubTab === 'data_kelas' || activeSubTab === 'classes' ? (
                <>
                  <Layers className="w-5 h-5 text-blue-400" />
                  <span>Data Kelas (Rombongan Belajar) • {school?.name}</span>
                </>
              ) : activeSubTab === 'data_siswa' || activeSubTab === 'students' ? (
                <>
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>Data Siswa Terdaftar • {school?.name}</span>
                </>
              ) : (
                <>
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <span>Data Sekolah (Identitas Satuan Pendidikan) • {school?.name}</span>
                </>
              )}
            </h1>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
              {activeSubTab === 'data_kelas' || activeSubTab === 'classes'
                ? `Kelola daftar rombongan belajar (Kelas 1 s/d 6 SD), kapasitas peserta didik, dan penambahan rombel baru di ${school?.name}.`
                : activeSubTab === 'data_siswa' || activeSubTab === 'students'
                ? `Daftar master seluruh peserta didik terdaftar pada satuan pendidikan ${school?.name}.`
                : `Informasi dan identitas resmi ${school?.name} yang terdaftar di sistem asesmen nasional SINTESA.`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                {activeSubTab === 'data_kelas' || activeSubTab === 'classes'
                  ? `${classes.length} Rombel`
                  : activeSubTab === 'data_siswa' || activeSubTab === 'students'
                  ? `${students.length} Siswa`
                  : 'Tenant Terisolasi'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 1. SUBTAB: DATA SEKOLAH (Identitas Satuan Pendidikan) */}
      {(activeSubTab === 'data_sekolah' || activeSubTab === 'schools' || (!activeSubTab && activeSubTab !== 'data_kelas' && activeSubTab !== 'data_siswa')) && (
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
                  <label className="block text-slate-700 font-semibold mb-1">Nama Satuan Pendidikan</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Jenjang</label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value as 'SD' | 'MI')}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 font-semibold"
                    >
                      <option value="SD">SD (Sekolah Dasar)</option>
                      <option value="MI">MI (Madrasah Ibtidaiyah)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Status Satuan</label>
                    <select
                      value={schoolType}
                      onChange={(e) => setSchoolType(e.target.value as 'negeri' | 'swasta')}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 font-semibold"
                    >
                      <option value="negeri">Negeri</option>
                      <option value="swasta">Swasta</option>
                    </select>
                  </div>
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
        </div>
      )}

      {/* 2. SUBTAB: DATA KELAS (Rombongan Belajar) */}
      {(activeSubTab === 'data_kelas' || activeSubTab === 'classes') && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Data Rombongan Belajar (Kelas 1 - 6 SD) • {school?.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar rombel aktif untuk penempatan peserta didik dan pembagian sesi tes asesmen
                </p>
              </div>
              <button
                onClick={() => setShowAddClass(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Rombel Kelas</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <span className="text-[10px] text-slate-500 font-mono font-medium">Seksi {c.section}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">Siswa Aktif:</span>
                        <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {count} Siswa
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditClass(c)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100/70 rounded-lg transition"
                          title="Edit Rombel Kelas"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setClassToDelete(c)}
                          className="p-1.5 text-rose-600 hover:bg-rose-100/70 rounded-lg transition"
                          title="Hapus Rombel Kelas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. SUBTAB: DATA SISWA (Master Siswa) */}
      {(activeSubTab === 'data_siswa' || activeSubTab === 'students') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Data Master Siswa Terdaftar • {school?.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar lengkap seluruh peserta didik aktif di satuan pendidikan ini
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold">
                Total {students.length} Siswa
              </span>
              <button
                type="button"
                onClick={() => {
                  setNewStudentClassId(classes[0]?.id || '');
                  setShowAddStudent(true);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Siswa</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari berdasarkan NISN atau Nama Lengkap Siswa..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={studentClassFilter}
              onChange={(e) => setStudentClassFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Rombel / Kelas ({students.length})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tabel Data Siswa */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">NISN</th>
                  <th className="py-2.5 px-3">Nama Lengkap</th>
                  <th className="py-2.5 px-3">Rombel / Kelas</th>
                  <th className="py-2.5 px-3 text-center">L/P</th>
                  <th className="py-2.5 px-3">Tanggal Lahir</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredMasterStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada data siswa yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredMasterStudents.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{s.nisn}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{s.full_name}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium">
                          {s.class_name}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                            s.gender === 'L'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-pink-100 text-pink-800'
                          }`}
                        >
                          {s.gender}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {s.birth_date || '2014-05-15'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Aktif</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditStudent(s)}
                            className="p-1 text-blue-600 hover:bg-blue-100/70 rounded transition"
                            title="Edit Data Siswa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentToDelete(s)}
                            className="p-1 text-rose-600 hover:bg-rose-100/70 rounded transition"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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

      {/* Modal Edit Rombel */}
      {editingClass && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-600" />
                Edit Rombel Kelas • {editingClass.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingClass(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditClass} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Rombel / Kelas</label>
                <input
                  type="text"
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tingkat Kelas</label>
                  <select
                    value={editClassGrade}
                    onChange={(e) => setEditClassGrade(Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6)}
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
                    value={editClassSection}
                    onChange={(e) => setEditClassSection(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Rombel */}
      {classToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hapus Rombel Kelas?</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              Anda akan menghapus rombel <strong>{classToDelete.name}</strong> (Tingkat {classToDelete.grade_level} SD). Siswa yang berada di rombel ini tetap tersimpan namun perlu dialihkan ke rombel lain.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClassToDelete(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteClass}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Hapus Rombel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Siswa */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Tambah Siswa Baru di {school?.name}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddStudent(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  placeholder="Contoh: Muhammad Farhan Pratama"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">NISN (10 Digit)</label>
                <input
                  type="text"
                  placeholder="Contoh: 0148291032"
                  value={newStudentNisn}
                  onChange={(e) => setNewStudentNisn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={newStudentGender}
                    onChange={(e) => setNewStudentGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Rombel / Kelas</label>
                  <select
                    value={newStudentClassId}
                    onChange={(e) => setNewStudentClassId(e.target.value)}
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
                  value={newStudentBirthDate}
                  onChange={(e) => setNewStudentBirthDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Siswa */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-600" />
                Edit Data Siswa • {editingStudent.full_name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditStudent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">NISN (10 Digit)</label>
                <input
                  type="text"
                  value={editStudentNisn}
                  onChange={(e) => setEditStudentNisn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={editStudentGender}
                    onChange={(e) => setEditStudentGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Rombel / Kelas</label>
                  <select
                    value={editStudentClassId}
                    onChange={(e) => setEditStudentClassId(e.target.value)}
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
                  value={editStudentBirthDate}
                  onChange={(e) => setEditStudentBirthDate(e.target.value)}
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

      {/* Modal Konfirmasi Hapus Siswa */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hapus Data Siswa?</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              Anda akan menghapus data siswa <strong>{studentToDelete.full_name}</strong> (NISN: {studentToDelete.nisn}) dari {school?.name}.
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
                onClick={handleConfirmDeleteStudent}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Hapus Siswa
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
