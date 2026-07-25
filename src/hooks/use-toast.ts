"use client";

import { useState, useCallback, useEffect } from "react";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "info" | "pending";
}

let toastListeners: Array<(toasts: ToastItem[]) => void> = [];
let toastsState: ToastItem[] = [];

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener([...toastsState]));
};

export const toast = {
  success: (title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    toastsState.push({ id, title, description, type: "success" });
    notifyListeners();
    setTimeout(() => toast.dismiss(id), 5000);
  },
  error: (title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    toastsState.push({ id, title, description, type: "error" });
    notifyListeners();
    setTimeout(() => toast.dismiss(id), 6000);
  },
  info: (title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    toastsState.push({ id, title, description, type: "info" });
    notifyListeners();
    setTimeout(() => toast.dismiss(id), 4000);
  },
  pending: (title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    toastsState.push({ id, title, description, type: "pending" });
    notifyListeners();
    return id;
  },
  dismiss: (id: string) => {
    toastsState = toastsState.filter((t) => t.id !== id);
    notifyListeners();
  },
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>(toastsState);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  }, []);

  return { toasts, toast };
}
