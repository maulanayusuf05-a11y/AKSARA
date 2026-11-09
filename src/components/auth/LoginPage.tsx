import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onGoToRegister: () => void;
  onOpenForgotPassword: () => void;
  onOpenSqlModal: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onGoToRegister,
  onOpenForgotPassword,
  onOpenSqlModal,
}) => {
  const { login } = useAuth();

  // Unified Single Input for all roles (Super Admin, Admin Sekolah, Proktor, Siswa)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form submit: role will be automatically identified by the backend/auth engine
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Silakan masukkan ID Pengguna, Username, Email, atau NISN Anda.');
      return;
    }
    if (!password) {
      setErrorMessage('Silakan masukkan password akun Anda.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    const res = await login(identifier, password);
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'ID Pengguna atau password tidak sesuai. Periksa kembali data login Anda.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fcfdfe] relative overflow-hidden flex flex-col justify-between select-none">
      {/* =========================================================================
          BACKGROUND GRAPHICS:
          1. Overlapping Angled Rounded Rectangles on Bottom-Left
          2. Delicate Constellation Geometric Mesh on Bottom-Center & Right
         ========================================================================= */}

      {/* Decorative Bottom-Left Overlapping Rounded Rectangles */}
      <div className="absolute -bottom-24 -left-20 pointer-events-none z-0">
        <div className="w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] bg-[#7bc0f7] rounded-[3.5rem] -rotate-[24deg] transform translate-y-10 -translate-x-8 shadow-sm"></div>
      </div>
      <div className="absolute -bottom-28 -left-24 pointer-events-none z-0">
        <div className="w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] bg-[#1976d2] rounded-[3rem] -rotate-[24deg] transform translate-y-16 -translate-x-4 shadow-md"></div>
      </div>
      <div className="absolute -bottom-32 -left-28 pointer-events-none z-0">
        <div className="w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] bg-[#0d47a1] rounded-[2.5rem] -rotate-[24deg] transform translate-y-24 translate-x-2 shadow-lg"></div>
      </div>

      {/* Constellation Geometric Mesh (Connecting Nodes and Delicate Lines) */}
      <div className="absolute inset-x-0 bottom-0 h-64 sm:h-80 pointer-events-none z-0 opacity-40 overflow-hidden">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          <g stroke="#93c5fd" strokeWidth="1" strokeDasharray="2,3" opacity="0.6">
            <line x1="260" y1="360" x2="380" y2="300" />
            <line x1="380" y1="300" x2="520" y2="330" />
            <line x1="520" y1="330" x2="640" y2="280" />
            <line x1="640" y1="280" x2="760" y2="320" />
            <line x1="760" y1="320" x2="900" y2="260" />
            <line x1="900" y1="260" x2="1050" y2="310" />
            <line x1="1050" y1="310" x2="1180" y2="270" />

            <line x1="380" y1="300" x2="480" y2="250" />
            <line x1="480" y1="250" x2="640" y2="280" />
            <line x1="520" y1="330" x2="600" y2="370" />
            <line x1="600" y1="370" x2="760" y2="320" />
            <line x1="640" y1="280" x2="740" y2="220" />
            <line x1="740" y1="220" x2="900" y2="260" />
            <line x1="760" y1="320" x2="880" y2="360" />
            <line x1="880" y1="360" x2="1050" y2="310" />
            <line x1="900" y1="260" x2="1020" y2="210" />
            <line x1="1020" y1="210" x2="1180" y2="270" />

            <line x1="480" y1="250" x2="600" y2="370" opacity="0.3" />
            <line x1="740" y1="220" x2="880" y2="360" opacity="0.3" />
            <line x1="900" y1="260" x2="1150" y2="370" opacity="0.3" />
          </g>

          <g fill="#60a5fa">
            <circle cx="260" cy="360" r="3.5" />
            <circle cx="380" cy="300" r="4" />
            <circle cx="480" cy="250" r="3" />
            <circle cx="520" cy="330" r="3.5" />
            <circle cx="600" cy="370" r="3" />
            <circle cx="640" cy="280" r="4.5" />
            <circle cx="740" cy="220" r="3.5" />
            <circle cx="760" cy="320" r="4" />
            <circle cx="880" cy="360" r="3" />
            <circle cx="900" cy="260" r="4.5" />
            <circle cx="1020" cy="210" r="3.5" />
            <circle cx="1050" cy="310" r="4" />
            <circle cx="1180" cy="270" r="3.5" />
          </g>
        </svg>
      </div>



      {/* =========================================================================
          MAIN LOGIN VIEWPORT (Exact Composition, Production Clean)
         ========================================================================= */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 sm:px-12 flex flex-col lg:flex-row items-center justify-between gap-12 py-8 my-auto">
        
        {/* LEFT COLUMN: Logo Tut Wuri Handayani + AKSARA */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
          
          {/* Logo Tut Wuri Handayani + Brand Text: AKSARA */}
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-full bg-[#0288d1] flex items-center justify-center p-1.5 shadow-sm shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="none">
                <circle cx="50" cy="50" r="46" stroke="white" strokeWidth="4" />
                <path
                  d="M50 18 L55 34 L75 30 L62 45 L78 60 L58 58 L50 82 L42 58 L22 60 L38 45 L25 30 L45 34 Z"
                  fill="white"
                />
                <circle cx="50" cy="46" r="7" fill="#fbbf24" />
                <path d="M48 30 Q50 20 52 30 Z" fill="#ef4444" />
              </svg>
            </div>

            <div className="flex flex-col text-left">
              <span className="text-3xl font-black tracking-tight text-slate-900 leading-none">
                AKSARA
              </span>
              <span className="text-[11px] font-semibold text-slate-600 mt-1 tracking-tight">
                Asesmen dan Kompetensi Siswa Terarah
              </span>
            </div>
          </div>

          {/* Welcome Heading (Clean, matching reference screenshot) */}
          <div className="pt-3">
            <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-slate-900 leading-[1.2] tracking-tight">
              Selamat Datang Di
            </h1>
            <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-slate-900 leading-[1.2] tracking-tight">
              CBT AKSARA
            </h2>
            <p className="text-xs text-slate-500 mt-2.5 max-w-sm leading-relaxed">
              Sistem Ujian Digital Sekolah Dasar terpadu dengan autentikasi tunggal multi-peran dan isolasi data per satuan pendidikan.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: The Floating White Sign In Card (Production Ready) */}
        <div className="w-full lg:w-[410px] max-w-md">
          <div className="bg-white rounded-3xl shadow-[0_15px_45px_rgba(0,0,0,0.08)] border border-slate-100/90 p-8 sm:p-9">
            
            {/* Card Header: Sign In & Subtitle */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                Sign In
              </h2>
              <p className="text-xs text-slate-400 mt-1.5">
                Masukan ID Pengguna & password anda!
              </p>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Unified Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* FIELD 1: ID Pengguna / Username / NISN / Email */}
              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1.5">
                  ID Pengguna
                </label>
                <input
                  type="text"
                  required
                  placeholder="ID Proktor / Email / NISN"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0288d1] focus:ring-1 focus:ring-[#0288d1] transition tracking-wide placeholder:text-slate-300 font-mono"
                  autoComplete="username"
                />
              </div>

              {/* FIELD 2: Password with Eye Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-normal text-slate-600">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={onOpenForgotPassword}
                    className="text-[11px] text-[#0288d1] hover:underline"
                  >
                    Lupa password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0288d1] focus:ring-1 focus:ring-[#0288d1] transition tracking-wide placeholder:text-slate-300"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                    tabIndex={-1}
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* SIGN-IN BUTTON */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-[#029be5] hover:bg-[#0288d1] active:bg-[#01579b] text-white text-sm font-semibold rounded-lg shadow-sm transition duration-150 ease-in-out disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Memverifikasi Akses...' : 'Sign-In'}
              </button>
            </form>

            {/* Registration Link */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-500">
                Sekolah belum terdaftar?{' '}
              </span>
              <button
                type="button"
                onClick={onGoToRegister}
                className="text-[11px] text-[#0288d1] font-semibold hover:underline"
              >
                Daftar Sekolah Baru
              </button>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
};
