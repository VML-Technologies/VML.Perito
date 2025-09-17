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

        // Código del Matomo Tag Manager (para compatibilidad con React)
        var _mtm = window._mtm = window._mtm || [];
        _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
        
        // Código del Matomo Tracker (para custom dimensions)
        var _paq = window._paq = window._paq || [];
        /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
        _paq.push(['trackPageView']);
        _paq.push(['enableLinkTracking']);
        
        (function() {
            // Extraer la URL base removiendo la parte del container
            var u = analyticsUrl.replace(/\/js\/container_[^\/]+\.js$/, '/');
            _paq.push(['setTrackerUrl', u + 'matomo.php']);
            _paq.push(['setSiteId', '10']);
            var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
            g.async = true; 
            g.src = u + 'matomo.js'; 
            s.parentNode.insertBefore(g, s);
        })();
        
        // También cargar el Tag Manager
        var d = document, 
            g = d.createElement('script'), 
            s = d.getElementsByTagName('script')[0];
        
        g.async = true; 
        g.src = analyticsUrl;
        s.parentNode.insertBefore(g, s);

        console.log('📊 Matomo Analytics inicializado correctamente (Tag Manager + Tracker)');
    }, []);
};

