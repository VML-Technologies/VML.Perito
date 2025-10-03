import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Clock, CheckCircle, ArrowLeft, Car } from 'lucide-react';
import logo_mundial from '@/assets/logo_mundial.svg';

const Wait = ({ 
    queueStatus, 
    waitingTime, 
    onGoBack,
    formatWaitingTime 
}) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-2xl mx-auto">
                <Card className="shadow-lg">
                    <CardHeader className="text-center pb-4">
                        <div className="flex justify-start mb-4">
                            <img src={logo_mundial} alt="logo_mundial" className="h-6 text-blue-600 mr-3" />
                        </div>
                        <div className="flex justify-center mb-4">
                            <div>
                                <CardTitle className="text-2xl text-gray-800">
                                    En Cola de Espera
                                </CardTitle>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Mensaje principal */}
                        <div className="text-center bg-blue-50 p-6 rounded-lg">
                            <div className="flex items-center justify-center mb-4">
                                <Clock className="h-12 w-12 text-blue-600 mr-3" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                ¡Pronto un inspector iniciará tu inspección!
                            </h2>
                            <p className="text-gray-600">
                                Tu orden está en la cola de espera. Un inspector te atenderá en breve.
                            </p>
                        </div>

                        <Separator />

                        {/* Información de la orden */}
                        {queueStatus?.inspectionOrder && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <Car className="h-5 w-5 mr-2 text-gray-600" />
                                    Información del Vehículo
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-600">Placa:</span>
                                        <p className="text-gray-800 font-semibold">{queueStatus.inspectionOrder.placa}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Número de Orden:</span>
                                        <p className="text-gray-800 font-semibold">{queueStatus.inspectionOrder.numero}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Contacto:</span>
                                        <p className="text-gray-800">{queueStatus.inspectionOrder.nombre_contacto}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Tiempo de Ingreso:</span>
                                        <p className="text-gray-800">
                                            {new Date(queueStatus.tiempo_ingreso).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contador de tiempo de espera */}
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <div className="bg-yellow-50 p-4 rounded-lg text-center">
                                <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                                <p className="text-yellow-800 font-medium text-sm">Tiempo de Espera</p>
                                <p className="text-yellow-900 font-bold text-2xl">
                                    {formatWaitingTime(waitingTime || 0)}
                                </p>
                            </div>
                        </div>

                        {/* Recomendaciones */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Recomendaciones
                            </h3>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <ul className="text-sm text-gray-700 space-y-2">
                                    <li className="flex items-start">
                                        <span className="text-yellow-600 mr-2">•</span>
                                        Asegúrate de tener buena iluminación para las fotos
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-yellow-600 mr-2">•</span>
                                        El vehículo debe estar limpio y sin objetos que obstaculicen la vista
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-yellow-600 mr-2">•</span>
                                        Ten a mano la documentación del vehículo
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-yellow-600 mr-2">•</span>
                                        Asegúrate de tener una conexión estable a internet
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-yellow-600 mr-2">•</span>
                                        Mantén esta página abierta para recibir actualizaciones
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Botón de regreso */}
                        <div className="text-center pt-4">
                            <Button
                                onClick={onGoBack}
                                variant="outline"
                                className="w-full"
                            >
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

export default Wait;
