import React, { useState, useEffect } from 'react';
import { tkaStore } from '../../../lib/tkaStore';
import { tenantStore } from '../../../lib/supabase';
import { Student, School, ExamSession } from '../../../types/database';
import {
  KeyRound,
  PlayCircle,
  Users,
  Eye,
  CheckCircle,
  Copy,
  RefreshCw,
  Clock,
  ShieldCheck,
  Check,
  Filter,
  Lock,
  Unlock,
  AlertTriangle,
} from 'lucide-react';

interface TkaAdministrasiTesViewProps {
  subTab?: string;
}

export const TkaAdministrasiTesView: React.FC<TkaAdministrasiTesViewProps> = ({
  subTab = 'token',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(subTab);
  const [tokenData, setTokenData] = useState(tkaStore.getActiveToken());
  const [copied, setCopied] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60); // 15 mins
  const [selectedGroup, setSelectedGroup] = useState<number>(1);
  const [testCode, setTestCode] = useState<string>('SIMTKAP26H2');
  const [isTestActive, setIsTestActive] = useState<boolean>(true);
  const [assignedCount, setAssignedCount] = useState<number>(0);
  const [sessions, setSessions] = useState<ExamSession[]>(tenantStore.getSessions());
  const students = tenantStore.getStudents();
  const schools = tenantStore.getSchools();

  // 15-minute token countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // auto refresh token
          const newCode = tkaStore.releaseNewToken(testCode);
          setTokenData(tkaStore.getActiveToken());
          return 15 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testCode]);

  const handleManualReleaseToken = () => {
    const newCode = tkaStore.releaseNewToken(testCode);
    setTokenData(tkaStore.getActiveToken());
    setSecondsRemaining(15 * 60);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(tokenData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAssignAll = () => {
    setAssignedCount(students.length);
    alert(`Berhasil meng-assign ${students.length} peserta ke Kelompok ${selectedGroup} untuk kode tes ${testCode}. Siswa sekarang dapat login.`);
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Subtab Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveSubTab('token')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'token'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Rilis Token Ujian</span>
        </button>

        <button
          onClick={() => setActiveSubTab('status')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'status'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>Status Tes & Pengaturan Sesi</span>
        </button>

        <button
          onClick={() => setActiveSubTab('kelompok')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'kelompok'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kelompok Tes & Assign Peserta</span>
        </button>

        <button
          onClick={() => setActiveSubTab('monitor')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'monitor'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Live Monitoring Siswa</span>
        </button>
      </div>

      {/* CONTENT: Rilis Token */}
      {activeSubTab === 'token' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
          <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" />
                Rilis Token Ujian Resmi (Pusat Asesmen Pendidikan)
              </h2>
              <p className="text-xs text-slate-500">
                Token aktif digunakan siswa untuk membuka lembar soal di Proktor Browser & Exambrowser Klien
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Server Token Terbuka (07.00 - 15.30 WIB)</span>
            </div>
          </div>

          {/* MAIN BIG TOKEN DISPLAY */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg text-center space-y-4">
            <div className="text-xs uppercase tracking-widest text-blue-300 font-bold">
              Token Sesi Simulasi TKA 2026
            </div>

            {/* Token Code Box */}
            <div className="inline-block bg-white/10 border-2 border-blue-400/50 rounded-2xl px-8 py-4 backdrop-blur-md">
              <span className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-yellow-300 select-all">
                {tokenData.code}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleCopyToken}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Token'}</span>
              </button>

              <button
                onClick={handleManualReleaseToken}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-xs transition"
              >
                <RefreshCw className="w-4 h-4 text-blue-300" />
                <span>Rilis Token Baru</span>
              </button>
            </div>

            {/* Timer countdown strip */}
            <div className="flex items-center justify-center gap-2 text-xs text-blue-200 pt-2 font-mono">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span>Token akan diperbarui otomatis dalam:</span>
              <strong className="text-yellow-300 font-bold text-sm">{formatCountdown(secondsRemaining)}</strong>
            </div>
          </div>

          {/* Token Meta Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Kode Tes Aktif</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{tokenData.testCode}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Waktu Rilis Terakhir</span>
              <span className="font-bold text-blue-700 text-sm">{tokenData.releasedAt}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Batas Aktif Hari Ini</span>
              <span className="font-bold text-slate-800 text-sm">{tokenData.validUntil}</span>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT: Status Tes */}
      {activeSubTab === 'status' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-blue-600" />
              Status Tes & Konfigurasi Sesi Aktif
            </h2>
            <p className="text-xs text-slate-500">
              Pengaturan sesi ujian seperti tertuang dalam instruksi Posko Pusat TKA Kemendikdasmen
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Daftar / Kode Tes</label>
                <select
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono font-semibold"
                >
                  <option value="SIMTKAP26H2">SIMTKAP26H2 (Simulasi Hari Kedua)</option>
                  <option value="SIMTKAP26H1">SIMTKAP26H1 (Simulasi Hari Pertama)</option>
                  <option value="GLADITKA26">GLADITKA26 (Gladi Bersih Nasional)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kelompok Ujian</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value={1}>Kelompok 1 (Semua Sesi: 07.00 - 15.30 WIB)</option>
                  <option value={2}>Kelompok 2 (Sesi Susulan)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Status Server Tes:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    isTestActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isTestActive ? 'Aktif (Siswa Dapat Mengerjakan)' : 'Non-Aktif'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsTestActive(!isTestActive);
                    alert(`Status tes berhasil diubah menjadi: ${!isTestActive ? 'Aktif' : 'Non-Aktif'}`);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  SET & Simpan Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT: Kelompok Tes & Assign All */}
      {activeSubTab === 'kelompok' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Alokasi Kelompok Tes & Aktivasi Peserta
              </h2>
              <p className="text-xs text-slate-500">
                Pilih Assign All untuk mengaktifkan seluruh peserta didik agar dapat login ke Exambrowser
              </p>
            </div>

            <button
              onClick={handleAssignAll}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Assign All Peserta ({students.length})</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Kode Tes</th>
                  <th className="py-2.5 px-3">Kelompok</th>
                  <th className="py-2.5 px-3">Waktu Sesi</th>
                  <th className="py-2.5 px-3">Jumlah Siswa</th>
                  <th className="py-2.5 px-3">Status Aktivasi</th>
                  <th className="py-2.5 px-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-mono font-bold text-blue-700">{testCode}</td>
                  <td className="py-3 px-3 font-semibold">Kelompok 1 (Semua Sesi)</td>
                  <td className="py-3 px-3 text-slate-600">07.00 - 15.30 WIB</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{students.length} Siswa</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Aktif & Assigned
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={handleAssignAll}
                      className="px-2.5 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-[11px] font-semibold"
                    >
                      Re-Assign
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENT: Live Monitor */}
      {activeSubTab === 'monitor' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                Live Monitoring Pengerjaan Ujian Real-Time
              </h2>
              <p className="text-xs text-slate-500">
                Memantau status interaksi siswa, sisa waktu, IP address komputer, dan status penguncian sesi
              </p>
            </div>
            <button
              onClick={() => setSessions(tenantStore.getSessions())}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
              title="Refresh status sesi"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Nama Siswa & NISN</th>
                  <th className="py-2.5 px-3">Sekolah</th>
                  <th className="py-2.5 px-3">IP Komputer Klien</th>
                  <th className="py-2.5 px-3">Sisa Waktu</th>
                  <th className="py-2.5 px-3">Status Pengerjaan</th>
                  <th className="py-2.5 px-3 text-right">Reset Sesi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{sess.student_name}</div>
                      <div className="text-[11px] font-mono text-slate-500">NISN: {sess.student_nisn}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{sess.class_name}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{sess.ip_address || '192.168.1.15'}</td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      {Math.floor(sess.remaining_seconds / 60)} menit
                    </td>
                    <td className="py-3 px-3">
                      {sess.status === 'in_progress' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                          Sedang Mengerjakan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Selesai Dikirim
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          alert(`Sesi siswa ${sess.student_name} telah di-reset. Siswa dapat login kembali.`);
                        }}
                        className="px-2.5 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded text-[11px] font-semibold"
                      >
                        Reset Login
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
