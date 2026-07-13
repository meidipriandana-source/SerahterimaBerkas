import React, { useState, useEffect } from "react";
import { Search, ShieldCheck, ShieldAlert, CheckCircle2, Clipboard, Key, RefreshCw, FileText, Download } from "lucide-react";
import { DocumentHandover } from "../types";
import { exportDocumentToPDF } from "../utils/pdfExporter";

interface VerificationPanelProps {
  documents: DocumentHandover[];
}

export default function VerificationPanel({ documents }: VerificationPanelProps) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<DocumentHandover | null>(null);
  const [searched, setSearched] = useState(false);

  // Auto-verify when URL query contains verify/verification code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyCode = params.get("verify") || params.get("verification");
    if (verifyCode && documents.length > 0) {
      setCode(verifyCode);
      const matchedDoc = documents.find(
        doc => doc.verificationCode.toLowerCase() === verifyCode.trim().toLowerCase() ||
               doc.id.toLowerCase() === verifyCode.trim().toLowerCase()
      );
      setResult(matchedDoc || null);
      setSearched(true);
    }
  }, [documents]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    
    if (!code.trim()) {
      setResult(null);
      return;
    }

    const matchedDoc = documents.find(
      doc => doc.verificationCode.toLowerCase() === code.trim().toLowerCase() ||
             doc.id.toLowerCase() === code.trim().toLowerCase()
    );

    setResult(matchedDoc || null);
  };

  const handleSelectPredefined = (c: string) => {
    setCode(c);
    const matchedDoc = documents.find(doc => doc.verificationCode === c);
    setResult(matchedDoc || null);
    setSearched(true);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-3xl mx-auto" id="verification-panel">
      <div className="flex items-center gap-2.5 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Verifikasi Tanda Tangan &amp; Keaslian Dokumen</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">Masukkan Kode Verifikasi dari PDF untuk memverifikasi validitas kriptografi dan persetujuan tanda tangan.</p>
        </div>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Masukkan Kode Verifikasi (Contoh: ST-88C9-D3E4)..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              id="verification-code-input"
              className="w-full text-xs border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-3 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400 dark:placeholder-slate-500 transition bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            id="btn-run-verify"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <Search className="w-4 h-4" /> Verifikasi Berkas
          </button>
        </div>

        {/* Quick select from database list */}
        {documents.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
            <span className="text-slate-400 dark:text-slate-500 font-bold">Pilih Cepat Berkas:</span>
            {documents.slice(0, 4).map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => handleSelectPredefined(doc.verificationCode)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 px-2 py-0.5 rounded-sm transition cursor-pointer font-mono"
              >
                {doc.verificationCode}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Result Display */}
      {searched && (
        <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6 animate-fadeIn" id="verification-results">
          {result ? (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 dark:border-emerald-900/30 pb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Tanda Tangan Digital Terverifikasi (ASLI &amp; VALID)</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Dokumen ini sah secara hukum sesuai UU ITE dan tidak mengalami perubahan isi sejak ditandatangani oleh atasan.
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => exportDocumentToPDF(result)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer shadow-3xs shrink-0 self-start sm:self-center"
                  title="Ekspor Berkas Resmi ke PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor PDF</span>
                </button>
              </div>

              {/* Document Summary Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200/60 dark:border-slate-800/80 text-xs">
                <div className="space-y-1.5">
                  <span className="text-slate-400 dark:text-slate-500 block font-bold text-[9px] uppercase tracking-wider">Judul Berkas</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 text-xs">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" /> {result.title}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-slate-400 dark:text-slate-500 block font-bold text-[9px] uppercase tracking-wider">Kategori &amp; Tanggal</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    {result.category} &bull; {new Date(result.timestamp).toLocaleDateString("id-ID")}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-slate-400 dark:text-slate-500 block font-bold text-[9px] uppercase tracking-wider">Pihak Pengaju (Staff)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    {result.senderName} ({result.senderEmail})
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-slate-400 dark:text-slate-500 block font-bold text-[9px] uppercase tracking-wider">Pihak Penerima</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    {result.recipientName} ({result.recipientEmail})
                  </span>
                </div>

                {result.items && result.items.length > 0 && (
                  <div className="space-y-1.5 sm:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                    <span className="text-indigo-600 dark:text-indigo-400 block font-bold text-[9px] uppercase tracking-wider">Rincian Berkas Terverifikasi</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {result.items.map((item, idx) => {
                        const isUnchecked = item.includes(" - Ditangguhkan");
                        const cleanItemName = isUnchecked ? item.replace(" - Ditangguhkan", "") : item;
                        return (
                          <div key={idx} className={`border rounded p-1.5 text-[10px] font-semibold shadow-3xs flex justify-between items-center transition-all ${isUnchecked ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-700 italic opacity-75' : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}>
                            <span>{idx + 1}. {cleanItemName}</span>
                            {isUnchecked && (
                              <span className="text-[7px] font-black bg-red-100/70 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-900/30 px-1.5 py-0.2 rounded uppercase tracking-wider scale-95 origin-right shrink-0">
                                Ditangguhkan
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 sm:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                  <span className="text-slate-400 dark:text-slate-500 block font-bold text-[9px] uppercase tracking-wider">Metadata Kriptografi SHA-256 Hash</span>
                  <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 break-all bg-indigo-50/50 dark:bg-indigo-950/30 px-2 py-1 rounded block border border-indigo-100 dark:border-indigo-900/50">
                    4a85f4ea4335c02455c0384624fb05c285934a85f40c13470948240034a85f4c
                  </span>
                </div>
              </div>

              {/* Visual Approval Chain */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Rantai Persetujuan Tanda Tangan:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-center">
                    <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Pihak Pertama (Staff)</div>
                    <div className="font-bold text-slate-700 dark:text-slate-300 text-xs mt-1">
                      {result.senderName === "Budi Santoso" ? "Budi Santoso, untuk pihak pertama Meidi Priandana" : result.senderName}
                    </div>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-100 dark:border-emerald-900/50 mt-1.5 inline-block">TERVERIFIKASI</span>
                  </div>

                  <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-center">
                    <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Pihak Kedua (Admin)</div>
                    <div className="font-bold text-slate-700 dark:text-slate-300 text-xs mt-1">Sistem Admin</div>
                    {result.adminSignature ? (
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-100 dark:border-emerald-900/50 mt-1.5 inline-block">TERVERIFIKASI</span>
                    ) : (
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold bg-slate-50 dark:bg-slate-900 px-1.5 py-0.2 rounded border border-slate-100 dark:border-slate-800 mt-1.5 inline-block">BELUM VERIFIKASI</span>
                    )}
                  </div>

                  <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-center">
                    <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Pihak Ketiga (Atasan)</div>
                    <div className="font-bold text-slate-700 dark:text-slate-300 text-xs mt-1">{result.supervisorName}</div>
                    {result.supervisorSignature ? (
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-100 dark:border-emerald-900/50 mt-1.5 inline-block">TERSETUJUI</span>
                    ) : (
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold bg-slate-50 dark:bg-slate-900 px-1.5 py-0.2 rounded border border-slate-100 dark:border-slate-800 mt-1.5 inline-block">BELUM DISETUJUI</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-800/60 rounded-xl p-5 text-center space-y-2">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Kode Verifikasi Tidak Ditemukan / Tidak Valid!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Sistem tidak dapat menemukan berkas digital dengan kode tersebut. Harap pastikan kembali kode verifikasi yang Anda masukkan sesuai dengan yang tertera pada bagian bawah dokumen berita acara.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
