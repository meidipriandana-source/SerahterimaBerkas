import React, { useState } from "react";
import { Folder, FileText, ExternalLink, Calendar, Search, RefreshCw, X, Printer, Download, Trash2, AlertTriangle, FolderPlus, Lock } from "lucide-react";
import { DocumentHandover } from "../types";
import { exportDocumentToPDF, generateDocumentHTML, getDocumentHtmlBlobUrl } from "../utils/pdfExporter";

interface DriveLiveViewProps {
  documents: DocumentHandover[];
  onRefresh: () => void;
  isLoading: boolean;
}

export default function DriveLiveView({ documents, onRefresh, isLoading }: DriveLiveViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<DocumentHandover | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Folder navigation & file assignment states
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [fileFolderMap, setFileFolderMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("drive_file_folder_map");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load file-folder map:", e);
    }
    return {};
  });

  const [moveModal, setMoveModal] = useState<{
    isOpen: boolean;
    fileIds: string[];
  }>({
    isOpen: false,
    fileIds: [],
  });

  // Dynamic folders state with LocalStorage persistence
  const [folders, setFolders] = useState<{ id: string; name: string }[]>(() => {
    try {
      const saved = localStorage.getItem("drive_folders");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load drive folders:", e);
    }
    return [{ id: "fold-1", name: "Arsip_Tahun_2025" }];
  });
  
  // Custom delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    ids: string[];
    description: string;
    errorMessage: string;
  }>({
    isOpen: false,
    ids: [],
    description: "",
    errorMessage: "",
  });

  const handleOpenMoveModal = (fileIds: string[], e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setMoveModal({
      isOpen: true,
      fileIds
    });
  };

  const handleExecuteMove = (targetFolderId: string | null) => {
    const updatedMap = { ...fileFolderMap };
    moveModal.fileIds.forEach(id => {
      if (targetFolderId === null) {
        delete updatedMap[id];
      } else {
        updatedMap[id] = targetFolderId;
      }
    });
    setFileFolderMap(updatedMap);
    try {
      localStorage.setItem("drive_file_folder_map", JSON.stringify(updatedMap));
    } catch (err) {
      console.error(err);
    }
    setSelectedIds([]);
    setMoveModal({ isOpen: false, fileIds: [] });
  };

  // We show files that are either pending_atasan (Admin signed already) or completed (fully approved)
  // These represent generated digital receipts
  const allActiveFiles = documents.filter(doc => 
    (doc.status === "completed" || doc.status === "pending_atasan") &&
    (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     doc.verificationCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter based on folder selection
  const activeFiles = allActiveFiles.filter(doc => {
    const fileFolder = fileFolderMap[doc.id];
    if (currentFolderId === null) {
      // In root, only show files not assigned to any folder
      return !fileFolder;
    } else {
      // Show only files belonging to the current folder
      return fileFolder === currentFolderId;
    }
  });

  const handleToggleSelect = (docId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId) 
        : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    const allActiveIds = activeFiles.map(doc => doc.id);
    const areAllSelected = allActiveIds.length > 0 && allActiveIds.every(id => selectedIds.includes(id));
    if (areAllSelected) {
      // Deselect all active files shown
      setSelectedIds(prev => prev.filter(id => !allActiveIds.includes(id)));
    } else {
      // Select all active files shown
      setSelectedIds(prev => Array.from(new Set([...prev, ...allActiveIds])));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    
    // Filter out completed (read-only) documents
    const selectedDocs = documents.filter(doc => selectedIds.includes(doc.id));
    const completedSelected = selectedDocs.filter(doc => doc.status === "completed");
    
    if (completedSelected.length > 0) {
      const nonCompletedIds = selectedDocs.filter(doc => doc.status !== "completed").map(doc => doc.id);
      if (nonCompletedIds.length === 0) {
        setDeleteModal({
          isOpen: true,
          ids: [],
          description: "Berkas yang sudah selesai ditandatangani bersifat Read-Only (Terkunci) dan tidak dapat dihapus demi keamanan dokumen final.",
          errorMessage: "Aksi dibatalkan: Dokumen final tidak boleh dihapus.",
        });
      } else {
        setDeleteModal({
          isOpen: true,
          ids: nonCompletedIds,
          description: `Pilihan Anda berisi dokumen final yang sudah selesai ditandatangani (Read-Only). Hanya ${nonCompletedIds.length} berkas yang berstatus draf/proses yang akan dihapus secara permanen. Dokumen final akan dikecualikan secara aman.`,
          errorMessage: "",
        });
      }
    } else {
      setDeleteModal({
        isOpen: true,
        ids: selectedIds,
        description: `Apakah Anda yakin ingin menghapus ${selectedIds.length} berkas bukti serah terima yang terpilih secara permanen? Tindakan ini tidak dapat dibatalkan.`,
        errorMessage: "",
      });
    }
  };

  const handleDeleteSingle = (docId: string, docTitle: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDeleteModal({
      isOpen: true,
      ids: [docId],
      description: `Apakah Anda yakin ingin menghapus berkas "${docTitle}" secara permanen? Tindakan ini tidak dapat dibatalkan.`,
      errorMessage: "",
    });
  };

  const handleDeleteFolder = (folderId: string, folderName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      ids: [folderId],
      description: `Apakah Anda yakin ingin menghapus folder "${folderName}" secara permanen? Semua berkas di luar folder tetap aman, namun visual folder akan dihapus secara permanen.`,
      errorMessage: "",
    });
  };

  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [createFolderError, setCreateFolderError] = useState("");

  const handleOpenCreateFolder = () => {
    setNewFolderName("");
    setCreateFolderError("");
    setIsCreateFolderOpen(true);
  };

  const handleExecuteCreateFolder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newFolderName.trim();
    if (!name) {
      setCreateFolderError("Nama folder tidak boleh kosong!");
      return;
    }

    const formattedName = name.replace(/\s+/g, "_");
    
    // Check if duplicate
    if (folders.some(f => f.name.toLowerCase() === formattedName.toLowerCase())) {
      setCreateFolderError("Folder dengan nama tersebut sudah ada!");
      return;
    }

    const newFolder = {
      id: "fold-" + Date.now(),
      name: formattedName
    };

    const updated = [...folders, newFolder];
    setFolders(updated);
    try {
      localStorage.setItem("drive_folders", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setIsCreateFolderOpen(false);
    setNewFolderName("");
    setCreateFolderError("");
  };

  const executeDelete = async () => {
    const ids = deleteModal.ids;
    if (ids.length === 0) return;

    setIsDeleting(true);
    setDeleteModal(prev => ({ ...prev, errorMessage: "" }));

    try {
      // Check if this is a folder deletion
      const isFolderDelete = ids.some(id => id.startsWith("fold-"));
      if (isFolderDelete) {
        const updatedFolders = folders.filter(f => !ids.includes(f.id));
        setFolders(updatedFolders);
        try {
          localStorage.setItem("drive_folders", JSON.stringify(updatedFolders));
        } catch (err) {
          console.error(err);
        }

        // Also remove folder assignments for files in the deleted folder
        const updatedMap = { ...fileFolderMap };
        Object.keys(updatedMap).forEach(key => {
          if (ids.includes(updatedMap[key])) {
            delete updatedMap[key];
          }
        });
        setFileFolderMap(updatedMap);
        try {
          localStorage.setItem("drive_file_folder_map", JSON.stringify(updatedMap));
        } catch (err) {
          console.error(err);
        }

        if (currentFolderId && ids.includes(currentFolderId)) {
          setCurrentFolderId(null);
        }

        setDeleteModal({ isOpen: false, ids: [], description: "", errorMessage: "" });
        setIsDeleting(false);
        return;
      }

      let res;
      if (ids.length === 1) {
        res = await fetch(`/api/documents/${ids[0]}`, {
          method: "DELETE"
        });
      } else {
        res = await fetch("/api/documents/delete-bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids })
        });
      }

      if (res.ok) {
        setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
        if (selectedDoc && ids.includes(selectedDoc.id)) {
          setSelectedDoc(null);
        }
        setDeleteModal({ isOpen: false, ids: [], description: "", errorMessage: "" });
        onRefresh();
      } else {
        setDeleteModal(prev => ({
          ...prev,
          errorMessage: "Gagal menghapus berkas dari server. Silakan coba kembali."
        }));
      }
    } catch (err) {
      console.error("Error executing delete:", err);
      setDeleteModal(prev => ({
        ...prev,
        errorMessage: "Terjadi kesalahan koneksi saat menghapus berkas."
      }));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs" id="drive-live-view">
      {/* Google Drive Header Mockup */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
            <Folder className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              My Drive &gt; Serah_Terima_PDFs 
              <span className="bg-indigo-100 text-indigo-800 text-[9px] px-1.5 py-0.2 rounded-full font-bold">Google Drive</span>
            </h3>
            <p className="text-[10px] text-slate-400">Penyimpanan cloud otomatis berkas PDF bukti serah terima yang telah sah.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Create Folder Button */}
          <button
            onClick={handleOpenCreateFolder}
            id="btn-create-folder"
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer shadow-3xs"
            title="Buat folder baru"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Buat Folder</span>
          </button>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari file PDF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="drive-search-input"
              className="text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 w-44 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white"
            />
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            id="btn-refresh-drive"
            className="p-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 transition disabled:opacity-50 cursor-pointer animate-none"
            title="Refresh folder"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading || isDeleting ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Folder Breadcrumbs */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentFolderId(null)}
            className={`hover:text-indigo-600 transition flex items-center gap-1 cursor-pointer ${currentFolderId === null ? "text-indigo-600 font-bold" : ""}`}
          >
            <Folder className="w-3.5 h-3.5 text-slate-400" />
            <span>Drive Utama (Serah_Terima_PDFs)</span>
          </button>
          {currentFolderId && (
            <>
              <span className="text-slate-400 font-normal">/</span>
              <span className="text-indigo-600 font-bold flex items-center gap-1 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                <Folder className="w-3.5 h-3.5 text-indigo-500 fill-indigo-100" />
                <span>{folders.find(f => f.id === currentFolderId)?.name || "Folder"}</span>
              </span>
            </>
          )}
        </div>
        {currentFolderId && (
          <button
            onClick={() => setCurrentFolderId(null)}
            className="text-[10px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-2 py-1 rounded-md flex items-center gap-1 transition cursor-pointer"
          >
            Kembali ke Utama
          </button>
        )}
      </div>

      {/* Drive Grid Layout */}
      <div className="p-6">
        {/* Contreng & Delete/Move Bulk Actions Bar */}
        {activeFiles.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                id="btn-select-all-drive"
                className="text-xs font-bold text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-2 shadow-3xs"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  activeFiles.length > 0 && activeFiles.every(doc => selectedIds.includes(doc.id))
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "border-slate-300 text-transparent"
                }`}>
                  <span className="text-[10px] font-black leading-none">✓</span>
                </div>
                <span>Pilih Semua ({activeFiles.length})</span>
              </button>
              
              {selectedIds.length > 0 && (
                <span className="text-xs font-semibold text-slate-500 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">
                  {selectedIds.length} berkas dipilih
                </span>
              )}
            </div>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleOpenMoveModal(selectedIds, e)}
                  id="btn-move-selected-drive"
                  className="text-xs font-black bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-3xs"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Pindahkan ({selectedIds.length})</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  id="btn-delete-selected-drive"
                  className="text-xs font-black bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus ({selectedIds.length})</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Dynamic Folders Representation (Only visible in Root view) */}
          {currentFolderId === null && folders.map(folder => (
            <div 
              key={folder.id}
              onClick={() => setCurrentFolderId(folder.id)}
              className="border border-slate-200 bg-slate-50/50 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-indigo-50/30 hover:border-indigo-200 hover:shadow-xs transition duration-150 relative group cursor-pointer"
              id={`drive-folder-${folder.id}`}
              title="Klik untuk membuka folder"
            >
              {/* Delete button for Folder */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition duration-150 z-10">
                <button
                  type="button"
                  onClick={(e) => handleDeleteFolder(folder.id, folder.name, e)}
                  id={`btn-delete-folder-${folder.id}`}
                  className="p-1 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-md border border-slate-200 transition cursor-pointer shadow-3xs"
                  title={`Hapus folder ${folder.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <Folder className="w-12 h-12 text-amber-400 group-hover:scale-105 transition fill-amber-50" />
              <span className="text-xs font-bold text-slate-700 mt-2 block truncate w-full" title={folder.name}>
                {folder.name}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold uppercase">Folder</span>
            </div>
          ))}

          {activeFiles.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center text-slate-400">
              <FileText className="w-12 h-12 text-slate-200 mb-2" />
              <p className="text-xs font-semibold">
                {currentFolderId !== null ? "Folder ini kosong" : "Belum ada berkas PDF tersimpan di Drive"}
              </p>
              <p className="text-[10px] text-slate-400 max-w-xs mt-1">
                {currentFolderId !== null 
                  ? "Pindahkan berkas dari Drive Utama ke folder ini dengan menggunakan tombol Pindahkan."
                  : "Berkas PDF akan digenerate dan diunggah secara otomatis setelah Admin menyetujui dan menandatangani berkas tersebut."}
              </p>
            </div>
          ) : (
            activeFiles.map((doc) => {
              const formattedDate = new Date(doc.timestamp).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short"
              });

              const isSelected = selectedIds.includes(doc.id);

              return (
                <div 
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  id={`drive-file-${doc.id}`}
                  className={`border rounded-xl p-4 flex flex-col items-center justify-between text-center hover:shadow-sm transition duration-200 group cursor-pointer relative ${
                    isSelected 
                      ? "border-indigo-500 bg-indigo-50/25 ring-1 ring-indigo-500" 
                      : "border-slate-200 bg-white hover:border-indigo-300"
                  }`}
                >
                  {/* Top Left Selection Checkbox */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <button
                      type="button"
                      onClick={(e) => handleToggleSelect(doc.id, e)}
                      id={`btn-checkbox-${doc.id}`}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition cursor-pointer shadow-3xs ${
                        isSelected 
                          ? "bg-indigo-600 border-indigo-600 text-white" 
                          : "bg-white/90 border-slate-300 text-transparent hover:border-indigo-500"
                      }`}
                      title={isSelected ? "Batal pilih berkas" : "Contreng / Pilih berkas"}
                    >
                      <span className="text-[10px] font-black leading-none">✓</span>
                    </button>
                  </div>

                  {/* Top Right Action & Status Area */}
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase ${
                      doc.status === "completed" 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {doc.status === "completed" ? "Selesai" : "Draft TTD"}
                    </span>
                    
                    <button
                      type="button"
                      onClick={(e) => handleOpenMoveModal([doc.id], e)}
                      id={`btn-move-card-${doc.id}`}
                      className="p-1 bg-white hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-md border border-slate-200 transition cursor-pointer shadow-3xs"
                      title="Pindahkan berkas ke folder"
                    >
                      <FolderPlus className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportDocumentToPDF(doc);
                      }}
                      id={`btn-export-card-${doc.id}`}
                      className="p-1 bg-white hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-md border border-slate-200 transition cursor-pointer shadow-3xs"
                      title="Ekspor ke PDF Resmi"
                    >
                      <Download className="w-3 h-3" />
                    </button>

                    {doc.status === "completed" ? (
                      <span
                        className="p-1 bg-slate-50 text-slate-400 rounded-md border border-slate-200 cursor-not-allowed flex items-center justify-center"
                        title="Berkas Selesai (Read-Only) - Tidak dapat dihapus"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      >
                        <Lock className="w-3 h-3 text-amber-500" />
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSingle(doc.id, doc.title, e)}
                        id={`btn-delete-card-${doc.id}`}
                        className="p-1 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-md border border-slate-200 transition cursor-pointer shadow-3xs"
                        title="Hapus berkas permanen"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="my-3 flex flex-col items-center">
                    <div className="p-3 bg-red-50 text-red-500 rounded-lg group-hover:bg-red-100 transition duration-200">
                      <FileText className="w-10 h-10 stroke-1.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 mt-3 line-clamp-2 px-1 text-center" title={doc.title}>
                      Bukti_Serah_Terima_{doc.verificationCode}.pdf
                    </span>
                  </div>

                  <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {formattedDate}
                    </span>
                    <span className="font-semibold text-indigo-600 flex items-center gap-0.5 group-hover:underline">
                      Pratinjau <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Embedded Document Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="pdf-viewer-overlay">
          <div className="bg-slate-100 w-full max-w-4xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-fadeIn">
            {/* Toolbar PDF Viewer */}
            <div className="bg-slate-800 text-white px-5 py-3 flex items-center justify-between border-b border-slate-700 shrink-0">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-red-400" />
                <div>
                  <h4 className="text-xs font-bold">Bukti_Serah_Terima_{selectedDoc.verificationCode}.pdf</h4>
                  <p className="text-[10px] text-slate-300">Google Drive PDF Viewer (Pratinjau Berkas Handover)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {selectedDoc.status === "completed" ? (
                  <span 
                    className="p-1.5 bg-slate-700 text-slate-300 border border-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1"
                    title="Dokumen Selesai - Bersifat Read-Only"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">Read-Only</span>
                  </span>
                ) : (
                  <button 
                    onClick={(e) => handleDeleteSingle(selectedDoc.id, selectedDoc.title, e)}
                    id="btn-delete-pdf-viewer"
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    title="Hapus Berkas Permanen"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                  </button>
                )}
                <a 
                  href={getDocumentHtmlBlobUrl(selectedDoc)} 
                  target="_blank" 
                  rel="noreferrer"
                  id="btn-print-doc"
                  className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="Cetak Berkas"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak
                </a>
                <button 
                  type="button"
                  onClick={() => exportDocumentToPDF(selectedDoc)}
                  id="btn-download-doc"
                  className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-sm"
                  title="Ekspor ke PDF Resmi"
                >
                  <Download className="w-3.5 h-3.5" /> Ekspor PDF
                </button>
                <button 
                  onClick={() => setSelectedDoc(null)}
                  id="btn-close-pdf-viewer"
                  className="p-1.5 bg-slate-700 hover:bg-red-600 hover:text-white text-slate-300 rounded-lg transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Iframe Sandbox */}
            <div className="flex-1 bg-slate-200 p-4 overflow-y-auto">
              <div className="w-full h-full bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden">
                <iframe 
                  srcDoc={generateDocumentHTML(selectedDoc)} 
                  title={`PDF pratinjau - ${selectedDoc.title}`}
                  className="w-full h-full border-0 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Deletion Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn" id="delete-confirmation-overlay">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-200 p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3.5">
              <div className="bg-red-50 text-red-600 p-2.5 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-950">Konfirmasi Hapus Berkas</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {deleteModal.description}
                </p>
              </div>
            </div>

            {deleteModal.errorMessage && (
              <div className="bg-red-50 border border-red-100 text-red-700 p-2.5 rounded-lg text-xs font-semibold">
                {deleteModal.errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, ids: [], description: "", errorMessage: "" })}
                disabled={isDeleting}
                id="btn-cancel-delete"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-black transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={isDeleting}
                id="btn-confirm-delete"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus Permanen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Folder Creation Modal */}
      {isCreateFolderOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn" id="create-folder-modal-overlay">
          <form 
            onSubmit={handleExecuteCreateFolder}
            className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-200 p-6 flex flex-col gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl shrink-0">
                <FolderPlus className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-950">Buat Folder Baru</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Masukkan nama folder baru untuk merapikan berkas bukti serah terima Anda.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 mt-2">
              <label htmlFor="new-folder-input" className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nama Folder</label>
              <input
                type="text"
                id="new-folder-input"
                placeholder="cth: Arsip_Tahun_2026"
                value={newFolderName}
                onChange={(e) => {
                  setNewFolderName(e.target.value);
                  setCreateFolderError("");
                }}
                className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                autoFocus
              />
              <p className="text-[9px] text-slate-400 mt-1">Spasi akan otomatis diubah menjadi karakter underscore (_)</p>
            </div>

            {createFolderError && (
              <div className="bg-red-50 border border-red-100 text-red-700 p-2.5 rounded-lg text-xs font-semibold">
                {createFolderError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsCreateFolderOpen(false)}
                id="btn-cancel-create-folder"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-black transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                id="btn-submit-create-folder"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Buat Folder</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Custom Move File to Folder Modal */}
      {moveModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn" id="move-folder-modal-overlay">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-200 p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3.5">
              <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl shrink-0">
                <Folder className="w-6 h-6 text-indigo-500 fill-indigo-100 animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-950">Pindahkan Berkas ke Folder</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Pilih folder tujuan untuk memindahkan {moveModal.fileIds.length} berkas bukti serah terima.
                </p>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100 mt-2">
              {/* Root Drive option */}
              <button
                type="button"
                onClick={() => handleExecuteMove(null)}
                className="w-full text-left px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-slate-400" />
                  <span>Drive Utama (Serah_Terima_PDFs)</span>
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md font-bold uppercase">Root</span>
              </button>

              {/* Dynamic Folders */}
              {folders.map(folder => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => handleExecuteMove(folder.id)}
                  className="w-full text-left px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-indigo-50/50 hover:text-indigo-600 flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-amber-500 fill-amber-100" />
                    <span>{folder.name}</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Folder</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setMoveModal({ isOpen: false, fileIds: [] })}
                id="btn-cancel-move"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-black transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
