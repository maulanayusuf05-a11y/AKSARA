import React, { useState } from 'react';
import { tenantStore } from '../../../lib/supabase';
import { Student, School } from '../../../types/database';
import { TutWuriLogo } from '../../common/TutWuriLogo';
import {
  Users,
  KeyRound,
  Printer,
  FileCheck2,
  Search,
  Filter,
  CheckCircle,
  Download,
  QrCode,
  Sparkles,
  RefreshCw,
  UserCheck,
} from 'lucide-react';

interface TkaDataPesertaViewProps {
  subTab?: string;
}

export const TkaDataPesertaView: React.FC<TkaDataPesertaViewProps> = ({
  subTab = 'peserta',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(subTab);
  const [schools] = useState<School[]>(tenantStore.getSchools());
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>(tenantStore.getStudents());
  const [printingStudent, setPrintingStudent] = useState<Student | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState<number | null>(null);

  const filteredStudents = students.filter((st) => {
    const matchSchool = selectedSchoolId === 'all' || st.school_id === selectedSchoolId;
    const matchSearch =
      st.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.nisn.includes(searchTerm) ||
      (st.class_name && st.class_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSchool && matchSearch;
  });

  const handleGenerateParticipantNumbers = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // simulate generation of official participant codes
      setGeneratedCount(filteredStudents.length);
      setIsGenerating(false);
    }, 600);
  };

  const getSchoolName = (schoolId: string) => {
    const found = schools.find((s) => s.id === schoolId);
    return found ? found.name : 'Sekolah Dasar';
  };

  const getSchoolNpsn = (schoolId: string) => {
    const found = schools.find((s) => s.id === schoolId);
    return found ? found.npsn : '20100000';
  };

  return (
    <div className="space-y-4">
      {/* Subtab Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveSubTab('peserta')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'peserta'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Peserta Didik ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('generate')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'generate'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Generate Nomor Peserta</span>
        </button>

        <button
          onClick={() => setActiveSubTab('kartu')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'kartu'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Kartu Login Peserta</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dnt')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'dnt'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Rekap DNT Resmi</span>
        </button>
      </div>

      {/* FILTER BAR FOR SCHOOL */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-semibold text-slate-700 whitespace-nowrap">Filter Sekolah:</span>
          <select
            value={selectedSchoolId}
            onChange={(e) => setSelectedSchoolId(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          >
            <option value="all">Semua Satuan Pendidikan ({schools.length})</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (NPSN: {s.npsn})
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama siswa, NISN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* CONTENT: Peserta Didik */}
      {activeSubTab === 'peserta' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Data Peserta Didik Asesmen TKA SD
              </h2>
              <p className="text-xs text-slate-500">
                Menampilkan {filteredStudents.length} peserta terdaftar pada pangkalan data ujian nasional
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab('kartu')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kartu Ujian</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No. Peserta / NISN</th>
                  <th className="py-2.5 px-3">Nama Lengkap Siswa</th>
                  <th className="py-2.5 px-3">Satuan Pendidikan</th>
                  <th className="py-2.5 px-3">Rombel / Kelas</th>
                  <th className="py-2.5 px-3">Sesi / Ruang</th>
                  <th className="py-2.5 px-3 text-right">Kartu Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st, idx) => {
                  const noPeserta = `U-26-01-${getSchoolNpsn(st.school_id)}-${String(idx + 1).padStart(4, '0')}`;
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-blue-700">{noPeserta}</div>
                        <div className="text-[11px] font-mono text-slate-500">NISN: {st.nisn}</div>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">{st.full_name}</td>
                      <td className="py-3 px-3 text-slate-600">{getSchoolName(st.school_id)}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {st.class_name || 'Kelas 6-A'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-700">Sesi 1 • Ruang Lab 01</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setPrintingStudent(st)}
                          className="px-2.5 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-[11px] font-semibold transition"
                        >
                          Lihat Kartu
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENT: Generate Nomor Peserta */}
      {activeSubTab === 'generate' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              Automasi Generate Nomor Peserta & Kredensial CBT
            </h2>
            <p className="text-xs text-slate-500">
              Format standar nasional: U-[Tahun]-[KodeProv]-[NPSN]-[NomorUrut]
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="font-bold text-slate-800">Skema Penomoran Peserta TKA Pusmendik:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Tahun Pelaksanaan</span>
                <span className="font-mono font-bold text-slate-800">2026 (Kode: 26)</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Struktur Username Siswa</span>
                <span className="font-mono font-bold text-blue-700">U26[NPSN][URUT]</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Password Acak Unik</span>
                <span className="font-mono font-bold text-emerald-700">6 Digit Alfanumerik</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                disabled={isGenerating}
                onClick={handleGenerateParticipantNumbers}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Memproses Penomoran...' : 'Generate Nomor Peserta Sekarang'}</span>
              </button>
            </div>

            {generatedCount !== null && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>
                  Berhasil men-generate nomor peserta dan akun login untuk <strong>{generatedCount} siswa</strong>.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENT: Cetak Kartu Login */}
      {activeSubTab === 'kartu' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-600" />
                Pratinjau & Cetak Kartu Login Peserta Ujian
              </h2>
              <p className="text-xs text-slate-500">
                Format resmi kartu login TKA Pusmendik siap cetak untuk dibagikan kepada peserta didik
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Seluruh Kartu</span>
            </button>
          </div>

          {/* Grid of Printable Student Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.slice(0, 4).map((st, idx) => {
              const noPeserta = `U-26-01-${getSchoolNpsn(st.school_id)}-${String(idx + 1).padStart(4, '0')}`;
              const usernameCbt = `U26${getSchoolNpsn(st.school_id)}${String(idx + 1).padStart(3, '0')}`;
              return (
                <div
                  key={st.id}
                  className="bg-white border-2 border-slate-800 rounded-xl p-4 shadow-sm text-slate-900 space-y-3 relative overflow-hidden"
                >
                  {/* Watermark / Header line */}
                  <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <TutWuriLogo size={36} />
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          KEMENTERIAN PENDIDIKAN DASAR & MENENGAH
                        </div>
                        <div className="text-xs font-black tracking-tight text-slate-900">
                          KARTU LOGIN PESERTA TES KEMAMPUAN AKADEMIK
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      SD 2026
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="col-span-2 space-y-1">
                      <div className="flex">
                        <span className="w-24 text-slate-500 text-[11px]">Nama Lengkap:</span>
                        <strong className="text-slate-900">{st.full_name}</strong>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 text-[11px]">NISN / No. Peserta:</span>
                        <span className="font-mono text-slate-800 font-bold">{st.nisn}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 text-[11px]">Satuan Pendidikan:</span>
                        <span className="text-slate-700 font-medium">{getSchoolName(st.school_id)}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500 text-[11px]">Sesi / Ruang:</span>
                        <span className="text-slate-700 font-semibold">Sesi 1 • Lab Komputer 01</span>
                      </div>
                    </div>

                    {/* QR Code & Photo box */}
                    <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <QrCode className="w-12 h-12 text-slate-700" />
                      <span className="text-[9px] font-mono text-slate-500 mt-1">CBT SECURE</span>
                    </div>
                  </div>

                  {/* Credentials Box */}
                  <div className="bg-slate-100 border border-slate-300 rounded-lg p-2.5 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">
                        Username Login CBT
                      </span>
                      <span className="font-bold text-blue-700 text-sm">{usernameCbt}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">
                        Kata Sandi (Password)
                      </span>
                      <span className="font-bold text-emerald-700 text-sm">P@ss{st.nisn.slice(-4)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>* Harap simpan kartu ini dan bawa ke ruang ujian</span>
                    <button
                      onClick={() => setPrintingStudent(st)}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Perbesar Kartu
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENT: Rekap DNT */}
      {activeSubTab === 'dnt' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                Daftar Nominasi Tetap (DNT) Peserta Ujian Nasional
              </h2>
              <p className="text-xs text-slate-500">
                Pencatatan resmi peserta ujian yang telah divalidasi oleh Dinas Pendidikan
              </p>
            </div>
            <button
              onClick={() => alert('Mengunduh Berkas DNT Resmi dalam format PDF / Excel.')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export DNT (PDF)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200">
                <tr>
                  <th className="py-2 px-3">No</th>
                  <th className="py-2 px-3">No. Peserta</th>
                  <th className="py-2 px-3">NISN</th>
                  <th className="py-2 px-3">Nama Siswa</th>
                  <th className="py-2 px-3">L/P</th>
                  <th className="py-2 px-3">Tempat, Tanggal Lahir</th>
                  <th className="py-2 px-3">Status DNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredStudents.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                      U-26-01-{getSchoolNpsn(st.school_id)}-{String(idx + 1).padStart(4, '0')}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{st.nisn}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{st.full_name}</td>
                    <td className="py-2.5 px-3">{st.gender}</td>
                    <td className="py-2.5 px-3 text-slate-600">Jakarta, 14 Mei 2014</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Valid DNT
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Zoom Card */}
      {printingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Kartu Login Peserta Ujian</h3>
              <button
                onClick={() => setPrintingStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="border-2 border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3 border-b-2 border-slate-800 pb-2">
                <TutWuriLogo size={42} />
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-500">
                    KEMENTERIAN PENDIDIKAN DASAR & MENENGAH
                  </div>
                  <div className="text-xs font-black text-slate-900">
                    KARTU PESERTA TES KEMAMPUAN AKADEMIK 2026
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div>Nama: <strong>{printingStudent.full_name}</strong></div>
                <div>NISN: <span className="font-mono font-bold">{printingStudent.nisn}</span></div>
                <div>Sekolah: {getSchoolName(printingStudent.school_id)}</div>
                <div>Rombel: {printingStudent.class_name || 'Kelas 6-A'}</div>
              </div>

              <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 font-mono text-xs grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans font-bold">Username:</span>
                  <span className="font-bold text-blue-700 text-sm">U26{printingStudent.nisn}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans font-bold">Password:</span>
                  <span className="font-bold text-emerald-700 text-sm">P@ss{printingStudent.nisn.slice(-4)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPrintingStudent(null)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Kartu Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
