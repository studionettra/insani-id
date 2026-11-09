import { useSidebar } from "./context/SidebarContext";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) {
return null;
}

  return (
    <div
      className="fixed inset-0 z-40 bg-gray-950/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
      onClick={toggleMobileSidebar}
      aria-hidden="true"
    />
  );
};

export default Backdrop;
