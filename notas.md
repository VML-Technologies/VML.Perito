bien, ahora para los usuariosde rol inspector_aliado, vamos a crear una pagina @InspectorAliado.jsx donde tengamos:

- pagina dividida a 2 de manera vertical
    - parte izq
        - formulario de busqueda de ordenes de inspeccion por placa
        - al ingresar la placa y hacer click en buscar, se debe mostrar la orden de inspeccion en caso de que exista
            - si no existe, se debe mostrar un mensaje de que la orden de inspeccion no existe
            - si existe, se debe mostrar la informacion de la orden de inspeccion
                - la informacion de la orden de inspeccion debe ser:
                    - placa
                    - cliente
                    - telefono
                    - correo
                - un input tipo select para ingresar un tiempo de espera para inspeccion, debe ser un campo de tipo select con los siguientes valores (generados de manera dinamia a partir de 3 variables: inicio=20, fin=140, intervalo=5):
                        - +20 minutos
                        - +25 minutos
                        - +30 minutos
                        - +35 minutos
                        - +40 minutos
                        - ...
                - un boton para crear una agendamiento de inspeccion, donde
                    - sede_id: la sede del usuario autenticado
                    - inspection_order_id: order.id,
                    - inspection_modality_id: inspection_modalities.id donde code == 'SEDE',
                    - user_id: id del usuario autenticado,
                    - scheduled_date: new Date().toISOString().split('T')[0],
                    - scheduled_time: new Date().toTimeString().split(' ')[0],
                    - session_id: 
                        ```js
                        const generateSessionId = () => {
                            const timestamp = Date.now();
                            const random = Math.random().toString(36).substring(2, 10);
                            return `session_${timestamp}_${random}`;
                        };

                        const sessionId = generateSessionId();```,
                    - status: 'pending'                
    - Parte derecha:
        -En una tabla debe mostrar las ordenes de inspeccion agendadas por el CDA (sede del usuario logueado)
        - La tabla debe tener las siguientes columnas:
            - placa
            - cliente
            - telefono
            - correo
            - fecha de agendamiento
            - hora de agendamiento
            - boton de iniciar inspeccion que debe abrir en otra ventana un link del tipo: `VITE_INSPECTYA_URL/inspector/view/{agendamiento.session_id}`
            - debe tener un boton de actualizar, que debe actualizar el estado del agendamiento, segun este en DB

VITE_INSPECTYA_URL, ya existe en el .env de frontend



