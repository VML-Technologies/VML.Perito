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
import { AlertCircle, Building2, Edit, MapPin, Plus, Search, Trash2, Eye, FileText } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { useNotificationContext } from '@/contexts/notification-context';
import { API_ROUTES } from '../config/api';

const CompanyManagement = () => {
    // Estados principales
    const [companies, setCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Estados para formularios
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);

    // Estados para filtros y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCity, setFilterCity] = useState('all');
    const [filterDepartment, setFilterDepartment] = useState('all');

    // Estados para datos relacionados
    const [cities, setCities] = useState([]);
    const [departments, setDepartments] = useState([]);

    // Estado del formulario
    const [formData, setFormData] = useState({
        name: '',
        nit: '',
        city_id: '',
        address: ''
    });

    // Estados para selección de departamento/ciudad en formularios
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [filteredCities, setFilteredCities] = useState([]);

    // Contexto de notificaciones
    const { showToast } = useNotificationContext();

    // Cargar datos iniciales
    useEffect(() => {
        fetchInitialData();
    }, []);

    // Filtrar empresas cuando cambian los filtros
    useEffect(() => {
        filterCompanies();
    }, [companies, searchTerm, filterCity, filterDepartment]);

    // Filtrar ciudades según el departamento seleccionado en formularios
    useEffect(() => {
        if (selectedDepartment) {
            const filtered = cities.filter(city => city.department_id.toString() === selectedDepartment);
            setFilteredCities(filtered);
        } else {
            setFilteredCities([]);
        }
    }, [selectedDepartment, cities]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [companiesRes, citiesRes, departmentsRes] = await Promise.all([
                fetch(API_ROUTES.COMPANIES.LIST, { headers }),
                fetch(API_ROUTES.CITIES.LIST, { headers }),
                fetch(API_ROUTES.DEPARTMENTS.LIST, { headers })
            ]);

            if (!companiesRes.ok || !citiesRes.ok || !departmentsRes.ok) {
                throw new Error('Error al cargar datos');
            }

            const companiesData = await companiesRes.json();
            const citiesData = await citiesRes.json();
            const departmentsData = await departmentsRes.json();

            setCompanies(companiesData);
            setCities(citiesData);
            setDepartments(departmentsData);

            showToast(`Datos cargados: ${companiesData.length} empresas`, 'success');
        } catch (err) {
            setError(err.message);
            showToast('Error al cargar datos: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterCompanies = () => {
        let filtered = [...companies];

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(company =>
                company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.nit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.address?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtrar por ciudad
        if (filterCity && filterCity !== 'all') {
            filtered = filtered.filter(company => company.city_id.toString() === filterCity);
        }

        // Filtrar por departamento
        if (filterDepartment && filterDepartment !== 'all') {
            filtered = filtered.filter(company => {
                const city = cities.find(c => c.id === company.city_id);
                return city && city.department_id.toString() === filterDepartment;
            });
        }

        setFilteredCompanies(filtered);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            nit: '',
            city_id: '',
            address: ''
        });
        setSelectedDepartment('');
        setFilteredCities([]);
    };

    const handleCreate = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const handleEdit = (company) => {
        setSelectedCompany(company);
        setFormData({
            name: company.name,
            nit: company.nit || '',
            city_id: company.city_id.toString(),
            address: company.address || ''
        });

        // Encontrar el departamento de la ciudad
        const city = cities.find(c => c.id === company.city_id);
        if (city) {
            setSelectedDepartment(city.department_id.toString());
        }

        setShowEditModal(true);
    };

    const handleView = (company) => {
        setSelectedCompany(company);
        setShowViewModal(true);
    };

    const handleDelete = async (company) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar la empresa "${company.name}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(API_ROUTES.COMPANIES.DELETE(company.id), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar la empresa');
            }

            showToast('Empresa eliminada exitosamente', 'success');
            fetchInitialData();
        } catch (err) {
            showToast('Error al eliminar: ' + err.message, 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem('authToken');
            const url = selectedCompany
                ? API_ROUTES.COMPANIES.UPDATE(selectedCompany.id)
                : API_ROUTES.COMPANIES.CREATE;
            const method = selectedCompany ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Error al guardar la empresa');
            }

            showToast(
                selectedCompany ? 'Empresa actualizada exitosamente' : 'Empresa creada exitosamente',
                'success'
            );

            setShowCreateModal(false);
            setShowEditModal(false);
            fetchInitialData();
        } catch (err) {
            showToast('Error al guardar: ' + err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDepartmentChange = (departmentId) => {
        setSelectedDepartment(departmentId);
        setFormData({ ...formData, city_id: '' });
    };

    // Funciones auxiliares para mostrar nombres
    const getCityName = (cityId) => {
        const city = cities.find(c => c.id === cityId);
        return city ? city.name : 'N/A';
    };

    const getDepartmentName = (cityId) => {
        const city = cities.find(c => c.id === cityId);
        const department = departments.find(d => d.id === city?.department_id);
        return department ? department.name : 'N/A';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Cargando empresas...</p>
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
                        Gestión de Empresas
                    </h2>
                    <p className="text-muted-foreground">
                        Administra las empresas del sistema
                    </p>
                </div>
                <Button onClick={handleCreate} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Empresa
                </Button>
            </div>

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Filtros de Búsqueda
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <Label>Buscar</Label>
                            <Input
                                placeholder="Nombre, NIT o dirección..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todos los departamentos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los departamentos</SelectItem>
                                {departments.map(department => (
                                    <SelectItem key={department.id} value={department.id.toString()}>
                                        {department.name}
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
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm('');
                                setFilterCity('all');
                                setFilterDepartment('all');
                            }}
                        >
                            Limpiar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla de empresas */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Empresa</TableHead>
                                <TableHead>NIT</TableHead>
                                <TableHead>Ubicación</TableHead>
                                <TableHead>Dirección</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCompanies.map(company => (
                                <TableRow key={company.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            <div className="font-medium">{company.name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {company.nit ? (
                                            <Badge variant="outline">
                                                {company.nit}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">Sin NIT</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{getCityName(company.city_id)}</div>
                                            <div className="text-sm text-muted-foreground">{getDepartmentName(company.city_id)}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {company.address ? (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                <span className="text-sm">{company.address}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">Sin dirección</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleView(company)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(company)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(company)}
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
                    {filteredCompanies.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No se encontraron empresas que coincidan con los filtros aplicados.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal de creación */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Crear Nueva Empresa</DialogTitle>
                        <DialogDescription>
                            Complete los datos para crear una nueva empresa.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nombre de la empresa"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nit">NIT</Label>
                            <Input
                                id="nit"
                                value={formData.nit}
                                onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                                placeholder="Número de identificación tributaria"
                            />
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
                            <Label htmlFor="address">Dirección</Label>
                            <Textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Dirección de la empresa"
                                rows={3}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Guardando...' : 'Crear Empresa'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de edición */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Empresa</DialogTitle>
                        <DialogDescription>
                            Modifique los datos de la empresa.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nombre *</Label>
                            <Input
                                id="edit-name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nombre de la empresa"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-nit">NIT</Label>
                            <Input
                                id="edit-nit"
                                value={formData.nit}
                                onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                                placeholder="Número de identificación tributaria"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-department">Departamento *</Label>
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
                            <Label htmlFor="edit-city_id">Ciudad *</Label>
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
                            <Label htmlFor="edit-address">Dirección</Label>
                            <Textarea
                                id="edit-address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Dirección de la empresa"
                                rows={3}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de visualización */}
            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Detalles de la Empresa</DialogTitle>
                        <DialogDescription>
                            Información completa de la empresa seleccionada.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCompany && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nombre</Label>
                                <div className="p-2 bg-muted rounded">{selectedCompany.name}</div>
                            </div>

                            <div className="space-y-2">
                                <Label>NIT</Label>
                                <div className="p-2 bg-muted rounded">
                                    {selectedCompany.nit || 'Sin NIT'}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Ubicación</Label>
                                <div className="p-2 bg-muted rounded">
                                    {getCityName(selectedCompany.city_id)}, {getDepartmentName(selectedCompany.city_id)}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Dirección</Label>
                                <div className="p-2 bg-muted rounded">
                                    {selectedCompany.address || 'Sin dirección'}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Fecha de Creación</Label>
                                <div className="p-2 bg-muted rounded">
                                    {new Date(selectedCompany.createdAt).toLocaleDateString('es-ES')}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setShowViewModal(false)}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {error && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
};

export default CompanyManagement;