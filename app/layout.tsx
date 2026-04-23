import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Debate Arena - AI vs AI",
  description: "Submit any topic and watch two AI agents battle it out. Vote for the winner.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="font-bold text-lg tracking-tight">Debate Arena</a>
            <div className="flex gap-4 text-sm">
              <a href="/" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">New Debate</a>
              <a href="/debates" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Browse</a>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">{children}</main>
      </body>
    </html>
  );
}
