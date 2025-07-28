import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter
} from '@/components/ui/sheet';
import {
    User,
    Phone,
    Mail,
    Car,
    MapPin,
    Calendar,
    AlertCircle,
    CheckCircle,
    CreditCard,
    Hash,
    TestTube
} from 'lucide-react';
import { API_ROUTES } from '@/config/api';
import { useNotificationContext } from '@/contexts/notification-context';
import { useAuth } from '@/contexts/auth-context';

export default function CreateOrderModal({ isOpen, onClose, onOrderCreated }) {
    const [loading, setLoading] = useState(false);
    const { showToast } = useNotificationContext();
    const { user } = useAuth();

    // Estado del formulario con todos los campos del modelo (sin sede_id)
    const [formData, setFormData] = useState({
        // Información general de la orden
        producto: '',
        callback_url: '',
        numero: '',
        intermediario: '',
        clave_intermediario: user?.intermediary_key || '',
        sucursal: '',
        cod_oficina: '',
        fecha: new Date().toISOString().split('T')[0], // Fecha actual por defecto
        vigencia: '',
        avaluo: '',
        vlr_accesorios: '0',

        // Información del vehículo
        placa: '',
        marca: '',
        linea: '',
        clase: '',
        modelo: '',
        cilindraje: '',
        color: '',
        servicio: '',
        motor: '',
        chasis: '',
        vin: '',
        carroceria: '',
        combustible: '',
        cod_fasecolda: '',

        // Información del cliente
        tipo_doc: '',
        num_doc: '',
        nombre_cliente: '',
        celular_cliente: '',
        correo_cliente: '',

        // Información del contacto
        nombre_contacto: '',
        celular_contacto: '',
        correo_contacto: '',

        // Status inicial (1 = Pendiente por defecto)
        status: '1'
    });

    // Errores de validación
    const [errors, setErrors] = useState({});

    // Verificar si el usuario es super_admin
    const isSuperAdmin = user?.roles?.some(role => role.name === 'super_admin');

    // Función para llenar datos de prueba
    const fillTestData = () => {
        setFormData({
            // Información general de la orden
            producto: 'livianos',
            callback_url: 'https://apis.segurosmundial.com.co/exp/api/prod/v1/webhook',
            numero: '123456789',
            intermediario: 'Intermediario',
            clave_intermediario: user?.intermediary_key || 'Clave2000',
            sucursal: 'Sucursal',
            cod_oficina: '0000',
            fecha: new Date().toISOString().split('T')[0],
            vigencia: '30',
            avaluo: 'Avaluo',
            vlr_accesorios: 'Valor accesorios',

            // Información del vehículo
            placa: 'ASD123',
            marca: 'Marca del vehiculo',
            linea: 'Linea del vehiculo',
            clase: 'AUTOMOVIL',
            modelo: '2020',
            cilindraje: '159.3',
            color: 'Azul',
            servicio: 'PARTICULAR',
            motor: 'Motor del vehiculo',
            chasis: 'Chasis del vehiculo',
            vin: 'Vin del vehiculo',
            carroceria: 'Carroceria del vehiculo',
            combustible: 'GASOLINA',
            cod_fasecolda: 'CodigoXX',

            // Información del cliente
            tipo_doc: 'CC',
            num_doc: '1234567890',
            nombre_cliente: 'Juan Andres Puentes Rosario',
            celular_cliente: '3000000000',
            correo_cliente: 'correocliente@example.com',

            // Información del contacto
            nombre_contacto: 'Juan Andres Puentes Rosario',
            celular_contacto: '3000000000',
            correo_contacto: 'correocontacto@example.com',

            // Status inicial
            status: '1'
        });

        setErrors({});
        showToast('Datos de prueba cargados exitosamente', 'success');
    };

    // Limpiar formulario cuando se cierra el modal
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    // Actualizar clave de intermediario cuando cambie el usuario
    useEffect(() => {
        if (user?.intermediary_key) {
            setFormData(prev => ({
                ...prev,
                clave_intermediario: user.intermediary_key
            }));
        }
    }, [user?.intermediary_key]);

    // Actualizar fecha cuando se abra el modal
    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({
                ...prev,
                fecha: new Date().toISOString().split('T')[0]
            }));
        }
    }, [isOpen]);

    const resetForm = () => {
        setFormData({
            producto: '',
            callback_url: '',
            numero: '',
            intermediario: '',
            clave_intermediario: user?.intermediary_key || '',
            sucursal: '',
            cod_oficina: '',
            fecha: new Date().toISOString().split('T')[0],
            vigencia: '',
            avaluo: '',
            vlr_accesorios: '0',
            placa: '',
            marca: '',
            linea: '',
            clase: '',
            modelo: '',
            cilindraje: '',
            color: '',
            servicio: '',
            motor: '',
            chasis: '',
            vin: '',
            carroceria: '',
            combustible: '',
            cod_fasecolda: '',
            tipo_doc: '',
            num_doc: '',
            nombre_cliente: '',
            celular_cliente: '',
            correo_cliente: '',
            nombre_contacto: '',
            celular_contacto: '',
            correo_contacto: '',
            status: '1'
        });
        setErrors({});
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validaciones obligatorias según el modelo
        const requiredFields = [
            'producto', 'callback_url', 'numero', 'intermediario', 'clave_intermediario',
            'sucursal', 'cod_oficina', 'fecha', 'vigencia', 'avaluo', 'vlr_accesorios',
            'placa', 'marca', 'linea', 'clase', 'modelo', 'cilindraje', 'color',
            'servicio', 'motor', 'chasis', 'vin', 'carroceria', 'combustible',
            'cod_fasecolda', 'tipo_doc', 'num_doc', 'nombre_cliente', 'celular_cliente',
            'correo_cliente', 'nombre_contacto', 'celular_contacto', 'correo_contacto',
        ];

        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].toString().trim() === '') {
                newErrors[field] = `Este campo es obligatorio`;
            }
        });

        // Validaciones específicas según el modelo
        if (formData.correo_cliente && !/\S+@\S+\.\S+/.test(formData.correo_cliente)) {
            newErrors.correo_cliente = 'El formato del email no es válido';
        }

        if (formData.correo_contacto && !/\S+@\S+\.\S+/.test(formData.correo_contacto)) {
            newErrors.correo_contacto = 'El formato del email no es válido';
        }

        // Validación de placa (máximo 6 caracteres)
        if (formData.placa && formData.placa.length > 6) {
            newErrors.placa = 'La placa no puede tener más de 6 caracteres';
        }

        // Validación de modelo (máximo 4 caracteres)
        if (formData.modelo && formData.modelo.length > 4) {
            newErrors.modelo = 'El modelo no puede tener más de 4 caracteres';
        }

        // Validación de cilindraje (máximo 10 caracteres)
        if (formData.cilindraje && formData.cilindraje.length > 10) {
            newErrors.cilindraje = 'El cilindraje no puede tener más de 10 caracteres';
        }

        // Validación de color (máximo 100 caracteres)
        if (formData.color && formData.color.length > 100) {
            newErrors.color = 'El color no puede tener más de 100 caracteres';
        }

        // Validación de celular (máximo 10 caracteres)
        if (formData.celular_cliente && formData.celular_cliente.length > 10) {
            newErrors.celular_cliente = 'El celular no puede tener más de 10 dígitos';
        }

        if (formData.celular_contacto && formData.celular_contacto.length > 10) {
            newErrors.celular_contacto = 'El celular no puede tener más de 10 dígitos';
        }

        // Validación de num_doc (máximo 15 caracteres)
        if (formData.num_doc && formData.num_doc.length > 15) {
            newErrors.num_doc = 'El número de documento no puede tener más de 15 caracteres';
        }

        // Validación de cod_fasecolda (máximo 8 caracteres)
        if (formData.cod_fasecolda && formData.cod_fasecolda.length > 8) {
            newErrors.cod_fasecolda = 'El código FASECOLDA no puede tener más de 8 caracteres';
        }

        // Validación de clave_intermediario (máximo 10 caracteres)
        if (formData.clave_intermediario && formData.clave_intermediario.length > 10) {
            newErrors.clave_intermediario = 'La clave de intermediario no puede tener más de 10 caracteres';
        }

        // Validación de cod_oficina (máximo 10 caracteres)
        if (formData.cod_oficina && formData.cod_oficina.length > 10) {
            newErrors.cod_oficina = 'El código de oficina no puede tener más de 10 caracteres';
        }

        // Validación de vigencia (máximo 10 caracteres)
        if (formData.vigencia && formData.vigencia.length > 10) {
            newErrors.vigencia = 'La vigencia no puede tener más de 10 caracteres';
        }

        // Validación de correo_cliente (máximo 150 caracteres)
        if (formData.correo_cliente && formData.correo_cliente.length > 150) {
            newErrors.correo_cliente = 'El email no puede tener más de 150 caracteres';
        }

        // Validación de correo_contacto (máximo 150 caracteres)
        if (formData.correo_contacto && formData.correo_contacto.length > 150) {
            newErrors.correo_contacto = 'El email no puede tener más de 150 caracteres';
        }

        // Validación de nombre_cliente (máximo 200 caracteres)
        if (formData.nombre_cliente && formData.nombre_cliente.length > 200) {
            newErrors.nombre_cliente = 'El nombre del cliente no puede tener más de 200 caracteres';
        }

        // Validación de nombre_contacto (máximo 250 caracteres)
        if (formData.nombre_contacto && formData.nombre_contacto.length > 250) {
            newErrors.nombre_contacto = 'El nombre del contacto no puede tener más de 250 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Por favor corrige los errores en el formulario', 'warning');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');

            // Preparar datos para envío
            const submitData = {
                ...formData,
                placa: formData.placa.toUpperCase(),
                numero: parseInt(formData.numero),
                status: parseInt(formData.status),
                clave_intermediario: user?.intermediary_key || formData.clave_intermediario,
                fecha: new Date().toISOString().split('T')[0]
                // sede_id se toma automáticamente del usuario autenticado en el backend
            };

            const response = await fetch(API_ROUTES.INSPECTION_ORDERS.CREATE, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submitData)
            });

            if (response.ok) {
                const newOrder = await response.json();
                showToast('Orden de inspección creada exitosamente', 'success');
                onOrderCreated?.(newOrder);
                onClose();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear la orden');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            showToast(error.message || 'Error al crear la orden de inspección', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-6xl overflow-y-auto">
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            <SheetTitle>Nueva Orden de Inspección</SheetTitle>
                        </div>
                        {/* {isSuperAdmin && ( */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={fillTestData}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <TestTube className="h-4 w-4" />
                            Datos de Prueba
                        </Button>
                        {/* )} */}
                    </div>
                    <SheetDescription>
                        Completa todos los datos requeridos para crear una nueva orden de inspección
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    {/* Información General de la Orden */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Hash className="h-4 w-4" />
                                Información General
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <div>
                                <Label htmlFor="producto">Producto *</Label>
                                <Select
                                    value={formData.producto}
                                    onValueChange={(value) => handleInputChange('producto', value)}
                                >
                                    <SelectTrigger className={`w-full ${errors.producto ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder="Seleccionar producto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Rodando Contigo">Rodando Contigo</SelectItem>
                                        <SelectItem value="Pesados Carga">Pesados Carga</SelectItem>
                                        <SelectItem value="Seguro Amarillo">Seguro Amarillo</SelectItem>
                                        <SelectItem value="Servicio Público de Pasajeros">Servicio Público de Pasajeros</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.producto && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.producto}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información del Vehículo */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Car className="h-4 w-4" />
                                Datos del Vehículo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="placa">Placa *</Label>
                                <Input
                                    id="placa"
                                    placeholder="ABC123"
                                    maxLength={6}
                                    value={formData.placa}
                                    onChange={(e) => handleInputChange('placa', e.target.value.toUpperCase())}
                                    className={errors.placa ? 'border-red-500' : ''}
                                />
                                {errors.placa && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.placa}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="marca">Marca *</Label>
                                <Input
                                    id="marca"
                                    placeholder="Toyota, Chevrolet, etc."
                                    value={formData.marca}
                                    onChange={(e) => handleInputChange('marca', e.target.value)}
                                    className={errors.marca ? 'border-red-500' : ''}
                                />
                                {errors.marca && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.marca}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="linea">Línea *</Label>
                                <Input
                                    id="linea"
                                    placeholder="Corolla, Spark, etc."
                                    value={formData.linea}
                                    onChange={(e) => handleInputChange('linea', e.target.value)}
                                    className={errors.linea ? 'border-red-500' : ''}
                                />
                                {errors.linea && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.linea}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="clase">Clase *</Label>
                                <Select
                                    value={formData.clase}
                                    onValueChange={(value) => handleInputChange('clase', value)}
                                >
                                    <SelectTrigger className={errors.clase ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecciona clase" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AUTOMOVIL">Automóvil</SelectItem>
                                        <SelectItem value="CAMIONETA">Camioneta</SelectItem>
                                        <SelectItem value="MOTOCICLETA">Motocicleta</SelectItem>
                                        <SelectItem value="CAMPERO">Campero</SelectItem>
                                        <SelectItem value="BUS">Bus</SelectItem>
                                        <SelectItem value="CAMION">Camión</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.clase && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.clase}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="modelo">Modelo (Año) *</Label>
                                <Input
                                    id="modelo"
                                    type="number"
                                    placeholder="2020"
                                    min="1900"
                                    max={new Date().getFullYear() + 5}
                                    maxLength={4}
                                    value={formData.modelo}
                                    onChange={(e) => handleInputChange('modelo', e.target.value)}
                                    className={errors.modelo ? 'border-red-500' : ''}
                                />
                                {errors.modelo && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.modelo}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="color">Color *</Label>
                                <Input
                                    id="color"
                                    placeholder="Blanco, Rojo, etc."
                                    value={formData.color}
                                    onChange={(e) => handleInputChange('color', e.target.value)}
                                    className={errors.color ? 'border-red-500' : ''}
                                />
                                {errors.color && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.color}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="cilindraje">Cilindraje *</Label>
                                <Input
                                    id="cilindraje"
                                    placeholder="1600, 2000, etc."
                                    maxLength={10}
                                    value={formData.cilindraje}
                                    onChange={(e) => handleInputChange('cilindraje', e.target.value)}
                                    className={errors.cilindraje ? 'border-red-500' : ''}
                                />
                                {errors.cilindraje && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.cilindraje}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="servicio">Servicio *</Label>
                                <Select
                                    value={formData.servicio}
                                    onValueChange={(value) => handleInputChange('servicio', value)}
                                >
                                    <SelectTrigger className={errors.servicio ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Tipo de servicio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PARTICULAR">Particular</SelectItem>
                                        <SelectItem value="PUBLICO">Público</SelectItem>
                                        <SelectItem value="OFICIAL">Oficial</SelectItem>
                                        <SelectItem value="DIPLOMATICO">Diplomático</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.servicio && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.servicio}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="combustible">Combustible *</Label>
                                <Select
                                    value={formData.combustible}
                                    onValueChange={(value) => handleInputChange('combustible', value)}
                                >
                                    <SelectTrigger className={errors.combustible ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Tipo de combustible" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GASOLINA">Gasolina</SelectItem>
                                        <SelectItem value="DIESEL">Diesel</SelectItem>
                                        <SelectItem value="GAS">Gas</SelectItem>
                                        <SelectItem value="ELECTRICO">Eléctrico</SelectItem>
                                        <SelectItem value="HIBRIDO">Híbrido</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.combustible && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.combustible}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="motor">Número de Motor *</Label>
                                <Input
                                    id="motor"
                                    placeholder="Número del motor"
                                    value={formData.motor}
                                    onChange={(e) => handleInputChange('motor', e.target.value)}
                                    className={errors.motor ? 'border-red-500' : ''}
                                />
                                {errors.motor && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.motor}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="chasis">Número de Chasis *</Label>
                                <Input
                                    id="chasis"
                                    placeholder="Número del chasis"
                                    value={formData.chasis}
                                    onChange={(e) => handleInputChange('chasis', e.target.value)}
                                    className={errors.chasis ? 'border-red-500' : ''}
                                />
                                {errors.chasis && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.chasis}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="vin">VIN *</Label>
                                <Input
                                    id="vin"
                                    placeholder="Número VIN"
                                    value={formData.vin}
                                    onChange={(e) => handleInputChange('vin', e.target.value)}
                                    className={errors.vin ? 'border-red-500' : ''}
                                />
                                {errors.vin && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.vin}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="carroceria">Carrocería *</Label>
                                <Input
                                    id="carroceria"
                                    placeholder="Tipo de carrocería"
                                    value={formData.carroceria}
                                    onChange={(e) => handleInputChange('carroceria', e.target.value)}
                                    className={errors.carroceria ? 'border-red-500' : ''}
                                />
                                {errors.carroceria && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.carroceria}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="cod_fasecolda">Código FASECOLDA *</Label>
                                <Input
                                    id="cod_fasecolda"
                                    placeholder="12345678"
                                    maxLength={8}
                                    value={formData.cod_fasecolda}
                                    onChange={(e) => handleInputChange('cod_fasecolda', e.target.value)}
                                    className={errors.cod_fasecolda ? 'border-red-500' : ''}
                                />
                                {errors.cod_fasecolda && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.cod_fasecolda}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información del Cliente */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Datos del Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="tipo_doc">Tipo de Documento *</Label>
                                <Select
                                    value={formData.tipo_doc}
                                    onValueChange={(value) => handleInputChange('tipo_doc', value)}
                                >
                                    <SelectTrigger className={errors.tipo_doc ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Tipo de documento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                                        <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                                        <SelectItem value="NIT">NIT</SelectItem>
                                        <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                                        <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.tipo_doc && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.tipo_doc}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="num_doc">Número de Documento *</Label>
                                <Input
                                    id="num_doc"
                                    placeholder="Número de documento"
                                    maxLength={15}
                                    value={formData.num_doc}
                                    onChange={(e) => handleInputChange('num_doc', e.target.value)}
                                    className={errors.num_doc ? 'border-red-500' : ''}
                                />
                                {errors.num_doc && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.num_doc}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="nombre_cliente">Nombre Completo *</Label>
                                <Input
                                    id="nombre_cliente"
                                    placeholder="Nombre completo del cliente"
                                    value={formData.nombre_cliente}
                                    onChange={(e) => handleInputChange('nombre_cliente', e.target.value)}
                                    className={errors.nombre_cliente ? 'border-red-500' : ''}
                                />
                                {errors.nombre_cliente && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.nombre_cliente}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="celular_cliente">Celular Cliente *</Label>
                                <Input
                                    id="celular_cliente"
                                    placeholder="3001234567"
                                    maxLength={10}
                                    value={formData.celular_cliente}
                                    onChange={(e) => handleInputChange('celular_cliente', e.target.value)}
                                    className={errors.celular_cliente ? 'border-red-500' : ''}
                                />
                                {errors.celular_cliente && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.celular_cliente}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="correo_cliente">Email Cliente *</Label>
                                <Input
                                    id="correo_cliente"
                                    type="email"
                                    placeholder="cliente@ejemplo.com"
                                    value={formData.correo_cliente}
                                    onChange={(e) => handleInputChange('correo_cliente', e.target.value)}
                                    className={errors.correo_cliente ? 'border-red-500' : ''}
                                />
                                {errors.correo_cliente && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.correo_cliente}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información del Contacto */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Datos del Contacto
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="nombre_contacto">Nombre Contacto *</Label>
                                <Input
                                    id="nombre_contacto"
                                    placeholder="Nombre del contacto"
                                    value={formData.nombre_contacto}
                                    onChange={(e) => handleInputChange('nombre_contacto', e.target.value)}
                                    className={errors.nombre_contacto ? 'border-red-500' : ''}
                                />
                                {errors.nombre_contacto && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.nombre_contacto}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="celular_contacto">Celular Contacto *</Label>
                                <Input
                                    id="celular_contacto"
                                    placeholder="3001234567"
                                    maxLength={10}
                                    value={formData.celular_contacto}
                                    onChange={(e) => handleInputChange('celular_contacto', e.target.value)}
                                    className={errors.celular_contacto ? 'border-red-500' : ''}
                                />
                                {errors.celular_contacto && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.celular_contacto}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="correo_contacto">Email Contacto *</Label>
                                <Input
                                    id="correo_contacto"
                                    type="email"
                                    placeholder="contacto@ejemplo.com"
                                    value={formData.correo_contacto}
                                    onChange={(e) => handleInputChange('correo_contacto', e.target.value)}
                                    className={errors.correo_contacto ? 'border-red-500' : ''}
                                />
                                {errors.correo_contacto && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.correo_contacto}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>



                    <div className="flex gap-4 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Creando...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Crear Orden
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
} 