import { Link, usePage } from "@inertiajs/react";
import { 
  Users, 
  BookOpen, 
  FolderGit2, 
  LayoutGrid, 
  Briefcase, 
  Gift, 
  GiftIcon, 
  CheckCheckIcon, 
  Check, 
  BadgeCheck, 
  Paperclip, 
  MessageCircleCode, 
  BadgeCent, 
  BadgeHelp, 
  CaseLower, 
  WalletCards, 
  ListChecksIcon,
  Image as ImageIcon,
  TrendingUp,
  Handshake,
  Mail,
  Settings,
  Newspaper,
  Activity
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from "react";

import { GridIcon, ChevronDownIcon, HorizontaLDots } from "@/icons";
import { useSidebar } from "./context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen } = useSidebar();
  const { url, props } = usePage();
  const { auth } = props as any;
  const permissions = auth?.user?.permissions || [];
  const roles = auth?.user?.roles || [];
  const isSuperadmin = roles.includes('Administrator');

  const mainNavItems: NavItem[] = [
    {
        icon: <GridIcon />,
        name: "Dashboard",
        path: "/dashboard",
    },
    ...(!isSuperadmin && !permissions.includes('donation.view') ? [{
        icon: <BookOpen className="w-5 h-5" />,
        name: "Donasi Saya",
        path: "/akun/donasi-saya",
    }] : []),
    ...(!isSuperadmin && !permissions.includes('program.view') ? [{
        icon: <GiftIcon className="w-5 h-5" />,
        name: "Jelajah Program",
        path: "/program",
    }] : []),
    ...(permissions.includes('program.create') && !isSuperadmin ? [{
        icon: <Briefcase className="w-5 h-5" />,
        name: "Program Saya",
        path: "/akun/programs",
    }] : []),
    ...(permissions.includes('program.view') || isSuperadmin ? [{
        icon: <GiftIcon className="w-5 h-5" />,
        name: "Program Donasi",
        path: "/admin/programs",
    }] : []),
    ...(permissions.includes('donation.view') || isSuperadmin ? [{
        icon: <BookOpen className="w-5 h-5" />,
        name: "Manajemen Donasi",
        path: "/admin/donations",
    }] : []),
    ...(permissions.includes('campaigner.view') || isSuperadmin ? [{
        icon: <BadgeCheck className="w-5 h-5" />,
        name: "Verifikasi Campaigner",
        path: "/admin/campaigners",
    }] : []),
    ...(permissions.includes('disbursement.view') || isSuperadmin ? [{
        icon: <WalletCards className="w-5 h-5" />,
        name: "Penyaluran Dana",
        path: "/admin/disbursements",
    }] : []),
    ...(permissions.includes('report.view') || isSuperadmin ? [{
        icon: <Paperclip className="w-5 h-5" />,
        name: "Laporan",
        path: "/admin/reports",
    }, {
        icon: <Activity className="w-5 h-5" />,
        name: "Analitik Web",
        path: "/admin/analytics",
    }] : []),
    ...(permissions.includes('user.view') || isSuperadmin ? [{
        icon: <Users className="w-5 h-5" />,
        name: "Pengguna",
        path: "/admin/users",
    }] : []),
  ];

  const othersItems: NavItem[] = [
    ...(permissions.includes('manage_banners') || isSuperadmin ? [{
        icon: <ImageIcon className="w-5 h-5" />,
        name: "Banner Beranda",
        path: "/admin/homepage-banners",
    }] : []),
    ...(permissions.includes('manage_impact_stats') || isSuperadmin ? [{
        icon: <TrendingUp className="w-5 h-5" />,
        name: "Statistik Dampak",
        path: "/admin/impact-stats",
    }] : []),
    ...(permissions.includes('category.view') || isSuperadmin ? [{
        icon: <ListChecksIcon className="w-5 h-5" />,
        name: "Kategori",
        path: "/admin/categories",
    }] : []),
    ...(permissions.includes('manage_partners') || isSuperadmin ? [{
        icon: <Handshake className="w-5 h-5" />,
        name: "Mitra Kerja Sama",
        path: "/admin/partners",
    }] : []),
    ...(permissions.includes('manage_management') || isSuperadmin ? [{
        icon: <Users className="w-5 h-5" />,
        name: "Dewan Pengurus",
        path: "/admin/management-members",
    }] : []),
    ...(permissions.includes('manage_pages') || isSuperadmin ? [{
        icon: <BookOpen className="w-5 h-5" />,
        name: "Halaman Statis",
        path: "/admin/pages",
    }] : []),
    ...(permissions.includes('manage_faqs') || isSuperadmin ? [{
        icon: <BadgeHelp className="w-5 h-5" />,
        name: "Tanya Jawab (FAQ)",
        path: "/admin/faqs",
    }] : []),
    ...(permissions.includes('manage_contact_messages') || isSuperadmin ? [{
        icon: <Mail className="w-5 h-5" />,
        name: "Pesan Kontak",
        path: "/admin/contact-messages",
    }] : []),
    ...(permissions.includes('manage_blog') || isSuperadmin ? [{
        icon: <Newspaper className="w-5 h-5" />,
        name: "Manajemen Berita",
        path: "/admin/blogs",
    }] : []),
    ...(permissions.includes('comment.moderate') || isSuperadmin ? [{
        icon: <MessageCircleCode className="w-5 h-5" />,
        name: "Komentar & Doa",
        path: "/admin/comments",
    }] : []),
    ...(permissions.includes('settings.view') || permissions.includes('settings.update') || isSuperadmin ? [{
        icon: <Settings className="w-5 h-5" />,
        name: "Pengaturan Website",
        path: "/admin/site-settings",
    }] : []),
  ];

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => url === path || url.startsWith(path + '/'),
    [url]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? mainNavItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [url, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;

      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }

      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              title={!isExpanded ? nav.name : undefined}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
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
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
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
                }`}
              >
                <span
                  className={`menu-item-icon-size flex items-center justify-center ${
                    isActive(nav.path)
                      ? "menu-item-icon-active text-brand-500"
                      : "menu-item-icon-inactive text-gray-500 group-hover:text-gray-700"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
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
      ))}
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
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(mainNavItems, "main")}
            </div>
            
            {othersItems.length > 0 && (
                <div className="">
                  <h2
                    className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                      !isExpanded
                        ? "lg:justify-center"
                        : "justify-start"
                    }`}
                  >
                    {isExpanded || isMobileOpen ? (
                      "Konten & Pengaturan"
                    ) : (
                      <HorizontaLDots />
                    )}
                  </h2>
                  {renderMenuItems(othersItems, "others")}
                </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
