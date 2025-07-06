import type { Metadata } from "next";
import I18nProvider from './I18nProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "Wolfbot - DiceBot Dashboard",
  description: "A full-stack Next.js betting bot dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>
          {children}
        </I18nProvider>
        <Toaster />
      </body>
    </html>
  );
}