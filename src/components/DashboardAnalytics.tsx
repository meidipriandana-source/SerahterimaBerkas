import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { DocumentHandover } from "../types";
import { FileText, ShieldAlert, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface DashboardAnalyticsProps {
  documents: DocumentHandover[];
}

export default function DashboardAnalytics({ documents }: DashboardAnalyticsProps) {
  // Compute statistics
  const total = documents.length;
  const pendingAdmin = documents.filter(d => d.status === "pending_admin").length;
  const pendingAtasan = documents.filter(d => d.status === "pending_atasan").length;
  const completed = documents.filter(d => d.status === "completed").length;
  const rejected = documents.filter(d => d.status === "rejected").length;

  // Chart data 1: Status counts for BarChart
  const barData = [
    { name: "Draft/Baru", jumlah: pendingAdmin, color: "#a855f7" }, // Purple
    { name: "Proses Admin", jumlah: pendingAdmin, color: "#6366f1" }, // Indigo
    { name: "Proses Atasan", jumlah: pendingAtasan, color: "#f59e0b" }, // Amber
    { name: "Selesai", jumlah: completed, color: "#10b981" }, // Emerald
    { name: "Ditolak", jumlah: rejected, color: "#ef4444" } // Red
  ];

  // Card items for stats grid
  const stats = [
    {
      title: "Total Berkas",
      value: total,
      icon: FileText,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      desc: "Semua pengajuan berkas masuk"
    },
    {
      title: "Menunggu Admin",
      value: pendingAdmin,
      icon: Clock,
      color: "bg-purple-50 text-purple-600 border-purple-100",
      desc: "Butuh verifikasi & TTD Admin"
    },
    {
      title: "Menunggu Atasan",
      value: pendingAtasan,
      icon: AlertTriangle,
      color: "bg-amber-50 text-amber-600 border-amber-100",
      desc: "Menunggu persetujuan Atasan"
    },
    {
      title: "Selesai (Valid)",
      value: completed,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      desc: "Berkas ditandatangani lengkap"
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn" id="analytics-panel">
      {/* Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              id={`stat-card-${i}`}
              className="p-5 bg-white rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md hover:border-indigo-200/80 duration-300 relative overflow-hidden group"
            >
              {/* Subtle top color bar */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-display">{stat.title}</span>
                <div className={`p-2 rounded-xl border transition-all duration-300 group-hover:scale-110 ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-slate-900 tracking-tight font-display">{stat.value}</span>
                <p className="text-[10px] text-slate-400 font-medium mt-1 leading-normal">{stat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts Grid - Full Width Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider font-display">Distribusi Status Berkas</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Statistik volume berdasarkan alur verifikasi berkas saat ini</p>
          </div>
          <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full font-mono">Real-time</span>
        </div>
        
        <div className="h-64">
          {total === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
              <FileText className="w-8 h-8 text-slate-300" />
              <span>Belum ada data statistik berkas.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: '600' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: '600' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: 11, fontFamily: 'Outfit' }}
                  cursor={{ fill: '#f8fafc', opacity: 0.8 }}
                />
                <Bar dataKey="jumlah" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Security Info & Compliance Alert */}
      <div className="bg-gradient-to-r from-indigo-50/70 to-purple-50/50 rounded-2xl border border-indigo-100/80 p-5 flex items-start gap-4 shadow-3xs">
        <div className="p-2.5 bg-white text-indigo-600 rounded-xl shrink-0 shadow-3xs border border-indigo-100">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-display">Kepatuhan Hukum &amp; Keamanan Digital</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Sistem ini menggunakan tanda tangan elektronik tersertifikasi lokal dengan verifikasi hashing <span className="font-bold text-indigo-700">SHA-256</span> secara langsung. Setiap tanda tangan dikunci secara otomatis setelah persetujuan, mencegah perubahan konten ilegal pada dokumen asli setelah serah terima selesai diproses.
          </p>
        </div>
      </div>
    </div>
  );
}
