"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    // Dev asset URLs aren't content-hashed, so the SW's cache-first strategy would
    // pin stale CSS/JS. In development, remove any existing worker and its caches.
    if (process.env.NODE_ENV !== "production") {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then((regs) => Promise.all(regs.map((r) => r.unregister())))
          .then((removed) => {
            if (removed.length && "caches" in window) {
              return caches
                .keys()
                .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
                .then(() => window.location.reload());
            }
          });
      }
      return;
    }

    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.location.protocol.startsWith("http")
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            // Check for updates on page focus
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    console.log("New Rupiq PWA update available.");
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.error("Service worker registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}
