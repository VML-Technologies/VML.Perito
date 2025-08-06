import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    FileText,
    User,
    Calendar,
    Car,
    Plus,
    Eye
} from 'lucide-react';
import { getAllPredefinedTemplates, getTemplatesByCategory } from '@/data/predefinedTemplates';

const PredefinedTemplates = ({ onSelectTemplate, className = '' }) => {
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = [
        { id: 'all', name: 'Todas', icon: <FileText className="h-4 w-4" /> },
        { id: 'user', name: 'Usuario', icon: <User className="h-4 w-4" /> },
        { id: 'appointment', name: 'Cita', icon: <Calendar className="h-4 w-4" /> },
        { id: 'inspection_order', name: 'Inspección', icon: <Car className="h-4 w-4" /> }
    ];

    const getTemplates = () => {
        if (activeCategory === 'all') {
            return getAllPredefinedTemplates();
        }
        return getTemplatesByCategory(activeCategory);
    };

    const handleSelectTemplate = (template) => {
        // Mapear la plantilla predefinida al formato del editor
        const mappedTemplate = {
            name: template.name,
            description: template.description,
            category: template.category,
            channels: {
                email: template.channels?.email ? {
                    subject: template.channels.email.subject || '',
                    body: template.channels.email.template || ''
                } : undefined,
                sms: template.channels?.sms ? {
                    message: template.channels.sms.template || ''
                } : undefined,
                whatsapp: template.channels?.whatsapp ? {
                    message: template.channels.whatsapp.template || ''
                } : undefined,
                in_app: template.channels?.in_app ? {
                    title: template.channels.in_app.title || '',
                    message: template.channels.in_app.template || ''
                } : undefined
            }
        };

        onSelectTemplate(mappedTemplate);
    };

    const getChannelCount = (template) => {
        return Object.keys(template.channels || {}).length;
    };

    const getChannelIcons = (template) => {
        const icons = [];
        if (template.channels?.email) icons.push('📧');
        if (template.channels?.sms) icons.push('💬');
        if (template.channels?.whatsapp) icons.push('📱');
        if (template.channels?.in_app) icons.push('🔔');
        return icons;
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Plantillas Predefinidas
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                        <TabsList className="grid w-full grid-cols-4">
                            {categories.map((category) => (
                                <TabsTrigger
                                    key={category.id}
                                    value={category.id}
                                    className="flex items-center gap-2"
                                >
                                    {category.icon}
                                    <span>{category.name}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value={activeCategory} className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {getTemplates().map((template) => (
                                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-sm">{template.name}</h3>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {template.description}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">
                                                        {getChannelCount(template)} canales
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-1">
                                                        {getChannelIcons(template).map((icon, index) => (
                                                            <span key={index} className="text-sm">{icon}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleSelectTemplate(template)}
                                                        className="flex-1"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Usar Plantilla
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {getTemplates().length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No hay plantillas predefinidas en esta categoría</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default PredefinedTemplates; 