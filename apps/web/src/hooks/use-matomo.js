import { useEffect } from 'react';

export const useMatomo = () => {
    useEffect(() => {
        const analyticsUrl = import.meta.env.VITE_ANALYTICS_URL;
        
        if (!analyticsUrl) {
            console.warn('⚠️ VITE_ANALYTICS_URL no está configurada - Matomo no se inicializará');
            return;
        }

        // Verificar si ya está inicializado para evitar duplicados
        if (window._mtm) {
            console.log('📊 Matomo ya está inicializado');
            return;
        }

        // Código del Matomo Tag Manager
        var _mtm = window._mtm = window._mtm || [];
        _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
        
        var d = document, 
            g = d.createElement('script'), 
            s = d.getElementsByTagName('script')[0];
        
        g.async = true; 
        g.src = analyticsUrl;
        s.parentNode.insertBefore(g, s);

        console.log('📊 Matomo Analytics inicializado correctamente');
    }, []);
};

