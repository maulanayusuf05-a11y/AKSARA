import React, { useState } from 'react';
import { tkaStore } from '../../../lib/tkaStore';
import { tenantStore } from '../../../lib/supabase';
import { ProctorComputer } from '../../../types/tka';
import {
  Monitor,
  Key,
  Calendar,
  Play,
  CheckCircle,
  Copy,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface TkaSimulasiViewProps {
  subTab?: string;
}

export const TkaSimulasiView: React.FC<TkaSimulasiViewProps> = ({
  subTab = 'proktor',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>(subTab);
  const [proctors, setProctors] = useState<ProctorComputer[]>(tkaStore.getProctorComputers());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New proctor computer modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('SDN 01 Menteng Jakarta');
  const [newRoom, setNewRoom] = useState('Lab Komputer 03');
  const [newIp, setNewIp] = useState('192.168.0.205');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddProctorComputer = (e: React.FormEvent) => {
    e.preventDefault();
    const created = tkaStore.addProctorComputer({
      school_id: 'sdn-01-menteng-uuid-001',
      school_name: newSchoolName,
      proctor_id_code: `P0101001-R${String(proctors.length + 1).padStart(2, '0')}`,
      room_name: newRoom,
      ip_address: newIp,
      password_hash: `Prk#${Math.random().toString(36).substring(2, 6).toUpperCase()}26`,
      client_count: 25,
      status: 'online',
      last_sync: '24-02-2026 07:45:00 WIB',
    });
    setProctors(tkaStore.getProctorComputers());
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Subtab Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveSubTab('proktor')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'proktor'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>Komputer Proktor (ID & Password)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gladi')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'gladi'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Jadwal Gladi Bersih & Simulasi</span>
        </button>

        <button
          onClick={() => setActiveSubTab('siswa')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'siswa'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Simulasi Siswa</span>
        </button>
      </div>

      {/* CONTENT: Komputer Proktor */}
      {activeSubTab === 'proktor' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-600" />
                Daftar Akun & Komputer Proktor (Menu Simulasi)
              </h2>
              <p className="text-xs text-slate-500">
                Sesuai petunjuk Posko: ID Proktor aktif mulai pukul 06.00 WIB untuk membuka Proktor Browser
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Komputer Proktor</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Satuan Pendidikan</th>
                  <th className="py-2.5 px-3">ID Proktor (Akun)</th>
                  <th className="py-2.5 px-3">Password Proktor</th>
                  <th className="py-2.5 px-3">Ruang / Lab</th>
                  <th className="py-2.5 px-3">Status Kesiapan</th>
                  <th className="py-2.5 px-3 text-right">Salin Kredensial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {proctors.map((pc) => (
                  <tr key={pc.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{pc.school_name}</div>
                      <div className="text-[11px] text-slate-500">IP: {pc.ip_address} • {pc.client_count} Klien</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {pc.proctor_id_code}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 select-all">
                        {pc.password_hash}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">{pc.room_name}</td>
                    <td className="py-3 px-3">
                      {pc.status === 'online' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Online & Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Standby (06.00 WIB)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleCopy(`${pc.proctor_id_code} / ${pc.password_hash}`, pc.id)}
                        className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[11px] font-semibold transition inline-flex items-center gap-1"
                      >
                        {copiedId === pc.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === pc.id ? 'Disalin' : 'Salin'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENT: Jadwal Gladi Bersih */}
      {activeSubTab === 'gladi' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Jadwal Resmi Gladi Bersih & Pelaksanaan Asesmen 2026
            </h2>
            <p className="text-xs text-slate-500">
              Tahapan sinkronisasi data, simulasi gladi, dan hari pelaksanaan nasional
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-lg font-bold text-center w-14 shrink-0">
                <span className="block text-[9px] uppercase">Feb</span>
                <span className="text-base font-black">23-24</span>
              </div>
              <div className="flex-1">
                <div className="font-bold text-blue-900 text-sm">Simulasi TKA Hari 1 & 2 (Tahap Sekarang)</div>
                <div className="text-[11px] text-blue-700 mt-0.5">
                  Uji coba proctor browser, rilis token nasional (07.00 - 15.30 WIB), pengerjaan 3 subtes siswa.
                </div>
              </div>
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded font-bold text-[10px]">
                Berlangsung
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-slate-700 text-white rounded-lg font-bold text-center w-14 shrink-0">
                <span className="block text-[9px] uppercase">Mar</span>
                <span className="text-base font-black">08-10</span>
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-800 text-sm">Gladi Bersih Nasional Jenjang SD</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Sinkronisasi final VHD semi daring, pencetakan DNT nominasi tetap dan kartu login resmi.
                </div>
              </div>
              <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-bold text-[10px]">
                Akan Datang
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT: Simulasi Siswa */}
      {activeSubTab === 'siswa' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-600" />
              Simulasi Mandiri Peserta Didik (Latihan Soal CBT)
            </h2>
            <p className="text-xs text-slate-500">
              Kanal latihan bagi siswa untuk mengenal antarmuka soal, ragu-ragu, dan navigasi lembar ujian
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs max-w-lg">
            <div className="font-bold text-slate-800 text-sm">Akses Simulasi Peserta (Ayo Coba AKM / TKA)</div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Siswa dapat mencoba mengerjakan contoh butir soal Literasi Membaca dan Numerasi tanpa mempengaruhi penilaian resmi.
            </p>
            <button
              onClick={() => alert('Membuka antarmuka simulasi latihan siswa TKA Pusmendik.')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Buka Demo Simulasi Siswa</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Add Proctor Computer */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddProctorComputer}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Tambah Komputer Proktor</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Satuan Pendidikan</label>
                <input
                  type="text"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Ruang / Laboratorium</label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">IP Address Server Lokal</label>
                <input
                  type="text"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Simpan & Generate Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
