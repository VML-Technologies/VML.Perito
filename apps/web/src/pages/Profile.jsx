import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useNotificationContext } from '@/contexts/notification-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    Edit,
    Save,
    X,
    Camera,
    Key,
    Bell,
    Settings
} from 'lucide-react';

export default function Profile() {
    const { user } = useAuth();
    const { showToast } = useNotificationContext();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || '',
        bio: user?.bio || ''
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        // Aquí iría la lógica para guardar los cambios
        showToast('Perfil actualizado correctamente', 'success');
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            location: user?.location || '',
            bio: user?.bio || ''
        });
        setIsEditing(false);
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Mi Perfil</h1>
                    <p className="text-muted-foreground">Gestiona tu información personal y preferencias</p>
                </div>
                <div className="flex gap-2">
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Perfil
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleCancel}>
                                <X className="mr-2 h-4 w-4" />
                                Cancelar
                            </Button>
                            <Button onClick={handleSave}>
                                <Save className="mr-2 h-4 w-4" />
                                Guardar
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <Tabs defaultValue="personal" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="personal">Información Personal</TabsTrigger>
                    <TabsTrigger value="security">Seguridad</TabsTrigger>
                    <TabsTrigger value="preferences">Preferencias</TabsTrigger>
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
                                <div className="relative">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={user?.avatar} alt={user?.name} />
                                        <AvatarFallback className="text-lg">
                                            {getInitials(user?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </Button>
                                </div>
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
                                <div>
                                    <Label htmlFor="location" className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Ubicación
                                    </Label>
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        disabled={!isEditing}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Fecha de Registro
                                    </Label>
                                    <Input
                                        value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                        disabled
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Biografía */}
                            <div>
                                <Label htmlFor="bio">Biografía</Label>
                                <textarea
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                    disabled={!isEditing}
                                    className="mt-1 w-full min-h-[100px] p-3 border border-input rounded-md bg-background text-sm resize-none"
                                    placeholder="Cuéntanos un poco sobre ti..."
                                />
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
                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                            Activa
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label>Último Acceso</Label>
                                    <Input value={user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'} disabled className="mt-1" />
                                </div>
                                <div>
                                    <Label>Roles Asignados</Label>
                                    <div className="mt-1 flex gap-1">
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
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-medium">Contraseña</h3>
                                    <p className="text-sm text-muted-foreground">Última actualización: hace 30 días</p>
                                </div>
                                <Button variant="outline">Cambiar Contraseña</Button>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-medium">Autenticación de Dos Factores</h3>
                                    <p className="text-sm text-muted-foreground">Añade una capa extra de seguridad</p>
                                </div>
                                <Button variant="outline">Configurar 2FA</Button>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-medium">Sesiones Activas</h3>
                                    <p className="text-sm text-muted-foreground">Gestiona tus sesiones activas</p>
                                </div>
                                <Button variant="outline">Ver Sesiones</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Preferencias
                            </CardTitle>
                            <CardDescription>
                                Personaliza tu experiencia
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-medium">Notificaciones por Email</h3>
                                    <p className="text-sm text-muted-foreground">Recibe notificaciones importantes por correo</p>
                                </div>
                                <Button variant="outline">Configurar</Button>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-medium">Notificaciones Push</h3>
                                    <p className="text-sm text-muted-foreground">Notificaciones en tiempo real</p>
                                </div>
                                <Button variant="outline">Configurar</Button>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-medium">Tema de la Aplicación</h3>
                                    <p className="text-sm text-muted-foreground">Elige entre tema claro u oscuro</p>
                                </div>
                                <Button variant="outline">Cambiar Tema</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 