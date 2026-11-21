"use client";

import { Toaster as SonnerToaster } from "sonner";

export default function ToastProvider() {
  return (
    <SonnerToaster
      position="top-right"
      expand={true}
      richColors={true}
      closeButton={true}
      duration={3500}
      toastOptions={{
        className: "pizzahub-toast font-sans",
        style: {
          background: "#141418",
          color: "#f4f4f5",
          border: "1px solid rgba(245, 158, 11, 0.25)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
          borderRadius: "16px",
          padding: "14px 16px",
        },
      }}
    />
  );
}
