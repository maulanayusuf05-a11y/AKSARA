import React, { useState } from 'react';
import { tenantStore } from '../../../lib/supabase';
import {
  WifiOff,
  Wifi,
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  Server,
  Usb,
  Send,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';

interface SchoolBlankSpotViewProps {
  schoolId: string;
  subTab?: string;
}

export const SchoolBlankSpotView: React.FC<SchoolBlankSpotViewProps> = ({
  schoolId,
  subTab = 'status',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(subTab);
  const school = tenantStore.getSchoolById(schoolId) || tenantStore.getSchools()[0];

  // Submission State
  const [reason, setReason] = useState('Koneksi internet sering tidak stabil saat cuaca hujan');
  const [submitted, setSubmitted] = useState(false);
  const [bandwidth, setBandwidth] = useState('10 Mbps');

  const handleSubmitSemiDaring = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
              <WifiOff className="w-5 h-5 text-blue-400" />
              <span>Sekolah Blank Spot • {school?.name}</span>
            </h1>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Pengelolaan moda ujian semi-daring (offline server lokal), pengajuan dispensasi jaringan, dan download VHD sinkronisasi USB khusus untuk <strong>{school?.name}</strong>.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Moda Mandiri</span>
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
          <Wifi className="w-3.5 h-3.5" />
          <span>Status Jaringan Moda Offline</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pengajuan')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'pengajuan'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Pengajuan Semi Daring</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sync')}
          className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubTab === 'sync'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Usb className="w-3.5 h-3.5" />
          <span>Sync USB / VHD</span>
        </button>
      </div>

      {/* 1. SUBTAB: STATUS JARINGAN */}
      {activeSubTab === 'status' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-600" />
              Status Infrastruktur Jaringan di {school?.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Status diagnostik koneksi internet dan kesiapan moda pelaksanaan tes di sekolah ini
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="font-bold text-emerald-800 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Moda Pelaksanaan</span>
              </div>
              <div className="text-lg font-black text-slate-900">Semi-Daring Siap</div>
              <p className="text-slate-600">
                Server proktor lokal siap menerima sinkronisasi VHD jika koneksi internet pusat offline.
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
              <div className="font-bold text-blue-800 text-sm flex items-center gap-2">
                <Wifi className="w-4 h-4 text-blue-600" />
                <span>Konektivitas ISP</span>
              </div>
              <div className="text-lg font-black text-slate-900">Fiber Optik (100 Mbps)</div>
              <p className="text-slate-600">
                Latensi rata-rata ke Pusmendik: <strong>12 ms</strong> (Kategori Sangat Baik).
              </p>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
              <div className="font-bold text-indigo-800 text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-600" />
                <span>Virtual Hard Disk (VHD)</span>
              </div>
              <div className="text-lg font-black text-slate-900">Versi 26.02.1</div>
              <p className="text-slate-600">
                Image VirtualBox proktor tervalidasi siap pakai untuk simulasi & ujian utama.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUBTAB: PENGAJUAN SEMI DARING */}
      {activeSubTab === 'pengajuan' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              Formulir Permohonan Moda Semi-Daring ({school?.name})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ajukan permohonan ke Super Admin Pusat jika infrastruktur internet di wilayah sekolah mengalami kendala
            </p>
          </div>

          {submitted ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-2">
              <div className="font-bold text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Pengajuan Semi-Daring Berhasil Terkirim ke Super Admin Pusat</span>
              </div>
              <p>
                Nomor Pengajuan: <strong className="font-mono">REQ-SD-{school?.npsn}-2026</strong>. Tim teknis Super Admin Pusat sedang meninjau dokumen permohonan sekolah Anda.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitSemiDaring} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Satuan Pendidikan Pemohon</label>
                <input
                  type="text"
                  disabled
                  value={`${school?.name} (NPSN: ${school?.npsn})`}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kondisi Bandwidth / Provider Internet Saat Ini</label>
                <input
                  type="text"
                  value={bandwidth}
                  onChange={(e) => setBandwidth(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Alasan Pengajuan Moda Semi-Daring</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Permohonan ke Super Admin Pusat</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 3. SUBTAB: SYNC USB / VHD */}
      {activeSubTab === 'sync' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Usb className="w-4 h-4 text-blue-600" />
              Paket Sinkronisasi Offline VHD ({school?.name})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unduh berkas sinkronisasi data peserta didik dan paket soal terenkripsi untuk server proktor lokal
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">File Sinkronisasi Data Peserta ({school?.name})</div>
                <div className="text-slate-500 text-[11px]">Format: .json.enc • Terenkripsi AES-256 Resmi Pusmendik</div>
              </div>
              <button
                onClick={() => alert(`Mengunduh Berkas Sinkronisasi Peserta ${school?.name}...`)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File Sync</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Virtual Hard Disk (VHD) Fresh 2026</div>
                <div className="text-slate-500 text-[11px]">Ukuran: 28.4 GB (Split Part 1 s/d 5) • Siap VirtualBox 7.x</div>
              </div>
              <button
                onClick={() => alert('Menautkan ke mirror server unduhan resmi Pusmendik Kemendikdasmen...')}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download VHD</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
