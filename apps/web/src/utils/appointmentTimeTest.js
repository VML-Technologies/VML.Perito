// Utilidad para probar diferentes escenarios de tiempo de agendamiento
export const createTestAppointment = (minutesFromNow) => {
    const now = new Date();
    const appointmentTime = new Date(now.getTime() + (minutesFromNow * 60 * 1000));
    
    return {
        id: 1,
        scheduled_date: appointmentTime.toISOString().split('T')[0],
        scheduled_time: `${appointmentTime.getHours().toString().padStart(2, '0')}:${appointmentTime.getMinutes().toString().padStart(2, '0')}`,
        session_id: 'test_session_123',
        status: 'pending',
        sede: {
            id: 1,
            name: 'CDA Test',
            address: 'Calle Test 123'
        },
        modality: {
            id: 1,
            name: 'Virtual',
            code: 'VIRTUAL'
        }
    };
};

// Función para calcular tiempo restante (para testing)
export const calculateTimeUntilAppointment = (appointment) => {
    if (!appointment?.scheduled_date || !appointment?.scheduled_time) {
        return null;
    }
    
    const now = new Date();
    const appointmentDate = new Date(appointment.scheduled_date);
    const [hours, minutes] = appointment.scheduled_time.split(':');
    appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    
    return minutesDiff;
};

// Escenarios de prueba
export const testScenarios = {
    // Agendamiento en 10 minutos (debe mostrar contador)
    future10: () => createTestAppointment(10),
    
    // Agendamiento en 3 minutos (debe mostrar contador)
    future3: () => createTestAppointment(3),
    
    // Agendamiento en 1 minuto (debe mostrar botón)
    future1: () => createTestAppointment(1),
    
    // Agendamiento ahora (debe mostrar botón)
    now: () => createTestAppointment(0),
    
    // Agendamiento hace 2 minutos (debe mostrar botón)
    past2: () => createTestAppointment(-2),
    
    // Agendamiento hace 10 minutos (debe mostrar botón)
    past10: () => createTestAppointment(-10)
};
