import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
    const [checkingPlate, setCheckingPlate] = useState(false);
    const { showToast } = useNotificationContext();
    const { user } = useAuth();
    const [sameAsClient, setSameAsClient] = useState(true);
    const [clientData, setClientData] = useState({});
    const [plateExists, setPlateExists] = useState(false);
    const [existingOrder, setExistingOrder] = useState(null);
    const [tipoVehiculoOptions, setTipoVehiculoOptions] = useState([]);
    const [loadingTipoVehiculo, setLoadingTipoVehiculo] = useState(false);

    // 🆕 Estado para opciones de producto
    const [productoOptions, setProductoOptions] = useState([]);
    const [loadingProducto, setLoadingProducto] = useState(false);

    // Estado del formulario con todos los campos del modelo (sin sede_id)
    const [formData, setFormData] = useState({
        // Información general de la orden
        producto: '',
        callback_url: user?.email || '',
        intermediario: user?.name || '',
        clave_intermediario: user?.intermediary_key || '',
        sucursal: user?.office || '',
        cod_oficina: '',
        fecha: new Date().toISOString().split('T')[0],
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
        metodo_inspeccion_recomendado: 'Virtual',
        cod_fasecolda: '',
        tipo_vehiculo: '',

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
    const isSuperAdmin = user?.roles?.some(role => role.name == 'super_admin');

    // Función para verificar si la placa ya existe
    const checkPlateExists = async (plate) => {
        if (!plate || plate.length < 3) {
            setPlateExists(false);
            setExistingOrder(null);
            return;
        }

        setCheckingPlate(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.INSPECTION_ORDERS.CHECK_PLATE(plate.toUpperCase()), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPlateExists(data.exists);
                setExistingOrder(data.exists ? data.order : null);

                if (data.exists) {
                    showToast(data.message, 'warning');
                }
            } else {
                console.error('Error verificando placa:', response.statusText);
            }
        } catch (error) {
            console.error('Error verificando placa:', error);
        } finally {
            setCheckingPlate(false);
        }
    };

    // Función para llenar datos de prueba
    const fillTestData = () => {
        const testData = {
            producto: productoOptions.length > 0 ? productoOptions[0].value || productoOptions[0].label : '',
            callback_url: user?.email || '',
            intermediario: user?.name || '',
            clave_intermediario: user?.intermediary_key || 'Clave2000',
            sucursal: user?.office || '',
            cod_oficina: '',
            fecha: new Date().toISOString().split('T')[0],
            vigencia: '',
            avaluo: '',
            vlr_accesorios: '0',

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
            metodo_inspeccion_recomendado: 'Virtual',
            cod_fasecolda: '',
            tipo_vehiculo: '',

            tipo_doc: 'CC',
            num_doc: '1122679592',
            nombre_cliente: 'Simon Bolivar',
            celular_cliente: '3043425127',
            correo_cliente: 'simon.bolivar@holdingvml.net',

            nombre_contacto: sameAsClient ? 'Simon Bolivar' : '',
            celular_contacto: sameAsClient ? '3043425127' : '',
            correo_contacto: sameAsClient ? 'simon.bolivar@holdingvml.net' : '',

            status: '1'
        };

        setFormData(testData);

        setClientData({
            nombre_cliente: 'Simon Bolivar',
            celular_cliente: '3043425127',
            correo_cliente: 'simon.bolivar@holdingvml.net'
        });

        setErrors({});
        showToast('Datos de prueba cargados - Puedes modificar cualquier campo antes de enviar', 'success');
    };

    // Limpiar formulario cuando se cierre el modal
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    // Limpiar validación de placa cuando se abra el modal
    useEffect(() => {
        if (isOpen) {
            setPlateExists(false);
            setExistingOrder(null);
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

    // 🆕 Cargar opciones de producto cuando se abra el modal
    useEffect(() => {
        const fetchProductoOptions = async () => {
            if (!isOpen) return;

            setLoadingProducto(true);
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(API_ROUTES.LIST_CONFIG.ITEMS_BY_NAME('producto'), {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('📦 Opciones de producto cargadas:', data);
                    setProductoOptions(Array.isArray(data) ? data : []);
                } else {
                    console.error('Error cargando productos:', response.statusText);
                    setProductoOptions([]);
                }
            } catch (error) {
                console.error('Error cargando productos:', error);
                setProductoOptions([]);
            } finally {
                setLoadingProducto(false);
            }
        };

        fetchProductoOptions();
    }, [isOpen]);

    // Cargar tipos de vehículo cuando se abra el modal
    useEffect(() => {
        const fetchTipoVehiculoOptions = async () => {
            if (!isOpen) return;

            setLoadingTipoVehiculo(true);
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(API_ROUTES.LIST_CONFIG.ITEMS_BY_NAME('tipo de vehiculo'), {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setTipoVehiculoOptions(Array.isArray(data) ? data : []);
                } else {
                    console.error('Error cargando tipos de vehículo:', response.statusText);
                    setTipoVehiculoOptions([]);
                }
            } catch (error) {
                console.error('Error cargando tipos de vehículo:', error);
                setTipoVehiculoOptions([]);
            } finally {
                setLoadingTipoVehiculo(false);
            }
        };

        fetchTipoVehiculoOptions();
    }, [isOpen]);

    // Sincronizar datos del contacto cuando cambie el checkbox
    useEffect(() => {
        if (sameAsClient && (clientData.nombre_cliente || formData.nombre_cliente)) {
            setFormData(prev => ({
                ...prev,
                nombre_contacto: clientData.nombre_cliente || prev.nombre_cliente,
                celular_contacto: clientData.celular_cliente || prev.celular_cliente,
                correo_contacto: clientData.correo_cliente || prev.correo_cliente
            }));
        }
    }, [sameAsClient, clientData]);

    const resetForm = () => {
        setFormData({
            producto: '',
            callback_url: user?.email || '',
            intermediario: user?.name || '',
            clave_intermediario: user?.intermediary_key || '',
            sucursal: user?.office || '',
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
            metodo_inspeccion_recomendado: 'Virtual',
            cod_fasecolda: '',
            tipo_vehiculo: '',

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
        setSameAsClient(true);
        setClientData({});
        setPlateExists(false);
        setExistingOrder(null);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (['nombre_cliente', 'celular_cliente', 'correo_cliente'].includes(field)) {
            setClientData(prev => ({
                ...prev,
                [field]: value
            }));
        }

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }

        if (field === 'placa') {
            const timeoutId = setTimeout(() => {
                checkPlateExists(value);
            }, 500);

            return () => clearTimeout(timeoutId);
        }

        if (sameAsClient) {
            const contactFields = {
                'nombre_cliente': 'nombre_contacto',
                'celular_cliente': 'celular_contacto',
                'correo_cliente': 'correo_contacto'
            };

            if (contactFields[field]) {
                setFormData(prev => ({
                    ...prev,
                    [contactFields[field]]: value
                }));
            }
        }
    };

    const handleSameAsClientChange = (checked) => {
        setSameAsClient(!checked);

        if (!checked) {
            setFormData(prev => ({
                ...prev,
                nombre_contacto: clientData.nombre_cliente || prev.nombre_cliente,
                celular_contacto: clientData.celular_cliente || prev.celular_cliente,
                correo_contacto: clientData.correo_cliente || prev.correo_cliente
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                nombre_contacto: '',
                celular_contacto: '',
                correo_contacto: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (plateExists) {
            newErrors.placa = 'Ya existe una orden de inspección activa para esta placa';
        }

        const requiredFields = [
            'producto', 'callback_url', 'intermediario', 'clave_intermediario',
            'fecha', 'vlr_accesorios',
            'placa',
            'metodo_inspeccion_recomendado', 'tipo_doc', 'num_doc', 'nombre_cliente', 'celular_cliente',
            'correo_cliente', 'nombre_contacto', 'celular_contacto', 'correo_contacto',
        ];

        requiredFields.forEach(field => {
            const value = formData[field];
            const isEmpty = !value || value.toString().trim() == '';

            if (isEmpty) {
                newErrors[field] = `Este campo es obligatorio`;
            }
        });

        if (formData.correo_cliente && !/\S+@\S+\.\S+/.test(formData.correo_cliente)) {
            newErrors.correo_cliente = 'El formato del email no es válido';
        }

        if (formData.correo_contacto && !/\S+@\S+\.\S+/.test(formData.correo_contacto)) {
            newErrors.correo_contacto = 'El formato del email no es válido';
        }

        if (formData.placa) {
            const tipoVehiculo = formData.tipo_vehiculo?.toLowerCase();
            let placaValida = false;
            let mensajeError = '';
            
            if (tipoVehiculo?.includes('moto')) {
                // Motos: 3 letras + 2 números + 1 letra opcional
                placaValida = /^[A-Z]{3}[0-9]{2}[A-Z]?$/.test(formData.placa);
                mensajeError = 'Moto: Debe tener 3 letras, 2 números y opcionalmente 1 letra (ej: ABC12 o ABC12D)';
            } else if (tipoVehiculo?.includes('automovil') || tipoVehiculo?.includes('camioneta')) {
                // Automóvil y Camioneta: 3 letras + 3 números
                placaValida = /^[A-Z]{3}[0-9]{3}$/.test(formData.placa);
                const tipo = tipoVehiculo?.includes('automovil') ? 'Automóvil' : 'Camioneta';
                mensajeError = `${tipo}: Debe tener 3 letras seguidas de 3 números (ej: ABC123)`;
            } else {
                // Sin tipo seleccionado, validación general
                placaValida = false;
                mensajeError = 'Selecciona el tipo de vehículo para validar el formato de placa correctamente';
            }
            
            if (!placaValida) {
                newErrors.placa = mensajeError;
            }
        }

        if (formData.modelo && formData.modelo.length > 4) {
            newErrors.modelo = 'El modelo no puede tener más de 4 caracteres';
        }

        if (formData.cilindraje && formData.cilindraje.length > 10) {
            newErrors.cilindraje = 'El cilindraje no puede tener más de 10 caracteres';
        }

        if (formData.color && formData.color.length > 100) {
            newErrors.color = 'El color no puede tener más de 100 caracteres';
        }

        if (formData.celular_cliente) {
            if (formData.celular_cliente.length !== 10) {
                newErrors.celular_cliente = 'El celular debe tener exactamente 10 dígitos';
            } else if (!/^\d+$/.test(formData.celular_cliente)) {
                newErrors.celular_cliente = 'El celular debe ser numérico';
            }
        }

        if (formData.celular_contacto) {
            if (formData.celular_contacto.length > 10) {
                newErrors.celular_contacto = 'El celular no puede tener más de 10 dígitos';
            } else if (!/^\d+$/.test(formData.celular_contacto)) {
                newErrors.celular_contacto = 'El celular debe ser numérico';
            }
        }

        if (formData.num_doc && formData.num_doc.length > 15) {
            newErrors.num_doc = 'El número de documento no puede tener más de 15 caracteres';
        }

        if (formData.cod_fasecolda && formData.cod_fasecolda.length > 8) {
            newErrors.cod_fasecolda = 'El código FASECOLDA no puede tener más de 8 caracteres';
        }

        if (formData.clave_intermediario && formData.clave_intermediario.length > 250) {
            newErrors.clave_intermediario = 'La clave de intermediario no puede tener más de 250 caracteres';
        }

        if (formData.marca && formData.marca.length > 50) {
            newErrors.marca = 'La marca no puede tener más de 50 caracteres';
        }

        if (formData.linea && formData.linea.length > 50) {
            newErrors.linea = 'La línea no puede tener más de 50 caracteres';
        }

        if (formData.clase && formData.clase.length > 50) {
            newErrors.clase = 'La clase no puede tener más de 50 caracteres';
        }

        if (formData.servicio && formData.servicio.length > 50) {
            newErrors.servicio = 'El servicio no puede tener más de 50 caracteres';
        }

        if (formData.motor && formData.motor.length > 50) {
            newErrors.motor = 'El motor no puede tener más de 50 caracteres';
        }

        if (formData.chasis && formData.chasis.length > 50) {
            newErrors.chasis = 'El chasis no puede tener más de 50 caracteres';
        }

        if (formData.vin && formData.vin.length > 50) {
            newErrors.vin = 'El VIN no puede tener más de 50 caracteres';
        }

        if (formData.carroceria && formData.carroceria.length > 50) {
            newErrors.carroceria = 'La carrocería no puede tener más de 50 caracteres';
        }

        if (formData.combustible && formData.combustible.length > 50) {
            newErrors.combustible = 'El combustible no puede tener más de 50 caracteres';
        }

        if (formData.cod_oficina && formData.cod_oficina.length > 10) {
            newErrors.cod_oficina = 'El código de oficina no puede tener más de 10 caracteres';
        }

        if (formData.vigencia && formData.vigencia.length > 10) {
            newErrors.vigencia = 'La vigencia no puede tener más de 10 caracteres';
        }

        if (formData.correo_cliente && formData.correo_cliente.length > 150) {
            newErrors.correo_cliente = 'El email no puede tener más de 150 caracteres';
        }

        if (formData.correo_contacto && formData.correo_contacto.length > 150) {
            newErrors.correo_contacto = 'El email no puede tener más de 150 caracteres';
        }

        if (formData.nombre_cliente && formData.nombre_cliente.length > 200) {
            newErrors.nombre_cliente = 'El nombre del cliente no puede tener más de 200 caracteres';
        }

        if (formData.nombre_contacto && formData.nombre_contacto.length > 250) {
            newErrors.nombre_contacto = 'El nombre del contacto no puede tener más de 250 caracteres';
        }

        console.error(newErrors);
        setErrors(newErrors);
        return Object.keys(newErrors).length == 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) {
            console.log('⚠️ Intento de envío múltiple bloqueado');
            showToast('Ya se está procesando la orden, por favor espera...', 'warning');
            return;
        }

        if (!validateForm()) {
            showToast('Por favor corrige los errores en el formulario', 'warning');
            return;
        }

        setLoading(true);

        const loadingTimeout = setTimeout(() => {
            console.warn('⚠️ Timeout de seguridad: forzando finalización del loading');
            setLoading(false);
            showToast('La operación está tomando más tiempo del esperado. Por favor intenta nuevamente.', 'warning');
        }, 30000);

        try {
            const token = localStorage.getItem('authToken');

            const submitData = {
                ...formData,
                placa: formData.placa.toUpperCase(),
                status: parseInt(formData.status),
                clave_intermediario: user?.intermediary_key || formData.clave_intermediario,
                fecha: new Date().toISOString().split('T')[0]
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
                showToast(`✅ Orden creada exitosamente - Número: ${newOrder.numero} - Placa: ${submitData.placa}`, 'success');
                onOrderCreated?.(newOrder);
                onClose();
            } else {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { message: `Error del servidor: ${response.status} ${response.statusText}` };
                }
                throw new Error(errorData.message || `Error HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error creating order:', error);
            showToast(error.message || 'Error al crear la orden de inspección', 'error');
        } finally {
            clearTimeout(loadingTimeout);
            setLoading(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={loading ? undefined : onClose}>
            <SheetContent
                className="w-full sm:max-w-6xl overflow-y-auto px-4"
                onEscapeKeyDown={loading ? (e) => e.preventDefault() : undefined}
            >
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            <SheetTitle>Nueva Orden de Inspección</SheetTitle>
                        </div>
                        {isSuperAdmin && (
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
                        )}
                    </div>
                    <SheetDescription>
                        {loading ? (
                            <div className="flex items-center gap-2 text-blue-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span>Procesando orden de inspección...</span>
                            </div>
                        ) : (
                            'Completa todos los datos requeridos para crear una nueva orden de inspección'
                        )}
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className={`mt-0 space-y-4 ${loading ? 'pointer-events-none opacity-50' : ''}`}>
                    {/* Información General de la Orden */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Hash className="h-4 w-4" />
                                Información General
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* 🆕 Campo Producto ahora como Select dinámico */}
                            <div>
                                <Label htmlFor="producto">Producto *</Label>
                                <Select
                                    value={formData.producto}
                                    onValueChange={(value) => handleInputChange('producto', value)}
                                    disabled={loadingProducto}
                                >
                                    <SelectTrigger className={`w-full ${errors.producto ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder={loadingProducto ? "Cargando..." : "Seleccionar producto"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productoOptions.length > 0 ? (
                                            productoOptions
                                                .filter(option => {
                                                    const value = option.value || option.label;
                                                    return value && value.trim() !== '';
                                                })
                                                .map((option) => {
                                                    const value = option.value || option.label || `option-${option.id}`;
                                                    const label = option.label || option.value || 'Sin etiqueta';
                                                    return (
                                                        <SelectItem key={option.id} value={value}>
                                                            {label}
                                                        </SelectItem>
                                                    );
                                                })
                                        ) : (
                                            !loadingProducto && (
                                                <div className="px-2 py-1.5 text-sm text-gray-500 text-center">
                                                    No hay productos disponibles
                                                </div>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.producto && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.producto}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="tipo_vehiculo">Tipo de Vehículo</Label>
                                <Select
                                    value={formData.tipo_vehiculo}
                                    onValueChange={(value) => handleInputChange('tipo_vehiculo', value)}
                                    disabled={loadingTipoVehiculo}
                                >
                                    <SelectTrigger className={`w-full ${errors.tipo_vehiculo ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder={loadingTipoVehiculo ? "Cargando..." : "Seleccionar tipo de vehículo"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tipoVehiculoOptions.length > 0 ? (
                                            tipoVehiculoOptions
                                                .filter(option => {
                                                    // Filtrar opciones que no tengan value válido
                                                    const value = option.value || option.label;
                                                    return value && value.trim() !== '';
                                                })
                                                .map((option) => {
                                                    // Asegurar que el value nunca sea vacío
                                                    const value = option.value || option.label || `option-${option.id}`;
                                                    const label = option.label || option.value || 'Sin etiqueta';
                                                    return (
                                                        <SelectItem key={option.id} value={value}>
                                                            {label}
                                                        </SelectItem>
                                                    );
                                                })
                                        ) : (
                                            !loadingTipoVehiculo && (
                                                <div className="px-2 py-1.5 text-sm text-gray-500 text-center">
                                                    No hay opciones disponibles
                                                </div>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.tipo_vehiculo && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.tipo_vehiculo}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="placa">Placa *</Label>
                                <div className="relative">
                                    <Input
                                        id="placa"
                                        placeholder="ABC123"
                                        maxLength={6}
                                        value={formData.placa}
                                        onChange={(e) => handleInputChange('placa', e.target.value.toUpperCase())}
                                        className={`${errors.placa ? 'border-red-500' : ''} ${plateExists ? 'border-orange-500' : ''} ${checkingPlate ? 'pr-10' : ''}`}
                                        disabled={checkingPlate}
                                    />
                                    {checkingPlate && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        </div>
                                    )}
                                </div>
                                {errors.placa && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.placa}
                                    </p>
                                )}
                                {plateExists && existingOrder && (
                                    <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                            <div className="text-sm text-orange-800">
                                                <p className="font-medium">Orden existente encontrada:</p>
                                                <p>• Número: {existingOrder.numero}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="metodo_inspeccion_recomendado">Método de Inspección *</Label>
                                <Select
                                    value={formData.metodo_inspeccion_recomendado}
                                    onValueChange={(value) => handleInputChange('metodo_inspeccion_recomendado', value)}
                                >
                                    <SelectTrigger className={`w-full ${errors.metodo_inspeccion_recomendado ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder="Seleccionar método" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Virtual">Virtual</SelectItem>
                                        <SelectItem value="Presencial">Presencial</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.metodo_inspeccion_recomendado && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.metodo_inspeccion_recomendado}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información del Vehículo */}
                    <Card className="hidden">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Car className="h-4 w-4" />
                                Datos del Vehículo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="marca">Marca</Label>
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
                                <Label htmlFor="linea">Línea</Label>
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
                                <Label htmlFor="clase">Clase</Label>
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
                                <Label htmlFor="modelo">Modelo (Año)</Label>
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
                                <Label htmlFor="color">Color</Label>
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
                                <Label htmlFor="cilindraje">Cilindraje</Label>
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
                                <Label htmlFor="servicio">Servicio</Label>
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
                                <Label htmlFor="combustible">Combustible</Label>
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
                                <Label htmlFor="motor">Número de Motor</Label>
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
                                <Label htmlFor="chasis">Número de Chasis</Label>
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
                                <Label htmlFor="vin">VIN</Label>
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
                                <Label htmlFor="carroceria">Carrocería</Label>
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
                                    type="tel"
                                    placeholder="3001234567"
                                    maxLength={10}
                                    value={formData.celular_cliente}
                                    onChange={(e) => {
                                        // Solo permitir números
                                        const value = e.target.value.replace(/\D/g, '');
                                        handleInputChange('celular_cliente', value);
                                    }}
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
                    {/* formData.nombre_contacto && formData.celular_contacto && !sameAsClient */}

                    {/* Información del Contacto */}
                    <Card className={!sameAsClient ? 'border border-red-500 rounded-lg shadow-md p-4 shadow-red-500 bg-red-50/20' : ''}>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2 text-red-500">
                                <Phone className="h-4 w-4" />
                                Persona encargada de realizar la inspección
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="sameAsClient"
                                    checked={!sameAsClient}
                                    onCheckedChange={handleSameAsClientChange}
                                />
                                <Label htmlFor="sameAsClient" className="text-sm font-medium">
                                    Si es otra la persona que va a hacer la inspección, marca aqui
                                </Label>
                            </div>

                            {!sameAsClient && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                            type="tel"
                                            placeholder="3001234567"
                                            maxLength={10}
                                            value={formData.celular_contacto}
                                            onChange={(e) => {
                                                // Solo permitir números
                                                const value = e.target.value.replace(/\D/g, '');
                                                handleInputChange('celular_contacto', value);
                                            }}
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
                                </div>
                            )}

                            {sameAsClient && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-blue-700">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            Los datos del contacto se sincronizarán automáticamente con los datos del cliente
                                        </span>
                                    </div>
                                    <div className="mt-2 text-sm text-blue-600">
                                        <p>• Nombre: {clientData.nombre_cliente || formData.nombre_cliente || 'No especificado'}</p>
                                        <p>• Celular: {clientData.celular_cliente || formData.celular_cliente || 'No especificado'}</p>
                                        <p>• Email: {clientData.correo_cliente || formData.correo_cliente || 'No especificado'}</p>
                                    </div>
                                </div>
                            )}
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
                            disabled={loading || plateExists}
                            className={`flex-1 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Creando Orden...</span>
                                </div>
                            ) : plateExists ? (
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Orden de inspección existente</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Crear Orden</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
} 