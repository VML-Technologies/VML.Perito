import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { MessageCircle, User, Settings } from 'lucide-react';
import CommentSection from '../components/CommentSection';
import ContactDataEditor from '../components/ContactDataEditor';
import OrderCommunicationSection from '../components/OrderCommunicationSection';

const CommentExample = () => {
    const [orderId, setOrderId] = useState('1');
    const [showFullSection, setShowFullSection] = useState(false);

    // Datos de ejemplo para la orden
    const exampleOrderData = {
        id: orderId,
        numero: 'ORD-001',
        nombre_contacto: 'Juan Pérez',
        celular_contacto: '3001234567',
        correo_contacto: 'juan.perez@email.com',
        placa: 'ABC123',
        marca: 'Toyota',
        linea: 'Corolla',
        modelo: '2023'
    };

    // Permisos de ejemplo
    const examplePermissions = [
        'inspection_orders.read',
        'inspection_orders.update',
        'inspection_orders.create'
    ];

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Ejemplo de Sistema de Comentarios</h1>
                <p className="text-gray-600 mb-6">
                    Demostración de los componentes de comentarios y edición de datos de contacto
                </p>
            </div>

            {/* Configuración */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Configuración de Ejemplo
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="orderId">ID de Orden</Label>
                            <Input
                                id="orderId"
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="Ej: 1"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={() => setShowFullSection(!showFullSection)}
                                variant={showFullSection ? "outline" : "default"}
                                className="w-full"
                            >
                                {showFullSection ? "Mostrar Componentes Separados" : "Mostrar Sección Completa"}
                            </Button>
                        </div>
                        <div className="flex items-end">
                            <Badge variant="outline" className="w-full justify-center">
                                Permisos: {examplePermissions.length}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Información de la Orden */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                        <User className="h-5 w-5" />
                        Datos de la Orden de Ejemplo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-blue-800">Orden:</span>
                            <p className="text-blue-700">{exampleOrderData.numero}</p>
                        </div>
                        <div>
                            <span className="font-medium text-blue-800">Contacto:</span>
                            <p className="text-blue-700">{exampleOrderData.nombre_contacto}</p>
                        </div>
                        <div>
                            <span className="font-medium text-blue-800">Teléfono:</span>
                            <p className="text-blue-700">{exampleOrderData.celular_contacto}</p>
                        </div>
                        <div>
                            <span className="font-medium text-blue-800">Vehículo:</span>
                            <p className="text-blue-700">{exampleOrderData.marca} {exampleOrderData.linea}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Componentes */}
            {showFullSection ? (
                // Sección completa con tabs
                <OrderCommunicationSection
                    orderId={orderId}
                    orderData={exampleOrderData}
                    userPermissions={examplePermissions}
                />
            ) : (
                // Componentes separados
                <div className="space-y-8">
                    {/* Sección de Comentarios */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            <MessageCircle className="h-6 w-6" />
                            Sistema de Comentarios
                        </h2>
                        <CommentSection orderId={orderId} />
                    </div>

                    {/* Editor de Datos de Contacto */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            <User className="h-6 w-6" />
                            Editor de Datos de Contacto
                        </h2>
                        <ContactDataEditor
                            orderId={orderId}
                            initialData={exampleOrderData}
                            onDataUpdated={(updatedData) => {
                                console.log('Datos actualizados:', updatedData);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Información adicional */}
            <Card className="bg-green-50 border-green-200">
                <CardHeader>
                    <CardTitle className="text-green-900">Características del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-medium text-green-800 mb-2">Comentarios:</h4>
                            <ul className="text-green-700 space-y-1">
                                <li>• Creación de comentarios con validación</li>
                                <li>• Límite de 1000 caracteres</li>
                                <li>• Comentarios inmutables (no se pueden editar)</li>
                                <li>• Historial completo con paginación</li>
                                <li>• Información del autor y fecha</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-green-800 mb-2">Datos de Contacto:</h4>
                            <ul className="text-green-700 space-y-1">
                                <li>• Edición de nombre, teléfono y email</li>
                                <li>• Validación de formato de email</li>
                                <li>• Validación de teléfono (10 dígitos)</li>
                                <li>• Historial de cambios automático</li>
                                <li>• Auditoría completa de modificaciones</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CommentExample;
