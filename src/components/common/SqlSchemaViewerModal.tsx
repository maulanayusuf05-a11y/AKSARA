import React, { useState } from 'react';
import { SUPABASE_SQL_SCHEMA } from '../../lib/sqlSchema';
import { X, Copy, Check, Database, ShieldCheck, Layers, FileCode } from 'lucide-react';

interface SqlSchemaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlSchemaViewerModal: React.FC<SqlSchemaViewerModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'explanation'>('sql');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const tablesSummary = [
    { name: 'schools', desc: 'Master data sekolah (NPSN unik, status, alamat, kepsek)' },
    { name: 'profiles', desc: 'Profil pengguna terikat ke auth.users Supabase' },
    { name: 'user_roles', desc: '4 peran utama: super_admin, school_admin, proctor, student' },
    { name: 'academic_years & semesters', desc: 'Tahun ajaran (2024/2025) dan semester (Ganjil/Genap)' },
    { name: 'classes', desc: 'Kelas 1 sampai kelas 6 SD beserta rombongan belajar' },
    { name: 'students', desc: 'Data siswa dengan NISN unik per sekolah' },
    { name: 'proctors', desc: 'Data guru pengawas ujian dengan penugasan' },
    { name: 'subjects', desc: 'Mata pelajaran khusus jenjang SD (Matematika, IPAS, dll)' },
    { name: 'question_banks', desc: 'Bank soal per mata pelajaran dan tingkat kelas' },
    { name: 'questions & question_options', desc: 'Butir soal dan opsi A-D (kunci jawaban terlindungi RLS)' },
    { name: 'exams & exam_questions', desc: 'Paket ujian, durasi, KKM, pengacakan soal & opsi' },
    { name: 'exam_schedules & exam_tokens', desc: 'Jadwal dan token 6 digit untuk akses ujian' },
    { name: 'exam_sessions & student_answers', desc: 'Sesi real-time pengerjaan, timer, dan lembar jawaban siswa' },
    { name: 'exam_results', desc: 'Koreksi otomatis dan rekap nilai ujian' },
    { name: 'audit_logs', desc: 'Pencatatan aktivitas administratif dan keamanan' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Skema Database PostgreSQL (Supabase DDL)
              </h2>
              <p className="text-xs text-slate-500">
                21 Tabel Relasional dengan Isolasi Multi-Tenant <code className="text-blue-600 font-mono">school_id</code> & Row Level Security (RLS)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs & Action */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-100/80 border-b border-slate-200">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('sql')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'sql'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              Kode SQL (DDL Supabase)
            </button>
            <button
              onClick={() => setActiveTab('explanation')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'explanation'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Penjelasan Tabel & Keamanan
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-xs font-medium shadow-xs transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Salin Seluruh SQL</span>
              </>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-sans text-sm">
          {activeTab === 'sql' ? (
            <div>
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Cara Menjalankan Skema Ini di Supabase:</strong>
                  <ol className="list-decimal list-inside mt-1 space-y-0.5 text-blue-900">
                    <li>Buka dashboard proyek Anda di <strong>supabase.com</strong></li>
                    <li>Buka menu <strong>SQL Editor</strong> di bilah navigasi kiri</li>
                    <li>Salin seluruh skrip SQL di bawah ini dan tempelkan ke editor</li>
                    <li>Klik tombol <strong>Run</strong> untuk mengeksekusi tabel, indeks, dan aturan RLS</li>
                  </ol>
                </div>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Prinsip Keamanan & Isolasi Multi-Tenant
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Setiap tabel operasional sekolah terikat dengan foreign key <code className="bg-slate-100 text-blue-700 px-1 py-0.5 rounded font-mono">school_id</code>. Melalui fitur <strong>Row Level Security (RLS)</strong> di Supabase PostgreSQL:
                </p>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                  <li><strong>Admin Sekolah</strong> hanya dapat membaca dan menulis data yang memiliki <code className="font-mono text-blue-600">school_id</code> sama dengan sekolah tempat ia bertugas.</li>
                  <li><strong>Proktor</strong> hanya dapat mengakses sesi ujian dan peserta yang ditugaskan kepadanya.</li>
                  <li><strong>Siswa SD</strong> hanya dapat melihat ujian milik sekolahnya sendiri dan tidak dapat membaca kolom <code className="font-mono text-amber-600">is_correct</code> pada pilihan jawaban sebelum ujian selesai dan dinilai.</li>
                  <li><strong>Super Admin</strong> memiliki akses pemantauan lintas sekolah untuk audit, aktivasi sekolah, dan statistik nasional tanpa merusak integritas lembar jawaban siswa.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Daftar 21 Tabel Relasional yang Disiapkan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {tablesSummary.map((tbl, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <span className="font-mono font-bold text-blue-700 block mb-0.5">{tbl.name}</span>
                      <span className="text-slate-600">{tbl.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
