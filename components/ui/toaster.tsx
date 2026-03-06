"use client";

import { useEffect, useState } from "react";
import { APP_TOAST_EVENT } from "@/lib/toast";

interface ToastItem {
  id: number;
  message: string;
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    function onToast(event: Event) {
      const custom = event as CustomEvent<{ message?: string }>;
      const message = custom.detail?.message?.trim();
      if (!message) return;
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, message }]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }, 1800);
    }

    window.addEventListener(APP_TOAST_EVENT, onToast);
    return () => window.removeEventListener(APP_TOAST_EVENT, onToast);
  }, []);

  if (!items.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg"
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}
