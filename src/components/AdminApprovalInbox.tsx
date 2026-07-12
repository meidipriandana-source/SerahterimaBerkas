import React, { useState } from "react";
import { DocumentHandover } from "../types";
import { FileText, ClipboardCheck, ArrowRight, User, XOctagon, CheckSquare, ShieldCheck, Mail } from "lucide-react";
import SignaturePad from "./SignaturePad";

interface AdminApprovalInboxProps {
  documents: DocumentHandover[];
  onActionComplete: () => void;
  triggerPushNotification: (title: string, msg: string) => void;
}

export default function AdminApprovalInbox({
  documents,
  onActionComplete,
  triggerPushNotification
}: AdminApprovalInboxProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentHandover | null>(null);
  const [adminSignature, setAdminSignature] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter only documents waiting for Admin signature
  const pendingDocs = documents.filter((doc) => doc.status === "pending_admin");

  const handleAdminSign = async () => {
    if (!selectedDoc) return;
    if (!adminSignature) {
      alert("Harap bubuhkan tanda tangan Admin terlebih dahulu pada signature pad!");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/documents/${selectedDoc.id}/admin-sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminSignature })
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan persetujuan Admin");
      }

      triggerPushNotification(
        "Verifikasi Admin Berhasil",
        `Dokumen '${selectedDoc.title}' berhasil ditandatangani Admin & diteruskan ke Atasan: ${selectedDoc.supervisorName}.`
      );

      // Clear states
      setSelectedDoc(null);
      setAdminSignature("");
      onActionComplete();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat menyimpan TTD Admin.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !rejectReason.trim()) {
      alert("Harap isi alasan penolakan dokumen!");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/documents/${selectedDoc.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "admin",
          actor: "Sistem Admin",
          reason: rejectReason
        })
      });

      if (!res.ok) {
        throw new Error("Gagal menolak berkas");
      }

      triggerPushNotification(
        "Berkas Ditolak Admin",
        `Berkas '${selectedDoc.title}' telah ditolak Admin dengan alasan: "${rejectReason}"`
      );

      setSelectedDoc(null);
      setRejectReason("");
      setShowRejectForm(false);
      onActionComplete();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan penolakan berkas.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="admin-inbox-panel">
      {/* Pending List Area */}
      <div className={`lg:col-span-1 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col h-[500px] ${selectedDoc ? "hidden lg:flex" : "flex"}`}>
        <div className="bg-white text-slate-800 px-4 py-3 border-b border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Antrean Verifikasi Admin</span>
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold text-[10px]">
              {pendingDocs.length} Berkas
            </span>
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {pendingDocs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs my-auto">
              <ClipboardCheck className="w-10 h-10 mx-auto text-slate-200 mb-2 stroke-1" />
              <p className="font-bold text-slate-700">Antrean Bersih!</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Tidak ada pengajuan serah terima berkas digital baru yang perlu diverifikasi.</p>
            </div>
          ) : (
            pendingDocs.map((doc) => {
              const formattedDate = new Date(doc.timestamp).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setAdminSignature("");
                    setShowRejectForm(false);
                  }}
                  id={`admin-doc-item-${doc.id}`}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors flex flex-col gap-1.5 border-l-4 ${
                    selectedDoc?.id === doc.id ? "bg-indigo-50/50 border-indigo-600" : "border-transparent"
                  }`}
                >
                  <div className="flex justify-between items-center text-[9px] text-slate-400">
                    <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">{doc.verificationCode}</span>
                    <span>{formattedDate}</span>
                  </div>
                  
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{doc.title}</h4>
                  
                  <div className="text-[10px] text-slate-500 space-y-0.5 font-medium">
                    <div><span className="text-slate-400">Pengaju:</span> {doc.senderName}</div>
                    <div><span className="text-slate-400">Atasan:</span> {doc.supervisorName}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail & Action Area */}
      <div className={`lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col min-h-[500px] ${!selectedDoc ? "hidden lg:flex" : "flex"}`}>
        {selectedDoc ? (
          <div className="p-6 space-y-5 flex-1 overflow-y-auto" id="admin-doc-details">
            {/* Mobile Back Button */}
            <button 
              onClick={() => setSelectedDoc(null)}
              className="lg:hidden flex items-center gap-1 text-xs font-bold text-indigo-600 mb-3 cursor-pointer hover:underline"
            >
              ← Kembali ke Antrean
            </button>
            
            {/* Title / Header */}
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">{selectedDoc.title}</h3>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">
                  Menunggu TTD Admin &amp; Routing
                </span>
              </div>
              <div className="text-right text-xs">
                <span className="text-slate-400 block text-[10px] uppercase">Kode Verifikasi SHA</span>
                <span className="font-mono font-bold text-indigo-600">{selectedDoc.verificationCode}</span>
              </div>
            </div>

            {/* Document Details Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 rounded-lg p-4 border border-slate-200/60">
              <div>
                <span className="text-slate-400 block font-bold text-[9px] uppercase">Kategori Berkas</span>
                <span className="font-semibold text-slate-800">{selectedDoc.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-[9px] uppercase">Diajukan Pada</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedDoc.timestamp).toLocaleString("id-ID")}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-[9px] uppercase">Pengaju (Pihak Pertama)</span>
                <span className="font-semibold text-slate-800">{selectedDoc.senderName} ({selectedDoc.senderEmail})</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-[9px] uppercase">Penerima</span>
                <span className="font-semibold text-slate-800">{selectedDoc.recipientName} ({selectedDoc.recipientEmail})</span>
              </div>
              <div className="sm:col-span-2 border-t border-slate-200/60 pt-2">
                <span className="text-slate-400 block font-bold text-[9px] uppercase">Deskripsi / Detail Berkas</span>
                <p className="text-slate-700 leading-relaxed font-sans mt-0.5">{selectedDoc.description}</p>
              </div>
              {selectedDoc.items && selectedDoc.items.length > 0 && (
                <div className="sm:col-span-2 border-t border-slate-200/60 pt-2.5">
                  <span className="text-indigo-600 block font-black text-[9px] uppercase tracking-wide mb-1.5">Rincian Berkas yang Diserahkan ({selectedDoc.items.length})</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDoc.items.map((item, idx) => (
                      <div key={idx} className="bg-white border border-slate-200/80 rounded-md px-2.5 py-1.5 text-xs text-slate-700 font-semibold shadow-3xs">
                        {idx + 1}. {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Verification Steps Chain */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Alur Validasi Tanda Tangan Elektronik:
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Staff Signed */}
                <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2 flex flex-col items-center text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tanda Tangan Pengaju (Staff)</span>
                  <div className="border border-slate-100 rounded-md bg-slate-50 p-1 w-full flex items-center justify-center">
                    <img src={selectedDoc.senderSignature} alt="TTD Staff" className="h-14 max-w-[150px] object-contain" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700">{selectedDoc.senderName}</span>
                </div>

                {/* Process Finalization info */}
                <div className="border border-emerald-100 rounded-lg p-3 bg-emerald-50/30 flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Penyelesaian Berkas</span>
                  <div className="my-2 text-xs font-bold text-slate-800">
                    Selesai &amp; Arsipkan Otomatis
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Setelah Admin menandatangani berkas, alur akan selesai secara real-time. PDF akan terunggah otomatis ke Google Drive dan laporan terkirim.
                  </p>
                </div>
              </div>
            </div>

            {/* Action TTD Admin Pad */}
            {!showRejectForm ? (
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  Bubuhkan Tanda Tangan Admin <span className="text-red-500 ml-0.5">*</span>
                </h4>
                <p className="text-[10px] text-slate-400">Sebagai admin, Anda harus menandatangani berkas ini sebelum menyelesaikan berkas.</p>
                
                <SignaturePad
                  onSave={setAdminSignature}
                  onClear={() => setAdminSignature("")}
                  placeholder="Gambar tanda tangan Admin di sini..."
                  height={120}
                  initialValue={adminSignature}
                />

                <div className="flex gap-2 justify-end pt-3">
                  <button
                    onClick={() => setShowRejectForm(true)}
                    id="btn-admin-show-reject"
                    className="px-4 py-2 text-red-600 hover:bg-red-50 font-bold rounded-lg border border-red-200 text-xs transition cursor-pointer"
                  >
                    Tolak Berkas
                  </button>
                  <button
                    onClick={handleAdminSign}
                    disabled={isProcessing || !adminSignature}
                    id="btn-admin-submit-sign"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition cursor-pointer shadow-xs disabled:cursor-not-allowed"
                  >
                    Setujui &amp; Selesaikan <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Reject Form Area */
              <form onSubmit={handleReject} className="border-t border-red-100 pt-5 space-y-3 bg-red-50/20 p-4 rounded-xl border border-red-100">
                <h4 className="text-xs font-bold text-red-700 flex items-center gap-1">
                  <XOctagon className="w-4 h-4" /> Form Penolakan Berkas Serah Terima
                </h4>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Tuliskan Alasan Penolakan Berkas <span className="text-red-500 ml-0.5">*</span></label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Contoh: Deskripsi berkas kurang jelas, foto atau nomor seri inventaris tidak dicantumkan..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    id="admin-reject-reason-input"
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-hidden focus:ring-1 focus:ring-red-500 bg-white"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(false)}
                    id="btn-admin-cancel-reject"
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-lg border border-slate-200 text-xs transition cursor-pointer"
                  >
                    Kembali ke TTD
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || !rejectReason.trim()}
                    id="btn-admin-submit-reject"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-sm"
                  >
                    Kirim Penolakan (Reject)
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-6">
            <ClipboardCheck className="w-12 h-12 text-slate-200 mb-2 stroke-1" />
            <p className="font-bold text-slate-700 text-xs">Pilih Berkas Masuk dari Antrean</p>
            <p className="text-[10px] text-slate-400 max-w-sm mt-1">
              Sebagai Admin, Anda wajib memeriksa kelengkapan pengajuan serah terima, membubuhkan tanda tangan verifikasi Anda, lalu meneruskannya ke Atasan yang bersangkutan untuk persetujuan akhir.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
