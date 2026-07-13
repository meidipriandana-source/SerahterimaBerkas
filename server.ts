import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { DocumentHandover, ActivityLog, PushNotification } from "./src/types";

// Database filepath for persistence
const DB_FILE = path.join(process.cwd(), "db.json");

// Helper to load database
function loadDb() {
  const defaultDb = {
    documents: [] as DocumentHandover[],
    logs: [] as ActivityLog[],
    notifications: [] as PushNotification[]
  };
  
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Failed to load db.json, using defaults:", error);
  }
  return defaultDb;
}

// Helper to save database
function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save db.json:", error);
  }
}

// Seed initial documents if empty
function seedDbIfEmpty(db: any) {
  if (db.documents.length === 0) {
    const doc1: DocumentHandover = {
      id: "doc-101",
      title: "Laptop Macbook Pro M3 Staff IT",
      description: "Serah terima unit laptop kerja Macbook Pro M3, charger 96W, dan USB-C cable untuk Senior FE Developer.",
      category: "Inventaris Kantor",
      timestamp: new Date(Date.now() - 3 * 3600 * 1000 * 24).toISOString(), // 3 days ago
      senderName: "Meidi Priandana",
      senderEmail: "meidipriandana@gmail.com",
      senderSignature: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='50'><path d='M10,25 Q30,10 50,25 T90,25' stroke='black' stroke-width='2' fill='none'/></svg>",
      recipientName: "Aina Mardiana (Sekretaris Direktur)",
      recipientEmail: "aina.mardiana@company.com",
      supervisorName: "dr. Budy Azis B, Sp.PK.,M.H.",
      supervisorEmail: "budy.azis@company.com",
      supervisorSignature: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='50'><path d='M10,20 Q40,30 50,10 T90,30' stroke='black' stroke-width='2' fill='none'/></svg>",
      supervisorSignatures: { "dr. Budy Azis B, Sp.PK.,M.H.": "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='50'><path d='M10,20 Q40,30 50,10 T90,30' stroke='black' stroke-width='2' fill='none'/></svg>" },
      adminSignature: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='50'><path d='M10,30 C30,10 70,40 90,20' stroke='darkblue' stroke-width='2' fill='none'/></svg>",
      status: "completed",
      verificationCode: "ST-88C9-D3E4",
      sheetsSynced: true,
      driveSynced: true,
      emailSent: true,
      pdfUrl: "/api/download-pdf/doc-101"
    };

    const doc2: DocumentHandover = {
      id: "doc-102",
      title: "Berkas Kontrak Vendor Cloud AWS",
      description: "Dokumen fisik kontrak sewa server AWS Enterprise Cloud Tier selama 12 bulan.",
      category: "Kontrak & Kerjasama",
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
      senderName: "Meidi Priandana",
      senderEmail: "meidipriandana@gmail.com",
      senderSignature: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='50'><path d='M10,25 Q30,10 50,25 T90,25' stroke='black' stroke-width='2' fill='none'/></svg>",
      recipientName: "AWS Indonesia Sales",
      recipientEmail: "sales@aws.co.id",
      supervisorName: "Aripuddin Maskur, S.E.,M.M",
      supervisorEmail: "aripuddin.maskur@company.com",
      supervisorSignature: null,
      supervisorSignatures: { "Aripuddin Maskur, S.E.,M.M": null },
      adminSignature: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='50'><path d='M10,30 C30,10 70,40 90,20' stroke='darkblue' stroke-width='2' fill='none'/></svg>",
      status: "pending_atasan",
      verificationCode: "ST-AF31-889B",
      sheetsSynced: true,
      driveSynced: false,
      emailSent: false,
      pdfUrl: "/api/download-pdf/doc-102"
    };

    const doc3: DocumentHandover = {
      id: "doc-103",
      title: "Laporan Keuangan Audit Q2 2026",
      description: "Laporan neraca keuangan, rugi laba, dan bukti transaksi triwulan kedua yang telah diaudit.",
      category: "Laporan Keuangan",
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 mins ago
      senderName: "Meidi Priandana",
      senderEmail: "meidipriandana@gmail.com",
      senderSignature: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='50'><path d='M15,35 Q35,5 55,35 T95,15' stroke='black' stroke-width='2' fill='none'/></svg>",
      recipientName: "Aina Mardiana (Sekretaris Direktur)",
      recipientEmail: "aina.mardiana@company.com",
      supervisorName: "Aripuddin Maskur, S.E.,M.M",
      supervisorEmail: "aripuddin.maskur@company.com",
      supervisorSignature: null,
      adminSignature: null,
      status: "pending_admin",
      verificationCode: "ST-779C-EE01",
      sheetsSynced: false,
      driveSynced: false,
      emailSent: false,
      pdfUrl: "/api/download-pdf/doc-103"
    };

    db.documents = [doc1, doc2, doc3];
    
    db.logs = [
      {
        id: "log-1",
        timestamp: new Date(Date.now() - 3 * 3600 * 1000 * 24).toISOString(),
        documentId: "doc-101",
        documentTitle: "Laptop Macbook Pro M3 Staff IT",
        actor: "Meidi Priandana",
        role: "staff",
        action: "Pengajuan Serah Terima",
        details: "Mengajukan serah terima unit Macbook Pro M3"
      },
      {
        id: "log-2",
        timestamp: new Date(Date.now() - 3 * 3600 * 1000 * 24 + 10 * 60 * 1000).toISOString(),
        documentId: "doc-101",
        documentTitle: "Laptop Macbook Pro M3 Staff IT",
        actor: "Sistem Admin",
        role: "admin",
        action: "Verifikasi & Tanda Tangan",
        details: "Admin menyetujui, menandatangani berkas, dan meneruskan ke Atasan: dr. Budy Azis B, Sp.PK.,M.H."
      },
      {
        id: "log-3",
        timestamp: new Date(Date.now() - 3 * 3600 * 1000 * 24 + 35 * 60 * 1000).toISOString(),
        documentId: "doc-101",
        documentTitle: "Laptop Macbook Pro M3 Staff IT",
        actor: "dr. Budy Azis B, Sp.PK.,M.H.",
        role: "atasan",
        action: "Persetujuan Akhir (Signed)",
        details: "Atasan menandatangani berkas secara digital. Status berkas SELURUHNYA SELESAI. PDF disimpan ke Drive dan notifikasi email dikirim ke aina.mardiana@company.com."
      },
      {
        id: "log-4",
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        documentId: "doc-102",
        documentTitle: "Berkas Kontrak Vendor AWS",
        actor: "Meidi Priandana",
        role: "staff",
        action: "Pengajuan Serah Terima",
        details: "Mengajukan berkas kontrak vendor AWS"
      },
      {
        id: "log-5",
        timestamp: new Date(Date.now() - 1.8 * 3600 * 1000).toISOString(),
        documentId: "doc-102",
        documentTitle: "Berkas Kontrak Vendor AWS",
        actor: "Sistem Admin",
        role: "admin",
        action: "Verifikasi & Tanda Tangan",
        details: "Admin menandatangani berkas kontrak dan memproses alur ke atasan Aripuddin Maskur, S.E.,M.M"
      },
      {
        id: "log-6",
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        documentId: "doc-103",
        documentTitle: "Laporan Keuangan Audit Q2 2026",
        actor: "Meidi Priandana",
        role: "staff",
        action: "Pengajuan Serah Terima",
        details: "Mengajukan berkas laporan keuangan Q2"
      }
    ];

    db.notifications = [
      {
        id: "notif-1",
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        title: "Dokumen Baru Masuk",
        message: "Dokumen 'Laporan Keuangan Audit Q2 2026' dikirim oleh Meidi Priandana menunggu verifikasi Anda.",
        documentId: "doc-103",
        read: false
      },
      {
        id: "notif-2",
        timestamp: new Date(Date.now() - 1.8 * 3600 * 1000).toISOString(),
        title: "Pemberitahuan Approval",
        message: "Dokumen AWS Kontrak telah ditandatangani Admin dan diteruskan ke Atasan Aripuddin Maskur, S.E.,M.M.",
        documentId: "doc-102",
        read: false
      }
    ];

    saveDb(db);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Load and seed database
  const db = loadDb();
  seedDbIfEmpty(db);

  // --- API ROUTES ---

  // Get all documents
  app.get("/api/documents", (req, res) => {
    const database = loadDb();
    res.json(database.documents);
  });

  // Get active logs
  app.get("/api/logs", (req, res) => {
    const database = loadDb();
    res.json(database.logs);
  });

  // Clear all logs
  app.post("/api/logs/clear", (req, res) => {
    const database = loadDb();
    database.logs = [];
    saveDb(database);
    res.json({ success: true });
  });

  // Get notifications
  app.get("/api/notifications", (req, res) => {
    const database = loadDb();
    res.json(database.notifications);
  });

  // Mark notifications as read
  app.post("/api/notifications/read", (req, res) => {
    const database = loadDb();
    database.notifications.forEach((n: any) => n.read = true);
    saveDb(database);
    res.json({ success: true });
  });

  // --- BACKUP & RESTORE API ENDPOINTS ---
  
  // Backup database
  app.get("/api/backup", (req, res) => {
    try {
      const database = loadDb();
      res.json({
        success: true,
        version: "1.0",
        timestamp: new Date().toISOString(),
        data: database
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Restore database
  app.post("/api/restore", (req, res) => {
    try {
      const { backupData } = req.body;
      if (!backupData || !backupData.documents || !backupData.logs || !backupData.notifications) {
        return res.status(400).json({ success: false, error: "Format berkas cadangan (backup) tidak valid." });
      }
      
      const database = {
        documents: backupData.documents,
        logs: backupData.logs,
        notifications: backupData.notifications
      };
      
      saveDb(database);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Reset database to default seed data
  app.post("/api/reset", (req, res) => {
    try {
      const database = {
        documents: [],
        logs: [],
        notifications: []
      };
      seedDbIfEmpty(database);
      saveDb(database);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Submit new document (Staff)
  app.post("/api/documents", (req, res) => {
    const { title, description, category, senderName, senderEmail, senderSignature, recipientName, recipientEmail, supervisorName, supervisorEmail, items } = req.body;
    
    if (!title || !senderName || !senderSignature || !recipientEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const database = loadDb();
    
    // Generate secure digital verification code
    const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
    const randomHex2 = Math.random().toString(16).substring(2, 6).toUpperCase();
    const verificationCode = `ST-${randomHex}-${randomHex2}`;

    const individualSupervisors = supervisorName ? supervisorName.split(";").map((s: string) => s.trim()).filter(Boolean) : [];
    const supervisorSignatures: Record<string, string | null> = {};
    individualSupervisors.forEach((sup: string) => {
      supervisorSignatures[sup] = null;
    });

    const newDoc: DocumentHandover = {
      id: "doc-" + Date.now(),
      title,
      description: description || "Tanpa deskripsi berkas.",
      category: category || "Umum",
      timestamp: new Date().toISOString(),
      senderName,
      senderEmail: senderEmail || "staff@company.com",
      senderSignature,
      recipientName: recipientName || "Pihak Penerima",
      recipientEmail,
      supervisorName,
      supervisorEmail: supervisorEmail || "supervisor@company.com",
      supervisorSignature: null,
      supervisorSignatures,
      adminSignature: null,
      status: "pending_admin",
      verificationCode,
      items: items || [],
      sheetsSynced: false,
      driveSynced: false,
      emailSent: false
    };

    newDoc.pdfUrl = `/api/download-pdf/${newDoc.id}`;

    // Add activity log
    const newLog: ActivityLog = {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      documentId: newDoc.id,
      documentTitle: newDoc.title,
      actor: senderName,
      role: "staff",
      action: "Pengajuan Serah Terima",
      details: `Mengajukan serah terima dokumen '${title}' kepada penerima ${recipientName} (${recipientEmail}).`
    };

    // Add push notification for admin
    const newNotif: PushNotification = {
      id: "notif-" + Date.now(),
      timestamp: new Date().toISOString(),
      title: "Dokumen Baru Masuk",
      message: `Dokumen '${title}' diajukan oleh ${senderName} dan memerlukan verifikasi Admin sebelum ke Atasan.`,
      documentId: newDoc.id,
      read: false
    };

    database.documents.unshift(newDoc);
    database.logs.unshift(newLog);
    database.notifications.unshift(newNotif);
    
    saveDb(database);
    res.status(201).json(newDoc);
  });

  // Admin approval & signature (Routes to designated supervisor)
  app.post("/api/documents/:id/admin-sign", (req, res) => {
    const { id } = req.params;
    const { adminSignature } = req.body;

    if (!adminSignature) {
      return res.status(400).json({ error: "Admin signature is required" });
    }

    const database = loadDb();
    const docIdx = database.documents.findIndex((d: any) => d.id === id);

    if (docIdx === -1) {
      return res.status(404).json({ error: "Document not found" });
    }

    const doc = database.documents[docIdx];
    
    if (doc.status !== "pending_admin") {
      return res.status(400).json({ error: `Document is in status '${doc.status}', admin signature is not applicable` });
    }

    doc.adminSignature = adminSignature;
    
    const hasSupervisor = doc.supervisorName && doc.supervisorName.trim().length > 0;
    
    if (hasSupervisor) {
      doc.status = "pending_atasan";
      doc.sheetsSynced = true; 
      doc.driveSynced = false;  
      doc.emailSent = false;    
    } else {
      doc.status = "completed";
      doc.sheetsSynced = true; 
      doc.driveSynced = true;  
      doc.emailSent = true;    
    }

    // Add log
    const newLog: ActivityLog = {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      documentId: doc.id,
      documentTitle: doc.title,
      actor: "Sistem Admin",
      role: "admin",
      action: hasSupervisor ? "Verifikasi & Teruskan ke Atasan" : "Persetujuan Akhir & TTD",
      details: hasSupervisor 
        ? `Admin telah memverifikasi & menandatangani dokumen. Berkas diteruskan ke Atasan (${doc.supervisorName}) untuk persetujuan final.`
        : `Admin telah memverifikasi & menandatangani dokumen. Berkas berhasil diunggah ke Google Drive '/Serah_Terima_PDFs/' dan email konfirmasi dikirim ke ${doc.recipientEmail}.`
    };

    // Add push notification for admin/staff
    const newNotif: PushNotification = {
      id: "notif-" + Date.now(),
      timestamp: new Date().toISOString(),
      title: hasSupervisor ? "Berkas Diteruskan ke Atasan" : "Dokumen Selesai Diproses",
      message: hasSupervisor
        ? `Berkas '${doc.title}' telah disetujui Admin dan kini menunggu tanda tangan Atasan: ${doc.supervisorName}.`
        : `Berkas '${doc.title}' telah selesai diverifikasi & ditandatangani oleh Admin, dan disimpan secara permanen.`,
      documentId: doc.id,
      read: false
    };

    database.logs.unshift(newLog);
    database.notifications.unshift(newNotif);
    database.documents[docIdx] = doc;

    saveDb(database);
    res.json(doc);
  });

  // Supervisor (Atasan) approval & signature (Finalizes document, uploads to GDrive, emails receipt)
  app.post("/api/documents/:id/atasan-sign", (req, res) => {
    const { id } = req.params;
    const { supervisorSignature, supervisorName } = req.body;

    if (!supervisorSignature) {
      return res.status(400).json({ error: "Atasan signature is required" });
    }

    const database = loadDb();
    const docIdx = database.documents.findIndex((d: any) => d.id === id);

    if (docIdx === -1) {
      return res.status(404).json({ error: "Document not found" });
    }

    const doc = database.documents[docIdx];
    
    if (doc.status !== "pending_atasan") {
      return res.status(400).json({ error: `Document is in status '${doc.status}', atasan signature is not applicable` });
    }

    // Initialize supervisorSignatures map if it doesn't exist
    if (!doc.supervisorSignatures) {
      doc.supervisorSignatures = {};
    }

    const sups = doc.supervisorName ? doc.supervisorName.split(";").map((s: string) => s.trim()).filter(Boolean) : [];
    
    // Determine the name of the signing supervisor. 
    // If none is provided, default to the first supervisor in the list or the only supervisor.
    const signerName = supervisorName || sups[0] || doc.supervisorName;

    // Save this signature
    doc.supervisorSignatures[signerName] = supervisorSignature;
    
    // For backwards-compatibility/fallback, also save to main supervisorSignature field
    doc.supervisorSignature = supervisorSignature;

    // Check if ALL chosen supervisors have signed
    const allSigned = sups.every((supName: string) => doc.supervisorSignatures[supName]);

    if (allSigned) {
      doc.status = "completed";
      doc.driveSynced = true; // Auto uploaded as PDF to Google Drive
      doc.emailSent = true;   // Real-time confirmation email sent to recipient
    } else {
      doc.status = "pending_atasan"; // Still pending remaining supervisors
      doc.driveSynced = false;
      doc.emailSent = false;
    }

    // Add log
    const newLog: ActivityLog = {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      documentId: doc.id,
      documentTitle: doc.title,
      actor: signerName,
      role: "atasan",
      action: allSigned ? "Persetujuan Akhir (Signed)" : "Persetujuan Atasan (Signed)",
      details: allSigned
        ? `Atasan ${signerName} menyetujui & menandatangani berkas secara digital. Semua tanda tangan lengkap! PDF berhasil diunggah ke Google Drive '/Serah_Terima_PDFs/' dan email konfirmasi dikirim ke ${doc.recipientEmail}.`
        : `Atasan ${signerName} menyetujui & menandatangani berkas secara digital. Menunggu tanda tangan dari penyetuju lainnya.`
    };

    // Add notification
    const newNotif: PushNotification = {
      id: "notif-" + Date.now(),
      timestamp: new Date().toISOString(),
      title: allSigned ? "Dokumen Selesai Diproses" : "Dokumen Ditandatangani Atasan",
      message: allSigned
        ? `Dokumen '${doc.title}' telah ditandatangani lengkap oleh Admin & seluruh Atasan, dan dikirim ke penerima.`
        : `Dokumen '${doc.title}' telah ditandatangani oleh ${signerName} dan sedang menunggu persetujuan Atasan lainnya.`,
      documentId: doc.id,
      read: false
    };

    database.logs.unshift(newLog);
    database.notifications.unshift(newNotif);
    database.documents[docIdx] = doc;

    saveDb(database);
    res.json(doc);
  });

  // Reject document
  app.post("/api/documents/:id/reject", (req, res) => {
    const { id } = req.params;
    const { role, actor, reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const database = loadDb();
    const docIdx = database.documents.findIndex((d: any) => d.id === id);

    if (docIdx === -1) {
      return res.status(404).json({ error: "Document not found" });
    }

    const doc = database.documents[docIdx];
    doc.status = "rejected";
    doc.rejectionReason = reason;

    // Add log
    const newLog: ActivityLog = {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      documentId: doc.id,
      documentTitle: doc.title,
      actor: actor || "Sistem",
      role: role || "admin",
      action: "Penolakan Dokumen",
      details: `Dokumen ditolak dengan alasan: "${reason}" oleh ${actor || "Admin"}.`
    };

    // Add notification
    const newNotif: PushNotification = {
      id: "notif-" + Date.now(),
      timestamp: new Date().toISOString(),
      title: "Dokumen Ditolak",
      message: `Pengajuan '${doc.title}' ditolak oleh ${actor || "Admin"}: ${reason}`,
      documentId: doc.id,
      read: false
    };

    database.logs.unshift(newLog);
    database.notifications.unshift(newNotif);
    database.documents[docIdx] = doc;

    saveDb(database);
    res.json(doc);
  });

  // Serving professional handover PDF/HTML
  app.get("/api/download-pdf/:id", (req, res) => {
    const { id } = req.params;
    const database = loadDb();
    const doc = database.documents.find((d: any) => d.id === id);

    if (!doc) {
      return res.status(404).send("Document not found");
    }

    const formattedDate = new Date(doc.timestamp).toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short"
    });

    // We output a print-optimized elegant HTML sheet which triggers window.print()
    const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Bukti Serah Terima - ${doc.title}</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #333;
          margin: 0;
          padding: 40px;
          line-height: 1.6;
          background: white;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #e2e8f0;
          padding: 40px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          position: relative;
        }
        .header {
          border-bottom: 3px double #3182ce;
          padding-bottom: 20px;
          margin-bottom: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 26px;
          color: #2b6cb0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .header p {
          margin: 0;
          font-size: 14px;
          color: #718096;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
          background: #f7fafc;
          padding: 20px;
          border-radius: 6px;
          border-left: 4px solid #3182ce;
        }
        .meta-item {
          font-size: 14px;
        }
        .meta-item strong {
          color: #4a5568;
          display: block;
          margin-bottom: 4px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .meta-item span {
          font-size: 14px;
          color: #1a202c;
          font-weight: 500;
        }
        .content {
          margin-bottom: 40px;
        }
        .content h3 {
          border-bottom: 1px solid #edf2f7;
          padding-bottom: 8px;
          color: #2d3748;
          margin-top: 0;
        }
        .description-box {
          background: #fff;
          border: 1px solid #edf2f7;
          padding: 15px;
          border-radius: 4px;
          min-height: 80px;
          white-space: pre-wrap;
          font-size: 14px;
        }
        .signatures {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          margin-top: 50px;
          text-align: center;
        }
        .sig-block {
          border-top: 1px dashed #cbd5e0;
          padding-top: 15px;
          position: relative;
        }
        .sig-image {
          height: 70px;
          max-width: 150px;
          object-fit: contain;
          margin: 0 auto 10px auto;
          display: block;
        }
        .sig-empty {
          height: 70px;
          color: #a0aec0;
          font-style: italic;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          margin-bottom: 10px;
        }
        .sig-title {
          font-size: 12px;
          font-weight: bold;
          color: #4a5568;
        }
        .sig-name {
          font-size: 13px;
          color: #2d3748;
          margin-top: 5px;
        }
        .footer {
          margin-top: 60px;
          border-top: 1px solid #edf2f7;
          padding-top: 20px;
          text-align: center;
          font-size: 11px;
          color: #a0aec0;
        }
        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .badge-completed {
          background-color: #c6f6d5;
          color: #22543d;
        }
        .badge-pending {
          background-color: #feebc8;
          color: #744210;
        }
        .badge-rejected {
          background-color: #fed7d7;
          color: #742a2a;
        }
        .qrcode {
          text-align: right;
          margin-top: 10px;
        }
        .qr-placeholder {
          display: inline-block;
          border: 1px solid #cbd5e0;
          padding: 8px;
          border-radius: 4px;
          background: #fff;
          text-align: center;
        }
        .print-btn {
          background-color: #3182ce;
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        @media print {
          .print-btn {
            display: none;
          }
          body {
            padding: 0;
          }
          .container {
            border: none;
            box-shadow: none;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div style="text-align: right; max-width: 800px; margin: 0 auto;">
        <button class="print-btn" onclick="window.print()">Cetak / Simpan PDF</button>
      </div>
      
      <div class="container">
        <div class="header">
          <h1>BERITA ACARA SERAH TERIMA BERKAS DIGITAL</h1>
          <p>Sistem E-Signature & Digital Handover Terintegrasi Google Workspace</p>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
          <div style="font-size: 14px;">
            <strong>Kode Verifikasi:</strong> <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #2b6cb0;">${doc.verificationCode}</code>
          </div>
          <div>
            <span class="badge ${doc.status === 'completed' ? 'badge-completed' : doc.status === 'rejected' ? 'badge-rejected' : 'badge-pending'}">
              Status: ${doc.status === 'completed' ? 'SELESAI (VALID)' : doc.status === 'rejected' ? 'DITOLAK' : 'PROSES APPROVAL'}
            </span>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <strong>Kategori Berkas</strong>
            <span>${doc.category}</span>
          </div>
          <div class="meta-item">
            <strong>Tanggal Diajukan</strong>
            <span>${formattedDate}</span>
          </div>
          <div class="meta-item">
            <strong>Pihak Pengaju (Sender)</strong>
            <span>${doc.senderName} (${doc.senderEmail})</span>
          </div>
          <div class="meta-item">
            <strong>Pihak Penerima (Recipient)</strong>
            <span>${doc.recipientName} (${doc.recipientEmail})</span>
          </div>
        </div>

        <div class="content">
          <h3>Detail Berkas Serah Terima</h3>
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #2d3748;">
            ${doc.title}
          </div>
          <div class="description-box">${doc.description}</div>
          
          ${doc.rejectionReason ? `
            <div style="margin-top: 15px; border: 1px solid #feb2b2; background-color: #fff5f5; padding: 12px; border-radius: 4px;">
              <strong style="color: #c53030; font-size: 13px; text-transform: uppercase;">Alasan Penolakan:</strong>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #9b2c2c;">${doc.rejectionReason}</p>
            </div>
          ` : ''}
        </div>

        <div class="signatures">
          <div class="sig-block">
            <div class="sig-title">DIREKOMENDASIKAN OLEH (STAFF)</div>
            <img class="sig-image" src="${doc.senderSignature}" alt="Tanda Tangan Pengaju">
            <div class="sig-name"><strong>${doc.senderName === "Budi Santoso" ? "Budi Santoso, untuk pihak pertama Meidi Priandana" : doc.senderName}</strong></div>
            <div style="font-size: 11px; color: #718096;">Pihak Pertama (Pengaju)</div>
          </div>
          
          <div class="sig-block">
            <div class="sig-title">DIVERIFIKASI OLEH (ADMIN)</div>
            ${doc.adminSignature ? `
              <img class="sig-image" src="${doc.adminSignature}" alt="Tanda Tangan Admin">
            ` : `
              <div class="sig-empty">Belum Ditandatangani</div>
            `}
            <div class="sig-name"><strong>Sistem Admin</strong></div>
            <div style="font-size: 11px; color: #718096;">Pihak Kedua (Verifikator)</div>
          </div>
          
          <div class="sig-block">
            <div class="sig-title">DISETUJUI OLEH (ATASAN)</div>
            ${doc.supervisorSignature ? `
              <img class="sig-image" src="${doc.supervisorSignature}" alt="Tanda Tangan Atasan">
            ` : `
              <div class="sig-empty">Belum Ditandatangani</div>
            `}
            <div class="sig-name"><strong>${doc.supervisorName}</strong></div>
            <div style="font-size: 11px; color: #718096;">Pihak Ketiga (Pemberi Izin)</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <div style="font-size: 11px; color: #718096; max-width: 70%;">
            <p style="margin: 0 0 5px 0;"><strong>Catatan Keamanan Digital:</strong></p>
            Dokumen ini ditandatangani secara elektronik menggunakan hash cryptographic <strong>SHA-256</strong> yang aman dan diverifikasi secara real-time. Tanda tangan yang tercantum adalah sah dan mengikat secara hukum sesuai dengan UU ITE yang berlaku.
          </div>
          <div class="qrcode">
            <div class="qr-placeholder">
              <!-- Inline mini visual QR representation -->
              <svg width="60" height="60" viewBox="0 0 29 29" style="display: block; margin: 0 auto 4px auto;">
                <path d="M0 0h9v9H0zm2 2v5h5V2zm11 0h5v2h-2v2h2v3h-5zm7 0h9v9h-9zm2 2v5h5V2zM0 11h5v2H0zm7 0h2v4H7zm11 0h2v2h-2zm3 0h3v2h-3zm5 0h3v5h-2v-3h-1zm-18 4h2v2H0zm4 0h2v5H4zm5 0h2v2H9zm4 0h3v2h-3zm13 1h3v2h-3zm-14 3h2v2h-2zm3 0h2v3h-2zm13 0h3v2h-3zm-19 2h3v5H0zm14 0h2v2h-2zm3 1h3v2h-3zm5 0h2v2h-2zm-12 2h2v2h-2zm3 0h5v2h-5z" fill="#1a202c"/>
              </svg>
              <span style="font-size: 9px; font-family: monospace; color: #4a5568;">VERIFIED BY GOOGLE</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Dokumen ini di-generate secara otomatis melalui Portal E-Handover DANA.</p>
          <p>&copy; 2026 PT.DANADIKLAT. Terkoneksi secara otomatis ke Google Sheets & Google Drive.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    res.send(html);
  });

  // Update/Edit a single document
  app.put("/api/documents/:id", (req, res) => {
    const { id } = req.params;
    const { title, description, category, senderName, senderEmail, recipientName, recipientEmail, supervisorName, supervisorEmail, items } = req.body;
    
    const database = loadDb();
    const docIdx = database.documents.findIndex((d: any) => d.id === id);
    if (docIdx !== -1) {
      const doc = database.documents[docIdx];
      
      if (title !== undefined) doc.title = title;
      if (description !== undefined) doc.description = description;
      if (category !== undefined) doc.category = category;
      if (senderName !== undefined) doc.senderName = senderName;
      if (senderEmail !== undefined) doc.senderEmail = senderEmail;
      if (recipientName !== undefined) doc.recipientName = recipientName;
      if (recipientEmail !== undefined) doc.recipientEmail = recipientEmail;
      if (supervisorName !== undefined) {
        doc.supervisorName = supervisorName;
        const individualSupervisors = supervisorName.split(";").map((s: string) => s.trim()).filter(Boolean);
        const supervisorSignatures: Record<string, string | null> = {};
        individualSupervisors.forEach((sup: string) => {
          supervisorSignatures[sup] = doc.supervisorSignatures?.[sup] || null;
        });
        doc.supervisorSignatures = supervisorSignatures;
      }
      if (supervisorEmail !== undefined) doc.supervisorEmail = supervisorEmail;
      if (items !== undefined) doc.items = items;

      // Log update
      const newLog: ActivityLog = {
        id: "log-" + Date.now(),
        timestamp: new Date().toISOString(),
        documentId: id,
        documentTitle: doc.title,
        actor: "Sistem Admin",
        role: "admin",
        action: "Pembaruan Dokumen",
        details: `Dokumen '${doc.title}' berhasil diperbarui oleh Admin.`
      };
      database.logs.unshift(newLog);
      
      saveDb(database);
      return res.json(doc);
    }
    res.status(404).json({ error: "Document not found" });
  });

  // Delete a single document
  app.delete("/api/documents/:id", (req, res) => {
    const { id } = req.params;
    const database = loadDb();
    const docIdx = database.documents.findIndex((d: any) => d.id === id);
    if (docIdx !== -1) {
      const doc = database.documents[docIdx];
      database.documents.splice(docIdx, 1);
      database.notifications = database.notifications.filter((n: any) => n.documentId !== id);
      
      // Log deletion
      const newLog: ActivityLog = {
        id: "log-" + Date.now(),
        timestamp: new Date().toISOString(),
        documentId: id,
        documentTitle: doc.title,
        actor: "Sistem Admin",
        role: "admin",
        action: "Penghapusan Dokumen",
        details: `Dokumen '${doc.title}' dihapus secara permanen dari sistem.`
      };
      database.logs.unshift(newLog);
      
      saveDb(database);
      return res.json({ success: true });
    }
    res.status(404).json({ error: "Document not found" });
  });

  // Bulk delete documents
  app.post("/api/documents/delete-bulk", (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: "Document IDs array is required" });
    }

    const database = loadDb();
    const initialCount = database.documents.length;
    
    // Log deletions
    const deletedDocs = database.documents.filter((d: any) => ids.includes(d.id));
    deletedDocs.forEach((doc: any) => {
      const newLog: ActivityLog = {
        id: "log-" + Date.now() + "-" + doc.id,
        timestamp: new Date().toISOString(),
        documentId: doc.id,
        documentTitle: doc.title,
        actor: "Sistem Admin",
        role: "admin",
        action: "Penghapusan Dokumen (Massal)",
        details: `Dokumen '${doc.title}' dihapus secara permanen (Penghapusan Massal).`
      };
      database.logs.unshift(newLog);
    });

    database.documents = database.documents.filter((d: any) => !ids.includes(d.id));
    database.notifications = database.notifications.filter((n: any) => !ids.includes(n.documentId));
    
    saveDb(database);
    res.json({ success: true, deletedCount: initialCount - database.documents.length });
  });

  // --- VITE MIDDLEWARE OR PRODUCTION STATIC FILE SERVING ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
