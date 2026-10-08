"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      enableColorScheme={false}
      // React 19 warns about <script> rendered on the client; the SSR copy
      // already ran, so mark the client one inert.
      scriptProps={
        typeof window === "undefined"
          ? undefined
          : ({ type: "application/json" } as const)
      }
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}