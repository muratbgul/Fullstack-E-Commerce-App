

export function decodeToken(token) {
    if (!token) return null;
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
        const payload = JSON.parse(atob(padded));
        
        return {
            email: payload?.sub || payload?.email || '',
            role: payload?.role || 'USER'
        };
    } catch (error) {
        console.error('Token çözülürken hata oluştu:', error);
        return null;
    }
}

export function getEmailFromToken(token) {
    const decoded = decodeToken(token);
    return decoded ? decoded.email : '';
}

export function getRoleFromToken(token) {
    const decoded = decodeToken(token);
    return decoded ? decoded.role : 'USER';
}
