import { Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  Heart,
  Inbox,
  Mail,
  Sparkles,
  UserCheck,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useNotificationAlerts } from "@/hooks/useNotificationAlerts";
import type { AppNotification } from "@/types/notification";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications } = usePage().props;
  const { soundEnabled, toggleSound } = useNotificationAlerts();

  const unreadCount = notifications?.unread_count ?? 0;
  const recentNotifications: AppNotification[] = notifications?.recent ?? [];

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.post('/notifications/mark-all-read', {}, {
      preserveScroll: true,
      preserveState: true,
    });
  };

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.patch(`/notifications/${id}/read`, {}, {
      preserveScroll: true,
      preserveState: true,
    });
  };

  const getCategoryMeta = (category?: string) => {
    switch (category) {
      case "disbursement":
        return {
          icon: <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          bg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50",
        };
      case "campaigner":
        return {
          icon: <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
          bg: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50",
        };
      case "contact":
        return {
          icon: <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
          bg: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50",
        };
      case "donation":
        return {
          icon: <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
          bg: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50",
        };
      case "program":
        return {
          icon: <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
          bg: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50",
        };
      default:
        return {
          icon: <Bell className="w-4 h-4 text-brand-600 dark:text-brand-400" />,
          bg: "bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400 border border-brand-100 dark:border-brand-900/50",
        };
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        aria-label="Notifikasi"
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 z-10 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-30"></span>
          </span>
        )}
        <Bell className="w-5 h-5" />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex max-h-[520px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 sm:w-[380px] lg:right-0 z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h5 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              Notifikasi
            </h5>
            {unreadCount > 0 && (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                {unreadCount} baru
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Audio Chime Mute/Unmute Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              title={
                soundEnabled
                  ? "Suara notifikasi aktif (klik untuk membisukan)"
                  : "Suara notifikasi dibisukan (klik untuk mengaktifkan)"
              }
              className="p-1.5 rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                title="Tandai semua telah dibaca"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Baca Semua</span>
              </button>
            )}
            <button
              type="button"
              onClick={closeDropdown}
              aria-label="Tutup"
              className="p-1 text-gray-400 rounded-md transition hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex flex-col overflow-y-auto max-h-[380px] divide-y divide-gray-100 dark:divide-gray-800/80 custom-scrollbar">
          {recentNotifications.length > 0 ? (
            recentNotifications.map((item) => {
              const meta = getCategoryMeta(item.data.category);
              const isUnread = !item.read_at;

              return (
                <div
                  key={item.id}
                  className={`group relative flex items-start gap-3 p-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] ${
                    isUnread
                      ? "bg-brand-500/[0.03] dark:bg-brand-500/[0.04]"
                      : ""
                  }`}
                >
                  {/* Category Icon Badge */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}
                  >
                    {meta.icon}
                  </div>

                  {/* Body Text (Clickable to Go) */}
                  <Link
                    href={`/notifications/${item.id}/go`}
                    onClick={closeDropdown}
                    className="flex-1 min-w-0 pr-4"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <p
                        className={`text-xs truncate ${
                          isUnread
                            ? "font-semibold text-gray-900 dark:text-white"
                            : "font-medium text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {item.data.title}
                      </p>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 dark:text-gray-400 leading-relaxed">
                      {item.data.message}
                    </p>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        {item.created_at}
                      </span>
                    </div>
                  </Link>

                  {/* Actions / Unread Dot */}
                  <div className="flex flex-col items-center justify-between self-stretch shrink-0">
                    {isUnread ? (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(e, item.id)}
                        title="Tandai sudah dibaca"
                        className="p-1 rounded-full text-brand-500 opacity-60 hover:opacity-100 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-opacity"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="w-2 h-2"></span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 mb-3">
                <Inbox className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Belum ada notifikasi
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[220px]">
                Notifikasi aktivitas operasional dan transaksi penting akan muncul di sini.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <Link
            href="/notifications"
            onClick={closeDropdown}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 hover:text-brand-700 dark:text-brand-400 dark:hover:bg-brand-950/50 dark:hover:text-brand-300"
          >
            <span>Lihat Semua Notifikasi</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}
