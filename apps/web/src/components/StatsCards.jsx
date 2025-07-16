import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, Calendar, CheckCircle, UserX, Users } from "lucide-react"
import { cn } from "@/lib/utils"

// Define the configuration for each card type and variant
const cardConfigurations = {
    simple: [
        {
            key: "total",
            title: "Total Órdenes",
            description: (stats) => `+${stats.thisMonth || 0} este mes`,
            icon: FileText,
            iconColor: "text-muted-foreground",
            valueColor: "text-foreground",
            cardBg: "bg-card", // Default card background
        },
        {
            key: "pending",
            title: "Pendientes",
            description: () => "Esperando contacto",
            icon: Clock,
            iconColor: "text-muted-foreground",
            valueColor: "text-foreground",
            cardBg: "bg-card",
        },
        {
            key: "scheduled",
            title: "Agendadas",
            description: () => "Con fecha confirmada",
            icon: Calendar,
            iconColor: "text-muted-foreground",
            valueColor: "text-foreground",
            cardBg: "bg-card",
        },
        {
            key: "completed",
            title: "Finalizadas",
            description: (stats) => `+${stats.completedThisWeek || 0} esta semana`,
            icon: CheckCircle,
            iconColor: "text-muted-foreground",
            valueColor: "text-foreground",
            cardBg: "bg-card",
        },
    ],
    colorful: [
        {
            key: "total",
            title: "Total",
            description: () => "Órdenes totales",
            icon: FileText,
            iconColor: "text-gray-600",
            valueColor: "text-gray-800",
            cardBg: "bg-gray-50",
        },
        {
            key: "sin_asignar",
            title: "Sin Asignar",
            description: () => "Pendientes",
            icon: UserX,
            iconColor: "text-red-500",
            valueColor: "text-red-600",
            cardBg: "bg-red-50",
        },
        {
            key: "en_gestion",
            title: "En Gestión",
            description: () => "Asignadas",
            icon: Users,
            iconColor: "text-yellow-500",
            valueColor: "text-yellow-600",
            cardBg: "bg-yellow-50",
        },
        {
            key: "agendadas",
            title: "Agendadas",
            description: () => "Con cita",
            icon: Calendar,
            iconColor: "text-green-500",
            valueColor: "text-green-600",
            cardBg: "bg-green-50",
        },
    ],
}

const StatsCards = ({ stats = {}, variant = "simple" }) => {
    const cards = cardConfigurations[variant] || cardConfigurations.simple

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => {
                const IconComponent = card.icon
                return (
                    <Card key={card.key} className={cn(card.cardBg, "shadow-sm")}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <IconComponent className={cn("h-4 w-4", card.iconColor)} />
                        </CardHeader>
                        <CardContent>
                            <div className={cn("text-2xl font-bold", card.valueColor)}>{stats[card.key] || 0}</div>
                            <CardDescription className="text-xs text-muted-foreground mt-1">
                                {typeof card.description === "function" ? card.description(stats) : card.description}
                            </CardDescription>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

export default StatsCards
