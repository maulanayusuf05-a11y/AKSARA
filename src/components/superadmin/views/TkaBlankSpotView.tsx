import React, { useState } from 'react';
import { tenantStore } from '../../../lib/supabase';
import { tkaStore } from '../../../lib/tkaStore';
import { School } from '../../../types/database';
import { BlankSpotRequest } from '../../../types/tka';
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
  Check,
  X,
  Building2,
  ShieldAlert,
} from 'lucide-react';

interface TkaBlankSpotViewProps {
  subTab?: string;
}

export const TkaBlankSpotView: React.FC<TkaBlankSpotViewProps> = ({
  subTab = 'status',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(subTab);
  const [schools] = useState<School[]>(() => tenantStore.getSchools());
  const [requests, setRequests] = useState<BlankSpotRequest[]>(() => tkaStore.getBlankSpotRequests());
  const [syncProgress, setSyncProgress] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const handleApprove = (req: BlankSpotRequest) => {
    tkaStore.updateBlankSpotRequest(req.id, 'approved');
    setRequests(tkaStore.getBlankSpotRequests());
    setNotification(`Permohonan moda semi-daring untuk ${req.school_name} (NPSN: ${req.npsn}) disetujui! Sekolah dapat mengunduh paket sinkronisasi VHD.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleReject = (req: BlankSpotRequest) => {
    const reason = prompt('Masukkan alasan penolakan permohonan semi-daring:', 'Koneksi internet di wilayah sekolah terdeteksi memenuhi batas minimum 10 Mbps.');
    if (reason) {
      tkaStore.updateBlankSpotRequest(req.id, 'rejected', reason);
      setRequests(tkaStore.getBlankSpotRequests());
      setNotification(`Permohonan semi-daring untuk ${req.school_name} ditolak.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleGenerateVhdSync = () => {
    setSyncProgress(10);
    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev !== null && prev >= 100) {
          clearInterval(interval);
          setNotification('Paket VHD Sinkronisasi Offline (AES-256) berhasil digenerate! Siap didistribusikan ke server sekolah.');
          setTimeout(() => setNotification(null), 4000);
          return 100;
        }
        return (prev || 0) + 25;
      });
    }, 350);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pengawasan Sekolah Blank Spot & Moda Semi-Daring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Kewenangan Superadmin Pusat untuk memverifikasi permohonan moda semi-daring (offline/VHD) dari sekolah di wilayah 3T dan kendala jaringan.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

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
          <span>Status Jaringan & Wilayah 3T</span>
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
          <span>Verifikasi Pengajuan Semi Daring</span>
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
              {pendingRequests.length}
            </span>
          )}
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
          <span>Distribusi Paket VHD / USB Offline</span>
        </button>
      </div>

      {/* CONTENT: Status Jaringan */}
      {activeSubTab === 'status' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Signal className="w-4 h-4 text-blue-600" />
              Pemetaan Konektivitas Sekolah Nasional (Daring vs Semi-Daring)
            </h2>
            <p className="text-xs text-slate-500">
              Pengawasan kesiapan jaringan internet dan penempatan moda semi-daring untuk daerah blank spot 3T di seluruh Indonesia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <div className="font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Moda Daring Penuh (Full Online)</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Komputer klien langsung mengakses server pusat melalui internet stabil (minimal 20 Mbps per 20 klien). Menggunakan Proktor Browser dengan enkripsi TLS 1.3.
              </p>
              <div className="text-[11px] font-semibold text-emerald-900 pt-1">
                Kondisi Sekolah: Mayoritas Perkotaan & Pusat Wilayah
              </div>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="font-bold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Moda Semi Daring (VHD Virtual Machine)</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Soal diunduh terlebih dahulu ke PC Proktor sekolah melalui sinkronisasi VHD. Komputer siswa terkoneksi via jaringan kabel LAN lokal tanpa butuh internet saat tes berlangsung.
              </p>
              <div className="text-[11px] font-semibold text-amber-900 pt-1">
                Kondisi Sekolah: Wilayah 3T & Kendala ISP Terverifikasi
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT: Verifikasi Pengajuan Semi Daring */}
      {activeSubTab === 'pengajuan' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-blue-600" />
                Daftar Pengajuan Moda Semi-Daring dari Sekolah
              </h2>
              <p className="text-xs text-slate-500">
                Tinjau alasan kendala infrastruktur dari satuan pendidikan sebelum memberikan izin operasional offline
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Belum ada pengajuan moda semi-daring dari sekolah.
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className={`p-4 rounded-xl border transition ${
                    req.status === 'pending'
                      ? 'bg-amber-50/40 border-amber-300'
                      : req.status === 'approved'
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{req.school_name}</span>
                        <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          NPSN: {req.npsn}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            req.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {req.status === 'pending'
                            ? 'Menunggu Persetujuan Pusat'
                            : req.status === 'approved'
                            ? 'Disetujui'
                            : 'Ditolak'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600">
                        <strong>Wilayah:</strong> {req.city_regency}, {req.province} •{' '}
                        <strong>Kecepatan Uji:</strong> {req.internet_speed_mbps} Mbps
                      </div>
                      <div className="text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
                        <strong>Alasan Permohonan:</strong> {req.reason}
                      </div>
                      {req.rejection_reason && (
                        <div className="text-xs text-rose-700">
                          <strong>Catatan Penolakan:</strong> {req.rejection_reason}
                        </div>
                      )}
                    </div>

                    {req.status === 'pending' ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(req)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Setujui Semi-Daring</span>
                        </button>
                        <button
                          onClick={() => handleReject(req)}
                          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 font-medium">
                        Diverifikasi: {req.reviewed_at ? new Date(req.reviewed_at).toLocaleDateString('id-ID') : 'Hari ini'}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CONTENT: Sync USB / VHD */}
      {activeSubTab === 'sync' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-600" />
              Paket Sinkronisasi VHD & Media USB Offline Nasional
            </h2>
            <p className="text-xs text-slate-500">
              Buat dan ekspor paket soal terenkripsi untuk sekolah yang telah disetujui menggunakan moda semi-daring
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="font-bold text-slate-800 text-sm">Pembuatan Paket Soal Terenkripsi (AES-256)</div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Paket ini berisi butir soal terenkripsi, gambar stimulus literasi/numerasi, serta kunci token sementara yang telah ditandatangani secara kriptografis oleh Pusmendik Kemdikbud.
            </p>

            <button
              onClick={handleGenerateVhdSync}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>Generate Paket Sinkronisasi Offline Nasional</span>
            </button>

            {syncProgress !== null && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] text-slate-600 font-mono">
                  <span>Proses Enkripsi & Pembungkusan VHD:</span>
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
