import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Copy,
  User,
  FileText,
  Calendar,
  Building,
  Car
} from 'lucide-react';

const VariableSelector = ({ onSelect, className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({
    user: true,
    inspection_order: true,
    appointment: true,
    company: true,
    sede: true
  });

  // Variables disponibles organizadas por categoría
  const variables = {
    user: {
      icon: <User className="h-4 w-4" />,
      title: 'Usuario',
      variables: [
        { name: 'user.id', description: 'ID del usuario' },
        { name: 'user.name', description: 'Nombre completo' },
        { name: 'user.email', description: 'Correo electrónico' },
        { name: 'user.phone', description: 'Teléfono' },
        { name: 'user.role', description: 'Rol del usuario' },
        { name: 'user.department', description: 'Departamento' }
      ]
    },
    inspection_order: {
      icon: <FileText className="h-4 w-4" />,
      title: 'Orden de Inspección',
      variables: [
        { name: 'inspection_order.id', description: 'ID de la orden' },
        { name: 'inspection_order.numero', description: 'Número de orden' },
        { name: 'inspection_order.status', description: 'Estado actual' },
        { name: 'inspection_order.modality', description: 'Modalidad de inspección' },
        { name: 'inspection_order.created_at', description: 'Fecha de creación' },
        { name: 'inspection_order.scheduled_date', description: 'Fecha programada' },
        { name: 'inspection_order.vehicle_type', description: 'Tipo de vehículo' },
        { name: 'inspection_order.vehicle_plate', description: 'Placa del vehículo' }
      ]
    },
    appointment: {
      icon: <Calendar className="h-4 w-4" />,
      title: 'Cita',
      variables: [
        { name: 'appointment.id', description: 'ID de la cita' },
        { name: 'appointment.date', description: 'Fecha de la cita' },
        { name: 'appointment.time', description: 'Hora de la cita' },
        { name: 'appointment.duration', description: 'Duración estimada' },
        { name: 'appointment.status', description: 'Estado de la cita' },
        { name: 'appointment.notes', description: 'Notas adicionales' }
      ]
    },
    company: {
      icon: <Building className="h-4 w-4" />,
      title: 'Empresa',
      variables: [
        { name: 'company.name', description: 'Nombre de la empresa' },
        { name: 'company.address', description: 'Dirección' },
        { name: 'company.phone', description: 'Teléfono' },
        { name: 'company.email', description: 'Correo electrónico' }
      ]
    },
    sede: {
      icon: <Car className="h-4 w-4" />,
      title: 'Sede',
      variables: [
        { name: 'sede.name', description: 'Nombre de la sede' },
        { name: 'sede.address', description: 'Dirección de la sede' },
        { name: 'sede.phone', description: 'Teléfono de la sede' },
        { name: 'sede.type', description: 'Tipo de sede (CDA, Comercial, etc.)' }
      ]
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleVariableSelect = (variableName) => {
    onSelect(`{{${variableName}}}`);
  };

  const filteredVariables = Object.entries(variables).reduce((acc, [category, categoryData]) => {
    const filteredVars = categoryData.variables.filter(variable =>
      variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variable.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredVars.length > 0) {
      acc[category] = {
        ...categoryData,
        variables: filteredVars
      };
    }

    return acc;
  }, {});

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-5 w-5" />
          Variables Disponibles
        </CardTitle>
        <Input
          placeholder="Buscar variables..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-8"
        />
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {Object.entries(filteredVariables).map(([category, categoryData]) => (
              <div key={category} className="border rounded-lg">
                <Button
                  variant="ghost"
                  className="w-full justify-between h-8 px-3"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center gap-2">
                    {categoryData.icon}
                    <span className="text-sm font-medium">{categoryData.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {categoryData.variables.length}
                    </Badge>
                  </div>
                  {expandedCategories[category] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>

                {expandedCategories[category] && (
                  <div className="px-3 pb-2 space-y-1">
                    {categoryData.variables.map((variable) => (
                      <div
                        key={variable.name}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded text-sm cursor-pointer group"
                        onClick={() => handleVariableSelect(variable.name)}
                      >
                        <div className="flex-1">
                          <div className="font-mono text-xs text-primary">
                            {variable.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {variable.description}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(`{{${variable.name}}}`);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default VariableSelector; 