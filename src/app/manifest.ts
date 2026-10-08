import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rupiq — Personal Finance & AI Wealth Manager",
    short_name: "Rupiq",
    description:
      "AI-powered personal finance, expense tracking, multi-account analytics and budget management.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#090a0f",
    theme_color: "#e11d48",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "View your financial overview and metrics",
        url: "/dashboard",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Transactions",
        short_name: "Transactions",
        description: "View and add transactions",
        url: "/transactions",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Budgets",
        short_name: "Budgets",
        description: "Monitor monthly category budgets",
        url: "/budgets",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Accounts",
        short_name: "Accounts",
        description: "Manage bank accounts, wallets, and cards",
        url: "/accounts",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
    categories: ["finance", "productivity", "utilities"],
  };
}
