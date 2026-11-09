import React, { useState } from 'react';
import { tenantStore } from '../../../lib/supabase';
import { School, Student } from '../../../types/database';
import {
  FileText,
  BarChart3,
  CheckCircle,
  Clock,
  Printer,
  Download,
  Filter,
  FileCheck2,
  AlertCircle,
} from 'lucide-react';

interface TkaRekapLaporanViewProps {
  subTab?: string;
}

export const TkaRekapLaporanView: React.FC<TkaRekapLaporanViewProps> = ({
  subTab = 'kehadiran',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(subTab);
  const [schools] = useState<School[]>(tenantStore.getSchools());
  const [students] = useState<Student[]>(tenantStore.getStudents());
  const [selectedSchoolId, setSelectedSchoolId] = useState('all');

  return (
    <div className="space-y-4">
      {/* Subtab Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveSubTab('kehadiran')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'kehadiran'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Rekap Kehadiran Peserta</span>
        </button>

        <button
          onClick={() => setActiveSubTab('laporan')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'laporan'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Laporan Nilai & Statistik</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bap')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'bap'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Berita Acara Pelaksanaan (BAP)</span>
        </button>
      </div>

      {/* REKAP KEHADIRAN */}
      {activeSubTab === 'kehadiran' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Rekapitulasi Kehadiran Peserta Ujian Nasional
              </h2>
              <p className="text-xs text-slate-500">
                Tingkat partisipasi kehadiran siswa SD pada pelaksanaan simulasi dan asesmen
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Rekap Presensi</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Terdaftar</span>
              <span className="text-xl font-bold text-slate-900 mt-0.5">{students.length} Siswa</span>
            </div>
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[10px] text-emerald-600 uppercase block font-semibold">Hadir Mengerjakan</span>
              <span className="text-xl font-bold text-emerald-800 mt-0.5">{students.length} Siswa (100%)</span>
            </div>
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-[10px] text-amber-600 uppercase block font-semibold">Peserta Cadangan</span>
              <span className="text-xl font-bold text-amber-800 mt-0.5">0 Siswa</span>
            </div>
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-[10px] text-red-600 uppercase block font-semibold">Tidak Hadir (Gugur)</span>
              <span className="text-xl font-bold text-red-800 mt-0.5">0 Siswa</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Satuan Pendidikan</th>
                  <th className="py-2.5 px-3">NPSN</th>
                  <th className="py-2.5 px-3">Terdaftar</th>
                  <th className="py-2.5 px-3">Hadir</th>
                  <th className="py-2.5 px-3">Persentase</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools.map((sch) => {
                  const sCount = tenantStore.getStudents(sch.id).length;
                  return (
                    <tr key={sch.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-bold text-slate-800">{sch.name}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{sch.npsn}</td>
                      <td className="py-3 px-3 font-semibold text-slate-700">{sCount}</td>
                      <td className="py-3 px-3 font-semibold text-emerald-700">{sCount}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">100%</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Lengkap
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

      {/* LAPORAN NILAI */}
      {activeSubTab === 'laporan' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Laporan Capaian Kompetensi & Nilai Ujian SD
            </h2>
            <p className="text-xs text-slate-500">
              Analisis rata-rata nilai literasi dan numerasi per sekolah dasar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="font-bold text-slate-800 text-sm">Distribusi Nilai Asesmen Sumatif (ASAJ)</div>
              <div className="space-y-2 pt-1">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Sangat Mahir (85 - 100)</span>
                    <span className="font-bold">65%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[65%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Cakap & Terampil (70 - 84)</span>
                    <span className="font-bold">30%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[30%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Perlu Bimbingan (&lt; 70)</span>
                    <span className="font-bold">5%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[5%]"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
              <div className="font-bold text-blue-900 text-sm">Ketercapaian Standar Ketuntasan Minimal (KKM)</div>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                Rata-rata ketuntasan nasional pada simulasi kali ini mencapai <strong>92.4%</strong>. Kesiapan siswa dalam menghadapi ujian berbasis komputer sangat memuaskan.
              </p>
              <button
                onClick={() => alert('Mengunduh Laporan Nilai Lengkap (Format Excel/CSV)')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Laporan Nilai Excel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BERITA ACARA UJIAN (BAP) */}
      {activeSubTab === 'bap' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Berita Acara Pelaksanaan Ujian (BAP)
              </h2>
              <p className="text-xs text-slate-500">
                Dokumen yuridis formal pertanggungjawaban pelaksanaan ujian di setiap ruang tes
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Berita Acara</span>
            </button>
          </div>

          <div className="border border-slate-300 rounded-xl p-5 space-y-4 text-xs text-slate-800 max-w-2xl mx-auto bg-slate-50/40">
            <div className="text-center pb-3 border-b-2 border-slate-800 space-y-1">
              <div className="font-bold text-[11px] uppercase tracking-wider text-slate-500">
                KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH
              </div>
              <div className="font-black text-sm uppercase text-slate-900">
                BERITA ACARA PELAKSANAAN TES KEMAMPUAN AKADEMIK (TKA) TAHUN 2026
              </div>
            </div>

            <p className="leading-relaxed text-justify">
              Pada hari ini, <strong>Selasa tanggal 24 bulan Februari tahun 2026</strong>, telah dilaksanakan Ujian Digital TKA bertempat di Laboratorium Komputer Satuan Pendidikan penyelenggara, dengan rincian sebagai berikut:
            </p>

            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
              <div>Nama Sekolah: <strong>SDN 01 Menteng Jakarta</strong> (NPSN: 20101001)</div>
              <div>Kode Tes: <span className="font-mono font-bold">SIMTKAP26H2</span></div>
              <div>Jumlah Peserta Seharusnya: <strong>30 Orang</strong></div>
              <div>Jumlah Peserta Hadir: <strong>30 Orang</strong></div>
              <div>Catatan Khusus Ruang: <em>Pelaksanaan berjalan tertib, listrik dan koneksi stabil. Tidak ada kecurangan.</em></div>
            </div>

            <div className="grid grid-cols-2 pt-4 text-center">
              <div className="space-y-12">
                <div>Pengawas Ruang Ujian</div>
                <div className="font-bold underline">Ibu Ratna Dewi, S.Pd</div>
              </div>
              <div className="space-y-12">
                <div>Penanggung Jawab / Kepala Sekolah</div>
                <div className="font-bold underline">Dr. H. Bambang Sujatmiko, M.Pd.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
