import React from "react";
import { Table, Download, RefreshCw, Eye, Search, Database } from "lucide-react";
import { DocumentHandover } from "../types";

interface SheetsLiveViewProps {
  documents: DocumentHandover[];
  onRefresh: () => void;
  isLoading: boolean;
}

export default function SheetsLiveView({ documents, onRefresh, isLoading }: SheetsLiveViewProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.verificationCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs" id="sheets-live-view">
      {/* Google Sheets Header Mockup */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              Database_Serah_Terima.xlsx 
              <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded-full font-bold">Google Sheets</span>
            </h3>
            <p className="text-[10px] text-slate-400">Basis data tersinkronisasi otomatis setiap kali ada pembaruan status berkas.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari baris..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="sheet-search-input"
              className="text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 w-44 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white"
            />
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            id="btn-refresh-sheets"
            className="p-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 transition disabled:opacity-50 cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" style={{ minWidth: "900px" }}>
          <thead>
            <tr className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <th className="px-3 py-2.5 border-r border-slate-200 w-10 text-center">No</th>
              <th className="px-4 py-2.5 border-r border-slate-200">Kode Berkas (ID)</th>
              <th className="px-4 py-2.5 border-r border-slate-200">Judul Berkas / Deskripsi</th>
              <th className="px-4 py-2.5 border-r border-slate-200">Kategori</th>
              <th className="px-4 py-2.5 border-r border-slate-200">Pengaju (Staff)</th>
              <th className="px-4 py-2.5 border-r border-slate-200">Penerima</th>
              <th className="px-4 py-2.5 border-r border-slate-200">Atasan Penyetuju</th>
              <th className="px-4 py-2.5 border-r border-slate-200">TTD Admin</th>
              <th className="px-4 py-2.5 border-r border-slate-200">TTD Atasan</th>
              <th className="px-4 py-2.5 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono text-[11px] text-slate-600">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-slate-400 bg-slate-50/50">
                  Tidak ada data baris database yang sesuai.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc, idx) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                   <td className="px-3 py-2.5 border-r border-slate-200 text-center bg-slate-50 text-slate-400 font-bold">{idx + 1}</td>
                  <td className="px-4 py-2.5 border-r border-slate-200 font-bold text-indigo-600">{doc.verificationCode}</td>
                  <td className="px-4 py-2.5 border-r border-slate-200 font-sans">
                    <span className="font-bold text-slate-800 block text-xs">{doc.title}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{doc.description}</span>
                  </td>
                  <td className="px-4 py-2.5 border-r border-slate-200 font-sans text-[11px]">{doc.category}</td>
                  <td className="px-4 py-2.5 border-r border-slate-200 font-sans">
                    <div className="font-semibold text-slate-700">{doc.senderName}</div>
                    <div className="text-[9px] text-slate-400">{doc.senderEmail}</div>
                  </td>
                  <td className="px-4 py-2.5 border-r border-slate-200 font-sans">
                    <div className="font-semibold text-slate-700">{doc.recipientName}</div>
                    <div className="text-[9px] text-slate-400">{doc.recipientEmail}</div>
                  </td>
                  <td className="px-4 py-2.5 border-r border-slate-200 font-sans text-xs font-semibold text-slate-700">{doc.supervisorName}</td>
                  <td className="px-4 py-2.5 border-r border-slate-200 text-center">
                    {doc.adminSignature ? (
                      <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">SIGNED</span>
                    ) : (
                      <span className="text-slate-400">PENDING</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 border-r border-slate-200 text-center">
                    {doc.supervisorSignature ? (
                      <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">SIGNED</span>
                    ) : (
                      <span className="text-slate-400">PENDING</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center font-sans">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      doc.status === "completed" 
                        ? "bg-emerald-100 text-emerald-800"
                        : doc.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : doc.status === "pending_atasan"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-indigo-100 text-indigo-800"
                    }`}>
                      {doc.status === "completed" 
                        ? "Selesai"
                        : doc.status === "rejected"
                        ? "Ditolak"
                        : doc.status === "pending_atasan"
                        ? "Proses Atasan"
                        : "Proses Admin"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Spreadsheet Status Bar */}
      <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <div>Menampilkan {filteredDocs.length} baris data tersinkronisasi.</div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span>Google Sheets Database Active</span>
        </div>
      </div>
    </div>
  );
}
