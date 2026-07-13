import React, { useState, useEffect } from "react";
import { 
  FileText, Database, FolderOpen, Mail, ShieldCheck, 
  Settings, Bell, ListTodo, Activity, LogIn, ChevronRight, CheckCircle2, 
  Clock, Shield, User, UserCheck, CornerDownRight, Menu, X, HelpCircle, Trash2, RefreshCw,
  Sun, Moon
} from "lucide-react";
import RoleSelector from "./components/RoleSelector";
import HandoverForm from "./components/HandoverForm";
import AdminApprovalInbox from "./components/AdminApprovalInbox";
import SupervisorApprovalInbox from "./components/SupervisorApprovalInbox";
import SheetsLiveView from "./components/SheetsLiveView";
import DriveLiveView from "./components/DriveLiveView";
import EmailInboxSimulator from "./components/EmailInboxSimulator";
import VerificationPanel from "./components/VerificationPanel";
import WorkspaceConfigModal from "./components/WorkspaceConfigModal";
import PushNotificationsHub from "./components/PushNotificationsHub";
import BackupRestorePanel from "./components/BackupRestorePanel";
import { DocumentHandover, ActivityLog, PushNotification, UserRole } from "./types";

export default function App() {
  // Roles & Authentication
  const [currentRole, setCurrentRole] = useState<UserRole>("staff");
  
  // Data State
  const [documents, setDocuments] = useState<DocumentHandover[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  
  // App UI State
  const [activeTab, setActiveTab] = useState<string>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isSmartphoneMode, setIsSmartphoneMode] = useState(true);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme_mode") === "dark";
  });

  const handleToggleDarkMode = (val: boolean) => {
    setIsDarkMode(val);
    if (val) {
      localStorage.setItem("theme_mode", "dark");
    } else {
      localStorage.setItem("theme_mode", "light");
    }
  };

  // Realtime clock state
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Google Workspace Settings Config
  const [workspaceConfig, setWorkspaceConfig] = useState({
    spreadsheetId: "1uXQ_Ld-u21GvD8H_O8rK3gA",
    sheetName: "Sheet1",
    driveFolderId: "1o8vP_A9W-9gLd8S_J8rD3gA",
    driveFolderName: "Serah_Terima_PDFs",
    connected: false
  });

  // Fetch all data from backend API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [docsRes, logsRes, notifsRes] = await Promise.all([
        fetch("/api/documents"),
        fetch("/api/logs"),
        fetch("/api/notifications")
      ]);

      if (docsRes.ok && logsRes.ok && notifsRes.ok) {
        const docs = await docsRes.json();
        const activityLogs = await logsRes.json();
        const notifs = await notifsRes.json();
        
        setDocuments(docs);
        setLogs(activityLogs);
        setNotifications(notifs);
      }
    } catch (error) {
      console.error("Gagal sinkronisasi data dari server:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Poll data every 5 seconds to keep simulation real-time
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Helper to add new push notification
  const handleTriggerPushNotification = async (title: string, message: string) => {
    // Standard visual toast alert
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body: message });
    }
    
    // Refresh to get new logs and notifications
    fetchData();
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await fetch("/api/notifications/read", { method: "POST" });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch("/api/logs/clear", { method: "POST" });
      fetchData();
    } catch (error) {
      console.error("Gagal membersihkan log:", error);
    }
  };

  const handleSaveWorkspaceConfig = (newConfig: any) => {
    setWorkspaceConfig(newConfig);
    setShowConfigModal(false);
    
    // Send a push notification
    const alertTitle = newConfig.connected ? "Google Workspace Terhubung" : "Google Workspace Terputus";
    const alertMsg = newConfig.connected 
      ? `Aplikasi berhasil mengaktifkan sinkronisasi otomatis ke Google Sheet ID: ${newConfig.spreadsheetId.substring(0, 10)}... dan Drive Folder: ${newConfig.driveFolderName}.`
      : "Sinkronisasi Google API di-nonaktifkan. Aplikasi kembali ke DANA.";
      
    handleTriggerPushNotification(alertTitle, alertMsg);
  };

  // Sidebar Tabs Config
  const tabs = [
    { id: "form", label: "Form Serah Terima", icon: FileText, count: null },
    { id: "admin_inbox", label: "Antrean Admin", icon: Shield, count: documents.filter(d => d.status === 'pending_admin').length },
    { id: "atasan_inbox", label: "Antrean Atasan", icon: UserCheck, count: documents.filter(d => d.status === 'pending_atasan').length },
    { id: "sheets", label: "Google Sheets", icon: Database, count: null },
    { id: "drive", label: "Google Drive", icon: FolderOpen, count: documents.filter(d => d.status === 'completed').length },
    { id: "backup", label: "Backup & Restore", icon: RefreshCw, count: null },
    { id: "verification", label: "Verifikasi Berkas", icon: ShieldCheck, count: null },
  ];

  // Deep linking for QR code scans
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyCode = params.get("verify") || params.get("verification");
    if (verifyCode) {
      setActiveTab("verification");
    }
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    // Auto shift active tab to appropriate panel for testing role pipeline
    if (role === "admin") {
      setActiveTab("admin_inbox");
    } else if (role === "atasan") {
      setActiveTab("atasan_inbox");
    } else {
      setActiveTab("form");
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-all duration-300 ${isDarkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} ${
      isSmartphoneMode 
        ? "lg:bg-slate-900 lg:bg-linear-to-br lg:from-slate-950 lg:via-indigo-950 lg:to-slate-900 lg:flex lg:flex-col lg:items-center lg:justify-center lg:py-6 lg:px-4" 
        : "flex flex-col"
    }`} id="digital-handover-app">
      
      {/* Floating control bar visible only on widescreen screens >= lg */}
      <div className="hidden lg:flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-xl mb-6 z-50 animate-fadeIn">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mode Ukuran Layar:</span>
        <button
          onClick={() => setIsSmartphoneMode(true)}
          id="btn-switch-smartphone"
          className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${isSmartphoneMode ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-white/5 text-slate-300 hover:text-white"}`}
        >
          <span>📱 Smartphone Preview</span>
        </button>
        <button
          onClick={() => setIsSmartphoneMode(false)}
          id="btn-switch-fullscreen"
          className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${!isSmartphoneMode ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-white/5 text-slate-300 hover:text-white"}`}
        >
          <span>💻 Layar Penuh Desktop</span>
        </button>
      </div>

      {/* Main Container: simulated smartphone shell on desktop, fluid 100% on actual mobile */}
      <div className={`
        flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900 relative
        ${isSmartphoneMode 
          ? "w-full h-full lg:w-[410px] lg:h-[840px] lg:bg-slate-950 lg:rounded-[48px] lg:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] lg:border-[10px] lg:border-slate-800 lg:ring-4 lg:ring-slate-800/30"
          : "w-full min-h-screen"
        }
      `}>
        {/* Notch & speaker line visible only in smartphone mode and on desktop screens >= lg */}
        {isSmartphoneMode && (
          <>
            <div className="hidden lg:flex absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-5.5 bg-black rounded-full z-50 items-center justify-center gap-1 text-[10px] text-white font-bold select-none shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse border border-slate-700/50" />
              <span className="text-[8px] text-indigo-400/90 font-mono tracking-widest font-black uppercase">SignFlow</span>
            </div>
            <div className="hidden lg:block absolute top-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-slate-700 rounded-full z-50" />
            
            {/* Top status bar inside phone viewport, visible only in smartphone mode and on desktop screens >= lg */}
            <div className="hidden lg:flex h-9 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-6 pt-2 items-center justify-between text-[10px] font-bold select-none shrink-0 z-40 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 font-sans">
                <span>Telkomsel</span>
                <span className="text-[8px] text-slate-400 font-extrabold bg-slate-100 px-1 rounded">4G</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 font-mono">
                {new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center gap-1 text-slate-700">
                <svg className="w-3 h-3 text-slate-600" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.5 8a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H12a.5.5 0 0 1-.5-.5V8z"/>
                  <path fillRule="evenodd" d="M12 6.5a1.5 1.5 0 0 0-1.5-1.5h-9A1.5 1.5 0 0 0 0 6.5v5A1.5 1.5 0 0 0 1.5 13h9a1.5 1.5 0 0 0 1.5-1.5V10h1a1 1 0 0 0 1-1V7.5a1 1 0 0 0-1-1h-1V6.5zM1.5 6a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5h-9z"/>
                </svg>
                <span className="text-[9px] font-sans">98%</span>
              </div>
            </div>
          </>
        )}

        {/* Real App Inner Scrollable Viewport */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Top Main Navigation Bar */}
          <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-3xs sticky top-0 z-40 shrink-0">
            <div className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile menu trigger */}
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  id="btn-mobile-menu-toggle"
                  className={`p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer text-slate-600 dark:text-slate-300 ${(!isSmartphoneMode) ? "lg:hidden" : ""}`}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                
                <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center shadow-xs bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-1 shrink-0">
                  <img src="https://iili.io/C0QQIpV.png" alt="Serah Terima Digital Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                
                <div className="flex flex-col">
                  <div className="text-sm font-black tracking-wider text-indigo-600 dark:text-indigo-400 font-mono flex items-center gap-1.5 leading-none">
                    <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse shrink-0" />
                    <span>
                      {time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold tracking-tight mt-1">
                    {time.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Dark Mode Quick Switcher */}
                <button
                  type="button"
                  onClick={() => handleToggleDarkMode(!isDarkMode)}
                  id="btn-quick-theme-toggle"
                  title={isDarkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl transition cursor-pointer flex items-center justify-center"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-500" />
                  )}
                </button>

                {/* Cloud Sync Badge Indicator */}
                <button
                  onClick={() => setShowConfigModal(true)}
                  id="btn-cloud-sync-status"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[9px] font-black uppercase transition-all duration-300 cursor-pointer ${
                    workspaceConfig.connected 
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-950/50" 
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    workspaceConfig.connected 
                      ? 'bg-emerald-500 animate-pulse ring-2 ring-emerald-400 ring-offset-1 shadow-[0_0_10px_#10b981]' 
                      : 'bg-slate-400'
                  }`} />
                  <span>
                    {workspaceConfig.connected ? "DANA (Online)" : "DANA"}
                  </span>
                </button>

                {/* In-app Push Notifications Hub */}
                <PushNotificationsHub 
                  notifications={notifications}
                  onMarkAllRead={handleMarkAllNotificationsRead}
                />
              </div>
            </div>
          </header>

          {/* Main Area: Sidebar + Panel Content */}
          <div className={`flex-1 flex flex-col relative overflow-hidden ${(!isSmartphoneMode) ? "lg:flex-row" : ""}`}>
            
            {/* Left Side Sidebar Navigation - Responsive */}
            <aside className={`
              shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex flex-col z-30
              absolute inset-y-0 left-0 transform transition-transform duration-300 ease-in-out
              ${(!isSmartphoneMode) ? "lg:static lg:w-64 lg:translate-x-0" : ""}
              ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `} id="sidebar-navigation">
              
              {/* Logo / Brand Sidebar Section matches Design HTML */}
              <div className="p-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-950 dark:to-indigo-900 text-white shrink-0">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center p-1 shadow-3xs border border-white/20 overflow-hidden shrink-0">
                  <img src="https://iili.io/C0QQIpV.png" alt="SignFlow Pro Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <span className="font-extrabold text-sm tracking-tight font-display">SignFlow Pro</span>
              </div>

              {/* Main App Navigation Tabs */}
              <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-3 mb-2 font-display">
                  Menu Utama
                </span>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      id={`tab-btn-${tab.id}`}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                        isActive 
                          ? "bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 shadow-3xs border-l-4 border-indigo-600 font-extrabold" 
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50/60 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.count !== null && tab.count > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${isActive ? 'bg-indigo-600 dark:bg-indigo-500 text-white' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'}`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Quick Info Box at Sidebar bottom */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 shrink-0">
                <div className="flex items-center justify-between font-bold text-slate-600 dark:text-slate-300">
                  <span>SINKRONISASI AKTIF</span>
                  <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-1.5 rounded">AUTO</span>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500">
                  Persetujuan tanda tangan digital dicatat real-time pada Google Sheets &amp; Drive.
                </p>
              </div>
            </aside>

            {/* Content Panel Box */}
            <main className="flex-1 p-4 overflow-y-auto max-w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
              <div className={`${activeTab === "sheets" || activeTab === "drive" ? "max-w-[98%] 2xl:max-w-[1700px]" : "max-w-6xl"} mx-auto space-y-5 transition-all duration-300`}>
                
                {/* Role-Based Access Control Simulator Switcher */}
                <RoleSelector 
                  currentRole={currentRole} 
                  onRoleChange={handleRoleChange} 
                />

                {/* Main Tabs panels wrapper */}
                <div className="transition-all duration-300">
                  {activeTab === "form" && (
                    <HandoverForm 
                      onSuccessSubmit={fetchData} 
                      triggerPushNotification={handleTriggerPushNotification}
                      documents={documents}
                    />
                  )}
                  
                  {activeTab === "admin_inbox" && (
                    <AdminApprovalInbox 
                      documents={documents} 
                      onActionComplete={fetchData}
                      triggerPushNotification={handleTriggerPushNotification}
                    />
                  )}
                  
                  {activeTab === "atasan_inbox" && (
                    <SupervisorApprovalInbox 
                      documents={documents} 
                      onActionComplete={fetchData}
                      triggerPushNotification={handleTriggerPushNotification}
                    />
                  )}
                  
                  {activeTab === "sheets" && (
                    <SheetsLiveView 
                      documents={documents} 
                      onRefresh={fetchData} 
                      isLoading={isLoading} 
                    />
                  )}
                  
                  {activeTab === "drive" && (
                    <DriveLiveView 
                      documents={documents} 
                      onRefresh={fetchData} 
                      isLoading={isLoading} 
                    />
                  )}
                  
                  {activeTab === "backup" && (
                    <BackupRestorePanel 
                      documents={documents} 
                      onRefresh={fetchData} 
                      triggerPushNotification={handleTriggerPushNotification}
                    />
                  )}

                  {activeTab === "verification" && (
                    <VerificationPanel 
                      documents={documents} 
                    />
                  )}
                </div>

                {/* Footer Status Bar matches Design HTML */}
                <div className="flex flex-col justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs gap-3">
                  <div className="flex flex-wrap gap-2 justify-center">
                     <div className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                       <span className="text-[10px] text-slate-500 dark:text-slate-400">G-Sheet DB Connected</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                       <span className="text-[10px] text-slate-500 dark:text-slate-400">AppSheet Active</span>
                     </div>
                  </div>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 text-center">
                     v1.4.0 Build 2026
                  </div>
                </div>

              </div>
            </main>
          </div>
        </div>

        {/* Smartphone Home indicator bar at bottom of mockup frame */}
        {isSmartphoneMode && (
          <div className="hidden lg:flex h-5 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 z-40 border-t border-slate-50 dark:border-slate-800">
            <div className="w-24 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>
        )}
      </div>

      {/* Google Workspace Settings Modal Triggered overlay */}
      {showConfigModal && (
        <WorkspaceConfigModal
          currentConfig={workspaceConfig}
          onClose={() => setShowConfigModal(false)}
          onSave={handleSaveWorkspaceConfig}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />
      )}
    </div>
  );
}
