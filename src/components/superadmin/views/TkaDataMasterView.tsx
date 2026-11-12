import React, { useState, useEffect } from 'react';
import { tenantStore } from '../../../lib/supabase';
import { School, Subject, QuestionBank, Student, Proctor, Profile, UserRole } from '../../../types/database';
import { TutWuriLogo } from '../../common/TutWuriLogo';
import {
  Building2,
  Users,
  UserCheck,
  UserCog,
  BookOpen,
  FileSpreadsheet,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Layers,
  Sparkles,
  Printer,
  RefreshCw,
  Download,
  KeyRound,
  Lock,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  QrCode,
  School as SchoolIcon,
} from 'lucide-react';

interface TkaDataMasterViewProps {
  subTab?: string;
  onNavigate?: (sub: string) => void;
  onOpenSqlModal?: () => void;
}

export const TkaDataMasterView: React.FC<TkaDataMasterViewProps> = ({
  subTab = 'data_sekolah',
  onNavigate,
  onOpenSqlModal,
}) => {
  // Normalize subTab
  const getNormalizedSubTab = (tab?: string) => {
    if (!tab) return 'data_sekolah';
    if (tab === 'schools' || tab === 'data_sekolah' || tab === 'sekolah') return 'data_sekolah';
    if (tab === 'users' || tab === 'data_pengguna' || tab === 'pengguna') return 'data_pengguna';
    if (tab === 'students' || tab === 'data_peserta' || tab === 'peserta') return 'data_peserta';
    if (tab === 'subjects' || tab === 'mapel') return 'subjects';
    if (tab === 'banks' || tab === 'bank_soal') return 'banks';
    return tab;
  };

  const [activeSubTab, setActiveSubTab] = useState<string>(getNormalizedSubTab(subTab));

  useEffect(() => {
    if (subTab) {
      setActiveSubTab(getNormalizedSubTab(subTab));
    }
  }, [subTab]);

  const handleSubTabChange = (tab: string) => {
    setActiveSubTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  // Main Stores State
  const [schools, setSchools] = useState<School[]>(() => tenantStore.getSchools());
  const [profiles, setProfiles] = useState<(Profile & { role: UserRole; password?: string })[]>(() =>
    tenantStore.getProfiles()
  );
  const [proctors, setProctors] = useState<Proctor[]>(() => tenantStore.getProctors());
  const [students, setStudents] = useState<Student[]>(() => tenantStore.getStudents());
  const [subjects] = useState<Subject[]>(() => tenantStore.getSubjects());
  const [banks] = useState<QuestionBank[]>(() => tenantStore.getQuestionBanks());

  // Feedback Notification
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // =========================================================================
  // SUBTAB 1: DATA SEKOLAH STATE & HANDLERS
  // =========================================================================
  const [schoolSearchTerm, setSchoolSearchTerm] = useState('');
  const [schoolStatusFilter, setSchoolStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [schoolTypeFilter, setSchoolTypeFilter] = useState<'all' | 'negeri' | 'swasta'>('all');
  const [selectedSchoolDetail, setSelectedSchoolDetail] = useState<School | null>(null);

  // Modal Add School
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [newNpsn, setNewNpsn] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newLevel, setNewLevel] = useState<'SD' | 'MI'>('SD');
  const [newType, setNewType] = useState<'negeri' | 'swasta'>('negeri');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('Kota Jakarta Pusat');
  const [newProvince, setNewProvince] = useState('DKI Jakarta');
  const [newPrincipal, setNewPrincipal] = useState('');
  const [newSchoolEmail, setNewSchoolEmail] = useState('');
  const [newSchoolPhone, setNewSchoolPhone] = useState('');

  const handleToggleSchoolStatus = (school: School) => {
    const nextStatus = school.status === 'active' ? 'suspended' : 'active';
    tenantStore.updateSchoolStatus(
      school.id,
      nextStatus as any,
      `Status diubah menjadi ${nextStatus} oleh Superadmin Pusat`
    );
    const updatedSchools = tenantStore.getSchools();
    setSchools(updatedSchools);
    showToast(`Status ${school.name} berhasil diubah menjadi ${nextStatus.toUpperCase()}`);
  };

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNpsn.trim() || !newSchoolName.trim()) {
      alert('NPSN dan Nama Sekolah wajib diisi!');
      return;
    }

    if (schools.some((s) => s.npsn === newNpsn.trim())) {
      alert('NPSN sudah terdaftar dalam sistem!');
      return;
    }

    const newId = 'sch-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const createdSchool: School = {
      id: newId,
      npsn: newNpsn.trim(),
      name: newSchoolName.trim(),
      education_level: newLevel,
      school_type: newType,
      address: newAddress.trim() || 'Jl. Pendidikan Utama No. ' + Math.floor(Math.random() * 50 + 1),
      province: newProvince,
      city_regency: newCity,
      district: 'Kecamatan Terpadu',
      email: newSchoolEmail.trim() || `admin.${newNpsn}@sekolah.id`,
      phone: newSchoolPhone.trim() || '021-5000' + Math.floor(Math.random() * 900 + 100),
      principal_name: newPrincipal.trim() || 'Drs. H. Mulyono, M.Pd.',
      status: 'active',
      created_at: now,
      updated_at: now,
    };

    tenantStore.saveSchool(createdSchool);

    // Auto-create default admin account for this school
    const adminProfile: Profile & { role: UserRole; password?: string } = {
      id: 'user-admin-' + Math.random().toString(36).substring(2, 8),
      school_id: newId,
      full_name: `Admin ${createdSchool.name}`,
      email: createdSchool.email,
      phone: createdSchool.phone || '',
      role: 'school_admin',
      password: 'password123',
      created_at: now,
      updated_at: now,
    };
    tenantStore.saveProfile(adminProfile);

    // Refresh state
    setSchools(tenantStore.getSchools());
    setProfiles(tenantStore.getProfiles());
    setShowAddSchoolModal(false);
    setNewNpsn('');
    setNewSchoolName('');
    setNewPrincipal('');
    setNewAddress('');
    setNewSchoolEmail('');
    setNewSchoolPhone('');
    showToast(`Sekolah ${createdSchool.name} berhasil didaftarkan dan akun Admin Sekolah aktif.`);
  };

  const filteredSchools = schools.filter((sch) => {
    const matchSearch =
      sch.name.toLowerCase().includes(schoolSearchTerm.toLowerCase()) ||
      sch.npsn.includes(schoolSearchTerm) ||
      sch.city_regency.toLowerCase().includes(schoolSearchTerm.toLowerCase());
    const matchStatus = schoolStatusFilter === 'all' || sch.status === schoolStatusFilter;
    const matchType = schoolTypeFilter === 'all' || sch.school_type === schoolTypeFilter;
    return matchSearch && matchStatus && matchType;
  });

  // =========================================================================
  // SUBTAB 2: DATA PENGGUNA STATE & HANDLERS
  // =========================================================================
  const [userViewMode, setUserViewMode] = useState<'rekapitulasi' | 'direktori'>('rekapitulasi');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole>('all');
  const [userSchoolFilter, setUserSchoolFilter] = useState<string>('all');
  const [selectedUserDetail, setSelectedUserDetail] = useState<(Profile & { role: UserRole; password?: string }) | null>(
    null
  );

  // Modal Add User
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('proctor');
  const [newUserSchoolId, setNewUserSchoolId] = useState<string>(schools[0]?.id || '');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserNipNisn, setNewUserNipNisn] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('password123');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert('Nama dan Email Pengguna wajib diisi!');
      return;
    }

    const now = new Date().toISOString();
    const newUserId = 'user-' + Math.random().toString(36).substring(2, 9);
    const newProfile: Profile & { role: UserRole; password?: string } = {
      id: newUserId,
      school_id: newUserRole === 'super_admin' ? null : newUserSchoolId,
      full_name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      phone: newUserPhone.trim(),
      role: newUserRole,
      password: newUserPassword.trim() || 'password123',
      created_at: now,
      updated_at: now,
    };

    tenantStore.saveProfile(newProfile);

    // If proctor, record in proctor table too
    if (newUserRole === 'proctor' && newUserSchoolId) {
      tenantStore.addProctor({
        id: 'p-' + Math.random().toString(36).substring(2, 8),
        school_id: newUserSchoolId,
        user_id: newUserId,
        nip: newUserNipNisn.trim() || '1988' + Math.floor(Math.random() * 90000000),
        full_name: newUserName.trim(),
        phone: newUserPhone.trim(),
        is_active: true,
        created_at: now,
      });
      setProctors(tenantStore.getProctors());
    }

    // Refresh
    setProfiles(tenantStore.getProfiles());
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserNipNisn('');
    showToast(`Akun pengguna ${newProfile.full_name} (${newProfile.role.toUpperCase()}) berhasil ditambahkan.`);
  };

  const handleResetPassword = (userEmail: string, userName: string) => {
    if (confirm(`Reset kata sandi pengguna "${userName}" menjadi default: password123?`)) {
      const all = tenantStore.getProfiles();
      const target = all.find((p) => p.email.toLowerCase() === userEmail.toLowerCase());
      if (target) {
        tenantStore.saveProfile({ ...target, password: 'password123' });
        setProfiles(tenantStore.getProfiles());
        showToast(`Kata sandi untuk ${userName} berhasil direset ke: password123`);
      }
    }
  };

  // Helper getters for users
  const getSchoolName = (schoolId: string | null) => {
    if (!schoolId) return 'Pusat (Kemdikbud)';
    const found = schools.find((s) => s.id === schoolId);
    return found ? found.name : 'Sekolah Dasar';
  };

  const getSchoolNpsn = (schoolId: string | null) => {
    if (!schoolId) return '-';
    const found = schools.find((s) => s.id === schoolId);
    return found ? found.npsn : '-';
  };

  const filteredProfiles = profiles.filter((prof) => {
    const matchSearch =
      prof.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      prof.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (prof.phone && prof.phone.includes(userSearchTerm));
    const matchRole = userRoleFilter === 'all' || prof.role === userRoleFilter;
    const matchSchool = userSchoolFilter === 'all' || prof.school_id === userSchoolFilter;
    return matchSearch && matchRole && matchSchool;
  });

  // Calculate user counts
  const totalUsersCount = profiles.length;
  const adminSchoolsCount = profiles.filter((p) => p.role === 'school_admin').length;
  const proctorsCount = proctors.length || profiles.filter((p) => p.role === 'proctor').length;
  const studentsWithAccountsCount = profiles.filter((p) => p.role === 'student').length;

  // =========================================================================
  // SUBTAB 3: DATA PESERTA STATE & HANDLERS
  // =========================================================================
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentSchoolFilter, setStudentSchoolFilter] = useState('all');
  const [studentGenderFilter, setStudentGenderFilter] = useState<'all' | 'L' | 'P'>('all');
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<Student | null>(null);

  const filteredStudents = students.filter((st) => {
    const matchSchool = studentSchoolFilter === 'all' || st.school_id === studentSchoolFilter;
    const matchGender = studentGenderFilter === 'all' || st.gender === studentGenderFilter;
    const matchSearch =
      st.full_name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      st.nisn.includes(studentSearchTerm) ||
      (st.nis && st.nis.includes(studentSearchTerm)) ||
      (st.class_name && st.class_name.toLowerCase().includes(studentSearchTerm.toLowerCase()));
    return matchSchool && matchGender && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Top Header & Subtab Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-blue-600 rounded-full inline-block"></span>
            Pusat Data Master Nasional SINTESA
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pangkalan data terpadu satuan pendidikan, rekapitulasi pengguna, dan peserta asesmen
          </p>
        </div>

        {/* Submenu Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
          {/* Submenu 1: Data Sekolah */}
          <button
            onClick={() => handleSubTabChange('data_sekolah')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === 'data_sekolah'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Data Sekolah ({schools.length})</span>
          </button>

          {/* Submenu 2: Data Pengguna */}
          <button
            onClick={() => handleSubTabChange('data_pengguna')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === 'data_pengguna'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Data Pengguna ({profiles.length})</span>
          </button>

          {/* Submenu 3: Data Peserta */}
          <button
            onClick={() => handleSubTabChange('data_peserta')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === 'data_peserta'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Data Peserta ({students.length})</span>
          </button>

          {/* Secondary Subtabs: Mata Pelajaran & Bank Soal */}
          <button
            onClick={() => handleSubTabChange('subjects')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeSubTab === 'subjects'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mapel</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: DATA SEKOLAH (Sekolah yang Terdaftar)
         ========================================================================= */}
      {activeSubTab === 'data_sekolah' && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Total Sekolah Terdaftar</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{schools.length}</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                {schools.filter((s) => s.status === 'active').length} Sekolah Aktif
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Sekolah Negeri</div>
              <div className="text-2xl font-black text-blue-700 mt-1">
                {schools.filter((s) => s.school_type === 'negeri').length}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Satuan Pendidikan Negeri</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Sekolah Swasta</div>
              <div className="text-2xl font-black text-indigo-700 mt-1">
                {schools.filter((s) => s.school_type === 'swasta').length}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Satuan Pendidikan Swasta</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Menunggu Verifikasi</div>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {schools.filter((s) => s.status === 'pending').length}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Pendaftaran Baru</div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Daftar Satuan Pendidikan (Sekolah Terdaftar)
                </h2>
                <p className="text-xs text-slate-500">
                  Data seluruh sekolah penyelenggara ujian berbasis komputer yang terintegrasi di platform SINTESA
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari NPSN, Nama, Kota..."
                    value={schoolSearchTerm}
                    onChange={(e) => setSchoolSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-44 sm:w-56"
                  />
                </div>

                {/* Filter Status */}
                <select
                  value={schoolStatusFilter}
                  onChange={(e) => setSchoolStatusFilter(e.target.value as any)}
                  className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-700 bg-white"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>

                {/* Filter Type */}
                <select
                  value={schoolTypeFilter}
                  onChange={(e) => setSchoolTypeFilter(e.target.value as any)}
                  className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-700 bg-white"
                >
                  <option value="all">Semua Bentuk</option>
                  <option value="negeri">Negeri</option>
                  <option value="swasta">Swasta</option>
                </select>

                <button
                  onClick={() => setShowAddSchoolModal(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Sekolah</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">NPSN & Nama Satuan Pendidikan</th>
                    <th className="py-2.5 px-3">Bentuk / Jenis</th>
                    <th className="py-2.5 px-3">Kab/Kota & Provinsi</th>
                    <th className="py-2.5 px-3">Kepala Sekolah</th>
                    <th className="py-2.5 px-3">Rekapitulasi</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSchools.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Tidak ada sekolah terdaftar yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredSchools.map((sch, idx) => {
                      const schoolStudents = students.filter((st) => st.school_id === sch.id);
                      const schoolProctors = proctors.filter((p) => p.school_id === sch.id);
                      const schoolAdmin = profiles.find((p) => p.school_id === sch.id && p.role === 'school_admin');

                      return (
                        <tr key={sch.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{sch.name}</div>
                            <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>NPSN:</span>
                              <span className="text-blue-700 font-bold">{sch.npsn}</span>
                              <span className="text-slate-300">•</span>
                              <span className="truncate max-w-[180px]">{sch.email}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                              {sch.education_level} • {sch.school_type}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            <div className="font-medium text-slate-800">{sch.city_regency}</div>
                            <div className="text-[10px] text-slate-400">{sch.province}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-700 font-medium">
                            <div>{sch.principal_name}</div>
                            {sch.phone && <div className="text-[10px] text-slate-400">{sch.phone}</div>}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-0.5 text-[10px] text-slate-600">
                              <span>• Admin: <strong>{schoolAdmin ? schoolAdmin.full_name : '1 Akun'}</strong></span>
                              <span>• Proktor: <strong>{schoolProctors.length} Guru</strong></span>
                              <span>• Siswa: <strong>{schoolStudents.length} Peserta</strong></span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            {sch.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                Aktif
                              </span>
                            ) : sch.status === 'pending' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                Menunggu Verifikasi
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 text-red-600" />
                                Suspended
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedSchoolDetail(sch)}
                              className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-medium"
                              title="Lihat Detail Profil Sekolah"
                            >
                              Detail
                            </button>
                            <button
                              onClick={() => handleToggleSchoolStatus(sch)}
                              className={`px-2.5 py-1 rounded text-[11px] font-medium border ${
                                sch.status === 'active'
                                  ? 'text-red-700 border-red-200 hover:bg-red-50'
                                  : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                              }`}
                            >
                              {sch.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: DATA PENGGUNA (Rekapitulasi Pengguna Setiap Sekolah Termasuk Proktor)
         ========================================================================= */}
      {activeSubTab === 'data_pengguna' && (
        <div className="space-y-4">
          {/* Top Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Total Akun Pengguna</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalUsersCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Semua Peran Terdaftar</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-200/80 bg-blue-50/20 shadow-xs">
              <div className="text-[11px] font-bold text-blue-700 uppercase">Administrator Sekolah</div>
              <div className="text-2xl font-black text-blue-800 mt-1">{adminSchoolsCount}</div>
              <div className="text-[10px] text-blue-600 mt-0.5">Penanggung Jawab Sekolah</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
              <div className="text-[11px] font-bold text-amber-700 uppercase">Proktor / Pengawas</div>
              <div className="text-2xl font-black text-amber-800 mt-1">{proctorsCount}</div>
              <div className="text-[10px] text-amber-600 mt-0.5">Guru Pengawas Lab Ujian</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
              <div className="text-[11px] font-bold text-emerald-700 uppercase">Peserta Terdaftar</div>
              <div className="text-2xl font-black text-emerald-800 mt-1">{students.length}</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Siswa Ujian CBT</div>
            </div>
          </div>

          {/* Toggle between Rekapitulasi per Sekolah vs Direktori Seluruh Pengguna */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Rekapitulasi Data Pengguna per Satuan Pendidikan
                </h2>
                <p className="text-xs text-slate-500">
                  Monitoring seluruh akun pengguna di setiap sekolah mencakup Admin Sekolah, Guru Proktor/Pengawas, dan Siswa
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <div className="p-1 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setUserViewMode('rekapitulasi')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      userViewMode === 'rekapitulasi'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Rekapitulasi Sekolah
                  </button>
                  <button
                    onClick={() => setUserViewMode('direktori')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      userViewMode === 'direktori'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Direktori Lengkap Pengguna
                  </button>
                </div>

                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Pengguna</span>
                </button>
              </div>
            </div>

            {/* TAB A: REKAPITULASI DATA PENGGUNA PER SEKOLAH */}
            {userViewMode === 'rekapitulasi' && (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">Satuan Pendidikan</th>
                        <th className="py-2.5 px-3">Admin Sekolah Utama</th>
                        <th className="py-2.5 px-3">Guru Proktor / Pengawas</th>
                        <th className="py-2.5 px-3 text-center">Jumlah Siswa</th>
                        <th className="py-2.5 px-3 text-center">Total Akun Aktif</th>
                        <th className="py-2.5 px-3">Status Sekolah</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {schools.map((sch, idx) => {
                        const adminUser = profiles.find((p) => p.school_id === sch.id && p.role === 'school_admin');
                        const schoolProctors = proctors.filter((pr) => pr.school_id === sch.id);
                        const schoolStudents = students.filter((st) => st.school_id === sch.id);
                        const allSchoolUsers = profiles.filter((p) => p.school_id === sch.id);

                        return (
                          <tr key={sch.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900">{sch.name}</div>
                              <div className="text-[11px] font-mono text-blue-700 mt-0.5">NPSN: {sch.npsn}</div>
                              <div className="text-[10px] text-slate-400">{sch.city_regency}</div>
                            </td>

                            {/* Admin Sekolah */}
                            <td className="py-3 px-3">
                              {adminUser ? (
                                <div>
                                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    {adminUser.full_name}
                                  </div>
                                  <div className="text-[11px] font-mono text-slate-500">{adminUser.email}</div>
                                  {adminUser.phone && (
                                    <div className="text-[10px] text-slate-400">{adminUser.phone}</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] text-amber-600 italic">Belum terdaftar</span>
                              )}
                            </td>

                            {/* Proktor / Pengawas */}
                            <td className="py-3 px-3">
                              {schoolProctors.length > 0 ? (
                                <div className="space-y-1">
                                  {schoolProctors.map((pr) => (
                                    <div key={pr.id} className="bg-amber-50/60 p-1.5 rounded-lg border border-amber-200/50">
                                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                                        <HeadphonesIcon className="w-3 h-3 text-amber-600" />
                                        <span>{pr.full_name}</span>
                                      </div>
                                      <div className="text-[10px] font-mono text-slate-500">
                                        NIP: {pr.nip || 'Non-PNS'} | {pr.phone || '-'}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="bg-slate-50 p-1.5 rounded-lg text-[11px] text-slate-500 flex items-center justify-between">
                                  <span>1 Guru Ditugaskan</span>
                                  <button
                                    onClick={() => {
                                      setNewUserSchoolId(sch.id);
                                      setNewUserRole('proctor');
                                      setShowAddUserModal(true);
                                    }}
                                    className="text-[10px] text-blue-600 hover:underline font-semibold"
                                  >
                                    + Tambah
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Siswa */}
                            <td className="py-3 px-3 text-center">
                              <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full font-bold text-xs border border-emerald-200">
                                {schoolStudents.length} Siswa
                              </span>
                            </td>

                            {/* Total Akun */}
                            <td className="py-3 px-3 text-center font-bold text-slate-800 text-sm">
                              {allSchoolUsers.length}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-3">
                              {sch.status === 'active' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  Aktif
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                                  Nonaktif
                                </span>
                              )}
                            </td>

                            {/* Aksi */}
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => {
                                  setUserSchoolFilter(sch.id);
                                  setUserViewMode('direktori');
                                }}
                                className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-semibold border border-blue-200 transition"
                              >
                                Lihat Akun Sekolah
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB B: DIREKTORI LENGKAP SELURUH AKUN PENGGUNA */}
            {userViewMode === 'direktori' && (
              <div className="space-y-3">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Cari nama pengguna, email, atau no. telepon..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  {/* Filter Role */}
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-700 bg-white"
                  >
                    <option value="all">Semua Peran (Role)</option>
                    <option value="super_admin">Super Admin Pusat</option>
                    <option value="school_admin">Admin Sekolah</option>
                    <option value="proctor">Proktor / Pengawas</option>
                    <option value="student">Siswa Peserta</option>
                  </select>

                  {/* Filter School */}
                  <select
                    value={userSchoolFilter}
                    onChange={(e) => setUserSchoolFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-700 bg-white max-w-xs truncate"
                  >
                    <option value="all">Semua Satuan Pendidikan</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.npsn})
                      </option>
                    ))}
                  </select>

                  {(userSearchTerm || userRoleFilter !== 'all' || userSchoolFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setUserSearchTerm('');
                        setUserRoleFilter('all');
                        setUserSchoolFilter('all');
                      }}
                      className="px-2.5 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-xs font-semibold"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>

                {/* Directory Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">Nama Lengkap & ID</th>
                        <th className="py-2.5 px-3">Peran / Role</th>
                        <th className="py-2.5 px-3">Satuan Pendidikan</th>
                        <th className="py-2.5 px-3">Email / Username Login</th>
                        <th className="py-2.5 px-3">Nomor Telepon</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProfiles.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            Tidak ditemukan akun pengguna yang sesuai dengan kriteria filter.
                          </td>
                        </tr>
                      ) : (
                        filteredProfiles.map((prof, idx) => (
                          <tr key={prof.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900">{prof.full_name}</div>
                              <div className="text-[10px] font-mono text-slate-400">{prof.id}</div>
                            </td>
                            <td className="py-3 px-3">
                              {prof.role === 'super_admin' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                                  👑 Super Admin
                                </span>
                              )}
                              {prof.role === 'school_admin' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                                  🏫 Admin Sekolah
                                </span>
                              )}
                              {prof.role === 'proctor' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                  🎧 Proktor Ujian
                                </span>
                              )}
                              {prof.role === 'student' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  🎒 Siswa Peserta
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-700">
                              <div className="font-medium">{getSchoolName(prof.school_id)}</div>
                              <div className="text-[10px] font-mono text-slate-400">NPSN: {getSchoolNpsn(prof.school_id)}</div>
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-800 font-semibold">{prof.email}</td>
                            <td className="py-3 px-3 text-slate-600">{prof.phone || '-'}</td>
                            <td className="py-3 px-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Aktif
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => handleResetPassword(prof.email, prof.full_name)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition"
                                title="Reset Kata Sandi Pengguna"
                              >
                                Reset Password
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: DATA PESERTA (Peserta Didik Seluruh Satuan Pendidikan)
         ========================================================================= */}
      {activeSubTab === 'data_peserta' && (
        <div className="space-y-4">
          {/* Top Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Total Peserta Terdaftar</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{students.length}</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Seluruh Satuan Pendidikan</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Peserta Laki-Laki</div>
              <div className="text-2xl font-black text-blue-700 mt-1">
                {students.filter((st) => st.gender === 'L').length}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Siswa</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Peserta Perempuan</div>
              <div className="text-2xl font-black text-pink-700 mt-1">
                {students.filter((st) => st.gender === 'P').length}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Siswi</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Status Keaktifan</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">100%</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Terverifikasi NISN</div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Pangkalan Data Peserta Didik Asesmen Digital
                </h2>
                <p className="text-xs text-slate-500">
                  Daftar seluruh peserta didik dari satuan pendidikan yang berhak mengikuti asesmen SINTESA
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari NISN, nama peserta..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-44 sm:w-56"
                  />
                </div>

                <select
                  value={studentSchoolFilter}
                  onChange={(e) => setStudentSchoolFilter(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-700 bg-white max-w-xs truncate"
                >
                  <option value="all">Semua Sekolah</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <select
                  value={studentGenderFilter}
                  onChange={(e) => setStudentGenderFilter(e.target.value as any)}
                  className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-700 bg-white"
                >
                  <option value="all">Semua Gender</option>
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">NISN & NIS</th>
                    <th className="py-2.5 px-3">Nama Lengkap Peserta</th>
                    <th className="py-2.5 px-3">Satuan Pendidikan</th>
                    <th className="py-2.5 px-3">Kelas / Rombel</th>
                    <th className="py-2.5 px-3 text-center">Gender</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Tidak ada data peserta didik yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st, idx) => (
                      <tr key={st.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-3 font-mono">
                          <div className="font-bold text-blue-700">{st.nisn}</div>
                          <div className="text-[10px] text-slate-400">NIS: {st.nis || '-'}</div>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">{st.full_name}</td>
                        <td className="py-3 px-3 text-slate-700">
                          <div>{getSchoolName(st.school_id)}</div>
                          <div className="text-[10px] font-mono text-slate-400">NPSN: {getSchoolNpsn(st.school_id)}</div>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">{st.class_name || 'Kelas 6'}</td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              st.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                            }`}
                          >
                            {st.gender}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Aktif
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedStudentForCard(st)}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-semibold border border-blue-200 transition inline-flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Kartu Peserta</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: MATA PELAJARAN (Secondary Tab)
         ========================================================================= */}
      {activeSubTab === 'subjects' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Mata Pelajaran Standar Asesmen Digital SD
            </h2>
            <p className="text-xs text-slate-500">
              Daftar mata uji kompetensi berstandar nasional untuk asesmen jenjang sekolah dasar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2 hover:border-blue-300 transition"
              >
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-700">
                  {sub.code}
                </span>
                <div className="font-bold text-slate-900 text-sm">{sub.name}</div>
                <div className="text-[11px] text-slate-500">Jenjang: Kelas {sub.grade_level || 6} SD/MI</div>
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Standar Nasional
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS
         ========================================================================= */}

      {/* MODAL 1: DETAIL SEKOLAH LENGKAP */}
      {selectedSchoolDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedSchoolDetail.name}</h3>
                  <div className="text-[11px] font-mono text-blue-700">NPSN: {selectedSchoolDetail.npsn}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedSchoolDetail(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bentuk & Jenjang:</span>
                  <span className="font-bold text-slate-800 uppercase">
                    {selectedSchoolDetail.education_level} ({selectedSchoolDetail.school_type})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kepala Sekolah:</span>
                  <span className="font-bold text-slate-800">{selectedSchoolDetail.principal_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Alamat:</span>
                  <span className="font-medium text-slate-700 text-right">{selectedSchoolDetail.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kab/Kota & Provinsi:</span>
                  <span className="font-medium text-slate-700">
                    {selectedSchoolDetail.city_regency}, {selectedSchoolDetail.province}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email Resmi:</span>
                  <span className="font-mono text-blue-700">{selectedSchoolDetail.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Operasional:</span>
                  <span
                    className={`font-bold capitalize ${
                      selectedSchoolDetail.status === 'active' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {selectedSchoolDetail.status}
                  </span>
                </div>
              </div>

              {/* Rekap Pengguna Sekolah Ini */}
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/60 space-y-1">
                <div className="font-bold text-blue-900 text-xs mb-1">Rekapitulasi Akun Pengguna Sekolah:</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded-lg border border-blue-100">
                    <div className="text-[10px] text-slate-500 font-semibold">Admin Sekolah</div>
                    <div className="text-sm font-black text-blue-800 mt-0.5">1 Akun</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-blue-100">
                    <div className="text-[10px] text-slate-500 font-semibold">Guru Proktor</div>
                    <div className="text-sm font-black text-amber-800 mt-0.5">
                      {proctors.filter((p) => p.school_id === selectedSchoolDetail.id).length} Guru
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-blue-100">
                    <div className="text-[10px] text-slate-500 font-semibold">Siswa Ujian</div>
                    <div className="text-sm font-black text-emerald-800 mt-0.5">
                      {students.filter((st) => st.school_id === selectedSchoolDetail.id).length} Siswa
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setUserSchoolFilter(selectedSchoolDetail.id);
                  setActiveSubTab('data_pengguna');
                  setUserViewMode('direktori');
                  setSelectedSchoolDetail(null);
                }}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200"
              >
                Lihat Semua Akun Pengguna
              </button>
              <button
                onClick={() => setSelectedSchoolDetail(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TAMBAH SEKOLAH BARU */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateSchool}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-slate-800 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Tambah Satuan Pendidikan (Sekolah Baru)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSchoolModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">NPSN (8 Digit Unik)</label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="Contoh: 20108899"
                    value={newNpsn}
                    onChange={(e) => setNewNpsn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Jenjang & Jenis</label>
                  <div className="flex gap-2">
                    <select
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value as any)}
                      className="w-1/2 px-2 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="SD">SD</option>
                      <option value="MI">MI</option>
                    </select>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-1/2 px-2 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="negeri">Negeri</option>
                      <option value="swasta">Swasta</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Resmi Sekolah</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SDN 12 Menteng Pagi"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  placeholder="Nama beserta gelar lengkap"
                  value={newPrincipal}
                  onChange={(e) => setNewPrincipal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Kota / Kabupaten</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={newProvince}
                    onChange={(e) => setNewProvince(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  placeholder="Jl. Merdeka No. 10..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Email Sekolah / Admin</label>
                  <input
                    type="email"
                    placeholder="admin.sd@jakarta.sch.id"
                    value={newSchoolEmail}
                    onChange={(e) => setNewSchoolEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Nomor Telepon</label>
                  <input
                    type="tel"
                    placeholder="021-3907721"
                    value={newSchoolPhone}
                    onChange={(e) => setNewSchoolPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddSchoolModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Simpan Sekolah Baru
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: TAMBAH PENGGUNA BARU */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateUser}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-slate-800 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Tambah Akun Pengguna Sistem</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Peran Akun (Role)</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="school_admin">Admin Sekolah (Pengelola Satuan Pendidikan)</option>
                  <option value="proctor">Guru Proktor / Pengawas Ujian</option>
                  <option value="student">Siswa Peserta Ujian</option>
                  <option value="super_admin">Super Admin Pusat (Kemdikbud)</option>
                </select>
              </div>

              {newUserRole !== 'super_admin' && (
                <div>
                  <label className="block font-semibold mb-1">Satuan Pendidikan (Sekolah)</label>
                  <select
                    value={newUserSchoolId}
                    onChange={(e) => setNewUserSchoolId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (NPSN: {s.npsn})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Ilham, S.Pd."
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Email / ID Login</label>
                  <input
                    type="email"
                    required
                    placeholder="proktor@sekolah.sch.id"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">NIP / NISN / ID Pegawai</label>
                  <input
                    type="text"
                    placeholder="19850101..."
                    value={newUserNipNisn}
                    onChange={(e) => setNewUserNipNisn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Nomor Telepon / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="08123456789"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Password Awal</label>
                  <input
                    type="text"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Simpan Akun Pengguna
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: CETAK KARTU PESERTA UJIAN */}
      {selectedStudentForCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Kartu Login Peserta Ujian SINTESA</h3>
              </div>
              <button
                onClick={() => setSelectedStudentForCard(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Official Exam Card Mockup */}
            <div className="border-2 border-slate-800 rounded-xl p-4 bg-white space-y-3 font-sans shadow-sm">
              <div className="flex items-center gap-3 border-b-2 border-slate-800 pb-2.5">
                <TutWuriLogo size={42} />
                <div className="text-left">
                  <div className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">
                    KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH
                  </div>
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    KARTU LOGIN ASESMEN & UJIAN BERBASIS KOMPUTER
                  </div>
                  <div className="text-[10px] font-semibold text-blue-700 font-mono">
                    TAHUN AJARAN 2024/2025
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="col-span-2 space-y-1 text-[11px]">
                  <div>
                    <span className="text-slate-500">Nama: </span>
                    <strong className="text-slate-900">{selectedStudentForCard.full_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">NISN: </span>
                    <strong className="font-mono text-blue-800">{selectedStudentForCard.nisn}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Sekolah: </span>
                    <span className="font-medium text-slate-800">
                      {getSchoolName(selectedStudentForCard.school_id)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Kelas / Rombel: </span>
                    <span className="font-medium text-slate-800">
                      {selectedStudentForCard.class_name || 'Kelas 6'}
                    </span>
                  </div>
                  <div className="pt-1 text-[10px] text-slate-500">
                    <div>Username: <strong className="font-mono text-slate-800">{selectedStudentForCard.nisn}</strong></div>
                    <div>Password Default: <strong className="font-mono text-slate-800">password123</strong></div>
                  </div>
                </div>

                <div className="col-span-1 flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <QrCode className="w-14 h-14 text-slate-800" />
                  <span className="text-[9px] font-mono text-slate-500 mt-1">VERIF-VALID</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 text-[9px] text-slate-400 italic text-center">
                Bawalah kartu ini saat memasuki ruang lab asesmen dan jaga kerahasiaan kata sandi Anda.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedStudentForCard(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Kartu Peserta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal mini icon for proctor headphones
const HeadphonesIcon: React.FC<{ className?: string }> = ({ className = 'w-3 h-3' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);
