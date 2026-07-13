import { DocumentHandover, ActivityLog, PushNotification } from "../types";

// Seed initial documents if empty
function getSeedData() {
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
    title: "Berkas Kontrak Vendor Penyedia Jasa",
    description: "Dokumen fisik kontrak kerjasama sewa jasa operasional kantor RSUD selama 12 bulan.",
    category: "Kontrak & Kerjasama",
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    senderName: "Meidi Priandana",
    senderEmail: "meidipriandana@gmail.com",
    senderSignature: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='50'><path d='M10,25 Q30,10 50,25 T90,25' stroke='black' stroke-width='2' fill='none'/></svg>",
    recipientName: "CV Sinar Abadi (Vendor Jasa)",
    recipientEmail: "sales@sinarabadi.co.id",
    supervisorName: "dr. Budy Azis B, Sp.PK.,M.H.",
    supervisorEmail: "budy.azis@company.com",
    supervisorSignature: null,
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
    supervisorName: "dr. Budy Azis B, Sp.PK.,M.H.",
    supervisorEmail: "budy.azis@company.com",
    supervisorSignature: null,
    adminSignature: null,
    status: "pending_admin",
    verificationCode: "ST-779C-EE01",
    sheetsSynced: false,
    driveSynced: false,
    emailSent: false,
    pdfUrl: "/api/download-pdf/doc-103"
  };

  return {
    documents: [doc1, doc2, doc3],
    logs: [
      {
        id: "log-1",
        timestamp: new Date(Date.now() - 3 * 3600 * 1000 * 24).toISOString(),
        documentId: "doc-101",
        documentTitle: "Laptop Macbook Pro M3 Staff IT",
        actor: "Meidi Priandana",
        role: "staff" as const,
        action: "Pengajuan Serah Terima",
        details: "Mengajukan serah terima unit Macbook Pro M3"
      },
      {
        id: "log-2",
        timestamp: new Date(Date.now() - 3 * 3600 * 1000 * 24 + 10 * 60 * 1000).toISOString(),
        documentId: "doc-101",
        documentTitle: "Laptop Macbook Pro M3 Staff IT",
        actor: "Sistem Admin",
        role: "admin" as const,
        action: "Verifikasi & Tanda Tangan",
        details: "Admin menyetujui, menandatangani berkas, dan meneruskan ke Atasan: dr. Budy Azis B, Sp.PK.,M.H."
      },
      {
        id: "log-3",
        timestamp: new Date(Date.now() - 3 * 3600 * 1000 * 24 + 35 * 60 * 1000).toISOString(),
        documentId: "doc-101",
        documentTitle: "Laptop Macbook Pro M3 Staff IT",
        actor: "dr. Budy Azis B, Sp.PK.,M.H.",
        role: "atasan" as const,
        action: "Persetujuan Akhir (Signed)",
        details: "Atasan menandatangani berkas secara digital. Status berkas SELURUHNYA SELESAI. PDF disimpan ke Drive dan notifikasi email dikirim ke aina.mardiana@company.com."
      },
      {
        id: "log-4",
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        documentId: "doc-102",
        documentTitle: "Berkas Kontrak Vendor Penyedia Jasa",
        actor: "Meidi Priandana",
        role: "staff" as const,
        action: "Pengajuan Serah Terima",
        details: "Mengajukan berkas kontrak vendor penyedia jasa"
      },
      {
        id: "log-5",
        timestamp: new Date(Date.now() - 1.8 * 3600 * 1000).toISOString(),
        documentId: "doc-102",
        documentTitle: "Berkas Kontrak Vendor Penyedia Jasa",
        actor: "Sistem Admin",
        role: "admin" as const,
        action: "Verifikasi & Tanda Tangan",
        details: "Admin menandatangani berkas kontrak dan memproses alur ke atasan dr. Budy Azis B, Sp.PK.,M.H."
      },
      {
        id: "log-6",
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        documentId: "doc-103",
        documentTitle: "Laporan Keuangan Audit Q2 2026",
        actor: "Meidi Priandana",
        role: "staff" as const,
        action: "Pengajuan Serah Terima",
        details: "Mengajukan berkas laporan keuangan Q2"
      }
    ],
    notifications: [
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
        message: "Dokumen Berkas Kontrak Vendor Jasa telah ditandatangani Admin dan diteruskan ke Atasan dr. Budy Azis B, Sp.PK.,M.H.",
        documentId: "doc-102",
        read: false
      }
    ]
  };
}

// Client-side Database Helpers
function getLocalDB() {
  const docsRaw = localStorage.getItem("client_db_documents");
  const logsRaw = localStorage.getItem("client_db_logs");
  const notifsRaw = localStorage.getItem("client_db_notifications");

  if (!docsRaw || !logsRaw || !notifsRaw) {
    const seed = getSeedData();
    localStorage.setItem("client_db_documents", JSON.stringify(seed.documents));
    localStorage.setItem("client_db_logs", JSON.stringify(seed.logs));
    localStorage.setItem("client_db_notifications", JSON.stringify(seed.notifications));
    return seed;
  }

  let documents = JSON.parse(docsRaw) as DocumentHandover[];
  const logs = JSON.parse(logsRaw) as ActivityLog[];
  const notifications = JSON.parse(notifsRaw) as PushNotification[];

  let modified = false;
  documents = documents.map(doc => {
    const parts = doc.supervisorName.split(";").map(s => s.trim()).filter(Boolean);
    const validParts = parts.map(name => {
      if (name.includes("Hendra") || name.includes("CTO") || name.includes("Budi Santoso") || (!name.includes("Budy Azis") && !name.includes("Aripuddin"))) {
        return "dr. Budy Azis B, Sp.PK.,M.H.";
      }
      return name;
    });
    const newSupName = validParts.join("; ");
    
    let updatedDoc = { ...doc };
    let docChanged = false;
    
    if (newSupName !== doc.supervisorName) {
      updatedDoc.supervisorName = newSupName;
      updatedDoc.supervisorEmail = doc.supervisorEmail ? doc.supervisorEmail.replace("hendra", "budy.azis") : "budy.azis@company.com";
      docChanged = true;
    }
    
    // No auto-fixing descriptions anymore to prevent corruption of user data
    
    if (docChanged) {
      modified = true;
      return updatedDoc;
    }
    return doc;
  });

  if (modified) {
    localStorage.setItem("client_db_documents", JSON.stringify(documents));
  }

  return {
    documents,
    logs,
    notifications
  };
}

function saveLocalDB(db: { documents: DocumentHandover[]; logs: ActivityLog[]; notifications: PushNotification[] }) {
  localStorage.setItem("client_db_documents", JSON.stringify(db.documents));
  localStorage.setItem("client_db_logs", JSON.stringify(db.logs));
  localStorage.setItem("client_db_notifications", JSON.stringify(db.notifications));
}

// Intercept and monkey patch fetch
export function setupFetchInterceptor() {
  const originalFetch = window.fetch;

  const customFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlStr = typeof input === "string" ? input : (input as any).url || input.toString();

    // Only intercept /api routes
    if (!urlStr.includes("/api/")) {
      return originalFetch(input, init);
    }

    try {
      // First attempt the real fetch
      const response = await originalFetch(input, init);
      
      // If server responded successfully or with a structured redirect, keep it!
      if (response.ok || (response.status !== 404 && response.status !== 500)) {
        return response;
      }
      
      // If 404/500, fallback to client side mock
      throw new Error("Server offline or returned error - falling back to LocalDB");
    } catch (e) {
      // Handle fallback locally
      console.warn(`[LocalDB Fetch Fallback] Intercepted path: ${urlStr}. Processing client-side...`);
      const db = getLocalDB();
      const parsedUrl = new URL(urlStr, window.location.origin);
      const pathname = parsedUrl.pathname;
      const method = (init?.method || "GET").toUpperCase();

      let responseData: any = null;
      let status = 200;

      // 1. GET /api/documents
      if (pathname === "/api/documents" && method === "GET") {
        responseData = db.documents;
      }
      // 2. GET /api/logs
      else if (pathname === "/api/logs" && method === "GET") {
        responseData = db.logs;
      }
      // 3. GET /api/notifications
      else if (pathname === "/api/notifications" && method === "GET") {
        responseData = db.notifications;
      }
      // 4. POST /api/notifications/read
      else if (pathname === "/api/notifications/read" && method === "POST") {
        db.notifications.forEach((n) => (n.read = true));
        saveLocalDB(db);
        responseData = { success: true };
      }
      // 5. POST /api/logs/clear
      else if (pathname === "/api/logs/clear" && method === "POST") {
        db.logs = [];
        saveLocalDB(db);
        responseData = { success: true };
      }
      // 6. GET /api/backup
      else if (pathname === "/api/backup" && method === "GET") {
        responseData = {
          success: true,
          version: "1.0",
          timestamp: new Date().toISOString(),
          data: db
        };
      }
      // 7. POST /api/restore
      else if (pathname === "/api/restore" && method === "POST") {
        try {
          const body = JSON.parse(init?.body as string);
          if (body.backupData) {
            db.documents = body.backupData.documents || [];
            db.logs = body.backupData.logs || [];
            db.notifications = body.backupData.notifications || [];
            saveLocalDB(db);
            responseData = { success: true };
          } else {
            status = 400;
            responseData = { error: "Invalid backup format" };
          }
        } catch (err: any) {
          status = 500;
          responseData = { error: err.message };
        }
      }
      // 8. POST /api/reset
      else if (pathname === "/api/reset" && method === "POST") {
        const seed = getSeedData();
        saveLocalDB(seed);
        responseData = { success: true };
      }
      // 9. POST /api/documents (Create Document)
      else if (pathname === "/api/documents" && method === "POST") {
        try {
          const body = JSON.parse(init?.body as string);
          const { title, description, category, senderName, senderEmail, senderSignature, recipientName, recipientEmail, supervisorName, supervisorEmail, items } = body;

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
            description: description || `Serah Terima ${items?.length || 0} Berkas`,
            category,
            timestamp: new Date().toISOString(),
            senderName,
            senderEmail,
            senderSignature,
            recipientName,
            recipientEmail,
            supervisorName,
            supervisorEmail,
            supervisorSignatures,
            supervisorSignature: null,
            adminSignature: null,
            status: "pending_admin",
            verificationCode,
            sheetsSynced: true,
            driveSynced: true,
            emailSent: true,
            items: items || [],
            pdfUrl: `/api/download-pdf/doc-${Date.now()}`
          };

          db.documents.unshift(newDoc);

          // Add Log
          db.logs.unshift({
            id: "log-" + Date.now(),
            timestamp: new Date().toISOString(),
            documentId: newDoc.id,
            documentTitle: newDoc.title,
            actor: newDoc.senderName,
            role: "staff",
            action: "Pengajuan Serah Terima",
            details: `Mengajukan serah terima baru: '${newDoc.title}'`
          });

          // Add Notification
          db.notifications.unshift({
            id: "notif-" + Date.now(),
            timestamp: new Date().toISOString(),
            title: "Dokumen Baru Masuk",
            message: `Dokumen '${newDoc.title}' dikirim oleh ${newDoc.senderName} menunggu verifikasi Admin.`,
            documentId: newDoc.id,
            read: false
          });

          saveLocalDB(db);
          status = 201;
          responseData = newDoc;
        } catch (err: any) {
          status = 400;
          responseData = { error: err.message };
        }
      }
      // 10. POST /api/documents/:id/admin-sign
      else if (pathname.startsWith("/api/documents/") && pathname.endsWith("/admin-sign") && method === "POST") {
        const id = pathname.split("/")[3];
        const body = JSON.parse(init?.body as string);
        const docIdx = db.documents.findIndex((d) => d.id === id);

        if (docIdx !== -1) {
          const doc = db.documents[docIdx];
          doc.adminSignature = body.adminSignature;

          const hasSupervisor = doc.supervisorName && doc.supervisorName.trim().length > 0;
          doc.status = hasSupervisor ? "pending_atasan" : "completed";

          // Add Log
          db.logs.unshift({
            id: "log-" + Date.now(),
            timestamp: new Date().toISOString(),
            documentId: doc.id,
            documentTitle: doc.title,
            actor: "Sistem Admin",
            role: "admin",
            action: "Verifikasi & TTD Admin",
            details: hasSupervisor 
              ? `Admin menyetujui & menandatangani. Berkas diteruskan ke Atasan: ${doc.supervisorName}.`
              : `Admin menyetujui & menandatangani. Berkas selesai sepenuhnya.`
          });

          // Add Notification
          db.notifications.unshift({
            id: "notif-" + Date.now(),
            timestamp: new Date().toISOString(),
            title: hasSupervisor ? "Menunggu TTD Atasan" : "Dokumen Selesai",
            message: hasSupervisor
              ? `Dokumen '${doc.title}' ditandatangani Admin dan diteruskan ke Atasan ${doc.supervisorName}.`
              : `Dokumen '${doc.title}' telah selesai ditandatangani penuh.`,
            documentId: doc.id,
            read: false
          });

          db.documents[docIdx] = doc;
          saveLocalDB(db);
          responseData = doc;
        } else {
          status = 404;
          responseData = { error: "Document not found" };
        }
      }
      // 11. POST /api/documents/:id/atasan-sign
      else if (pathname.startsWith("/api/documents/") && pathname.endsWith("/atasan-sign") && method === "POST") {
        const id = pathname.split("/")[3];
        const body = JSON.parse(init?.body as string);
        const docIdx = db.documents.findIndex((d) => d.id === id);

        if (docIdx !== -1) {
          const doc = db.documents[docIdx];
          const activeSup = body.supervisorName || doc.supervisorName;

          if (!doc.supervisorSignatures) {
            doc.supervisorSignatures = {};
          }
          doc.supervisorSignatures[activeSup] = body.supervisorSignature;
          doc.supervisorSignature = body.supervisorSignature; // backcompat

          const allSups = doc.supervisorName.split(";").map((s) => s.trim()).filter(Boolean);
          if (!allSups.includes(activeSup)) {
            allSups.push(activeSup);
            doc.supervisorName = allSups.join("; ");
          }
          
          const remainingUnsigned = allSups.filter((s) => !doc.supervisorSignatures?.[s]);

          const isFullySigned = remainingUnsigned.length === 0;
          if (isFullySigned) {
            doc.status = "completed";
          }

          // Add Log
          db.logs.unshift({
            id: "log-" + Date.now(),
            timestamp: new Date().toISOString(),
            documentId: doc.id,
            documentTitle: doc.title,
            actor: activeSup,
            role: "atasan",
            action: isFullySigned ? "Persetujuan Akhir (Signed)" : "Persetujuan Parsial (Signed)",
            details: isFullySigned
              ? `Atasan ${activeSup} menandatangani berkas. Seluruh persetujuan selesai. PDF disimpan ke Drive.`
              : `Atasan ${activeSup} menandatangani berkas. Menunggu persetujuan dari: ${remainingUnsigned.join(", ")}.`
          });

          // Add Notification
          db.notifications.unshift({
            id: "notif-" + Date.now(),
            timestamp: new Date().toISOString(),
            title: isFullySigned ? "Persetujuan Akhir Selesai" : "Persetujuan Parsial Atasan",
            message: isFullySigned
              ? `Dokumen '${doc.title}' ditandatangani penuh oleh seluruh Atasan.`
              : `Dokumen '${doc.title}' ditandatangani oleh ${activeSup}. Menunggu Atasan lainnya.`,
            documentId: doc.id,
            read: false
          });

          db.documents[docIdx] = doc;
          saveLocalDB(db);
          responseData = doc;
        } else {
          status = 404;
          responseData = { error: "Document not found" };
        }
      }
      // 12. POST /api/documents/:id/reject
      else if (pathname.startsWith("/api/documents/") && pathname.endsWith("/reject") && method === "POST") {
        const id = pathname.split("/")[3];
        const body = JSON.parse(init?.body as string);
        const docIdx = db.documents.findIndex((d) => d.id === id);

        if (docIdx !== -1) {
          const doc = db.documents[docIdx];
          doc.status = "rejected";
          doc.rejectionReason = body.reason;

          // Add Log
          db.logs.unshift({
            id: "log-" + Date.now(),
            timestamp: new Date().toISOString(),
            documentId: doc.id,
            documentTitle: doc.title,
            actor: body.actor || "Sistem",
            role: body.role || "admin",
            action: "Penolakan Dokumen (Rejected)",
            details: `Dokumen ditolak oleh ${body.actor || "Sistem"} dengan alasan: "${body.reason}"`
          });

          // Add Notification
          db.notifications.unshift({
            id: "notif-" + Date.now(),
            timestamp: new Date().toISOString(),
            title: "Pengajuan Ditolak",
            message: `Dokumen '${doc.title}' ditolak dengan alasan: "${body.reason}"`,
            documentId: doc.id,
            read: false
          });

          db.documents[docIdx] = doc;
          saveLocalDB(db);
          responseData = doc;
        } else {
          status = 404;
          responseData = { error: "Document not found" };
        }
      }
      // 12.5. PUT /api/documents/:id
      else if (pathname.startsWith("/api/documents/") && method === "PUT") {
        const id = pathname.split("/")[3];
        const docIdx = db.documents.findIndex((d) => d.id === id);

        if (docIdx !== -1) {
          try {
            const body = JSON.parse(init?.body as string);
            const doc = db.documents[docIdx];
            
            if (body.title !== undefined) doc.title = body.title;
            if (body.description !== undefined) doc.description = body.description;
            if (body.category !== undefined) doc.category = body.category;
            if (body.senderName !== undefined) doc.senderName = body.senderName;
            if (body.senderEmail !== undefined) doc.senderEmail = body.senderEmail;
            if (body.recipientName !== undefined) doc.recipientName = body.recipientName;
            if (body.recipientEmail !== undefined) doc.recipientEmail = body.recipientEmail;
            if (body.supervisorName !== undefined) {
              doc.supervisorName = body.supervisorName;
              const individualSupervisors = body.supervisorName.split(";").map((s: string) => s.trim()).filter(Boolean);
              const supervisorSignatures: Record<string, string | null> = {};
              individualSupervisors.forEach((sup: string) => {
                supervisorSignatures[sup] = doc.supervisorSignatures?.[sup] || null;
              });
              doc.supervisorSignatures = supervisorSignatures;
            }
            if (body.supervisorEmail !== undefined) doc.supervisorEmail = body.supervisorEmail;
            if (body.items !== undefined) doc.items = body.items;

            db.logs.unshift({
              id: "log-" + Date.now(),
              timestamp: new Date().toISOString(),
              documentId: id,
              documentTitle: doc.title,
              actor: "Sistem Admin",
              role: "admin",
              action: "Pembaruan Dokumen",
              details: `Dokumen '${doc.title}' berhasil diperbarui oleh Admin.`
            });

            db.documents[docIdx] = doc;
            saveLocalDB(db);
            responseData = doc;
          } catch (err: any) {
            status = 400;
            responseData = { error: err.message };
          }
        } else {
          status = 404;
          responseData = { error: "Document not found" };
        }
      }
      // 13. DELETE /api/documents/:id
      else if (pathname.startsWith("/api/documents/") && method === "DELETE") {
        const id = pathname.split("/")[3];
        const docIdx = db.documents.findIndex((d) => d.id === id);

        if (docIdx !== -1) {
          const doc = db.documents[docIdx];
          db.documents.splice(docIdx, 1);
          db.notifications = db.notifications.filter((n) => n.documentId !== id);

          // Log deletion
          db.logs.unshift({
            id: "log-" + Date.now(),
            timestamp: new Date().toISOString(),
            documentId: id,
            documentTitle: doc.title,
            actor: "Sistem Admin",
            role: "admin",
            action: "Penghapusan Dokumen",
            details: `Dokumen '${doc.title}' dihapus secara permanen dari sistem.`
          });

          saveLocalDB(db);
          responseData = { success: true };
        } else {
          status = 404;
          responseData = { error: "Document not found" };
        }
      }
      // 14. POST /api/documents/delete-bulk
      else if (pathname === "/api/documents/delete-bulk" && method === "POST") {
        try {
          const body = JSON.parse(init?.body as string);
          const ids = body.ids || [];
          
          const deletedDocs = db.documents.filter((d) => ids.includes(d.id));
          db.documents = db.documents.filter((d) => !ids.includes(d.id));
          db.notifications = db.notifications.filter((n) => !n.documentId || !ids.includes(n.documentId));

          deletedDocs.forEach((doc) => {
            db.logs.unshift({
              id: "log-" + Date.now() + "-" + doc.id,
              timestamp: new Date().toISOString(),
              documentId: doc.id,
              documentTitle: doc.title,
              actor: "Sistem Admin",
              role: "admin",
              action: "Penghapusan Dokumen (Massal)",
              details: `Dokumen '${doc.title}' dihapus secara permanen (Penghapusan Massal).`
            });
          });

          saveLocalDB(db);
          responseData = { success: true };
        } catch (err: any) {
          status = 400;
          responseData = { error: err.message };
        }
      } else {
        // Fallback for unhandled routes
        status = 404;
        responseData = { error: "LocalDB endpoint not found" };
      }

      // Return a simulated Response object
      return new Response(JSON.stringify(responseData), {
        status,
        headers: { "Content-Type": "application/json" }
      });
    }
  };

  try {
    Object.defineProperty(window, "fetch", {
      value: customFetch,
      writable: true,
      configurable: true,
      enumerable: true
    });
  } catch (err) {
    console.error("Failed to redefine window.fetch using Object.defineProperty:", err);
    // Fallback if everything else fails
    try {
      (window as any).fetch = customFetch;
    } catch (e) {
      console.error("Critical: Could not patch window.fetch:", e);
    }
  }
}
