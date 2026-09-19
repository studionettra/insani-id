import * as React from "react";
import { AlertTriangle, AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ConfirmDialogVariant = "danger" | "warning" | "info" | "success";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText = "Batal",
  variant = "danger",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (variant) {
      case "danger":
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 ring-8 ring-red-50 dark:bg-red-950/60 dark:ring-red-950/30">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        );
      case "warning":
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 ring-8 ring-amber-50 dark:bg-amber-950/60 dark:ring-amber-950/30">
            <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
        );
      case "success":
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50 dark:bg-emerald-950/60 dark:ring-emerald-950/30">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        );
      case "info":
      default:
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 ring-8 ring-blue-50 dark:bg-blue-950/60 dark:ring-blue-950/30">
            <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700 focus-visible:ring-red-600";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-700 focus-visible:ring-amber-600";
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 focus-visible:ring-emerald-600";
      case "info":
      default:
        return "bg-[#1A56DB] hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 focus-visible:ring-blue-600";
    }
  };

  const defaultConfirmText = variant === "danger" ? "Hapus" : "Konfirmasi";

  return (
    <Dialog open={open} onOpenChange={loading ? () => {} : onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl">
        <DialogHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-left">
          {getIcon()}
          <div className="flex-1 space-y-1">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl px-4 py-2 font-medium"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`${getConfirmButtonClasses()} rounded-xl px-4 py-2 font-medium shadow-sm transition-all duration-150 flex items-center justify-center min-w-[90px]`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              confirmText || defaultConfirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
