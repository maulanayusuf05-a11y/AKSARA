import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { tenantStore } from '../../lib/supabase';
import {
  ClassRoom,
  Student,
  Proctor,
  Subject,
  QuestionBank,
  Exam,
  ExamToken,
  ExamResult,
  AuditLog,
} from '../../types/database';
import {
  Building2,
  BookOpen,
  GraduationCap,
  UserCheck,
  Calendar,
  KeyRound,
  FileText,
  Plus,
  CheckCircle,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Check,
  Trash2,
  Eye,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';

interface SchoolAdminDashboardProps {
  activeTab: string;
}

export const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ activeTab }) => {
  const { currentSchool, user, refreshSchoolData } = useAuth();
  const schoolId = currentSchool?.id || '';

  // Data lists filtered by school_id (TENANT ISOLATION)
  const [classes, setClasses] = useState<ClassRoom[]>(() => tenantStore.getClasses(schoolId));
  const [students, setStudents] = useState<Student[]>(() => tenantStore.getStudents(schoolId));
  const [proctors, setProctors] = useState<Proctor[]>(() => tenantStore.getProctors(schoolId));
  const [subjects, setSubjects] = useState<Subject[]>(() => tenantStore.getSubjects(schoolId));
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>(() => tenantStore.getQuestionBanks(schoolId));
  const [exams, setExams] = useState<Exam[]>(() => tenantStore.getExams(schoolId));
  const [tokens, setTokens] = useState<ExamToken[]>(() => tenantStore.getTokens(schoolId));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => tenantStore.getAuditLogs(schoolId));

  // Modals & form state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    full_name: '',
    nisn: '',
    nis: '',
    gender: 'L' as 'L' | 'P',
    class_id: classes[0]?.id || '',
  });

  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClass, setNewClass] = useState({
    grade_level: 1 as 1 | 2 | 3 | 4 | 5 | 6,
    section: 'B',
  });

  const [showAddProctorModal, setShowAddProctorModal] = useState(false);
  const [newProctor, setNewProctor] = useState({
    full_name: '',
    nip: '',
    phone: '',
    email: '',
  });

  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [newExam, setNewExam] = useState({
    title: '',
    subject_id: subjects[0]?.id || '',
    grade_level: 6,
    duration_minutes: 60,
    passing_grade: 75,
  });

  // Success Feedback
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  const showSuccessNotice = (msg: string) => {
    setAlertNotice(msg);
    setTimeout(() => setAlertNotice(null), 3000);
  };

  // 1. ADD STUDENT
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.full_name || !newStudent.nisn) return;

    const selectedClass = classes.find((c) => c.id === newStudent.class_id);
    const studentRecord: Student = {
      id: 's-' + Math.random().toString(36).substring(2, 9),
      school_id: schoolId,
      user_id: null,
      full_name: newStudent.full_name.trim(),
      nisn: newStudent.nisn.trim(),
      nis: newStudent.nis.trim() || undefined,
      gender: newStudent.gender,
      class_id: newStudent.class_id,
      class_name: selectedClass?.name || 'Kelas Belum Ditentukan',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    tenantStore.addStudent(studentRecord);
    setStudents(tenantStore.getStudents(schoolId));

    tenantStore.addAuditLog({
      school_id: schoolId,
      user_id: user?.id || 'admin',
      user_role: 'school_admin',
      user_email: user?.email || '',
      action: 'ADD_STUDENT',
      entity_type: 'STUDENT',
      entity_id: studentRecord.id,
      details: { name: studentRecord.full_name, nisn: studentRecord.nisn },
    });
    setAuditLogs(tenantStore.getAuditLogs(schoolId));

    setShowAddStudentModal(false);
    setNewStudent({ full_name: '', nisn: '', nis: '', gender: 'L', class_id: classes[0]?.id || '' });
    showSuccessNotice(`Peserta didik ${studentRecord.full_name} berhasil ditambahkan.`);
  };

  // 2. ADD CLASS
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    const className = `Kelas ${newClass.grade_level}-${newClass.section.toUpperCase()}`;
    const classRecord: ClassRoom = {
      id: 'c-' + Math.random().toString(36).substring(2, 8),
      school_id: schoolId,
      grade_level: Number(newClass.grade_level) as 1 | 2 | 3 | 4 | 5 | 6,
      section: newClass.section.toUpperCase(),
      name: className,
      academic_year_id: 'ay-2024',
      created_at: new Date().toISOString(),
    };

    tenantStore.addClass(classRecord);
    const updated = tenantStore.getClasses(schoolId);
    setClasses(updated);

    tenantStore.addAuditLog({
      school_id: schoolId,
      user_id: user?.id || 'admin',
      user_role: 'school_admin',
      user_email: user?.email || '',
      action: 'CREATE_CLASS',
      entity_type: 'CLASS',
      entity_id: classRecord.id,
      details: { name: className },
    });

    setShowAddClassModal(false);
    showSuccessNotice(`Rombongan belajar ${className} berhasil dibuat.`);
  };

  // 3. ADD PROCTOR
  const handleAddProctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProctor.full_name) return;

    const proctorRecord: Proctor = {
      id: 'p-' + Math.random().toString(36).substring(2, 8),
      school_id: schoolId,
      user_id: 'u-' + Math.random().toString(36).substring(2, 8),
      full_name: newProctor.full_name.trim(),
      nip: newProctor.nip.trim() || undefined,
      phone: newProctor.phone.trim() || undefined,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    tenantStore.addProctor(proctorRecord);
    setProctors(tenantStore.getProctors(schoolId));

    tenantStore.addAuditLog({
      school_id: schoolId,
      user_id: user?.id || 'admin',
      user_role: 'school_admin',
      user_email: user?.email || '',
      action: 'ADD_PROCTOR',
      entity_type: 'PROCTOR',
      entity_id: proctorRecord.id,
      details: { full_name: proctorRecord.full_name },
    });

    setShowAddProctorModal(false);
    setNewProctor({ full_name: '', nip: '', phone: '', email: '' });
    showSuccessNotice(`Akun pengawas/proktor ${proctorRecord.full_name} berhasil ditambahkan.`);
  };

  // 4. GENERATE EXAM TOKEN
  const handleGenerateToken = (examId: string) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const expiry = new Date(Date.now() + 2 * 3600 * 1000).toISOString(); // 2 hours
    const tokenObj: ExamToken = {
      id: 'tok-' + Math.random().toString(36).substring(2, 8),
      school_id: schoolId,
      exam_id: examId,
      token_code: code,
      valid_until: expiry,
      created_by: user?.id || 'admin',
      is_active: true,
    };

    tenantStore.addToken(tokenObj);
    setTokens(tenantStore.getTokens(schoolId));

    tenantStore.addAuditLog({
      school_id: schoolId,
      user_id: user?.id || 'admin',
      user_role: 'school_admin',
      user_email: user?.email || '',
      action: 'GENERATE_EXAM_TOKEN',
      entity_type: 'EXAM_TOKEN',
      entity_id: tokenObj.id,
      details: { token_code: code, exam_id: examId },
    });

    showSuccessNotice(`Token ujian berhasil dibuat: ${code} (Berlaku 2 Jam).`);
  };

  // 5. CREATE EXAM PACKAGE
  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.title) return;

    const selectedSub = subjects.find((s) => s.id === newExam.subject_id);
    const examRecord: Exam = {
      id: 'exam-' + Math.random().toString(36).substring(2, 8),
      school_id: schoolId,
      subject_id: newExam.subject_id,
      subject_name: selectedSub?.name || 'Mata Pelajaran SD',
      question_bank_id: questionBanks[0]?.id || 'qb-01',
      title: newExam.title,
      grade_level: Number(newExam.grade_level),
      duration_minutes: Number(newExam.duration_minutes),
      passing_grade: Number(newExam.passing_grade),
      status: 'scheduled',
      randomize_questions: true,
      randomize_options: true,
      created_by: user?.id || 'admin',
      created_at: new Date().toISOString(),
    };

    tenantStore.addExam(examRecord);
    setExams(tenantStore.getExams(schoolId));

    tenantStore.addAuditLog({
      school_id: schoolId,
      user_id: user?.id || 'admin',
      user_role: 'school_admin',
      user_email: user?.email || '',
      action: 'CREATE_EXAM',
      entity_type: 'EXAM',
      entity_id: examRecord.id,
      details: { title: examRecord.title, duration: examRecord.duration_minutes },
    });

    setShowAddExamModal(false);
    setNewExam({ title: '', subject_id: subjects[0]?.id || '', grade_level: 6, duration_minutes: 60, passing_grade: 75 });
    showSuccessNotice(`Paket ujian "${examRecord.title}" berhasil dijadwalkan.`);
  };

  // Export report to CSV
  const handleExportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'NISN,Nama Siswa,Kelas,Jenis Kelamin,Status\n' +
      students.map((s) => `"${s.nisn}","${s.full_name}","${s.class_name || ''}","${s.gender}","Aktif"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Siswa_${currentSchool?.npsn || 'SD'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessNotice('Laporan data peserta didik berhasil diunduh dalam format CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Alert Notice Toast */}
      {alertNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-800 shadow-sm animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{alertNotice}</span>
        </div>
      )}

      {/* School Header Card */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-md text-[10px] font-bold tracking-wider uppercase">
              Ruang Kerja Satuan Pendidikan
            </span>
            <span className="text-white/60 text-xs">•</span>
            <span className="text-xs font-mono text-blue-200">NPSN: {currentSchool?.npsn}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            {currentSchool?.name || 'Sekolah Dasar'}
          </h1>
          <p className="text-xs text-blue-100 max-w-2xl mt-1">
            {currentSchool?.address}, Kec. {currentSchool?.district}, {currentSchool?.city_regency} • Kepala Sekolah: {currentSchool?.principal_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddExamModal(true)}
            className="px-3.5 py-2 bg-white text-blue-800 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Paket Ujian</span>
          </button>
        </div>
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Rombel Kelas (1-6)</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{classes.length} Kelas</div>
          <div className="text-[11px] text-slate-500 mt-1">Tingkat 1 s/d 6 SD</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Peserta Didik (Siswa)</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{students.length} Siswa</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Terdata Aktif</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Guru / Proktor</span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{proctors.length} Orang</div>
          <div className="text-[11px] text-slate-500 mt-1">Pengawas Ujian</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Paket Ujian Aktif</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{exams.length} Paket</div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">Siap Diujikan</div>
        </div>
      </div>

      {/* TAB CONTENT: OVERVIEW & EXAMS */}
      {(activeTab === 'overview' || activeTab === 'exams') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Daftar Paket Ujian Digital SD
              </h2>
              <p className="text-xs text-slate-500">
                Paket ujian aktif, durasi pengerjaan, KKM, dan pembuatan token akses siswa
              </p>
            </div>
            <button
              onClick={() => setShowAddExamModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Paket Ujian</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Judul Ujian</th>
                  <th className="py-2.5 px-3">Mata Pelajaran</th>
                  <th className="py-2.5 px-3">Tingkat</th>
                  <th className="py-2.5 px-3">Durasi</th>
                  <th className="py-2.5 px-3">KKM</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Token & Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((ex) => {
                  const examToken = tokens.find((t) => t.exam_id === ex.id && t.is_active);
                  return (
                    <tr key={ex.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-bold text-slate-900">{ex.title}</td>
                      <td className="py-3 px-3 text-slate-700">{ex.subject_name || 'Matematika SD'}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                          Kelas {ex.grade_level}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{ex.duration_minutes} Menit</td>
                      <td className="py-3 px-3 font-bold text-slate-800">{ex.passing_grade}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ex.status === 'ongoing'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ex.status === 'ongoing' ? 'Sedang Berjalan' : 'Terjadwal'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        {examToken ? (
                          <span className="font-mono font-bold text-xs bg-slate-900 text-amber-400 px-2 py-1 rounded-md border border-slate-800">
                            {examToken.token_code}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleGenerateToken(ex.id)}
                            className="px-2.5 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded border border-blue-200 transition"
                          >
                            + Rilis Token
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: STUDENTS */}
      {(activeTab === 'students' || activeTab === 'overview') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                Data Peserta Didik (Siswa SD)
              </h2>
              <p className="text-xs text-slate-500">
                Daftar siswa yang memiliki hak akses pengerjaan ujian berbasis NISN di {currentSchool?.name}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportReport}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Unduh CSV</span>
              </button>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Siswa</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">NISN</th>
                  <th className="py-2.5 px-3">Nama Lengkap Siswa</th>
                  <th className="py-2.5 px-3">Rombel / Kelas</th>
                  <th className="py-2.5 px-3">L/P</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{st.nisn}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{st.full_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{st.class_name || 'Kelas SD'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{st.gender}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Aktif
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CLASSES */}
      {activeTab === 'classes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Rombongan Belajar Kelas 1 s/d Kelas 6 SD
              </h2>
              <p className="text-xs text-slate-500">
                Manajemen rombel untuk pengelompokan peserta ujian dan bank soal
              </p>
            </div>
            <button
              onClick={() => setShowAddClassModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Rombel Kelas</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {classes.map((cls) => {
              const count = students.filter((s) => s.class_id === cls.id).length;
              return (
                <div key={cls.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{cls.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Tingkat {cls.grade_level}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center justify-between">
                    <span>Jumlah Siswa Terdaftar:</span>
                    <span className="font-bold text-slate-800">{count} Siswa</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PROCTORS */}
      {activeTab === 'proctors' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-600" />
                Akun Guru Pengawas / Proktor Ujian
              </h2>
              <p className="text-xs text-slate-500">
                Pengawas bertugas memantau kehadiran siswa, merilis token, dan menangani kendala teknis
              </p>
            </div>
            <button
              onClick={() => setShowAddProctorModal(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Proktor</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Nama Lengkap Guru</th>
                  <th className="py-2.5 px-3">NIP</th>
                  <th className="py-2.5 px-3">No. HP / WhatsApp</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proctors.map((pr) => (
                  <tr key={pr.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{pr.full_name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{pr.nip || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{pr.phone || '-'}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Aktif Bertugas
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TOKENS */}
      {activeTab === 'tokens' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" />
                Manajemen Token Akses Ujian
              </h2>
              <p className="text-xs text-slate-500">
                Daftar token ujian aktif untuk divalidasi saat siswa masuk ke ruang ujian digital
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {tokens.map((tok) => {
              const ex = exams.find((e) => e.id === tok.exam_id);
              return (
                <div key={tok.id} className="p-4 bg-slate-900 text-white rounded-xl space-y-2 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Token Ujian SD</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-mono">
                      Aktif
                    </span>
                  </div>
                  <div className="font-mono text-3xl font-black tracking-widest text-amber-400">
                    {tok.token_code}
                  </div>
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {ex?.title || 'Paket Ujian SD'}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Berlaku s/d: {new Date(tok.valid_until).toLocaleTimeString('id-ID')} WIB</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUDIT LOGS SEKOLAH */}
      {activeTab === 'audit_logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                Audit Trail Aktivitas Sekolah ({currentSchool?.name})
              </h2>
              <p className="text-xs text-slate-500">
                Isolasi riwayat aktivitas: hanya menampilkan catatan operasional milik sekolah ini
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200 font-sans">
                <tr>
                  <th className="py-2 px-3">Waktu</th>
                  <th className="py-2 px-3">Pengguna</th>
                  <th className="py-2 px-3">Tindakan</th>
                  <th className="py-2 px-3">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {auditLogs.map((lg) => (
                  <tr key={lg.id} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(lg.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-800">{lg.user_email}</td>
                    <td className="py-2 px-3">
                      <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-bold">
                        {lg.action}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-sans text-xs">
                      {lg.details ? JSON.stringify(lg.details) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD STUDENT */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-800">
            <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              Tambah Peserta Didik Baru
            </h3>
            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Alif"
                  value={newStudent.full_name}
                  onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NISN (10 Digit)</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="0123456789"
                    value={newStudent.nisn}
                    onChange={(e) => setNewStudent({ ...newStudent, nisn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rombel Kelas</label>
                <select
                  value={newStudent.class_id}
                  onChange={(e) => setNewStudent({ ...newStudent, class_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD CLASS */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-slate-800">
            <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Buat Rombel Kelas Baru
            </h3>
            <form onSubmit={handleAddClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tingkat Kelas SD</label>
                <select
                  value={newClass.grade_level}
                  onChange={(e) => setNewClass({ ...newClass, grade_level: Number(e.target.value) as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <option key={g} value={g}>
                      Kelas {g} SD
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama / Huruf Rombel</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: B atau C atau Al-Farabi"
                  value={newClass.section}
                  onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD PROCTOR */}
      {showAddProctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-slate-800">
            <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-600" />
              Tambah Akun Proktor / Guru Pengawas
            </h3>
            <form onSubmit={handleAddProctor} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Guru</label>
                <input
                  type="text"
                  required
                  placeholder="Nama beserta gelar"
                  value={newProctor.full_name}
                  onChange={(e) => setNewProctor({ ...newProctor, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIP (Opsional)</label>
                <input
                  type="text"
                  placeholder="1985..."
                  value={newProctor.nip}
                  onChange={(e) => setNewProctor({ ...newProctor, nip: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp</label>
                <input
                  type="tel"
                  placeholder="0812..."
                  value={newProctor.phone}
                  onChange={(e) => setNewProctor({ ...newProctor, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProctorModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Simpan Proktor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD EXAM PACKAGE */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-800">
            <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Jadwalkan Paket Ujian Digital SD
            </h3>
            <form onSubmit={handleAddExam} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Paket Ujian</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Penilaian Sumatif Akhir Jenjang Matematika"
                  value={newExam.title}
                  onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={newExam.subject_id}
                    onChange={(e) => setNewExam({ ...newExam, subject_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={newExam.grade_level}
                    onChange={(e) => setNewExam({ ...newExam, grade_level: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g}>
                        Kelas {g} SD
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={newExam.duration_minutes}
                    onChange={(e) => setNewExam({ ...newExam, duration_minutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">KKM (Nilai Kelulusan)</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={newExam.passing_grade}
                    onChange={(e) => setNewExam({ ...newExam, passing_grade: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddExamModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Jadwalkan Ujian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
