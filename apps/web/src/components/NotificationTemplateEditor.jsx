import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Editor } from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Save,
  Eye,
  Code,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const NotificationTemplateEditor = forwardRef(({
  template = {},
  onChange,
  onSave,
  onValidate,
  onVariableInsert,
  className = ''
}, ref) => {
  const [activeChannel, setActiveChannel] = useState('email');
  const [validationErrors, setValidationErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const editorRefs = useRef({});

  // Exponer funciones al componente padre
  useImperativeHandle(ref, () => ({
    insertVariable: (variable) => {
      // Buscar el editor del campo activo en el canal actual
      const channelConfig = getChannelConfig(activeChannel);
      const activeField = channelConfig.fields.find(field => field.type === 'editor');

      if (activeField) {
        const editorKey = `${activeChannel}_${activeField.id}`;
        const editor = editorRefs.current[editorKey];

        if (editor) {
          const selection = editor.getSelection();
          const range = {
            startLineNumber: selection.startLineNumber,
            startColumn: selection.startColumn,
            endLineNumber: selection.endLineNumber,
            endColumn: selection.endColumn
          };

          editor.executeEdits('', [{
            range: range,
            text: variable // Variable already includes {{}}
          }]);

          editor.focus();
          console.log('Variable insertada:', variable, 'en editor:', editorKey);
        } else {
          console.log('Editor no encontrado para key:', editorKey);
        }
      } else {
        console.log('No se encontró campo de editor activo para canal:', activeChannel);
      }
    }
  }));

  // Inicializar datos cuando se recibe una plantilla para editar
  useEffect(() => {
    if (template && template.id) {
      console.log('Plantilla recibida para editar:', template);

      // Mapear la estructura de la plantilla al formato del editor
      const mappedChannels = {
        email: {
          subject: template.channels?.email?.subject || '',
          template: template.channels?.email?.template || '',
          body: template.channels?.email?.body || '',
          html: template.channels?.email?.html || '',
          text: template.channels?.email?.text || ''
        },
        sms: {
          template: template.channels?.sms?.template || '',
          message: template.channels?.sms?.message || ''
        },
        whatsapp: {
          template: template.channels?.whatsapp?.template || '',
          message: template.channels?.whatsapp?.message || '',
          title: template.channels?.whatsapp?.title || ''
        },
        in_app: {
          title: template.channels?.in_app?.title || '',
          template: template.channels?.in_app?.template || '',
          message: template.channels?.in_app?.message || ''
        },
        push: {
          title: template.channels?.push?.title || '',
          template: template.channels?.push?.template || '',
          message: template.channels?.push?.message || '',
          body: template.channels?.push?.body || ''
        }
      };

      const updatedTemplate = {
        ...template,
        channels: mappedChannels
      };

      console.log('Plantilla mapeada:', updatedTemplate);
      onChange?.(updatedTemplate);
    }
  }, [template?.id]);

  const channels = [
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'sms', name: 'SMS', icon: '💬' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '📱' },
    { id: 'in_app', name: 'In-App', icon: '🔔' }
  ];

  // Configuración de Monaco Editor para syntax highlighting
  const monacoOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    automaticLayout: true,
    wordWrap: 'on',
    theme: 'vs-dark',
    padding: { top: 8, bottom: 8 },
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible'
    }
  };



  // Función para validar la plantilla
  const validateTemplate = async () => {
    setIsValidating(true);
    try {
      const errors = {};

      // Validación básica de variables
      Object.entries(template.channels || {}).forEach(([channelId, channelConfig]) => {
        const channelErrors = [];

        if (channelConfig) {
          Object.entries(channelConfig).forEach(([field, content]) => {
            if (content && typeof content === 'string') {
              // Buscar variables no cerradas
              const openBraces = (content.match(/{{/g) || []).length;
              const closeBraces = (content.match(/}}/g) || []).length;

              if (openBraces !== closeBraces) {
                channelErrors.push(`Variables no balanceadas en ${field}`);
              }

              // Buscar variables con formato incorrecto
              const invalidVariables = content.match(/{{[^}]*$/g);
              if (invalidVariables) {
                channelErrors.push(`Variables con formato incorrecto en ${field}`);
              }
            }
          });
        }

        if (channelErrors.length > 0) {
          errors[channelId] = channelErrors;
        }
      });

      setValidationErrors(errors);

      if (onValidate) {
        await onValidate(errors);
      }

    } catch (error) {
      console.error('Error validando plantilla:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // Función para manejar cambios en el editor
  const handleEditorChange = (value, channelId, fieldId) => {
    const updatedTemplate = {
      ...template,
      channels: {
        ...template.channels,
        [channelId]: {
          ...template.channels?.[channelId],
          [fieldId]: value
        }
      }
    };

    if (onChange) {
      onChange(updatedTemplate);
    }
  };

  // Función para manejar cambios en campos específicos
  const handleFieldChange = (channelId, field, value) => {
    const updatedTemplate = {
      ...template,
      channels: {
        ...template.channels,
        [channelId]: {
          ...template.channels?.[channelId],
          [field]: value
        }
      }
    };

    if (onChange) {
      onChange(updatedTemplate);
    }
  };

  // Configuración específica por canal
  const getChannelConfig = (channelId) => {
    switch (channelId) {
      case 'email':
        return {
          fields: [
            { id: 'subject', label: 'Asunto', type: 'input' },
            { id: 'template', label: 'Plantilla', type: 'editor' },
            { id: 'body', label: 'Cuerpo', type: 'editor' },
            { id: 'html', label: 'HTML', type: 'editor' },
            { id: 'text', label: 'Texto plano', type: 'editor' }
          ]
        };
      case 'sms':
        return {
          fields: [
            { id: 'template', label: 'Plantilla', type: 'editor' },
            { id: 'message', label: 'Mensaje', type: 'editor' }
          ]
        };
      case 'whatsapp':
        return {
          fields: [
            { id: 'template', label: 'Plantilla', type: 'editor' },
            { id: 'message', label: 'Mensaje', type: 'editor' },
            { id: 'title', label: 'Título', type: 'input' }
          ]
        };
      case 'in_app':
        return {
          fields: [
            { id: 'title', label: 'Título', type: 'input' },
            { id: 'template', label: 'Plantilla', type: 'editor' },
            { id: 'message', label: 'Mensaje', type: 'editor' }
          ]
        };
      case 'push':
        return {
          fields: [
            { id: 'title', label: 'Título', type: 'input' },
            { id: 'template', label: 'Plantilla', type: 'editor' },
            { id: 'message', label: 'Mensaje', type: 'editor' },
            { id: 'body', label: 'Cuerpo', type: 'editor' }
          ]
        };
      default:
        return { fields: [] };
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <Label htmlFor="template-name" className="text-sm font-medium">
              Nombre de la Plantilla:
            </Label>
            <Input
              id="template-name"
              value={template.name || ''}
              onChange={(e) => onChange?.({ ...template, name: e.target.value })}
              placeholder="Nombre de la plantilla"
              className="w-80"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={validateTemplate}
            disabled={isValidating}
          >
            {isValidating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Validar
          </Button>

          <Button
            size="sm"
            onClick={() => onSave?.(template)}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Errores de validación */}
      {Object.keys(validationErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {Object.entries(validationErrors).map(([channel, errors]) => (
                <div key={channel}>
                  <strong>{channel.toUpperCase()}:</strong>
                  <ul className="ml-4 list-disc">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Editor principal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Code className="h-5 w-5" />
            Editor de Plantillas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs value={activeChannel} onValueChange={setActiveChannel}>
            <TabsList className="grid w-full grid-cols-4">
              {channels.map((channel) => (
                <TabsTrigger key={channel.id} value={channel.id} className="flex items-center gap-2">
                  <span>{channel.icon}</span>
                  <span>{channel.name}</span>
                  {validationErrors[channel.id] && (
                    <Badge variant="destructive" className="ml-1">
                      {validationErrors[channel.id].length}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {channels.map((channel) => (
              <TabsContent key={channel.id} value={channel.id} className="mt-6">
                <div className="space-y-6">
                  {getChannelConfig(channel.id).fields.map((field) => (
                    <div key={field.id} className="space-y-3">
                      <Label className="text-sm font-medium block">
                        {field.label}:
                      </Label>

                      {field.type === 'input' ? (
                        <Input
                          value={template.channels?.[channel.id]?.[field.id] || ''}
                          onChange={(e) => handleFieldChange(channel.id, field.id, e.target.value)}
                          placeholder={`Ingrese ${field.label.toLowerCase()}`}
                        />
                      ) : (
                        <div className="border rounded-md overflow-hidden">
                          <Editor
                            height="300px"
                            language="plaintext"
                            value={template.channels?.[channel.id]?.[field.id] || ''}
                            onChange={(value) => handleEditorChange(value, channel.id, field.id)}
                            options={monacoOptions}
                            onMount={(editor) => {
                              const editorKey = `${channel.id}_${field.id}`;
                              editorRefs.current[editorKey] = editor;
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
});

export default NotificationTemplateEditor; 