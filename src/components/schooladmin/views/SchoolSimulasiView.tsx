import React, { useState } from 'react';
import { tenantStore } from '../../../lib/supabase';
import {
  RefreshCw,
  MonitorCheck,
  Calendar,
  Clock,
  Play,
  CheckCircle,
  ShieldCheck,
  ExternalLink,
  Laptop,
} from 'lucide-react';

interface SchoolSimulasiViewProps {
  schoolId: string;
  subTab?: string;
}

export const SchoolSimulasiView: React.FC<SchoolSimulasiViewProps> = ({
  schoolId,
  subTab = 'proktor',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(subTab);
  const school = tenantStore.getSchoolById(schoolId) || tenantStore.getSchools()[0];
  const proctors = tenantStore.getProctors(schoolId);

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
              <RefreshCw className="w-5 h-5 text-blue-400" />
              <span>Simulasi & Proktor • {school?.name}</span>
            </h1>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Konfigurasi akun komputer proktor, jadwal gladi bersih resmi yang diikuti sekolah ini, dan sarana latihan simulasi mandiri untuk siswa <strong>{school?.name}</strong>.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Kesiapan Lab 100%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Subtab Navigation matching Super Admin 1:1 */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 flex flex-wrap gap-1 shadow-xs">
        <button
          onClick={() => setActiveSubTab('proktor')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'proktor'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MonitorCheck className="w-3.5 h-3.5" />
          <span>Komputer Proktor</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gladi')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'gladi'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Jadwal Gladi Bersih</span>
        </button>

        <button
          onClick={() => setActiveSubTab('siswa')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'siswa'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Simulasi Siswa</span>
        </button>
      </div>

      {/* 1. SUBTAB: KOMPUTER PROKTOR */}
      {activeSubTab === 'proktor' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <MonitorCheck className="w-4 h-4 text-blue-600" />
              Daftar Komputer Proktor ({school?.name})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ID Proktor dan password yang digunakan untuk menjalankan Proctor Browser di ruang lab sekolah ini
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Server Proktor Lab 1</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px] border border-emerald-200">
                  Aktif Online
                </span>
              </div>
              <div className="space-y-1 font-mono text-slate-700">
                <div>ID Proktor: <strong className="text-blue-700">P{school?.npsn}01</strong></div>
                <div>Password: <strong className="text-slate-900">proktor2026</strong></div>
                <div>IP Gateway: <strong>192.168.0.200</strong></div>
              </div>
              <p className="text-slate-500 text-[11px] pt-1">
                Melayani 30 komputer klien siswa rombel kelas 6 di Lab Komputer Utama.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Server Proktor Cadangan</span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px] border border-blue-200">
                  Standby
                </span>
              </div>
              <div className="space-y-1 font-mono text-slate-700">
                <div>ID Proktor: <strong className="text-blue-700">P{school?.npsn}02</strong></div>
                <div>Password: <strong className="text-slate-900">backup2026</strong></div>
                <div>IP Gateway: <strong>192.168.0.201</strong></div>
              </div>
              <p className="text-slate-500 text-[11px] pt-1">
                Server failover otomatis jika server proktor utama mengalami kendala teknis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUBTAB: JADWAL GLADI BERSIH */}
      {activeSubTab === 'gladi' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Jadwal Gladi Bersih Nasional yang Diikuti ({school?.name})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Jadwal resmi gladi bersih yang ditetapkan oleh Super Admin Pusat untuk jenjang SD
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
              <div className="font-bold text-blue-900 text-sm">Gelombang 1: Uji Coba Sinkronisasi & Proktor</div>
              <div className="text-slate-600">Senin s/d Selasa, 23 - 24 Februari 2026 • 07.30 - 12.00 WIB</div>
              <div className="text-emerald-700 font-semibold pt-1">Status: Terlaksana Lancar</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="font-bold text-slate-900 text-sm">Gelombang 2: Gladi Bersih Siswa Lengkap</div>
              <div className="text-slate-600">Rabu s/d Kamis, 25 - 26 Februari 2026 • 07.30 - 12.00 WIB</div>
              <div className="text-blue-700 font-semibold pt-1">Status: Terjadwal</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUBTAB: SIMULASI SISWA */}
      {activeSubTab === 'siswa' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-600" />
              Simulator Uji Coba Lembar Soal Siswa ({school?.name})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sarana latihan mandiri bagi guru pengawas dan siswa di sekolah ini untuk membiasakan antarmuka CBT
            </p>
          </div>

          <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-bold text-blue-950 text-sm">Simulasi Mandiri Lembar Soal AKM Literasi SD</div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                Buka lembar soal latihan dengan format soal pilihan ganda, pilihan ganda kompleks, menjodohkan, dan isian singkat.
              </p>
            </div>
            <button
              onClick={() => alert(`Membuka Lembar Simulasi Latihan Siswa ${school?.name}...`)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Mulai Uji Coba Simulasi</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
