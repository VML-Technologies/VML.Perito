import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { User, Phone, Mail, Save, AlertCircle, History, CheckCircle, MessageSquare, Mail as MailIcon } from 'lucide-react';
import { useContactHistory } from '../hooks/use-comments';
import { useNotificationContext } from '../contexts/notification-context';
import { API_ROUTES } from '../config/api';

const ContactDataEditor = ({ orderId, initialData, onDataUpdated }) => {
    const [formData, setFormData] = useState({
        nombre_contacto: '',
        celular_contacto: '',
        correo_contacto: ''
    });
    const [originalData, setOriginalData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [isResendingSMS, setIsResendingSMS] = useState(false);
    const [smsCountdown, setSmsCountdown] = useState(0);
    const [isResendingEmail, setIsResendingEmail] = useState(false);
    const [emailCountdown, setEmailCountdown] = useState(0);
    const { contactHistory, loading: historyLoading, fetchContactHistory, updateContactData } = useContactHistory(orderId);
    const { showToast } = useNotificationContext();

    useEffect(() => {
        if (initialData) {
            const data = {
                nombre_contacto: initialData.nombre_contacto || '',
                celular_contacto: initialData.celular_contacto || '',
                correo_contacto: initialData.correo_contacto || ''
            };
            setFormData(data);
            setOriginalData(data);
        }
    }, [initialData]);

    useEffect(() => {
        const changed = 
            formData.nombre_contacto !== originalData.nombre_contacto ||
            formData.celular_contacto !== originalData.celular_contacto ||
            formData.correo_contacto !== originalData.correo_contacto;
        setHasChanges(changed);
    }, [formData, originalData]);

    const validateForm = () => {
        // Validar nombre
        if (!formData.nombre_contacto.trim()) {
            setError('El nombre del contacto es obligatorio');
            return false;
        }
        if (formData.nombre_contacto.trim().length < 2) {
            setError('El nombre del contacto debe tener al menos 2 caracteres');
            return false;
        }
        if (formData.nombre_contacto.length > 100) {
            setError('El nombre del contacto no puede exceder 100 caracteres');
            return false;
        }

        // Validar celular (10 dígitos sin código de país)
        const phoneRegex = /^\d{10}$/;
        if (!formData.celular_contacto) {
            setError('El celular del contacto es obligatorio');
            return false;
        }
        if (!phoneRegex.test(formData.celular_contacto)) {
            setError('El celular debe tener exactamente 10 dígitos numéricos (sin código de país)');
            return false;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.correo_contacto) {
            setError('El correo electrónico es obligatorio');
            return false;
        }
        if (!emailRegex.test(formData.correo_contacto)) {
            setError('El formato del correo electrónico no es válido');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const contactData = {
                nombre_contacto: formData.nombre_contacto.trim(),
                celular_contacto: formData.celular_contacto,
                correo_contacto: formData.correo_contacto.trim()
            };

            const updatedData = await updateContactData(contactData);

            if (updatedData) {
                setOriginalData(formData);
                setHasChanges(false);
                
                showToast('Los datos de contacto se han actualizado exitosamente', 'success');

                if (onDataUpdated) {
                    onDataUpdated(updatedData);
                }
            }
        } catch (error) {
            console.error('Error actualizando datos de contacto:', error);
            setError(error.message || 'Error de conexión. Intente nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError(''); // Limpiar errores al escribir
    };

    const handlePhoneChange = (value) => {
        // Solo permitir números y máximo 10 dígitos
        const numericValue = value.replace(/\D/g, '').slice(0, 10);
        handleInputChange('celular_contacto', numericValue);
    };

    const toggleHistory = () => {
        if (!showHistory) {
            fetchContactHistory(5);
        }
        setShowHistory(!showHistory);
    };

    const handleResendSMS = async () => {
        if (!orderId) {
            showToast('No se puede reenviar SMS: ID de orden no disponible', 'error');
            return;
        }

        setIsResendingSMS(true);
        setError('');

        try {
            const response = await fetch(API_ROUTES.INSPECTION_ORDERS.RESEND_SMS(orderId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showToast('SMS reenviado exitosamente', 'success');
                setSmsCountdown(30); // Iniciar countdown de 30 segundos
            } else {
                throw new Error(result.message || 'Error reenviando SMS');
            }
        } catch (error) {
            console.error('Error reenviando SMS:', error);
            showToast(error.message || 'Error de conexión. Intente nuevamente.', 'error');
        } finally {
            setIsResendingSMS(false);
        }
    };

    const handleResendEmail = async () => {
        if (!orderId) {
            showToast('No se puede reenviar email: ID de orden no disponible', 'error');
            return;
        }

        setIsResendingEmail(true);
        setError('');

        try {
            const response = await fetch(API_ROUTES.INSPECTION_ORDERS.RESEND_SMS(orderId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Verificar si se envió email
                if (result.data.email_sent) {
                    showToast('Email reenviado exitosamente', 'success');
                    setEmailCountdown(30); // Iniciar countdown de 30 segundos
                } else {
                    showToast('SMS reenviado, pero no se pudo enviar email (sin correo de contacto)', 'warning');
                }
            } else {
                throw new Error(result.message || 'Error reenviando email');
            }
        } catch (error) {
            console.error('Error reenviando email:', error);
            showToast(error.message || 'Error de conexión. Intente nuevamente.', 'error');
        } finally {
            setIsResendingEmail(false);
        }
    };

    // Cargar historial inicial cuando se muestra
    useEffect(() => {
        if (showHistory && contactHistory.length === 0) {
            fetchContactHistory(5);
        }
    }, [showHistory, contactHistory.length, fetchContactHistory]);

    // Manejar countdown del SMS
    useEffect(() => {
        let interval;
        if (smsCountdown > 0) {
            interval = setInterval(() => {
                setSmsCountdown((prev) => {
                    if (prev <= 1) {
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [smsCountdown]);

    // Manejar countdown del Email
    useEffect(() => {
        let interval;
        if (emailCountdown > 0) {
            interval = setInterval(() => {
                setEmailCountdown((prev) => {
                    if (prev <= 1) {
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [emailCountdown]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Datos de Contacto
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleResendSMS}
                                        disabled={isResendingSMS || !formData.celular_contacto || smsCountdown > 0}
                                        className="flex items-center gap-1"
                                    >
                                        {isResendingSMS ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                                                Enviando...
                                            </>
                                        ) : smsCountdown > 0 ? (
                                            <>
                                                <MessageSquare className="h-4 w-4" />
                                                Reenviar SMS ({smsCountdown}s)
                                            </>
                                        ) : (
                                            <>
                                                <MessageSquare className="h-4 w-4" />
                                                Reenviar SMS
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Aplica solo para inspecciones virtuales</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleResendEmail}
                                        disabled={isResendingEmail || !formData.correo_contacto || emailCountdown > 0}
                                        className="flex items-center gap-1"
                                    >
                                        {isResendingEmail ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                                                Enviando...
                                            </>
                                        ) : emailCountdown > 0 ? (
                                            <>
                                                <MailIcon className="h-4 w-4" />
                                                Reenviar Email ({emailCountdown}s)
                                            </>
                                        ) : (
                                            <>
                                                <MailIcon className="h-4 w-4" />
                                                Reenviar Email
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Reenvía el link de inspección por email</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleHistory}
                            className="flex items-center gap-1"
                        >
                            <History className="h-4 w-4" />
                            Historial
                        </Button>
                        {hasChanges && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Cambios pendientes
                            </Badge>
                        )}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-red-800">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Historial de cambios */}
                    {showHistory && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium flex items-center gap-2">
                                    <History className="h-4 w-4" />
                                    Historial de Cambios
                                    {contactHistory.length > 0 && (
                                        <Badge variant="secondary" className="ml-2">
                                            {contactHistory.length} cambios
                                        </Badge>
                                    )}
                                </h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => fetchContactHistory(5)}
                                    disabled={historyLoading}
                                    className="h-6 px-2 text-xs"
                                >
                                    {historyLoading ? (
                                        <div className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-blue-600" />
                                    ) : (
                                        'Actualizar'
                                    )}
                                </Button>
                            </div>
                            {historyLoading ? (
                                <div className="text-center py-4">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 mx-auto mb-2" />
                                    <p className="text-gray-500">Cargando historial...</p>
                                </div>
                            ) : contactHistory.length > 0 ? (
                                <div className="space-y-2">
                                    {contactHistory.map((history, index) => (
                                        <div key={history.id} className="text-sm p-3 bg-white rounded border hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User className="h-3 w-3 text-gray-500" />
                                                        <strong className="text-gray-900">{history.nombre_contacto}</strong>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {history.celular_contacto}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {history.correo_contacto}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500 text-right">
                                                    <div>{formatDate(history.created_at)}</div>
                                                    {history.user && (
                                                        <div className="text-gray-400">
                                                            por {history.user.name || history.user.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    <History className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                    <p>No hay cambios registrados</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nombre */}
                        <div className="space-y-2">
                            <Label htmlFor="nombre_contacto" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Nombre del Contacto *
                            </Label>
                            <Input
                                id="nombre_contacto"
                                type="text"
                                value={formData.nombre_contacto}
                                onChange={(e) => handleInputChange('nombre_contacto', e.target.value)}
                                placeholder="Nombre completo"
                                maxLength={100}
                                disabled={isSubmitting}
                                className={formData.nombre_contacto !== originalData.nombre_contacto ? 'border-blue-300 bg-blue-50' : ''}
                            />
                            <div className="text-xs text-gray-500">
                                {formData.nombre_contacto.length}/100 caracteres
                            </div>
                        </div>

                        {/* Celular */}
                        <div className="space-y-2">
                            <Label htmlFor="celular_contacto" className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Celular *
                            </Label>
                            <Input
                                id="celular_contacto"
                                type="tel"
                                value={formData.celular_contacto}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                placeholder="3001234567"
                                maxLength={10}
                                disabled={isSubmitting}
                                className={formData.celular_contacto !== originalData.celular_contacto ? 'border-blue-300 bg-blue-50' : ''}
                            />
                            <div className="text-xs text-gray-500">
                                10 dígitos sin código de país
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="correo_contacto" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Correo Electrónico *
                        </Label>
                        <Input
                            id="correo_contacto"
                            type="email"
                            value={formData.correo_contacto}
                            onChange={(e) => handleInputChange('correo_contacto', e.target.value)}
                            placeholder="contacto@ejemplo.com"
                            maxLength={150}
                            disabled={isSubmitting}
                            className={formData.correo_contacto !== originalData.correo_contacto ? 'border-blue-300 bg-blue-50' : ''}
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-gray-500">
                            Los cambios se registrarán en el historial automáticamente
                        </div>
                        
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setFormData(originalData);
                                    setError('');
                                }}
                                disabled={isSubmitting || !hasChanges}
                            >
                                Cancelar
                            </Button>
                            
                            <Button
                                type="submit"
                                disabled={isSubmitting || !hasChanges}
                                className="flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Guardar Cambios
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default ContactDataEditor;
