import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Car, User, Phone, Mail, Calendar, MapPin, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { API_ROUTES } from '@/config/api';
import logo_mundial from '@/assets/logo_mundial.svg';

const Inspeccion = () => {
    const { hash } = useParams();
    const navigate = useNavigate();
    const { showToast } = useNotifications();
    
    const [inspectionOrder, setInspectionOrder] = useState(null);
    const [existingAppointment, setExistingAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startingInspection, setStartingInspection] = useState(false);
    const [isWithinBusinessHours, setIsWithinBusinessHours] = useState(true);

    useEffect(() => {
        fetchInspectionOrder();
        checkBusinessHours();
    }, [hash]);

    const checkBusinessHours = () => {
        // Crear fecha actual en zona horaria de Bogotá (UTC-5)
        const now = new Date();
        const bogotaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Bogota"}));
        
        const dayOfWeek = bogotaTime.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
        const hour = bogotaTime.getHours();
        const minute = bogotaTime.getMinutes();
        const currentTime = hour * 60 + minute; // Convertir a minutos para facilitar comparación
        
        let isWithinHours = false;
        
        // Lunes a viernes (1-5): 8:00 AM - 4:00 PM
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const startTime = 8 * 60; // 8:00 AM en minutos
            const endTime = 16 * 60; // 4:00 PM en minutos
            isWithinHours = currentTime >= startTime && currentTime <= endTime;
        }
        // Sábados (6): 8:00 AM - 12:00 PM
        else if (dayOfWeek === 6) {
            const startTime = 8 * 60; // 8:00 AM en minutos
            const endTime = 12 * 60; // 12:00 PM en minutos
            isWithinHours = currentTime >= startTime && currentTime <= endTime;
        }
        // Domingos: cerrado
        
        setIsWithinBusinessHours(isWithinHours);
    };

    const fetchInspectionOrder = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_ROUTES.INSPECTION_ORDERS.ORDER_BY_HASH(hash)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Orden de inspección no encontrada');
            }

            const data = await response.json();
            setInspectionOrder(data.data);
            
            // Verificar si ya existe un agendamiento para esta orden
            if (data.data.appointment) {
                setExistingAppointment(data.data.appointment);
            }
        } catch (error) {
            console.error('Error fetching inspection order:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStartInspection = async () => {
        try {
            setStartingInspection(true);
            
            // Agregar a la cola de inspecciones
            const queueResponse = await fetch(API_ROUTES.INSPECTION_QUEUE.ADD_TO_QUEUE_PUBLIC, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inspection_order_id: inspectionOrder.id,
                    hash_acceso: hash
                })
            });

            if (!queueResponse.ok) {
                const errorData = await queueResponse.json();
                throw new Error(errorData.message || 'Error al agregar a la cola de inspecciones');
            }

            const responseData = await queueResponse.json();
            
            if (responseData.tiempo_en_cola !== undefined) {
                showToast(`Ya estabas en la cola desde hace ${responseData.tiempo_en_cola} minutos. Continuando con tu posición actual.`, 'info');
            } else {
                showToast('Has sido agregado a la cola de inspecciones. Un inspector te atenderá pronto.', 'success');
            }
            
            // Redirigir a una página de espera
            navigate(`/espera/inspeccion/${hash}`);
        } catch (error) {
            console.error('Error starting inspection:', error);
            showToast(error.message || 'Error al iniciar la inspección', 'error');
        } finally {
            setStartingInspection(false);
        }
    };

    const handleGoToExistingInspection = () => {
        if (existingAppointment && existingAppointment.session_id) {
            const base = (import.meta.env.VITE_INSPECTYA_URL || '').replace(/\/$/, '') || window.location.origin;
            const inspectionUrl = `${base}/inspection/${existingAppointment.session_id}`;
            window.open(inspectionUrl, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Cargando información de inspección...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Alert className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!inspectionOrder) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Alert className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        No se encontró la orden de inspección
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

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
                                            onClick={handleGoToExistingInspection}
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
                                    onClick={handleStartInspection}
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

export default Inspeccion;
