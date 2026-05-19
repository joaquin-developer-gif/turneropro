import type { Metadata } from "next";
import { Outfit, Space_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "blessed-piercing",
  description: "Reserva tu próximo piercing en Blessed Piercing Studio.",
  icons: {
    icon: "/logo2.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} ${spaceMono.variable} h-full antialiased dark bg-[#050505] text-white`}
    >
      <body className="min-h-full flex flex-col font-sans relative">
        {/* Background Effects */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ff1493] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob"></div>
          <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-[#8a2be2] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-[#ff69b4] rounded-full mix-blend-screen filter blur-[120px] opacity-15 animate-blob animation-delay-4000"></div>
        </div>
        
        {children}
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}
