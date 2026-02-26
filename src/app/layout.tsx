import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AccidentSurance Claim Form",
  description: "Digitalized HSBC AccidentSurance Claim Form",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
