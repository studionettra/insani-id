import { Link, usePage, router } from "@inertiajs/react";
import { 
  Shield, 
  Briefcase, 
  Sparkles, 
  UserCheck, 
  Globe, 
  ExternalLink, 
  LayoutGrid, 
  KeyRound, 
  LogOut, 
  ChevronDown, 
  Check 
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import useTranslation from "@/hooks/use-translation";

type SupportedLocale = {
  name: string;
  url: string;
};

const FLAGS: Record<string, string> = {
  id: "https://flagcdn.com/w40/id.png",
  en: "https://flagcdn.com/w40/gb.png",
  ar: "https://flagcdn.com/w40/sa.png",
};

export default function UserDropdown() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { auth, locale, supportedLocales } = usePage().props as any;
  const user = auth?.user;

  const currentLang = locale || "id";

  const availableLocales: Record<string, SupportedLocale> =
    supportedLocales && Object.keys(supportedLocales).length > 0
      ? supportedLocales
      : {
          id: { name: "Bahasa Indonesia", url: "/id" },
          en: { name: "English", url: "/en" },
          ar: { name: "العربية", url: "/ar" },
        };

  // Close on click outside or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const changeLanguage = (targetUrl: string) => {
    setIsOpen(false);
    if (targetUrl) {
      router.visit(targetUrl, {
        preserveScroll: true,
      });
    }
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("logged_out", "true");
    }
    router.post("/logout", {}, {
      onFinish: () => {
        router.clearHistory();
        window.location.replace("/login");
      },
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Role detection
  const roles: string[] = user?.roles || [];
  const isSuperadmin = roles.includes("Administrator");
  const isCampaigner = roles.some((r: string) => r.includes("Campaigner"));
  const isFundraiser = roles.includes("Fundraiser");
  const isStaff =
    isSuperadmin ||
    roles.some((r: string) =>
      [
        "Program Officer",
        "Verifikator",
        "Keuangan",
        "Customer Service",
        "Content Editor",
      ].includes(r)
    );

  const renderRoleBadge = () => {
    if (isSuperadmin) {
      return (
        <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 rounded-md border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60">
          <Shield className="w-2.5 h-2.5" /> Superadmin
        </span>
      );
    }
    if (isStaff) {
      return (
        <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 rounded-md border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60">
          <Shield className="w-2.5 h-2.5" /> {roles[0] || "Staff"}
        </span>
      );
    }
    if (isCampaigner) {
      return (
        <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
          <Briefcase className="w-2.5 h-2.5" /> Campaigner
        </span>
      );
    }
    if (isFundraiser) {
      return (
        <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 text-[10px] font-semibold text-teal-700 bg-teal-50 rounded-md border border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60">
          <Sparkles className="w-2.5 h-2.5" /> Fundraiser
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 bg-zinc-100 rounded-md border border-zinc-200/60 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
        <UserCheck className="w-2.5 h-2.5" /> Donatur
      </span>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 py-1 px-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="overflow-hidden rounded-full h-9 w-9 bg-brand-50 text-brand-700 border border-brand-200/60 dark:bg-brand-950/50 dark:text-brand-300 dark:border-brand-800/60 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(user?.name)
          )}
        </span>

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate max-w-[130px] leading-tight">
            {user?.name || "User"}
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
            {isSuperadmin ? "Superadmin" : roles[0] || "Akun"}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-brand-600 dark:text-brand-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Card Body */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-2.5 shadow-xl dark:border-gray-800 dark:bg-gray-900 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header Profil Card */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50/90 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/60 mb-2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || "User"}
                className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 flex items-center justify-center text-xs font-bold shrink-0 border border-brand-200 dark:border-brand-800">
                {getInitials(user?.name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {user?.name || "Pengguna"}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                {user?.email || ""}
              </div>
              {renderRoleBadge()}
            </div>
          </div>

          {/* Quick Actions / Navigation Links */}
          <div className="space-y-0.5">
            {/* Shortcut: Lihat Website Publik */}
            <Link
              href="/"
              target="_blank"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-brand-50/60 dark:hover:bg-brand-950/40 transition-colors group"
            >
              <Globe className="w-4 h-4 text-zinc-400 group-hover:text-brand-600 dark:text-zinc-500 dark:group-hover:text-brand-400 shrink-0" />
              <span className="flex-1">Lihat Website Publik</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            {/* Shortcut: Dashboard Utama */}
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-brand-50/60 dark:hover:bg-brand-950/40 transition-colors group"
            >
              <LayoutGrid className="w-4 h-4 text-zinc-400 group-hover:text-brand-600 dark:text-zinc-500 dark:group-hover:text-brand-400 shrink-0" />
              <span>Dashboard Utama</span>
            </Link>
          </div>

          <div className="my-1.5 border-t border-zinc-100 dark:border-zinc-800" />

          {/* Account Settings Links */}
          <div className="space-y-0.5">
            <Link
              href="/settings/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-brand-50/60 dark:hover:bg-brand-950/40 transition-colors group"
            >
              <UserCheck className="w-4 h-4 text-zinc-400 group-hover:text-brand-600 dark:text-zinc-500 dark:group-hover:text-brand-400 shrink-0" />
              <span>Pengaturan Profil</span>
            </Link>

            <Link
              href="/settings/security"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-brand-50/60 dark:hover:bg-brand-950/40 transition-colors group"
            >
              <KeyRound className="w-4 h-4 text-zinc-400 group-hover:text-brand-600 dark:text-zinc-500 dark:group-hover:text-brand-400 shrink-0" />
              <span>Keamanan & Sandi</span>
            </Link>
          </div>

          <div className="my-1.5 border-t border-zinc-100 dark:border-zinc-800" />

          {/* Language Switcher */}
          <div className="px-1 py-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
              {t('Pilihan Bahasa')}
            </span>
            <div className="space-y-0.5">
              {Object.entries(availableLocales).map(([code, item]) => {
                const isActive = currentLang === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => changeLanguage(item.url)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                      isActive
                        ? "font-semibold text-brand-700 dark:text-brand-400 bg-brand-50/70 dark:bg-brand-950/50"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={FLAGS[code] || FLAGS.id}
                        alt={code}
                        className="w-4 h-4 rounded-xs object-cover border border-zinc-200 dark:border-zinc-700"
                      />
                      <span>{item.name}</span>
                    </div>
                    {isActive && (
                      <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="my-1.5 border-t border-zinc-100 dark:border-zinc-800" />

          {/* Logout Action */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
            <span>{t('Keluar')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
