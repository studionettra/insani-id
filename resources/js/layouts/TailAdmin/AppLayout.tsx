import { useEffect } from "react";
import { FlashMessages } from "@/components/flash-messages";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";
import { SidebarProvider, useSidebar } from "./context/SidebarContext";

const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { isExpanded, isMobileOpen } = useSidebar();

  useEffect(() => {
    const appearance = localStorage.getItem("appearance") || "system";
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = appearance === "dark" || (appearance === "system" && prefersDark);
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, []);

  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors print:min-h-0 print:bg-white print:block">
      <div className="print:hidden">
        <FlashMessages />
      </div>
      <div className="print:hidden">
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out print:ml-0 print:p-0 ${
          isExpanded ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <div className="print:hidden">
          <AppHeader />
        </div>
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 print:p-0 print:m-0 print:max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
};

export default AppLayout;
