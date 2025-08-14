import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mail,
  MessageSquare,
  Smartphone,
  Bell,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';

const ChannelPreview = ({ template, variables = {}, className = '' }) => {
  const [copiedChannel, setCopiedChannel] = useState(null);

  // Datos de ejemplo para el preview
  const sampleData = {
    user: {
      name: 'Juan Pérez',
      email: 'juan.perez@ejemplo.com',
      phone: '+57 300 123 4567'
    },
    inspection_order: {
      numero: 'INS-2024-001',
      status: 'Agendado',
      modality: 'En Sede',
      scheduled_date: '15/12/2024 14:30',
      vehicle_type: 'Liviano',
      vehicle_plate: 'ABC123'
    },
    appointment: {
      date: '15/12/2024',
      time: '14:30',
      duration: '1 hora',
      sede: 'CDA 197'
    },
    company: {
      name: 'VML Perito S.A.S.',
      address: 'Calle 123 #45-67, Bogotá',
      phone: '+57 1 234 5678'
    },
    sede: {
      name: 'CDA 197',
      address: 'Calle 197 #45-67, Bogotá',
      phone: '+57 1 987 6543'
    }
  };

  // Función para renderizar la plantilla con datos de ejemplo
  const renderTemplate = (content) => {
    if (!content) return 'Sin contenido';

    let rendered = content;

    // Reemplazar variables con datos de ejemplo
    Object.entries(sampleData).forEach(([category, data]) => {
      Object.entries(data).forEach(([key, value]) => {
        const variable = `{{${category}.${key}}}`;
        rendered = rendered.replace(new RegExp(variable, 'g'), value);
      });
    });

    return rendered;
  };

  const copyToClipboard = async (text, channel) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedChannel(channel);
      setTimeout(() => setCopiedChannel(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const channels = [
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="h-4 w-4" />,
      color: 'bg-blue-500',
      preview: template?.channels?.email?.template ? (
        <div className="space-y-3">
          <div className="border-b pb-2">
            <div className="text-sm font-medium text-muted-foreground">Asunto:</div>
            <div className="text-sm">{renderTemplate(template.channels.email.subject || 'Sin asunto')}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Plantilla:</div>
            <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
              {renderTemplate(template.channels.email.template)}
            </div>
          </div>
          {template.channels.email.body && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Cuerpo:</div>
              <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                {renderTemplate(template.channels.email.body)}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Sin configuración de email</div>
      )
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: <MessageSquare className="h-4 w-4" />,
      color: 'bg-green-500',
      preview: template?.channels?.sms?.template ? (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Plantilla:</div>
          <div className="text-sm bg-muted p-3 rounded">
            {renderTemplate(template.channels.sms.template)}
          </div>
          <div className="text-xs text-muted-foreground">
            Caracteres: {renderTemplate(template.channels.sms.template).length}/160
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Sin configuración de SMS</div>
      )
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <Smartphone className="h-4 w-4" />,
      color: 'bg-green-600',
      preview: template?.channels?.whatsapp?.template ? (
        <div className="space-y-2">
          {template.channels.whatsapp.title && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Título:</div>
              <div className="text-sm font-medium">{renderTemplate(template.channels.whatsapp.title)}</div>
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-muted-foreground">Plantilla:</div>
            <div className="text-sm bg-muted p-3 rounded">
              {renderTemplate(template.channels.whatsapp.template)}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Sin configuración de WhatsApp</div>
      )
    },
    {
      id: 'in_app',
      name: 'In-App',
      icon: <Bell className="h-4 w-4" />,
      color: 'bg-purple-500',
      preview: template?.channels?.in_app?.template ? (
        <div className="space-y-3">
          {template.channels.in_app.title && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Título:</div>
              <div className="text-sm font-medium">{renderTemplate(template.channels.in_app.title)}</div>
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-muted-foreground">Plantilla:</div>
            <div className="text-sm bg-muted p-3 rounded">
              {renderTemplate(template.channels.in_app.template)}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Sin configuración de In-App</div>
      )
    },
    {
      id: 'push',
      name: 'Push',
      icon: <Bell className="h-4 w-4" />,
      color: 'bg-orange-500',
      preview: template?.channels?.push?.template ? (
        <div className="space-y-3">
          {template.channels.push.title && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Título:</div>
              <div className="text-sm font-medium">{renderTemplate(template.channels.push.title)}</div>
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-muted-foreground">Plantilla:</div>
            <div className="text-sm bg-muted p-3 rounded">
              {renderTemplate(template.channels.push.template)}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Sin configuración de Push</div>
      )
    }
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Preview por Canal
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {channels.map((channel) => (
              <TabsTrigger key={channel.id} value={channel.id} className="flex items-center gap-2">
                {channel.icon}
                <span className="hidden sm:inline">{channel.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {channels.map((channel) => (
            <TabsContent key={channel.id} value={channel.id} className="mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${channel.color}`}></div>
                    <span className="font-medium">{channel.name}</span>
                  </div>
                  {template?.channels?.[channel.id] && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(
                        JSON.stringify(template.channels[channel.id], null, 2),
                        channel.id
                      )}
                      className="h-7"
                    >
                      {copiedChannel == channel.id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>

                <div className="border rounded-lg p-4 bg-background">
                  {channel.preview}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChannelPreview; 