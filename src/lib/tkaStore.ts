import { Announcement, HelpdeskTicket, ProctorComputer, TestGroupAllocation, DownloadableFile } from '../types/tka';

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-01',
    title: 'PROSEDUR PELAKSANAAN SIMULASI TKA JENJANG SMP/MTs DAN SATUAN PENDIDIKAN YANG SEDEAJAT TAHUN 2026 HARI KEDUA',
    author: 'Posko',
    date: '23-02-2026',
    time: '15:58',
    category: 'POSKO',
    isImportant: true,
    content: `Selasa, 24 Februari 2026

Berikut prosedur pengaktifan tes untuk Pelaksanaan Simulasi TKA Jenjang SMP/MTs dan Satuan Pendidikan Yang Sederajat pada moda daring dan semi daring.

A. MODA DARING:
1. Melihat ID dan password proktor di Laman TKA pada menu Simulasi, sub menu Komputer Proktor.
2. Jalankan & login ke Proktor Browser (ID Proktor aktif mulai pukul 06.00 WIB).
3. Masuk ke menu status tes dan mengklik tombol SET untuk menyimpan sesi. Klik tombol Rilis Token untuk memunculkan token tes.
4. Masuk ke Menu Kelompok Tes, filter kode tes sesuai waktunya:
   - Kelompok 1 (pilihan kelompok 1 untuk semua sesi), dan status Non Aktif, kemudian klik Apply.
5. Pilihan kode tes: SIMTKAP26H2
6. Mencentang semua peserta, kemudian klik assign.
7. Proktor Melakukan Rilis Token :
   - Kelompok 1 diaktifkan pada Pukul 07.00 - 15.30 WIB

B. MODA SEMI DARING:
1. Melihat ID dan password proktor di Laman TKA pada menu Simulasi, sub menu Komputer Proktor.
2. Jalankan & login ke Exambrowser Admin (ID Proktor aktif mulai pukul 06.00 WIB).
3. Masuk ke menu status tes.
4. Pilih Daftar Tes: SIMTKAP26H2.
5. Pilih kelompok : Kelompok 1 (pilihan kelompok 1 untuk semua sesi)
6. Tekan Rilis Token. Token diaktifkan dari pusat : Kelompok 1 Pukul 07.00 - 15.30 WIB.
7. Masuk ke Menu Kelompok Tes, pilih Assign All untuk mengaktifkan peserta agar dapat login untuk mengerjakan tes.
8. Peserta tes login untuk memulai tes.

Terima Kasih.

Catatan :
a. Siswa akan mengerjakan 3 subtes:
   - Subtes 1 adalah Latihan,
   - Subtes 2 adalah Simulasi - Bahasa Indonesia dan Literasi,
   - Subtes 3 adalah Simulasi - Survey Lingkungan Belajar,
b. Antar subtes terdapat jeda waktu 1 menit ditandai dengan tombol MULAI berwarna BIRU;
c. Pastikan peserta kembali ke HALAMAN LOGIN untuk keluar dari halaman tes;
d. Pastikan pengaturan zona waktu di komputer proktor dan klien (dalam mode daring) sudah diatur otomatis.`,
  },
  {
    id: 'ann-02',
    title: 'Informasi Simulasi Jenjang SMP/sederajat',
    author: 'Nasrullah',
    date: '23-02-2026',
    time: '14:08',
    category: 'TEKNIS',
    isImportant: false,
    content: `Kami informasikan kepada seluruh Proktor dan Teknisi Satuan Pendidikan Jenjang SD/SMP/sederajat:
1. Server Pusat Pusmendik beroperasi penuh 24 jam dengan sistem replikasi multi-tenant data terisolasi.
2. Bagi sekolah yang menggunakan moda semi daring, proses sinkronisasi VHD dapat dilakukan mulai hari ini pukul 18.00 WIB hingga pukul 05.00 WIB.
3. Selalu periksa pembaharuan token tes berkala setiap 15 menit melalui menu Administrasi Tes > Rilis Token.
4. Apabila terjadi kendala sistem atau pemadaman listrik di sekolah, silakan buat tiket pengaduan di menu Tiket Bantuan.`,
  },
];

const INITIAL_TICKETS: HelpdeskTicket[] = [
  {
    id: 'TKT-2026-001',
    school_id: 'sdn-01-menteng-uuid-001',
    school_name: 'SDN 01 Menteng Jakarta',
    proctor_name: 'Ibu Ratna Dewi, S.Pd',
    subject: 'Siswa atas nama Ahmad Fadhil Pratama terputus saat subtes 2',
    category: 'RESET_LOGIN',
    priority: 'high',
    status: 'in_progress',
    description: 'Saat mengerjakan subtes literasi listrik di lab sempat berkedip. Status siswa masih terkunci di sistem.',
    response: 'Sedang dilakukan reset status sesi peserta dari server pusat. Silakan siswa login kembali menggunakan token aktif.',
    created_at: '2026-02-24T08:15:00Z',
    updated_at: '2026-02-24T08:20:00Z',
  },
  {
    id: 'TKT-2026-002',
    school_id: 'sd-alazhar-rawamangun-uuid-002',
    school_name: 'SD Swasta Islam Terpadu Cendekia',
    proctor_name: 'Ustadz Fauzi Rahman',
    subject: 'Permohonan update alokasi sesi 2 untuk 15 siswa',
    category: 'TOKEN',
    priority: 'medium',
    status: 'resolved',
    description: 'Penambahan 15 siswa yang baru menyelesaikan verifikasi kartu login ke kelompok tes 1 sesi siang.',
    response: 'Alokasi sesi berhasil disetujui dan token telah diperbarui.',
    created_at: '2026-02-23T14:30:00Z',
    updated_at: '2026-02-23T15:00:00Z',
  },
];

const INITIAL_PROCTOR_COMPUTERS: ProctorComputer[] = [
  {
    id: 'pc-01',
    school_id: 'sdn-01-menteng-uuid-001',
    school_name: 'SDN 01 Menteng Jakarta',
    proctor_id_code: 'P0101001-R01',
    room_name: 'Lab Komputer 01 (Utama)',
    ip_address: '192.168.0.200',
    password_hash: 'Prk#Mtg26@1',
    client_count: 30,
    status: 'online',
    last_sync: '24-02-2026 07:12:44 WIB',
  },
  {
    id: 'pc-02',
    school_id: 'sdn-01-menteng-uuid-001',
    school_name: 'SDN 01 Menteng Jakarta',
    proctor_id_code: 'P0101001-R02',
    room_name: 'Lab Komputer 02 (Cadangan)',
    ip_address: '192.168.0.201',
    password_hash: 'Prk#Mtg26@2',
    client_count: 20,
    status: 'standby',
    last_sync: '24-02-2026 06:45:10 WIB',
  },
  {
    id: 'pc-03',
    school_id: 'sd-alazhar-rawamangun-uuid-002',
    school_name: 'SD Swasta Islam Terpadu Cendekia',
    proctor_id_code: 'P0102002-R01',
    room_name: 'Lab Siber Al-Battani',
    ip_address: '192.168.1.100',
    password_hash: 'Cbt#Cdk26@1',
    client_count: 25,
    status: 'online',
    last_sync: '24-02-2026 07:30:19 WIB',
  },
];

export const DOWNLOAD_FILES: DownloadableFile[] = [
  {
    id: 'dl-01',
    name: 'PREREQUISITES',
    category: 'folder',
    size: '142.5 MB',
    description: 'Paket Software Pendukung: Driver Browser, Exambrowser 26.2, .NET Framework 4.8, Visual C++',
    date: '20-02-2026',
    version: 'v2026.1',
  },
  {
    id: 'dl-02',
    name: '2026222_Manual Penggunaan Aplikasi Tes Daring.pdf',
    category: 'pdf',
    size: '4.8 MB',
    description: 'Buku Petunjuk Teknis Pelaksanaan Ujian Daring TKA Pusmendik Tahun 2026',
    date: '22-02-2026',
    version: 'Rev. 2',
  },
  {
    id: 'dl-03',
    name: 'Petunjuk SINKRONISASI SimulasiTKA 2026.pdf',
    category: 'pdf',
    size: '3.2 MB',
    description: 'Panduan Prosedur Sinkronisasi VHD & Konfigurasi VM Exambrowser Admin',
    date: '21-02-2026',
    version: 'Rev. 1',
  },
  {
    id: 'dl-04',
    name: '20251007-Manual Aplikasi Semi Daring TKA.pdf',
    category: 'pdf',
    size: '5.1 MB',
    description: 'Panduan Penyelenggaraan Ujian Moda Semi Daring untuk Sekolah Blank Spot & 3T',
    date: '07-10-2025',
    version: 'Final',
  },
];

class TkaStore {
  private get<T>(key: string, def: T): T {
    try {
      const data = localStorage.getItem(`tka_${key}`);
      return data ? JSON.parse(data) : def;
    } catch {
      return def;
    }
  }

  private set<T>(key: string, val: T): void {
    try {
      localStorage.setItem(`tka_${key}`, JSON.stringify(val));
    } catch (e) {
      console.error(e);
    }
  }

  // Announcements
  getAnnouncements(): Announcement[] {
    return this.get<Announcement[]>('announcements', INITIAL_ANNOUNCEMENTS);
  }

  addAnnouncement(ann: Omit<Announcement, 'id'>): Announcement {
    const list = this.getAnnouncements();
    const newAnn: Announcement = {
      ...ann,
      id: 'ann-' + Math.random().toString(36).substring(2, 9),
    };
    list.unshift(newAnn);
    this.set('announcements', list);
    return newAnn;
  }

  // Tickets
  getTickets(schoolId?: string | null): HelpdeskTicket[] {
    const all = this.get<HelpdeskTicket[]>('tickets', INITIAL_TICKETS);
    if (!schoolId) return all;
    return all.filter((t) => t.school_id === schoolId);
  }

  addTicket(ticket: Omit<HelpdeskTicket, 'id' | 'created_at' | 'updated_at'>): HelpdeskTicket {
    const all = this.getTickets();
    const newTicket: HelpdeskTicket = {
      ...ticket,
      id: `TKT-2026-${String(all.length + 1).padStart(3, '0')}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    all.unshift(newTicket);
    this.set('tickets', all);
    return newTicket;
  }

  updateTicket(id: string, updates: Partial<HelpdeskTicket>): void {
    const all = this.getTickets();
    const idx = all.findIndex((t) => t.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...updates, updated_at: new Date().toISOString() };
      this.set('tickets', all);
    }
  }

  // Proctor Computers
  getProctorComputers(schoolId?: string | null): ProctorComputer[] {
    const all = this.get<ProctorComputer[]>('proctor_computers', INITIAL_PROCTOR_COMPUTERS);
    if (!schoolId) return all;
    return all.filter((p) => p.school_id === schoolId);
  }

  addProctorComputer(pc: Omit<ProctorComputer, 'id'>): ProctorComputer {
    const all = this.getProctorComputers();
    const newPc: ProctorComputer = {
      ...pc,
      id: 'pc-' + Math.random().toString(36).substring(2, 9),
    };
    all.push(newPc);
    this.set('proctor_computers', all);
    return newPc;
  }

  // Active Token & Session
  getActiveToken(): { code: string; testCode: string; validUntil: string; releasedAt: string } {
    return this.get('active_token', {
      code: 'SIMTKAP26H2',
      testCode: 'SIMTKAP26H2',
      validUntil: '15:30 WIB',
      releasedAt: '07:00 WIB',
    });
  }

  releaseNewToken(testCode = 'SIMTKAP26H2'): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const tokenData = {
      code,
      testCode,
      validUntil: '15:30 WIB',
      releasedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    };
    this.set('active_token', tokenData);
    return code;
  }
}

export const tkaStore = new TkaStore();
