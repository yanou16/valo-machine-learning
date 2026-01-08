import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google";
import "./globals.css";
import { ReportProvider } from "@/context/ReportContext";
import ChatWidget from "@/components/ChatWidget";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter'
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani'
});

export const metadata: Metadata = {
  title: "ValoML | Automated Scouting Reports",
  description: "AI-powered scouting reports for VALORANT esports. Analyze teams, discover patterns, and win matches.",
  keywords: ["valorant", "esports", "scouting", "analytics", "AI", "machine learning"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${rajdhani.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ReportProvider>
            {children}
            <ChatWidget />
          </ReportProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
