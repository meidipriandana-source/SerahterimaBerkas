import React from "react";
import { User, Shield, UserCheck, AlertCircle } from "lucide-react";
import { UserRole } from "../types";

interface RoleSelectorProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function RoleSelector({ currentRole, onRoleChange }: RoleSelectorProps) {
  const roles = [
    {
      id: "staff" as UserRole,
      title: "Staff Pengaju",
      icon: User,
      color: "border-indigo-500 bg-indigo-50 text-indigo-700",
      activeColor: "ring-2 ring-indigo-500 bg-indigo-600 text-white border-indigo-600",
      desc: "Membuat pengajuan serah terima, mengunggah berkas, menandatanganinya, & mengirimkannya ke Admin."
    },
    {
      id: "admin" as UserRole,
      title: "Sistem Admin",
      icon: Shield,
      color: "border-purple-500 bg-purple-50 text-purple-700",
      activeColor: "ring-2 ring-purple-500 bg-purple-600 text-white border-purple-600",
      desc: "Memverifikasi berkas masuk, menandatanganinya, & merampungkan alur serah terima berkas (Selesai)."
    },
    {
      id: "atasan" as UserRole,
      title: "Atasan Penyetuju",
      icon: UserCheck,
      color: "border-emerald-500 bg-emerald-50 text-emerald-700",
      activeColor: "ring-2 ring-emerald-500 bg-emerald-600 text-white border-emerald-600",
      desc: "Meninjau pengajuan berkas, menandatangani persetujuan akhir (sebagai Sekretaris Wadir / Sekretaris Direktur), & menyelesaikan alur kerja."
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 mb-6 animate-fadeIn" id="role-selector-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-black tracking-wider text-indigo-600 font-display uppercase flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Hak Akses & Alur Kerja
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Gunakan pengalih peran di bawah ini untuk menguji siklus serah terima berkas secara interaktif.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {roles.map((role) => {
            const Icon = role.icon;
            const isActive = currentRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => onRoleChange(role.id)}
                id={`role-btn-${role.id}`}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? role.id === "admin"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-md shadow-purple-600/25 scale-[1.02] ring-2 ring-purple-600/10"
                      : role.id === "atasan"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent shadow-md shadow-emerald-600/25 scale-[1.02] ring-2 ring-emerald-600/10"
                        : "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white border-transparent shadow-md shadow-indigo-600/25 scale-[1.02] ring-2 ring-indigo-600/10"
                    : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'rotate-12 scale-110' : ''}`} />
                <span>{role.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 bg-slate-50 border-l-4 border-indigo-500 p-3.5 rounded-r-xl flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <span className="font-extrabold text-slate-800 font-display">Panduan Peran Aktif: </span>
          {roles.find((r) => r.id === currentRole)?.desc}
        </div>
      </div>
    </div>
  );
}
