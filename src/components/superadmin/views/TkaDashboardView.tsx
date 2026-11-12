import React, { useState } from 'react';
import { tkaStore, DOWNLOAD_FILES } from '../../../lib/tkaStore';
import { tenantStore } from '../../../lib/supabase';
import { DownloadableFile, Announcement } from '../../../types/tka';
import {
  Mail,
  Calendar,
  Clock,
  Download,
  Folder,
  FileText,
  Headphones,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Phone,
  Plus,
  Send,
  Building2,
  Users,
  Activity,
  KeyRound,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface TkaDashboardViewProps {
  onNavigate: (menuId: string, subId?: string) => void;
}

export const TkaDashboardView: React.FC<TkaDashboardViewProps> = ({ onNavigate }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => tkaStore.getAnnouncements());
  const [activeToken] = useState(tkaStore.getActiveToken());
  const [selectedFile, setSelectedFile] = useState<DownloadableFile | null>(null);
  const [showContactModal, setShowContactModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Announcement state
  const [showAddAnnModal, setShowAddAnnModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('Posko Pusat');
  const [newContent, setNewContent] = useState('');

  // Edit Announcement state
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editContent, setEditContent] = useState('');

  // Delete Announcement state
  const [annToDelete, setAnnToDelete] = useState<Announcement | null>(null);

  const schools = tenantStore.getSchools();
  const students = tenantStore.getStudents();
  const proctors = tenantStore.getProctors();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const created = tkaStore.addAnnouncement({
      title: newTitle.trim(),
      author: newAuthor.trim() || 'Posko Pusat',
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      category: 'POSKO',
      isImportant: true,
      content: newContent.trim(),
    });

    setAnnouncements(tkaStore.getAnnouncements());
    setNewTitle('');
    setNewContent('');
    setShowAddAnnModal(false);
    showToast('Pengumuman baru berhasil diterbitkan.');
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnn(ann);
    setEditTitle(ann.title);
    setEditAuthor(ann.author);
    setEditContent(ann.content);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn || !editTitle.trim() || !editContent.trim()) return;

    tkaStore.updateAnnouncement(editingAnn.id, {
      title: editTitle.trim(),
      author: editAuthor.trim() || 'Posko Pusat',
      content: editContent.trim(),
    });

    setAnnouncements(tkaStore.getAnnouncements());
    setEditingAnn(null);
    showToast('Perubahan pengumuman berhasil disimpan.');
  };

  const handleConfirmDelete = () => {
    if (!annToDelete) return;
    tkaStore.deleteAnnouncement(annToDelete.id);
    setAnnouncements(tkaStore.getAnnouncements());
    const deletedTitle = annToDelete.title;
    setAnnToDelete(null);
    showToast(`Pengumuman "${deletedTitle.slice(0, 30)}..." telah dihapus.`);
  };

  const handleDownloadFile = (file: DownloadableFile) => {
    setSelectedFile(file);
  };

  return (
    <div className="space-y-4">
      {/* Quick KPI Strip at the top of dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div 
          onClick={() => onNavigate('kelola_sekolah')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition"
        >
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Total Sekolah SINTESA
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{schools.length} Sekolah</div>
            <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-3 h-3" />
              <span>{schools.filter((s) => s.status === 'active').length} Terverifikasi Aktif</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('verifikasi_pendaftaran')}
          className={`p-3.5 rounded-xl border shadow-xs flex items-center justify-between cursor-pointer transition ${
            schools.some((s) => s.status === 'pending')
              ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide">
              Menunggu Verifikasi
            </div>
            <div className="text-xl font-bold text-amber-950 mt-0.5">
              {schools.filter((s) => s.status === 'pending').length} Sekolah
            </div>
            <div className="text-[10px] text-amber-700 font-bold flex items-center gap-1 mt-0.5">
              <span>Klik untuk periksa berkas & NPSN →</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Peserta Didik (CBT)
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{students.length} Siswa</div>
            <div className="text-[10px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
              <span>Terdata di DNT SINTESA</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('administrasi_pusat')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition"
        >
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Token Aktif Hari Ini
            </div>
            <div className="text-xl font-mono font-bold text-blue-700 mt-0.5">{activeToken.code}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              Kelompok 1 (s/d {activeToken.validUntil})
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Left Announcements (2/3) + Right Contacts & Downloads (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Announcements Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight uppercase">
                Papan Pengumuman Resmi Posko Pusat
              </h2>
            </div>
            <button
              onClick={() => setShowAddAnnModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Pengumuman</span>
            </button>
          </div>

          {announcements.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              <Mail className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">Belum ada pengumuman resmi</p>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan tombol "Buat Pengumuman" di atas untuk menerbitkan instruksi kepada seluruh sekolah.
              </p>
            </div>
          ) : (
            announcements.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Header Box: Blue accent bar matching screenshot */}
                <div className="bg-[#1f73b7] text-white px-4 py-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-tight leading-snug break-words">
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-blue-100 mt-1">
                      <span className="font-medium">{item.author}</span>
                      <span className="opacity-70">•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 opacity-80" />
                        <span>{item.date}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 opacity-80" />
                        <span>{item.time}</span>
                      </span>
                    </div>
                  </div>

                  {/* Super Admin Announcement Actions: Edit & Delete */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Edit Pengumuman"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-md text-xs font-medium transition cursor-pointer border border-white/20"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => setAnnToDelete(item)}
                      title="Hapus Pengumuman"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-500/80 hover:bg-rose-600 active:scale-95 text-white rounded-md text-xs font-medium transition cursor-pointer border border-rose-400/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  </div>
                </div>

              {/* Announcement Body Content */}
              <div className="p-4 sm:p-5 text-xs text-slate-700 leading-relaxed space-y-3 font-sans">
                {/* Parse text lines */}
                {item.content.split('\n\n').map((paragraph, pIdx) => {
                  // check if paragraph contains the highlight
                  if (paragraph.includes('pada Pukul 07.00 - 15.30 WIB')) {
                    const parts = paragraph.split('pada Pukul 07.00 - 15.30 WIB');
                    return (
                      <div key={pIdx} className="space-y-1">
                        {paragraph.split('\n').map((line, lIdx) => {
                          if (line.includes('pada Pukul 07.00 - 15.30 WIB')) {
                            const lineParts = line.split('pada Pukul 07.00 - 15.30 WIB');
                            return (
                              <p key={lIdx} className="text-slate-800">
                                {lineParts[0]}
                                <mark className="bg-sky-500 text-white font-bold px-1.5 py-0.5 rounded text-[11px] select-all">
                                  pada Pukul 07.00 - 15.30 WIB
                                </mark>
                                {lineParts[1]}
                              </p>
                            );
                          }
                          return (
                            <p
                              key={lIdx}
                              className={
                                line.startsWith('A. MODA') || line.startsWith('B. MODA') || line.startsWith('Catatan')
                                  ? 'font-bold text-slate-900 pt-1'
                                  : line.startsWith('Selasa,')
                                  ? 'font-semibold text-slate-800'
                                  : 'text-slate-700'
                              }
                            >
                              {line}
                            </p>
                          );
                        })}
                      </div>
                    );
                  }

                  return (
                    <div key={pIdx} className="space-y-1">
                      {paragraph.split('\n').map((line, lIdx) => (
                        <p
                          key={lIdx}
                          className={
                            line.startsWith('A. MODA') || line.startsWith('B. MODA') || line.startsWith('Catatan')
                              ? 'font-bold text-slate-900 pt-1'
                              : line.startsWith('Selasa,')
                              ? 'font-semibold text-slate-800'
                              : 'text-slate-700'
                          }
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Action Bar on Card */}
              <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1 text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>SINTESA Pusat (Sistem Informasi Tes dan Asesmen)</span>
                </div>
                <button
                  onClick={() => onNavigate('adm_token')}
                  className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition"
                >
                  <span>Buka Menu Rilis Token</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

        {/* RIGHT COLUMN: Contacts & Downloads (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Petugas Bantuan Teknis */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Headphones className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Petugas Bantuan Teknis
              </h3>
            </div>

            <div className="p-3 divide-y divide-slate-100 text-xs">
              {/* Petugas 1: Tim Teknis Cabang Dinas */}
              <div
                onClick={() => setShowContactModal('Tim Teknis Cabang Dinas')}
                className="py-3 px-2 flex items-center gap-3 hover:bg-slate-50 rounded-lg cursor-pointer transition group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                  <Headphones className="w-5 h-5 text-blue-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 group-hover:text-blue-600 transition truncate">
                    Tim Teknis Cabang Dinas
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    <span>Status: Online</span>
                    <span>•</span>
                    <span className="text-blue-600 font-medium">Chat Bantuan</span>
                  </div>
                </div>
              </div>

              {/* Petugas 2: Tim Teknis Provinsi */}
              <div
                onClick={() => setShowContactModal('Tim Teknis Provinsi')}
                className="py-3 px-2 flex items-center gap-3 hover:bg-slate-50 rounded-lg cursor-pointer transition group"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
                  <Headphones className="w-5 h-5 text-indigo-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 group-hover:text-blue-600 transition truncate">
                    Tim Teknis Provinsi
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    <span>Status: Standby</span>
                    <span>•</span>
                    <span className="text-blue-600 font-medium">Bantuan Wilayah</span>
                  </div>
                </div>
              </div>

              {/* Petugas 3: Posko Pusat */}
              <div
                onClick={() => setShowContactModal('Posko Pusat Pusmendik')}
                className="py-3 px-2 flex items-center gap-3 hover:bg-slate-50 rounded-lg cursor-pointer transition group"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
                  <Headphones className="w-5 h-5 text-purple-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 group-hover:text-blue-600 transition truncate">
                    Posko Pusat Pusmendik
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-ping"></span>
                    <span>Layanan 24 Jam</span>
                    <span>•</span>
                    <span className="text-purple-600 font-semibold">Helpdesk Utama</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Download Berkas */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Download Berkas
              </h3>
            </div>

            <div className="p-3 divide-y divide-slate-100 text-xs">
              {DOWNLOAD_FILES.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleDownloadFile(file)}
                  className="py-2.5 px-2 flex items-center gap-3 hover:bg-slate-50 rounded-lg cursor-pointer transition group"
                >
                  {/* Category icon */}
                  {file.category === 'folder' ? (
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Folder className="w-5 h-5 fill-amber-500 text-amber-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0 font-bold text-[9px] uppercase tracking-tighter">
                      <span className="bg-red-600 text-white px-1 py-0.5 rounded-xs font-mono">PDF</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition truncate text-xs">
                      {file.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {file.size} • {file.date}
                    </div>
                  </div>

                  <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Multi-tenant Quick Launch */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                Kendali Multi-Tenant
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/20 text-blue-200 border border-blue-400/30">
                RLS Aktif
              </span>
            </div>
            <h4 className="text-xs font-bold leading-snug">
              Kelola Isolasi & Distribusi Soal SINTESA
            </h4>
            <p className="text-[11px] text-slate-300 leading-normal">
              Akses cepat pengawasan seluruh sekolah dasar, monitoring audit log, dan sinkronisasi bank soal.
            </p>
            <button
              onClick={() => onNavigate('multitenant_schools')}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <span>Buka Menu Multi-Tenant</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: File Preview & Download */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {selectedFile.category === 'folder' ? (
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Folder className="w-6 h-6 fill-amber-500 text-amber-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {selectedFile.name}
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Ukuran: {selectedFile.size} • Versi: {selectedFile.version || 'Resmi'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="font-semibold text-slate-700">Deskripsi Berkas:</div>
              <p className="text-[11px] leading-relaxed">{selectedFile.description}</p>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-mono">
                <span>SHA-256 Verified</span>
                <span>Pusat Asesmen Pendidikan</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedFile(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 transition"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  alert(`Memulai unduhan berkas resmi: ${selectedFile.name}`);
                  setSelectedFile(null);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Berkas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Contact Support */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{showContactModal}</h3>
                  <p className="text-[11px] text-slate-500">Kanal Komunikasi Siaga TKA</p>
                </div>
              </div>
              <button
                onClick={() => setShowContactModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <div className="font-bold text-blue-900">Saluran WhatsApp & Helpdesk Teknis</div>
                <div className="text-[11px] text-blue-700">
                  Untuk percepatan penanganan reset peserta, token darurat, atau kendala server semi-daring.
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-700">Hotline WhatsApp</span>
                  </div>
                  <span className="font-mono text-emerald-700 font-bold">+62 812-3456-7890</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-slate-700">Call Center Pusmendik</span>
                  </div>
                  <span className="font-mono text-blue-700 font-bold">1500-005 (Ext 2)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowContactModal(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add New Announcement */}
      {showAddAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateAnnouncement}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 text-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Terbitkan Pengumuman Resmi Posko
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAnnModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Judul Pengumuman
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PROSEDUR PELAKSANAAN SIMULASI TKA HARI KETIGA..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Penerbit / Posko
                </label>
                <input
                  type="text"
                  required
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Isi Instruksi & Prosedur Pengumuman
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Ketik detail instruksi daring/semi-daring, kode tes, waktu aktif token..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddAnnModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publikasikan ke Seluruh Sekolah</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Edit Announcement */}
      {editingAnn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 text-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Edit Pengumuman Resmi Posko
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Perubahan langsung diperbarui untuk seluruh sekolah & proktor
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAnn(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-base cursor-pointer rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Judul Pengumuman
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 uppercase font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Penerbit / Posko
                </label>
                <input
                  type="text"
                  required
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Isi Instruksi & Prosedur Pengumuman
                </label>
                <textarea
                  rows={8}
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed text-slate-800"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingAnn(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Delete Confirmation Dialog */}
      {annToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Hapus Pengumuman?
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs">
              <div className="text-[10px] text-slate-500 font-medium">Judul Pengumuman:</div>
              <div className="font-bold text-slate-800 mt-0.5 line-clamp-2">
                {annToDelete.title}
              </div>
              <div className="text-[10px] text-slate-500 mt-1.5">
                Diterbitkan oleh: <span className="font-semibold text-slate-700">{annToDelete.author}</span> • {annToDelete.date}
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Pengumuman ini akan segera dihapus dari tampilan dashboard Super Admin serta portal seluruh proktor dan sekolah.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAnnToDelete(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Pengumuman</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
