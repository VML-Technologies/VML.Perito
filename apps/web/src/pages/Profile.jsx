import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useNotificationContext } from '@/contexts/notification-context';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    User,
    Mail,
    Phone,
    Shield,
    Edit,
    Save,
    X,
    Key,
    Eye,
    EyeOff,
    ChevronDown,
    ArrowLeft
} from 'lucide-react';
import { API_ROUTES } from '@/config/api';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import PasswordValidationErrors from '@/components/PasswordValidationErrors';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const { showToast } = useNotificationContext();
    const location = useLocation();
    const navigate = useNavigate();
    // Estados para edición de perfil
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    // Actualizar formData cuando el usuario cambie
    useEffect(() => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || ''
        });
    }, [user]);

    // Estados para cambio de contraseña
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');

    // Detectar hash para abrir automáticamente la sección de cambio de contraseña
    useEffect(() => {
        if (location.hash == '#changePassword') {
            setActiveTab('security');
            setIsPasswordOpen(true);
            // Limpiar el hash de la URL después de un breve delay
            setTimeout(() => {
                window.history.replaceState(null, '', location.pathname);
            }, 100);
        }
    }, [location.hash, location.pathname]);
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

    // Estados de carga
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordValidationErrors, setPasswordValidationErrors] = useState([]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpiar errores cuando el usuario empiece a escribir en cualquier campo
        if (passwordValidationErrors.length > 0) {
            setPasswordValidationErrors([]);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_ROUTES.USERS.LIST}/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                updateUser(updatedUser);
                showToast('Perfil actualizado correctamente', 'success');
                setIsEditing(false);
            } else {
                const error = await response.json();
                showToast(error.message || 'Error al actualizar perfil', 'error');
            }
        } catch (error) {
            showToast('Error al actualizar perfil', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || ''
        });
        setIsEditing(false);
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Las contraseñas nuevas no coinciden', 'error');
            return;
        }

        setChangingPassword(true);
        setPasswordValidationErrors([]);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.AUTH.CHANGE_PASSWORD, {
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
                showToast('Contraseña cambiada correctamente', 'success');
                setIsPasswordOpen(false);
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setPasswordValidationErrors([]);
            } else {
                const error = await response.json();
                if (error.errors && Array.isArray(error.errors)) {
                    // Mostrar errores de validación en el componente
                    setPasswordValidationErrors(error.errors);
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

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="container mx-auto p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Mi Perfil</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Gestiona tu información personal</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={() => {
                        navigate('/dashboard');
                    }} className="w-full sm:w-auto">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Regresar
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="personal">Información Personal</TabsTrigger>
                    <TabsTrigger value="security">Seguridad</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-6">
                    {/* Información Básica */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Información Básica
                            </CardTitle>
                            <CardDescription>
                                Tu información personal y de contacto
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Avatar y Nombre */}
                            <div className="flex items-center gap-6">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={user?.avatar} alt={user?.name} />
                                    <AvatarFallback className="text-lg">
                                        {getInitials(user?.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <Label htmlFor="name">Nombre Completo</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        disabled={!isEditing}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Información de Contacto */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Correo Electrónico
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        disabled={!isEditing}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone" className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Teléfono
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        disabled={!isEditing}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información del Sistema */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Información del Sistema
                            </CardTitle>
                            <CardDescription>
                                Detalles de tu cuenta y permisos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>ID de Usuario</Label>
                                    <Input value={user?.id || 'N/A'} disabled className="mt-1" />
                                </div>
                                <div>
                                    <Label>Estado de la Cuenta</Label>
                                    <div className="mt-1">
                                        <Badge variant={user?.is_active ? "default" : "secondary"}>
                                            {user?.is_active ? 'Activa' : 'Inactiva'}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label>Fecha de Registro</Label>
                                    <Input
                                        value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                        disabled
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>Roles Asignados</Label>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {user?.roles?.map(role => (
                                            <Badge key={role.id} variant="outline">
                                                {role.name}
                                            </Badge>
                                        )) || <Badge variant="outline">Usuario</Badge>}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5" />
                                Seguridad de la Cuenta
                            </CardTitle>
                            <CardDescription>
                                Gestiona la seguridad de tu cuenta
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Información sobre políticas de contraseña */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="text-sm text-blue-700">
                                    <strong>Políticas de Seguridad:</strong> Tu nueva contraseña debe cumplir con los siguientes requisitos:
                                    <ul className="mt-2 space-y-1 text-xs">
                                        <li>• Mínimo 8 caracteres, máximo 128</li>
                                        <li>• Al menos una letra mayúscula y una minúscula</li>
                                        <li>• Al menos un número</li>
                                        <li>• Al menos un carácter especial</li>
                                        <li>• No puede ser una contraseña común</li>
                                        <li>• No puede contener caracteres secuenciales o repetidos</li>
                                    </ul>
                                </div>
                            </div>

                            <Collapsible open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
                                <CollapsibleTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between">
                                        <div className="flex items-center gap-2">
                                            <Key className="h-4 w-4" />
                                            <span>Cambiar Contraseña</span>
                                        </div>
                                        <ChevronDown className={`h-4 w-4 transition-transform ${isPasswordOpen ? 'rotate-180' : ''}`} />
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-4 pt-4">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="currentPassword">Contraseña Actual</Label>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="currentPassword"
                                                    type={showPasswords.current ? "text" : "password"}
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                                    placeholder="Ingresa tu contraseña actual"
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
                                            <Label htmlFor="newPassword">Nueva Contraseña</Label>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="newPassword"
                                                    type={showPasswords.new ? "text" : "password"}
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                                    placeholder="Ingresa la nueva contraseña"
                                                    className={passwordValidationErrors.length > 0 ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
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

                                            {/* Mostrar errores de validación */}
                                            <PasswordValidationErrors errors={passwordValidationErrors} />
                                        </div>

                                        <div>
                                            <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="confirmPassword"
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                                    placeholder="Confirma la nueva contraseña"
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

                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setIsPasswordOpen(false);
                                                    setPasswordData({
                                                        currentPassword: '',
                                                        newPassword: '',
                                                        confirmPassword: ''
                                                    });
                                                }}
                                                className="flex-1"
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                onClick={handleChangePassword}
                                                disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                                className="flex-1"
                                            >
                                                {changingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                                            </Button>
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 