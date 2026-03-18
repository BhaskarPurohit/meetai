import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import "@stream-io/video-react-sdk/dist/css/styles.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MeetAI — Intelligent Meeting Assistant",
  description: "AI-powered meeting summaries, action items, and knowledge base.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--meetai-surface)",
              border: "1px solid var(--meetai-border-strong)",
              color: "var(--meetai-text-primary)",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}