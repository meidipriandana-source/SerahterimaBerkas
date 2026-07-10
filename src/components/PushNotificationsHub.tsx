import React, { useState } from "react";
import { Bell, BellOff, Check, CheckSquare, Trash2, Calendar, ShieldAlert, Clock, ArrowRight } from "lucide-react";
import { PushNotification } from "../types";

interface PushNotificationsHubProps {
  notifications: PushNotification[];
  onMarkAllRead: () => void;
  onClearAll?: () => void;
}

export default function PushNotificationsHub({
  notifications,
  onMarkAllRead,
  onClearAll
}: PushNotificationsHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      onMarkAllRead();
    }
  };

  return (
    <div className="relative" id="notifications-hub">
      {/* Bell Trigger Button */}
      <button
        onClick={handleToggle}
        id="btn-bell-toggle"
        className="relative p-2 text-slate-400 hover:text-slate-600 focus:outline-hidden hover:bg-slate-100 rounded-full transition cursor-pointer"
        title="Notifikasi Pembaruan Status"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4" id="bell-unread-badge">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-bold text-white items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {isOpen && (
        <>
          {/* Overlay to close */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fadeIn" id="notifications-popover">
            {/* Popover Header */}
            <div className="bg-white text-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-800">
                <Bell className="w-4 h-4 text-indigo-600" /> Pusat Notifikasi Push
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  id="btn-popover-mark-all-read"
                  className="text-[10px] text-indigo-600 hover:text-indigo-500 hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                >
                  <CheckSquare className="w-3.5 h-3.5" /> Tandai Dibaca
                </button>
              )}
            </div>

            {/* List area */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <BellOff className="w-8 h-8 text-slate-200 mx-auto mb-1.5 stroke-1" />
                  <p className="font-semibold">Tidak ada notifikasi push masuk</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Semua pembaruan status berkas akan diberitahukan di sini secara real-time.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const formattedTime = new Date(notif.timestamp).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <div
                      key={notif.id}
                      className={`p-3.5 flex items-start gap-3 transition-colors ${
                        notif.read ? "bg-white" : "bg-indigo-50/40"
                      }`}
                    >
                      {/* Left icon badge depends on type */}
                      <div className="mt-1 shrink-0">
                        {notif.title.includes("Selesai") || notif.title.includes("Persetujuan") ? (
                          <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-full">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : notif.title.includes("Ditolak") ? (
                          <div className="p-1.5 bg-red-100 text-red-600 rounded-full">
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-full">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Content text */}
                      <div className="flex-1 space-y-1 text-xs">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-800">{notif.title}</span>
                          <span className="text-[9px] text-slate-400 font-mono shrink-0">{formattedTime}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Popover */}
            <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 text-center text-[10px] text-slate-400 flex items-center justify-between">
              <span>Sistem Push Notifikasi Aktif</span>
              <span>PT.DANADIKLAT</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
