import { Link, usePage } from "@inertiajs/react";
import { Users, BookOpen, FolderGit2, LayoutGrid, Briefcase, Gift, GiftIcon, CheckCheckIcon, Check, BadgeCheck, Paperclip, MessageCircleCode, BadgeCent, BadgeHelp, CaseLower, WalletCards, ListChecksIcon } from 'lucide-react';
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
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
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
    ...(permissions.includes('program.create') && !isSuperadmin ? [{
        icon: <Briefcase className="w-5 h-5" />,
        name: "Program Saya",
        path: "/akun/programs",
    }] : []),
    ...(permissions.includes('program.view') ? [{
        icon: <GiftIcon className="w-5 h-5" />,
        name: "Program Donasi",
        path: "/admin/programs",
    }] : []),
    ...(permissions.includes('program.view') ? [{
        icon: <BookOpen className="w-5 h-5" />,
        name: "Manajemen Donasi",
        path: "/admin/donations",
    }] : []),
    ...(permissions.includes('campaigner.view') ? [{
        icon: <BadgeCheck className="w-5 h-5" />,
        name: "Verifikasi Campaigner",
        path: "/admin/campaigners",
    }] : []),
    ...(permissions.includes('user.view') ? [{
        icon: <Users className="w-5 h-5" />,
        name: "Pengguna",
        path: "/admin/users",
    }] : []),
  ];

  const othersItems: NavItem[] = [
    ...(permissions.includes('category.view') ? [{
        icon: <ListChecksIcon className="w-5 h-5" />,
        name: "Kategori",
        path: "/admin/categories",
    }] : []),
    ...(permissions.includes('disbursement.view') ? [{
        icon: <WalletCards className="w-5 h-5" />,
        name: "Penyaluran Dana",
        path: "/admin/disbursements",
    }] : []),
    ...(permissions.includes('comment.moderate') ? [{
        icon: <MessageCircleCode className="w-5 h-5" />,
        name: "Komentar & Doa",
        path: "/admin/comments",
    }] : []),
    ...(permissions.includes('report.view') ? [{
        icon: <Paperclip className="w-5 h-5" />,
        name: "Laporan",
        path: "/admin/reports",
    }] : []),
    ...(permissions.includes('manage_pages') ? [{
        icon: <BookOpen className="w-5 h-5" />,
        name: "Halaman Statis",
        path: "/admin/pages",
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
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
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
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
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
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
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
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo-landscape-color.png"
                alt="Logo"
                height={40}
                style={{ maxHeight: '40px' }}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-landscape-white.png"
                alt="Logo"
                height={40}
                style={{ maxHeight: '40px' }}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
              onError={(e) => {
                 e.currentTarget.src = '/images/logo/logo-landscape-color.png';
              }}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
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
                      !isExpanded && !isHovered
                        ? "lg:justify-center"
                        : "justify-start"
                    }`}
                  >
                    {isExpanded || isHovered || isMobileOpen ? (
                      "Lainnya"
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
