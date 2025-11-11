import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { AlertCircle, Building2, Edit, MapPin, Plus, Search, Trash2, Eye, Phone, Mail } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { useNotificationContext } from '@/contexts/notification-context';
import { API_ROUTES } from '../config/api';

const SedeManagement = () => {
    // Estados principales
    const [sedes, setSedes] = useState([]);
    const [filteredSedes, setFilteredSedes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Estados para formularios
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedSede, setSelectedSede] = useState(null);

    // Estados para filtros y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCompany, setFilterCompany] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterCity, setFilterCity] = useState('all');
    const [filterActive, setFilterActive] = useState('all');

    // Estados para datos relacionados
    const [companies, setCompanies] = useState([]);
    const [cities, setCities] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [sedeTypes, setSedeTypes] = useState([]);

    // Estado del formulario
    const [formData, setFormData] = useState({
        company_id: '',
        sede_type_id: '',
        name: '',
        email: '',
        phone: '',
        city_id: '',
        address: '',
        latitude: '',
        longitude: '',
        active: true
    });

    const { showToast } = useNotificationContext();

    // Cargar datos iniciales
    useEffect(() => {
        fetchInitialData();
    }, []);

    // Filtrar sedes cuando cambian los filtros
    useEffect(() => {
        filterSedes();
    }, [sedes, searchTerm, filterCompany, filterType, filterCity, filterActive]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [sedesRes, companiesRes, citiesRes, departmentsRes, sedeTypesRes] = await Promise.all([
                fetch(API_ROUTES.SEDES.LIST, { headers }),
                fetch(API_ROUTES.COMPANIES.LIST, { headers }),
                fetch(API_ROUTES.CITIES.LIST, { headers }),
                fetch(API_ROUTES.DEPARTMENTS.LIST, { headers }),
                fetch(API_ROUTES.SEDES.TYPES, { headers })
            ]);

            if (!sedesRes.ok || !companiesRes.ok || !citiesRes.ok || !departmentsRes.ok || !sedeTypesRes.ok) {
                throw new Error('Error al cargar datos');
            }

            const sedesData = await sedesRes.json();
            const companiesData = await companiesRes.json();
            const citiesData = await citiesRes.json();
            const departmentsData = await departmentsRes.json();
            const sedeTypesData = await sedeTypesRes.json();

            setSedes(sedesData);
            setCompanies(companiesData);
            setCities(citiesData);
            setDepartments(departmentsData);
            setSedeTypes(sedeTypesData);

            showToast(`Datos cargados: ${sedesData.length} sedes`, 'success');
        } catch (err) {
            setError(err.message);
            showToast('Error al cargar datos: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterSedes = () => {
        let filtered = [...sedes];

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(sede =>
                sede.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sede.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sede.address?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtrar por empresa
        if (filterCompany && filterCompany !== 'all') {
            filtered = filtered.filter(sede => sede.company_id.toString() === filterCompany);
        }

        // Filtrar por tipo
        if (filterType && filterType !== 'all') {
            filtered = filtered.filter(sede => sede.sede_type_id.toString() === filterType);
        }

        // Filtrar por ciudad
        if (filterCity && filterCity !== 'all') {
            filtered = filtered.filter(sede => sede.city_id.toString() === filterCity);
        }

        // Filtrar por estado activo
        if (filterActive !== 'all') {
            filtered = filtered.filter(sede => sede.active.toString() === filterActive);
        }

        setFilteredSedes(filtered);
    };

    const resetForm = () => {
        setFormData({
            company_id: '',
            sede_type_id: '',
            name: '',
            email: '',
            phone: '',
            city_id: '',
            address: '',
            latitude: '',
            longitude: '',
            active: true
        });
    };

    const handleCreate = () => {
        resetForm();
        setSelectedSede(null);
        setShowCreateModal(true);
    };

    const handleEdit = (sede) => {
        setFormData({
            company_id: sede.company_id.toString(),
            sede_type_id: sede.sede_type_id.toString(),
            name: sede.name,
            email: sede.email || '',
            phone: sede.phone || '',
            city_id: sede.city_id.toString(),
            address: sede.address || '',
            latitude: sede.latitude ? sede.latitude.toString() : '',
            longitude: sede.longitude ? sede.longitude.toString() : '',
            active: sede.active
        });
        setSelectedSede(sede);
        setShowEditModal(true);
    };

    const handleView = (sede) => {
        setSelectedSede(sede);
        setShowViewModal(true);
    };

    const handleSubmit = async (isEdit = false) => {
        setSaving(true);
        try {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const submitData = {
                ...formData,
                company_id: parseInt(formData.company_id),
                sede_type_id: parseInt(formData.sede_type_id),
                city_id: parseInt(formData.city_id),
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null
            };

            const url = isEdit ? API_ROUTES.SEDES.UPDATE(selectedSede.id) : API_ROUTES.SEDES.CREATE;
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(submitData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar sede');
            }

            const result = await response.json();
            showToast(`Sede ${isEdit ? 'actualizada' : 'creada'} exitosamente`, 'success');

            // Cerrar modales y recargar datos
            setShowCreateModal(false);
            setShowEditModal(false);
            await fetchInitialData();

        } catch (err) {
            showToast('Error al guardar: ' + err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (sede) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar la sede "${sede.name}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            const response = await fetch(API_ROUTES.SEDES.DELETE(sede.id), {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                throw new Error('Error al eliminar sede');
            }

            showToast('Sede eliminada exitosamente', 'success');
            await fetchInitialData();

        } catch (err) {
            showToast('Error al eliminar: ' + err.message, 'error');
        }
    };

    const getCompanyName = (companyId) => {
        const company = companies.find(c => c.id === companyId);
        return company ? company.name : 'N/A';
    };

    const getCityName = (cityId) => {
        const city = cities.find(c => c.id === cityId);
        return city ? city.name : 'N/A';
    };

    const getSedeTypeName = (sedeTypeId) => {
        const type = sedeTypes.find(t => t.id === sedeTypeId);
        return type ? type.name : 'N/A';
    };

    const getDepartmentName = (cityId) => {
        const city = cities.find(c => c.id === cityId);
        if (!city) return 'N/A';
        const department = departments.find(d => d.id === city.department_id);
        return department ? department.name : 'N/A';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 animate-pulse" />
                    <span>Cargando sedes...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Building2 className="h-6 w-6" />
                        Gestión de Sedes
                    </h2>
                    <p className="text-muted-foreground">
                        Administra las sedes del sistema - Total: {filteredSedes.length} sedes
                    </p>
                </div>
                <Button onClick={handleCreate} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Sede
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar sedes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterCompany} onValueChange={setFilterCompany}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todas las empresas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las empresas</SelectItem>
                                {companies.map(company => (
                                    <SelectItem key={company.id} value={company.id.toString()}>
                                        {company.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todos los tipos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los tipos</SelectItem>
                                {sedeTypes.map(type => (
                                    <SelectItem key={type.id} value={type.id.toString()}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterCity} onValueChange={setFilterCity}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todas las ciudades" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las ciudades</SelectItem>
                                {cities.map(city => (
                                    <SelectItem key={city.id} value={city.id.toString()}>
                                        {city.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterActive} onValueChange={setFilterActive}>
                            <SelectTrigger>
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="true">Activas</SelectItem>
                                <SelectItem value="false">Inactivas</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm('');
                                setFilterCompany('all');
                                setFilterType('all');
                                setFilterCity('all');
                                setFilterActive('all');
                            }}
                        >
                            Limpiar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla de sedes */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Empresa / Tipo</TableHead>
                                <TableHead>Ubicación</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Contacto</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSedes.map(sede => (
                                <TableRow key={sede.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            <div>
                                                <div className="font-medium">{sede.name}</div>
                                                {sede.address && (
                                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {sede.address}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{getCompanyName(sede.company_id)}</div>
                                            <Badge variant="outline" className="text-xs mt-1">
                                                {getSedeTypeName(sede.sede_type_id)}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{getCityName(sede.city_id)}</div>
                                            <div className="text-sm text-muted-foreground">{getDepartmentName(sede.city_id)}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={sede.active ? "default" : "secondary"}>
                                            {sede.active ? 'Activa' : 'Inactiva'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {sede.email && (
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {sede.email}
                                                </div>
                                            )}
                                            {sede.phone && (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {sede.phone}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleView(sede)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(sede)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(sede)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredSedes.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No se encontraron sedes que coincidan con los filtros aplicados.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal de creación */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Crear Nueva Sede</DialogTitle>
                        <DialogDescription>
                            Completa la información para crear una nueva sede.
                        </DialogDescription>
                    </DialogHeader>
                    <SedeForm
                        formData={formData}
                        setFormData={setFormData}
                        companies={companies}
                        cities={cities}
                        departments={departments}
                        sedeTypes={sedeTypes}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={() => handleSubmit(false)} disabled={saving}>
                            {saving ? 'Creando...' : 'Crear Sede'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de edición */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Editar Sede</DialogTitle>
                        <DialogDescription>
                            Modifica la información de la sede seleccionada.
                        </DialogDescription>
                    </DialogHeader>
                    <SedeForm
                        formData={formData}
                        setFormData={setFormData}
                        companies={companies}
                        cities={cities}
                        departments={departments}
                        sedeTypes={sedeTypes}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={() => handleSubmit(true)} disabled={saving}>
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de visualización */}
            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalles de la Sede</DialogTitle>
                    </DialogHeader>
                    {selectedSede && (
                        <SedeDetails
                            sede={selectedSede}
                            companies={companies}
                            cities={cities}
                            departments={departments}
                            sedeTypes={sedeTypes}
                        />
                    )}
                    <DialogFooter>
                        <Button onClick={() => setShowViewModal(false)}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Componente del formulario
const SedeForm = ({ formData, setFormData, companies, cities, departments, sedeTypes }) => {
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [filteredCities, setFilteredCities] = useState([]);

    useEffect(() => {
        if (formData.city_id) {
            const city = cities.find(c => c.id.toString() === formData.city_id.toString());
            if (city) {
                setSelectedDepartment(city.department_id.toString());
                setFilteredCities(cities.filter(c => c.department_id === city.department_id));
            }
        }
    }, [formData.city_id, cities]);

    const handleDepartmentChange = (departmentId) => {
        setSelectedDepartment(departmentId);
        const citiesInDepartment = cities.filter(c => c.department_id.toString() === departmentId);
        setFilteredCities(citiesInDepartment);
        setFormData({ ...formData, city_id: '' });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nombre de la sede"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="company_id">Empresa *</Label>
                <Select value={formData.company_id} onValueChange={(value) => setFormData({ ...formData, company_id: value })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar empresa" />
                    </SelectTrigger>
                    <SelectContent>
                        {companies.map(company => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                                {company.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="sede_type_id">Tipo de Sede *</Label>
                <Select value={formData.sede_type_id} onValueChange={(value) => setFormData({ ...formData, sede_type_id: value })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        {sedeTypes.map(type => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                                {type.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="department">Departamento *</Label>
                <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar departamento" />
                    </SelectTrigger>
                    <SelectContent>
                        {departments.map(department => (
                            <SelectItem key={department.id} value={department.id.toString()}>
                                {department.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="city_id">Ciudad *</Label>
                <Select value={formData.city_id} onValueChange={(value) => setFormData({ ...formData, city_id: value })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredCities.map(city => (
                            <SelectItem key={city.id} value={city.id.toString()}>
                                {city.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@ejemplo.com"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Número de teléfono"
                />
            </div>

            <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Dirección completa de la sede"
                    rows={2}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="latitude">Latitud</Label>
                <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="Ej: 4.6097100"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="longitude">Longitud</Label>
                <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="Ej: -74.0817500"
                />
            </div>

            <div className="md:col-span-2 flex items-center space-x-2">
                <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Sede activa</Label>
            </div>
        </div>
    );
};

// Componente de detalles
const SedeDetails = ({ sede, companies, cities, departments, sedeTypes }) => {
    const getCompanyName = (companyId) => {
        const company = companies.find(c => c.id === companyId);
        return company ? company.name : 'N/A';
    };

    const getCityName = (cityId) => {
        const city = cities.find(c => c.id === cityId);
        return city ? city.name : 'N/A';
    };

    const getSedeTypeName = (sedeTypeId) => {
        const type = sedeTypes.find(t => t.id === sedeTypeId);
        return type ? type.name : 'N/A';
    };

    const getDepartmentName = (cityId) => {
        const city = cities.find(c => c.id === cityId);
        if (!city) return 'N/A';
        const department = departments.find(d => d.id === city.department_id);
        return department ? department.name : 'N/A';
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
                    <p className="mt-1">{sede.name}</p>
                </div>
                <div>
                    <Label className="text-sm font-medium text-muted-foreground">Empresa</Label>
                    <p className="mt-1">{getCompanyName(sede.company_id)}</p>
                </div>
                <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                    <p className="mt-1">
                        <Badge variant="outline">{getSedeTypeName(sede.sede_type_id)}</Badge>
                    </p>
                </div>
                <div>
                    <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                    <p className="mt-1">
                        <Badge variant={sede.active ? "default" : "secondary"}>
                            {sede.active ? 'Activa' : 'Inactiva'}
                        </Badge>
                    </p>
                </div>
                <div>
                    <Label className="text-sm font-medium text-muted-foreground">Ciudad</Label>
                    <p className="mt-1">{getCityName(sede.city_id)}</p>
                </div>
                <div>
                    <Label className="text-sm font-medium text-muted-foreground">Departamento</Label>
                    <p className="mt-1">{getDepartmentName(sede.city_id)}</p>
                </div>
                {sede.email && (
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <p className="mt-1 flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {sede.email}
                        </p>
                    </div>
                )}
                {sede.phone && (
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                        <p className="mt-1 flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {sede.phone}
                        </p>
                    </div>
                )}
            </div>

            {sede.address && (
                <div>
                    <Label className="text-sm font-medium text-muted-foreground">Dirección</Label>
                    <p className="mt-1 flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        {sede.address}
                    </p>
                </div>
            )}

            {(sede.latitude && sede.longitude) && (
                <div>
                    <Label className="text-sm font-medium text-muted-foreground">Coordenadas GPS</Label>
                    <p className="mt-1">
                        Lat: {sede.latitude}, Lng: {sede.longitude}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SedeManagement;