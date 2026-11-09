import React, { useState } from 'react';
import { tenantStore } from '../../../lib/supabase';
import { School } from '../../../types/database';
import {
  WifiOff,
  Radio,
  HardDrive,
  Download,
  CheckCircle,
  Clock,
  Send,
  FileCheck2,
  Signal,
  AlertTriangle,
} from 'lucide-react';

interface TkaBlankSpotViewProps {
  subTab?: string;
}

export const TkaBlankSpotView: React.FC<TkaBlankSpotViewProps> = ({
  subTab = 'status',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(subTab);
  const [schools] = useState<School[]>(tenantStore.getSchools());
  const [syncProgress, setSyncProgress] = useState<number | null>(null);

  const handleGenerateVhdSync = () => {
    setSyncProgress(10);
    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev !== null && prev >= 100) {
          clearInterval(interval);
          alert('Paket VHD Sinkronisasi Offline (AES-256) berhasil dibuat! Siap ditransfer menggunakan media flashdisk / external drive ke komputer proktor.');
          return 100;
        }
        return (prev || 0) + 25;
      });
    }, 400);
  };

  return (
    <div className="space-y-4">
      {/* Subtab Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveSubTab('status')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'status'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Signal className="w-4 h-4" />
          <span>Status Jaringan Moda Offline</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pengajuan')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'pengajuan'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <WifiOff className="w-4 h-4" />
          <span>Pengajuan Semi Daring</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sync')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'sync'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Sync USB / VHD Package</span>
        </button>
      </div>

      {/* CONTENT: Status Jaringan */}
      {activeSubTab === 'status' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Signal className="w-4 h-4 text-blue-600" />
              Pemetaan Konektivitas Sekolah & Moda Ujian (Daring vs Semi-Daring)
            </h2>
            <p className="text-xs text-slate-500">
              Pengawasan kesiapan jaringan internet dan penempatan moda semi-daring untuk daerah blank spot 3T
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <div className="font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Moda Daring Penuh (Full Online)</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Komputer klien langsung mengakses server pusat melalui internet stabil (minimal 20 Mbps per 20 klien). Menggunakan Proktor Browser.
              </p>
              <div className="text-[11px] font-semibold text-emerald-900 pt-1">
                SD Terdaftar: 2 Sekolah (100%)
              </div>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="font-bold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Moda Semi Daring (VHD Virtual Machine)</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Soal diunduh terlebih dahulu ke PC Proktor melalui sinkronisasi VHD. Komputer siswa terkoneksi via jaringan kabel LAN lokal tanpa butuh internet saat tes berlangsung.
              </p>
              <div className="text-[11px] font-semibold text-amber-900 pt-1">
                SD Terdaftar: Siaga & Didukung
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT: Pengajuan Semi Daring */}
      {activeSubTab === 'pengajuan' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-blue-600" />
              Verifikasi Pengajuan Moda Semi Daring Sekolah
            </h2>
            <p className="text-xs text-slate-500">
              Persetujuan penggunaan server lokal bagi sekolah dengan kendala infrastruktur ISP atau topografi blank spot
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
            <div className="font-semibold text-slate-800">Daftar Usulan Sekolah:</div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">SD Swasta Islam Terpadu Cendekia</div>
                <div className="text-[11px] text-slate-500">Alasan: Cadangan mitigasi jika koneksi ISP fiber optic lab mengalami latensi tinggi.</div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                Disetujui
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT: Sync USB / VHD */}
      {activeSubTab === 'sync' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-600" />
              Paket Sinkronisasi VHD & Media USB Offline
            </h2>
            <p className="text-xs text-slate-500">
              Buat dan ekspor paket soal terenkripsi untuk sekolah yang berada pada wilayah tanpa internet stabil
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="font-bold text-slate-800 text-sm">Pembuatan Paket Soal Terenkripsi (AES-256)</div>
            <p className="text-slate-600 text-[11px]">
              Paket ini berisi seluruh butir soal, gambar stimulus literasi/numerasi, dan basis data peserta yang telah ditandatangani secara digital oleh Pusmendik.
            </p>

            <button
              onClick={handleGenerateVhdSync}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>Generate Paket Sinkronisasi Offline</span>
            </button>

            {syncProgress !== null && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] text-slate-600 font-mono">
                  <span>Proses Kompresi & Enkripsi:</span>
                  <span>{syncProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${syncProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
