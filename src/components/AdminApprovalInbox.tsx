import React, { useState } from "react";
import { DocumentHandover } from "../types";
import { FileText, ClipboardCheck, ArrowRight, User, XOctagon, CheckSquare, ShieldCheck, Mail, Check, Trash, Info, HelpCircle } from "lucide-react";
import SignaturePad from "./SignaturePad";
import SwipeableApprovalItem from "./SwipeableApprovalItem";

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

  // Multi select states
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; mode: "approve" | "reject" | null }>({ current: 0, total: 0, mode: null });

  // Swipe Action states
  const [swipeApproveDoc, setSwipeApproveDoc] = useState<DocumentHandover | null>(null);
  const [swipeRejectDoc, setSwipeRejectDoc] = useState<DocumentHandover | null>(null);
  const [savedAdminSignature, setSavedAdminSignature] = useState<string | null>(() => localStorage.getItem("saved_admin_signature"));
  const [rememberSignature, setRememberSignature] = useState(true);
  const [swipeRejectReason, setSwipeRejectReason] = useState("");

  // Filter only documents waiting for Admin signature
  const pendingDocs = documents.filter((doc) => doc.status === "pending_admin");

  const handleQuickAdminSign = async (doc: DocumentHandover, signatureToUse: string) => {
    if (!signatureToUse) {
      alert("Harap bubuhkan tanda tangan terlebih dahulu!");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}/admin-sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminSignature: signatureToUse })
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan persetujuan Admin");
      }

      if (rememberSignature) {
        localStorage.setItem("saved_admin_signature", signatureToUse);
        setSavedAdminSignature(signatureToUse);
      }

      triggerPushNotification(
        "Verifikasi Admin Berhasil (Quick Approve)",
        `Dokumen '${doc.title}' disetujui cepat oleh Admin & diteruskan ke Atasan: ${doc.supervisorName}.`
      );

      setSwipeApproveDoc(null);
      if (selectedDoc?.id === doc.id) {
        setSelectedDoc(null);
      }
      onActionComplete();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat menyimpan TTD Admin.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickReject = async (doc: DocumentHandover, reason: string) => {
    if (!reason.trim()) {
      alert("Harap isi alasan penolakan!");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "admin",
          actor: "Sistem Admin",
          reason: reason
        })
      });

      if (!res.ok) {
        throw new Error("Gagal menolak berkas");
      }

      triggerPushNotification(
        "Berkas Ditolak Admin (Quick Reject)",
        `Berkas '${doc.title}' ditolak Admin dengan alasan: "${reason}"`
      );

      setSwipeRejectDoc(null);
      setSwipeRejectReason("");
      if (selectedDoc?.id === doc.id) {
        setSelectedDoc(null);
      }
      onActionComplete();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan penolakan berkas.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchApprove = async () => {
    const signatureToUse = savedAdminSignature || adminSignature;
    if (!signatureToUse) {
      alert("Harap bubuhkan atau pilih tanda tangan terlebih dahulu!");
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menyetujui ${selectedIds.length} berkas sekaligus?`)) {
      return;
    }

    setIsProcessing(true);
    setBatchProgress({ current: 0, total: selectedIds.length, mode: "approve" });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selectedIds.length; i++) {
      const docId = selectedIds[i];
      const doc = pendingDocs.find(d => d.id === docId);
      if (!doc) continue;

      setBatchProgress({ current: i + 1, total: selectedIds.length, mode: "approve" });

      try {
        const res = await fetch(`/api/documents/${docId}/admin-sign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminSignature: signatureToUse })
        });

        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error(`Gagal memproses persetujuan berkas ID: ${docId}`, err);
        failCount++;
      }
    }

    setIsProcessing(false);
    setBatchProgress({ current: 0, total: 0, mode: null });

    // Save signature if drawn and set to remember
    if (rememberSignature && adminSignature) {
      localStorage.setItem("saved_admin_signature", adminSignature);
      setSavedAdminSignature(adminSignature);
    }

    triggerPushNotification(
      "Persetujuan Massal Selesai",
      `Berhasil menyetujui ${successCount} berkas.${failCount > 0 ? ` Gagal: ${failCount} berkas.` : ""}`
    );

    setSelectedIds([]);
    setIsMultiSelect(false);
    onActionComplete();
  };

  const handleBatchReject = async () => {
    if (!rejectReason.trim()) {
      alert("Harap isi alasan penolakan!");
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menolak ${selectedIds.length} berkas sekaligus?`)) {
      return;
    }

    setIsProcessing(true);
    setBatchProgress({ current: 0, total: selectedIds.length, mode: "reject" });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selectedIds.length; i++) {
      const docId = selectedIds[i];
      const doc = pendingDocs.find(d => d.id === docId);
      if (!doc) continue;

      setBatchProgress({ current: i + 1, total: selectedIds.length, mode: "reject" });

      try {
        const res = await fetch(`/api/documents/${docId}/reject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "admin",
            actor: "Sistem Admin",
            reason: rejectReason
          })
        });

        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error(`Gagal memproses penolakan berkas ID: ${docId}`, err);
        failCount++;
      }
    }

    setIsProcessing(false);
    setBatchProgress({ current: 0, total: 0, mode: null });
    setRejectReason("");

    triggerPushNotification(
      "Penolakan Massal Selesai",
      `Berhasil menolak ${successCount} berkas.${failCount > 0 ? ` Gagal: ${failCount} berkas.` : ""}`
    );

    setSelectedIds([]);
    setIsMultiSelect(false);
    onActionComplete();
  };


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
      <div className={`lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col h-[500px] ${(isMultiSelect || selectedDoc) ? "hidden lg:flex" : "flex"}`}>
        <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>Antrean Verifikasi Admin</span>
              <span className="bg-indigo-600 dark:bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold text-[10px]">
                {pendingDocs.length} Berkas
              </span>
            </h3>
            {pendingDocs.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsMultiSelect(!isMultiSelect);
                  setSelectedIds([]);
                  setSelectedDoc(null);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                  isMultiSelect
                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400"
                    : "bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                } cursor-pointer`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{isMultiSelect ? "Batal" : "Pilih Banyak"}</span>
              </button>
            )}
          </div>
          {isMultiSelect && pendingDocs.length > 0 && (
            <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 justify-between">
              <button
                type="button"
                onClick={() => {
                  if (selectedIds.length === pendingDocs.length) {
                    setSelectedIds([]);
                  } else {
                    setSelectedIds(pendingDocs.map((doc) => doc.id));
                  }
                }}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {selectedIds.length === pendingDocs.length ? "Batal Pilih Semua" : "Pilih Semua"}
              </button>
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                {selectedIds.length} Terpilih
              </span>
            </div>
          )}
        </div>

        {pendingDocs.length > 0 && !isMultiSelect && (
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-[10px] text-indigo-700 dark:text-indigo-300 shrink-0">
            <Info className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
            <span>💡 <strong>Tip Cepat:</strong> Geser kartu ke <strong>Kanan (Setuju)</strong> atau ke <strong>Kiri (Tolak)</strong> untuk proses kilat.</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-slate-50/30 dark:bg-slate-950/10">
          {pendingDocs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs my-auto">
              <ClipboardCheck className="w-10 h-10 mx-auto text-slate-200 mb-2 stroke-1" />
              <p className="font-bold text-slate-700 dark:text-slate-300">Antrean Bersih!</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Tidak ada pengajuan serah terima berkas digital baru yang perlu diverifikasi.</p>
            </div>
          ) : (
            pendingDocs.map((doc) => {
              const formattedDate = new Date(doc.timestamp).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
              });

              const isChecked = selectedIds.includes(doc.id);

              if (isMultiSelect) {
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      if (isChecked) {
                        setSelectedIds(prev => prev.filter(id => id !== doc.id));
                      } else {
                        setSelectedIds(prev => [...prev, doc.id]);
                      }
                    }}
                    className={`relative p-3.5 rounded-xl border transition-all cursor-pointer select-none my-1.5 flex items-start gap-3 text-left ${
                      isChecked
                        ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-500"
                        : "bg-white dark:bg-slate-900 border-slate-200/85 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(prev => [...prev, doc.id]);
                          } else {
                            setSelectedIds(prev => prev.filter(id => id !== doc.id));
                          }
                        }}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex-1 flex flex-col gap-1 text-left">
                      <div className="flex justify-between items-center text-[9px] text-slate-400 dark:text-slate-500">
                        <span className="font-mono bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold">{doc.verificationCode}</span>
                        <span>{formattedDate}</span>
                      </div>
                      
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{doc.title}</h4>
                      
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-bold">
                          {doc.category}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 font-medium border-t border-dashed border-slate-100 dark:border-slate-800/80 pt-1.5 mt-1.5">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 dark:text-slate-500 w-12 shrink-0">Pengaju:</span> 
                          <span className="text-slate-700 dark:text-slate-300 font-semibold line-clamp-1">{doc.senderName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 dark:text-slate-500 w-12 shrink-0">Atasan:</span> 
                          <span className="text-slate-700 dark:text-slate-300 font-semibold line-clamp-1">{doc.supervisorName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <SwipeableApprovalItem
                  key={doc.id}
                  id={doc.id}
                  onSwipeRight={() => {
                    setSwipeApproveDoc(doc);
                  }}
                  onSwipeLeft={() => {
                    setSwipeRejectDoc(doc);
                    setSwipeRejectReason("");
                  }}
                  onTap={() => {
                    setSelectedDoc(doc);
                    setAdminSignature("");
                    setShowRejectForm(false);
                  }}
                >
                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 dark:text-slate-500">
                      <span className="font-mono bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold">{doc.verificationCode}</span>
                      <span>{formattedDate}</span>
                    </div>
                    
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-indigo-600 transition-colors">{doc.title}</h4>
                    
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-bold">
                        {doc.category}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 font-medium border-t border-dashed border-slate-100 dark:border-slate-800/80 pt-1.5 mt-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 dark:text-slate-500 w-12 shrink-0">Pengaju:</span> 
                        <span className="text-slate-700 dark:text-slate-300 font-semibold line-clamp-1">{doc.senderName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 dark:text-slate-500 w-12 shrink-0">Atasan:</span> 
                        <span className="text-slate-700 dark:text-slate-300 font-semibold line-clamp-1">{doc.supervisorName}</span>
                      </div>
                    </div>
                  </div>
                </SwipeableApprovalItem>
              );
            })
          )}
        </div>
      </div>

      {/* Detail & Action Area */}
      <div className={`lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col min-h-[500px] ${(isMultiSelect || selectedDoc) ? "flex" : "hidden lg:flex"}`}>
        {isMultiSelect ? (
          /* Multi Select Batch Action Panel */
          <div className="p-6 space-y-6 flex-1 overflow-y-auto text-left" id="admin-batch-panel">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-600" />
                <span>Panel Aksi Massal Admin (Batch Action)</span>
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Lakukan verifikasi tanda tangan massal atau penolakan sekaligus untuk beberapa dokumen terpilih.
              </p>
            </div>

            {selectedIds.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 py-16">
                <ClipboardCheck className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-2 stroke-1" />
                <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">Belum Ada Dokumen Terpilih</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-xs mt-1">
                  Harap centang satu atau beberapa dokumen di daftar antrean sebelah kiri untuk memulai aksi persetujuan atau penolakan massal.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Selected documents titles */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                    Daftar Dokumen Terpilih ({selectedIds.length})
                  </span>
                  <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/55 dark:bg-slate-950/20 p-3 space-y-1.5">
                    {pendingDocs.filter(d => selectedIds.includes(d.id)).map((doc, idx) => (
                      <div key={doc.id} className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 py-1 border-b border-slate-100 dark:border-slate-900 last:border-b-0">
                        <span className="truncate pr-4">{idx + 1}. {doc.title}</span>
                        <span className="text-[9px] font-mono bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded shrink-0">
                          {doc.verificationCode}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Batch approval & batch reject sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-800/80 pt-5">
                  {/* Batch Approve Box */}
                  <div className="space-y-4 bg-emerald-50/10 dark:bg-emerald-950/5 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl flex flex-col justify-between">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Check className="w-4 h-4 text-emerald-600" /> 1. Setujui Massal (Batch Approve)
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Seluruh dokumen yang dipilih akan ditandatangani sekaligus menggunakan tanda tangan elektronik Admin Anda.
                      </p>

                      {savedAdminSignature ? (
                        <div className="space-y-2.5 pt-1">
                          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block uppercase">Tanda Tangan Tersimpan Anda:</span>
                          <div className="border border-emerald-200/50 dark:border-emerald-800/50 rounded-xl bg-white dark:bg-slate-950 p-2 flex items-center justify-center relative">
                            <img src={savedAdminSignature} alt="Tanda tangan tersimpan" className="h-16 object-contain" />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 pt-1">
                          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block uppercase">Gambarlah Tanda Tangan Anda:</span>
                          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
                            <SignaturePad
                              onSave={(sig) => {
                                setAdminSignature(sig);
                              }}
                              onClear={() => setAdminSignature("")}
                              placeholder="Tanda tangan massal Anda..."
                              height={100}
                              initialValue={adminSignature}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={handleBatchApprove}
                        disabled={isProcessing || (!savedAdminSignature && !adminSignature)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:cursor-not-allowed shadow-xs"
                      >
                        {isProcessing && batchProgress.mode === "approve" ? (
                          <span>Memproses ({batchProgress.current}/{batchProgress.total})...</span>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Setujui {selectedIds.length} Berkas</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Batch Reject Box */}
                  <div className="space-y-4 bg-rose-50/10 dark:bg-rose-950/5 border border-rose-100 dark:border-rose-900/30 p-4 rounded-xl flex flex-col justify-between">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-rose-800 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <XOctagon className="w-4 h-4 text-rose-600" /> 2. Tolak Massal (Batch Reject)
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Seluruh dokumen terpilih akan ditolak bersamaan dengan satu alasan penolakan yang sama di bawah ini.
                      </p>

                      <div className="space-y-1 pt-1 text-left">
                        <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Alasan Penolakan Bersama <span className="text-red-500">*</span></label>
                        <textarea
                          rows={3}
                          placeholder="Tuliskan alasan penolakan massal..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="w-full text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={handleBatchReject}
                        disabled={isProcessing || !rejectReason.trim()}
                        className="w-full py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:cursor-not-allowed shadow-xs"
                      >
                        {isProcessing && batchProgress.mode === "reject" ? (
                          <span>Memproses ({batchProgress.current}/{batchProgress.total})...</span>
                        ) : (
                          <>
                            <XOctagon className="w-4 h-4" />
                            <span>Tolak {selectedIds.length} Berkas</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : selectedDoc ? (
          <div className="p-6 space-y-5 flex-1 overflow-y-auto" id="admin-doc-details">
            {/* Mobile Back Button */}
            <button 
              onClick={() => setSelectedDoc(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-3 cursor-pointer hover:underline bg-indigo-50/50 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg w-fit transition-all border border-indigo-100"
            >
              ← Kembali ke Antrean (Pindah Halaman)
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
                <div className="sm:col-span-2 border-t border-slate-200/60 pt-3">
                  <span className="text-indigo-600 block font-black text-[9.5px] uppercase tracking-wider mb-2.5">Rincian Berkas yang Diserahkan per Kegiatan ({selectedDoc.items.length})</span>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedDoc.items.map((item, idx) => {
                      const isUnchecked = item.includes(" - Ditangguhkan");
                      const cleanItemName = isUnchecked ? item.replace(" - Ditangguhkan", "") : item;

                      let itemTitle = cleanItemName;
                      let itemCategory = "Umum";
                      let itemDetail = "";

                      const categoryMatch = cleanItemName.match(/^(.+?)\s*\[([^\]]+)\](?:\s*-\s*(.*))?$/);
                      if (categoryMatch) {
                        itemTitle = categoryMatch[1].trim();
                        itemCategory = categoryMatch[2].trim();
                        itemDetail = categoryMatch[3] ? categoryMatch[3].trim() : "";
                      } else {
                        const descIndex = cleanItemName.indexOf(" - ");
                        if (descIndex !== -1) {
                          itemTitle = cleanItemName.substring(0, descIndex).trim();
                          itemDetail = cleanItemName.substring(descIndex + 3).trim();
                        }
                      }

                      return (
                        <div 
                          key={idx} 
                          className={`border rounded-xl p-3.5 shadow-2xs transition-all flex flex-col gap-2 ${
                            isUnchecked 
                              ? 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500' 
                              : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <span className={`text-xs font-bold text-slate-800 dark:text-slate-200 ${isUnchecked ? 'line-through opacity-60' : ''}`}>
                              {idx + 1}. {itemTitle}
                            </span>
                            <span 
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border shrink-0 ${
                                isUnchecked 
                                  ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30' 
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                              }`}
                            >
                              {isUnchecked ? `DITANGGUHKAN (${itemCategory})` : itemCategory}
                            </span>
                          </div>
                          {itemDetail && (
                            <div className={`text-[11px] leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60 text-slate-600 dark:text-slate-300 ${isUnchecked ? 'opacity-50 line-through' : ''}`}>
                              {itemDetail}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                  <span className="text-[10px] font-bold text-slate-700">
                    {selectedDoc.senderName === "Budi Santoso" ? "Budi Santoso, untuk pihak pertama Meidi Priandana" : selectedDoc.senderName}
                  </span>
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
                    type="button"
                    onClick={() => setSelectedDoc(null)}
                    className="px-4 py-2 text-slate-500 hover:bg-slate-100 font-bold rounded-lg border border-slate-200 text-xs transition cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
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

      {/* Quick Approve Swipe Modal */}
      {swipeApproveDoc && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="quick-approve-modal">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Persetujuan Cepat (Admin)</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Tanda tangani berkas tanpa membuka detail</p>
                </div>
              </div>
              <button 
                onClick={() => setSwipeApproveDoc(null)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-xs text-left">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Judul Berkas</span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{swipeApproveDoc.title}</p>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/40 text-[10px] text-slate-500">
                <div><span className="text-slate-400 font-bold">Pengaju:</span> {swipeApproveDoc.senderName}</div>
                <div><span className="text-slate-400 font-bold">Atasan:</span> {swipeApproveDoc.supervisorName}</div>
              </div>
            </div>

            {savedAdminSignature ? (
              <div className="space-y-3 pt-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase text-left">Tanda Tangan Tersimpan Anda:</span>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 p-2 flex items-center justify-center relative">
                  <img src={savedAdminSignature} alt="Tanda tangan tersimpan" className="h-16 object-contain" />
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Apakah Anda yakin ingin menghapus tanda tangan tersimpan?")) {
                        localStorage.removeItem("saved_admin_signature");
                        setSavedAdminSignature(null);
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg transition cursor-pointer"
                    title="Hapus tanda tangan tersimpan"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember-sig-app"
                    checked={rememberSignature}
                    onChange={(e) => setRememberSignature(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-indigo-600"
                  />
                  <label htmlFor="remember-sig-app" className="text-[10px] text-slate-500 dark:text-slate-400 select-none">
                    Gunakan tanda tangan ini untuk persetujuan cepat berikutnya
                  </label>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setSavedAdminSignature(null)}
                    className="px-3.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition font-bold"
                  >
                    Ganti Tanda Tangan
                  </button>
                  <button
                    onClick={() => handleQuickAdminSign(swipeApproveDoc, savedAdminSignature)}
                    disabled={isProcessing}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg transition font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {isProcessing ? "Memproses..." : "Setujui Sekarang"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase text-left">Bubuhkan Tanda Tangan Baru:</span>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white">
                  <SignaturePad
                    onSave={(sig) => {
                      handleQuickAdminSign(swipeApproveDoc, sig);
                    }}
                    placeholder="Gambar tanda tangan Anda di sini..."
                    height={100}
                  />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="remember-sig-app-new"
                    checked={rememberSignature}
                    onChange={(e) => setRememberSignature(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-indigo-600"
                  />
                  <label htmlFor="remember-sig-app-new" className="text-[10px] text-slate-500 dark:text-slate-400 select-none">
                    Simpan tanda tangan ini untuk persetujuan berikutnya
                  </label>
                </div>
                <p className="text-[9px] text-slate-400 text-left">Setelah menggambar tanda tangan Anda, klik tombol Simpan di dalam signature pad untuk menyetujui.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Reject Swipe Modal */}
      {swipeRejectDoc && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="quick-reject-modal">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                  <XOctagon className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Penolakan Cepat (Admin)</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Tuliskan alasan penolakan berkas</p>
                </div>
              </div>
              <button 
                onClick={() => setSwipeRejectDoc(null)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-xs text-left">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Judul Berkas</span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{swipeRejectDoc.title}</p>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Alasan Penolakan <span className="text-red-500">*</span></label>
              <textarea
                required
                rows={3}
                placeholder="Tulis alasan, misal: File pendukung tidak sesuai, lampiran foto buram..."
                value={swipeRejectReason}
                onChange={(e) => setSwipeRejectReason(e.target.value)}
                className="w-full text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-2 focus:outline-hidden focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSwipeRejectDoc(null)}
                className="px-3.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition font-bold"
              >
                Batal
              </button>
              <button
                onClick={() => handleQuickReject(swipeRejectDoc, swipeRejectReason)}
                disabled={isProcessing || !swipeRejectReason.trim()}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition font-bold cursor-pointer disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400"
              >
                {isProcessing ? "Memproses..." : "Kirim Penolakan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
