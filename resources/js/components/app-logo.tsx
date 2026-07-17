export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-md bg-transparent">
                <img src="/images/logo-portrait-color.png" alt="Insani Logo" className="w-full h-full object-contain" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-sidebar-foreground">
                    Dashboard Insani
                </span>
            </div>
        </>
    );
}
