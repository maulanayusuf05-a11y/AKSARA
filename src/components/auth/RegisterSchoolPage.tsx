import React, { useState } from 'react';
import { useAuth, RegisterSchoolData } from '../../contexts/AuthContext';
import {
  Building2,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface RegisterSchoolPageProps {
  onBackToLogin: () => void;
  onOpenSqlModal: () => void;
}

export const RegisterSchoolPage: React.FC<RegisterSchoolPageProps> = ({ onBackToLogin, onOpenSqlModal }) => {
  const { registerSchool } = useAuth();

  const [formData, setFormData] = useState<RegisterSchoolData>({
    school_name: '',
    npsn: '',
    education_level: 'SD',
    school_type: 'negeri',
    address: '',
    province: 'DKI Jakarta',
    city_regency: 'Kota Jakarta Selatan',
    district: 'Kebayoran Baru',
    principal_name: '',
    admin_name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validasi form
    if (!formData.school_name.trim()) {
      setErrorMessage('Nama sekolah wajib diisi.');
      return;
    }

    if (!/^\d{8}$/.test(formData.npsn.trim())) {
      setErrorMessage('NPSN harus berupa 8 digit angka sesuai pangkalan data Dapodik Kemdikbud.');
      return;
    }

    if (!formData.principal_name.trim()) {
      setErrorMessage('Nama Kepala Sekolah wajib diisi.');
      return;
    }

    if (!formData.admin_name.trim()) {
      setErrorMessage('Nama Admin Sekolah pengelola wajib diisi.');
      return;
    }

    if (!formData.email.includes('@')) {
      setErrorMessage('Alamat email tidak valid.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    if (formData.password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    const result = await registerSchool(formData);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Terjadi kesalahan saat mendaftarkan sekolah.');
    } else {
      setSuccessMessage('Pendaftaran sekolah berhasil! Ruang kerja telah siap dan Anda otomatis dialihkan ke Dashboard Admin Sekolah.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-3xl w-full">
        {/* Header Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBackToLogin}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Masuk</span>
          </button>

          <button
            onClick={onOpenSqlModal}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Lihat Skrip Tabel Database (SQL)
          </button>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
          {/* Card Banner */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-white/10 backdrop-blur-xs rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Pendaftaran Sekolah Baru (SD / MI)</h1>
                <p className="text-xs text-blue-100">
                  Sistem Registrasi Otomatis & Terisolasi Multi-Tenant EduUjian SD
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>
                Aktivasi Instan: Ruang kerja sekolah, struktur kelas (1 s/d 6), dan akun Admin dibuat secara otomatis tanpa menunggu persetujuan manual.
              </span>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            {errorMessage && (
              <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Gagal Mendaftarkan Sekolah:</strong>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Selamat!</strong>
                  <span>{successMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* BAGIAN 1: IDENTITAS SEKOLAH */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    1. Identitas Satuan Pendidikan
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Resmi Sekolah Dasar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="school_name"
                      required
                      placeholder="Contoh: SDN Menteng 01 Pagi"
                      value={formData.school_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      NPSN (Nomor Pokok Sekolah Nasional) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="npsn"
                      required
                      maxLength={8}
                      placeholder="8 digit angka (contoh: 20101001)"
                      value={formData.npsn}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Wajib unik per sekolah di Indonesia
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Jenjang
                      </label>
                      <select
                        name="education_level"
                        value={formData.education_level}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="SD">SD (Sekolah Dasar)</option>
                        <option value="MI">MI (Madrasah Ibtidaiyah)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Status
                      </label>
                      <select
                        name="school_type"
                        value={formData.school_type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="negeri">Negeri</option>
                        <option value="swasta">Swasta</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Kepala Sekolah <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="principal_name"
                      required
                      placeholder="Lengkap dengan gelar (contoh: Hj. Nuraini, M.Pd.)"
                      value={formData.principal_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* BAGIAN 2: ALAMAT DAN LOKASI */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    2. Lokasi & Alamat Sekolah
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alamat Jalan & RT/RW <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      name="address"
                      required
                      placeholder="Jl. Merdeka No. 10, RT 02 / RW 05"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Provinsi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="province"
                      required
                      placeholder="DKI Jakarta"
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kabupaten / Kota <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city_regency"
                      required
                      placeholder="Kota Jakarta Pusat"
                      value={formData.city_regency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kecamatan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="district"
                      required
                      placeholder="Menteng"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* BAGIAN 3: AKUN ADMIN SEKOLAH */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    3. Akun Admin Sekolah (Otomatis Mendapat Peran Admin Sekolah)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Lengkap Admin / Operator <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="admin_name"
                        required
                        placeholder="Nama penanggung jawab ujian"
                        value={formData.admin_name}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="0812xxxxxxxx"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alamat Email Resmi Sekolah <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="admin.sdn@kemdikbud.id"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Digunakan untuk login dan verifikasi akun
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kata Sandi <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        name="password"
                        required
                        placeholder="Minimal 6 karakter"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        placeholder="Ulangi kata sandi di atas"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Persetujuan */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" required className="mt-0.5 rounded text-blue-600 focus:ring-blue-500" />
                  <span>
                    Saya menyatakan data pendaftaran sekolah ini adalah benar dan sah. Saya bersedia mengelola akun ujian digital ini sesuai peraturan evaluasi pendidikan jenjang Sekolah Dasar.
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition text-center"
                >
                  Sudah punya akun? Masuk di sini
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    'Memproses Registrasi...'
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Daftarkan Sekolah & Aktifkan Ruang Kerja</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
