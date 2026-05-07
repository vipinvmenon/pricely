import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const fontDisplay = Inter_Tight({
  variable: "--font-display",
  subsets: ["latin"],
  preload: true,
  display: "swap",
});

const fontText = Inter({
  variable: "--font-text",
  subsets: ["latin"],
  preload: true,
  display: "swap",
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  preload: true,
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pricely.app"),
  title: {
    default: "Pricely",
    template: "%s · Pricely",
  },
  description: "Search-first price comparison across platforms with buy-or-wait signals.",
  applicationName: "Pricely",
};

const THEME_INIT_SCRIPT = `
(() => {
  try {
    const theme = window.localStorage.getItem("pricely.theme");
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  } catch {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontText.variable} ${fontMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
