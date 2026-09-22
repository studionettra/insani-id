import { Form, Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Pengaturan Profil" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Informasi Profil
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Perbarui nama lengkap dan alamat email yang terhubung ke akun Anda.
                    </p>
                </div>

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Nama Lengkap
                                </Label>

                                <Input
                                    id="name"
                                    className="block w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Masukkan nama lengkap Anda"
                                />

                                <InputError
                                    className="mt-1 text-xs"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Alamat Email
                                </Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="block w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="nama@email.com"
                                />

                                <InputError
                                    className="mt-1 text-xs"
                                    message={errors.email}
                                />
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div className="rounded-xl p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60">
                                        <p className="text-xs text-amber-800 dark:text-amber-300">
                                            Alamat email Anda saat ini belum terverifikasi.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="font-semibold underline underline-offset-2 hover:text-amber-950 dark:hover:text-amber-200"
                                            >
                                                Klik di sini untuk mengirim ulang tautan verifikasi email.
                                            </Link>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <div className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                Tautan verifikasi baru telah berhasil dikirimkan ke alamat email Anda.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4 pt-2">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                    className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-5 h-10 font-semibold text-xs shadow-xs"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <DeleteUser />
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan Profil',
            href: edit.url(),
        },
    ],
};
