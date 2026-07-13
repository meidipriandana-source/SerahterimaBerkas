import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { DocumentHandover } from "../types";

export async function exportDocumentToPDF(doc: DocumentHandover): Promise<void> {
  // Construct scanning/verification URL
  const verifyUrl = `${window.location.origin}/?verify=${encodeURIComponent(doc.verificationCode)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;

  // Wait for the QR code image to fully load in the background to ensure it renders in the canvas
  await new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = qrCodeUrl;
  });

  // Create an offscreen wrapper element to render the document
  const wrapper = document.createElement("div");
  wrapper.style.position = "absolute";
  wrapper.style.left = "-9999px";
  wrapper.style.top = "0";
  wrapper.style.width = "800px";
  wrapper.style.background = "#ffffff";
  wrapper.style.color = "#1e293b";
  wrapper.style.fontFamily = "'Inter', system-ui, sans-serif";
  wrapper.style.padding = "40px";
  wrapper.style.boxSizing = "border-box";

  const formattedDate = new Date(doc.timestamp).toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short"
  });

  // Build the items list if present
  let itemsHtml = "";
  if (doc.items && doc.items.length > 0) {
    itemsHtml = `
      <div style="margin-top: 20px; margin-bottom: 25px;">
        <h4 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: #4338ca; text-transform: uppercase; letter-spacing: 0.5px;">Rincian Serah Terima Per Kegiatan:</h4>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${doc.items.map((item, index) => {
            const isUnchecked = item.includes(" - Ditangguhkan");
            const cleanItem = isUnchecked ? item.replace(" - Ditangguhkan", "") : item;
            
            // Parse item title, category, and detail
            let itemTitle = cleanItem;
            let itemCategory = "Umum";
            let itemDetail = "";

            const categoryMatch = cleanItem.match(/^(.+?)\s*\[([^\]]+)\](?:\s*-\s*(.*))?$/);
            if (categoryMatch) {
              itemTitle = categoryMatch[1].trim();
              itemCategory = categoryMatch[2].trim();
              itemDetail = categoryMatch[3] ? categoryMatch[3].trim() : "";
            } else {
              const descIndex = cleanItem.indexOf(" - ");
              if (descIndex !== -1) {
                itemTitle = cleanItem.substring(0, descIndex).trim();
                itemDetail = cleanItem.substring(descIndex + 3).trim();
              }
            }

            const cardBg = isUnchecked ? "#fafafa" : "#ffffff";
            const leftBorder = isUnchecked ? "4px solid #ef4444" : "4px solid #4338ca";
            const badgeBg = isUnchecked ? "#fee2e2" : "#ecfdf5";
            const badgeColor = isUnchecked ? "#ef4444" : "#059669";
            const badgeText = isUnchecked ? `Ditangguhkan (${itemCategory})` : itemCategory;
            const textDecoration = isUnchecked ? "text-decoration: line-through; color: #94a3b8;" : "";

            return `
              <div style="background: ${cardBg}; border: 1px solid #e2e8f0; border-left: ${leftBorder}; border-radius: 8px; padding: 12px 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); display: block;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 15px;">
                  <span style="font-size: 12px; font-weight: 800; color: #0f172a; ${textDecoration}">
                    ${index + 1}. ${itemTitle}
                  </span>
                  <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 2.5px 8px; border-radius: 9999px; font-size: 9px; font-weight: 800; text-transform: uppercase; border: 1px solid ${isUnchecked ? '#fca5a5' : '#a7f3d0'}; white-space: nowrap;">
                    ${badgeText}
                  </span>
                </div>
                ${itemDetail ? `
                  <div style="font-size: 11px; line-height: 1.5; color: #475569; background: #f8fafc; padding: 8px 12px; border-radius: 6px; border: 1px solid #f1f5f9; margin-top: 4px; ${textDecoration}">
                    ${itemDetail}
                  </div>
                ` : ""}
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  // Get status badge styles
  let statusBadgeColor = "background: #fef3c7; color: #92400e; border: 1px solid #fde68a;";
  let statusText = "PROSES APPROVAL";
  if (doc.status === "completed") {
    statusBadgeColor = "background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;";
    statusText = "SELESAI (VALID)";
  } else if (doc.status === "rejected") {
    statusBadgeColor = "background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;";
    statusText = "DITOLAK";
  }

  // Handle signature representations (with standard SVG or inline signature image)
  const getSigElement = (sigData: string | null, label: string, name: string) => {
    if (sigData) {
      return `
        <div style="height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
          <img src="${sigData}" style="max-height: 75px; max-width: 140px; object-fit: contain;" alt="Signature" />
        </div>
      `;
    }
    return `
      <div style="height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; color: #94a3b8; font-style: italic; font-size: 11px; border: 1px dashed #e2e8f0; border-radius: 6px; background: #fafafa;">
        Belum Ditandatangani
      </div>
    `;
  };

  wrapper.innerHTML = `
    <div style="border: 2px solid #e2e8f0; border-radius: 16px; padding: 35px; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <!-- Header PT -->
      <div style="border-bottom: 3px double #4f46e5; padding-bottom: 15px; margin-bottom: 25px; text-align: center; position: relative;">
        <div style="position: absolute; left: 0; top: 0; width: 50px; height: 50px;">
          <img src="https://iili.io/C0QQIpV.png" style="width: 100%; height: 100%; object-fit: contain;" alt="PT Logo" />
        </div>
        <h2 style="margin: 0 0 5px 0; font-size: 20px; font-weight: 900; color: #1e1b4b; letter-spacing: 0.5px; text-transform: uppercase;">PT.DANADIKLAT</h2>
        <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 500;">Sistem E-Signature & Digital Handover Terintegrasi Google Workspace</p>
      </div>

      <!-- Document Title -->
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="margin: 0 0 5px 0; font-size: 18px; font-weight: 950; color: #4338ca; tracking-wide: 1px; text-transform: uppercase;">BERITA ACARA SERAH TERIMA BERKAS DIGITAL</h1>
        <p style="margin: 0; font-size: 10px; color: #64748b;">Dihasilkan secara otomatis melalui Portal E-Handover DANA</p>
      </div>

      <!-- Verification and Status Section -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px 20px; margin-bottom: 25px;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="border: 1px solid #cbd5e1; padding: 4px; background: #ffffff; border-radius: 8px; width: 68px; height: 68px; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <img src="${qrCodeUrl}" style="width: 58px; height: 58px; display: block;" alt="QR Verification" crossorigin="anonymous" />
          </div>
          <div>
            <span style="font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">Kode Verifikasi &amp; QR Scan</span>
            <code style="background: #e0e7ff; color: #4338ca; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 900; font-family: monospace; display: inline-block;">${doc.verificationCode}</code>
            <p style="margin: 3px 0 0 0; font-size: 9px; color: #64748b; font-weight: 500;">Pindai QR Code untuk memeriksa keaslian dokumen via Portal DANA</p>
          </div>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 4px;">Status Dokumen</span>
          <span style="${statusBadgeColor} padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 900; display: inline-block;">${statusText}</span>
        </div>
      </div>

      <!-- Meta Grid Information -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
        <div style="background: #fafafa; border-left: 4px solid #4338ca; padding: 10px 15px; border-radius: 4px;">
          <strong style="display: block; font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 800; margin-bottom: 4px;">Kategori Berkas</strong>
          <span style="font-size: 12px; font-weight: 700; color: #0f172a;">${doc.category}</span>
        </div>
        <div style="background: #fafafa; border-left: 4px solid #4338ca; padding: 10px 15px; border-radius: 4px;">
          <strong style="display: block; font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 800; margin-bottom: 4px;">Tanggal Diajukan</strong>
          <span style="font-size: 12px; font-weight: 700; color: #0f172a;">${formattedDate}</span>
        </div>
        <div style="background: #fafafa; border-left: 4px solid #4338ca; padding: 10px 15px; border-radius: 4px;">
          <strong style="display: block; font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 800; margin-bottom: 4px;">Pihak Pertama (Pengaju / Sender)</strong>
          <span style="font-size: 12px; font-weight: 700; color: #0f172a; display: block;">${doc.senderName}</span>
          <span style="font-size: 10px; color: #64748b;">${doc.senderEmail}</span>
        </div>
        <div style="background: #fafafa; border-left: 4px solid #4338ca; padding: 10px 15px; border-radius: 4px;">
          <strong style="display: block; font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 800; margin-bottom: 4px;">Pihak Kedua (Penerima / Recipient)</strong>
          <span style="font-size: 12px; font-weight: 700; color: #0f172a; display: block;">${doc.recipientName}</span>
          <span style="font-size: 10px; color: #64748b;">${doc.recipientEmail}</span>
        </div>
      </div>

      <!-- Items Table -->
      ${itemsHtml}

      <!-- Rejection Info -->
      ${doc.rejectionReason ? `
        <div style="margin-bottom: 25px; border: 1px solid #fee2e2; background-color: #fef2f2; padding: 15px; border-radius: 8px;">
          <strong style="color: #991b1b; font-size: 12px; text-transform: uppercase; font-weight: 800; display: block; margin-bottom: 4px;">Alasan Penolakan:</strong>
          <p style="margin: 0; font-size: 12px; color: #b91c1c; font-weight: 500;">${doc.rejectionReason}</p>
        </div>
      ` : ""}

      <!-- Signatures Grid -->
      <div style="margin-top: 30px; display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 15px; text-align: center;">
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 15px; background: #fafafa; border-radius: 8px; padding: 12px;">
          <div style="font-size: 8px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 10px;">DIREKOMENDASIKAN OLEH</div>
          ${getSigElement(doc.senderSignature, "Sender", doc.senderName === "Budi Santoso" ? "Budi Santoso, untuk pihak pertama Meidi Priandana" : doc.senderName)}
          <div style="font-size: 11px; font-weight: bold; color: #0f172a;">${doc.senderName === "Budi Santoso" ? "Budi Santoso, untuk pihak pertama Meidi Priandana" : doc.senderName}</div>
          <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Pihak Pertama (Pengaju)</div>
        </div>

        <div style="border-top: 1px dashed #cbd5e1; padding-top: 15px; background: #fafafa; border-radius: 8px; padding: 12px;">
          <div style="font-size: 8px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 10px;">DIVERIFIKASI OLEH</div>
          ${getSigElement(doc.adminSignature, "Admin", "Sistem Admin")}
          <div style="font-size: 11px; font-weight: bold; color: #0f172a;">Sistem Admin</div>
          <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Pihak Kedua (Verifikator)</div>
        </div>

        ${(() => {
          const sups = doc.supervisorName ? doc.supervisorName.split(";").map((s: string) => s.trim()).filter(Boolean) : [];
          return sups.map((supName: string) => {
            const sig = doc.supervisorSignatures?.[supName] || (sups.length === 1 ? doc.supervisorSignature : null);
            return `
              <div style="border-top: 1px dashed #cbd5e1; padding-top: 15px; background: #fafafa; border-radius: 8px; padding: 12px;">
                <div style="font-size: 8px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 10px;">DISETUJUI OLEH</div>
                ${getSigElement(sig, "Supervisor", supName)}
                <div style="font-size: 11px; font-weight: bold; color: #0f172a;">${supName}</div>
                <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Atasan Penyetuju</div>
              </div>
            `;
          }).join("");
        })()}
      </div>

      <!-- Security Certificate Footer block -->
      <div style="margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="font-size: 10px; color: #64748b; max-width: 70%; line-height: 1.5;">
          <strong style="color: #475569; display: block; margin-bottom: 3px;">Catatan Keamanan Digital:</strong>
          Dokumen ini ditandatangani secara elektronik menggunakan hash cryptographic <strong>SHA-256</strong> yang aman dan diverifikasi secara real-time. Tanda tangan yang tercantum adalah sah dan mengikat secara hukum sesuai dengan UU ITE yang berlaku di Indonesia.
        </div>
        <div style="text-align: right; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; background: #ffffff; display: flex; align-items: center; gap: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <div style="text-align: left;">
            <strong style="font-size: 9px; font-family: sans-serif; font-weight: 800; color: #4338ca; display: block; letter-spacing: 0.3px;">VERIFIKASI QR</strong>
            <span style="font-size: 7px; color: #64748b; display: block; margin-top: 1px;">Pindai untuk Verifikasi</span>
          </div>
          <div style="border: 1px solid #f1f5f9; padding: 2px; background: #ffffff; border-radius: 4px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <img src="${qrCodeUrl}" style="width: 38px; height: 38px; display: block;" alt="QR Code" crossorigin="anonymous" />
          </div>
        </div>
      </div>

      <!-- Real footer -->
      <div style="margin-top: 35px; border-top: 1px solid #f1f5f9; padding-top: 15px; text-align: center; font-size: 10px; color: #94a3b8;">
        Dokumen ini dibuat dan disimpan secara digital secara real-time. Terkoneksi penuh ke Google Sheets & Google Drive.<br />
        &copy; 2026 PT.DANADIKLAT. Semua hak dilindungi undang-undang.
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);

  try {
    // Generate canvas from offscreen element
    const canvas = await html2canvas(wrapper, {
      scale: 2, // High DPI rendering
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    
    // Create A4 PDF (Portrait, 210mm x 297mm)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const imgWidth = 210; // A4 size width in mm
    const pageHeight = 297; // A4 size height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Support multi-page documents if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download the actual binary PDF file
    pdf.save(`Bukti_Serah_Terima_${doc.verificationCode}.pdf`);
  } catch (error) {
    console.error("Failed to export document to PDF:", error);
    alert("Gagal mengekspor dokumen ke PDF. Silakan coba kembali.");
  } finally {
    // Cleanup offscreen element
    document.body.removeChild(wrapper);
  }
}

export function generateDocumentHTML(doc: DocumentHandover): string {
  const verifyUrl = `${window.location.origin}/?verify=${encodeURIComponent(doc.verificationCode)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;

  const formattedDate = new Date(doc.timestamp).toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short"
  });

  let itemsHtml = "";
  if (doc.items && doc.items.length > 0) {
    itemsHtml = `
      <div style="margin-top: 20px; margin-bottom: 25px;">
        <h4 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: #4338ca; text-transform: uppercase; letter-spacing: 0.5px;">Rincian Serah Terima Per Kegiatan:</h4>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${doc.items.map((item, index) => {
            const isUnchecked = item.includes(" - Ditangguhkan");
            const cleanItem = isUnchecked ? item.replace(" - Ditangguhkan", "") : item;
            
            // Parse item title, category, and detail
            let itemTitle = cleanItem;
            let itemCategory = "Umum";
            let itemDetail = "";

            const categoryMatch = cleanItem.match(/^(.+?)\s*\[([^\]]+)\](?:\s*-\s*(.*))?$/);
            if (categoryMatch) {
              itemTitle = categoryMatch[1].trim();
              itemCategory = categoryMatch[2].trim();
              itemDetail = categoryMatch[3] ? categoryMatch[3].trim() : "";
            } else {
              const descIndex = cleanItem.indexOf(" - ");
              if (descIndex !== -1) {
                itemTitle = cleanItem.substring(0, descIndex).trim();
                itemDetail = cleanItem.substring(descIndex + 3).trim();
              }
            }

            const cardBg = isUnchecked ? "#fafafa" : "#ffffff";
            const leftBorder = isUnchecked ? "4px solid #ef4444" : "4px solid #4338ca";
            const badgeBg = isUnchecked ? "#fee2e2" : "#ecfdf5";
            const badgeColor = isUnchecked ? "#ef4444" : "#059669";
            const badgeText = isUnchecked ? `Ditangguhkan (${itemCategory})` : itemCategory;
            const textDecoration = isUnchecked ? "text-decoration: line-through; color: #94a3b8;" : "";

            return `
              <div style="background: ${cardBg}; border: 1px solid #e2e8f0; border-left: ${leftBorder}; border-radius: 8px; padding: 12px 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); display: block;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 15px;">
                  <span style="font-size: 12px; font-weight: 800; color: #0f172a; ${textDecoration}">
                    ${index + 1}. ${itemTitle}
                  </span>
                  <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 2.5px 8px; border-radius: 9999px; font-size: 9px; font-weight: 800; text-transform: uppercase; border: 1px solid ${isUnchecked ? '#fca5a5' : '#a7f3d0'}; white-space: nowrap;">
                    ${badgeText}
                  </span>
                </div>
                ${itemDetail ? `
                  <div style="font-size: 11px; line-height: 1.5; color: #475569; background: #f8fafc; padding: 8px 12px; border-radius: 6px; border: 1px solid #f1f5f9; margin-top: 4px; ${textDecoration}">
                    ${itemDetail}
                  </div>
                ` : ""}
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  let statusBadgeColor = "background: #fef3c7; color: #92400e; border: 1px solid #fde68a;";
  let statusText = "PROSES APPROVAL";
  if (doc.status === "completed") {
    statusBadgeColor = "background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;";
    statusText = "SELESAI (VALID)";
  } else if (doc.status === "rejected") {
    statusBadgeColor = "background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;";
    statusText = "DITOLAK";
  }

  const getSigElement = (sigData: string | null, label: string, name: string) => {
    if (sigData) {
      return `
        <div style="height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
          <img src="${sigData}" style="max-height: 75px; max-width: 140px; object-fit: contain;" alt="Signature" />
        </div>
      `;
    }
    return `
      <div style="height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; color: #94a3b8; font-style: italic; font-size: 11px; border: 1px dashed #e2e8f0; border-radius: 6px; background: #fafafa;">
        Belum Ditandatangani
      </div>
    `;
  };

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Bukti Serah Terima - ${doc.verificationCode}</title>
      <style>
        body {
          font-family: 'Inter', system-ui, sans-serif;
          background: #f8fafc;
          margin: 0;
          padding: 20px;
          display: flex;
          justify-content: center;
        }
        .container {
          max-width: 800px;
          width: 100%;
          background: #ffffff;
          box-sizing: border-box;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 35px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        @media print {
          body {
            background: #ffffff;
            padding: 0;
          }
          .container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header PT -->
        <div style="border-bottom: 3px double #4f46e5; padding-bottom: 15px; margin-bottom: 25px; text-align: center; position: relative;">
          <div style="position: absolute; left: 0; top: 0; width: 50px; height: 50px;">
            <img src="https://iili.io/C0QQIpV.png" style="width: 100%; height: 100%; object-fit: contain;" alt="PT Logo" />
          </div>
          <h2 style="margin: 0 0 5px 0; font-size: 20px; font-weight: 900; color: #1e1b4b; letter-spacing: 0.5px; text-transform: uppercase;">PT.DANADIKLAT</h2>
          <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 500;">Sistem E-Signature & Digital Handover Terintegrasi Google Workspace</p>
        </div>

        <!-- Document Title -->
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="margin: 0 0 5px 0; font-size: 18px; font-weight: 950; color: #4338ca; tracking-wide: 1px; text-transform: uppercase;">BERITA ACARA SERAH TERIMA BERKAS DIGITAL</h1>
          <p style="margin: 0; font-size: 10px; color: #64748b;">Dihasilkan secara otomatis melalui Portal E-Handover DANA</p>
        </div>

        <!-- Verification and Status Section -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px 20px; margin-bottom: 25px;">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="border: 1px solid #cbd5e1; padding: 4px; background: #ffffff; border-radius: 8px; width: 68px; height: 68px; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <img src="${qrCodeUrl}" style="width: 58px; height: 58px; display: block;" alt="QR Verification" crossorigin="anonymous" />
            </div>
            <div>
              <span style="font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">Kode Verifikasi &amp; QR Scan</span>
              <code style="background: #e0e7ff; color: #4338ca; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 900; font-family: monospace; display: inline-block;">${doc.verificationCode}</code>
              <p style="margin: 3px 0 0 0; font-size: 9px; color: #64748b; font-weight: 500;">Pindai QR Code untuk memeriksa keaslian dokumen via Portal DANA</p>
            </div>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 4px;">Status Dokumen</span>
            <span style="${statusBadgeColor} padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 900; display: inline-block;">${statusText}</span>
          </div>
        </div>

        <!-- Meta Grid Information -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
          <div style="background: #fafafa; border-left: 4px solid #4338ca; padding: 10px 15px; border-radius: 4px;">
            <strong style="display: block; font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 800; margin-bottom: 4px;">Kategori Berkas</strong>
            <span style="font-size: 12px; font-weight: 700; color: #0f172a;">${doc.category}</span>
          </div>
          <div style="background: #fafafa; border-left: 4px solid #4338ca; padding: 10px 15px; border-radius: 4px;">
            <strong style="display: block; font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 800; margin-bottom: 4px;">Tanggal Diajukan</strong>
            <span style="font-size: 12px; font-weight: 700; color: #0f172a;">${formattedDate}</span>
          </div>
          <div style="background: #fafafa; border-left: 4px solid #4338ca; padding: 10px 15px; border-radius: 4px;">
            <strong style="display: block; font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 800; margin-bottom: 4px;">Pihak Pertama (Pengaju / Sender)</strong>
            <span style="font-size: 12px; font-weight: 700; color: #0f172a; display: block;">${doc.senderName}</span>
            <span style="font-size: 10px; color: #64748b;">${doc.senderEmail}</span>
          </div>
          <div style="background: #fafafa; border-left: 4px solid #4338ca; padding: 10px 15px; border-radius: 4px;">
            <strong style="display: block; font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 800; margin-bottom: 4px;">Pihak Kedua (Penerima / Recipient)</strong>
            <span style="font-size: 12px; font-weight: 700; color: #0f172a; display: block;">${doc.recipientName}</span>
            <span style="font-size: 10px; color: #64748b;">${doc.recipientEmail}</span>
          </div>
        </div>

        <!-- Items Table -->
        ${itemsHtml}

        <!-- Rejection Info -->
        ${doc.rejectionReason ? `
          <div style="margin-bottom: 25px; border: 1px solid #fee2e2; background-color: #fef2f2; padding: 15px; border-radius: 8px;">
            <strong style="color: #991b1b; font-size: 12px; text-transform: uppercase; font-weight: 800; display: block; margin-bottom: 4px;">Alasan Penolakan:</strong>
            <p style="margin: 0; font-size: 12px; color: #b91c1c; font-weight: 500;">${doc.rejectionReason}</p>
          </div>
        ` : ""}

        <!-- Signatures Grid -->
        <div style="margin-top: 30px; display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 15px; text-align: center;">
          <div style="border-top: 1px dashed #cbd5e1; padding-top: 15px; background: #fafafa; border-radius: 8px; padding: 12px;">
            <div style="font-size: 8px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 10px;">DIREKOMENDASIKAN OLEH</div>
            ${getSigElement(doc.senderSignature, "Sender", doc.senderName === "Budi Santoso" ? "Budi Santoso, untuk pihak pertama Meidi Priandana" : doc.senderName)}
            <div style="font-size: 11px; font-weight: bold; color: #0f172a;">${doc.senderName === "Budi Santoso" ? "Budi Santoso, untuk pihak pertama Meidi Priandana" : doc.senderName}</div>
            <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Pihak Pertama (Pengaju)</div>
          </div>

          <div style="border-top: 1px dashed #cbd5e1; padding-top: 15px; background: #fafafa; border-radius: 8px; padding: 12px;">
            <div style="font-size: 8px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 10px;">DIVERIFIKASI OLEH</div>
            ${getSigElement(doc.adminSignature, "Admin", "Sistem Admin")}
            <div style="font-size: 11px; font-weight: bold; color: #0f172a;">Sistem Admin</div>
            <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Pihak Kedua (Verifikator)</div>
          </div>

          ${(() => {
            const sups = doc.supervisorName ? doc.supervisorName.split(";").map((s: string) => s.trim()).filter(Boolean) : [];
            return sups.map((supName: string) => {
              const sig = doc.supervisorSignatures?.[supName] || (sups.length === 1 ? doc.supervisorSignature : null);
              return `
                <div style="border-top: 1px dashed #cbd5e1; padding-top: 15px; background: #fafafa; border-radius: 8px; padding: 12px;">
                  <div style="font-size: 8px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 10px;">DISETUJUI OLEH</div>
                  ${getSigElement(sig, "Supervisor", supName)}
                  <div style="font-size: 11px; font-weight: bold; color: #0f172a;">${supName}</div>
                  <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Atasan Penyetuju</div>
                </div>
              `;
            }).join("");
          })()}
        </div>

        <!-- Security Certificate Footer block -->
        <div style="margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div style="font-size: 10px; color: #64748b; max-width: 70%; line-height: 1.5;">
            <strong style="color: #475569; display: block; margin-bottom: 3px;">Catatan Keamanan Digital:</strong>
            Dokumen ini ditandatangani secara elektronik menggunakan hash cryptographic <strong>SHA-256</strong> yang aman dan diverifikasi secara real-time. Tanda tangan yang tercantum adalah sah dan mengikat secara hukum sesuai dengan UU ITE yang berlaku di Indonesia.
          </div>
          <div style="text-align: right; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; background: #ffffff; display: flex; align-items: center; gap: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="text-align: left;">
              <strong style="font-size: 9px; font-family: sans-serif; font-weight: 800; color: #4338ca; display: block; letter-spacing: 0.3px;">VERIFIKASI QR</strong>
              <span style="font-size: 7px; color: #64748b; display: block; margin-top: 1px;">Pindai untuk Verifikasi</span>
            </div>
            <div style="border: 1px solid #f1f5f9; padding: 2px; background: #ffffff; border-radius: 4px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
              <img src="${qrCodeUrl}" style="width: 38px; height: 38px; display: block;" alt="QR Code" crossorigin="anonymous" />
            </div>
          </div>
        </div>

        <!-- Real footer -->
        <div style="margin-top: 35px; border-top: 1px solid #f1f5f9; padding-top: 15px; text-align: center; font-size: 10px; color: #94a3b8;">
          Dokumen ini dibuat dan disimpan secara digital secara real-time. Terkoneksi penuh ke Google Sheets & Google Drive.<br />
          &copy; 2026 PT.DANADIKLAT. Semua hak dilindungi undang-undang.
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getDocumentHtmlBlobUrl(doc: DocumentHandover): string {
  const htmlContent = generateDocumentHTML(doc);
  const blob = new Blob([htmlContent], { type: "text/html" });
  return URL.createObjectURL(blob);
}

