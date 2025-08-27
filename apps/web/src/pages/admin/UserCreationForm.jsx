import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Building, Shield, Mail, RefreshCw, AlertCircle } from 'lucide-react';
import { API_ROUTES } from '@/config/api';

export function UserCreationForm({ 
    sedes, 
    availableRoles, 
    onUserCreated, 
    showToast 
}) {
    const [creatingUser, setCreatingUser] = useState(false);
    const [userForm, setUserForm] = useState({
        sede_id: '',
        identification: '',
        name: '',
        email: '',
        phone: '',
        password: '',
        role_id: ''
    });
    const [userFormErrors, setUserFormErrors] = useState({});
    const [validationMessages, setValidationMessages] = useState({});

    // Función para validar identificación
    const validateIdentification = async (identification) => {
        if (!identification) return;
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_ROUTES.USERS.VALIDATE_IDENTIFICATION}?identification=${encodeURIComponent(identification)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const result = await response.json();
            
            if (!result.isValid) {
                setValidationMessages(prev => ({
                    ...prev,
                    identification: {
                        type: 'error',
                        message: result.message,
                        existingUser: result.existingUser
                    }
                }));
                setUserFormErrors(prev => ({ ...prev, identification: result.message }));
            } else {
                setValidationMessages(prev => ({
                    ...prev,
                    identification: {
                        type: 'success',
                        message: 'Identificación disponible'
                    }
                }));
                setUserFormErrors(prev => {
                    const { identification, ...rest } = prev;
                    return rest;
                });
            }
        } catch (error) {
            console.error('Error validando identificación:', error);
        }
    };

    // Función para validar email
    const validateEmail = async (email) => {
        if (!email) return;
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_ROUTES.USERS.VALIDATE_EMAIL}?email=${encodeURIComponent(email)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const result = await response.json();
            
            if (!result.isValid) {
                setValidationMessages(prev => ({
                    ...prev,
                    email: {
                        type: 'error',
                        message: result.message,
                        existingUser: result.existingUser
                    }
                }));
                setUserFormErrors(prev => ({ ...prev, email: result.message }));
            } else {
                setValidationMessages(prev => ({
                    ...prev,
                    email: {
                        type: 'success',
                        message: 'Email disponible'
                    }
                }));
                setUserFormErrors(prev => {
                    const { email, ...rest } = prev;
                    return rest;
                });
            }
        } catch (error) {
            console.error('Error validando email:', error);
        }
    };

    // Función para manejar cambios en el formulario
    const handleUserFormChange = (field, value) => {
        setUserForm(prev => ({ ...prev, [field]: value }));
        
        // Limpiar errores al cambiar
        if (userFormErrors[field]) {
            setUserFormErrors(prev => {
                const { [field]: _, ...rest } = prev;
                return rest;
            });
        }
        
        // Validación en tiempo real para identificación y email
        if (field === 'identification' && value.length >= 3) {
            setTimeout(() => validateIdentification(value), 500);
        } else if (field === 'email' && value.includes('@')) {
            setTimeout(() => validateEmail(value), 500);
        }
    };

    // Función para crear usuario
    const handleCreateUser = async () => {
        setCreatingUser(true);
        setUserFormErrors({});
        
        try {
            // Validaciones básicas
            const errors = {};
            if (!userForm.sede_id) errors.sede_id = 'Selecciona una sede';
            if (!userForm.identification) errors.identification = 'Identificación es requerida';
            if (!userForm.name) errors.name = 'Nombre es requerido';
            if (!userForm.email) errors.email = 'Email es requerido';
            if (!userForm.password) errors.password = 'Contraseña es requerida';
            if (!userForm.role_id) errors.role_id = 'Selecciona un rol';
            
            if (Object.keys(errors).length > 0) {
                setUserFormErrors(errors);
                showToast('Por favor completa todos los campos requeridos', 'error');
                return;
            }

            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.USERS.CREATE_WITH_EMAIL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userForm)
            });

            const result = await response.json();

            if (response.ok) {
                // Asignar rol al usuario recién creado
                try {
                    const roleResponse = await fetch(API_ROUTES.USERS.ASSIGN_ROLES(result.user.id), {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ roles: [parseInt(userForm.role_id)] })
                    });

                    if (roleResponse.ok) {
                        showToast(result.message + ' y rol asignado correctamente', 'success');
                    } else {
                        showToast(result.message + ' pero falló la asignación del rol', 'warning');
                    }
                } catch (roleError) {
                    console.error('Error asignando rol:', roleError);
                    showToast(result.message + ' pero falló la asignación del rol', 'warning');
                }
                
                // Limpiar formulario
                setUserForm({
                    sede_id: '',
                    identification: '',
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    role_id: ''
                });
                setValidationMessages({});
                
                // Notificar al componente padre
                if (onUserCreated) {
                    onUserCreated();
                }
                
            } else {
                if (result.field && result.existingUser) {
                    setUserFormErrors({ [result.field]: result.message });
                    setValidationMessages(prev => ({
                        ...prev,
                        [result.field]: {
                            type: 'error',
                            message: result.message,
                            existingUser: result.existingUser
                        }
                    }));
                }
                showToast(result.message || 'Error al crear usuario', 'error');
            }

        } catch (error) {
            console.error('Error creando usuario:', error);
            showToast('Error de conexión al crear usuario', 'error');
        } finally {
            setCreatingUser(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Crear Nuevo Usuario
                </CardTitle>
                <CardDescription>
                    Crea un nuevo usuario en el sistema. Se enviará un email de bienvenida automáticamente.
                </CardDescription>
            </CardHeader>
            <CardContent>                
                {/* Información adicional */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Configuración por Defecto
                    </h4>
                    <div className="text-sm text-blue-800 space-y-1">
                        <p>• Se marcará como contraseña temporal (debe cambiarla en el primer ingreso)</p>
                        <p>• Se enviará automáticamente un email de bienvenida con las credenciales</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Columna 1 */}
                    <div className="space-y-4">
                        {/* Selector de Sede */}
                        <div>
                            <Label htmlFor="user-sede">Sede *</Label>
                            <Select 
                                value={userForm.sede_id} 
                                onValueChange={(value) => handleUserFormChange('sede_id', value)}
                            >
                                <SelectTrigger className={userFormErrors.sede_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecciona una sede" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sedes.map(sede => (
                                        <SelectItem key={sede.id} value={sede.id.toString()}>
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4" />
                                                <span>{sede.name}</span>
                                                {sede.company && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {sede.company.name}
                                                    </Badge>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {userFormErrors.sede_id && (
                                <p className="text-sm text-red-500 mt-1">{userFormErrors.sede_id}</p>
                            )}
                        </div>

                        {/* Selector de Rol */}
                        <div>
                            <Label htmlFor="user-role">Rol *</Label>
                            <Select 
                                value={userForm.role_id} 
                                onValueChange={(value) => handleUserFormChange('role_id', value)}
                            >
                                <SelectTrigger className={userFormErrors.role_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRoles.map(role => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                <span>{role.name}</span>
                                                {role.description && (
                                                    <span className="text-xs text-muted-foreground">
                                                        - {role.description}
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {userFormErrors.role_id && (
                                <p className="text-sm text-red-500 mt-1">{userFormErrors.role_id}</p>
                            )}
                        </div>

                        {/* Identificación */}
                        <div>
                            <Label htmlFor="user-identification">Identificación *</Label>
                            <Input
                                id="user-identification"
                                value={userForm.identification}
                                onChange={(e) => handleUserFormChange('identification', e.target.value)}
                                placeholder="Número de identificación"
                                className={userFormErrors.identification ? 'border-red-500' : ''}
                            />
                            {validationMessages.identification && (
                                <Alert className={`mt-2 ${validationMessages.identification.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {validationMessages.identification.message}
                                        {validationMessages.identification.existingUser && (
                                            <div className="mt-2 text-sm">
                                                <strong>Usuario existente:</strong> {validationMessages.identification.existingUser.name} ({validationMessages.identification.existingUser.email})
                                            </div>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}
                            {userFormErrors.identification && !validationMessages.identification && (
                                <p className="text-sm text-red-500 mt-1">{userFormErrors.identification}</p>
                            )}
                        </div>

                        {/* Nombre */}
                        <div>
                            <Label htmlFor="user-name">Nombre Completo *</Label>
                            <Input
                                id="user-name"
                                value={userForm.name}
                                onChange={(e) => handleUserFormChange('name', e.target.value)}
                                placeholder="Nombre completo del usuario"
                                className={userFormErrors.name ? 'border-red-500' : ''}
                            />
                            {userFormErrors.name && (
                                <p className="text-sm text-red-500 mt-1">{userFormErrors.name}</p>
                            )}
                        </div>
                    </div>

                    {/* Columna 2 */}
                    <div className="space-y-4">
                        {/* Email */}
                        <div>
                            <Label htmlFor="user-email">Email *</Label>
                            <Input
                                id="user-email"
                                type="email"
                                value={userForm.email}
                                onChange={(e) => handleUserFormChange('email', e.target.value)}
                                placeholder="email@ejemplo.com"
                                className={userFormErrors.email ? 'border-red-500' : ''}
                            />
                            {validationMessages.email && (
                                <Alert className={`mt-2 ${validationMessages.email.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {validationMessages.email.message}
                                        {validationMessages.email.existingUser && (
                                            <div className="mt-2 text-sm">
                                                <strong>Usuario existente:</strong> {validationMessages.email.existingUser.name} ({validationMessages.email.existingUser.email})
                                            </div>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}
                            {userFormErrors.email && !validationMessages.email && (
                                <p className="text-sm text-red-500 mt-1">{userFormErrors.email}</p>
                            )}
                        </div>

                        {/* Teléfono */}
                        <div>
                            <Label htmlFor="user-phone">Teléfono</Label>
                            <Input
                                id="user-phone"
                                value={userForm.phone}
                                onChange={(e) => handleUserFormChange('phone', e.target.value)}
                                placeholder="Número de teléfono (opcional)"
                            />
                        </div>

                        {/* Contraseña Temporal */}
                        <div>
                            <Label htmlFor="user-password">Contraseña Temporal *</Label>
                            <Input
                                id="user-password"
                                type="password"
                                value={userForm.password}
                                onChange={(e) => handleUserFormChange('password', e.target.value)}
                                placeholder="Contraseña temporal"
                                className={userFormErrors.password ? 'border-red-500' : ''}
                            />
                            {userFormErrors.password && (
                                <p className="text-sm text-red-500 mt-1">{userFormErrors.password}</p>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">
                                Esta contraseña se enviará por email y el usuario deberá cambiarla en el primer ingreso.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-4 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setUserForm({
                                sede_id: '',
                                identification: '',
                                name: '',
                                email: '',
                                phone: '',
                                password: '',
                                role_id: ''
                            });
                            setUserFormErrors({});
                            setValidationMessages({});
                        }}
                        disabled={creatingUser}
                    >
                        Limpiar Formulario
                    </Button>
                    <Button
                        onClick={handleCreateUser}
                        disabled={creatingUser || Object.keys(userFormErrors).length > 0}
                        className="flex items-center gap-2"
                    >
                        {creatingUser ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <UserPlus className="h-4 w-4" />
                        )}
                        {creatingUser ? 'Creando Usuario...' : 'Crear Usuario y Enviar Email'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
