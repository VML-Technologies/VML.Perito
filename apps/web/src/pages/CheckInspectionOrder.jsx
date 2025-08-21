import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Search, Car, FileText, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const CheckInspectionOrder = () => {
    const [placa, setPlaca] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (!placa.trim()) {
            toast.error('Por favor ingrese una placa');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(`/api/check-plate/${placa.trim().toUpperCase()}`);
            const data = await response.json();

            if (response.ok) {
                setResult(data.data);
                if (data.data.found_order) {
                    toast.success('Orden de inspección encontrada');
                } else {
                    toast.info('No se encontró una orden de inspección activa para esta placa');
                }
            } else {
                setError(data.message || 'Error al consultar la placa');
                toast.error(data.message || 'Error al consultar la placa');
            }
        } catch (err) {
            setError('Error de conexión. Por favor intente nuevamente.');
            toast.error('Error de conexión. Por favor intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Consulta de Órdenes de Inspección
                    </h1>
                    <p className="text-lg text-gray-600">
                        Verifique si su vehículo tiene una orden de inspección activa
                    </p>
                </div>

                {/* Search Form */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Consultar Placa
                        </CardTitle>
                        <CardDescription>
                            Ingrese la placa de su vehículo para verificar si tiene una orden de inspección activa
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Label htmlFor="placa" className="text-sm font-medium">
                                    Placa del Vehículo
                                </Label>
                                <Input
                                    id="placa"
                                    type="text"
                                    placeholder="Ej: ABC123"
                                    value={placa}
                                    onChange={(e) => setPlaca(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="mt-1"
                                    maxLength={6}
                                    disabled={loading}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button 
                                    onClick={handleSearch} 
                                    disabled={loading || !placa.trim()}
                                    className="min-w-[120px]"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Consultando...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="mr-2 h-4 w-4" />
                                            Consultar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Display */}
                {error && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Results */}
                {result && (
                    <div className="space-y-6">
                        {/* Status Card */}
                        <Card className={result.found_order ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {result.found_order ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <span className="text-green-800">Orden Encontrada</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-5 w-5 text-orange-600" />
                                            <span className="text-orange-800">Sin Orden Activa</span>
                                        </>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    {result.found_order 
                                        ? 'Su vehículo tiene una orden de inspección activa'
                                        : 'No se encontró una orden de inspección activa para esta placa'
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-lg font-mono">
                                        {result.placa}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                        Consultado el {formatDate(result.query_timestamp)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle Information */}
                        {result.found_order && result.vehicle && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Car className="h-5 w-5" />
                                        Información del Vehículo
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Marca</Label>
                                            <p className="text-lg font-semibold">{result.vehicle.marca}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Línea</Label>
                                            <p className="text-lg font-semibold">{result.vehicle.linea}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Modelo</Label>
                                            <p className="text-lg font-semibold">{result.vehicle.modelo}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Color</Label>
                                            <p className="text-lg font-semibold">{result.vehicle.color}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Clase</Label>
                                            <p className="text-lg font-semibold">{result.vehicle.clase}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Servicio</Label>
                                            <p className="text-lg font-semibold">{result.vehicle.servicio}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Motor</Label>
                                            <p className="text-lg font-semibold">{result.vehicle.motor}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Chasis</Label>
                                            <p className="text-lg font-semibold">{result.vehicle.chasis}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">VIN</Label>
                                            <p className="text-lg font-semibold">{result.vehicle.vin}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Carrocería</Label>
                                            <p className="text-lg font-semibold">{result.vehicle.carroceria}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Combustible</Label>
                                            <p className="text-lg font-semibold">{result.vehicle.combustible}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Cilindraje</Label>
                                            <p className="text-lg font-semibold">{result.vehicle.cilindraje}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Information */}
                        {result.found_order && result.order && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Información de la Orden
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Número de Orden</Label>
                                            <p className="text-lg font-semibold">{result.order.numero}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Fecha</Label>
                                            <p className="text-lg font-semibold">{formatDate(result.order.fecha)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Estado</Label>
                                            <Badge variant="secondary" className="text-sm">
                                                {result.order.status}
                                            </Badge>
                                        </div>
                                        {result.order.status_description && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-600">Descripción del Estado</Label>
                                                <p className="text-sm text-gray-700">{result.order.status_description}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-gray-500">
                    <p>
                        Esta consulta es proporcionada por Movilidad Mundial para verificar el estado de las órdenes de inspección.
                    </p>
                    <p className="mt-2">
                        Para más información, contacte a nuestro equipo de soporte.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CheckInspectionOrder;
