/**
 * EduUjian SD - Skema Database & Tipe Data Multi-Tenant
 * Mendukung isolasi data berdasarkan `school_id` untuk seluruh entitas operasional sekolah.
 */

export type UserRole = 'super_admin' | 'school_admin' | 'proctor' | 'student';

export type SchoolStatus = 'active' | 'suspended' | 'pending';
export type SchoolType = 'negeri' | 'swasta';

export type ExamStatus = 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'archived';
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';
export type StudentExamStatus = 'not_started' | 'in_progress' | 'submitted' | 'graded';

// 1. schools
export interface School {
  id: string; // UUID primary key
  npsn: string; // Nomor Pokok Sekolah Nasional (unik 8 digit)
  name: string; // Nama Sekolah Dasar
  education_level: 'SD' | 'MI';
  school_type: SchoolType;
  address: string;
  province: string;
  city_regency: string;
  district: string;
  postal_code?: string;
  phone?: string;
  email: string;
  principal_name: string;
  status: SchoolStatus;
  created_at: string;
  updated_at: string;
}

// 2. profiles (terhubung dengan auth.users Supabase)
export interface Profile {
  id: string; // UUID references auth.users(id)
  school_id: string | null; // NULL for super_admin
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// 3. user_roles (Many-to-one atau 1 user 1 active role)
export interface UserRoleRecord {
  id: string;
  user_id: string; // references profiles(id)
  role: UserRole;
  school_id: string | null;
  created_at: string;
}

// 4. academic_years (Tahun Ajaran, misal 2024/2025)
export interface AcademicYear {
  id: string;
  school_id: string;
  name: string; // '2024/2025'
  is_active: boolean;
  created_at: string;
}

// 5. semesters (Ganjil / Genap)
export interface Semester {
  id: string;
  school_id: string;
  academic_year_id: string;
  name: 'Ganjil' | 'Genap';
  is_active: boolean;
  created_at: string;
}

// 6. classes (Kelas 1 sampai 6 SD + rombel, misal: Kelas 1-A, Kelas 6-B)
export interface ClassRoom {
  id: string;
  school_id: string;
  grade_level: 1 | 2 | 3 | 4 | 5 | 6; // Tingkat kelas SD
  section: string; // 'A', 'B', 'Al-Farabi', dll
  name: string; // 'Kelas 1-A'
  academic_year_id: string;
  created_at: string;
}

// 7. students (Data peserta didik)
export interface Student {
  id: string;
  school_id: string;
  user_id?: string | null; // relasi ke profiles jika siswa memiliki akun login langsung
  nisn: string; // 10 digit unik siswa
  nis?: string;
  full_name: string;
  gender: 'L' | 'P';
  class_id: string;
  birth_date?: string;
  is_active: boolean;
  created_at: string;
  // joined fields
  class_name?: string;
}

// 8. proctors (Data guru pengawas ujian)
export interface Proctor {
  id: string;
  school_id: string;
  user_id: string; // references profiles(id)
  nip?: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

// 9. subjects (Mata Pelajaran SD)
export interface Subject {
  id: string;
  school_id: string;
  code: string; // 'BIN-SD', 'MAT-SD', 'IPA-SD'
  name: string; // 'Bahasa Indonesia', 'Matematika'
  grade_level?: number;
  created_at: string;
}

// 10. question_banks (Bank Soal)
export interface QuestionBank {
  id: string;
  school_id: string;
  subject_id: string;
  title: string;
  grade_level: number;
  description?: string;
  created_by: string; // user_id
  total_questions: number;
  created_at: string;
  updated_at: string;
  // joined fields
  subject_name?: string;
}

// 11. questions (Daftar Butir Soal)
export interface Question {
  id: string;
  bank_id: string;
  school_id: string;
  question_number: number;
  type: QuestionType;
  prompt: string; // Teks pertanyaan
  image_url?: string;
  score_weight: number; // Bobot nilai (default 1)
  explanation?: string;
  created_at: string;
}

// 12. question_options (Opsi Pilihan Ganda A, B, C, D)
export interface QuestionOption {
  id: string;
  question_id: string;
  option_key: 'A' | 'B' | 'C' | 'D';
  option_text: string;
  is_correct: boolean; // Dibatasi oleh RLS agar tidak bisa dibaca oleh siswa!
}

// 13. exams (Paket Ujian)
export interface Exam {
  id: string;
  school_id: string;
  subject_id: string;
  question_bank_id: string;
  title: string; // misal 'Penilaian Akhir Semester Ganjil Matematika Kelas 5'
  grade_level: number;
  duration_minutes: number; // Durasi dalam menit
  passing_grade: number; // KKM (Kriteria Ketuntasan Minimal)
  status: ExamStatus;
  randomize_questions: boolean;
  randomize_options: boolean;
  created_by: string;
  created_at: string;
  // joined
  subject_name?: string;
}

// 14. exam_questions
export interface ExamQuestion {
  id: string;
  exam_id: string;
  question_id: string;
  order_number: number;
}

// 15. exam_schedules (Jadwal Ujian)
export interface ExamSchedule {
  id: string;
  school_id: string;
  exam_id: string;
  start_time: string; // ISO string
  end_time: string;
  academic_year_id: string;
  semester_id: string;
  is_active: boolean;
  created_at: string;
  // joined
  exam_title?: string;
}

// 16. exam_tokens (Token Sesi Ujian)
export interface ExamToken {
  id: string;
  school_id: string;
  exam_id: string;
  token_code: string; // 6 karakter unik, misal 'X4K9PQ'
  valid_until: string;
  created_by: string;
  is_active: boolean;
}

// 17. exam_participants (Penetapan Peserta Ujian)
export interface ExamParticipant {
  id: string;
  school_id: string;
  exam_id: string;
  student_id: string;
  proctor_id?: string;
  created_at: string;
}

// 18. exam_sessions (Sesi Pengerjaan Siswa)
export interface ExamSession {
  id: string;
  school_id: string;
  exam_id: string;
  student_id: string;
  proctor_id?: string;
  status: StudentExamStatus;
  started_at?: string;
  finished_at?: string;
  remaining_seconds: number;
  ip_address?: string;
  browser_info?: string;
  created_at: string;
  // joined
  student_name?: string;
  student_nisn?: string;
  class_name?: string;
}

// 19. student_answers (Lembar Jawaban Siswa)
export interface StudentAnswer {
  id: string;
  session_id: string;
  question_id: string;
  selected_option_id?: string;
  answer_text?: string;
  is_flagged: boolean; // Ragu-ragu
  updated_at: string;
}

// 20. exam_results (Hasil & Nilai Ujian)
export interface ExamResult {
  id: string;
  school_id: string;
  session_id: string;
  exam_id: string;
  student_id: string;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  empty_count: number;
  final_score: number; // 0 - 100
  is_passed: boolean;
  graded_at: string;
  // joined
  student_name?: string;
  student_nisn?: string;
  exam_title?: string;
}

// 21. audit_logs (Catatan Audit Keamanan & Operasional)
export interface AuditLog {
  id: string;
  school_id?: string | null;
  user_id: string;
  user_role: UserRole;
  user_email: string;
  action: string; // 'LOGIN', 'REGISTER_SCHOOL', 'GENERATE_TOKEN', 'SUBMIT_EXAM', dll
  entity_type: string;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}
