import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { MessageCircle, User, History } from 'lucide-react';
import CommentSection from './CommentSection';
import ContactDataEditor from './ContactDataEditor';
import { useComments } from '../hooks/use-comments';
import { useContactHistory } from '../hooks/use-comments';
import { canCreateComments, canViewComments, canEditContactData } from '../lib/permission-utils';

const OrderCommunicationSection = ({ orderId, orderData, user }) => {
    const [activeTab, setActiveTab] = useState('comments');
    const [orderDataState, setOrderDataState] = useState(orderData);
    
    const { comments } = useComments(orderId);
    const { contactHistory } = useContactHistory(orderId);

    const canCreateCommentsPermission = canCreateComments(user);
    const canViewCommentsPermission = canViewComments(user);
    const canEditContactPermission = canEditContactData(user);

    const handleContactDataUpdated = (updatedOrder) => {
        setOrderDataState(updatedOrder);
    };

    if (!user) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Usuario no autenticado</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!canViewCommentsPermission) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No tienes permisos para ver las comunicaciones</p>
                        <p className="text-xs mt-2">Usuario: {user.name} | Roles: {user.roles?.map(r => r.name).join(', ') || 'Sin roles'}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Gestión de Comunicaciones
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="comments" className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                Comentarios
                                <Badge variant="secondary" className="ml-1">
                                    {comments.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="contact" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Datos de Contacto
                                {contactHistory.length > 0 && (
                                    <Badge variant="outline" className="ml-1">
                                        {contactHistory.length} cambios
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="comments" className="mt-6">
                            <CommentSection orderId={orderId} />
                        </TabsContent>

                        <TabsContent value="contact" className="mt-6">
                            <div className="space-y-6">
                                {/* Editor de datos de contacto */}
                                {canEditContactPermission ? (
                                    <ContactDataEditor 
                                        orderId={orderId}
                                        initialData={orderDataState}
                                        onDataUpdated={handleContactDataUpdated}
                                    />
                                ) : (
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="text-center text-gray-500">
                                                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                                <p>No tienes permisos para editar los datos de contacto</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Información adicional */}
                                <Card className="bg-blue-50 border-blue-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <History className="h-5 w-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-blue-900 mb-2">
                                                    Sistema de Auditoría
                                                </h4>
                                                <ul className="text-sm text-blue-800 space-y-1">
                                                    <li>• Todos los cambios se registran automáticamente</li>
                                                    <li>• Los comentarios son inmutables una vez creados</li>
                                                    <li>• Historial completo disponible para auditoría</li>
                                                    <li>• Trazabilidad de autor y fecha en cada cambio</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default OrderCommunicationSection;
