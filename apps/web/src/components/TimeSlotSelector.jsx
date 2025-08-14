import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Clock, Users, AlertCircle } from 'lucide-react';
import { API_ROUTES } from '../config/api';
import useDebounce from '../hooks/use-debounce';

const TimeSlotSelector = ({
    sedeId,
    modalityId,
    selectedDate,
    onSlotSelect,
    selectedSlot,
    disabled = false
}) => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cache, setCache] = useState(new Map());

    // Función debounced para cargar slots
    const debouncedLoadSlots = useDebounce((sedeId, modalityId, selectedDate) => {
        loadAvailableSlots(sedeId, modalityId, selectedDate);
    }, 300);

    // Cargar slots cuando cambien los parámetros (con debounce)
    useEffect(() => {
        if (sedeId && modalityId && selectedDate) {
            debouncedLoadSlots(sedeId, modalityId, selectedDate);
        } else {
            setSlots([]);
        }
    }, [sedeId, modalityId, selectedDate, debouncedLoadSlots]);

    const loadAvailableSlots = async (sedeId, modalityId, selectedDate) => {
        // Verificar cache primero
        const cacheKey = `${sedeId}-${modalityId}-${selectedDate}`;
        if (cache.has(cacheKey)) {
            setSlots(cache.get(cacheKey));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('authToken');
            const params = new URLSearchParams({
                sedeId,
                modalityId,
                date: selectedDate
            });

            const response = await fetch(`${API_ROUTES.SCHEDULES.AVAILABLE}?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar horarios disponibles');
            }

            const data = await response.json();
            const slotsData = data.data || [];

            // Guardar en cache
            setCache(prev => new Map(prev).set(cacheKey, slotsData));
            setSlots(slotsData);
        } catch (error) {
            console.error('Error loading time slots:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSlotClick = useCallback((templateId, slot) => {
        if (disabled) return;

        const slotData = {
            templateId,
            startTime: slot.start_time,
            endTime: slot.end_time,
            availableCapacity: slot.available_capacity,
            totalCapacity: slot.total_capacity
        };

        onSlotSelect?.(slotData);
    }, [disabled, onSlotSelect]);

    const isSlotSelected = useCallback((templateId, startTime) => {
        return selectedSlot?.templateId == templateId && selectedSlot?.startTime == startTime;
    }, [selectedSlot]);

    const getCapacityColor = useCallback((available, total) => {
        const percentage = (available / total) * 100;
        if (percentage >= 70) return 'bg-green-100 text-green-800';
        if (percentage >= 40) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    }, []);

    const formatTime = useCallback((timeString) => {
        return timeString.slice(0, 5); // HH:MM
    }, []);

    // Memoizar slots para evitar re-renders innecesarios
    const memoizedSlots = useMemo(() => slots, [slots]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Horarios Disponibles
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {[...Array(8)].map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Horarios Disponibles
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
                        <AlertCircle className="h-5 w-5" />
                        <span>{error}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!memoizedSlots.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Horarios Disponibles
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No hay horarios disponibles para la fecha seleccionada</p>
                        <p className="text-sm mt-2">Intenta con otra fecha o modalidad</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Horarios Disponibles - {selectedDate}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                    Selecciona un horario para agendar la inspección
                </p>
            </CardHeader>
            <CardContent>
                {memoizedSlots.map((templateData) => (
                    <div key={templateData.template.id} className="mb-6 last:mb-0">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">
                                {templateData.template.name}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                                {formatTime(templateData.template.start_time)} - {formatTime(templateData.template.end_time)}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {templateData.slots.map((slot) => (
                                <Button
                                    key={`${templateData.template.id}-${slot.start_time}`}
                                    variant={isSlotSelected(templateData.template.id, slot.start_time) ? "default" : "outline"}
                                    size="sm"
                                    type="button"
                                    className={`
                                        h-auto p-3 flex flex-col items-center gap-1 transition-all
                                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                                        ${isSlotSelected(templateData.template.id, slot.start_time) ? 'ring-2 ring-blue-500' : ''}
                                    `}
                                    onClick={() => handleSlotClick(templateData.template.id, slot)}
                                    disabled={disabled}
                                >
                                    <div className="font-medium">
                                        {formatTime(slot.start_time)}
                                    </div>
                                    <div className="text-xs opacity-75">
                                        {formatTime(slot.end_time)}
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={`text-xs px-2 py-0 ${getCapacityColor(slot.available_capacity, slot.total_capacity)}`}
                                    >
                                        <Users className="h-3 w-3 mr-1" />
                                        {slot.available_capacity}/{slot.total_capacity}
                                    </Badge>
                                </Button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Leyenda */}
                {/* <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Leyenda de capacidad:</p>
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
                            <span>Alta disponibilidad (70%+)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></div>
                            <span>Media disponibilidad (40-70%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
                            <span>Baja disponibilidad (&lt;40%)</span>
                        </div>
                    </div>
                </div> */}
            </CardContent>
        </Card>
    );
};

export default React.memo(TimeSlotSelector); 