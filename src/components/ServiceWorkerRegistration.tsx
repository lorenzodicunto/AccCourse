"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // SW registered silently in production
        })
        .catch((err) => {
          // SW registration failed - suppress in production
        });
    }
  }, []);

  return null;
}
