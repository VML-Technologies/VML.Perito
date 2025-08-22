# Frontend Development Patterns - Movilidad Mundial

## Estado Actual (2024)

### ✅ Sistema Validado
- **Interfaz de Administración**: Integrada en [Admin.jsx](mdc:apps/web/src/pages/Admin.jsx)
- **Sistema de Notificaciones**: Operativo sin duplicaciones
- **WebSockets**: Sistema de tiempo real funcionando
- **RBAC**: Sistema de permisos implementado
- **Componentes UI**: Consistencia con shadcn/ui

### 🔧 Problemas Resueltos
- Duplicación de notificaciones eliminada
- Interfaz de administración consolidada
- Sistema de notificaciones integrado
- Patrones de componentes estandarizados

## Component Architecture

### Notification Components

Use the established component structure for notifications:

```jsx
// ✅ Correct: Import from correct paths
import { useNotificationContext } from '@/contexts/notification-context';
import { NotificationTemplateEditor } from '@/components/NotificationTemplateEditor';
import { ChannelPreview } from '@/components/ChannelPreview';
```

### Context Usage

Always use the notification context for state management:

```jsx
// ✅ Correct: Use notification context
const { showToast, hideToast, toast } = useNotificationContext();

// Show toast with auto-hide
showToast('Operation completed successfully', 'success');
```

## Data Mapping Patterns

### API to Editor Mapping

Use standardized mapping functions:

```jsx
// ✅ Correct: Map API data to editor format
const mapTemplateForPreview = (template) => {
  return {
    ...template,
    channels: {
      email: {
        template: template.channels?.email?.template || '',
        message: template.channels?.email?.message || '',
        body: template.channels?.email?.body || '',
        html: template.channels?.email?.html || '',
        text: template.channels?.email?.text || '',
        title: template.channels?.email?.title || '',
      },
      sms: {
        template: template.channels?.sms?.template || '',
        message: template.channels?.sms?.message || '',
      },
      // ... other channels
    },
  };
};
```

### Editor to API Mapping

Map editor data to API format:

```jsx
// ✅ Correct: Map editor data to API format
const mapEditorDataToAPI = (editorData) => {
  return {
    ...editorData,
    channels: {
      email: {
        subject: editorData.channels?.email?.subject || '',
        template: editorData.channels?.email?.template || '',
        body: editorData.channels?.email?.body || '',
        html: editorData.channels?.email?.html || '',
        text: editorData.channels?.email?.text || '',
      },
      sms: {
        template: editorData.channels?.sms?.template || '',
        message: editorData.channels?.sms?.message || '',
      },
      // ... other channels
    },
  };
};
```

## Channel Configuration

### Standard Channel Fields

Use standardized field configuration for each channel:

```jsx
// ✅ Correct: Standard channel configuration
const getChannelConfig = () => ({
  email: {
    fields: ['template', 'message', 'body', 'html', 'text', 'title'],
    displayName: 'Email',
    description: 'Email notifications',
  },
  sms: {
    fields: ['template', 'message'],
    displayName: 'SMS',
    description: 'SMS notifications',
  },
  whatsapp: {
    fields: ['template', 'message', 'title'],
    displayName: 'WhatsApp',
    description: 'WhatsApp notifications',
  },
  in_app: {
    fields: ['title', 'template', 'message'],
    displayName: 'In-App',
    description: 'In-app notifications',
  },
  push: {
    fields: ['title', 'template', 'message', 'body'],
    displayName: 'Push',
    description: 'Push notifications',
  },
});
```

## Template Editor Patterns

### Monaco Editor Integration

Use Monaco Editor with proper configuration:

```jsx
// ✅ Correct: Monaco Editor setup
<MonacoEditor
  height="300px"
  language="html"
  theme="vs-dark"
  value={value}
  onChange={handleChange}
  options={{
    minimap: { enabled: false },
    fontSize: 14,
    wordWrap: 'on',
    automaticLayout: true,
  }}
/>
```

### Variable Insertion

Implement variable insertion with proper formatting:

```jsx
// ✅ Correct: Variable insertion
const insertVariable = (variable) => {
  const formattedVariable = `{{${variable}}}`;
  editorRef.current?.getAction('editor.action.insertSnippet')?.run();
  // Insert logic
};
```

## Preview Components

### Channel Preview

Use standardized preview structure:

```jsx
// ✅ Correct: Channel preview tabs
const channels = [
  { id: 'email', name: 'Email', icon: 'mail' },
  { id: 'sms', name: 'SMS', icon: 'message-circle' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'message-square' },
  { id: 'in_app', name: 'In-App', icon: 'bell' },
  { id: 'push', name: 'Push', icon: 'smartphone' },
];
```

### Preview Rendering

Render preview with proper data substitution:

```jsx
// ✅ Correct: Preview rendering
const renderPreview = (template, channel) => {
  const channelData = template.channels?.[channel];
  if (!channelData) return 'No content available';

  // Substitute variables with sample data
  return substituteVariables(channelData.template || channelData.message || '', sampleData);
};
```

## Form Handling

### Template Form Structure

Use consistent form structure for templates:

```jsx
// ✅ Correct: Template form
const [formData, setFormData] = useState({
  name: '',
  description: '',
  channels: {
    email: { template: '', subject: '' },
    sms: { message: '' },
    whatsapp: { message: '', title: '' },
    in_app: { title: '', message: '' },
    push: { title: '', message: '' },
  },
});
```

### Form Validation

Implement proper form validation:

```jsx
// ✅ Correct: Form validation
const validateForm = (data) => {
  const errors = {};

  if (!data.name.trim()) {
    errors.name = 'Template name is required';
  }

  // Validate at least one channel has content
  const hasContent = Object.values(data.channels).some((channel) =>
    Object.values(channel).some((value) => value && value.trim())
  );

  if (!hasContent) {
    errors.channels = 'At least one channel must have content';
  }

  return errors;
};
```

## API Integration

### API Calls

Use consistent API call patterns:

```jsx
// ✅ Correct: API call pattern
const createTemplate = async (templateData) => {
  try {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(mapEditorDataToAPI(templateData)),
    });

    if (!response.ok) {
      throw new Error('Failed to create template');
    }

    return await response.json();
  } catch (error) {
    showToast('Error creating template', 'error');
    throw error;
  }
};
```

## Toast Notifications

### Toast Implementation

Use the standardized toast system:

```jsx
// ✅ Correct: Toast usage
const handleSuccess = () => {
  showToast('Operation completed successfully', 'success');
};

const handleError = (error) => {
  showToast(`Error: ${error.message}`, 'error');
};

const handleInfo = () => {
  showToast('Information message', 'info');
};
```

## Key Files to Reference

### Core Components

- **NotificationTemplateEditor** ([apps/web/src/components/NotificationTemplateEditor.jsx](mdc:apps/web/src/components/NotificationTemplateEditor.jsx))
- **ChannelPreview** ([apps/web/src/components/ChannelPreview.jsx](mdc:apps/web/src/components/ChannelPreview.jsx))
- **NotificationTemplates** ([apps/web/src/pages/NotificationTemplates.jsx](mdc:apps/web/src/pages/NotificationTemplates.jsx))

### Hooks and Context

- **useNotificationContext** ([apps/web/src/contexts/notification-context.jsx](mdc:apps/web/src/contexts/notification-context.jsx))
- **useNotifications** ([apps/web/src/hooks/use-notifications.js](mdc:apps/web/src/hooks/use-notifications.js))

### Data and Utilities

- **Predefined Templates** ([apps/web/src/data/predefinedTemplates.js](mdc:apps/web/src/data/predefinedTemplates.js))
- **API Configuration** ([apps/web/src/config/api.js](mdc:apps/web/src/config/api.js))

## Best Practices

1. **Always use standardized field names** across all components
2. **Implement proper data mapping** between frontend and backend
3. **Use the notification context** for state management
4. **Follow the established component structure** for consistency
5. **Implement proper error handling** in all API calls
6. **Use the Monaco Editor** for template editing
7. **Maintain consistent preview rendering** across all channels
