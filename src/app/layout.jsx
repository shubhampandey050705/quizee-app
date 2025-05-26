import './globals.css'; 
import { Geist, Geist_Mono } from "next/font/google";

// Font setup
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata (optional in JS projects unless used in pages)
export const metadata = {
  title: "Quizee App",
  description: "Your quiz application built with Next.js",
};

// Layout component
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
