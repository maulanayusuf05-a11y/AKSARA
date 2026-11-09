import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatusMessage({ text: 'Mohon masukkan alamat email yang terdaftar.', isError: true });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    const res = await resetPassword(email);
    setIsSubmitting(false);

    if (res.success) {
      setStatusMessage({ text: res.message, isError: false });
    } else {
      setStatusMessage({ text: res.message, isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pemulihan Kata Sandi</h3>
              <p className="text-xs text-slate-500">Masukkan email akun Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs mb-4 flex items-start gap-2.5 ${
              statusMessage.isError
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Email Terdaftar
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="nama.admin@sekolah.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Petunjuk reset kata sandi akan diverifikasi dan dikirim ke alamat email ini.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition disabled:opacity-50"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Tautan Reset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
