import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, AlertTriangle, Shield, ArrowLeft } from 'lucide-react';
import { API_ROUTES } from '@/config/api';
import { useAuth } from '@/contexts/auth-context';
import { useNotificationContext } from '@/contexts/notification-context';
import { useNavigate } from 'react-router-dom';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import PasswordValidationErrors from '@/components/PasswordValidationErrors';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const ForcedPasswordChange = () => {
    const { user, updateUser } = useAuth();
    const { showToast } = useNotificationContext();
    const navigate = useNavigate();

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [changingPassword, setChangingPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);

    // Verificar si el usuario tiene contraseña temporal
    useEffect(() => {
        if (!user?.temporary_password) {
            // Si no tiene contraseña temporal, redirigir al dashboard
            navigate('/dashboard');
        }
    }, [user?.temporary_password, navigate]);

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpiar errores cuando el usuario empiece a escribir
        if (field === 'newPassword' && validationErrors.length > 0) {
            setValidationErrors([]);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Las contraseñas nuevas no coinciden', 'error');
            return;
        }

        setChangingPassword(true);
        setValidationErrors([]);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.AUTH.CHANGE_TEMPORARY_PASSWORD, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (response.ok) {
                const result = await response.json();
                updateUser(result.user);
                showToast('Contraseña cambiada exitosamente. Ya puedes usar la aplicación normalmente.', 'success');
                // Redirigir al dashboard después del cambio exitoso
                navigate('/dashboard');
            } else {
                const error = await response.json();
                if (error.errors && Array.isArray(error.errors)) {
                    // Mostrar errores de validación en el componente
                    setValidationErrors(error.errors);
                    showToast('Por favor, corrige los errores en la nueva contraseña', 'error');
                } else {
                    showToast(error.message || 'Error al cambiar contraseña', 'error');
                }
            }
        } catch (error) {
            showToast('Error al cambiar contraseña', 'error');
        } finally {
            setChangingPassword(false);
        }
    };

    // Si no hay usuario o no tiene contraseña temporal, mostrar loading
    if (!user || !user.temporary_password) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Verificando...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthenticatedLayout>
            <div className="flex items-center justify-center p-2">
                <div className="w-full max-w-md">
                    <Card className="border-2 border-orange-200 shadow-2xl">
                        <CardHeader className="border-b border-orange-200 text-center">
                            <CardTitle className="text-2xl font-bold text-orange-700">
                                Seguridad Requerida
                            </CardTitle>
                            <CardDescription className="text-orange-600 mt-2 text-base">
                                Tu contraseña actual es temporal. Por seguridad, debes cambiarla para continuar usando la aplicación.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-blue-700">
                                        <strong>Importante:</strong> Esta página permanecerá visible hasta que cambies tu contraseña. No podrás acceder a otras partes de la aplicación.
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="currentPassword" className="text-sm font-medium">Contraseña Actual</Label>
                                <div className="relative mt-1">
                                    <Input
                                        id="currentPassword"
                                        type={showPasswords.current ? "text" : "password"}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                        placeholder="Ingresa tu contraseña actual"
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => togglePasswordVisibility('current')}
                                    >
                                        {showPasswords.current ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="newPassword" className="text-sm font-medium">Nueva Contraseña</Label>
                                <div className="relative mt-1">
                                    <Input
                                        id="newPassword"
                                        type={showPasswords.new ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                        placeholder="Ingresa la nueva contraseña"
                                        className={`border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${validationErrors.length > 0 ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                                            }`}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => togglePasswordVisibility('new')}
                                    >
                                        {showPasswords.new ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                {passwordData.newPassword && (
                                    <div className="mt-2">
                                        <PasswordStrengthMeter password={passwordData.newPassword} />
                                    </div>
                                )}
                            </div>

                            {/* Mostrar errores de validación */}
                            <PasswordValidationErrors errors={validationErrors} />

                            <div>
                                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Nueva Contraseña</Label>
                                <div className="relative mt-1">
                                    <Input
                                        id="confirmPassword"
                                        type={showPasswords.confirm ? "text" : "password"}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                        placeholder="Confirma la nueva contraseña"
                                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                    >
                                        {showPasswords.confirm ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    onClick={handleChangePassword}
                                    disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 text-lg"
                                >
                                    {changingPassword ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Cambiando Contraseña...
                                        </div>
                                    ) : (
                                        'Cambiar Contraseña y Continuar'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ForcedPasswordChange; 