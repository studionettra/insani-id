import { Link } from '@inertiajs/react';
import { User, ShieldCheck } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

const sidebarNavItems = [
    {
        title: 'Profil Pengguna',
        href: edit.url(),
        icon: User,
    },
    {
        title: 'Keamanan Akun',
        href: editSecurity.url(),
        icon: ShieldCheck,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="px-4 py-6 max-w-5xl mx-auto w-full">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Pengaturan Akun
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Kelola profil pribadi, informasi kontak, dan keamanan kata sandi akun Anda.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row lg:space-x-8">
                {/* Navigation Aside */}
                <aside className="w-full max-w-xl lg:w-60 mb-6 lg:mb-0 shrink-0">
                    <nav
                        className="flex flex-row lg:flex-col gap-1.5 p-1.5 bg-gray-100/80 dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/60"
                        aria-label="Pengaturan"
                    >
                        {sidebarNavItems.map((item, index) => {
                            const active = isCurrentOrParentUrl(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={`${toUrl(item.href)}-${index}`}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex-1 lg:flex-none justify-center lg:justify-start',
                                        active
                                            ? 'bg-white text-brand-700 shadow-xs border border-gray-200/60 dark:bg-gray-900 dark:text-brand-400 dark:border-gray-700'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/60'
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'w-4 h-4 shrink-0',
                                            active
                                                ? 'text-brand-600 dark:text-brand-400'
                                                : 'text-gray-400 dark:text-gray-500'
                                        )}
                                    />
                                    <span>{item.title}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
