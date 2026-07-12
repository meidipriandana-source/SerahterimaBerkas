import React from "react";
import { Table, Download, RefreshCw, Eye, Search, Database, Pencil, Trash2, X, Plus, Check } from "lucide-react";
import { DocumentHandover } from "../types";
import { motion } from "motion/react";

interface SheetsLiveViewProps {
  documents: DocumentHandover[];
  onRefresh: () => void;
  isLoading: boolean;
}

export default function SheetsLiveView({ documents, onRefresh, isLoading }: SheetsLiveViewProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Edit and Delete states
  const [editingDoc, setEditingDoc] = React.useState<DocumentHandover | null>(null);
  const [deletingDoc, setDeletingDoc] = React.useState<DocumentHandover | null>(null);

  // Edit fields
  const [editTitle, setEditTitle] = React.useState("");
  const [editCategory, setEditCategory] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [editSenderName, setEditSenderName] = React.useState("");
  const [editSenderEmail, setEditSenderEmail] = React.useState("");
  const [editRecipientName, setEditRecipientName] = React.useState("");
  const [editRecipientEmail, setEditRecipientEmail] = React.useState("");
  const [editSupervisorName, setEditSupervisorName] = React.useState("");
  const [editSupervisorEmail, setEditSupervisorEmail] = React.useState("");
  const [editStatus, setEditStatus] = React.useState<DocumentHandover["status"]>("pending_admin");
  const [editItems, setEditItems] = React.useState<string[]>([]);
  const [newItemText, setNewItemText] = React.useState("");

  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleStartEdit = (doc: DocumentHandover) => {
    setEditingDoc(doc);
    setEditTitle(doc.title);
    setEditCategory(doc.category);
    setEditDescription(doc.description);
    setEditSenderName(doc.senderName);
    setEditSenderEmail(doc.senderEmail);
    setEditRecipientName(doc.recipientName);
    setEditRecipientEmail(doc.recipientEmail);
    setEditSupervisorName(doc.supervisorName);
    setEditSupervisorEmail(doc.supervisorEmail);
    setEditStatus(doc.status);
    setEditItems(doc.items || []);
    setNewItemText("");
  };

  const handleAddItem = () => {
    if (newItemText.trim()) {
      setEditItems([...editItems, newItemText.trim()]);
      setNewItemText("");
    }
  };

  const handleRemoveItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/documents/${editingDoc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          category: editCategory,
          description: editDescription,
          senderName: editSenderName,
          senderEmail: editSenderEmail,
          recipientName: editRecipientName,
          recipientEmail: editRecipientEmail,
          supervisorName: editSupervisorName,
          supervisorEmail: editSupervisorEmail,
          status: editStatus,
          items: editItems
        })
      });
      if (response.ok) {
        setEditingDoc(null);
        onRefresh();
      } else {
        alert("Gagal memperbarui berkas");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan berkas");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartDelete = (doc: DocumentHandover) => {
    setDeletingDoc(doc);
  };

  const handleExecuteDelete = async () => {
    if (!deletingDoc) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/documents/${deletingDoc.id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setDeletingDoc(null);
        onRefresh();
      } else {
        alert("Gagal menghapus berkas");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus berkas");
    } finally {
      setIsDeleting(false);
    }
  };

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
        <table className="w-full text-left border-collapse" style={{ minWidth: "1100px" }}>
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
              <th className="px-4 py-2.5 border-r border-slate-200 text-center">Status</th>
              <th className="px-4 py-2.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono text-[11px] text-slate-600">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-8 text-slate-400 bg-slate-50/50">
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
                  <td className="px-4 py-2.5 border-r border-slate-200 text-center font-sans">
                    <motion.span
                      key={doc.status}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 350, damping: 15 }}
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ring-1 ring-offset-0 ${
                        doc.status === "completed" 
                          ? "bg-emerald-100 text-emerald-800 ring-emerald-300/30"
                          : doc.status === "rejected"
                          ? "bg-red-100 text-red-800 ring-red-300/30"
                          : doc.status === "pending_atasan"
                          ? "bg-amber-100 text-amber-800 ring-amber-300/30"
                          : "bg-indigo-100 text-indigo-800 ring-indigo-300/30"
                      }`}
                    >
                      {doc.status === "completed" 
                        ? "Selesai"
                        : doc.status === "rejected"
                        ? "Ditolak"
                        : doc.status === "pending_atasan"
                        ? "Proses Atasan"
                        : "Proses Admin"}
                    </motion.span>
                  </td>
                  <td className="px-4 py-2.5 text-center font-sans">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleStartEdit(doc)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition border border-slate-200 hover:border-indigo-200 cursor-pointer"
                        title="Edit Berkas"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStartDelete(doc)}
                        className="p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition border border-slate-200 hover:border-red-200 cursor-pointer"
                        title="Hapus Berkas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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

      {/* Edit Document Modal Overlay */}
      {editingDoc && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="edit-doc-overlay">
          <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-slate-50 text-slate-800 px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Pencil className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide">Edit Data Serah Terima</h4>
                  <p className="text-[10px] text-slate-400">Ubah informasi berkas {editingDoc.verificationCode} secara manual</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingDoc(null)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Content Form */}
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Judul Berkas */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Judul Berkas</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800 font-semibold"
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kategori</label>
                  <input
                    type="text"
                    required
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status Berkas</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800"
                  >
                    <option value="pending_admin">Proses Admin (Pending Admin)</option>
                    <option value="pending_atasan">Proses Atasan (Pending Atasan)</option>
                    <option value="completed">Selesai (Completed)</option>
                    <option value="rejected">Ditolak (Rejected)</option>
                  </select>
                </div>

                {/* Deskripsi */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deskripsi / Detail</label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800"
                  />
                </div>

                {/* Pengaju */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Pengaju (Pihak Pertama)</label>
                  <input
                    type="text"
                    required
                    value={editSenderName}
                    onChange={(e) => setEditSenderName(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800"
                  />
                </div>

                {/* Email Pengaju */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Pengaju</label>
                  <input
                    type="email"
                    required
                    value={editSenderEmail}
                    onChange={(e) => setEditSenderEmail(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800"
                  />
                </div>

                {/* Penerima */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Penerima</label>
                  <input
                    type="text"
                    required
                    value={editRecipientName}
                    onChange={(e) => setEditRecipientName(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800"
                  />
                </div>

                {/* Email Penerima */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Penerima</label>
                  <input
                    type="email"
                    required
                    value={editRecipientEmail}
                    onChange={(e) => setEditRecipientEmail(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800"
                  />
                </div>

                {/* Atasan Penyetuju */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Atasan Penyetuju</label>
                  <input
                    type="text"
                    required
                    value={editSupervisorName}
                    onChange={(e) => setEditSupervisorName(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800"
                  />
                </div>

                {/* Email Atasan */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Atasan</label>
                  <input
                    type="email"
                    required
                    value={editSupervisorEmail}
                    onChange={(e) => setEditSupervisorEmail(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Daftar Rincian Barang / Berkas</label>
                
                {/* Item input */}
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    placeholder="Contoh: Unit Macbook Pro, Charger 96W..."
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center gap-1 transition text-[11px] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah
                  </button>
                </div>

                {/* Items list rendering */}
                {editItems.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic py-1 text-center">Belum ada rincian barang yang ditambahkan.</p>
                ) : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {editItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-2.5 py-1.5 shadow-2xs">
                        <span className="text-[11px] text-slate-700 font-medium">{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded-md transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>

            {/* Footer Buttons */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-4 py-2 border border-slate-200 rounded-lg transition text-[11px] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg transition text-[11px] flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Document Confirmation Modal */}
      {deletingDoc && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="delete-doc-overlay">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            {/* Header */}
            <div className="bg-red-50 text-slate-800 px-5 py-4 border-b border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-5 h-5 text-red-600" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-red-800">Konfirmasi Hapus Berkas</h4>
                  <p className="text-[10px] text-red-500/80">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
              <button 
                onClick={() => setDeletingDoc(null)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-5 text-xs text-slate-600 space-y-3">
              <p>Apakah Anda yakin ingin menghapus berkas serah terima ini secara permanen dari database?</p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-sans">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Kode Berkas (ID)</div>
                <div className="font-mono text-xs font-bold text-indigo-600 mb-2">{deletingDoc.verificationCode}</div>
                
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Judul Berkas</div>
                <div className="text-xs text-slate-800 font-semibold mb-1">{deletingDoc.title}</div>
                <div className="text-[10px] text-slate-400 line-clamp-2">{deletingDoc.description}</div>
              </div>

              <p className="text-[10px] text-slate-400">Menghapus baris ini akan memutuskan tautan di live Google Sheets dan menghapus riwayat aktivitas terkait.</p>
            </div>

            {/* Footer Buttons */}
            <div className="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingDoc(null)}
                className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-4 py-2 border border-slate-200 rounded-lg transition text-[11px] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg transition text-[11px] flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
