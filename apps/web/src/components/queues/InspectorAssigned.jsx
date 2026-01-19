import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Clock, CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import logo_mundial from '@/assets/logo_mundial.svg';
import { API_ROUTES } from '@/config/api';

const InspectorAssigned = ({ onGoToInspection, onGoBack, existingAppointment }) => {
  const [timer, setTimer] = useState({ elapsed: 0, notification: '', color: '', expired: false, countdown: null });
  const [isActive, setIsActive] = useState(true);
  
  const TOTAL_TIME = 600;
  const WARNING_TIME = 420;

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Unified timer effect
  useEffect(() => {
    if (!isActive) return;
    
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      
      setTimer(prev => {
        if (elapsed === WARNING_TIME && !prev.notification) {
          return {
            ...prev,
            elapsed,
            notification: 'Recuerde que en 3 minutos se dará cierre a la inspección por falta de respuesta.',
            color: 'text-yellow-600'
          };
        }
        
        if (elapsed >= TOTAL_TIME && !prev.expired) {
          if (existingAppointment?.id) updateAppointmentStatus(existingAppointment.id);
          return {
            ...prev,
            elapsed,
            notification: 'Por inactividad de 10 minutos se cierra la inspección. Si desea continuar con el proceso, por favor seleccione nuevamente el enlace enviado anteriormente para retomar la conexión.',
            color: 'text-red-600',
            expired: true,
            countdown: 5
          };
        }
        
        return { ...prev, elapsed };
      });
    }, 500);

    return () => clearInterval(interval);
  }, [existingAppointment?.id, isActive]);
  
  // Reload countdown
  useEffect(() => {
    if (timer.countdown === null) return;
    
    if (timer.countdown === 0) {
      window.location.reload();
      return;
    }
    
    const timeout = setTimeout(() => {
      setTimer(prev => ({ ...prev, countdown: prev.countdown - 1 }));
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, [timer.countdown]);
  
  // Función para actualizar el estado del appointment
  const updateAppointmentStatus = async (appointmentId) => {
    try {
      const response = await fetch(API_ROUTES.APPOINTMENTS.UPDATE_STATUS_AUTOMATED(appointmentId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isUserOverride: false
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Estado del appointment actualizado:', data);
      } else {
        console.error('❌ Error actualizando estado del appointment:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Error en la llamada al endpoint:', error);
    }
  };

  const handleGoToInspection = () => {
    setIsActive(false);
    if (existingAppointment && existingAppointment.session_id) {
      const base = (import.meta.env.VITE_INSPECTYA_URL || '').replace(/\/$/, '') || window.location.origin;
      const inspectionUrl = `${base}/inspection/${existingAppointment.session_id}`;
      window.location.href = inspectionUrl;
    }
  };

  const timeRemaining = Math.max(TOTAL_TIME - timer.elapsed, 0);
  const timerColor = timer.elapsed >= TOTAL_TIME ? 'text-red-600' : 
                    timer.elapsed >= WARNING_TIME ? 'text-yellow-600' : 'text-green-700';

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <img src={logo_mundial} alt="logo_mundial" className="h-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Inspector Asignado</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                ¡Se ha asignado un inspector a tu inspección!
              </h2>

              <div className={`bg-gray-50 p-4 rounded-lg mb-4 border ${timerColor.replace('text', 'border')}`}>
                <Clock className={`h-8 w-8 mx-auto mb-2 ${timerColor}`} />
                <p className={`font-medium text-sm ${timerColor}`}>Tiempo restante</p>
                <p className={`font-bold text-2xl ${timerColor}`}>{formatTime(timeRemaining)}</p>

                {timer.notification && (
                  <p className={`${timer.color} text-sm mt-2`}>
                    {timer.notification}
                    {timer.countdown !== null && (
                      <span className="block mt-2 font-semibold">
                        Recargando en {timer.countdown} segundos...
                      </span>
                    )}
                  </p>
                )}
              </div>

              {timer.elapsed < TOTAL_TIME && (
                <Button
                  onClick={handleGoToInspection}
                  className="w-full bg-green-600 hover:bg-green-700 text-white mb-2"
                  size="lg"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ir a la Inspección
                </Button>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Preparación para la Inspección
              </h3>
              <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
                <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                  <li>Asegúrate de tener buena iluminación para las fotos</li>
                  <li>El vehículo debe estar limpio y sin objetos que obstaculicen la vista</li>
                  <li>Ten a mano la documentación del vehículo</li>
                  <li>Asegúrate de tener una conexión estable a internet</li>
                  <li>Prepárate para la inspección virtual programada</li>
                </ul>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button onClick={onGoBack} variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InspectorAssigned;
