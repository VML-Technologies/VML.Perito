import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Calendar, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import logo_mundial from '@/assets/logo_mundial.svg';

const Landing = ({ 
    inspectionOrder, 
    existingAppointment, 
    isWithinBusinessHours, 
    startingInspection, 
    onStartInspection, 
    onGoToExistingInspection 
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
                                    Inspección de Asegurabilidad
                                </CardTitle>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Mensaje de bienvenida */}
                        <div className="text-center bg-blue-50 p-4 rounded-lg">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                ¡Hola {inspectionOrder.nombre_contacto}!
                            </h2>
                            <p className="text-gray-700">
                                Estás a punto de iniciar la inspección de asegurabilidad de la placa: 
                                <span className="font-bold text-blue-600 ml-1">
                                    {inspectionOrder.placa}
                                </span>
                            </p>
                        </div>

                        <Separator />

                        {/* Agendamiento existente - solo mostrar si NO está en estado final */}
                        {existingAppointment && inspectionOrder.show_start_button === false && (
                            <>
                                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                    <div className="flex items-center mb-3">
                                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                        <h3 className="text-lg font-semibold text-green-800">
                                            ¡Un inspector te esta esperando!
                                        </h3>
                                    </div>
                                    <div className="mt-4">
                                        <Button 
                                            onClick={onGoToExistingInspection}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                                            size="lg"
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Ir a la Inspección
                                        </Button>
                                    </div>
                                </div>
                                <Separator />
                            </>
                        )}

                        {/* Horario de atención */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <Calendar className="h-5 w-5 mr-2" />
                                Horario de Atención
                            </h3>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <strong>Lunes a viernes:</strong> 8:00 AM - 4:00 PM<br />
                                    <strong>Sábados:</strong> 8:00 AM - 12:00 PM<br />
                                </p>
                            </div>
                        </div>                        

                        {/* Mensaje fuera de horario */}
                        {!isWithinBusinessHours && (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                                    <h3 className="text-lg font-semibold text-red-800">
                                        Fuera del Horario de Atención
                                    </h3>
                                </div>
                                <p className="text-sm text-red-700">
                                    Ten en cuenta el horario de atención para ingresar al proceso de inspección.
                                </p>
                            </div>
                        )}

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
                                </ul>
                            </div>
                        </div>

                        {/* Botón de inicio - mostrar si no hay agendamiento o si está en estado final */}
                        {(!existingAppointment || inspectionOrder.show_start_button === true) && (
                            <div className="text-center pt-4">
                                <Button 
                                    onClick={onStartInspection}
                                    disabled={startingInspection || !isWithinBusinessHours}
                                    className={`w-full py-3 text-lg font-semibold ${
                                        !isWithinBusinessHours 
                                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                    size="lg"
                                >
                                    {startingInspection ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Iniciando Inspección...
                                        </>
                                    ) : !isWithinBusinessHours ? (
                                        'Fuera del Horario de Atención'
                                    ) : (
                                        'Iniciar Inspección'
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Landing;
