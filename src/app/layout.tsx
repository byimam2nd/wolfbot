import type { Metadata } from "next";
import "./globals.css";
import i18n from '../i18n'; // Import i18n configuration
import { I18nextProvider } from 'react-i18next';

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
        <I18nextProvider i18n={i18n}>
          {children}
        </I18nextProvider>
      </body>
    </html>
  );
}