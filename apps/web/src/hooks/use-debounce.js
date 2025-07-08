import { useCallback, useRef } from 'react';

/**
 * Hook personalizado para debounce
 * @param {Function} callback - Función a ejecutar después del delay
 * @param {number} delay - Delay en milisegundos
 * @returns {Function} - Función debounced
 */
const useDebounce = (callback, delay) => {
    const timeoutRef = useRef(null);

    const debouncedCallback = useCallback((...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);

    return debouncedCallback;
};

export default useDebounce; 