"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple validation against hard‑coded admin credentials
    if (username !== "admin" || password !== "123456") {
      toast.error("Credenciales inválidas");
      setIsLoading(false);
      return;
    }
    
    // Mock login delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success("Bienvenido al panel");
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-violet-500/20 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4 border border-violet-500/20">
              <Lock className="w-6 h-6 text-violet-400" />
            </div>
            <CardTitle>Acceso Restringido</CardTitle>
            <CardDescription>Panel de administración de turnos</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <Input 
                    type="text" 
                    placeholder="Usuario" 
                    className="pl-10"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <Input 
                    type="password" 
                    placeholder="Contraseña" 
                    className="pl-10"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
                Ingresar
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
