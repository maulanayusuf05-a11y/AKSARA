import React, { useState } from 'react';
import { isSupabaseConfigured, getSupabaseConfig, saveCustomSupabaseConfig } from '../../lib/supabase';
import { Database, CheckCircle2, AlertTriangle, Settings, FileCode, Check, RefreshCw } from 'lucide-react';

interface ConnectionBannerProps {
  onOpenSqlModal: () => void;
}

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({ onOpenSqlModal }) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const config = getSupabaseConfig();
  const [url, setUrl] = useState(config.url);
  const [anonKey, setAnonKey] = useState(config.anonKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomSupabaseConfig(url, anonKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowConfigModal(false);
      window.location.reload();
    }, 1200);
  };

  return (
    <>
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isSupabaseConfigured ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Supabase Terhubung ({config.url.replace('https://', '').split('.')[0]})</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Mode Multi-Tenant Lokal Aktif (Data Tersimpan di Local Database & Siap Sinkron Supabase)</span>
            </span>
          )}
          <span className="hidden md:inline-block text-slate-500">|</span>
          <span className="hidden md:inline-block text-slate-400">
            Isolasi Data Per Sekolah Terverifikasi (school_id)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSqlModal}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded border border-slate-700 font-medium transition"
            title="Lihat Skrip SQL Supabase untuk dieksekusi di database"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span>Lihat Skema SQL (21 Tabel)</span>
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 font-medium transition"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Koneksi Supabase</span>
          </button>
        </div>
      </div>

      {/* Modal Konfigurasi Supabase */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfigurasi Koneksi Supabase</h3>
                <p className="text-xs text-slate-500">
                  Masukkan Supabase Project URL dan Anon Key untuk menghubungkan langsung ke PostgreSQL Anda.
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Dapat juga diatur via file <code className="bg-slate-100 px-1 py-0.5 rounded">.env</code> (VITE_SUPABASE_URL).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supabase Anon Public API Key
                </label>
                <textarea
                  rows={3}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <span className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded mt-1 block">
                  Catatan Keamanan: Jangan gunakan Service Role Key di frontend. Gunakan Anon (Public) Key dengan Row Level Security (RLS).
                </span>
              </div>

              {savedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Konfigurasi berhasil disimpan! Memuat ulang sistem...
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Simpan & Hubungkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
