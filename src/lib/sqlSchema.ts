/**
 * SQL Schema DDL EduUjian SD
 * Dilengkapi dengan UUID, Foreign Key, Row Level Security (RLS), Triggers, dan Isolasi Multi-Tenant.
 */

export const SUPABASE_SQL_SCHEMA = `-- ============================================================================
-- EduUjian SD - Skema Database Multi-Tenant PostgreSQL (Supabase)
-- Dibuat untuk Platform Ujian Digital Sekolah Dasar dengan Isolasi school_id
-- ============================================================================

-- 0. Ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL: schools (Master Data Sekolah Dasar)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    npsn VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    education_level VARCHAR(20) DEFAULT 'SD' NOT NULL,
    school_type VARCHAR(20) CHECK (school_type IN ('negeri', 'swasta')) NOT NULL,
    address TEXT NOT NULL,
    province VARCHAR(100) NOT NULL,
    city_regency VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10),
    phone VARCHAR(30),
    email VARCHAR(150) UNIQUE NOT NULL,
    principal_name VARCHAR(200) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. TABEL: profiles (Profil Pengguna terhubung ke auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. TABEL: user_roles (Hak Akses 4 Peran Utama)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(30) CHECK (role IN ('super_admin', 'school_admin', 'proctor', 'student')) NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- 4. TABEL: academic_years (Tahun Ajaran)
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- Contoh '2024/2025'
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. TABEL: semesters (Semester)
CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    name VARCHAR(20) CHECK (name IN ('Ganjil', 'Genap')) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. TABEL: classes (Kelas 1 - 6 SD + Rombel)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    grade_level SMALLINT CHECK (grade_level BETWEEN 1 AND 6) NOT NULL,
    section VARCHAR(50) NOT NULL, -- Contoh 'A', 'B', 'Amanah'
    name VARCHAR(100) NOT NULL, -- Contoh 'Kelas 1-A'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. TABEL: students (Data Peserta Didik SD)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    nisn VARCHAR(20) NOT NULL,
    nis VARCHAR(20),
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('L', 'P')) NOT NULL,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
    birth_date DATE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_school_nisn UNIQUE (school_id, nisn)
);

-- 8. TABEL: proctors (Data Guru Pengawas / Proktor)
CREATE TABLE IF NOT EXISTS public.proctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nip VARCHAR(30),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. TABEL: subjects (Mata Pelajaran SD)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(150) NOT NULL,
    grade_level SMALLINT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_school_subject_code UNIQUE (school_id, code)
);

-- 10. TABEL: question_banks (Bank Soal)
CREATE TABLE IF NOT EXISTS public.question_banks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    grade_level SMALLINT CHECK (grade_level BETWEEN 1 AND 6) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    total_questions INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. TABEL: questions (Daftar Butir Soal)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_id UUID NOT NULL REFERENCES public.question_banks(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    question_number INT NOT NULL,
    type VARCHAR(30) DEFAULT 'multiple_choice' CHECK (type IN ('multiple_choice', 'true_false', 'short_answer')),
    prompt TEXT NOT NULL,
    image_url TEXT,
    score_weight NUMERIC(5,2) DEFAULT 1.0 NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. TABEL: question_options (Pilihan Jawaban A, B, C, D)
CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_key VARCHAR(5) CHECK (option_key IN ('A', 'B', 'C', 'D')) NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE NOT NULL
);

-- 13. TABEL: exams (Paket Ujian)
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    question_bank_id UUID NOT NULL REFERENCES public.question_banks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    grade_level SMALLINT CHECK (grade_level BETWEEN 1 AND 6) NOT NULL,
    duration_minutes INT DEFAULT 60 NOT NULL,
    passing_grade NUMERIC(5,2) DEFAULT 75.0 NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'ongoing', 'completed', 'archived')),
    randomize_questions BOOLEAN DEFAULT TRUE NOT NULL,
    randomize_options BOOLEAN DEFAULT TRUE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. TABEL: exam_questions (Relasi Soal di Paket Ujian)
CREATE TABLE IF NOT EXISTS public.exam_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    order_number INT NOT NULL,
    CONSTRAINT unique_exam_question UNIQUE (exam_id, question_id)
);

-- 15. TABEL: exam_schedules (Jadwal Pelaksanaan Ujian)
CREATE TABLE IF NOT EXISTS public.exam_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id),
    semester_id UUID REFERENCES public.semesters(id),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 16. TABEL: exam_tokens (Token Keamanan Sesi Ujian)
CREATE TABLE IF NOT EXISTS public.exam_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    token_code VARCHAR(10) NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 17. TABEL: exam_participants (Penugasan Peserta Ujian)
CREATE TABLE IF NOT EXISTS public.exam_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    proctor_id UUID REFERENCES public.proctors(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_exam_student UNIQUE (exam_id, student_id)
);

-- 18. TABEL: exam_sessions (Sesi Ujian Siswa)
CREATE TABLE IF NOT EXISTS public.exam_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    proctor_id UUID REFERENCES public.proctors(id),
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'graded')),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    remaining_seconds INT NOT NULL,
    ip_address VARCHAR(50),
    browser_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 19. TABEL: student_answers (Lembar Jawaban Siswa)
CREATE TABLE IF NOT EXISTS public.student_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES public.question_options(id),
    answer_text TEXT,
    is_flagged BOOLEAN DEFAULT FALSE NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_session_question UNIQUE (session_id, question_id)
);

-- 20. TABEL: exam_results (Rekapitulasi Nilai Ujian)
CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    total_questions INT NOT NULL,
    correct_count INT DEFAULT 0 NOT NULL,
    wrong_count INT DEFAULT 0 NOT NULL,
    empty_count INT DEFAULT 0 NOT NULL,
    final_score NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
    is_passed BOOLEAN DEFAULT FALSE NOT NULL,
    graded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 21. TABEL: audit_logs (Audit Trail Keamanan Multi-Tenant)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    user_id UUID NOT NULL,
    user_role VARCHAR(30) NOT NULL,
    user_email VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INDEKS PERFORMA MULTI-TENANT (school_id & query search)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_schools_npsn ON public.schools(npsn);
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON public.profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_questions_bank_id ON public.questions(bank_id);
CREATE INDEX IF NOT EXISTS idx_exams_school_id ON public.exams(school_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_student_id ON public.exam_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_session_id ON public.student_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_school_id ON public.audit_logs(school_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function: Dapatkan peran pengguna aktif
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS VARCHAR AS $$
    SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper Function: Dapatkan school_id pengguna aktif
CREATE OR REPLACE FUNCTION public.get_current_school_id()
RETURNS UUID AS $$
    SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Kebijakan RLS:
-- 1. Super Admin dapat melihat semua sekolah & logs
CREATE POLICY super_admin_all_schools ON public.schools
    FOR ALL USING (public.get_current_user_role() = 'super_admin');

-- 2. Sekolah publik dapat didaftarkan (INSERT) saat registrasi terbuka
CREATE POLICY public_register_school ON public.schools
    FOR INSERT WITH CHECK (true);

-- 3. Admin Sekolah hanya dapat mengakses data sekolah miliknya
CREATE POLICY school_admin_own_school ON public.schools
    FOR SELECT USING (id = public.get_current_school_id() OR public.get_current_user_role() = 'super_admin');

CREATE POLICY school_admin_students ON public.students
    FOR ALL USING (school_id = public.get_current_school_id() OR public.get_current_user_role() = 'super_admin');

CREATE POLICY school_admin_exams ON public.exams
    FOR ALL USING (school_id = public.get_current_school_id() OR public.get_current_user_role() = 'super_admin');

-- 4. Kunci Jawaban (is_correct) Disembunyikan dari Siswa
CREATE POLICY hide_correct_answer_from_students ON public.question_options
    FOR SELECT USING (
        public.get_current_user_role() IN ('super_admin', 'school_admin', 'proctor')
        OR NOT EXISTS (
            SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'student'
        )
    );
`;
