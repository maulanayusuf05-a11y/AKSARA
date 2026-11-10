import React, { useState } from 'react';
import { tenantStore } from '../../../lib/supabase';
import { TutWuriLogo } from '../../common/TutWuriLogo';
import {
  BarChart2,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Printer,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface SchoolRekapLaporanViewProps {
  schoolId: string;
  subTab?: string;
}

export const SchoolRekapLaporanView: React.FC<SchoolRekapLaporanViewProps> = ({
  schoolId,
  subTab = 'kehadiran',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(subTab);
  const school = tenantStore.getSchoolById(schoolId) || tenantStore.getSchools()[0];
  const students = tenantStore.getStudents(schoolId);
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy mock scores for this school's students
  const studentScores = students.map((st, idx) => ({
    ...st,
    literasi: 78 + (idx % 18),
    numerasi: 75 + ((idx * 3) % 22),
    statusKehadiran: idx === 2 ? 'Sakit' : 'Hadir',
    sesi: (idx % 2) + 1,
  }));

  const filtered = studentScores.filter((s) => {
    const matchSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm);
    return matchSearch;
  });

  const totalHadir = studentScores.filter((s) => s.statusKehadiran === 'Hadir').length;
  const totalTidakHadir = studentScores.length - totalHadir;
  const avgLiterasi = (
    studentScores.reduce((acc, curr) => acc + curr.literasi, 0) / (studentScores.length || 1)
  ).toFixed(1);
  const avgNumerasi = (
    studentScores.reduce((acc, curr) => acc + curr.numerasi, 0) / (studentScores.length || 1)
  ).toFixed(1);

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
              <BarChart2 className="w-5 h-5 text-blue-400" />
              <span>Rekap dan Laporan • {school?.name}</span>
            </h1>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Laporan presensi kehadiran, nilai asesmen literasi & numerasi, dan Berita Acara (BAP) khusus untuk peserta didik di <strong>{school?.name}</strong>.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Hasil Terisolasi</span>
            </span>
          </div>
        </div>
      </div>

      {/* Subtab Navigation matching Super Admin 1:1 */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 flex flex-wrap gap-1 shadow-xs">
        <button
          onClick={() => setActiveSubTab('kehadiran')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'kehadiran'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Rekap Kehadiran</span>
        </button>

        <button
          onClick={() => setActiveSubTab('laporan')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'laporan'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Laporan Hasil Ujian</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bap')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'bap'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Berita Acara (BAP)</span>
        </button>
      </div>

      {/* 1. SUBTAB: REKAP KEHADIRAN */}
      {activeSubTab === 'kehadiran' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Total Peserta Terdaftar</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{students.length} Siswa</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Seluruh Rombel {school?.name}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-emerald-600 uppercase">Hadir Mengikuti Tes</div>
              <div className="text-xl font-bold text-emerald-700 mt-0.5">{totalHadir} Siswa</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Tingkat Kehadiran {((totalHadir / (students.length || 1)) * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-amber-600 uppercase">Tidak Hadir / Sakit</div>
              <div className="text-xl font-bold text-amber-700 mt-0.5">{totalTidakHadir} Siswa</div>
              <div className="text-[10px] text-amber-600 mt-0.5">Jadwal Susulan Tersedia</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-blue-600 uppercase">Jumlah Sesi Tes</div>
              <div className="text-xl font-bold text-blue-700 mt-0.5">2 Sesi</div>
              <div className="text-[10px] text-blue-600 mt-0.5">Lab Komputer Utama</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Presensi Sesi Ujian Siswa ({school?.name})</h3>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Presensi</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">NISN</th>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3">Rombel</th>
                    <th className="py-2.5 px-3">Sesi</th>
                    <th className="py-2.5 px-3">Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((st, i) => (
                    <tr key={st.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{i + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{st.nisn}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{st.full_name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{st.class_name || 'Kelas 6A'}</td>
                      <td className="py-2.5 px-3">Sesi {st.sesi}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            st.statusKehadiran === 'Hadir'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {st.statusKehadiran}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUBTAB: LAPORAN HASIL UJIAN */}
      {activeSubTab === 'laporan' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                Laporan Nilai Asesmen Kompetensi Siswa ({school?.name})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nilai capaian asesmen literasi membaca dan numerasi matematika siswa di sekolah ini
              </p>
            </div>
            <button
              onClick={() => alert(`Mengunduh Rekap Nilai Siswa ${school?.name} (Excel)...`)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Unduh Nilai Excel</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <div className="text-xs text-blue-600 font-bold uppercase">Rata-rata Literasi Membaca</div>
              <div className="text-2xl font-black text-blue-900 mt-1">{avgLiterasi}</div>
              <div className="text-[10px] text-blue-700 mt-0.5">Kategori: Cakap & Mahir</div>
            </div>
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
              <div className="text-xs text-indigo-600 font-bold uppercase">Rata-rata Numerasi Matematika</div>
              <div className="text-2xl font-black text-indigo-900 mt-1">{avgNumerasi}</div>
              <div className="text-[10px] text-indigo-700 mt-0.5">Kategori: Berkembang</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">NISN</th>
                  <th className="py-2.5 px-3">Nama Lengkap Siswa</th>
                  <th className="py-2.5 px-3">Nilai Literasi</th>
                  <th className="py-2.5 px-3">Nilai Numerasi</th>
                  <th className="py-2.5 px-3">Nilai Akhir</th>
                  <th className="py-2.5 px-3">Predikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((st, i) => {
                  const na = ((st.literasi + st.numerasi) / 2).toFixed(1);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{i + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{st.nisn}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{st.full_name}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{st.literasi}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{st.numerasi}</td>
                      <td className="py-2.5 px-3 font-mono font-black text-slate-900">{na}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {Number(na) >= 80 ? 'Mahir' : 'Cakap'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SUBTAB: BERITA ACARA PELAKSANAAN (BAP) */}
      {activeSubTab === 'bap' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Berita Acara Pelaksanaan (BAP) Ujian ({school?.name})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dokumen pertanggungjawaban resmi pelaksanaan tes di laboratorium komputer sekolah ini
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Formulir BAP</span>
            </button>
          </div>

          <div className="border-2 border-slate-300 rounded-2xl p-6 bg-slate-50/40 space-y-4 text-xs">
            <div className="flex items-center justify-center gap-3 pb-3 border-b border-slate-200 text-center">
              <TutWuriLogo size={42} className="shrink-0" />
              <div>
                <div className="font-extrabold text-sm text-slate-900 uppercase">
                  BERITA ACARA PELAKSANAAN TES KEMAMPUAN AKADEMIK (TKA)
                </div>
                <div className="font-bold text-slate-700 text-xs">{school?.name} • NPSN: {school?.npsn}</div>
                <div className="text-[10px] text-slate-500">Tahun Ajaran 2025/2026</div>
              </div>
            </div>

            <div className="space-y-2 text-slate-700 leading-relaxed">
              <p>
                Pada hari ini, <strong>Selasa, 24 Februari 2026</strong>, telah dilaksanakan Asesmen dan Kompetensi Siswa Terarah (AKSARA CBT) di Satuan Pendidikan:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-white border border-slate-200 rounded-xl">
                <div>• Nama Satuan Pendidikan: <strong>{school?.name}</strong></div>
                <div>• NPSN: <strong>{school?.npsn}</strong></div>
                <div>• Ruang / Laboratorium: <strong>Lab Komputer Utama (Ruang 1)</strong></div>
                <div>• Sesi Ujian: <strong>Sesi 1 & 2</strong></div>
                <div>• Jumlah Siswa Terdaftar: <strong>{students.length} Siswa</strong></div>
                <div>• Jumlah Siswa Hadir: <strong>{totalHadir} Siswa</strong></div>
              </div>
              <p>
                Catatan Kejadian Ujian: Pelaksanaan berjalan tertib, aman, dan lancar tanpa kendala teknis jaringan listrik maupun server lokal.
              </p>
            </div>

            <div className="pt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-[11px] text-slate-500">Proktor / Pengawas Ruang</div>
                <div className="mt-12 font-bold text-slate-900">( Guru Pengawas Ruang )</div>
                <div className="text-[10px] text-slate-500">NIP. 198506122010011005</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Kepala Satuan Pendidikan</div>
                <div className="mt-12 font-bold text-slate-900">({school?.principal_name})</div>
                <div className="text-[10px] text-slate-500">NIP. 197403151998021002</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
