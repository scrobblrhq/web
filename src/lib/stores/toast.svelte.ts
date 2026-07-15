export const MAX_TOASTS = 5;

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  exiting: boolean;
}

let _id = 0;

export const toasts: Toast[] = $state([]);

export function addToast(
  message: string,
  type: ToastType = "info",
  duration = 4000,
) {
  if (toasts.length >= MAX_TOASTS) {
    toasts.shift();
  }

  const toast: Toast = { id: String(++_id), message, type, exiting: false };
  toasts.push(toast);

  if (duration > 0) {
    setTimeout(() => dismissToast(toast.id), duration);
  }

  return toast.id;
}

export function dismissToast(id: string) {
  const toast = toasts.find((t) => t.id === id);
  if (!toast) return;
  toast.exiting = true;
  setTimeout(() => {
    const idx = toasts.indexOf(toast);
    if (idx !== -1) toasts.splice(idx, 1);
  }, 300);
}
