import React, { useState } from 'react';
import { tkaStore } from '../../../lib/tkaStore';
import { HelpdeskTicket } from '../../../types/tka';
import {
  Ticket,
  Send,
  User,
  ShieldCheck,
} from 'lucide-react';

export const TkaTiketBantuanView: React.FC = () => {
  const [tickets, setTickets] = useState<HelpdeskTicket[]>(tkaStore.getTickets());
  const [selectedTicket, setSelectedTicket] = useState<HelpdeskTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTickets = tickets.filter(
    (t) => statusFilter === 'all' || t.status === statusFilter
  );

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    tkaStore.updateTicket(selectedTicket.id, {
      response: replyText.trim(),
      status: 'resolved',
    });

    const updated = tkaStore.getTickets();
    setTickets(updated);
    setSelectedTicket(updated.find((t) => t.id === selectedTicket.id) || null);
    setReplyText('');
    alert(`Tanggapan berhasil dikirim dan tiket ${selectedTicket.id} ditandai Selesai.`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-blue-600" />
            Layanan Pengaduan & Tiket Bantuan Teknis Proktor
          </h2>
          <p className="text-xs text-slate-500">
            Penanganan terpusat untuk kendala ujian digital, reset sesi peserta, sinkronisasi VHD, dan token dari admin sekolah
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
          >
            <option value="all">Semua Tiket ({tickets.length})</option>
            <option value="open">Menunggu Respon (Open)</option>
            <option value="in_progress">Sedang Diproses</option>
            <option value="resolved">Selesai (Resolved)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Ticket List + Ticket Detail / Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* List of Tickets (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {filteredTickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className={`p-3.5 cursor-pointer transition text-xs space-y-1.5 ${
                selectedTicket?.id === t.id
                  ? 'bg-blue-50/80 border-l-4 border-blue-600'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                  {t.id}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    t.status === 'open'
                      ? 'bg-red-100 text-red-800'
                      : t.status === 'in_progress'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {t.status === 'open' ? 'Menunggu' : t.status === 'in_progress' ? 'Diproses' : 'Selesai'}
                </span>
              </div>

              <div className="font-bold text-slate-800 leading-snug line-clamp-1">{t.subject}</div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span className="truncate max-w-[200px]">{t.school_name}</span>
                <span className="font-mono text-[10px]">
                  {new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {filteredTickets.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              Tidak ada tiket pengaduan pada filter ini.
            </div>
          )}
        </div>

        {/* Ticket Detail / Response Pane (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          {selectedTicket ? (
            <div className="space-y-4 text-xs">
              <div className="pb-3 border-b border-slate-100 flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    {selectedTicket.id} • Kategori: {selectedTicket.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedTicket.subject}</h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Pengirim: <strong>{selectedTicket.proctor_name}</strong> ({selectedTicket.school_name})
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ${
                    selectedTicket.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedTicket.status === 'resolved' ? 'Terselesaikan' : 'Dalam Tindak Lanjut'}
                </span>
              </div>

              {/* Description message box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Rincian Kendala dari Proktor:</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">{selectedTicket.description}</p>
                <div className="text-[10px] text-slate-400 pt-1 font-mono">
                  Waktu Dilaporkan: {new Date(selectedTicket.created_at).toLocaleString('id-ID')}
                </div>
              </div>

              {/* Official Response */}
              {selectedTicket.response ? (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                  <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tanggapan Resmi Posko Pusat Pusmendik:</span>
                  </div>
                  <p className="text-emerald-800 leading-relaxed text-[11px]">{selectedTicket.response}</p>
                  <div className="text-[10px] text-emerald-600 pt-1 font-mono">
                    Diperbarui: {new Date(selectedTicket.updated_at).toLocaleString('id-ID')}
                  </div>
                </div>
              ) : null}

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-2 space-y-2">
                <label className="block font-bold text-slate-700">Tanggapi / Selesaikan Tiket Ini:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ketik instruksi solusi, token reset, atau konfirmasi tindakan teknis..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                ></textarea>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Solusi & Tandai Selesai</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">
              Pilih salah satu tiket di sebelah kiri untuk melihat rincian kendala dan memberikan respon.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
