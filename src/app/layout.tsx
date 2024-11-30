"use client";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { usePathname, useRouter } from "next/navigation";
import { Providers } from "./Provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Get the current path

  // Define an array of routes that do not require AuthProvider
  const noAuthPages = ["/authentication/login", "/signup"]; // Add other routes here if needed
  const isNoAuthPage = noAuthPages.includes(pathname);
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={baselightTheme}>
          <CssBaseline />
          <Providers>
            {children}
            {/* Restrict all other pages */}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
