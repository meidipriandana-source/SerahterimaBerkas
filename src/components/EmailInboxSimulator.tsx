import React, { useState } from "react";
import { Mail, Search, Trash2, ChevronRight, Inbox, Clock, Paperclip, Send, ExternalLink, Download } from "lucide-react";
import { DocumentHandover } from "../types";
import { exportDocumentToPDF } from "../utils/pdfExporter";

interface EmailInboxSimulatorProps {
  documents: DocumentHandover[];
}

export default function EmailInboxSimulator({ documents }: EmailInboxSimulatorProps) {
  const [selectedMail, setSelectedMail] = useState<DocumentHandover | null>(null);

  // Filter completed documents because only completed documents trigger real-time confirmation emails to recipient
  const completedDocs = documents.filter(doc => doc.status === "completed");

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs" id="email-inbox-simulator">
      <div className="grid grid-cols-1 md:grid-cols-3 h-[550px]">
        {/* Mailbox List */}
        <div className="border-r border-slate-200 flex flex-col bg-slate-50">
          {/* Gmail Sidebar Mock Header */}
          <div className="bg-white text-slate-800 p-4 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                <Inbox className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold">Penerima Inbox</h3>
                <p className="text-[9px] text-slate-400">Gmail DANA (Konfirmasi Real-Time)</p>
              </div>
            </div>
            <span className="bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded-full text-[9px]">{completedDocs.length} Baru</span>
          </div>

          {/* Mail List Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {completedDocs.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs my-auto">
                <Mail className="w-10 h-10 mx-auto text-slate-200 mb-2 stroke-1" />
                <p className="font-semibold">Kotak Masuk Kosong</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Email konfirmasi instan akan dikirimkan ke pihak penerima secara otomatis setelah atasan memberikan tanda tangan digital terakhir.
                </p>
              </div>
            ) : (
              completedDocs.map((doc) => {
                const isSelected = selectedMail?.id === doc.id;
                const formattedDate = new Date(doc.timestamp).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedMail(doc)}
                    id={`mail-item-${doc.id}`}
                    className={`p-3.5 cursor-pointer hover:bg-slate-100/80 transition-colors flex flex-col gap-1 relative ${
                      isSelected ? "bg-white border-l-4 border-indigo-600" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[11px] font-bold text-slate-800 truncate max-w-[70%]">
                        Sistem Serah Terima Berkas
                      </span>
                      <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> {formattedDate}
                      </span>
                    </div>
                    
                    <h4 className={`text-xs truncate ${isSelected ? 'font-bold text-slate-900' : 'text-slate-600 font-semibold'}`}>
                      [VALID] Bukti Serah Terima - {doc.title}
                    </h4>
                    
                    <p className="text-[10px] text-slate-400 line-clamp-1">
                      Halo {doc.recipientName}, Dokumen berita acara serah terima digital Anda telah disetujui lengkap oleh...
                    </p>

                    <div className="flex items-center gap-1 mt-1">
                      <span className="bg-slate-200 text-slate-600 text-[8px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <Paperclip className="w-2 h-2" /> PDF
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Mail Viewer Panel */}
        <div className="md:col-span-2 flex flex-col bg-white">
          {selectedMail ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden" id="mail-content-viewer">
              {/* Mail Header Info */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800">
                    [VALID] Bukti Serah Terima Berkas Digital - {selectedMail.title}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {new Date(selectedMail.timestamp).toLocaleString("id-ID")}
                  </span>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400">Dari: </span>
                    <span className="font-semibold text-slate-700">Sistem Digital Handover &lt;no-reply@company.com&gt;</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400">Kepada: </span>
                    <span className="font-semibold text-slate-700">{selectedMail.recipientName} &lt;{selectedMail.recipientEmail}&gt;</span>
                  </div>
                </div>
              </div>

              {/* Email Body Template */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm max-w-xl mx-auto overflow-hidden">
                  {/* Visual Header */}
                  <div className="bg-indigo-600 text-white p-4 text-center">
                    <h2 className="text-xs font-bold uppercase tracking-wider">Berita Acara Serah Terima Digital</h2>
                    <p className="text-[10px] text-indigo-100 mt-1">Layanan Validasi Dokumen PT.DANADIKLAT</p>
                  </div>
                  
                  {/* Content Mail */}
                  <div className="p-5 text-xs text-slate-600 space-y-4">
                    <p>Halo <strong>{selectedMail.recipientName}</strong>,</p>
                    <p>
                      Kami ingin mengonfirmasikan bahwa proses serah terima berkas digital telah <strong>SELESAI (VALID)</strong> dan ditandatangani secara sah oleh seluruh pihak terkait melalui sistem kami.
                    </p>
                    
                    {/* Table Info */}
                    <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2 font-sans text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Judul Berkas:</span>
                        <span className="font-bold text-slate-800">{selectedMail.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pihak Pertama (Pengaju):</span>
                        <span className="font-semibold text-slate-800">{selectedMail.senderName} ({selectedMail.senderEmail})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Kode Verifikasi SHA:</span>
                        <span className="font-mono font-bold text-indigo-600">{selectedMail.verificationCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Disetujui Oleh Atasan:</span>
                        <span className="font-semibold text-slate-800">{selectedMail.supervisorName}</span>
                      </div>
                    </div>

                    <p>
                      Berkas PDF berita acara resmi telah otomatis disimpan dengan aman di <strong>Google Drive</strong> perusahaan di dalam folder <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-[10px] text-slate-700">Serah_Terima_PDFs</code> dan baris database telah tersinkronisasi di <strong>Google Sheets</strong>.
                    </p>

                    <p className="text-[10px] text-slate-400 leading-relaxed italic">
                      Catatan Keamanan: Email ini dikirim secara otomatis. Dokumen ini dilindungi enkripsi hash kriptografi SHA-256 yang sah di bawah Undang-Undang ITE Republik Indonesia.
                    </p>

                    {/* Attachment Block */}
                    <div className="border-t border-slate-100 pt-4 mt-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Lampiran Berkas (1 File)</span>
                      
                      <div className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/60 transition">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-red-50 text-red-500 rounded-md">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-slate-700 block truncate max-w-[150px] sm:max-w-[200px]">
                              Bukti_Serah_Terima_{selectedMail.verificationCode}.pdf
                            </span>
                            <span className="text-[9px] text-slate-400">PDF Document</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <a 
                            href={`/api/download-pdf/${selectedMail.id}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[10px] font-bold flex items-center gap-0.5"
                          >
                            <ExternalLink className="w-3 h-3" /> Buka
                          </a>
                          <button 
                            type="button"
                            onClick={() => exportDocumentToPDF(selectedMail)}
                            className="p-1 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-[10px] font-bold flex items-center gap-0.5 cursor-pointer shadow-3xs"
                          >
                            <Download className="w-3 h-3" /> Unduh PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-6">
              <Mail className="w-12 h-12 text-slate-200 mb-2 stroke-1" />
              <p className="font-semibold text-xs">Pilih email untuk melihat konten</p>
              <p className="text-[10px] text-slate-400 max-w-xs mt-1">
                Setiap kali sebuah pengajuan disetujui penuh oleh Atasan, email berisi salinan berita acara berformat PDF dikirimkan ke pihak penerima secara real-time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
