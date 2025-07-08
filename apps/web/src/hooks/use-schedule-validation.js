import { useState, useEffect, useCallback } from 'react';
import { API_ROUTES } from '../config/api';

const useScheduleValidation = () => {
    const [validationState, setValidationState] = useState({
        isValidating: false,
        errors: {},
        warnings: {},
        isValid: false
    });

    // Validar disponibilidad de slot en tiempo real
    const validateSlotAvailability = useCallback(async (sedeId, modalityId, selectedDate, selectedTime) => {
        if (!sedeId || !modalityId || !selectedDate || !selectedTime) {
            return { isValid: false, error: 'Faltan parámetros requeridos' };
        }

        setValidationState(prev => ({ ...prev, isValidating: true }));

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
                throw new Error('Error al validar disponibilidad');
            }

            const data = await response.json();
            const slots = data.data || [];

            // Buscar el slot específico
            let slotFound = false;
            let availableCapacity = 0;

            for (const templateData of slots) {
                const slot = templateData.slots.find(s => s.start_time === selectedTime);
                if (slot) {
                    slotFound = true;
                    availableCapacity = slot.available_capacity;
                    break;
                }
            }

            const isValid = slotFound && availableCapacity > 0;

            setValidationState(prev => ({
                ...prev,
                isValidating: false,
                isValid,
                errors: isValid ? {} : {
                    slot: slotFound ? 'No hay capacidad disponible' : 'Horario no disponible'
                },
                warnings: availableCapacity === 1 ? {
                    capacity: 'Último cupo disponible'
                } : {}
            }));

            return {
                isValid,
                availableCapacity,
                error: isValid ? null : (slotFound ? 'No hay capacidad disponible' : 'Horario no disponible')
            };

        } catch (error) {
            console.error('Error validating slot:', error);
            setValidationState(prev => ({
                ...prev,
                isValidating: false,
                isValid: false,
                errors: { api: 'Error al validar disponibilidad' }
            }));

            return { isValid: false, error: 'Error al validar disponibilidad' };
        }
    }, []);

    // Validar compatibilidad de modalidad con sede
    const validateModalityCompatibility = useCallback(async (sedeId, modalityId) => {
        if (!sedeId || !modalityId) {
            return { isValid: false, error: 'Faltan parámetros requeridos' };
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_ROUTES.CONTACT_AGENT.AVAILABLE_SEDES}?modalityId=${modalityId}&cityId=1`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al validar compatibilidad');
            }

            const data = await response.json();
            const availableSedes = data.data || [];

            const isCompatible = availableSedes.some(sede => sede.id.toString() === sedeId.toString());

            setValidationState(prev => ({
                ...prev,
                errors: isCompatible ? { ...prev.errors } : {
                    ...prev.errors,
                    compatibility: 'La modalidad seleccionada no está disponible en esta sede'
                }
            }));

            return {
                isValid: isCompatible,
                error: isCompatible ? null : 'La modalidad seleccionada no está disponible en esta sede'
            };

        } catch (error) {
            console.error('Error validating compatibility:', error);
            return { isValid: false, error: 'Error al validar compatibilidad' };
        }
    }, []);

    // Validar fecha seleccionada
    const validateDate = useCallback((selectedDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selected = new Date(selectedDate + 'T00:00:00');

        if (selected < today) {
            setValidationState(prev => ({
                ...prev,
                errors: { ...prev.errors, date: 'No puedes seleccionar fechas pasadas' },
                isValid: false
            }));
            return { isValid: false, error: 'No puedes seleccionar fechas pasadas' };
        }

        // Validar que no sea más de 30 días en el futuro
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);

        if (selected > maxDate) {
            setValidationState(prev => ({
                ...prev,
                warnings: { ...prev.warnings, date: 'Fecha muy lejana, considera seleccionar una fecha más próxima' }
            }));
        }

        // Limpiar error de fecha si es válida
        setValidationState(prev => ({
            ...prev,
            errors: { ...prev.errors, date: undefined }
        }));

        return { isValid: true };
    }, []);

    // Validación completa del formulario
    const validateCompleteForm = useCallback(async (formData) => {
        const { sedeId, modalityId, selectedDate, selectedTime } = formData;

        setValidationState(prev => ({ ...prev, isValidating: true, errors: {}, warnings: {} }));

        const validations = await Promise.all([
            validateDate(selectedDate),
            validateModalityCompatibility(sedeId, modalityId),
            validateSlotAvailability(sedeId, modalityId, selectedDate, selectedTime)
        ]);

        const isFormValid = validations.every(v => v.isValid);
        const errors = validations.filter(v => v.error).map(v => v.error);

        setValidationState(prev => ({
            ...prev,
            isValidating: false,
            isValid: isFormValid,
            errors: errors.length > 0 ? { form: errors } : {}
        }));

        return {
            isValid: isFormValid,
            errors: errors,
            validations: validations
        };
    }, [validateDate, validateModalityCompatibility, validateSlotAvailability]);

    // Limpiar validaciones
    const clearValidations = useCallback(() => {
        setValidationState({
            isValidating: false,
            errors: {},
            warnings: {},
            isValid: false
        });
    }, []);

    // Validar en tiempo real cuando cambian los parámetros
    const validateRealTime = useCallback(async (sedeId, modalityId, selectedDate, selectedTime) => {
        if (!sedeId || !modalityId) {
            clearValidations();
            return;
        }

        if (selectedDate) {
            validateDate(selectedDate);
        }

        if (sedeId && modalityId) {
            await validateModalityCompatibility(sedeId, modalityId);
        }

        if (selectedDate && selectedTime) {
            await validateSlotAvailability(sedeId, modalityId, selectedDate, selectedTime);
        }
    }, [validateDate, validateModalityCompatibility, validateSlotAvailability, clearValidations]);

    return {
        validationState,
        validateSlotAvailability,
        validateModalityCompatibility,
        validateDate,
        validateCompleteForm,
        validateRealTime,
        clearValidations
    };
};

export default useScheduleValidation; 