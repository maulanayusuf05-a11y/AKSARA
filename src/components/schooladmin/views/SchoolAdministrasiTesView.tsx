import React, { useState } from 'react';
import { tenantStore } from '../../../lib/supabase';
import { tkaStore } from '../../../lib/tkaStore';
import { Student } from '../../../types/database';
import {
  MonitorCheck,
  KeyRound,
  Users,
  Activity,
  Plus,
  RefreshCw,
  CheckCircle,
  Clock,
  RotateCcw,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface SchoolAdministrasiTesViewProps {
  schoolId: string;
  subTab?: string;
}

export const SchoolAdministrasiTesView: React.FC<SchoolAdministrasiTesViewProps> = ({
  schoolId,
  subTab = 'token',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(subTab);
  const school = tenantStore.getSchoolById(schoolId) || tenantStore.getSchools()[0];
  const students = tenantStore.getStudents(schoolId);
  const activeCenterToken = tkaStore.getActiveToken();
  const exams = tenantStore.getExams(schoolId);

  // Monitor live students
  const [liveStudents, setLiveStudents] = useState(
    students.map((st, i) => ({
      ...st,
      status: i % 4 === 0 ? 'selesai' : i % 5 === 0 ? 'terputus' : 'mengerjakan',
      progress: i % 4 === 0 ? 100 : 35 + (i * 7) % 55,
      remainingMinutes: i % 4 === 0 ? 0 : 42 - (i % 15),
      currentQuestion: i % 4 === 0 ? 30 : Math.floor((35 + (i * 7) % 55) * 0.3),
    }))
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [tokenCopied, setTokenCopied] = useState(false);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(activeCenterToken.code);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const handleResetLogin = (studentId: string, studentName: string) => {
    setLiveStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: 'mengerjakan' } : s))
    );
    alert(`Status login siswa ${studentName} berhasil di-reset. Siswa dapat login kembali dari komputer ruang lab.`);
  };

  const filtered = liveStudents.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm)
  );

  return (
    <div className="space-y-5">
      {/* Scope Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-blue-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded text-[10px] font-bold uppercase tracking-wider">
                Cakupan Data Sekolah Saya
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-blue-200 font-mono">NPSN: {school?.npsn}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <MonitorCheck className="w-5 h-5 text-blue-400" />
              <span>Administrasi Tes • {school?.name}</span>
            </h1>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Menerima rilis token resmi harian dari Super Admin Pusat, mengatur sesi tes di laboratorium sekolah, dan memantau live pengerjaan siswa <strong>{school?.name}</strong>.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sesi Mandiri</span>
            </span>
          </div>
        </div>
      </div>

      {/* Subtab Navigation matching Super Admin 1:1 */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 flex flex-wrap gap-1 shadow-xs">
        <button
          onClick={() => setActiveSubTab('status')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'status'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MonitorCheck className="w-3.5 h-3.5" />
          <span>Status Tes</span>
        </button>

        <button
          onClick={() => setActiveSubTab('token')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'token'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Rilis Token</span>
        </button>

        <button
          onClick={() => setActiveSubTab('kelompok')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'kelompok'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Kelompok Tes & Alokasi</span>
        </button>

        <button
          onClick={() => setActiveSubTab('monitor')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'monitor'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Live Monitoring Siswa</span>
        </button>
      </div>

      {/* 1. SUBTAB: STATUS TES */}
      {activeSubTab === 'status' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <MonitorCheck className="w-4 h-4 text-blue-600" />
              Paket & Status Sesi Ujian di {school?.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Jadwal pelaksanaan tes yang diaktifkan untuk peserta didik di sekolah ini
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Judul Ujian</th>
                  <th className="py-2.5 px-3">Mata Pelajaran</th>
                  <th className="py-2.5 px-3">Durasi</th>
                  <th className="py-2.5 px-3">Ruang Lab</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-bold text-slate-900">{ex.title}</td>
                    <td className="py-3 px-3 text-slate-700">{ex.subject_name || 'AKM Literasi & Numerasi SD'}</td>
                    <td className="py-3 px-3 text-slate-600">{ex.duration_minutes} Menit</td>
                    <td className="py-3 px-3 text-slate-600">Lab Komputer Utama (Sesi 1 & 2)</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        Siap Ujian
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. SUBTAB: RILIS TOKEN */}
      {activeSubTab === 'token' && (
        <div className="space-y-4">
          {/* Active Token Center received from SuperAdmin */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl space-y-3 shadow-md border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                Token Resmi Diterbitkan dari Super Admin Pusat
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-mono border border-emerald-500/30">
                Online Aktif: 07.00 - 15.30 WIB
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
              <div>
                <div className="font-mono text-5xl font-black text-yellow-300 tracking-widest">
                  {activeCenterToken.code}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Kode Tes: <strong className="text-white">{activeCenterToken.testCode}</strong> • Berlaku s/d {activeCenterToken.validUntil}
                </div>
              </div>

              <button
                onClick={handleCopyToken}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{tokenCopied ? 'Tersalin!' : 'Salin Token'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
              Bagikan token ini kepada guru pengawas ruang lab di <strong>{school?.name}</strong> saat sesi pengerjaan soal dimulai. Siswa memasukkan token ini di layar konfirmasi tes.
            </p>
          </div>
        </div>
      )}

      {/* 3. SUBTAB: KELOMPOK TES & ALOKASI */}
      {activeSubTab === 'kelompok' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Kelompok Sesi & Alokasi Ruang Lab di {school?.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pembagian giliran sesi tes peserta didik berdasarkan kapasitas komputer lab sekolah ini
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="font-bold text-slate-900 text-sm">Sesi 1 (Pagi: 07.30 - 09.30 WIB)</div>
              <p className="text-slate-500">Ruang: Lab Komputer 1 (30 PC Siswa)</p>
              <div className="text-blue-700 font-bold">
                Alokasi: {Math.ceil(students.length / 2)} Siswa (Rombel Kelas 6A)
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200">
                Terjadwal
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="font-bold text-slate-900 text-sm">Sesi 2 (Siang: 10.00 - 12.00 WIB)</div>
              <p className="text-slate-500">Ruang: Lab Komputer 1 (30 PC Siswa)</p>
              <div className="text-blue-700 font-bold">
                Alokasi: {Math.floor(students.length / 2)} Siswa (Rombel Kelas 6B)
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200">
                Terjadwal
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUBTAB: LIVE MONITORING SISWA */}
      {activeSubTab === 'monitor' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Live Monitoring Pengerjaan Siswa ({school?.name})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pantau langsung status pengerjaan soal, sisa waktu, dan tombol reset login jika siswa terkendala
              </p>
            </div>
          </div>

          <div className="relative text-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari siswa yang sedang tes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">NISN</th>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3">Progress Soal</th>
                  <th className="py-2.5 px-3">Sisa Waktu</th>
                  <th className="py-2.5 px-3">Status Live</th>
                  <th className="py-2.5 px-3 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-mono text-slate-600">{st.nisn}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{st.full_name}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${st.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${st.progress}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-[10px] text-slate-600">
                          {st.currentQuestion}/30
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {st.remainingMinutes > 0 ? `${st.remainingMinutes} Menit` : 'Selesai'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          st.status === 'selesai'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : st.status === 'terputus'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleResetLogin(st.id, st.full_name)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 rounded-lg text-[11px] font-semibold flex items-center gap-1 mx-auto transition"
                        title="Reset sesi login jika siswa mengalami kendala browser"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-600" />
                        <span>Reset Login</span>
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
