export const APP_TOAST_EVENT = "app-toast-event";

export function showToast(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(APP_TOAST_EVENT, { detail: { message } }));
}
