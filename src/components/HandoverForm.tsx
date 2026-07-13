import React, { useState, useEffect } from "react";
import { FileText, Send, User, Mail, HelpCircle, ClipboardCheck, ArrowRight, CheckCircle2, Clock, Plus, Trash2, AlertTriangle, Pencil } from "lucide-react";
import SignaturePad from "./SignaturePad";
import { DocumentHandover } from "../types";
import { motion } from "motion/react";

interface HandoverFormProps {
  onSuccessSubmit: (newDoc: DocumentHandover) => void;
  triggerPushNotification: (title: string, msg: string) => void;
  documents?: DocumentHandover[];
}

const HARDCODED_SUPERVISORS = [
  { name: "dr. Budy Azis B, Sp.PK.,M.H.", email: "budy.azis@company.com" },
  { name: "Aripuddin Maskur, S.E.,M.M", email: "aripuddin.maskur@company.com" }
];

export default function HandoverForm({ onSuccessSubmit, triggerPushNotification, documents = [] }: HandoverFormProps) {
  // Hardcoded recipient positions
  const recipientPositions = [
    { name: "AWS Indonesia Sales", email: "sales@aws.co.id" },
    { name: "Sekretaris Direktur", email: "sekretaris.direktur@company.com" },
    { name: "Sekretaris Wadir", email: "sekretaris.wadir@company.com" },
    { name: "Kabag", email: "kabag@company.com" },
    { name: "Kabid", email: "kabid@company.com" },
    { name: "Admin Unit", email: "admin.unit@company.com" },
    { name: "Umum", email: "umum@company.com" }
  ];

  // Hardcoded recipient persons
  const recipientPersons = [
    { name: "AWS Indonesia Sales", email: "sales@aws.co.id" },
    { name: "Aina Mardiana", email: "aina.mardiana@company.com" },
    { name: "Wafiq Khalifatul Azizah, SKM.,M.Kes", email: "wafiq.khalifatul@company.com" }
  ];

  // Form fields
  const [title, setTitle] = useState(() => localStorage.getItem("handover_form_title") || "Berkas Kontrak Vendor Cloud AWS");
  const [description, setDescription] = useState(() => localStorage.getItem("handover_form_description") || "Dokumen fisik kontrak sewa server AWS Enterprise Cloud Tier selama 12 bulan.");
  const [category, setCategory] = useState(() => localStorage.getItem("handover_form_category") || "Kontrak & Kerjasama");
  const [senderName, setSenderName] = useState(() => localStorage.getItem("handover_form_senderName") || "Meidi Priandana");
  const [senderEmail, setSenderEmail] = useState(() => localStorage.getItem("handover_form_senderEmail") || "meidipriandana@gmail.com");
  const [recipientName, setRecipientName] = useState(() => localStorage.getItem("handover_form_recipientName") || "AWS Indonesia Sales");
  const [recipientPersonName, setRecipientPersonName] = useState(() => localStorage.getItem("handover_form_recipientPersonName") || "AWS Indonesia Sales");
  const [recipientEmail, setRecipientEmail] = useState(() => localStorage.getItem("handover_form_recipientEmail") || "sales@aws.co.id");
  
  const [supervisor1, setSupervisor1] = useState(() => {
    const saved = localStorage.getItem("handover_form_supervisor1");
    if (saved && HARDCODED_SUPERVISORS.some(s => s.name === saved)) {
      return saved;
    }
    return HARDCODED_SUPERVISORS[0].name;
  });
  
  const [supervisor2, setSupervisor2] = useState(() => {
    const saved = localStorage.getItem("handover_form_supervisor2");
    if (saved && HARDCODED_SUPERVISORS.some(s => s.name === saved)) {
      return saved;
    }
    return "";
  });
  
  const [supervisor3, setSupervisor3] = useState(() => {
    const saved = localStorage.getItem("handover_form_supervisor3");
    if (saved && HARDCODED_SUPERVISORS.some(s => s.name === saved)) {
      return saved;
    }
    return "";
  });
  
  const [senderSignature, setSenderSignature] = useState(() => localStorage.getItem("handover_form_senderSignature") || "");
  
  // Dynamic list of items/documents to hand over
  const [items, setItems] = useState<string[]>(() => {
    const saved = localStorage.getItem("handover_form_items");
    return saved ? JSON.parse(saved) : [];
  });
  const [newItemName, setNewItemName] = useState("");
  const [checkedItems, setCheckedItems] = useState<Record<string, { returned: boolean; timestamp: string }>>(() => {
    const saved = localStorage.getItem("handover_form_checkedItems");
    return saved ? JSON.parse(saved) : {};
  });
  
  useEffect(() => {
    localStorage.setItem("handover_form_senderName", senderName);
  }, [senderName]);

  useEffect(() => {
    localStorage.setItem("handover_form_senderEmail", senderEmail);
  }, [senderEmail]);

  // Auto-save form fields to localStorage
  useEffect(() => {
    localStorage.setItem("handover_form_title", title);
  }, [title]);

  useEffect(() => {
    localStorage.setItem("handover_form_description", description);
  }, [description]);

  useEffect(() => {
    localStorage.setItem("handover_form_category", category);
  }, [category]);

  useEffect(() => {
    localStorage.setItem("handover_form_recipientName", recipientName);
  }, [recipientName]);

  useEffect(() => {
    localStorage.setItem("handover_form_recipientPersonName", recipientPersonName);
  }, [recipientPersonName]);

  useEffect(() => {
    localStorage.setItem("handover_form_recipientEmail", recipientEmail);
  }, [recipientEmail]);

  useEffect(() => {
    localStorage.setItem("handover_form_supervisor1", supervisor1);
  }, [supervisor1]);

  useEffect(() => {
    localStorage.setItem("handover_form_supervisor2", supervisor2);
  }, [supervisor2]);

  useEffect(() => {
    localStorage.setItem("handover_form_supervisor3", supervisor3);
  }, [supervisor3]);

  useEffect(() => {
    localStorage.setItem("handover_form_senderSignature", senderSignature);
  }, [senderSignature]);

  useEffect(() => {
    localStorage.setItem("handover_form_items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("handover_form_checkedItems", JSON.stringify(checkedItems));
  }, [checkedItems]);

  useEffect(() => {
    let changed = false;
    const newChecked = { ...checkedItems };
    items.forEach(item => {
      if (newChecked[item] === undefined) {
        const now = new Date();
        const freezeDate = now.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric"
        });
        const freezeTime = now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
        newChecked[item] = {
          returned: true,
          timestamp: `${freezeDate}, ${freezeTime} WIB`
        };
        changed = true;
      }
    });
    if (changed) {
      setCheckedItems(newChecked);
    }
  }, [items]);
  
  // Inline editing state for document items
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  
  // View mode state ("list" or "table") for displaying documents
  const [viewMode, setViewMode] = useState<"list" | "table">(() => {
    return (localStorage.getItem("handover_form_viewMode") as "list" | "table") || "list";
  });

  useEffect(() => {
    localStorage.setItem("handover_form_viewMode", viewMode);
  }, [viewMode]);

  // Helper to parse complex concatenated item label safely
  const parseItemLabel = (fullLabel: string) => {
    let titlePart = fullLabel;
    let categoryPart = "";
    let descPart = "";

    // Regex to match "Title [Category] - Description" or "Title [Category]"
    const categoryMatch = fullLabel.match(/^(.+?)\s*\[([^\]]+)\](?:\s*-\s*(.*))?$/);
    if (categoryMatch) {
      titlePart = categoryMatch[1].trim();
      categoryPart = categoryMatch[2].trim();
      descPart = categoryMatch[3] ? categoryMatch[3].trim() : "";
    } else {
      // Fallback regex if there is no category but description starts with " - "
      const descIndex = fullLabel.indexOf(" - ");
      if (descIndex !== -1) {
        titlePart = fullLabel.substring(0, descIndex).trim();
        descPart = fullLabel.substring(descIndex + 3).trim();
      }
    }

    return {
      title: titlePart,
      category: categoryPart,
      description: descPart
    };
  };
  
  // Function to explicitly add filled document data to the items list
  const handleAddItem = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!title.trim()) {
      alert("Harap isi Judul Berkas / Unit Barang terlebih dahulu!");
      return;
    }

    const itemLabel = `${title.trim()} [${category}]${description.trim() ? ' - ' + description.trim() : ''}`;
    setItems(prev => [...prev, itemLabel]);

    // Clear input fields for next document entry
    setTitle("");
    setDescription("");
  };
  
  // State variables for process UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successDoc, setSuccessDoc] = useState<DocumentHandover | null>(null);

  // Real-time clock for submission
  const [realTime, setRealTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hardcoded supervisor list
  const supervisors = HARDCODED_SUPERVISORS;

  // Hardcoded categories
  const categories = [
    "Kontrak & Kerjasama",
    "Telaah Diklat/Pelatihan",
    "SPJ Diklat",
    "SK (Surat Keputusan)"
  ];

  const handleSignatureSave = (dataUrl: string) => {
    setSenderSignature(dataUrl);
  };

  const handleSignatureClear = () => {
    setSenderSignature("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let mainTitle = title.trim();
    let mainDesc = description.trim();

    let finalItems: string[] = [];
    if (items.length === 0) {
      if (mainTitle) {
        const itemLabel = `${mainTitle} [${category}]${mainDesc ? ' - ' + mainDesc : ''}`;
        finalItems.push(itemLabel);
      }
    } else {
      const checkedList = items.filter(item => checkedItems[item]?.returned);
      if (checkedList.length === 0) {
        alert("Harap contreng/pilih minimal 1 berkas dalam daftar untuk dikirim!");
        return;
      }
      finalItems = checkedList;
    }

    if (finalItems.length === 0) {
      alert("Harap masukkan minimal 1 berkas dengan mengisi Detail Berkas dan mengklik tombol 'Tambah Berkas' terlebih dahulu!");
      return;
    }

    // Determine overall document title
    if (!mainTitle) {
      // Extract clean title from the first added item (removing the category tag [..])
      mainTitle = finalItems[0].split(" [")[0] || "Serah Terima Berkas Digital";
    }

    if (!recipientEmail.trim()) {
      alert("Harap isi Email Penerima");
      return;
    }
    if (!senderSignature) {
      alert("Harap gambar tanda tangan Anda terlebih dahulu untuk verifikasi keamanan!");
      return;
    }

    // Combine selected supervisors
    const chosenSups = [
      supervisors.find(s => s.name === supervisor1),
      supervisors.find(s => s.name === supervisor2),
      supervisors.find(s => s.name === supervisor3)
    ].filter(Boolean) as { name: string; email: string }[];

    const finalSupervisorName = chosenSups.map(s => s.name).join("; ");
    const finalSupervisorEmail = chosenSups.map(s => s.email).join("; ");

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: mainTitle,
          description: mainDesc || `Serah Terima ${finalItems.length} Berkas`,
          category,
          senderName,
          senderEmail,
          recipientName: `${recipientPersonName} (${recipientName})`,
          recipientEmail,
          supervisorName: finalSupervisorName || supervisors[0].name,
          supervisorEmail: finalSupervisorEmail || supervisors[0].email,
          senderSignature,
          items: finalItems
        })
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan dokumen ke database");
      }

      const newDoc: DocumentHandover = await response.json();
      setSuccessDoc(newDoc);
      onSuccessSubmit(newDoc);
      
      triggerPushNotification(
        "Pengajuan Serah Terima Terkirim",
        `Dokumen '${newDoc.title}' telah berhasil didaftarkan. Alur dialihkan ke Admin untuk verifikasi & TTD pertama.`
      );

      // Reset form
      setTitle("");
      setDescription("");
      setRecipientName("Sekretaris Direktur");
      setRecipientPersonName("Aina Mardiana");
      setRecipientEmail("aina.mardiana@company.com");
      setSenderSignature("");
      
      if (items.length > 0) {
        const remainingItems = items.filter(item => !checkedItems[item]?.returned);
        setItems(remainingItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Terjadi kesalahan saat memproses data. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSuccess = () => {
    setSuccessDoc(null);
  };

  if (successDoc) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto text-center" 
        id="success-submitted-card"
      >
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 relative">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 15 }}
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-emerald-400/30 -z-10"
          />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Serah Terima Berhasil Diajukan!</h2>
        <p className="text-sm text-slate-500 mt-2">
          Dokumen Anda telah masuk ke antrean verifikasi Admin. Untuk melengkapi serah terima, Admin wajib menandatanganinya terlebih dahulu sebelum diteruskan ke Atasan yang bersangkutan.
        </p>

        {/* Info Box */}
        <div className="mt-6 bg-slate-50 rounded-lg p-4 border border-slate-100 text-left space-y-2.5 text-xs">
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-400">Judul Berkas:</span>
            <span className="font-semibold text-slate-800">{successDoc.title}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-400">Kode Verifikasi:</span>
            <span className="font-mono font-bold text-indigo-600">{successDoc.verificationCode}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-400">Atasan Penyetuju:</span>
            <span className="font-semibold text-slate-800">{successDoc.supervisorName}</span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-slate-400">Status Saat Ini:</span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold text-[10px]">Menunggu Admin</span>
          </div>
        </div>

        {/* Action flow instruction */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100 text-left">
          <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
            Langkah Selanjutnya (Simulasi Alur):
          </h4>
          <p className="text-xs text-purple-700 mt-1">
            Ganti peran Anda menjadi <span className="font-bold">Sistem Admin</span> pada bagian atas layar untuk memverifikasi dokumen ini, membubuhkan tanda tangan Admin, dan melanjutkannya ke Atasan!
          </p>
        </div>

        <button
          onClick={resetSuccess}
          id="btn-create-new-handover"
          className="mt-6 w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition shadow-sm cursor-pointer"
        >
          Buat Pengajuan Baru
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" id="handover-form">
      {/* Header Form - Removed as requested */}

      <div className="p-6 space-y-6">
        {/* Section 1: Detail Berkas */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            1. Detail Berkas Serah Terima
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center">
                Judul Berkas / Unit Barang <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="text"
                required={items.length === 0}
                placeholder="Contoh: Laptop Macbook Pro M3 Staff IT, Berkas Kontrak AWS, dll"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                id="form-input-title"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400 transition"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Kategori Berkas</label>
              <select
                value={category}
                onChange={(e) => {
                  const val = e.target.value;
                  setCategory(val);
                  
                  // Dynamically adjust title and description based on selected category to prevent mismatch
                  if (val === "SPJ Diklat") {
                    setTitle("Laporan SPJ Kegiatan Pelatihan & Diklat");
                    setDescription("Berkas laporan pertanggungjawaban (SPJ) kegiatan diklat dan pelatihan, meliputi berkas kelengkapan administrasi, surat tugas, sertifikat, rincian biaya, dan dokumentasi pelaksanaan kegiatan.");
                  } else if (val === "Telaah Diklat/Pelatihan") {
                    setTitle("Telaah Staf Pengajuan Diklat Eksternal");
                    setDescription("Dokumen telaah staf pengajuan diklat/pelatihan eksternal bagi pegawai RSUD.");
                  } else if (val === "SK (Surat Keputusan)") {
                    setTitle("Surat Keputusan (SK) Tugas Belajar / Pelatihan");
                    setDescription("Dokumen Surat Keputusan (SK) resmi direksi terkait tugas belajar dan pelatihan pegawai.");
                  } else if (val === "Kontrak & Kerjasama") {
                    setTitle("Berkas Kontrak Vendor Cloud AWS");
                    setDescription("Dokumen fisik kontrak sewa server AWS Enterprise Cloud Tier selama 12 bulan.");
                  }
                }}
                id="form-select-category"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 transition bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-bold text-slate-700">Deskripsi / Keterangan Detil Berkas</label>
              <textarea
                rows={3}
                placeholder="Tuliskan keterangan detail, kelengkapan, nomor seri barang, atau poin kontrak penting di sini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                id="form-textarea-desc"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400 transition resize-none"
              />
            </div>

            {/* Tambah Berkas Button */}
            <div className="md:col-span-3 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 bg-slate-50 p-3.5 rounded-xl border border-dashed border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold leading-normal text-center sm:text-left">
                {items.length > 0 ? (
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1.5 justify-center sm:justify-start">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sudah ada {items.length} berkas ditambahkan ke dalam daftar serah terima di bawah.
                  </span>
                ) : (
                  "Setelah mengisi detail berkas di atas, klik Tambah Berkas untuk memasukkannya ke daftar."
                )}
              </span>
              <button
                type="button"
                onClick={(e) => handleAddItem(e)}
                id="btn-add-item-to-list"
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs px-5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-3xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                Tambah Berkas (Siap)
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Pihak Terkait */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            2. Pihak Terkait &amp; Alur Persetujuan
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Staff / Pengaju (Pihak Pertama) */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/60 space-y-3">
              <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-sm">Pihak Pertama (Pengaju)</span>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1 text-slate-400" /> Nama Staff
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  id="form-input-sender-name"
                  className="w-full text-xs border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" /> Email Staff
                </label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  id="form-input-sender-email"
                  className="w-full text-xs border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            {/* Penerima Berkas (Pihak Kedua) */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/60 space-y-3">
              <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-100/60 px-2 py-0.5 rounded-sm">Pihak Penerima (Pilih Jabatan & Nama)</span>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1 text-slate-400" /> Jabatan Penerima <span className="text-red-500 ml-0.5">*</span>
                </label>
                <select
                  value={recipientName}
                  onChange={(e) => {
                    const selected = recipientPositions.find(p => p.name === e.target.value);
                    if (selected) {
                      setRecipientName(selected.name);
                    }
                  }}
                  id="form-select-recipient-position"
                  className="w-full text-xs border border-slate-300 bg-white text-slate-800 rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  {recipientPositions.map((pos) => (
                    <option key={pos.name} value={pos.name}>{pos.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1 text-slate-400" /> Nama Penerima <span className="text-red-500 ml-0.5">*</span>
                </label>
                <select
                  value={recipientPersonName}
                  onChange={(e) => {
                    const selected = recipientPersons.find(p => p.name === e.target.value);
                    if (selected) {
                      setRecipientPersonName(selected.name);
                      setRecipientEmail(selected.email);
                    }
                  }}
                  id="form-select-recipient-person"
                  className="w-full text-xs border border-slate-300 bg-white text-slate-800 rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  {recipientPersons.map((person) => (
                    <option key={person.name} value={person.name}>{person.name}</option>
                  ))}
                </select>
              </div>

              {/* Atasan Penyetuju Akhir (Pilih sampai 3 Atasan) */}
              <div className="space-y-2.5 border-t border-slate-200/60 pt-3 mt-3">
                <label className="text-[11px] font-bold text-slate-700 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-650 mr-1.5 animate-pulse"></span>
                  Atasan Penyetuju Akhir <span className="text-red-500 ml-0.5">*</span>
                </label>
                <p className="text-[9px] text-slate-500 font-semibold leading-normal">
                  Pilih Atasan untuk memberikan persetujuan TTD akhir (bisa pilih sampai 3 Atasan).
                </p>
                
                <div className="space-y-2">
                  {/* Atasan 1 */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-purple-700 bg-purple-50 border border-purple-150 px-1.5 py-0.5 rounded uppercase">Atasan Pilihan 1 (Utama)</span>
                    <select
                      value={supervisor1}
                      onChange={(e) => setSupervisor1(e.target.value)}
                      className="w-full text-xs border border-slate-300 bg-white text-slate-800 rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-semibold"
                    >
                      {supervisors.map((s, index) => (
                        <option key={index} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Atasan 2 */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded uppercase">Atasan Pilihan 2 (Opsional)</span>
                    <select
                      value={supervisor2}
                      onChange={(e) => setSupervisor2(e.target.value)}
                      className="w-full text-xs border border-slate-300 bg-white text-slate-800 rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-semibold"
                    >
                      <option value="">-- Kosong / Tidak Ada --</option>
                      {supervisors.map((s, index) => (
                        <option key={index} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Atasan 3 */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded uppercase">Atasan Pilihan 3 (Opsional)</span>
                    <select
                      value={supervisor3}
                      onChange={(e) => setSupervisor3(e.target.value)}
                      className="w-full text-xs border border-slate-300 bg-white text-slate-800 rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-semibold"
                    >
                      <option value="">-- Kosong / Tidak Ada --</option>
                      {supervisors.map((s, index) => (
                        <option key={index} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Alur Tanda Tangan Berkas & Waktu Real-time */}
            <div className="md:col-span-2 p-5 bg-indigo-50/45 rounded-xl border border-indigo-100/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100/60">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 bg-indigo-600 rounded-md text-white">
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wide">
                      Urutan Berkas &amp; Waktu Real-time
                    </h4>
                    <p className="text-[10px] text-indigo-600 font-medium">Urutan berkas yang akan ditandatangani</p>
                  </div>
                </div>
                
                {/* View Mode Toggle Switcher */}
                <div className="flex items-center gap-1 bg-indigo-100 p-0.5 rounded-lg border border-indigo-200/40 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`px-2 py-1 text-[9px] font-black uppercase rounded-md transition cursor-pointer ${viewMode === "list" ? "bg-white text-indigo-700 shadow-3xs" : "text-indigo-600/80 hover:text-indigo-800"}`}
                  >
                    Rapat/Slim
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`px-2 py-1 text-[9px] font-black uppercase rounded-md transition cursor-pointer ${viewMode === "table" ? "bg-white text-indigo-700 shadow-3xs" : "text-indigo-600/80 hover:text-indigo-800"}`}
                  >
                    Tabel (Landscape)
                  </button>
                </div>

                {/* Real-time Clock Badge */}
                <div className="bg-indigo-600 text-white px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span className="text-[10px] font-mono font-bold tracking-wider">
                    {realTime.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })} &bull; {realTime.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
                  </span>
                </div>
              </div>

              {/* View Mode Content Wrapper */}
              {items.length === 0 ? (
                <div className="text-center text-slate-400 py-8 text-xs italic">
                  Belum ada rincian berkas yang dimasukkan di bagian Detail Berkas.
                </div>
              ) : viewMode === "list" ? (
                /* 1. Timeline / List View mode (highly polished & tidied up) */
                <div className="space-y-4 relative before:absolute before:bottom-2 before:top-2 before:left-3.5 before:w-0.5 before:bg-indigo-100/70">
                  {items.map((item, idx) => {
                    const parsed = parseItemLabel(item);
                    const itemState = checkedItems[item] || { returned: false, timestamp: "" };
                    const isChecked = itemState.returned;

                    const itemSecondsOffset = idx * 10;
                    const itemTime = new Date(realTime.getTime() + itemSecondsOffset * 1000);
                    const formattedDate = itemTime.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    });
                    const formattedTime = itemTime.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    });

                    const currentRealTimeStr = `${formattedDate}, ${formattedTime} WIB`;

                    return (
                      <div key={idx} className="flex gap-3 text-xs relative z-10">
                        <div className={`w-7 h-7 rounded-full border-2 border-white text-white flex items-center justify-center font-extrabold shrink-0 text-[10px] shadow-xs transition-colors duration-350 ${isChecked ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'}`}>
                          {idx + 1}
                        </div>
                        <div className={`flex-1 min-w-0 p-4 rounded-xl border transition-all duration-300 ${isChecked ? 'bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-800 shadow-3xs' : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 shadow-3xs opacity-60'}`}>
                          
                          {/* Top row: Checkbox, parsed title and badges/actions */}
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-2.5 cursor-pointer select-none group min-w-0 flex-1">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    if (checked) {
                                      const now = new Date();
                                      const freezeDate = now.toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric"
                                      });
                                      const freezeTime = now.toLocaleTimeString("id-ID", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit"
                                      });
                                      setCheckedItems(prev => ({
                                        ...prev,
                                        [item]: {
                                          returned: true,
                                          timestamp: `${freezeDate}, ${freezeTime} WIB`
                                        }
                                      }));
                                    } else {
                                      setCheckedItems(prev => ({
                                        ...prev,
                                        [item]: {
                                          returned: false,
                                          timestamp: ""
                                        }
                                      }));
                                    }
                                  }}
                                  className="mt-0.5 w-4.5 h-4.5 rounded text-emerald-600 bg-slate-50 border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600 shrink-0 transition"
                                />
                                {editingIdx === idx ? (
                                  <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        if (editValue.trim()) {
                                          const updated = [...items];
                                          updated[idx] = editValue.trim();
                                          setItems(updated);
                                          if (idx === 0) {
                                            setTitle(editValue.trim());
                                          }
                                          setEditingIdx(null);
                                        }
                                      } else if (e.key === "Escape") {
                                        setEditingIdx(null);
                                      }
                                    }}
                                    onBlur={() => {
                                      if (editValue.trim()) {
                                        const updated = [...items];
                                        updated[idx] = editValue.trim();
                                        setItems(updated);
                                        if (idx === 0) {
                                          setTitle(editValue.trim());
                                        }
                                      }
                                      setEditingIdx(null);
                                    }}
                                    className="px-1.5 py-0.5 text-xs border border-indigo-300 rounded bg-white text-slate-800 font-bold focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-full"
                                    autoFocus
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                  />
                                ) : (
                                  <div className="space-y-1 min-w-0 flex-1">
                                    <span className={`font-black text-xs leading-normal transition-all duration-350 block break-words text-slate-850 dark:text-slate-100 group-hover:text-indigo-900 dark:group-hover:text-indigo-300 ${isChecked ? '' : 'text-slate-450 dark:text-slate-500 line-through decoration-slate-400 dark:decoration-slate-600 decoration-1 italic'}`}>
                                      {parsed.title}
                                    </span>
                                    {parsed.category && (
                                      <span className="inline-block text-[8px] font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded uppercase tracking-wider border border-indigo-100/50 dark:border-indigo-900/30">
                                        Kategori: {parsed.category}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </label>

                              {/* Action Buttons & Badges */}
                              <div className="flex items-center gap-1 shrink-0 bg-slate-50 dark:bg-slate-850 p-1 rounded-lg border border-slate-100 dark:border-slate-800">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setEditingIdx(idx);
                                    setEditValue(item);
                                  }}
                                  className="p-1 hover:bg-white dark:hover:bg-slate-850 hover:text-indigo-600 hover:shadow-3xs rounded text-slate-400 dark:text-slate-500 transition cursor-pointer"
                                  title="Edit nama berkas"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const updated = items.filter((_, i) => i !== idx);
                                    setItems(updated);
                                  }}
                                  className="p-1 hover:bg-white dark:hover:bg-slate-850 hover:text-red-500 hover:shadow-3xs rounded text-slate-400 dark:text-slate-500 transition cursor-pointer"
                                  title="Hapus berkas"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Separated Description/Details block - tidy, slim, spacious */}
                            {parsed.description && (
                              <div className="bg-slate-50/70 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed font-medium break-words">
                                <span className="font-extrabold text-[8px] text-slate-400 dark:text-slate-500 block uppercase tracking-wider mb-1">Rincian Berkas:</span>
                                {parsed.description}
                              </div>
                            )}

                            {/* Pihak Terkait row */}
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50/40 dark:bg-slate-950/10 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 px-1.5 py-0.2 rounded uppercase">Pihak I</span>
                                <span className="font-extrabold text-slate-700 dark:text-slate-300">{senderName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 px-1.5 py-0.2 rounded uppercase">Pihak II</span>
                                <span className="font-extrabold text-slate-700 dark:text-slate-300">{recipientPersonName} <span className="text-slate-400 dark:text-slate-500 font-medium">({recipientName})</span></span>
                              </div>
                            </div>

                            {/* Live Clock / Frozen Timestamp Badge */}
                            <div className="flex items-center justify-between gap-2 border-t border-dashed border-slate-100 dark:border-slate-800 pt-2.5">
                              <div className={`flex items-center gap-1 text-[8px] font-bold border px-2 py-0.8 rounded shadow-4xs transition-all duration-350 ${isChecked ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                                <CheckCircle2 className={`w-3 h-3 shrink-0 ${isChecked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                                <span className="whitespace-nowrap">{isChecked ? 'Siap Kirim (Tercontreng) ✔' : 'Ditangguhkan (Tidak Kirim)'}</span>
                              </div>

                              {isChecked ? (
                                <div className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                                  <span className="font-mono bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/30">
                                    {itemState.timestamp}
                                  </span>
                                </div>
                              ) : (
                                <div className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                                  <span className="font-mono bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-100/30 dark:border-indigo-900/30">
                                    {currentRealTimeStr}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* 2. Landscape Table view mode (scrolling table - ideal for widescreen / landscape swipes) */
                <div className="overflow-x-auto rounded-xl border border-indigo-100/60 bg-white shadow-3xs" id="landscape-table-container">
                  <table className="min-w-[850px] w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-indigo-50 border-b border-indigo-100/80 text-indigo-950 font-black uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3.5 w-12 text-center">No</th>
                        <th className="py-3 px-3.5 w-2/5">Detail Berkas / Judul &amp; Keterangan</th>
                        <th className="py-3 px-3.5">Kategori</th>
                        <th className="py-3 px-3.5">Pihak Terkait</th>
                        <th className="py-3 px-3.5">Status &amp; Jam Real-time</th>
                        <th className="py-3 px-3.5 w-24 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, idx) => {
                        const parsed = parseItemLabel(item);
                        const itemState = checkedItems[item] || { returned: false, timestamp: "" };
                        const isChecked = itemState.returned;

                        const itemSecondsOffset = idx * 10;
                        const itemTime = new Date(realTime.getTime() + itemSecondsOffset * 1000);
                        const formattedDate = itemTime.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
                        const formattedTime = itemTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                        const currentRealTimeStr = `${formattedDate}, ${formattedTime} WIB`;

                        return (
                          <tr key={idx} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors ${isChecked ? 'bg-emerald-50/10 dark:bg-emerald-950/5' : 'opacity-60 bg-slate-50/40 dark:bg-slate-900/20'}`}>
                            {/* No */}
                            <td className="py-3 px-3.5 font-bold text-slate-600 dark:text-slate-450 text-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[10px] mx-auto text-white ${isChecked ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'}`}>
                                {idx + 1}
                              </div>
                            </td>

                            {/* Title & Description */}
                            <td className="py-3 px-3.5 max-w-[320px]">
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      if (checked) {
                                        const now = new Date();
                                        const freezeDate = now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
                                        const freezeTime = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                                        setCheckedItems(prev => ({
                                          ...prev,
                                          [item]: { returned: true, timestamp: `${freezeDate}, ${freezeTime} WIB` }
                                        }));
                                      } else {
                                        setCheckedItems(prev => ({
                                          ...prev,
                                          [item]: { returned: false, timestamp: "" }
                                        }));
                                      }
                                    }}
                                    className="mt-0.5 w-4 h-4 rounded text-emerald-600 border-slate-300 dark:border-slate-700 focus:ring-emerald-500 cursor-pointer"
                                  />
                                  {editingIdx === idx ? (
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onBlur={() => {
                                        if (editValue.trim()) {
                                          const updated = [...items];
                                          updated[idx] = editValue.trim();
                                          setItems(updated);
                                        }
                                        setEditingIdx(null);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          if (editValue.trim()) {
                                            const updated = [...items];
                                            updated[idx] = editValue.trim();
                                            setItems(updated);
                                          }
                                          setEditingIdx(null);
                                        }
                                      }}
                                      className="px-1.5 py-0.5 text-xs border border-indigo-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold w-full"
                                      autoFocus
                                    />
                                  ) : (
                                    <span className={`font-black text-xs text-slate-800 dark:text-slate-200 leading-normal break-words ${isChecked ? '' : 'text-slate-450 dark:text-slate-500 line-through decoration-slate-400 dark:decoration-slate-600 decoration-1 italic font-medium'}`}>
                                      {parsed.title}
                                    </span>
                                  )}
                                </div>
                                {parsed.description && (
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pl-6.5 leading-relaxed break-words">
                                    {parsed.description}
                                  </p>
                                )}
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3 px-3.5">
                              <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100/50 dark:border-indigo-900/30 whitespace-nowrap">
                                {parsed.category || "General"}
                              </span>
                            </td>

                            {/* Pihak Terkait */}
                            <td className="py-3 px-3.5 text-[10px] text-slate-600 dark:text-slate-300 font-semibold space-y-1 whitespace-nowrap">
                              <div><span className="text-slate-400 dark:text-slate-500 font-bold">Pihak I:</span> {senderName}</div>
                              <div><span className="text-slate-400 dark:text-slate-500 font-bold">Pihak II:</span> {recipientPersonName}</div>
                            </td>

                            {/* Status & Time */}
                            <td className="py-3 px-3.5 font-bold">
                              <div className="space-y-1.5">
                                <div className={`flex items-center gap-1 text-[8px] border px-1.5 py-0.5 rounded shadow-4xs w-fit ${isChecked ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>{isChecked ? 'Siap Kirim ✔' : 'Tidak Kirim'}</span>
                                </div>
                                <div className="text-[9px] font-mono text-slate-500 dark:text-slate-450">
                                  {isChecked ? itemState.timestamp : currentRealTimeStr}
                                </div>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-3.5 text-center">
                              <div className="flex items-center justify-center gap-1 bg-slate-50 dark:bg-slate-850 p-1 rounded-lg border border-slate-100 dark:border-slate-800 w-fit mx-auto">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingIdx(idx);
                                    setEditValue(item);
                                  }}
                                  className="p-1 hover:bg-white dark:hover:bg-slate-750 hover:text-indigo-600 hover:shadow-3xs rounded text-slate-400 dark:text-slate-500 transition cursor-pointer"
                                  title="Edit nama berkas"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = items.filter((_, i) => i !== idx);
                                    setItems(updated);
                                  }}
                                  className="p-1 hover:bg-white dark:hover:bg-slate-750 hover:text-red-500 hover:shadow-3xs rounded text-slate-400 dark:text-slate-500 transition cursor-pointer"
                                  title="Hapus berkas"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Inline button to add a new document to the list */}
              {items.length > 0 && (
                <div className="flex justify-end pr-2 pb-1 relative z-10">
                  <button
                    type="button"
                    onClick={() => {
                      const nextNum = items.length + 1;
                      setItems([...items, `Berkas Tambahan ${nextNum} [Telaah Diklat/Pelatihan]`]);
                    }}
                    className="px-2.5 py-1 text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold rounded-lg border border-indigo-200/60 flex items-center gap-1 transition cursor-pointer shadow-3xs"
                  >
                    <Plus className="w-3 h-3" /> Tambah Berkas
                  </button>
                </div>
              )}

              {/* Atasan Penyetuju Akhir */}
              <div className="flex gap-3 text-xs relative z-10 pt-3 border-t border-indigo-100/50">
                <div className="w-7 h-7 rounded-full bg-purple-100 border-2 border-white text-purple-700 flex items-center justify-center font-bold shrink-0 text-[10px] shadow-sm">
                  ★
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <span className="font-bold text-purple-900">Atasan Penyetuju Akhir</span>
                    <span className="text-[8px] font-extrabold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full uppercase shrink-0">
                      Alur Persetujuan TTD
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 bg-white p-3 rounded-lg border border-indigo-100/50 shadow-3xs">
                    {[supervisor1, supervisor2, supervisor3].filter(Boolean).map((name, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-700 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        <span>Atasan {idx + 1}: <span className="text-slate-900 font-bold">{name}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Section 3: Tanda Tangan Elektronik */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            3. Tanda Tangan Elektronik Pengaju <span className="text-red-500 ml-0.5">*</span>
          </h3>
          <p className="text-[11px] text-slate-500 mb-2">
            Silakan bubuhkan tanda tangan digital Anda di bawah ini sebagai pihak pertama (pengaju).
          </p>
          <SignaturePad 
            onSave={handleSignatureSave} 
            onClear={handleSignatureClear}
            placeholder="Tulis tanda tangan Anda (Staff Pengaju) di sini..."
            initialValue={senderSignature}
          />
        </div>
      </div>

      {/* Footer Form */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="text-xs text-slate-400 hidden sm:block flex items-center">
          <ClipboardCheck className="w-4 h-4 mr-1 text-slate-400 inline" /> Seluruh data terenkripsi SHA-256.
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          id="btn-submit-handover"
          className="w-full sm:w-auto ml-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
        >
          {isSubmitting ? (
            "Memproses..."
          ) : (
            <>
              Kirim ke Admin
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </form>
    </div>
  );
}
