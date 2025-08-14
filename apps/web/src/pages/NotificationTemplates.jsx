import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Eye,
  FileText,
  Mail,
  MessageSquare,
  Smartphone,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import NotificationTemplateEditor from '@/components/NotificationTemplateEditor';
import VariableSelector from '@/components/VariableSelector';
import ChannelPreview from '@/components/ChannelPreview';
import TemplatePreview from '@/components/TemplatePreview';
import PredefinedTemplates from '@/components/PredefinedTemplates';
import { useNotificationContext } from '@/contexts/notification-context';
import { API_ROUTES } from '@/config/api';

const NotificationTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const { showToast } = useNotificationContext();
  const editorRef = useRef(null);

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'user', label: 'Usuario' },
    { value: 'inspection_order', label: 'Orden de Inspección' },
    { value: 'appointment', label: 'Cita' },
    { value: 'system', label: 'Sistema' }
  ];

  // Cargar plantillas
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ROUTES.TEMPLATES.LIST, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data || []);
      } else {
        throw new Error('Error al cargar plantillas');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al cargar plantillas', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función de prueba para verificar toasts
  const testToast = () => {
    showToast('Este es un mensaje de prueba del sistema de toasts', 'success');
  };

  // Crear nueva plantilla
  const createTemplate = async (templateData) => {
    try {
      const response = await fetch(API_ROUTES.TEMPLATES.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        const data = await response.json();
        showToast('Plantilla creada exitosamente', 'success');
        setIsEditorOpen(false);
        setEditingTemplate(null);
        setEditingTemplateId(null);
        fetchTemplates();
        return data.data;
      } else {
        throw new Error('Error al crear plantilla');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al crear plantilla', 'error');
    }
  };

  // Actualizar plantilla
  const updateTemplate = async (templateData) => {
    try {
      const response = await fetch(API_ROUTES.TEMPLATES.UPDATE(templateData.id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        const data = await response.json();
        showToast('Plantilla actualizada exitosamente', 'success');
        setIsEditorOpen(false);
        setEditingTemplate(null);
        setEditingTemplateId(null);
        fetchTemplates();
        return data.data;
      } else {
        throw new Error('Error al actualizar plantilla');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al actualizar plantilla', 'error');
    }
  };

  // Eliminar plantilla
  const deleteTemplate = async (templateId) => {
    if (!confirm('¿Está seguro de que desea eliminar esta plantilla?')) {
      return;
    }

    try {
      const response = await fetch(API_ROUTES.TEMPLATES.DELETE(templateId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        showToast('Plantilla eliminada exitosamente', 'success');
        fetchTemplates();
      } else {
        throw new Error('Error al eliminar plantilla');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al eliminar plantilla', 'error');
    }
  };

  // Duplicar plantilla
  const duplicateTemplate = async (templateId) => {
    try {
      const response = await fetch(API_ROUTES.TEMPLATES.DUPLICATE(templateId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        showToast('Plantilla duplicada exitosamente', 'success');
        fetchTemplates();
        return data.data;
      } else {
        throw new Error('Error al duplicar plantilla');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al duplicar plantilla', 'error');
    }
  };

  // Mapear datos del editor al formato de la API
  const mapEditorDataToAPI = (templateData) => {
    const apiChannels = {};

    // Mapear email
    if (templateData.channels?.email) {
      apiChannels.email = {
        subject: templateData.channels.email.subject || '',
        template: templateData.channels.email.template || '',
        body: templateData.channels.email.body || '',
        html: templateData.channels.email.html || '',
        text: templateData.channels.email.text || '',
        variables: extractVariables(templateData.channels.email.template || '')
      };
    }

    // Mapear SMS
    if (templateData.channels?.sms) {
      apiChannels.sms = {
        template: templateData.channels.sms.template || '',
        message: templateData.channels.sms.message || '',
        variables: extractVariables(templateData.channels.sms.template || '')
      };
    }

    // Mapear WhatsApp
    if (templateData.channels?.whatsapp) {
      apiChannels.whatsapp = {
        template: templateData.channels.whatsapp.template || '',
        message: templateData.channels.whatsapp.message || '',
        title: templateData.channels.whatsapp.title || '',
        variables: extractVariables(templateData.channels.whatsapp.template || '')
      };
    }

    // Mapear In-App
    if (templateData.channels?.in_app) {
      apiChannels.in_app = {
        title: templateData.channels.in_app.title || '',
        template: templateData.channels.in_app.template || '',
        message: templateData.channels.in_app.message || '',
        variables: extractVariables(templateData.channels.in_app.template || '')
      };
    }

    // Mapear Push
    if (templateData.channels?.push) {
      apiChannels.push = {
        title: templateData.channels.push.title || '',
        template: templateData.channels.push.template || '',
        message: templateData.channels.push.message || '',
        body: templateData.channels.push.body || '',
        variables: extractVariables(templateData.channels.push.template || '')
      };
    }

    return {
      ...templateData,
      channels: apiChannels
    };
  };

  // Extraer variables de un texto
  const extractVariables = (text) => {
    const variablePattern = /\{\{([^}]+)\}\}/g;
    const variables = [];
    let match;

    while ((match = variablePattern.exec(text)) !== null) {
      variables.push(match[1].trim());
    }

    return [...new Set(variables)]; // Eliminar duplicados
  };

  // Manejar guardado
  const handleSave = async (templateData) => {
    try {
      const mappedData = mapEditorDataToAPI(templateData);
      console.log('Datos mapeados para guardar:', mappedData);

      if (editingTemplateId) {
        await updateTemplate({ ...mappedData, id: editingTemplateId });
      } else {
        await createTemplate(mappedData);
      }
      // Cerrar el editor después de guardar exitosamente
      setIsEditorOpen(false);
      setEditingTemplate(null);
      setEditingTemplateId(null);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  // Manejar validación
  const handleValidation = (errors) => {
    setValidationErrors(errors);
    if (Object.keys(errors).length == 0) {
      showToast('Plantilla válida', 'success');
    } else {
      showToast('Plantilla tiene errores de validación', 'error');
    }
  };

  // Filtrar plantillas
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory == 'all' || template.category == selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Cargar plantillas al montar el componente
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Función para mapear template al formato del editor (para preview)
  const mapTemplateForPreview = (templateData) => {
    if (!templateData || !templateData.channels) {
      return templateData;
    }

    const mappedChannels = {};

    // Mapear email
    if (templateData.channels.email) {
      mappedChannels.email = {
        subject: templateData.channels.email.subject || '',
        template: templateData.channels.email.template || '',
        body: templateData.channels.email.body || '',
        html: templateData.channels.email.html || '',
        text: templateData.channels.email.text || ''
      };
    }

    // Mapear SMS
    if (templateData.channels.sms) {
      mappedChannels.sms = {
        template: templateData.channels.sms.template || '',
        message: templateData.channels.sms.message || ''
      };
    }

    // Mapear WhatsApp
    if (templateData.channels.whatsapp) {
      mappedChannels.whatsapp = {
        template: templateData.channels.whatsapp.template || '',
        message: templateData.channels.whatsapp.message || '',
        title: templateData.channels.whatsapp.title || ''
      };
    }

    // Mapear In-App
    if (templateData.channels.in_app) {
      mappedChannels.in_app = {
        title: templateData.channels.in_app.title || '',
        template: templateData.channels.in_app.template || '',
        message: templateData.channels.in_app.message || ''
      };
    }

    // Mapear Push
    if (templateData.channels.push) {
      mappedChannels.push = {
        title: templateData.channels.push.title || '',
        template: templateData.channels.push.template || '',
        message: templateData.channels.push.message || '',
        body: templateData.channels.push.body || ''
      };
    }

    return {
      ...templateData,
      channels: mappedChannels
    };
  };

  // Función para insertar variable en el editor
  const handleVariableSelect = (variable) => {
    // Llamar directamente a la función insertVariable del editor
    if (editorRef.current && editorRef.current.insertVariable) {
      editorRef.current.insertVariable(variable);
    } else {
      console.log('Editor no disponible para insertar variable:', variable);
    }
  };

  // Función para manejar selección de plantilla predefinida
  const handlePredefinedTemplateSelect = (template) => {
    setEditingTemplate(template);
    setEditingTemplateId(null); // Nueva plantilla
    setIsEditorOpen(true);
  };

  return (
    <div className="p-2 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plantillas de Notificación</h1>
          <p className="text-muted-foreground">
            Gestiona las plantillas para diferentes canales de notificación
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => {
            setEditingTemplate(null);
            setEditingTemplateId(null);
            setIsEditorOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Plantilla
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setEditingTemplate(null);
              setEditingTemplateId(null);
              setIsEditorOpen(false);
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Plantillas Base
          </Button>
          <Button
            variant="secondary"
            onClick={testToast}
          >
            🧪 Probar Toast
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium mb-2 block">
                Buscar plantillas
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="sm:w-48">
              <Label htmlFor="category" className="text-sm font-medium mb-2 block">
                Categoría
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor de Plantillas */}
      {isEditorOpen && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
            </h2>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditorOpen(false);
                setEditingTemplate(null);
                setEditingTemplateId(null);
              }}
            >
              Cancelar
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Editor */}
            <div className="lg:col-span-2">
              <NotificationTemplateEditor
                template={editingTemplate || {}}
                onChange={setEditingTemplate}
                onSave={handleSave}
                onValidate={handleValidation}
                onVariableInsert={handleVariableSelect}
                ref={editorRef}
              />
            </div>

            {/* Panel derecho: Variables y Preview apilados */}
            <div className="space-y-6">
              {/* Selector de variables */}
              <div>
                <VariableSelector
                  onSelect={handleVariableSelect}
                />
              </div>

              {/* Preview en tiempo real */}
              <div>
                <TemplatePreview
                  template={mapTemplateForPreview(editingTemplate) || {}}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plantillas Predefinidas */}
      {!isEditorOpen && (
        <PredefinedTemplates
          onSelectTemplate={handlePredefinedTemplateSelect}
        />
      )}

      {/* Lista de plantillas */}
      {!isEditorOpen && loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : !isEditorOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {template.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{template.category}</Badge>
                      {template.is_active ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Activa
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactiva
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Preview: {template.name}</DialogTitle>
                        </DialogHeader>
                        <ChannelPreview template={template} />
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTemplate(template);
                        setEditingTemplateId(template.id);
                        setIsEditorOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateTemplate(template.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  {template.description || 'Sin descripción'}
                </p>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Canales configurados:</div>
                  <div className="flex flex-wrap gap-2">
                    {template.channels?.email && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </Badge>
                    )}
                    {template.channels?.sms && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        SMS
                      </Badge>
                    )}
                    {template.channels?.whatsapp && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Smartphone className="h-3 w-3" />
                        WhatsApp
                      </Badge>
                    )}
                    {template.channels?.in_app && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Bell className="h-3 w-3" />
                        In-App
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Versión {template.version}</span>
                    <span>Creada: {new Date(template.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mensaje cuando no hay plantillas */}
      {!loading && filteredTemplates.length == 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron plantillas</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Crea tu primera plantilla de notificación'
                }
              </p>
              {!searchTerm && selectedCategory == 'all' && (
                <Button onClick={() => setIsEditorOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Plantilla
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationTemplates; 