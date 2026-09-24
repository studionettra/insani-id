import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState, useTransition } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  ExternalLink,
  Filter,
  Heart,
  Inbox,
  Mail,
  Monitor,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  UserCheck,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useNotificationSound } from "@/hooks/useNotificationAlerts";
import type { AppNotification } from "@/types/notification";

interface NotificationsIndexProps {
  notifications: {
    data: AppNotification[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    from: number | null;
    to: number | null;
    total: number;
    current_page: number;
    last_page: number;
  };
  filters: {
    status: "all" | "unread" | "read";
    category: string;
    search: string;
  };
  stats: {
    total: number;
    unread: number;
    read: number;
  };
}

export default function NotificationsIndex({
  notifications,
  filters,
  stats,
}: NotificationsIndexProps) {
  const { siteSettings } = usePage<{ siteSettings?: Record<string, string> }>().props;
  const [search, setSearch] = useState(filters.search || "");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  // Notification Sound Preference Hook (Polling & toasts handled by AppHeader/NotificationDropdown)
  const { soundEnabled, toggleSound, playTestChime } = useNotificationSound();
  const [desktopPermission, setDesktopPermission] = useState<NotificationPermission>(() => {
    return typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "denied";
  });

  const handleRequestDesktopPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setDesktopPermission(perm);
      if (perm === "granted") {
        new Notification("Notifikasi Desktop Diaktifkan", {
          body: "Anda akan menerima pemberitahuan aktivitas penting Insani-ID secara langsung.",
          icon: siteSettings?.site_favicon
            ? `/storage/${siteSettings.site_favicon}`
            : "/favicon-insani.svg",
        });
      }
    }
  };

  // Dialog States
  const [isClearReadOpen, setIsClearReadOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Apply filters via Inertia
  const updateFilter = (newFilters: Partial<typeof filters>) => {
    startTransition(() => {
      router.get(
        '/notifications',
        {
          ...filters,
          ...newFilters,
          page: 1,
        },
        {
          preserveState: true,
          preserveScroll: true,
        }
      );
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter({ search });
  };

  const handleClearSearch = () => {
    setSearch("");
    updateFilter({ search: "" });
  };

  // Selection Logic
  const allPageIds = notifications.data.map((n) => n.id);
  const isAllSelected =
    allPageIds.length > 0 && allPageIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allPageIds);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkAction = (action: "mark_read" | "mark_unread" | "delete") => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    router.post(
      '/notifications/bulk-action',
      {
        action,
        ids: selectedIds,
      },
      {
        preserveScroll: true,
        onFinish: () => {
          setActionLoading(false);
          setSelectedIds([]);
          setIsBulkDeleteOpen(false);
        },
      }
    );
  };

  // Single Actions
  const handleToggleRead = (notification: AppNotification) => {
    if (notification.read_at) {
      router.patch(`/notifications/${notification.id}/unread`, {}, { preserveScroll: true });
    } else {
      router.patch(`/notifications/${notification.id}/read`, {}, { preserveScroll: true });
    }
  };

  const handleDeleteSingle = () => {
    if (!itemToDelete) return;
    setActionLoading(true);
    router.delete(`/notifications/${itemToDelete}`, {
      preserveScroll: true,
      onFinish: () => {
        setActionLoading(false);
        setItemToDelete(null);
      },
    });
  };

  const handleClearAllRead = () => {
    setActionLoading(true);
    router.delete('/notifications/clear-read', {
      preserveScroll: true,
      onFinish: () => {
        setActionLoading(false);
        setIsClearReadOpen(false);
      },
    });
  };

  const formatPaginationLabel = (label: string) => {
    return label
      .replace("&laquo; Previous", "&laquo; Sebelumnya")
      .replace("Next &raquo;", "Selanjutnya &raquo;");
  };

  const getCategoryMeta = (category?: string) => {
    switch (category) {
      case "disbursement":
        return {
          label: "Pencairan Dana",
          icon: <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60",
        };
      case "campaigner":
        return {
          label: "Verifikasi",
          icon: <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
          bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60",
        };
      case "contact":
        return {
          label: "Pesan Kontak",
          icon: <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
          bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60",
        };
      case "donation":
        return {
          label: "Donasi",
          icon: <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
          bg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60",
        };
      case "program":
        return {
          label: "Program",
          icon: <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
          bg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60",
        };
      default:
        return {
          label: "Umum",
          icon: <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />,
          bg: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
        };
    }
  };

  return (
    <>
      <Head title="Pusat Notifikasi" />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Pusat Notifikasi
              </h1>
              {stats.unread > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                  {stats.unread} belum dibaca
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Riwayat notifikasi operasional, pencairan dana, verifikasi, dan transaksi sistem Insani-ID.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {stats.unread > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.post('/notifications/mark-all-read', {}, { preserveScroll: true })}
                className="gap-1.5 border-gray-200 dark:border-gray-800"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Tandai Semua Dibaca</span>
              </Button>
            )}

            {stats.read > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsClearReadOpen(true)}
                className="gap-1.5 text-gray-600 border-gray-200 hover:text-red-600 hover:border-red-200 dark:border-gray-800 dark:text-gray-400 dark:hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
                <span>Bersihkan Dibaca</span>
              </Button>
            )}
          </div>
        </div>

        {/* Realtime Preferences & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-gray-200/80 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900/60">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Audio Alert Switch */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSound}
                className="flex items-center gap-1.5 font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
                <span>
                  Suara Alert:{" "}
                  <strong
                    className={
                      soundEnabled
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-400"
                    }
                  >
                    {soundEnabled ? "Aktif" : "Mute"}
                  </strong>
                </span>
              </button>

              <button
                type="button"
                onClick={playTestChime}
                title="Dengarkan contoh suara nada notifikasi"
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition"
              >
                Uji Suara
              </button>
            </div>

            <div className="hidden sm:block h-3.5 w-px bg-gray-200 dark:bg-gray-700"></div>

            {/* Desktop Notification Status / Request */}
            <div className="flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Notifikasi Desktop: </span>
              {desktopPermission === "granted" ? (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Aktif
                </span>
              ) : desktopPermission === "denied" ? (
                <span className="text-gray-400">Diblokir di Browser</span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestDesktopPermission}
                  className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
                >
                  Aktifkan Izin Browser
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Auto-refresh setiap 30 detik</span>
          </div>
        </div>

        {/* Filter Section Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800/70 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => updateFilter({ status: "all" })}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filters.status === "all"
                    ? "bg-white text-gray-900 shadow-xs dark:bg-gray-900 dark:text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <span>Semua</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-200 dark:bg-gray-700">
                  {stats.total}
                </span>
              </button>

              <button
                type="button"
                onClick={() => updateFilter({ status: "unread" })}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filters.status === "unread"
                    ? "bg-white text-brand-600 shadow-xs dark:bg-gray-900 dark:text-brand-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <span>Belum Dibaca</span>
                {stats.unread > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-brand-500 text-white font-bold">
                    {stats.unread}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => updateFilter({ status: "read" })}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filters.status === "read"
                    ? "bg-white text-gray-900 shadow-xs dark:bg-gray-900 dark:text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <span>Sudah Dibaca</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-200 dark:bg-gray-700">
                  {stats.read}
                </span>
              </button>
            </div>

            {/* Filter Category & Search Form */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <select
                  value={filters.category || ""}
                  onChange={(e) => updateFilter({ category: e.target.value })}
                  className="h-10 pl-8 pr-8 text-xs font-medium bg-transparent border border-gray-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                >
                  <option value="">Semua Kategori</option>
                  <option value="disbursement">Pencairan Dana</option>
                  <option value="campaigner">Verifikasi Campaigner</option>
                  <option value="contact">Pesan Kontak</option>
                  <option value="donation">Donasi Masuk</option>
                  <option value="program">Pengajuan Program</option>
                </select>
              </div>

              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Cari judul atau pesan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-8 text-xs h-10 rounded-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900"
                />
                {search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Bulk Action Bar (Visible when >= 1 item selected) */}
          {selectedIds.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  {selectedIds.length} notifikasi dipilih
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline"
                >
                  Batal pilih
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("mark_read")}
                  className="h-8 gap-1 text-xs border-gray-200 dark:border-gray-800"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tandai Dibaca</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("mark_unread")}
                  className="h-8 gap-1 text-xs border-gray-200 dark:border-gray-800"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tandai Belum Dibaca</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsBulkDeleteOpen(true)}
                  className="h-8 gap-1 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-950/60 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications List Card */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          {notifications.data.length > 0 ? (
            <div>
              {/* Table / List Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 text-xs font-semibold text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    aria-label="Pilih semua di halaman ini"
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
                  />
                  <span>Pilih Semua di Halaman Ini</span>
                </div>
                <span>Waktu & Aksi</span>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {notifications.data.map((item) => {
                  const meta = getCategoryMeta(item.data.category);
                  const isUnread = !item.read_at;
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`group flex items-start gap-4 p-4 transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.02] ${
                        isUnread
                          ? "bg-brand-500/[0.02] dark:bg-brand-500/[0.04]"
                          : ""
                      } ${isSelected ? "bg-brand-50/60 dark:bg-brand-950/30" : ""}`}
                    >
                      {/* Checkbox */}
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(item.id)}
                          aria-label={`Pilih notifikasi ${item.data.title}`}
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
                        />
                      </div>

                      {/* Icon */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}
                      >
                        {meta.icon}
                      </div>

                      {/* Content Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Link
                            href={`/notifications/${item.id}/go`}
                            className={`text-sm hover:underline ${
                              isUnread
                                ? "font-bold text-gray-900 dark:text-white"
                                : "font-medium text-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {item.data.title}
                          </Link>

                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${meta.bg}`}
                          >
                            {meta.label}
                          </span>

                          {isUnread && (
                            <span className="h-2 w-2 rounded-full bg-brand-500"></span>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                          {item.data.message}
                        </p>

                        <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                          <span>{item.created_at}</span>
                          {item.read_at && (
                            <>
                              <span>&bull;</span>
                              <span>Telah dibaca</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/notifications/${item.id}/go`}
                          title="Buka detail"
                          className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:text-brand-400 dark:hover:bg-gray-800"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleToggleRead(item)}
                          title={isUnread ? "Tandai dibaca" : "Tandai belum dibaca"}
                          className={`p-1.5 rounded-lg transition ${
                            isUnread
                              ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                              : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          {isUnread ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <RotateCcw className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setItemToDelete(item.id)}
                          title="Hapus notifikasi"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-red-950/50 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {notifications.links && notifications.links.length > 3 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Menampilkan{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {notifications.from || 0}
                    </span>{" "}
                    sampai{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {notifications.to || 0}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {notifications.total || 0}
                    </span>{" "}
                    notifikasi
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {notifications.links.map((link, i) => (
                      <Button
                        key={i}
                        variant={link.active ? "default" : "outline"}
                        size="sm"
                        disabled={!link.url}
                        onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                        dangerouslySetInnerHTML={{
                          __html: formatPaginationLabel(link.label),
                        }}
                        className={`text-xs h-8 ${
                          link.active
                            ? "bg-brand-600 text-white dark:bg-brand-500"
                            : "border-gray-200 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 mb-4">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                Tidak ada notifikasi
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                {filters.status !== "all" || filters.category || filters.search
                  ? "Tidak ada notifikasi yang cocok dengan kriteria filter atau pencarian Anda."
                  : "Anda belum memiliki riwayat notifikasi. Semua aktivitas sistem penting akan dicatat di sini."}
              </p>
              {(filters.status !== "all" || filters.category || filters.search) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.get('/notifications')}
                  className="mt-4 gap-1.5 border-gray-200 dark:border-gray-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation: Clear All Read */}
      <ConfirmDialog
        open={isClearReadOpen}
        onOpenChange={setIsClearReadOpen}
        title="Bersihkan Notifikasi yang Sudah Dibaca?"
        description="Seluruh notifikasi yang sudah Anda baca akan dihapus secara permanen dari riwayat akun Anda. Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Bersihkan"
        cancelText="Batal"
        variant="warning"
        loading={actionLoading}
        onConfirm={handleClearAllRead}
      />

      {/* Confirmation: Bulk Delete */}
      <ConfirmDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        title="Hapus Notifikasi Terpilih?"
        description={`Anda akan menghapus ${selectedIds.length} notifikasi yang dipilih secara permanen.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        loading={actionLoading}
        onConfirm={() => handleBulkAction("delete")}
      />

      {/* Confirmation: Single Delete */}
      <ConfirmDialog
        open={Boolean(itemToDelete)}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Hapus Notifikasi?"
        description="Notifikasi ini akan dihapus dari riwayat akun Anda."
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleDeleteSingle}
      />
    </>
  );
}
