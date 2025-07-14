import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Calendar, CalendarDays } from 'lucide-react';
import TimeSlotSelector from './TimeSlotSelector';

const CalendarioAgendamiento = ({
    sedeId,
    modalityId,
    onSlotSelect,
    selectedSlot,
    disabled = false,
    onDateChange // NUEVO PROP
}) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' o 'week'

    // Inicializar con fecha de mañana
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow.toISOString().split('T')[0]);
    }, []);

    const getDaysInMonth = useCallback((date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Días del mes anterior para completar la primera semana
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const prevDate = new Date(year, month, -i);
            days.push({
                date: prevDate,
                isCurrentMonth: false,
                isToday: false,
                isSelectable: false
            });
        }

        // Días del mes actual
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const today = new Date();
            const isToday = date.toDateString() === today.toDateString();
            const isSelectable = date >= today; // Solo fechas de hoy en adelante

            days.push({
                date,
                isCurrentMonth: true,
                isToday,
                isSelectable
            });
        }

        // Días del siguiente mes para completar la última semana
        const remainingCells = 42 - days.length; // 6 semanas * 7 días
        for (let day = 1; day <= remainingCells; day++) {
            const nextDate = new Date(year, month + 1, day);
            days.push({
                date: nextDate,
                isCurrentMonth: false,
                isToday: false,
                isSelectable: false
            });
        }

        return days;
    }, []);

    const getWeekDays = useCallback((date) => {
        const startOfWeek = new Date(date);
        const dayOfWeek = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);

            const today = new Date();
            const isToday = day.toDateString() === today.toDateString();
            const isSelectable = day >= today;

            weekDays.push({
                date: day,
                isCurrentMonth: true,
                isToday,
                isSelectable
            });
        }

        return weekDays;
    }, []);

    const navigateMonth = useCallback((direction) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(currentMonth.getMonth() + direction);
        setCurrentMonth(newMonth);
    }, [currentMonth]);

    const navigateWeek = useCallback((direction) => {
        const newDate = new Date(currentMonth);
        newDate.setDate(currentMonth.getDate() + (direction * 7));
        setCurrentMonth(newDate);
    }, [currentMonth]);

    const handleDateSelect = useCallback((date) => {
        if (!date.isSelectable || disabled) return;

        const dateString = date.date.toISOString().split('T')[0];
        setSelectedDate(dateString);
        if (onDateChange) {
            onDateChange(dateString); // Notificar al padre
        }
    }, [disabled, onDateChange]);

    const isDateSelected = useCallback((date) => {
        return date.date.toISOString().split('T')[0] === selectedDate;
    }, [selectedDate]);

    const formatMonthYear = useCallback((date) => {
        return date.toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric'
        });
    }, []);

    const formatWeekRange = useCallback((date) => {
        const startOfWeek = new Date(date);
        const dayOfWeek = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const startMonth = startOfWeek.toLocaleDateString('es-ES', { month: 'short' });
        const endMonth = endOfWeek.toLocaleDateString('es-ES', { month: 'short' });

        if (startMonth === endMonth) {
            return `${startOfWeek.getDate()}-${endOfWeek.getDate()} ${startMonth} ${startOfWeek.getFullYear()}`;
        } else {
            return `${startOfWeek.getDate()} ${startMonth} - ${endOfWeek.getDate()} ${endMonth} ${startOfWeek.getFullYear()}`;
        }
    }, []);

    const formatDate = useCallback((date) => {
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }, []);

    // Memoizar días para evitar recálculos innecesarios
    const days = useMemo(() => {
        return viewMode === 'calendar' ? getDaysInMonth(currentMonth) : getWeekDays(currentMonth);
    }, [viewMode, currentMonth, getDaysInMonth, getWeekDays]);

    const weekDays = useMemo(() => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'], []);

    return (
        <div className="space-y-6">
            {/* Selector de Fecha */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Seleccionar Fecha
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('calendar')}
                            >
                                <Calendar className="h-4 w-4 mr-1" />
                                Mes
                            </Button>
                            <Button
                                variant={viewMode === 'week' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('week')}
                            >
                                <CalendarDays className="h-4 w-4 mr-1" />
                                Semana
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Navegación */}
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewMode === 'calendar' ? navigateMonth(-1) : navigateWeek(-1)}
                            disabled={disabled}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <h3 className="font-semibold text-lg capitalize">
                            {viewMode === 'calendar'
                                ? formatMonthYear(currentMonth)
                                : formatWeekRange(currentMonth)
                            }
                        </h3>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewMode === 'calendar' ? navigateMonth(1) : navigateWeek(1)}
                            disabled={disabled}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Encabezados de días */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map((day) => (
                            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendario */}
                    <div className={`grid grid-cols-7 gap-1 ${viewMode === 'week' ? 'mb-0' : ''}`}>
                        {days.map((day) => (
                            <Button
                                key={`${day.date.toISOString().split('T')[0]}-${day.isCurrentMonth ? 'current' : 'other'}`}
                                variant={isDateSelected(day) ? 'default' : 'ghost'}
                                size="sm"
                                type="button"
                                className={`
                                    h-10 p-1 text-sm transition-all
                                    ${!day.isCurrentMonth ? 'text-gray-300' : ''}
                                    ${!day.isSelectable ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-blue-50'}
                                    ${day.isToday ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                                    ${isDateSelected(day) ? 'ring-2 ring-blue-500' : ''}
                                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                onClick={() => handleDateSelect(day)}
                                disabled={!day.isSelectable || disabled}
                            >
                                {day.date.getDate()}
                                {day.isToday && (
                                    <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                            </Button>
                        ))}
                    </div>

                    {/* Fecha seleccionada */}
                    {selectedDate && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800">
                                Fecha seleccionada: {formatDate(new Date(selectedDate + 'T00:00:00'))}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Selector de Horarios */}
            {selectedDate && sedeId && modalityId && (
                <TimeSlotSelector
                    sedeId={sedeId}
                    modalityId={modalityId}
                    selectedDate={selectedDate}
                    onSlotSelect={onSlotSelect}
                    selectedSlot={selectedSlot}
                    disabled={disabled}
                />
            )}

            {/* Mensaje si faltan parámetros */}
            {selectedDate && (!sedeId || !modalityId) && (
                <Card>
                    <CardContent className="py-8">
                        <div className="text-center text-gray-500">
                            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>Selecciona sede, modalidad y tipo de inspección para ver horarios disponibles</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default React.memo(CalendarioAgendamiento); 