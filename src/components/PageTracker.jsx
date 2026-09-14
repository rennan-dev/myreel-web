import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageview } from '../lib/analytics';

/**
 * Dispara um pageview a cada mudança de rota.
 * Deve ser renderizado dentro do <BrowserRouter>.
 */
export function PageTracker() {
    const location = useLocation();
    const lastPath = useRef(null);

    useEffect(() => {
        const path = location.pathname + location.search;
        if (lastPath.current !== path) {
            lastPath.current = path;
            trackPageview(path);
        }
    }, [location]);

    return null;
}