"use client";

import { motion } from "framer-motion";
import { Sparkles, CalendarPlus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 text-center max-w-2xl mx-auto space-y-8"
      >
        <div className="flex flex-col items-center justify-center mb-4">
          {/* Logo Circular */}
          <div className="w-56 h-56 rounded-full overflow-hidden border-2 border-pink-500 shadow-[0_0_30px_rgba(255,20,147,0.6)] mb-6 relative">
            <Image src="/logo2.png" alt="Blessed Logo" fill className="object-cover" />
          </div>
          
          {/* Texto Blessed Neón */}
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight neon-text pb-2 mt-4">
            Blessed
          </h1>
          <p className="text-xl md:text-2xl mt-4 font-semibold tracking-widest uppercase text-pink-300">
            Body Piercing
          </p>
        </div>

        <p className="text-lg md:text-xl text-pink-100/80 max-w-lg mx-auto font-medium">
          Reserva tu turno. Experiencia premium, higiene garantizada y muy buena atención.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/reservar" className="w-full sm:w-auto">
            <Button size="lg" className="w-full group bg-pink-600 hover:bg-pink-500 text-white border-0 shadow-[0_0_15px_rgba(255,20,147,0.5)] transition-all">
              <CalendarPlus className="mr-2 w-5 h-5" />
              Sacar Turno
              <ChevronRight className="ml-2 w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/admin/login" className="w-full sm:w-auto">
            <Button variant="ghost" size="lg" className="w-full text-pink-400 hover:bg-pink-950/50 hover:text-pink-300">
              Acceso Admin
            </Button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
