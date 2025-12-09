import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Clock, CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import logo_mundial from '@/assets/logo_mundial.svg';

const InspectorAssigned = ({ onGoToInspection, onGoBack }) => {
  const [secondsSinceAssignment, setSecondsSinceAssignment] = useState(0);
  const [notification, setNotification] = useState('');
  const [notificationColor, setNotificationColor] = useState('');

  const totalTime = 600; // 10 minutos
  const warningTime = 420; // 7 minutos

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Contador de tiempo
  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setSecondsSinceAssignment(elapsed);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Notificaciones (se mantienen)
  useEffect(() => {
    // Mensaje de 3 minutos restantes
    if (secondsSinceAssignment === warningTime) {
      setNotification(
        'Recuerde que en 3 minutos se dará cierre a la inspección por falta de respuesta.'
      );
      setNotificationColor('text-yellow-600');
    }

    // Mensaje de cierre a los 10 minutos (REEMPLAZA al anterior)
    if (secondsSinceAssignment >= totalTime) {
      setNotification(
        'Por inactividad de 10 minutos se cierra la inspección. Si desea continuar con el proceso, por favor seleccione nuevamente el enlace enviado anteriormente para retomar la conexión.'
      );
      setNotificationColor('text-red-600');
    }
  }, [secondsSinceAssignment]);

  const timeRemaining = Math.max(totalTime - secondsSinceAssignment, 0);

  let timerColor = 'text-green-700';
  if (secondsSinceAssignment >= warningTime && secondsSinceAssignment < totalTime) {
    timerColor = 'text-yellow-600';
  } else if (secondsSinceAssignment >= totalTime) {
    timerColor = 'text-red-600';
  }

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

                {notification && (
                  <p className={`${notificationColor} text-sm mt-2`}>
                    {notification}
                  </p>
                )}
              </div>

              {secondsSinceAssignment < totalTime && (
                <Button
                  onClick={onGoToInspection}
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
