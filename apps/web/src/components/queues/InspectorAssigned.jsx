import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Clock, CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import logo_mundial from '@/assets/logo_mundial.svg';

const InspectorAssigned = ({ 
    existingAppointment, 
    timeUntilAppointment, 
    onGoToInspection, 
    onGoBack,
    formatTimeUntilAppointment 
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
                                    Inspector Asignado
                                </CardTitle>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Agendamiento existente */}
                        <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                            <div className="flex items-center justify-center mb-4">
                                <CheckCircle className="h-12 w-12 text-green-600 mr-3" />
                            </div>
                            <h2 className="text-xl font-semibold text-green-800 mb-2">
                                ¡Se ha asignado un inspector a tu inspección!
                            </h2>

                            {timeUntilAppointment !== null ? (
                                <div className="text-center">
                                    {timeUntilAppointment <= 5 ? (
                                        <div className="mb-4">
                                            <p className="text-green-800 font-medium mb-3">
                                                ¡Es hora de tu inspección!
                                            </p>
                                            <Button
                                                onClick={onGoToInspection}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                size="lg"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Ir a la Inspección
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="bg-yellow-50 p-4 rounded-lg">
                                            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                                            <p className="text-yellow-800 font-medium text-sm">Tiempo restante</p>
                                            <p className="text-yellow-900 font-bold text-2xl">
                                                {formatTimeUntilAppointment(timeUntilAppointment)}
                                            </p>
                                            <p className="text-yellow-600 text-xs mt-1">
                                                Tu inspección comenzará automáticamente
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Fallback: Si no se puede calcular el tiempo, mostrar botón directo
                                <div className="text-center">
                                    <div className="mb-4">
                                        <p className="text-green-800 font-medium mb-3">
                                            ¡Tu inspección está lista!
                                        </p>
                                        <Button
                                            onClick={onGoToInspection}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                                            size="lg"
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Ir a la Inspección
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Recomendaciones */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Preparación para la Inspección
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
                                        Prepárate para la inspección virtual programada
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

export default InspectorAssigned;
