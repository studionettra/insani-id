import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const permissions = auth?.user?.permissions || [];

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard.url(),
            icon: LayoutGrid,
            // Everyone who can access admin panel can see dashboard
        },
        ...(permissions.includes('user.view') ? [{
            title: 'Pengguna',
            href: '/admin/users',
            icon: Users,
        }] : []),
        ...(permissions.includes('program.create') ? [{
            title: 'Program Saya',
            href: '/akun/programs',
            icon: LayoutGrid,
        }] : []),
        ...(permissions.includes('category.view') ? [{
            title: 'Kategori',
            href: '/admin/categories',
            icon: LayoutGrid,
        }] : []),
        ...(permissions.includes('campaigner.view') ? [{
            title: 'Verifikasi Campaigner',
            href: '/admin/campaigners',
            icon: Users,
        }] : []),
        ...(permissions.includes('program.view') ? [{
            title: 'Program Donasi',
            href: '/admin/programs',
            icon: LayoutGrid, // You can use a different icon like 'Heart' if imported
        }] : []),
        ...(permissions.includes('program.view') ? [{
            title: 'Manajemen Donasi',
            href: '/admin/donations',
            icon: BookOpen, // Or Banknote if imported
        }] : []),
        ...(permissions.includes('disbursement.view') ? [{
            title: 'Penyaluran Dana',
            href: '/admin/disbursements',
            icon: FolderGit2,
        }] : []),
        ...(permissions.includes('comment.moderate') ? [{
            title: 'Komentar & Doa',
            href: '/admin/comments',
            icon: BookOpen,
        }] : []),
        ...(permissions.includes('report.view') ? [{
            title: 'Laporan',
            href: '/admin/reports',
            icon: LayoutGrid, // Or use BarChart/FileText if imported, I will use LayoutGrid for now
        }] : []),
        ...(permissions.includes('manage_pages') ? [{
            title: 'Halaman Statis',
            href: '/admin/pages',
            icon: BookOpen,
        }] : []),
        ...(permissions.includes('manage_faqs') ? [{
            title: 'FAQ',
            href: '/admin/faqs',
            icon: BookOpen,
        }] : []),
        ...(permissions.includes('manage_management') ? [{
            title: 'Tim Manajemen',
            href: '/admin/management-members',
            icon: Users,
        }] : []),
        ...(permissions.includes('manage_partners') ? [{
            title: 'Mitra Kerja Sama',
            href: '/admin/partners',
            icon: LayoutGrid,
        }] : []),
        ...(permissions.includes('manage_impact_stats') ? [{
            title: 'Statistik Dampak',
            href: '/admin/impact-stats',
            icon: BookOpen,
        }] : []),
        ...(permissions.includes('manage_banners') ? [{
            title: 'Banner Beranda',
            href: '/admin/homepage-banners',
            icon: BookOpen,
        }] : []),
        ...(permissions.includes('manage_contact_messages') ? [{
            title: 'Pesan Masuk',
            href: '/admin/contact-messages',
            icon: FolderGit2,
        }] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
