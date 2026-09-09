import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StaySync - PG & Co-Living Management SaaS',
  description: 'Digital management platform for PG owners and tenants in Tricity & Kharar.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
