import React, { useState } from "react";
import { Settings, Check, HelpCircle, Cloud, AlertCircle, RefreshCw, Key, FileSpreadsheet, FolderOpen, Sun, Moon } from "lucide-react";

interface WorkspaceConfigModalProps {
  onClose: () => void;
  onSave: (config: any) => void;
  currentConfig: {
    spreadsheetId: string;
    sheetName: string;
    driveFolderId: string;
    driveFolderName: string;
    connected: boolean;
  };
  isDarkMode: boolean;
  onToggleDarkMode: (val: boolean) => void;
}

export default function WorkspaceConfigModal({ 
  onClose, 
  onSave, 
  currentConfig,
  isDarkMode,
  onToggleDarkMode
}: WorkspaceConfigModalProps) {
  const [spreadsheetId, setSpreadsheetId] = useState(currentConfig.spreadsheetId || "1uXQ_Ld-u21GvD8H_O8rK3gA");
  const [sheetName, setSheetName] = useState(currentConfig.sheetName || "Sheet1");
  const [driveFolderId, setDriveFolderId] = useState(currentConfig.driveFolderId || "1o8vP_A9W-9gLd8S_J8rD3gA");
  const [driveFolderName, setDriveFolderName] = useState(currentConfig.driveFolderName || "Serah_Terima_PDFs");
  const [connected, setConnected] = useState(currentConfig.connected);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate real OAuth & Firebase authentication connection
    setTimeout(() => {
      setIsConnecting(false);
      setConnected(true);
    }, 1500);
  };

  const handleDisconnect = () => {
    setConnected(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      spreadsheetId,
      sheetName,
      driveFolderId,
      driveFolderName,
      connected
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="workspace-config-overlay">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide">Konfigurasi &amp; Pengaturan Aplikasi</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Kustomisasi sistem integrasi Google Workspace dan kenyamanan visual Anda</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            id="btn-close-config"
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-600 dark:text-slate-300">
          
          {/* Connection Card */}
          <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Status Koneksi API</span>
              <div className="flex items-center gap-2">
                <Cloud className={`w-5 h-5 ${connected ? 'text-emerald-500 animate-pulse' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className={`font-bold text-xs ${connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                  {connected ? "Terkoneksi (Google API Aktif)" : "Lokal / Mode DANA"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                {connected 
                  ? "Sistem menulis baris ke spreadsheet riil & file PDF di Drive Anda." 
                  : "Sistem menggunakan database DANA lokal yang interaktif."
                }
              </p>
            </div>

            <div>
              {connected ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  id="btn-disconnect-google"
                  className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 dark:border-red-900 font-bold px-3 py-1.5 border border-red-200 rounded-lg transition text-[11px] cursor-pointer"
                >
                  Putuskan Koneksi
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isConnecting}
                  onClick={handleConnect}
                  id="btn-connect-google"
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-bold px-3 py-1.5 rounded-lg transition text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menghubungkan...
                    </>
                  ) : (
                    "Hubungkan Akun Google"
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Config fields (Google Sheets) */}
          <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-800 pt-4">
            <h5 className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <FileSpreadsheet className="w-4 h-4" /> 1. Pengaturan Google Sheets (Database)
            </h5>
            
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-200">Spreadsheet ID</label>
              <input
                type="text"
                required
                disabled={!connected}
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                id="config-sheets-id"
                className="w-full text-xs border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 dark:disabled:text-slate-600 rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Kode acak panjang di dalam URL Google Sheet Anda.</span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-200">Nama Sheet (Range)</label>
              <input
                type="text"
                required
                disabled={!connected}
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                id="config-sheets-name"
                className="w-full text-xs border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 dark:disabled:text-slate-600 rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Config fields (Google Drive) */}
          <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-800 pt-4">
            <h5 className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <FolderOpen className="w-4 h-4" /> 2. Pengaturan Google Drive (PDF Storage)
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-200">Nama Folder Drive</label>
                <input
                  type="text"
                  required
                  disabled={!connected}
                  value={driveFolderName}
                  onChange={(e) => setDriveFolderName(e.target.value)}
                  id="config-drive-folder-name"
                  className="w-full text-xs border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 dark:disabled:text-slate-600 rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-200">Folder ID (Opsional)</label>
                <input
                  type="text"
                  disabled={!connected}
                  value={driveFolderId}
                  onChange={(e) => setDriveFolderId(e.target.value)}
                  id="config-drive-folder-id"
                  className="w-full text-xs border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 dark:disabled:text-slate-600 rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Config fields (Tampilan / Tema Gelap) */}
          <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-800 pt-4">
            <h5 className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <Settings className="w-4 h-4" /> 3. Tampilan &amp; Kenyamanan (Tema)
            </h5>
            
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
              <div className="space-y-0.5 pr-2">
                <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  {isDarkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  Tema Gelap (Dark Mode)
                </span>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Kurangi ketegangan mata saat aplikasi digunakan di ruangan minim cahaya.</p>
              </div>
              
              <button
                type="button"
                onClick={() => onToggleDarkMode(!isDarkMode)}
                id="btn-toggle-dark-mode"
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-slate-200 shadow-sm ring-0 transition duration-200 ease-in-out ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </div>

          {/* Alert Instructions */}
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3.5 border border-amber-200/60 dark:border-amber-900/30 flex items-start gap-2.5 text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Panduan Mandiri Pengguna:</span>
              <p className="mt-0.5">
                Pastikan Anda telah menyetujui cakupan otorisasi <span className="font-bold">Google Drive</span> &amp; <span className="font-bold">Google Sheets</span> saat masuk. Jika menggunakan mode lokal, database dan penyimpanan PDF disimpan secara sempurna di tab visual atas!
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              id="btn-cancel-config"
              className="px-4 py-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 rounded-lg font-semibold cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="submit"
              id="btn-save-config"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
            >
              Simpan Setelan <Check className="w-3.5 h-3.5" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
