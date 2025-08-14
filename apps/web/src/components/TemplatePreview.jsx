import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Eye,
    Mail,
    MessageSquare,
    Smartphone,
    Bell,
    RefreshCw
} from 'lucide-react';

const TemplatePreview = ({ template, className = '' }) => {
    const [previewData, setPreviewData] = useState({});
    const [activeChannel, setActiveChannel] = useState('email');

    // Datos de ejemplo para el preview
    const sampleData = {
        user: {
            id: 123,
            name: 'Juan Pérez',
            email: 'juan.perez@ejemplo.com',
            phone: '+57 300 123 4567',
            role: 'Cliente',
            department: 'Comercial'
        },
        inspection_order: {
            id: 'IO-2025-001',
            numero: '2025-001',
            status: 'Programada',
            modality: 'Domicilio',
            created_at: '2025-07-31',
            scheduled_date: '2025-08-15',
            vehicle_type: 'Automóvil',
            vehicle_plate: 'ABC123'
        },
        appointment: {
            id: 456,
            date: '15 de Agosto, 2025',
            time: '10:00 AM',
            duration: '45 minutos',
            status: 'Confirmada',
            notes: 'Llegar 15 minutos antes'
        },
        company: {
            name: 'VML Perito',
            address: 'Calle 123 #45-67, Bogotá',
            phone: '+57 1 234 5678',
            email: 'contacto@vmltechnologies.com'
        },
        sede: {
            name: 'Sede Principal',
            address: 'Carrera 15 #93-47, Bogotá',
            phone: '+57 1 987 6543',
            type: 'CDA'
        }
    };

    // Función para renderizar variables en el texto
    const renderTemplate = (templateText) => {
        if (!templateText) return '';

        return templateText.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
            const value = getNestedValue(sampleData, variable);
            return value !== undefined ? value : match;
        });
    };

    // Función para obtener valor anidado
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    };

    // Generar preview cuando cambie la plantilla
    useEffect(() => {
        setPreviewData(sampleData);
    }, [template]);

    const channels = [
        { id: 'email', name: 'Email', icon: <Mail className="h-4 w-4" /> },
        { id: 'sms', name: 'SMS', icon: <MessageSquare className="h-4 w-4" /> },
        { id: 'whatsapp', name: 'WhatsApp', icon: <Smartphone className="h-4 w-4" /> },
        { id: 'in_app', name: 'In-App', icon: <Bell className="h-4 w-4" /> }
    ];

    const getChannelPreview = (channelId) => {
        const channelData = template.channels?.[channelId];

        if (!channelData) {
            return {
                title: 'No configurado',
                content: 'Este canal no está configurado para esta plantilla.'
            };
        }

        let result;
        switch (channelId) {
            case 'email':
                result = {
                    title: renderTemplate(channelData.subject || 'Sin asunto'),
                    content: renderTemplate(channelData.body || channelData.template || '')
                };
                break;
            case 'sms':
                result = {
                    title: 'SMS',
                    content: renderTemplate(channelData.message || channelData.template || '')
                };
                break;
            case 'whatsapp':
                result = {
                    title: 'WhatsApp',
                    content: renderTemplate(channelData.message || channelData.template || '')
                };
                break;
            case 'in_app':
                result = {
                    title: renderTemplate(channelData.title || 'Notificación'),
                    content: renderTemplate(channelData.message || channelData.template || '')
                };
                break;
            default:
                result = { title: '', content: '' };
        }

        return result;
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Preview en Tiempo Real
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <Tabs value={activeChannel} onValueChange={setActiveChannel}>
                        <TabsList className="grid w-full grid-cols-4">
                            {channels.map((channel) => {
                                const channelData = template.channels?.[channel.id];
                                const hasConfig = channelData && (
                                    (channel.id == 'email' && (channelData.body || channelData.template)) ||
                                    (channel.id == 'sms' && (channelData.message || channelData.template)) ||
                                    (channel.id == 'whatsapp' && (channelData.message || channelData.template)) ||
                                    (channel.id == 'in_app' && (channelData.message || channelData.template))
                                );
                                return (
                                    <TabsTrigger
                                        key={channel.id}
                                        value={channel.id}
                                        className="flex items-center gap-1 text-xs"
                                        disabled={!hasConfig}
                                    >
                                        {channel.icon}
                                        <span className="hidden sm:inline">{channel.name}</span>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        {channels.map((channel) => {
                            const preview = getChannelPreview(channel.id);
                            return (
                                <TabsContent key={channel.id} value={channel.id} className="mt-3">
                                    <div className="space-y-3">
                                        {/* Datos de ejemplo */}
                                        <div className="bg-muted p-2 rounded-md">
                                            <h4 className="font-medium text-xs mb-1">Datos de ejemplo:</h4>
                                            <div className="text-xs space-y-0.5">
                                                <div><strong>Usuario:</strong> {sampleData.user.name} ({sampleData.user.email})</div>
                                                <div><strong>Cita:</strong> {sampleData.appointment.date} a las {sampleData.appointment.time}</div>
                                                <div><strong>Sede:</strong> {sampleData.sede.name}</div>
                                            </div>
                                        </div>

                                        {/* Preview del canal */}
                                        <div className="border rounded-lg p-3 bg-background">
                                            <div className="space-y-2">
                                                {channel.id == 'email' && (
                                                    <div className="border-b pb-2">
                                                        <div className="text-xs text-muted-foreground">Asunto:</div>
                                                        <div className="font-medium text-sm">{preview.title}</div>
                                                    </div>
                                                )}

                                                <div>
                                                    <div className="text-xs text-muted-foreground mb-1">Contenido:</div>
                                                    <div className="whitespace-pre-wrap text-xs max-h-32 overflow-y-auto">
                                                        {channel.id == 'email' ? (
                                                            <div dangerouslySetInnerHTML={{ __html: preview.content }} />
                                                        ) : (
                                                            preview.content
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Información del canal */}
                                        <div className="text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <RefreshCw className="h-3 w-3" />
                                                Preview actualizado automáticamente
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            );
                        })}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default TemplatePreview;