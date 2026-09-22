import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-base font-bold text-rose-600 dark:text-rose-400">
                    Hapus Akun
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Hapus akun Anda beserta seluruh data profil yang tersimpan secara permanen.
                </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-rose-200/70 bg-rose-50/60 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
                <div className="text-xs text-rose-700 dark:text-rose-300">
                    <p className="font-bold mb-0.5">Perhatian Khusus</p>
                    <p className="text-rose-600/90 dark:text-rose-300/80">
                        Tindakan ini tidak dapat dibatalkan. Pastikan Anda tidak memiliki transaksi atau program donasi aktif sebelum menghapus akun.
                    </p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                            className="rounded-xl text-xs font-semibold h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                        >
                            Hapus Akun Saya
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl dark:bg-gray-900 dark:border-gray-800">
                        <DialogTitle className="text-base font-bold text-gray-900 dark:text-white">
                            Apakah Anda yakin ingin menghapus akun?
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
                            Setelah akun Anda dihapus, semua data profil dan sumber daya yang terhubung akan dihapus secara permanen. Silakan masukkan kata sandi akun Anda untuk mengonfirmasi.
                        </DialogDescription>

                        <Form
                            {...ProfileController.destroy.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="space-y-4 mt-2"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="password"
                                            className="text-xs font-semibold text-gray-700 dark:text-gray-300"
                                        >
                                            Konfirmasi Kata Sandi
                                        </Label>

                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder="Masukkan kata sandi akun Anda"
                                            autoComplete="current-password"
                                            className="rounded-xl border-gray-200 dark:border-gray-700"
                                        />

                                        <InputError message={errors.password} className="text-xs" />
                                    </div>

                                    <DialogFooter className="gap-2 pt-2">
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="rounded-xl text-xs font-semibold h-9"
                                                onClick={() =>
                                                    resetAndClearErrors()
                                                }
                                            >
                                                Batal
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            variant="destructive"
                                            disabled={processing}
                                            className="rounded-xl text-xs font-semibold h-9 bg-rose-600 hover:bg-rose-700 text-white"
                                            asChild
                                        >
                                            <button
                                                type="submit"
                                                data-test="confirm-delete-user-button"
                                            >
                                                {processing ? 'Menghapus...' : 'Ya, Hapus Akun'}
                                            </button>
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
