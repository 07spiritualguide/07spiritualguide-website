import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Numerosense",
  description: "Numerosense",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Inline script to apply theme before React hydrates (prevents flash)
  const themeScript = `
    (function() {
      try {
        var destiny = localStorage.getItem('destiny_number');
        if (destiny) {
          var themes = {
            1: { bg: '#FEF5C3', card: '#FFFEF5', accent: '#D4A017', primary: '#FFE44E', tabList: '#FFF4B8', gridBorder: '#FFF4B8', gridBg: '#FFFADB' },
            2: { bg: '#E2FF90', card: '#F5FFF0', accent: '#4CAF50', primary: '#BCFF00', tabList: '#DFFF84', gridBorder: '#E6FFA1', gridBg: '#F1FFCA' },
            3: { bg: '#FEE5F3', card: '#FFF5FB', accent: '#E91E63', primary: '#FF77C3', tabList: '#FFE0F2', gridBorder: '#FFE0F2', gridBg: '#FFECF7' },
            4: { bg: '#D5E4FF', card: '#F0F5FF', accent: '#2196F3', primary: '#5995FF', tabList: '#CFE0FF', gridBorder: '#CFE0FF', gridBg: '#E6EFFF' },
            5: { bg: '#C9FFC4', card: '#F0FFF0', accent: '#8BC34A', primary: '#6FFF62', tabList: '#BDFFB7', gridBorder: '#BDFFB7', gridBg: '#E1FFDE' },
            6: { bg: '#D5FCFF', card: '#F0FFFF', accent: '#00BCD4', primary: '#51F3FF', tabList: '#CEFBFF', gridBorder: '#BDFAFF', gridBg: '#DFFDFF' },
            7: { bg: '#FFFBD4', card: '#FFFFF5', accent: '#FFC107', primary: '#FFF163', tabList: '#FFFAC8', gridBorder: '#FFF9BD', gridBg: '#FFFCE3' },
            8: { bg: '#E6D1A2', card: '#FFF8F0', accent: '#795548', primary: '#FBB821', tabList: '#E2CC9D', gridBorder: '#FFEFCC', gridBg: '#FFF6E3' },
            9: { bg: '#FFC2C3', card: '#FFF5F5', accent: '#F44336', primary: '#FF4E51', tabList: '#FFBDBE', gridBorder: '#FFE2E2', gridBg: '#FFF5F5' }
          };
          var num = parseInt(destiny, 10);
          var theme = themes[num];
          if (theme) {
            document.documentElement.style.setProperty('--destiny-bg', theme.bg);
            document.documentElement.style.setProperty('--destiny-card', theme.card);
            document.documentElement.style.setProperty('--destiny-accent', theme.accent);
            document.documentElement.style.setProperty('--destiny-primary', theme.primary);
            document.documentElement.style.setProperty('--destiny-tablist', theme.tabList);
            document.documentElement.style.setProperty('--destiny-grid-border', theme.gridBorder);
            document.documentElement.style.setProperty('--destiny-grid-bg', theme.gridBg);
          }
        }
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
