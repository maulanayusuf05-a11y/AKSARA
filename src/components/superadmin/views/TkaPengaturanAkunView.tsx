import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { tenantStore } from '../../../lib/supabase';
import {
  User,
  KeyRound,
  Shield,
  Users,
  CheckCircle,
  Save,
  Lock,
} from 'lucide-react';

export const TkaPengaturanAkunView: React.FC = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || 'Administrator Pusat Pusmendik');
  const [email] = useState(user?.email || 'admin@kemdikbud.edujian.id');
  const [phone, setPhone] = useState(user?.phone || '081299990001');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Konfirmasi password baru tidak cocok!');
      return;
    }
    setPasswordSuccess(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          Pengaturan Akun & Keamanan Akses Super Admin
        </h2>
        <p className="text-xs text-slate-500">
          Kelola profil identitas administrator Pusat Asesmen Pendidikan dan konfigurasi kata sandi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Form Profil */}
        <form
          onSubmit={handleUpdateProfile}
          className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3"
        >
          <div className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-blue-600" />
            <span>Profil Pengguna Super Admin</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Resmi Kedinasan</label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Peran Akses (Role)</label>
            <div className="px-3 py-2 bg-purple-50 text-purple-700 font-bold rounded-lg border border-purple-200">
              Super Admin Pengendali Utama (Kemendikdasmen)
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Perubahan Profil</span>
          </button>

          {isSaved && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Profil berhasil disimpan!</span>
            </div>
          )}
        </form>

        {/* Form Ganti Password */}
        <form
          onSubmit={handleChangePassword}
          className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3"
        >
          <div className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <Lock className="w-4 h-4 text-purple-600" />
            <span>Perbarui Kata Sandi (Password)</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Saat Ini</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Baru</label>
            <input
              type="password"
              required
              placeholder="Minimal 8 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru</label>
            <input
              type="password"
              required
              placeholder="Ketik ulang kata sandi baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Perbarui Password</span>
          </button>

          {passwordSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Kata sandi berhasil diperbarui dengan aman.</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
