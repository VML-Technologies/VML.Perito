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
            cardBg: "bg-card", // Default card backgr10und
        },
        {
            key: "pending",
            title: "Pendientes",
            description: () => "Esperando contacto",
            icon: Clock,
            iconColor: "text-muted-foreground",
            valueColor: "text-foreground",
            cardBg: "bg-ca10d",
        },
        {
            key: "scheduled",
            title: "Agendadas",
            description: () => "Con fecha confirmada",
            icon: Calendar,
            iconColor: "text-muted-foreground",
            valueColor: "text-foreground",
            cardBg: "bg-ca10d",
        },
        {
            key: "completed",
            title: "Finalizadas",
            description: (stats) => `+${stats.completedThisWeek || 0} esta semana`,
            icon: CheckCircle,
            iconColor: "text-muted-foreground",
            valueColor: "text-foreground",
            cardBg: "bg-ca10d",
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
            cardBg: "bg-gray-100",
        },
        {
            key: "sin_asignar",
            title: "Sin Asignar",
            description: () => "Pendientes",
            icon: UserX,
            iconColor: "text-red-500",
            valueColor: "text-red-600",
            cardBg: "bg-red-100",
        },
        {
            key: "en_gestion",
            title: "En Gestión",
            description: () => "Asignadas",
            icon: Users,
            iconColor: "text-yellow-500",
            valueColor: "text-yellow-600",
            cardBg: "bg-yellow-100",
        },
        {
            key: "agendadas",
            title: "Agendadas",
            description: () => "Con cita",
            icon: Calendar,
            iconColor: "text-green-500",
            valueColor: "text-green-600",
            cardBg: "bg-green-100",
        },
    ],
}

const StatsCards = ({ stats = {}, variant = "simple", role = null }) => {
    let cards = cardConfigurations[variant] || cardConfigurations.simple

    // comercial mostrar solo total
    if (role === "comercial") {
        cards = cards.filter((card) => card.key === "total")
    }

    return (
        <div className="flex gap-4 md:flex-row flex-col">
            {cards.map((card) => {
                const IconComponent = card.icon
                return (
                    <div key={card.key} className={`${card.cardBg} shadow-sm w-full p-4 rounded-lg`}>
                        <div>
                            <div className="flex justify-between">
                                <div className="flex items-center gap-2">
                                    <IconComponent className={cn("h-4 w-4", card.iconColor)} />
                                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                </div>
                                <div className={cn("text-2xl font-bold", card.valueColor)}>{stats[card.key] || 0}</div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default StatsCards
