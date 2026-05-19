"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2, Scissors, Calendar as CalendarIcon, User } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addDays, format, startOfToday } from "date-fns";
import { es } from "date-fns/locale";

const services = [
  { id: "lobulo", name: "Lóbulo", price: "$15.000", duration: 30 },
  { id: "septum", name: "Septum", price: "$18.000", duration: 30 },
  { id: "nostril", name: "Nostril", price: "$15.000", duration: 30 },
  { id: "labret", name: "Labret", price: "$15.000", duration: 30 },
  { id: "niples", name: "Niples", price: "$18.000", duration: 30 },
  { id: "lengua", name: "Lengua", price: "$18.000", duration: 30 },
  { id: "cejas", name: "Cejas", price: "$15.000", duration: 30 },
  { id: "otro", name: "Otro / Consulta", price: "A definir", duration: 30 },
];

const availableTimesMorning = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00"];
const availableTimesAfternoon = ["16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];

const formSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  phone: z.string().min(8, "Ingresá un teléfono válido"),
  instagram: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReservarPage() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para fechas y horarios ocupados
  const [blockedDates, setBlockedDates] = useState<Record<string, string>>({});
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  // Generar próximos 14 días
  const today = startOfToday();
  const availableDates = Array.from({ length: 14 }).map((_, i) => format(addDays(today, i), 'yyyy-MM-dd'));

  useEffect(() => {
    // Cargar días bloqueados por el admin al montar
    const fetchBlockedDates = async () => {
      try {
        const q = query(collection(db, "blockedDates"));
        const snapshot = await getDocs(q);
        const datesObj: Record<string, string> = {};
        snapshot.docs.forEach(doc => {
          datesObj[doc.id] = doc.data().type || "full";
        });
        setBlockedDates(datesObj);
      } catch (error) {
        console.error("Error al cargar días bloqueados", error);
      }
    };
    fetchBlockedDates();
  }, []);

  useEffect(() => {
    // Cargar horarios ocupados cuando se selecciona una fecha
    const fetchBookedTimes = async () => {
      if (!selectedDate) return;
      setIsLoadingTimes(true);
      setSelectedTime(null); // Resetear horario si cambia el día
      try {
        const q = query(collection(db, "turnos"), where("date", "==", selectedDate));
        const snapshot = await getDocs(q);
        const times = snapshot.docs
          .map(doc => doc.data())
          .filter(data => data.status !== "Cancelado")
          .map(data => data.time);
        setBookedTimes(times);
      } catch (error) {
        console.error("Error al cargar horarios ocupados", error);
      } finally {
        setIsLoadingTimes(false);
      }
    };
    fetchBookedTimes();
  }, [selectedDate]);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const onSubmit = async (data: FormValues) => {
    // Validar que Firebase esté configurado
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      toast.error("Error de configuración del servidor. Contactanos por WhatsApp.");
      return;
    }

    setIsSubmitting(true);

    // Timeout de seguridad: si en 15 segundos no hay respuesta, liberar el botón
    const timeoutId = setTimeout(() => {
      setIsSubmitting(false);
      toast.error("La operación tardó demasiado. Verificá tu conexión e intentá nuevamente.");
    }, 15000);

    try {
      const serviceName = services.find(s => s.id === selectedService)?.name || selectedService;
      await addDoc(collection(db, "turnos"), {
        name: data.name,
        phone: data.phone,
        instagram: data.instagram || "",
        serviceId: selectedService,
        service: serviceName,
        date: selectedDate,
        time: selectedTime,
        status: "Pendiente",
        createdAt: serverTimestamp()
      });
      clearTimeout(timeoutId);
      toast.success("¡Turno confirmado con éxito!");
      setStep(4);
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      console.error("Error al guardar turno:", error);
      const firebaseError = error as { code?: string };
      if (firebaseError?.code === "permission-denied") {
        toast.error("Sin permisos para guardar. Contactanos por WhatsApp.");
      } else if (firebaseError?.code === "unavailable") {
        toast.error("Sin conexión a internet. Verificá tu red e intentá nuevamente.");
      } else {
        toast.error("Ocurrió un error al confirmar. Intenta nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= i ? 'bg-violet-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/10 text-neutral-500'}`}>
            {i}
          </div>
          {i < 3 && (
            <div className={`w-12 h-1 mx-2 rounded-full transition-colors ${step > i ? 'bg-violet-600/50' : 'bg-white/5'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderTimeButtons = (times: string[]) => {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
        {times.map((time) => {
          const isSelected = selectedTime === time;
          const isBooked = bookedTimes.includes(time);

          return (
            <button
              key={time}
              onClick={() => !isBooked && setSelectedTime(time)}
              disabled={isBooked}
              className={`py-3 rounded-xl border text-sm font-medium transition-all 
                ${isBooked ? 'border-red-500/20 bg-red-500/5 text-red-500/50 cursor-not-allowed line-through' :
                  isSelected ? 'border-cyan-400 bg-cyan-400/10 text-white shadow-[0_0_10px_rgba(34,211,238,0.2)]' :
                    'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'}`}
            >
              {time}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 relative flex flex-col items-center">
      <div className="fixed top-0 inset-x-0 h-96 bg-gradient-to-b from-violet-900/20 to-transparent pointer-events-none" />

      <div className="w-full max-w-xl z-10">
        {step < 4 && (
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" onClick={() => step > 1 ? prevStep() : window.history.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold ml-2">Sacar Turno</h1>
          </div>
        )}

        {step < 4 && renderStepIndicator()}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-6 text-neutral-300">
                <Scissors className="w-5 h-5 text-violet-400" />
                <h2 className="text-xl font-semibold text-white">Elegí el servicio</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <Card
                    key={service.id}
                    onClick={() => { setSelectedService(service.id); nextStep(); }}
                    className={`cursor-pointer transition-all hover:border-violet-500/50 hover:bg-white/10 ${selectedService === service.id ? 'border-violet-500 shadow-[0_0_15px_rgba(168,85,247,0.2)] bg-violet-500/10' : ''}`}
                  >
                    <h3 className="font-medium text-lg text-white mb-1">{service.name}</h3>
                    <p className="text-neutral-400 text-sm">{service.duration} min • {service.price}</p>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4 text-neutral-300">
                <CalendarIcon className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">Elegí fecha y hora</h2>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-3">Próximos 14 días</h3>
                <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-white/5 shadow-lg">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(day => (
                      <div key={day} className="text-center text-xs font-semibold text-neutral-500 py-1">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {/* Espacios vacíos para alinear el primer día con su día de la semana */}
                    {Array.from({ length: new Date(availableDates[0] + "T12:00:00").getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}

                    {availableDates.map((dateStr, index) => {
                      const d = new Date(dateStr + "T12:00:00");
                      const isSelected = selectedDate === dateStr;
                      const blockType = blockedDates[dateStr];
                      const isFullyBlocked = blockType === "full";
                      const isToday = index === 0;

                      return (
                        <button
                          key={dateStr}
                          onClick={() => !isFullyBlocked && setSelectedDate(dateStr)}
                          disabled={isFullyBlocked}
                          className={`aspect-square flex flex-col items-center justify-center rounded-xl border transition-all relative
                            ${isFullyBlocked ? 'border-transparent text-neutral-600 cursor-not-allowed opacity-40' :
                              isSelected ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.2)] text-white font-bold' :
                                'border-transparent text-neutral-300 hover:bg-white/10 hover:border-white/10'}`}
                        >
                          <span className="text-[15px]">{format(d, 'd')}</span>
                          {/* Pequeño indicador del mes solo para el día 1 o si es el primer día de la lista */}
                          {(format(d, 'd') === '1' || dateStr === availableDates[0]) && (
                            <span className="absolute bottom-1 text-[9px] font-medium text-neutral-500 uppercase">
                              {format(d, 'MMM', { locale: es })}
                            </span>
                          )}
                          {(blockType === "morning" || blockType === "afternoon") && !isFullyBlocked && (
                            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
                          )}
                          {isFullyBlocked && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-1/2 h-[1px] bg-neutral-600 rotate-45" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {selectedDate && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  {isLoadingTimes ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <>
                      {blockedDates[selectedDate] !== "morning" ? (
                        <>
                          <h3 className="text-sm font-medium text-neutral-400 mb-3">Mañana</h3>
                          {renderTimeButtons(availableTimesMorning)}
                        </>
                      ) : (
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center mb-6">
                          <p className="text-sm text-neutral-400">Mañana inhabilitada</p>
                        </div>
                      )}

                      {blockedDates[selectedDate] !== "afternoon" ? (
                        <>
                          <h3 className="text-sm font-medium text-neutral-400 mb-3">Tarde</h3>
                          {renderTimeButtons(availableTimesAfternoon)}
                        </>
                      ) : (
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center mb-6">
                          <p className="text-sm text-neutral-400">Tarde inhabilitada</p>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              <div className="pt-4 flex justify-end">
                <Button
                  onClick={nextStep}
                  disabled={!selectedDate || !selectedTime}
                  className={(!selectedDate || !selectedTime) ? 'opacity-50' : ''}
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-2 mb-6 text-neutral-300">
                <User className="w-5 h-5 text-violet-400" />
                <h2 className="text-xl font-semibold text-white">Tus Datos</h2>
              </div>

              <Card>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Nombre completo *"
                    placeholder="Ej. Juan Pérez"
                    {...register("name")}
                    error={errors.name?.message}
                  />
                  <Input
                    label="Teléfono (WhatsApp) *"
                    placeholder="Ej. 11 2345 6789"
                    type="tel"
                    {...register("phone")}
                    error={errors.phone?.message}
                  />
                  <Input
                    label="Usuario de Instagram (Opcional)"
                    placeholder="Ej. @juanperez"
                    {...register("instagram")}
                  />

                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 mt-6 mb-2">
                    <h4 className="text-sm font-medium text-white mb-2">Resumen</h4>
                    <p className="text-sm text-neutral-400">Servicio: <span className="text-white">{services.find(s => s.id === selectedService)?.name}</span></p>
                    <p className="text-sm text-neutral-400">Fecha: <span className="text-white">{selectedDate} a las {selectedTime}</span></p>
                  </div>

                  <Button type="submit" className="w-full" isLoading={isSubmitting}>
                    Confirmar Turno
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center space-y-6 pt-12"
            >
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-2 border-green-500/50 animate-[ping_2s_ease-in-out_infinite]" />
                <CheckCircle2 className="w-12 h-12 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
              </div>

              <div>
                <h2 className="text-3xl font-bold text-white mb-2">¡Solicitud Enviada!</h2>
                <p className="text-neutral-400 max-w-sm mx-auto mb-4">
                  Tu turno fue registrado, por cualquier consulta hablame al WhatsApp.
                </p>
              </div>

              <div className="pt-8 flex flex-col gap-3 w-full max-w-xs mx-auto">
                <Button
                  onClick={() => window.open('https://wa.me/5493585141022?text=Hola,%20acabo%20de%20solicitar%20un%20turno%20desde%20la%20web.%20Quería%20avisarles!', '_blank')}
                  className="bg-green-600 hover:bg-green-500 text-white w-full border-0"
                >
                  Contactar por wsp
                </Button>
                <Button onClick={() => window.location.href = '/'} variant="secondary" className="w-full">
                  Volver al Inicio
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
