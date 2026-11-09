import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

interface SidebarContextProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar_expanded');
      if (saved !== null) {
        return saved === 'true';
      }
      return true;
    }
    return true;
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Kunci scroll halaman belakang saat sidebar mobile terbuka
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (isMobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileOpen]);

  // Tutup sidebar mobile otomatis saat berpindah halaman via Inertia
  useEffect(() => {
    const unregister = router.on('navigate', () => {
      setIsMobileOpen(false);
    });

    return () => {
      unregister();
    };
  }, []);

  // Tutup sidebar mobile saat ukuran layar berubah ke desktop (>= 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar_expanded', String(next));
      }
      return next;
    });
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        isExpanded,
        setIsExpanded,
        isHovered,
        setIsHovered,
        isMobileOpen,
        setIsMobileOpen,
        toggleSidebar,
        toggleMobileSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);

  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }

  return context;
};
