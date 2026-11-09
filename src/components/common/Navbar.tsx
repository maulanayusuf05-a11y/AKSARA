import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/database';
import {
  GraduationCap,
  Building2,
  Shield,
  UserCheck,
  BookOpen,
  LogOut,
  ChevronDown,
  User,
  School as SchoolIcon,
  RefreshCw,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, currentSchool, role, logout, switchRoleForDemo, allSchools } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);

  const getRoleBadge = (r: UserRole | null) => {
    switch (r) {
      case 'super_admin':
        return { label: 'Super Admin Pusat', bg: 'bg-purple-100 text-purple-700 border-purple-200', icon: Shield };
      case 'school_admin':
        return { label: 'Admin Sekolah', bg: 'bg-blue-100 text-blue-700 border-blue-200', icon: Building2 };
      case 'proctor':
        return { label: 'Proktor / Pengawas', bg: 'bg-amber-100 text-amber-700 border-amber-200', icon: UserCheck };
      case 'student':
        return { label: 'Peserta Ujian (Siswa)', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: GraduationCap };
      default:
        return { label: 'Pengguna', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: User };
    }
  };

  const currentRoleBadge = getRoleBadge(role);
  const RoleIcon = currentRoleBadge.icon;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & School Context */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-sm font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  AKSARA<span className="text-blue-600 font-bold ml-1">CBT</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                  Multi-Tenant
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                Asesmen dan Kompetensi Siswa Terarah
              </p>
            </div>
          </div>

          {/* School Badge Info */}
          <div className="hidden lg:flex items-center border-l border-slate-200 pl-4 ml-1">
            {currentSchool ? (
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                  <SchoolIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {currentSchool.name}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span>NPSN: <span className="font-mono text-slate-700 font-medium">{currentSchool.npsn}</span></span>
                    <span>•</span>
                    <span className="capitalize">{currentSchool.school_type}</span>
                    <span>•</span>
                    <span>{currentSchool.city_regency}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    Pusat Pengendali Nasional
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Kementerian Pendidikan Dasar & Menengah RI
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions: Role Switcher Demo + User Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Switch Role Demo Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                setShowSchoolDropdown(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition"
              title="Ganti Peran Pengguna untuk menguji tampilan masing-masing peran"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Uji Peran:</span>
              <span className="font-bold text-slate-900">{currentRoleBadge.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Beralih Hak Akses (4 Peran)
                </div>
                <button
                  onClick={() => {
                    switchRoleForDemo('super_admin');
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-slate-50 transition ${
                    role === 'super_admin' ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700'
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-medium">Super Admin Pusat</div>
                    <div className="text-[10px] text-slate-500">Kendali seluruh sekolah & audit log</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchRoleForDemo('school_admin', currentSchool?.id || allSchools[0]?.id);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-slate-50 transition ${
                    role === 'school_admin' ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Admin Sekolah</div>
                    <div className="text-[10px] text-slate-500">Kelola kelas, bank soal, jadwal ujian</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchRoleForDemo('proctor', currentSchool?.id || allSchools[0]?.id);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-slate-50 transition ${
                    role === 'proctor' ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-medium">Proktor / Pengawas</div>
                    <div className="text-[10px] text-slate-500">Pengawasan real-time, token & kendala</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchRoleForDemo('student', currentSchool?.id || allSchools[0]?.id);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-slate-50 transition ${
                    role === 'student' ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-medium">Peserta Didik (Siswa SD)</div>
                    <div className="text-[10px] text-slate-500">Ruang ujian, token & lembar jawaban</div>
                  </div>
                </button>

                {allSchools.length > 1 && (
                  <>
                    <div className="border-t border-slate-100 my-1"></div>
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Uji Isolasi Tenant Sekolah
                    </div>
                    {allSchools.map((sch) => (
                      <button
                        key={sch.id}
                        onClick={() => {
                          switchRoleForDemo('school_admin', sch.id);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-slate-50 ${
                          currentSchool?.id === sch.id ? 'text-blue-600 font-semibold' : 'text-slate-600'
                        }`}
                      >
                        <SchoolIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{sch.name}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* User Info & Avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[150px]">
                {user?.full_name || 'Pengguna'}
              </div>
              <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                {user?.email || ''}
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Keluar dari Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
