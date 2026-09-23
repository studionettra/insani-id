import { Link, usePage } from "@inertiajs/react";
import { 
  Users, 
  BookOpen, 
  Briefcase, 
  Gift, 
  BadgeCheck, 
  MessageCircleCode, 
  WalletCards, 
  Image as ImageIcon,
  Mail, 
  Settings, 
  Newspaper, 
  Activity, 
  Building2,
  HeartHandshake,
  Layers,
  Megaphone,
  CreditCard,
  FileSpreadsheet,
  BadgeHelp,
  MessageSquareQuote,
  Sparkles,
  Bell,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from "react";

import { GridIcon, ChevronDownIcon, HorizontaLDots } from "@/icons";
import { useSidebar } from "./context/SidebarContext";

type SubNavItem = {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubNavItem[];
  badge?: React.ReactNode;
};

type NavGroup = {
  key: string;
  title: string;
  items: NavItem[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, toggleSidebar } = useSidebar();
  const { url, props } = usePage();
  const { auth } = props as any;
  const permissions: string[] = auth?.user?.permissions || [];
  const roles: string[] = auth?.user?.roles || [];
  const isSuperadmin: boolean = roles.includes('Administrator');
  const unreadCount: number = (props as any)?.notifications?.unread_count ?? 0;

  const navGroups: NavGroup[] = [
    {
      key: "overview",
      title: "Ringkasan",
      items: [
        {
          icon: <GridIcon className="w-5 h-5" />,
          name: "Dashboard",
          path: "/dashboard",
        },
        {
          icon: (
            <span className="relative inline-flex items-center justify-center">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && !isExpanded && !isMobileOpen && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-gray-900" />
              )}
            </span>
          ),
          name: "Notifikasi",
          path: "/notifications",
          badge: unreadCount > 0 ? (
            <span className="ml-auto inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-500 text-white shadow-xs min-w-[18px]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null,
        },
        ...((permissions.includes('report.view') || isSuperadmin) ? [{
          icon: <Activity className="w-5 h-5" />,
          name: "Analitik Web",
          path: "/admin/analytics",
        }] : []),
        ...(!isSuperadmin && !permissions.includes('donation.view') ? [{
          icon: <BookOpen className="w-5 h-5" />,
          name: "Donasi Saya",
          path: "/akun/donasi-saya",
        }] : []),
        ...(!isSuperadmin && !permissions.includes('program.view') ? [{
          icon: <Gift className="w-5 h-5" />,
          name: "Jelajah Program",
          path: "/program",
        }] : []),
      ],
    },
    {
      key: "campaigns",
      title: "Program & Galang Dana",
      items: [
        ...((permissions.includes('program.view') || isSuperadmin) ? [{
          icon: <HeartHandshake className="w-5 h-5" />,
          name: "Program Donasi",
          path: "/admin/programs",
        }] : []),
        ...(permissions.includes('program.create') && !isSuperadmin ? [{
          icon: <Briefcase className="w-5 h-5" />,
          name: "Program Saya",
          path: "/akun/programs",
        }] : []),
        {
          icon: <Sparkles className="w-5 h-5" />,
          name: "Fundraiser Saya",
          path: "/akun/fundraiser",
        },
        ...((permissions.includes('category.view') || isSuperadmin) ? [{
          icon: <Layers className="w-5 h-5" />,
          name: "Kategori Program",
          path: "/admin/categories",
        }] : []),
        ...((permissions.includes('campaigner.view') || permissions.includes('campaigner.verify') || isSuperadmin) ? [{
          icon: <BadgeCheck className="w-5 h-5" />,
          name: "Verifikasi Campaigner",
          path: "/admin/campaigners",
        }] : []),
        ...((permissions.includes('fundraiser.view') || isSuperadmin) ? [{
          icon: <Megaphone className="w-5 h-5" />,
          name: "Relawan Fundraiser",
          path: "/admin/fundraisers",
        }] : []),
      ],
    },
    {
      key: "finance",
      title: "Transaksi & Keuangan",
      items: [
        ...((permissions.includes('donation.view') || isSuperadmin) ? [{
          icon: <CreditCard className="w-5 h-5" />,
          name: "Manajemen Donasi",
          path: "/admin/donations",
        }] : []),
        ...((permissions.includes('donation.view') || permissions.includes('manage_settings') || isSuperadmin) ? [{
          icon: <Building2 className="w-5 h-5" />,
          name: "Rekening Bank",
          path: "/admin/bank-accounts",
        }] : []),
        ...((permissions.includes('disbursement.view') || isSuperadmin) ? [{
          icon: <WalletCards className="w-5 h-5" />,
          name: "Penyaluran Dana",
          path: "/admin/disbursements",
        }] : []),
        ...((permissions.includes('report.view') || isSuperadmin) ? [{
          icon: <FileSpreadsheet className="w-5 h-5" />,
          name: "Laporan & Rekap",
          path: "/admin/reports",
        }] : []),
      ],
    },
    {
      key: "communication",
      title: "Layanan & Interaksi",
      items: [
        ...((permissions.includes('manage_contact_messages') || isSuperadmin) ? [{
          icon: <Mail className="w-5 h-5" />,
          name: "Pesan Masuk",
          path: "/admin/contact-messages",
        }] : []),
        ...((permissions.includes('comment.moderate') || isSuperadmin) ? [{
          icon: <MessageCircleCode className="w-5 h-5" />,
          name: "Komentar & Doa",
          path: "/admin/comments",
        }] : []),
      ],
    },
    {
      key: "content",
      title: "Konten & Publikasi",
      items: [
        ...((permissions.includes('manage_blog') || isSuperadmin) ? [{
          icon: <Newspaper className="w-5 h-5" />,
          name: "Berita & Cerita",
          path: "/admin/blogs",
        }] : []),
        ...((permissions.includes('manage_banners') || isSuperadmin) ? [{
          icon: <ImageIcon className="w-5 h-5" />,
          name: "Banner Beranda",
          path: "/admin/homepage-banners",
        }] : []),
        ...((permissions.includes('manage_banners') || isSuperadmin) ? [{
          icon: <MessageSquareQuote className="w-5 h-5" />,
          name: "Testimoni Donatur",
          path: "/admin/testimonials",
        }] : []),
        ...((permissions.includes('manage_popups') || permissions.includes('manage_banners') || isSuperadmin) ? [{
          icon: <Megaphone className="w-5 h-5" />,
          name: "Pesan Pop-up",
          path: "/admin/popup-messages",
        }] : []),
        ...((permissions.includes('manage_pages') || isSuperadmin) ? [{
          icon: <BookOpen className="w-5 h-5" />,
          name: "Halaman Statis",
          path: "/admin/pages",
        }] : []),
        ...((permissions.includes('manage_faqs') || isSuperadmin) ? [{
          icon: <BadgeHelp className="w-5 h-5" />,
          name: "Tanya Jawab",
          path: "/admin/faqs",
        }] : []),
        ...(() => {
          const profileSubItems: SubNavItem[] = [
            ...((permissions.includes('manage_management') || isSuperadmin) ? [{
              name: "Dewan Pengurus",
              path: "/admin/management-members",
            }] : []),
            ...((permissions.includes('manage_legal_documents') || permissions.includes('manage_pages') || isSuperadmin) ? [{
              name: "Dokumen Legalitas",
              path: "/admin/legal-documents",
            }] : []),
            ...((permissions.includes('manage_financial_reports') || permissions.includes('report.view') || isSuperadmin) ? [{
              name: "Laporan Keuangan",
              path: "/admin/financial-reports",
            }] : []),
            ...((permissions.includes('manage_partners') || isSuperadmin) ? [{
              name: "Mitra Kerja Sama",
              path: "/admin/partners",
            }] : []),
            ...((permissions.includes('manage_impact_stats') || isSuperadmin) ? [{
              name: "Statistik Dampak",
              path: "/admin/impact-stats",
            }] : []),
          ];

          if (profileSubItems.length === 0) return [];

          return [{
            icon: <Building2 className="w-5 h-5" />,
            name: "Profil Lembaga",
            subItems: profileSubItems,
          }];
        })(),
      ],
    },
    {
      key: "settings",
      title: "Sistem & Pengaturan",
      items: [
        ...((permissions.includes('user.view') || isSuperadmin) ? [{
          icon: <Users className="w-5 h-5" />,
          name: "Kelola Pengguna",
          path: "/admin/users",
        }] : []),
        ...((permissions.includes('settings.view') || permissions.includes('settings.update') || isSuperadmin) ? [{
          icon: <Settings className="w-5 h-5" />,
          name: "Pengaturan Website",
          path: "/admin/site-settings",
        }] : []),
      ],
    },
  ];

  // Filter out empty groups so headers don't render needlessly
  const visibleGroups = navGroups.filter((g) => g.items.length > 0);

  const [openSubmenuKey, setOpenSubmenuKey] = useState<string | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path?: string) => {
      if (!path) return false;
      return url === path || url.startsWith(path + '/');
    },
    [url]
  );

  useEffect(() => {
    let submenuMatched = false;
    visibleGroups.forEach((group) => {
      group.items.forEach((nav, index) => {
        if (nav.subItems) {
          const key = `${group.key}-${index}`;
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenuKey(key);
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenuKey(null);
    }
  }, [url, isActive]);

  useEffect(() => {
    if (openSubmenuKey !== null && subMenuRefs.current[openSubmenuKey]) {
      setSubMenuHeight((prev) => ({
        ...prev,
        [openSubmenuKey]: subMenuRefs.current[openSubmenuKey]?.scrollHeight || 0,
      }));
    }
  }, [openSubmenuKey]);

  const handleSubmenuToggle = (key: string) => {
    if (!isExpanded && !isMobileOpen) {
      toggleSidebar();
    }
    setOpenSubmenuKey((prev) => (prev === key ? null : key));
  };

  const renderMenuItems = (items: NavItem[], groupKey: string) => (
    <ul className="flex flex-col gap-1.5">
      {items.map((nav, index) => {
        const itemKey = `${groupKey}-${index}`;
        const isSubmenuOpen = openSubmenuKey === itemKey;
        const isParentActive = nav.subItems?.some((subItem) => isActive(subItem.path));

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(itemKey)}
                title={!isExpanded ? nav.name : undefined}
                className={`menu-item group ${
                  isParentActive || isSubmenuOpen
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded ? "lg:justify-center" : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size flex items-center justify-center ${
                    isParentActive || isSubmenuOpen
                      ? "menu-item-icon-active text-brand-500"
                      : "menu-item-icon-inactive text-gray-500 group-hover:text-gray-700 dark:text-gray-400"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      isSubmenuOpen ? "rotate-180 text-brand-500" : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  title={!isExpanded ? nav.name : undefined}
                  className={`menu-item group ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  } ${!isExpanded ? "lg:justify-center" : "lg:justify-start"}`}
                >
                  <span
                    className={`menu-item-icon-size flex items-center justify-center ${
                      isActive(nav.path)
                        ? "menu-item-icon-active text-brand-500"
                        : "menu-item-icon-inactive text-gray-500 group-hover:text-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(isExpanded || isMobileOpen) && nav.badge}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[itemKey] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: isSubmenuOpen
                    ? `${subMenuHeight[itemKey] ?? "auto"}px`
                    : "0px",
                }}
              >
                <ul className="mt-1 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        href={subItem.path}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                            >
                              new
                            </span>
                          )}
                          {subItem.pro && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                            >
                              pro
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
    >
      <div
        className={`py-3 flex items-center ${
          !isExpanded ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="flex items-center">
          {isExpanded || isMobileOpen ? (
            <>
              <img
                className="dark:hidden h-28 w-auto object-contain -my-3"
                src="/images/logo/logo-landscape-color.png"
                alt="Logo"
              />
              <img
                className="hidden dark:block h-28 w-auto object-contain -my-3"
                src="/images/logo/logo-landscape-white.png"
                alt="Logo"
              />
            </>
          ) : (
            <>
              <img
                src="/images/logo/logo-portrait-color.png"
                alt="Logo"
                className="h-11 w-auto object-contain dark:hidden"
              />
              <img
                src="/images/logo/logo-portrait-white.png"
                alt="Logo"
                className="h-11 w-auto object-contain hidden dark:block"
              />
            </>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            {visibleGroups.map((group) => (
              <div key={group.key}>
                <h2
                  className={`mb-2.5 text-[11px] font-semibold uppercase tracking-wider flex leading-[18px] text-gray-400 dark:text-gray-500 ${
                    !isExpanded ? "lg:justify-center" : "justify-start px-3"
                  }`}
                >
                  {isExpanded || isMobileOpen ? (
                    group.title
                  ) : (
                    <HorizontaLDots className="size-4" />
                  )}
                </h2>
                {renderMenuItems(group.items, group.key)}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
