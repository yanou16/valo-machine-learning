import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReportProvider } from "@/context/ReportContext";
import ChatWidget from "@/components/ChatWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter'
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
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ReportProvider>
          {children}
          <ChatWidget />
        </ReportProvider>
      </body>
    </html>
  );
}
