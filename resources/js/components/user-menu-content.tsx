import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Settings, LayoutGrid, CheckCircle, Clock } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const { auth } = usePage<any>().props;
    const campaignerStatus = (auth?.user as any)?.campaigner_status ?? (user as any)?.campaigner_status;

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        cleanup();

        const userRoles = auth?.user?.roles || (user as any)?.roles || [];
        const isStaff = userRoles.some((r: any) => [
            'Administrator',
            'Program Officer',
            'Verifikator',
            'Keuangan',
            'Content Editor',
            'Customer Service',
            'Eksekutif',
            'Relawan Lapangan',
            'admin',
            'superadmin',
        ].includes(r?.name || r)) || Boolean(auth?.user?.is_admin || (user as any)?.is_admin);

        const redirectUrl = isStaff ? '/login' : '/';

        if (typeof window !== 'undefined') {
            sessionStorage.setItem('logged_out_redirect', redirectUrl);
        }
        router.post(logout(), {}, {
            onFinish: () => {
                router.clearHistory();
                window.location.replace(redirectUrl);
            },
        });
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                {campaignerStatus === 'verified' ? (
                    <DropdownMenuItem asChild>
                        <Link
                            className="block w-full cursor-pointer"
                            href="/akun/programs"
                            prefetch
                            onClick={cleanup}
                        >
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            Program Saya
                        </Link>
                    </DropdownMenuItem>
                ) : campaignerStatus ? (
                    <DropdownMenuItem asChild>
                        <Link
                            className="block w-full cursor-pointer"
                            href="/campaigner/status"
                            prefetch
                            onClick={cleanup}
                        >
                            <Clock className="mr-2 h-4 w-4" />
                            Status Campaigner
                        </Link>
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem asChild>
                        <Link
                            className="block w-full cursor-pointer"
                            href="/campaigner/register"
                            prefetch
                            onClick={cleanup}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Daftar Jadi Campaigner
                        </Link>
                    </DropdownMenuItem>
                )}
                

                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <button
                    type="button"
                    className="flex w-full items-center cursor-pointer px-2 py-1.5 text-sm text-red-600 hover:text-red-700 outline-none"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </button>
            </DropdownMenuItem>
        </>
    );
}
