import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { tenantStore } from '../../lib/supabase';
import { ExamSession, ExamToken, Exam } from '../../types/database';
import {
  UserCheck,
  Eye,
  Clock,
  KeyRound,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Monitor,
  Wifi,
  Users,
  ShieldAlert,
} from 'lucide-react';

interface ProctorDashboardProps {
  activeTab: string;
}

export const ProctorDashboard: React.FC<ProctorDashboardProps> = ({ activeTab }) => {
  const { currentSchool, user } = useAuth();
  const schoolId = currentSchool?.id || '';

  const [sessions, setSessions] = useState<ExamSession[]>(() => tenantStore.getSessions(schoolId));
  const exams = tenantStore.getExams(schoolId);
  const [tokens, setTokens] = useState<ExamToken[]>(() => tenantStore.getTokens(schoolId));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const activeExam = exams[0] || null;
  const currentToken = tokens.find((t) => t.is_active) || null;

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Reset Sesi Siswa jika mengalami kendala teknis (Browser crash, mati lampu, reconnect)
  const handleResetSession = (session: ExamSession) => {
    const updated: ExamSession = {
      ...session,
      status: 'not_started',
      ip_address: undefined,
      browser_info: undefined,
      remaining_seconds: (activeExam?.duration_minutes || 60) * 60,
    };
    tenantStore.updateSession(updated);
    setSessions(tenantStore.getSessions(schoolId));

    tenantStore.addAuditLog({
      school_id: schoolId,
      user_id: user?.id || 'proctor',
      user_role: 'proctor',
      user_email: user?.email || '',
      action: 'RESET_STUDENT_SESSION',
      entity_type: 'EXAM_SESSION',
      entity_id: session.id,
      details: { student_name: session.student_name, student_nisn: session.student_nisn },
    });

    showNotice(`Sesi pengerjaan atas nama ${session.student_name} telah di-reset. Siswa dapat login kembali.`);
  };

  // Paksa kumpulkan ujian jika waktu habis
  const handleForceSubmit = (session: ExamSession) => {
    const updated: ExamSession = {
      ...session,
      status: 'submitted',
      finished_at: new Date().toISOString(),
      remaining_seconds: 0,
    };
    tenantStore.updateSession(updated);
    setSessions(tenantStore.getSessions(schoolId));

    tenantStore.addAuditLog({
      school_id: schoolId,
      user_id: user?.id || 'proctor',
      user_role: 'proctor',
      user_email: user?.email || '',
      action: 'FORCE_SUBMIT_EXAM',
      entity_type: 'EXAM_SESSION',
      entity_id: session.id,
      details: { student_name: session.student_name },
    });

    showNotice(`Jawaban ${session.student_name} berhasil dikumpulkan.`);
  };

  const filteredSessions = sessions.filter((s) => {
    const matchSearch =
      (s.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.student_nisn || '').includes(searchTerm);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-800 shadow-sm animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* Proctor Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-200 border border-amber-300/30 rounded-md text-[10px] font-bold tracking-wider uppercase">
              Ruang Pengawasan (Proctoring Room)
            </span>
            <span className="text-white/60 text-xs">•</span>
            <span className="text-xs text-amber-200">{currentSchool?.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Pemantauan Pelaksanaan Ujian Digital
          </h1>
          <p className="text-xs text-amber-100/90 max-w-2xl mt-1">
            Pengawasan real-time peserta, verifikasi kehadiran, rilis token ujian, dan penanganan kendala teknis di ruang ujian.
          </p>
        </div>

        {/* Live Token Box */}
        <div className="bg-black/30 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg text-amber-300">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-200">
              Token Ujian Aktif
            </div>
            <div className="text-2xl font-mono font-black tracking-widest text-white">
              {currentToken ? currentToken.token_code : 'SDN01M'}
            </div>
          </div>
        </div>
      </div>

      {/* 4 MONITORING CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Peserta Ruangan</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{sessions.length} Siswa</div>
          <div className="text-[11px] text-slate-500 mt-1">Terjadwal Ujian</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Sedang Mengerjakan</span>
            <Wifi className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {sessions.filter((s) => s.status === 'in_progress').length} Siswa
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Live Online</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Sudah Selesai</span>
            <CheckCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {sessions.filter((s) => s.status === 'submitted').length} Siswa
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Jawaban Terkirim</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Belum Masuk</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {sessions.filter((s) => s.status === 'not_started').length} Siswa
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Menunggu Login</div>
        </div>
      </div>

      {/* LIVE PARTICIPANTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-600" />
              Tabel Pemantauan Peserta Ujian Secara Langsung
            </h2>
            <p className="text-xs text-slate-500">
              {activeExam?.title || 'Asesmen Sumatif Matematika SD Kelas 6'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama atau NISN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Semua Status</option>
              <option value="in_progress">Sedang Mengerjakan</option>
              <option value="submitted">Sudah Selesai</option>
              <option value="not_started">Belum Masuk</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">NISN & Nama Siswa</th>
                <th className="py-2.5 px-3">Kelas</th>
                <th className="py-2.5 px-3">Status Pengerjaan</th>
                <th className="py-2.5 px-3">Sisa Waktu</th>
                <th className="py-2.5 px-3">Perangkat / IP</th>
                <th className="py-2.5 px-3 text-right">Tindakan Pengawas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSessions.map((sess) => (
                <tr key={sess.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{sess.student_name}</div>
                    <div className="text-[11px] font-mono text-slate-500">
                      NISN: <span className="font-semibold text-blue-700">{sess.student_nisn}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {sess.class_name || 'Kelas 6-A'}
                  </td>
                  <td className="py-3 px-3">
                    {sess.status === 'in_progress' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Sedang Mengerjakan
                      </span>
                    )}
                    {sess.status === 'submitted' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        <CheckCircle className="w-3 h-3 text-blue-600" />
                        Sudah Selesai
                      </span>
                    )}
                    {sess.status === 'not_started' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        Belum Masuk
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-700">
                    {sess.status === 'in_progress' ? (
                      <span className="text-emerald-700">
                        {Math.floor(sess.remaining_seconds / 60)}m {sess.remaining_seconds % 60}s
                      </span>
                    ) : sess.status === 'submitted' ? (
                      <span className="text-slate-400">00:00</span>
                    ) : (
                      <span className="text-slate-400">Belum Mulai</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-500">
                    <div>{sess.ip_address || '192.168.1.10'}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {sess.browser_info || 'Lab Komputer SD'}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right space-x-1.5">
                    {sess.status === 'in_progress' && (
                      <>
                        <button
                          onClick={() => handleResetSession(sess)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition"
                          title="Gunakan jika siswa mengalami error browser atau mati komputer"
                        >
                          Reset Login
                        </button>
                        <button
                          onClick={() => handleForceSubmit(sess)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition"
                          title="Kumpulkan jawaban siswa secara paksa"
                        >
                          Kumpulkan
                        </button>
                      </>
                    )}
                    {sess.status === 'not_started' && (
                      <span className="text-slate-400 text-[11px]">Menunggu Siswa</span>
                    )}
                    {sess.status === 'submitted' && (
                      <span className="text-emerald-700 text-[11px] font-semibold">Tersimpan Aman</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
