/**
 * EduUjian SD - Supabase Integration & Multi-Tenant Engine
 * Menyediakan koneksi Supabase Auth & Database serta fallback reactive storage
 * dengan isolasi multi-tenant data per school_id.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  School,
  Profile,
  UserRole,
  ClassRoom,
  Student,
  Proctor,
  Subject,
  QuestionBank,
  Exam,
  ExamToken,
  ExamSession,
  AuditLog,
} from '../types/database';

// 1. Ambil kredensial dari Environment Variables atau Local Storage Override
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const customConfig = localStorage.getItem('edujian_supabase_custom_config');
  if (customConfig) {
    try {
      const parsed = JSON.parse(customConfig);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url, anonKey: parsed.anonKey, isCustom: true };
      }
    } catch {
      // ignore json parse error
    }
  }

  return { url: envUrl, anonKey: envKey, isCustom: false };
};

export const saveCustomSupabaseConfig = (url: string, anonKey: string) => {
  if (!url || !anonKey) {
    localStorage.removeItem('edujian_supabase_custom_config');
  } else {
    localStorage.setItem(
      'edujian_supabase_custom_config',
      JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
    );
  }
};

// 2. Inisialisasi Supabase Client jika kredensial valid
let supabaseInstance: SupabaseClient | null = null;
const config = getSupabaseConfig();

if (config.url && config.anonKey && config.url.startsWith('https://')) {
  try {
    supabaseInstance = createClient(config.url, config.anonKey);
  } catch (err) {
    console.warn('Gagal inisialisasi Supabase SDK:', err);
  }
}

export const supabase = supabaseInstance;
export const isSupabaseConfigured = Boolean(
  config.url && config.anonKey && config.url.startsWith('https://')
);

// ============================================================================
// DATA AWAL SEEDING MULTI-TENANT (SDN 01 Menteng & SD Swasta Al-Azhar)
// Digunakan untuk pengujian langsung, demonstrasi, dan fallback offline
// ============================================================================

const SEED_SCHOOL_1_ID = 'sdn-01-menteng-uuid-001';
const SEED_SCHOOL_2_ID = 'sd-alazhar-rawamangun-uuid-002';

const INITIAL_SCHOOLS: School[] = [
  {
    id: SEED_SCHOOL_1_ID,
    npsn: '20101001',
    name: 'SDN 01 Menteng Jakarta',
    education_level: 'SD',
    school_type: 'negeri',
    address: 'Jl. Besuki No. 1, Menteng',
    province: 'DKI Jakarta',
    city_regency: 'Kota Jakarta Pusat',
    district: 'Menteng',
    postal_code: '10310',
    phone: '021-3907721',
    email: 'sdn01menteng@jakarta.sekolah.id',
    principal_name: 'Dr. H. Bambang Sujatmiko, M.Pd.',
    status: 'active',
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-10T08:00:00Z',
  },
  {
    id: SEED_SCHOOL_2_ID,
    npsn: '20102002',
    name: 'SD Swasta Islam Terpadu Cendekia',
    education_level: 'SD',
    school_type: 'swasta',
    address: 'Jl. Pemuda No. 45, Rawamangun',
    province: 'DKI Jakarta',
    city_regency: 'Kota Jakarta Timur',
    district: 'Pulogadung',
    postal_code: '13220',
    phone: '021-4786221',
    email: 'info@sditcendekia.sch.id',
    principal_name: 'Hj. Fatimah Zahra, M.Si.',
    status: 'active',
    created_at: '2025-01-15T09:30:00Z',
    updated_at: '2025-01-15T09:30:00Z',
  },
];

const INITIAL_PROFILES: (Profile & { role: UserRole; password?: string })[] = [
  {
    id: 'user-superadmin-01',
    school_id: null,
    full_name: 'Drs. Supriyanto, M.Ed (Pusat)',
    email: 'admin@kemdikbud.edujian.id',
    phone: '081299990001',
    role: 'super_admin',
    password: 'password123',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-admin-school-01',
    school_id: SEED_SCHOOL_1_ID,
    full_name: 'Hendra Wijaya, S.Pd (Admin SD 01)',
    email: 'admin.sdn01@jakarta.sekolah.id',
    phone: '081288880002',
    role: 'school_admin',
    password: 'password123',
    created_at: '2025-01-10T08:05:00Z',
    updated_at: '2025-01-10T08:05:00Z',
  },
  {
    id: 'user-proctor-01',
    school_id: SEED_SCHOOL_1_ID,
    full_name: 'Ibu Ratna Dewi, S.Pd (Pengawas)',
    email: 'proktor1@sdn01menteng.sch.id',
    phone: '081377770003',
    role: 'proctor',
    password: 'password123',
    created_at: '2025-01-10T08:10:00Z',
    updated_at: '2025-01-10T08:10:00Z',
  },
  {
    id: 'user-student-01',
    school_id: SEED_SCHOOL_1_ID,
    full_name: 'Ahmad Fadhil Pratama',
    email: 'fadhil@siswa.sdn01.id',
    phone: '081566660004',
    role: 'student',
    password: 'password123',
    created_at: '2025-01-10T08:15:00Z',
    updated_at: '2025-01-10T08:15:00Z',
  },
  {
    id: 'user-admin-school-02',
    school_id: SEED_SCHOOL_2_ID,
    full_name: 'Ustadz Fauzi Rahman, S.Pd.I',
    email: 'admin@sditcendekia.sch.id',
    phone: '081211112222',
    role: 'school_admin',
    password: 'password123',
    created_at: '2025-01-15T09:35:00Z',
    updated_at: '2025-01-15T09:35:00Z',
  },
];

const INITIAL_CLASSES: ClassRoom[] = [
  { id: 'c-01', school_id: SEED_SCHOOL_1_ID, grade_level: 1, section: 'A', name: 'Kelas 1-A', academic_year_id: 'ay-2024', created_at: '2025-01-10' },
  { id: 'c-02', school_id: SEED_SCHOOL_1_ID, grade_level: 2, section: 'A', name: 'Kelas 2-A', academic_year_id: 'ay-2024', created_at: '2025-01-10' },
  { id: 'c-03', school_id: SEED_SCHOOL_1_ID, grade_level: 3, section: 'A', name: 'Kelas 3-A', academic_year_id: 'ay-2024', created_at: '2025-01-10' },
  { id: 'c-04', school_id: SEED_SCHOOL_1_ID, grade_level: 4, section: 'A', name: 'Kelas 4-A', academic_year_id: 'ay-2024', created_at: '2025-01-10' },
  { id: 'c-05', school_id: SEED_SCHOOL_1_ID, grade_level: 5, section: 'A', name: 'Kelas 5-A', academic_year_id: 'ay-2024', created_at: '2025-01-10' },
  { id: 'c-06', school_id: SEED_SCHOOL_1_ID, grade_level: 6, section: 'A', name: 'Kelas 6-A (Unggulan)', academic_year_id: 'ay-2024', created_at: '2025-01-10' },
  // Sekolah 2
  { id: 'c-07', school_id: SEED_SCHOOL_2_ID, grade_level: 5, section: 'Ibnu Sina', name: 'Kelas 5 - Ibnu Sina', academic_year_id: 'ay-2024', created_at: '2025-01-15' },
  { id: 'c-08', school_id: SEED_SCHOOL_2_ID, grade_level: 6, section: 'Al-Khawarizmi', name: 'Kelas 6 - Al-Khawarizmi', academic_year_id: 'ay-2024', created_at: '2025-01-15' },
];

const INITIAL_STUDENTS: Student[] = [
  {
    id: 's-01',
    school_id: SEED_SCHOOL_1_ID,
    user_id: 'user-student-01',
    nisn: '0123456781',
    nis: '2401',
    full_name: 'Ahmad Fadhil Pratama',
    gender: 'L',
    class_id: 'c-06',
    class_name: 'Kelas 6-A (Unggulan)',
    birth_date: '2013-05-14',
    is_active: true,
    created_at: '2025-01-10',
  },
  {
    id: 's-02',
    school_id: SEED_SCHOOL_1_ID,
    user_id: null,
    nisn: '0123456782',
    nis: '2402',
    full_name: 'Siti Nurhaliza Putri',
    gender: 'P',
    class_id: 'c-06',
    class_name: 'Kelas 6-A (Unggulan)',
    birth_date: '2013-08-22',
    is_active: true,
    created_at: '2025-01-10',
  },
  {
    id: 's-03',
    school_id: SEED_SCHOOL_1_ID,
    user_id: null,
    nisn: '0123456783',
    nis: '2403',
    full_name: 'Budi Santoso Nugroho',
    gender: 'L',
    class_id: 'c-05',
    class_name: 'Kelas 5-A',
    birth_date: '2014-02-10',
    is_active: true,
    created_at: '2025-01-10',
  },
  {
    id: 's-04',
    school_id: SEED_SCHOOL_2_ID,
    user_id: null,
    nisn: '0123456790',
    nis: '2450',
    full_name: 'Muhammad Rizky Pratama',
    gender: 'L',
    class_id: 'c-08',
    class_name: 'Kelas 6 - Al-Khawarizmi',
    birth_date: '2013-03-01',
    is_active: true,
    created_at: '2025-01-15',
  },
];

const INITIAL_PROCTORS: Proctor[] = [
  {
    id: 'p-01',
    school_id: SEED_SCHOOL_1_ID,
    user_id: 'user-proctor-01',
    nip: '198503152010012001',
    full_name: 'Ibu Ratna Dewi, S.Pd',
    phone: '081377770003',
    is_active: true,
    created_at: '2025-01-10',
  },
];

const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-01', school_id: SEED_SCHOOL_1_ID, code: 'MAT-SD', name: 'Matematika SD', grade_level: 6, created_at: '2025-01-10' },
  { id: 'sub-02', school_id: SEED_SCHOOL_1_ID, code: 'BIN-SD', name: 'Bahasa Indonesia SD', grade_level: 6, created_at: '2025-01-10' },
  { id: 'sub-03', school_id: SEED_SCHOOL_1_ID, code: 'IPA-SD', name: 'Ilmu Pengetahuan Alam & Sosial (IPAS)', grade_level: 5, created_at: '2025-01-10' },
  { id: 'sub-04', school_id: SEED_SCHOOL_1_ID, code: 'PKN-SD', name: 'Pendidikan Pancasila', grade_level: 6, created_at: '2025-01-10' },
];

const INITIAL_BANKS: QuestionBank[] = [
  {
    id: 'qb-01',
    school_id: SEED_SCHOOL_1_ID,
    subject_id: 'sub-01',
    subject_name: 'Matematika SD',
    title: 'Bank Soal Ujian Akhir Jenjang Matematika Kelas 6',
    grade_level: 6,
    description: 'Kumpulan soal pecahan, bangun ruang, volume, dan statistika dasar SD.',
    created_by: 'user-admin-school-01',
    total_questions: 30,
    created_at: '2025-01-10',
    updated_at: '2025-01-10',
  },
  {
    id: 'qb-02',
    school_id: SEED_SCHOOL_1_ID,
    subject_id: 'sub-02',
    subject_name: 'Bahasa Indonesia SD',
    title: 'Bank Soal Sumatif Tengah Semester Bahasa Indonesia',
    grade_level: 6,
    description: 'Pemahaman teks narasi, sinonim, antonim, dan tanda baca.',
    created_by: 'user-admin-school-01',
    total_questions: 25,
    created_at: '2025-01-11',
    updated_at: '2025-01-11',
  },
];

const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exam-01',
    school_id: SEED_SCHOOL_1_ID,
    subject_id: 'sub-01',
    subject_name: 'Matematika SD',
    question_bank_id: 'qb-01',
    title: 'Asesmen Sumatif Akhir Jenjang (ASAJ) Matematika Kelas 6',
    grade_level: 6,
    duration_minutes: 60,
    passing_grade: 75,
    status: 'ongoing',
    randomize_questions: true,
    randomize_options: true,
    created_by: 'user-admin-school-01',
    created_at: '2025-01-12T07:00:00Z',
  },
  {
    id: 'exam-02',
    school_id: SEED_SCHOOL_1_ID,
    subject_id: 'sub-02',
    subject_name: 'Bahasa Indonesia SD',
    question_bank_id: 'qb-02',
    title: 'Penilaian Tengah Semester (PTS) Bahasa Indonesia',
    grade_level: 6,
    duration_minutes: 45,
    passing_grade: 70,
    status: 'scheduled',
    randomize_questions: true,
    randomize_options: true,
    created_by: 'user-admin-school-01',
    created_at: '2025-01-12T09:00:00Z',
  },
];

const INITIAL_TOKENS: ExamToken[] = [
  {
    id: 'tok-01',
    school_id: SEED_SCHOOL_1_ID,
    exam_id: 'exam-01',
    token_code: 'SDN01M',
    valid_until: '2026-12-31T23:59:59Z',
    created_by: 'user-admin-school-01',
    is_active: true,
  },
  {
    id: 'tok-02',
    school_id: SEED_SCHOOL_1_ID,
    exam_id: 'exam-02',
    token_code: 'BIN6SD',
    valid_until: '2026-12-31T23:59:59Z',
    created_by: 'user-admin-school-01',
    is_active: true,
  },
];

const INITIAL_SESSIONS: ExamSession[] = [
  {
    id: 'sess-01',
    school_id: SEED_SCHOOL_1_ID,
    exam_id: 'exam-01',
    student_id: 's-01',
    student_name: 'Ahmad Fadhil Pratama',
    student_nisn: '0123456781',
    class_name: 'Kelas 6-A (Unggulan)',
    proctor_id: 'p-01',
    status: 'in_progress',
    started_at: '2025-01-12T08:00:00Z',
    remaining_seconds: 2450,
    ip_address: '192.168.1.15',
    browser_info: 'Chrome 122.0 (Chromebook Lab SD)',
    created_at: '2025-01-12T08:00:00Z',
  },
  {
    id: 'sess-02',
    school_id: SEED_SCHOOL_1_ID,
    exam_id: 'exam-01',
    student_id: 's-02',
    student_name: 'Siti Nurhaliza Putri',
    student_nisn: '0123456782',
    class_name: 'Kelas 6-A (Unggulan)',
    proctor_id: 'p-01',
    status: 'submitted',
    started_at: '2025-01-12T08:00:00Z',
    finished_at: '2025-01-12T08:42:00Z',
    remaining_seconds: 0,
    ip_address: '192.168.1.16',
    browser_info: 'Chrome 122.0 (Chromebook Lab SD)',
    created_at: '2025-01-12T08:00:00Z',
  },
];

const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log-01',
    school_id: null,
    user_id: 'user-superadmin-01',
    user_role: 'super_admin',
    user_email: 'admin@kemdikbud.edujian.id',
    action: 'SYSTEM_BOOT',
    entity_type: 'PLATFORM',
    details: { message: 'Inisialisasi platform multi-tenant EduUjian SD' },
    ip_address: '10.0.0.1',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'log-02',
    school_id: SEED_SCHOOL_1_ID,
    user_id: 'user-admin-school-01',
    user_role: 'school_admin',
    user_email: 'admin.sdn01@jakarta.sekolah.id',
    action: 'REGISTER_SCHOOL',
    entity_type: 'SCHOOL',
    entity_id: SEED_SCHOOL_1_ID,
    details: { name: 'SDN 01 Menteng Jakarta', npsn: '20101001' },
    ip_address: '180.252.16.8',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'log-03',
    school_id: SEED_SCHOOL_1_ID,
    user_id: 'user-proctor-01',
    user_role: 'proctor',
    user_email: 'proktor1@sdn01menteng.sch.id',
    action: 'START_MONITORING',
    entity_type: 'EXAM_SESSION',
    entity_id: 'exam-01',
    details: { room: 'Lab Komputer SD 01' },
    ip_address: '192.168.1.2',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

// Local Repository Storage Helper
class MultiTenantStore {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(`edujian_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`edujian_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('Storage full or error', e);
    }
  }

  // Schools
  getSchools(): School[] {
    return this.get<School[]>('schools', INITIAL_SCHOOLS);
  }

  saveSchool(school: School): void {
    const schools = this.getSchools();
    const existingIndex = schools.findIndex((s) => s.id === school.id);
    if (existingIndex >= 0) {
      schools[existingIndex] = { ...schools[existingIndex], ...school, updated_at: new Date().toISOString() };
    } else {
      schools.push(school);
    }
    this.set('schools', schools);
  }

  // Profiles & Users
  getProfiles(): (Profile & { role: UserRole; password?: string })[] {
    return this.get('profiles', INITIAL_PROFILES);
  }

  saveProfile(profile: Profile & { role: UserRole; password?: string }): void {
    const list = this.getProfiles();
    const idx = list.findIndex((p) => p.id === profile.id || p.email.toLowerCase() === profile.email.toLowerCase());
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...profile };
    } else {
      list.push(profile);
    }
    this.set('profiles', list);
  }

  // Classes (Filtered by School ID)
  getClasses(schoolId?: string | null): ClassRoom[] {
    const all = this.get<ClassRoom[]>('classes', INITIAL_CLASSES);
    if (!schoolId) return all;
    return all.filter((c) => c.school_id === schoolId);
  }

  addClass(classroom: ClassRoom): void {
    const list = this.get<ClassRoom[]>('classes', INITIAL_CLASSES);
    list.push(classroom);
    this.set('classes', list);
  }

  // Students
  getStudents(schoolId?: string | null): Student[] {
    const all = this.get<Student[]>('students', INITIAL_STUDENTS);
    if (!schoolId) return all;
    return all.filter((s) => s.school_id === schoolId);
  }

  addStudent(student: Student): void {
    const list = this.get<Student[]>('students', INITIAL_STUDENTS);
    list.push(student);
    this.set('students', list);
  }

  // Proctors
  getProctors(schoolId?: string | null): Proctor[] {
    const all = this.get<Proctor[]>('proctors', INITIAL_PROCTORS);
    if (!schoolId) return all;
    return all.filter((p) => p.school_id === schoolId);
  }

  addProctor(proctor: Proctor): void {
    const list = this.get<Proctor[]>('proctors', INITIAL_PROCTORS);
    list.push(proctor);
    this.set('proctors', list);
  }

  // Subjects
  getSubjects(schoolId?: string | null): Subject[] {
    const all = this.get<Subject[]>('subjects', INITIAL_SUBJECTS);
    if (!schoolId) return all;
    return all.filter((s) => s.school_id === schoolId);
  }

  addSubject(subject: Subject): void {
    const list = this.get<Subject[]>('subjects', INITIAL_SUBJECTS);
    list.push(subject);
    this.set('subjects', list);
  }

  // Question Banks
  getQuestionBanks(schoolId?: string | null): QuestionBank[] {
    const all = this.get<QuestionBank[]>('question_banks', INITIAL_BANKS);
    if (!schoolId) return all;
    return all.filter((qb) => qb.school_id === schoolId);
  }

  addQuestionBank(qb: QuestionBank): void {
    const list = this.get<QuestionBank[]>('question_banks', INITIAL_BANKS);
    list.push(qb);
    this.set('question_banks', list);
  }

  // Exams
  getExams(schoolId?: string | null): Exam[] {
    const all = this.get<Exam[]>('exams', INITIAL_EXAMS);
    if (!schoolId) return all;
    return all.filter((e) => e.school_id === schoolId);
  }

  addExam(exam: Exam): void {
    const list = this.get<Exam[]>('exams', INITIAL_EXAMS);
    list.push(exam);
    this.set('exams', list);
  }

  // Tokens
  getTokens(schoolId?: string | null): ExamToken[] {
    const all = this.get<ExamToken[]>('tokens', INITIAL_TOKENS);
    if (!schoolId) return all;
    return all.filter((t) => t.school_id === schoolId);
  }

  addToken(token: ExamToken): void {
    const list = this.get<ExamToken[]>('tokens', INITIAL_TOKENS);
    list.push(token);
    this.set('tokens', list);
  }

  // Exam Sessions
  getSessions(schoolId?: string | null): ExamSession[] {
    const all = this.get<ExamSession[]>('sessions', INITIAL_SESSIONS);
    if (!schoolId) return all;
    return all.filter((s) => s.school_id === schoolId);
  }

  updateSession(session: ExamSession): void {
    const list = this.get<ExamSession[]>('sessions', INITIAL_SESSIONS);
    const idx = list.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      list[idx] = session;
    } else {
      list.push(session);
    }
    this.set('sessions', list);
  }

  // Audit Logs
  getAuditLogs(schoolId?: string | null): AuditLog[] {
    const all = this.get<AuditLog[]>('audit_logs', INITIAL_LOGS);
    if (!schoolId) return all; // super admin sees all
    return all.filter((l) => l.school_id === schoolId || l.school_id === null);
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };
    const list = this.get<AuditLog[]>('audit_logs', INITIAL_LOGS);
    list.unshift(newLog); // latest on top
    this.set('audit_logs', list);
    return newLog;
  }
}

export const tenantStore = new MultiTenantStore();
