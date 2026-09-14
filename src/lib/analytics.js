const API_URL = import.meta.env.VITE_API_URL || '';

const VISITOR_KEY = 'mr_visitor_id';
const SESSION_KEY = 'mr_session_id';

function uuid() {
    if (window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/** Identificador persistente do visitante (localStorage). */
export function getVisitorId() {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
        id = uuid();
        localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
}

/** Identificador da sessão de navegação (sessionStorage). */
export function getSessionId() {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
        id = uuid();
        sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
}

/**
 * Registra um pageview na API. Não lança erro para não afetar a navegação.
 */
export function trackPageview(path) {
    if (!API_URL) return;

    try {
        const payload = {
            event_type: 'pageview',
            path: String(path || '/').slice(0, 255),
            referrer: document.referrer || '',
            visitor_id: getVisitorId(),
            session_id: getSessionId(),
        };

        fetch(`${API_URL}/analytics/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true,
        }).catch(() => {});
    } catch {
        // analytics nunca deve quebrar o app
    }
}