import { Form, Head, Link } from '@inertiajs/react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';

type Props = {
    passwordRules: string;
};

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Keamanan & Kata Sandi" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Ubah Kata Sandi
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Pastikan akun Anda menggunakan kata sandi yang kuat, unik, dan tidak digunakan di platform lain demi menjaga keamanan akun.
                    </p>
                </div>

                <Form
                    {...SecurityController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) {
                            passwordInput.current?.focus();
                        }

                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="space-y-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="current_password"
                                    className="text-xs font-semibold text-gray-700 dark:text-gray-300"
                                >
                                    Kata Sandi Saat Ini
                                </Label>

                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    className="block w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                                    autoComplete="current-password"
                                    placeholder="Masukkan kata sandi saat ini"
                                />

                                <InputError
                                    className="text-xs mt-1"
                                    message={errors.current_password}
                                />

                                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Lupa kata sandi saat ini? Anda dapat keluar akun dan gunakan tautan{' '}
                                    <Link href="/forgot-password" className="text-brand-600 dark:text-brand-400 font-semibold underline hover:text-brand-700">
                                        Lupa Password
                                    </Link>{' '}
                                    di layar login untuk mengatur ulang kata sandi melalui email terdaftar.
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="text-xs font-semibold text-gray-700 dark:text-gray-300"
                                >
                                    Kata Sandi Baru
                                </Label>

                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    name="password"
                                    className="block w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                                    autoComplete="new-password"
                                    placeholder="Masukkan kata sandi baru (minimal 8 karakter)"
                                    passwordrules={props.passwordRules}
                                />

                                <InputError
                                    className="text-xs mt-1"
                                    message={errors.password}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-xs font-semibold text-gray-700 dark:text-gray-300"
                                >
                                    Konfirmasi Kata Sandi Baru
                                </Label>

                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    className="block w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                                    autoComplete="new-password"
                                    placeholder="Ketik ulang kata sandi baru"
                                    passwordrules={props.passwordRules}
                                />

                                <InputError
                                    className="text-xs mt-1"
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <Button
                                    disabled={processing}
                                    data-test="update-password-button"
                                    className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-5 h-10 font-semibold text-xs shadow-xs"
                                >
                                    {processing ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Keamanan Akun',
            href: edit.url(),
        },
    ],
};
