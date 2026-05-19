"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Edit2, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Turno {
  id: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  status: string;
}

export default function TurnosPage() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTurno, setNewTurno] = useState({
    name: "",
    phone: "",
    service: "Otro / Consulta",
    date: "",
    time: "10:00"
  });

  useEffect(() => {
    // Escuchar turnos en tiempo real
    const q = query(collection(db, "turnos"), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const turnosData: Turno[] = [];
      snapshot.forEach((doc) => {
        turnosData.push({ id: doc.id, ...doc.data() } as Turno);
      });
      setTurnos(turnosData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error al cargar turnos:", error);
      toast.error("Error al conectar con la base de datos");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredTurnos = turnos.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleStatusChange = async (turno: Turno, newStatus: string) => {
    try {
      const turnoRef = doc(db, "turnos", turno.id);
      await updateDoc(turnoRef, { status: newStatus });
      toast.success(`Turno ${newStatus.toLowerCase()}`);

      if (newStatus === 'Confirmado' && turno.phone) {
        // Limpiar número
        let clientPhone = turno.phone.replace(/[\s\-\+]/g, '');
        if (!clientPhone.startsWith('54') && clientPhone.length >= 10) {
          clientPhone = '549' + clientPhone;
        }

        const message = `Hola ${turno.name}! Te escribimos de Blessed Piercing, para confirmarte tu turno de *${turno.service}* para el día *${turno.date}* a las *${turno.time}*. 

Si necesitas modificarlo o cancelarlo, por favor escribinos respondiendo a este número (3585141022). ¡Te esperamos!`;

        const waUrl = `https://wa.me/${clientPhone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
      }

    } catch (error) {
      console.error("Error al actualizar:", error);
      toast.error("No se pudo actualizar el estado");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este turno de forma permanente?")) {
      try {
        await deleteDoc(doc(db, "turnos", id));
        toast.success("Turno eliminado");
      } catch (error) {
        console.error("Error al eliminar:", error);
        toast.error("No se pudo eliminar el turno");
      }
    }
  };

  const handleCreateTurno = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "turnos"), {
        ...newTurno,
        status: "Confirmado",
      });
      toast.success("Turno creado con éxito");
      setIsModalOpen(false);
      setNewTurno({ name: "", phone: "", service: "Otro / Consulta", date: "", time: "10:00" });
    } catch (error) {
      console.error("Error al crear turno:", error);
      toast.error("No se pudo crear el turno");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Gestión de Turnos</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          Nuevo Turno Manual
        </Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 bg-[#0a0a0a] border-white/10 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Nuevo Turno Manual</h2>
            <form onSubmit={handleCreateTurno} className="space-y-4">
              <div>
                <label className="text-sm text-neutral-400 mb-1 block">Nombre del Cliente</label>
                <Input required value={newTurno.name} onChange={(e) => setNewTurno({ ...newTurno, name: e.target.value })} placeholder="Ej: Juan Pérez" className="bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <label className="text-sm text-neutral-400 mb-1 block">Teléfono / Contacto</label>
                <Input required value={newTurno.phone} onChange={(e) => setNewTurno({ ...newTurno, phone: e.target.value })} placeholder="Ej: +54 9 11 1234-5678" className="bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <label className="text-sm text-neutral-400 mb-1 block">Servicio</label>
                <select required value={newTurno.service} onChange={(e) => setNewTurno({ ...newTurno, service: e.target.value })} className="w-full h-10 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option className="text-black" value="Lóbulo">Lóbulo</option>
                  <option className="text-black" value="Septum">Septum</option>
                  <option className="text-black" value="Nostril">Nostril</option>
                  <option className="text-black" value="Labret">Labret</option>
                  <option className="text-black" value="Niples">Niples</option>
                  <option className="text-black" value="Lengua">Lengua</option>
                  <option className="text-black" value="Cejas">Cejas</option>
                  <option className="text-black" value="Otro / Consulta">Otro / Consulta</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-neutral-400 mb-1 block">Fecha</label>
                  <Input required type="date" value={newTurno.date} onChange={(e) => setNewTurno({ ...newTurno, date: e.target.value })} className="bg-white/5 border-white/10 text-white [color-scheme:dark]" />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-1 block">Hora</label>
                  <Input required type="time" value={newTurno.time} onChange={(e) => setNewTurno({ ...newTurno, time: e.target.value })} className="bg-white/5 border-white/10 text-white [color-scheme:dark]" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" className="flex-1 text-neutral-400 hover:text-white" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1 bg-pink-600 hover:bg-pink-500 text-white border-0">Guardar Turno</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <Card className="p-4 border-white/5">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <Input
              placeholder="Buscar por nombre..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="text-xs uppercase bg-white/5 text-neutral-300">
              <tr>
                <th className="px-6 py-3 rounded-tl-xl">Cliente</th>
                <th className="px-6 py-3">Servicio</th>
                <th className="px-6 py-3">Fecha y Hora</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3 rounded-tr-xl">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-neutral-500">
                    Cargando turnos...
                  </td>
                </tr>
              ) : filteredTurnos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-neutral-500">
                    No hay turnos registrados.
                  </td>
                </tr>
              ) : (
                filteredTurnos.map((turno) => (
                  <tr key={turno.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{turno.name}</p>
                      <p className="text-xs text-neutral-500">{turno.phone}</p>
                    </td>
                    <td className="px-6 py-4">{turno.service}</td>
                    <td className="px-6 py-4">
                      <p className="text-white">{turno.date}</p>
                      <p className="text-xs">{turno.time}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border inline-block ${turno.status === 'Confirmado' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          turno.status === 'Pendiente' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                        {turno.status || 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {turno.status !== 'Confirmado' && (
                          <button onClick={() => handleStatusChange(turno, 'Confirmado')} className="p-1 hover:bg-white/10 rounded-lg text-green-400 transition-colors" title="Confirmar">
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                        {turno.status !== 'Cancelado' && (
                          <button onClick={() => handleStatusChange(turno, 'Cancelado')} className="p-1 hover:bg-white/10 rounded-lg text-red-400 transition-colors" title="Cancelar">
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(turno.id)} className="p-1 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-red-400 transition-colors" title="Eliminar">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
