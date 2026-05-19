"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, CalendarDays, LogOut, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#050505]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass border-r border-white/5 md:min-h-screen p-4 flex flex-col">
        <div className="mb-8 px-4 py-2">
          <Link href="/">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Turnero Admin</h2>
          </Link>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/admin/dashboard" className={`flex items-center px-4 py-3 rounded-xl transition-colors ${pathname === '/admin/dashboard' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link href="/admin/turnos" className={`flex items-center px-4 py-3 rounded-xl transition-colors ${pathname === '/admin/turnos' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}>
            <CalendarDays className="w-5 h-5 mr-3" />
            Turnos
          </Link>
          <Link href="/admin/config" className={`flex items-center px-4 py-3 rounded-xl transition-colors ${pathname === '/admin/config' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}>
            <Settings className="w-5 h-5 mr-3" />
            Configuración
          </Link>
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10">
          <Link href="/admin/login" className="flex items-center px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
