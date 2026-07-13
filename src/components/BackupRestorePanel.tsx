import React, { useState, useRef } from "react";
import { 
  Database, Download, Upload, AlertTriangle, CheckCircle2, 
  Trash2, RefreshCw, FileText, ArrowRight, Info
} from "lucide-react";
import { DocumentHandover } from "../types";

interface BackupRestorePanelProps {
  documents: DocumentHandover[];
  onRefresh: () => void;
  triggerPushNotification: (title: string, message: string) => void;
}

export default function BackupRestorePanel({ 
  documents, 
  onRefresh, 
  triggerPushNotification 
}: BackupRestorePanelProps) {
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [isRestoreLoading, setIsRestoreLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [restorePreview, setRestorePreview] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics
  const docCount = documents.length;
  const completedCount = documents.filter(d => d.status === "completed").length;
  const pendingCount = documents.filter(d => d.status.startsWith("pending")).length;

  // Handler for Drag & Drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileSelected(file);
    }
  };

  // Parse and validate backup file
  const handleFileSelected = (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const isJsonFile = file.name.endsWith(".json") || file.type === "application/json";
    const isTxtFile = file.name.endsWith(".txt") || file.type === "text/plain";

    if (!isJsonFile && !isTxtFile) {
      setErrorMsg("Berkas harus berformat .json atau .txt");
      setSelectedFile(null);
      setRestorePreview(null);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        
        // Validate expected structure - we support both unified formats
        if (!parsed.data && !parsed.documents) {
          setErrorMsg("Struktur berkas cadangan tidak valid atau usang.");
          setRestorePreview(null);
          return;
        }

        // Normalize format if it was generated directly as raw DB
        const normalized = parsed.data ? parsed : {
          version: parsed.version || "1.0",
          timestamp: parsed.timestamp || new Date().toISOString(),
          clientConfig: parsed.clientConfig || null,
          data: {
            documents: parsed.documents || parsed.data?.documents || [],
            logs: parsed.logs || parsed.data?.logs || [],
            notifications: parsed.notifications || parsed.data?.notifications || []
          }
        };

        if (!normalized.data.documents && !normalized.data.logs) {
          setErrorMsg("Struktur berkas cadangan tidak valid atau usang.");
          setRestorePreview(null);
          return;
        }

        setRestorePreview(normalized);
      } catch (err) {
        setErrorMsg("Gagal membaca atau mem-parse isi file JSON.");
        setRestorePreview(null);
      }
    };
    reader.readAsText(file);
  };

  // Perform Backup Download
  const handleExportBackup = async () => {
    setIsBackupLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Get server database state
      let serverPayload: any = { data: null };
      try {
        const res = await fetch("/api/backup");
        if (res.ok) {
          serverPayload = await res.json();
        }
      } catch (err) {
        console.warn("Could not fetch server backup, will fallback to local storage DB only.");
      }

      // If server backup is unavailable, use client local DB
      const clientDocs = localStorage.getItem("client_db_documents");
      const clientLogs = localStorage.getItem("client_db_logs");
      const clientNotifs = localStorage.getItem("client_db_notifications");

      const documents = serverPayload.data?.documents || (clientDocs ? JSON.parse(clientDocs) : []);
      const logs = serverPayload.data?.logs || (clientLogs ? JSON.parse(clientLogs) : []);
      const notifications = serverPayload.data?.notifications || (clientNotifs ? JSON.parse(clientNotifs) : []);

      const backupData = {
        documents,
        logs,
        notifications
      };

      // 2. Add client localstorage configurations
      const driveFolders = localStorage.getItem("drive_folders");
      const driveCustomFolders = localStorage.getItem("drive_custom_folders");
      const driveFileMap = localStorage.getItem("drive_file_folder_map");

      const handoverDrafts: Record<string, string | null> = {};
      const handoverKeys = [
        "handover_form_title",
        "handover_form_description",
        "handover_form_category",
        "handover_form_recipientName",
        "handover_form_recipientPersonName",
        "handover_form_recipientEmail",
        "handover_form_supervisor1",
        "handover_form_supervisor2",
        "handover_form_supervisor3",
        "handover_form_senderSignature",
        "handover_form_items",
        "handover_form_checkedItems"
      ];
      handoverKeys.forEach(key => {
        handoverDrafts[key] = localStorage.getItem(key);
      });

      // 3. Compose unified backup format
      const fullBackup = {
        version: "1.1",
        timestamp: new Date().toISOString(),
        clientConfig: {
          drive_folders: driveFolders ? JSON.parse(driveFolders) : null,
          drive_custom_folders: driveCustomFolders ? JSON.parse(driveCustomFolders) : (driveFolders ? JSON.parse(driveFolders) : null),
          drive_file_folder_map: driveFileMap ? JSON.parse(driveFileMap) : null,
          handoverDrafts,
          localDB: {
            client_db_documents: JSON.stringify(documents),
            client_db_logs: JSON.stringify(logs),
            client_db_notifications: JSON.stringify(notifications)
          }
        },
        data: backupData
      };

      // 4. Download file
      const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `SignFlow_Backup_DANADIKLAT_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMsg("Berkas cadangan berhasil diekspor dan diunduh.");
      triggerPushNotification(
        "Ekspor Backup Sukses", 
        "Data serah terima dan konfigurasi berhasil dicadangkan ke berkas lokal."
      );
    } catch (err: any) {
      setErrorMsg(`Gagal ekspor cadangan: ${err.message}`);
    } finally {
      setIsBackupLoading(false);
    }
  };

  // Perform Restore Action
  const handleImportRestore = async () => {
    if (!restorePreview) return;
    setIsRestoreLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Restore server-side DB
      try {
        const res = await fetch("/api/restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ backupData: restorePreview.data })
        });
        if (!res.ok) {
          console.warn("Gagal menyimpan data restorasi di server, akan dilanjutkan secara lokal.");
        }
      } catch (err) {
        console.warn("Server offline - melanjutkan restorasi lokal penuh.");
      }

      // 2. Restore client-side LocalStorage if present in backup file
      if (restorePreview.clientConfig) {
        // Restore custom drive folders correctly
        const restoredFolders = restorePreview.clientConfig.drive_folders || restorePreview.clientConfig.drive_custom_folders;
        if (restoredFolders) {
          localStorage.setItem("drive_folders", JSON.stringify(restoredFolders));
          localStorage.setItem("drive_custom_folders", JSON.stringify(restoredFolders));
        }

        if (restorePreview.clientConfig.drive_file_folder_map) {
          localStorage.setItem(
            "drive_file_folder_map", 
            JSON.stringify(restorePreview.clientConfig.drive_file_folder_map)
          );
        }

        // Restore handover form drafts (what the user typed!)
        if (restorePreview.clientConfig.handoverDrafts) {
          Object.entries(restorePreview.clientConfig.handoverDrafts).forEach(([key, val]) => {
            if (val !== null && val !== undefined) {
              localStorage.setItem(key, val as string);
            }
          });
        }

        // Restore client database fallback if present
        if (restorePreview.clientConfig.localDB) {
          Object.entries(restorePreview.clientConfig.localDB).forEach(([key, val]) => {
            if (val !== null && val !== undefined) {
              localStorage.setItem(key, val as string);
            }
          });
        }
      }

      // 3. Ensure the direct document/log data is also written back to LocalDB fallback keys
      if (restorePreview.data) {
        if (restorePreview.data.documents) {
          localStorage.setItem("client_db_documents", JSON.stringify(restorePreview.data.documents));
        }
        if (restorePreview.data.logs) {
          localStorage.setItem("client_db_logs", JSON.stringify(restorePreview.data.logs));
        }
        if (restorePreview.data.notifications) {
          localStorage.setItem("client_db_notifications", JSON.stringify(restorePreview.data.notifications));
        }
      }

      setSuccessMsg("Restorasi data berhasil diterapkan secara penuh!");
      setSelectedFile(null);
      setRestorePreview(null);
      
      // Delay page refresh slightly or call onRefresh to reload states cleanly
      setTimeout(() => {
        onRefresh();
        // Force fully reload form states if restored on mobile
        window.location.reload();
      }, 500);
      
      triggerPushNotification(
        "Pemulihan Data Sukses", 
        "Database serah terima berkas digital berhasil dipulihkan dari berkas cadangan."
      );
    } catch (err: any) {
      setErrorMsg(`Gagal memulihkan data: ${err.message}`);
    } finally {
      setIsRestoreLoading(false);
    }
  };

  // Perform Factory Reset to Seed Data
  const handleResetToSeed = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus semua data saat ini dan mengembalikan ke data contoh bawaan PT.DANADIKLAT? Tindakan ini tidak dapat dibatalkan!")) {
      return;
    }

    setIsResetLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (!res.ok) throw new Error("Gagal menyetel ulang database.");

      // Clear local folders to match fresh state
      localStorage.removeItem("drive_custom_folders");
      localStorage.removeItem("drive_file_folder_map");

      setSuccessMsg("Database berhasil disetel ulang ke data bawaan pabrik!");
      onRefresh();

      triggerPushNotification(
        "Reset Sistem Selesai", 
        "Database telah dibersihkan dan disinkronisasi ke data seed awal."
      );
    } catch (err: any) {
      setErrorMsg(`Gagal menyetel ulang sistem: ${err.message}`);
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="backup-restore-panel">
      {/* Title block */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Manajemen &amp; Cadangan Data</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Amankan, ekspor, atau pulihkan seluruh basis data digital serah terima berkas PT.DANADIKLAT.
            </p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 p-4 rounded-xl text-xs font-semibold flex items-start gap-2.5 animate-shake">
          <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl text-xs font-semibold flex items-start gap-2.5">
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Total Berkas</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{docCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Selesai (Signed)</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{completedCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Menunggu Proses</span>
          <div className="text-2xl font-black text-amber-500 dark:text-amber-400 mt-1">{pendingCount}</div>
        </div>
      </div>

      {/* Grid: Export and Import Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Export Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-500" />
              <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 tracking-wider">Ekspor Database (Backup)</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Unduh salinan lengkap basis data digital (termasuk berkas, tanda tangan digital, alur verifikasi, serta log sistem terbaru) ke dalam format JSON standar yang aman.
            </p>
          </div>

          <div className="bg-slate-50/70 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-850/60 rounded-xl p-3.5 space-y-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-400">
              <Info className="w-3.5 h-3.5 text-indigo-500" />
              <span>Cakupan File Cadangan:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>{docCount} Dokumen / Berkas Serah Terima</li>
              <li>Tanda tangan digital pengaju &amp; validator</li>
              <li>Log alur koordinasi &amp; timeline aktivitas</li>
              <li>Kustomisasi folder penyimpanan Google Drive</li>
            </ul>
          </div>

          <button
            type="button"
            disabled={isBackupLoading}
            onClick={handleExportBackup}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            {isBackupLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memproses Data...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Ekspor &amp; Unduh File JSON</span>
              </>
            )}
          </button>
        </div>

        {/* Import/Restore Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-500" />
              <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 tracking-wider">Pulihkan Database (Restore)</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Unggah berkas JSON cadangan yang telah diekspor sebelumnya untuk mengembalikan seluruh kondisi data dan alur verifikasi PT.DANADIKLAT.
            </p>
          </div>

          {/* Drag & Drop File Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2.5 ${
              dragActive 
                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30" 
                : "border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50/30 dark:bg-slate-950/10 hover:bg-slate-50/60 dark:hover:bg-slate-900/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json,text/plain,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
            
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-500 dark:text-indigo-400 rounded-full">
              <FileText className="w-5 h-5" />
            </div>
            
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-[11px] font-black text-indigo-700 dark:text-indigo-400 truncate max-w-[250px]">
                  {selectedFile.name}
                </p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB &bull; Klik untuk mengganti
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Seret &amp; letakkan berkas cadangan (.json, .txt) di sini</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">atau klik untuk memilih secara manual</p>
              </div>
            )}
          </div>

          {/* Restore Details Preview */}
          {restorePreview && (
            <div className="bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-3.5 space-y-2.5 animate-fadeIn">
              <div className="text-[10px] font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-500" />
                <span>Isi File Cadangan Terbaca:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-400 font-semibold">
                <div>Versi Backup: <span className="text-indigo-600 dark:text-indigo-400">{restorePreview.version || "1.0"}</span></div>
                <div>Tanggal: <span className="text-indigo-600 dark:text-indigo-400">{restorePreview.timestamp ? new Date(restorePreview.timestamp).toLocaleDateString("id-ID") : "-"}</span></div>
                <div>Jumlah Berkas: <span className="text-indigo-600 dark:text-indigo-400">{restorePreview.data?.documents?.length || 0} unit</span></div>
                <div>Jumlah Log: <span className="text-indigo-600 dark:text-indigo-400">{restorePreview.data?.logs?.length || 0} baris</span></div>
              </div>

              <div className="border-t border-indigo-100 dark:border-indigo-900/50 pt-2 mt-2">
                <button
                  type="button"
                  disabled={isRestoreLoading}
                  onClick={handleImportRestore}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-extrabold rounded-lg text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-3xs"
                >
                  {isRestoreLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>Konfirmasi &amp; Terapkan Pemulihan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dangerous Action Block - Factory Reset */}
      <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/40 rounded-2xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-red-800 dark:text-red-400 tracking-wider">Zona Bahaya (Sistem Reset)</h4>
            <p className="text-xs text-red-700/80 dark:text-red-300/80 leading-relaxed">
              Mengembalikan portal ke setelan awal pabrik. Tindakan ini akan menghapus seluruh data yang telah Anda tambahkan secara permanen, dan mengembalikan basis data ke daftar data contoh bawaan PT.DANADIKLAT.
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-red-200/40 dark:border-red-900/40 pt-3">
          <button
            type="button"
            disabled={isResetLoading}
            onClick={handleResetToSeed}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-3xs"
          >
            {isResetLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>Setel Ulang Portal (Default)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
