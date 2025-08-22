---
description: Patrones de diseño de componentes UI para VML.Perito, incluyendo sistema de diseño basado en shadcn/ui y Lucide React, layout autenticado con sidebar, estructura de páginas estándar, patrones de modales/Sheet, formularios con validación, tablas responsivas, estados de carga, badges de estado, integración de notificaciones, guías de iconos, y diseño responsive.
alwaysApply: false
---

# UI Component Patterns & Design System

## Design System Foundation

### Component Library

Using **shadcn/ui** components with **Lucide React** icons consistently throughout the application.

### Core Components Location

All UI components in [apps/web/src/components/ui/](mdc:apps/web/src/components/ui/) directory.

## Layout Patterns

### Authenticated Layout

[apps/web/src/Layouts/AuthenticatedLayout.jsx](mdc:apps/web/src/Layouts/AuthenticatedLayout.jsx) provides:

- Sidebar navigation with role-based menu items
- Main content area with proper spacing
- Notification system integration

### Sidebar Navigation

[apps/web/src/components/app-sidebar.jsx](mdc:apps/web/src/components/app-sidebar.jsx) includes:

- Role-based visibility using `useRoles()` hook
- Grouped navigation sections
- Icon + text navigation items
- User profile section in footer

## Page Layout Structure

### Standard Page Pattern

```jsx
<div className="space-y-6">
  {/* Header Section */}
  <div className="flex justify-between items-center">
    <div>
      <h1 className="text-3xl font-bold">Page Title</h1>
      <p className="text-muted-foreground">Description</p>
    </div>
    <Button>Primary Action</Button>
  </div>

  {/* Statistics/Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{/* Stat cards */}</div>

  {/* Main Content */}
  <Tabs defaultValue="main">{/* Content */}</Tabs>
</div>
```

### Examples

- [apps/web/src/pages/ComercialMundial.jsx](mdc:apps/web/src/pages/ComercialMundial.jsx) - Dashboard with stats and table
- [apps/web/src/pages/AgenteContacto.jsx](mdc:apps/web/src/pages/AgenteContacto.jsx) - List with side panel

## Modal/Sheet Patterns

### Sheet Modal for Forms

[apps/web/src/components/CreateOrderModal.jsx](mdc:apps/web/src/components/CreateOrderModal.jsx) demonstrates:

```jsx
<Sheet open={isOpen} onOpenChange={onClose}>
  <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Title with Icon</SheetTitle>
      <SheetDescription>Description</SheetDescription>
    </SheetHeader>
    <form onSubmit={handleSubmit}>{/* Form sections in Cards */}</form>
  </SheetContent>
</Sheet>
```

### Form Organization

- Group related fields in `Card` components
- Use `CardHeader` with icons for section titles
- Responsive grid layouts: `grid grid-cols-1 md:grid-cols-2 gap-4`

## Form Patterns

### Input Validation Display

```jsx
<div>
  <Label htmlFor="field">Field Name *</Label>
  <Input
    id="field"
    className={errors.field ? 'border-red-500' : ''}
    value={formData.field}
    onChange={(e) => handleInputChange('field', e.target.value)}
  />
  {errors.field && (
    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      {errors.field}
    </p>
  )}
</div>
```

### Select Cascading Pattern

```jsx
// Department → City → Sede pattern
<Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    {items.map((item) => (
      <SelectItem key={item.id} value={item.id.toString()}>
        {item.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

## Table Patterns

### Responsive Table with Actions

```jsx
<div className="overflow-x-auto">
  <table className="w-full border-collapse">
    <thead>
      <tr className="border-b">
        <th className="text-left p-2">Column</th>
      </tr>
    </thead>
    <tbody>
      {data.map((item) => (
        <tr key={item.id} className="border-b hover:bg-muted/50">
          <td className="p-2">{item.data}</td>
          <td className="p-2">
            <Button size="sm" variant="outline">
              Action
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### Empty States

```jsx
{
  items.length === 0 && (
    <tr>
      <td colSpan="6" className="text-center p-8">
        <div className="text-muted-foreground">
          <Icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No items found</p>
          <p className="text-sm">Description or action suggestion</p>
        </div>
      </td>
    </tr>
  );
}
```

## Loading States

### Page Loading

```jsx
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
```

### Button Loading

```jsx
<Button disabled={loading}>
  {loading ? (
    <div className="flex items-center gap-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      Processing...
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4" />
      Action Text
    </div>
  )}
</Button>
```

## Status Badge Patterns

### Dynamic Badge Variants

```jsx
const getStatusBadgeVariant = (status) => {
  const variants = {
    success_status: 'default',
    warning_status: 'outline',
    error_status: 'destructive',
    neutral_status: 'secondary',
  };
  return variants[status] || 'secondary';
};

<Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>;
```

## Notification Integration

### Toast Usage Pattern

```jsx
import { useNotificationContext } from '@/contexts/notification-context';

const { showToast } = useNotificationContext();

// Usage
showToast('Success message', 'success');
showToast('Warning message', 'warning');
showToast('Error message', 'error');
showToast('Info message', 'info');
```

### Key Integration Point

Never use browser `alert()` - always use toast notifications for better UX as defined in [apps/web/src/contexts/notification-context.jsx](mdc:apps/web/src/contexts/notification-context.jsx).

## Icon Usage Guidelines

### Consistent Icon Library

- Use **Lucide React** icons exclusively
- Import pattern: `import { IconName } from 'lucide-react'`
- Standard size: `h-4 w-4` for inline, `h-5 w-5` for headers

### Common Icon Mappings

- `User` - User/client related
- `Phone` - Contact/communication
- `Car` - Vehicle related
- `MapPin` - Location/geographic
- `Calendar` - Dates/scheduling
- `CheckCircle` - Success states
- `AlertCircle` - Warnings/errors
- `Building` - Company/organization
- `FileText` - Documents/orders

## Responsive Design Patterns

### Grid Responsiveness

```jsx
// Stats cards
className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4';

// Form fields
className = 'grid grid-cols-1 md:grid-cols-2 gap-4';

// Full width on mobile, constrained on larger screens
className = 'w-full sm:max-w-4xl';
```

### Mobile-First Approach

- Start with mobile layout
- Use `md:` prefix for tablet breakpoints
- Use `lg:` prefix for desktop breakpoints

## 📚 Referencias Relacionadas

- [**Texto en Español**](./spanish-ui-text.md) - Guías de textos
- [**Sistema de Notificaciones**](./Notificaciones.md) - Notificaciones en la UI
- [**Patrones Frontend**](./frontend-development-patterns.md) - Patrones específicos de frontend
- [**Sistema Principal**](./vml-perito-system.md) - Arquitectura del sistema

---

**Última actualización**: Enero 2025  
**Estado**: ✅ Implementado