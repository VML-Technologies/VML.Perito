import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, Calendar, CheckCircle, UserX, Users } from 'lucide-react';

const StatsCards = ({ stats, variant = 'simple' }) => {
    const getIcon = (type) => {
        const icons = {
            total: FileText,
            pending: Clock,
            scheduled: Calendar,
            completed: CheckCircle,
            sin_asignar: UserX,
            en_gestion: Users,
            agendadas: Calendar
        };
        return icons[type] || FileText;
    };

    const getVariantStyles = (type, variant) => {
        if (variant === 'colorful') {
            const styles = {
                total: { iconColor: 'text-muted-foreground', valueColor: 'text-foreground' },
                sin_asignar: { iconColor: 'text-red-500', valueColor: 'text-red-600' },
                en_gestion: { iconColor: 'text-yellow-500', valueColor: 'text-yellow-500' },
                agendadas: { iconColor: 'text-green-500', valueColor: 'text-green-600' },
                pending: { iconColor: 'text-muted-foreground', valueColor: 'text-foreground' },
                scheduled: { iconColor: 'text-muted-foreground', valueColor: 'text-foreground' },
                completed: { iconColor: 'text-muted-foreground', valueColor: 'text-foreground' }
            };
            return styles[type] || { iconColor: 'text-muted-foreground', valueColor: 'text-foreground' };
        }

        return { iconColor: 'text-muted-foreground', valueColor: 'text-foreground' };
    };

    const getCardConfig = (variant) => {
        if (variant === 'colorful') {
            return [
                {
                    key: 'total',
                    title: 'Total',
                    description: 'Órdenes totales',
                    value: stats.total || 0
                },
                {
                    key: 'sin_asignar',
                    title: 'Sin Asignar',
                    description: 'Pendientes',
                    value: stats.sin_asignar || 0
                },
                {
                    key: 'en_gestion',
                    title: 'En Gestión',
                    description: 'Asignadas',
                    value: stats.en_gestion || 0
                },
                {
                    key: 'agendadas',
                    title: 'Agendadas',
                    description: 'Con cita',
                    value: stats.agendadas || 0
                }
            ];
        }

        return [
            {
                key: 'total',
                title: 'Total Órdenes',
                description: `+${stats.thisMonth || 0} este mes`,
                value: stats.total || 0
            },
            {
                key: 'pending',
                title: 'Pendientes',
                description: 'Esperando contacto',
                value: stats.pending || 0
            },
            {
                key: 'scheduled',
                title: 'Agendadas',
                description: 'Con fecha confirmada',
                value: stats.scheduled || 0
            },
            {
                key: 'completed',
                title: 'Finalizadas',
                description: `+${stats.completedThisWeek || 0} esta semana`,
                value: stats.completed || 0
            }
        ];
    };

    const cards = getCardConfig(variant);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => {
                const IconComponent = getIcon(card.key);
                const styles = getVariantStyles(card.key, variant);

                return (
                    <Card key={card.key}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <IconComponent className={`h-4 w-4 ${styles.iconColor}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${styles.valueColor}`}>
                                {card.value}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default StatsCards; 