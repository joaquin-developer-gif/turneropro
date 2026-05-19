"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { collection, onSnapshot, doc, setDoc, deleteDoc, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addDays, format, startOfToday } from "date-fns";
import { es } from "date-fns/locale";

import { X } from "lucide-react";

export default function ConfigPage() {
  const [blockedDates, setBlockedDates] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDateModal, setSelectedDateModal] = useState<string | null>(null);

  // Generar próximos 30 días para que el admin pueda planear con anticipación
  const today = startOfToday();
  const upcomingDates = Array.from({ length: 30 }).map((_, i) => format(addDays(today, i), 'yyyy-MM-dd'));

  useEffect(() => {
    const q = query(collection(db, "blockedDates"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datesObj: Record<string, string> = {};
      snapshot.forEach(doc => {
        datesObj[doc.id] = doc.data().type || "full";
      });
      setBlockedDates(datesObj);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSetBlock = async (type: string) => {
    if (!selectedDateModal) return;
    try {
      const docRef = doc(db, "blockedDates", selectedDateModal);
      if (type === "none") {
        await deleteDoc(docRef);
        toast.success(`Día habilitado`);
      } else {
        await setDoc(docRef, { date: selectedDateModal, type });
        toast.success(`Bloqueo actualizado`);
      }
      setSelectedDateModal(null);
    } catch (error) {
      console.error("Error al cambiar estado del día:", error);
      toast.error("Ocurrió un error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Configuración</h1>
        <p className="text-neutral-400">Gestiona la disponibilidad de tu estudio.</p>
      </div>

      <Card className="border-white/5">
        <CardHeader>
          <CardTitle>Bloquear Días Libres</CardTitle>
          <p className="text-sm text-neutral-400 mt-1">
            Selecciona los días en los que no trabajarás. Los clientes no podrán sacar turnos en estos días.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-neutral-500">Cargando calendario...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
              {upcomingDates.map((dateStr) => {
                const d = new Date(dateStr + "T12:00:00");
                const blockType = blockedDates[dateStr];
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDateModal(dateStr)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all relative
                      ${blockType === 'full' 
                        ? 'border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                        : blockType === 'morning' || blockType === 'afternoon'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                        : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 hover:border-white/20'}`}
                  >
                    <span className="text-xs font-medium uppercase mb-1">{format(d, 'eee', { locale: es })}</span>
                    <span className="text-2xl font-bold">{format(d, 'd')}</span>
                    <span className="text-xs mt-1 opacity-70">{format(d, 'MMM', { locale: es })}</span>
                    <div className="mt-2 text-[10px] uppercase tracking-wider font-bold">
                      {!blockType ? 'Abierto' : blockType === 'full' ? 'Bloqueado' : blockType === 'morning' ? 'Mañana Bloq.' : 'Tarde Bloq.'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de selección */}
      {selectedDateModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm border-white/10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedDateModal(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <CardHeader>
              <CardTitle>Configurar Día</CardTitle>
              <p className="text-sm text-neutral-400">{format(new Date(selectedDateModal + "T12:00:00"), "EEEE d 'de' MMMM", { locale: es })}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => handleSetBlock("none")} variant="outline" className="w-full justify-start text-green-400 hover:text-green-300 hover:bg-green-400/10 border-white/10">
                🟢 Abierto todo el día
              </Button>
              <Button onClick={() => handleSetBlock("morning")} variant="outline" className="w-full justify-start text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 border-white/10">
                🟡 Bloquear Mañana (10:00 - 13:00)
              </Button>
              <Button onClick={() => handleSetBlock("afternoon")} variant="outline" className="w-full justify-start text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 border-white/10">
                🟡 Bloquear Tarde (16:30 - 20:30)
              </Button>
              <Button onClick={() => handleSetBlock("full")} variant="outline" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10 border-white/10">
                🔴 Bloquear Día Completo
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
