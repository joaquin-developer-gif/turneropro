"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarCheck, Clock, TrendingUp } from "lucide-react";
import { collection, onSnapshot, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { es } from "date-fns/locale";

interface Turno {
  id: string;
  name: string;
  service: string;
  date: string;
  time: string;
  status: string;
}

export default function Dashboard() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [pendientesCount, setPendientesCount] = useState(0);
  const [totalTurnosCount, setTotalTurnosCount] = useState(0);
  const [ingresosMes, setIngresosMes] = useState(0);
  const [topServices, setTopServices] = useState<{name: string, percent: string}[]>([]);

  // Fechas del mes actual
  const today = new Date();
  const startOfMonthStr = format(startOfMonth(today), 'yyyy-MM-dd');
  const endOfMonthStr = format(endOfMonth(today), 'yyyy-MM-dd');
  const endOfMonthFormatted = format(endOfMonth(today), "d 'de' MMMM", { locale: es });

  useEffect(() => {
    // Escuchar los últimos turnos
    const q = query(collection(db, "turnos"), orderBy("date", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const turnosData: Turno[] = [];
      let pending = 0;
      snapshot.forEach((doc) => {
        const { id: _id, ...data } = doc.data() as Turno;
        turnosData.push({ id: doc.id, ...data });
        if (data.status === "Pendiente") pending++;
      });
      setTurnos(turnosData);
    });

    // Escuchar el total de pendientes
    const qPendientes = query(collection(db, "turnos"), where("status", "==", "Pendiente"));
    const unsubscribePendientes = onSnapshot(qPendientes, (snapshot) => {
      setPendientesCount(snapshot.size);
    });

    // Escuchar el total de turnos
    const unsubscribeTotal = onSnapshot(collection(db, "turnos"), (snapshot) => {
      setTotalTurnosCount(snapshot.size);
    });

    // Escuchar turnos del mes para ingresos (7000 por turno)
    const qMes = query(
      collection(db, "turnos"), 
      where("date", ">=", startOfMonthStr), 
      where("date", "<=", endOfMonthStr)
    );
    const unsubscribeMes = onSnapshot(qMes, (snapshot) => {
      let count = 0;
      const serviceCounts: Record<string, number> = {};

      snapshot.forEach((doc) => {
        const data = doc.data() as Turno;
        if (data.status !== "Cancelado") {
          count++;
          serviceCounts[data.service] = (serviceCounts[data.service] || 0) + 1;
        }
      });
      setIngresosMes(count * 7000);

      if (count === 0) {
        setTopServices([]);
      } else {
        const sorted = Object.entries(serviceCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([name, freq]) => ({
            name,
            percent: `${Math.round((freq / count) * 100)}%`
          }));
        setTopServices(sorted);
      }
    });

    return () => {
      unsubscribe();
      unsubscribePendientes();
      unsubscribeTotal();
      unsubscribeMes();
    };
  }, [startOfMonthStr, endOfMonthStr]);

  const stats = [
    { title: "Turnos Totales", value: totalTurnosCount.toString(), icon: CalendarCheck, color: "text-violet-400" },
    { title: "Pendientes", value: pendientesCount.toString(), icon: Clock, color: "text-amber-400" },
    { 
      title: "Ingresos Estimados", 
      value: `$${ingresosMes.toLocaleString('es-AR')}`, 
      subtitle: `Se renueva el ${endOfMonthFormatted}`,
      icon: TrendingUp, 
      color: "text-green-400" 
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold text-white">Resumen General</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-white/5 hover:border-violet-500/30 transition-colors group">
            <CardContent className="p-0 flex items-center p-6">
              <div className={`p-3 rounded-xl bg-white/5 mr-4 group-hover:scale-110 transition-transform ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                {stat.subtitle && <p className="text-xs text-neutral-500 mt-1">{stat.subtitle}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Últimos Turnos Registrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {turnos.length === 0 ? (
                  <div className="text-neutral-500 text-center py-4">No hay turnos recientes.</div>
                ) : (
                  turnos.map((turno) => (
                    <div key={turno.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{turno.name}</span>
                        <span className="text-sm text-neutral-400">{turno.service}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="block text-white font-medium">{turno.time} ({turno.date})</span>
                          <span className={`text-xs ${turno.status === 'Confirmado' ? 'text-green-400' : turno.status === 'Pendiente' ? 'text-amber-400' : 'text-red-400'}`}>
                            {turno.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Top Servicios</CardTitle>
              <p className="text-xs text-neutral-500 mt-1">Se renueva el {endOfMonthFormatted}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topServices.length === 0 ? (
                  <div className="text-neutral-500 text-sm text-center py-4">Sin datos este mes</div>
                ) : (
                  topServices.map((s, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white">{s.name}</span>
                        <span className="text-neutral-400">{s.percent}</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div className="bg-violet-500 h-2 rounded-full" style={{ width: s.percent }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
