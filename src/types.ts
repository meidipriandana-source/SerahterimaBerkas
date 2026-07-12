export type UserRole = 'staff' | 'admin' | 'atasan';

export interface DocumentHandover {
  id: string;
  title: string;
  description: string;
  category: string;
  timestamp: string;
  
  senderName: string;
  senderEmail: string;
  senderSignature: string; // Base64 image
  
  recipientName: string;
  recipientEmail: string;
  
  supervisorName: string;
  supervisorEmail: string;
  supervisorSignature: string | null; // Base64 image
  supervisorSignatures?: Record<string, string | null>; // Multiple signatures
  
  adminSignature: string | null; // Base64 image
  
  status: 'pending_admin' | 'pending_atasan' | 'completed' | 'rejected';
  rejectionReason?: string;
  
  verificationCode: string; // Uniq secure hash
  pdfUrl?: string; // Saved path
  items?: string[]; // List of specific files or items
  
  // Real or simulated Google Sheet sync info
  sheetsSynced: boolean;
  driveSynced: boolean;
  emailSent: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  documentId: string;
  documentTitle: string;
  actor: string;
  role: UserRole;
  action: string;
  details: string;
}

export interface PushNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  documentId?: string;
  read: boolean;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  sheetName: string;
  connected: boolean;
}

export interface GoogleDriveConfig {
  folderId: string;
  folderName: string;
  connected: boolean;
}
