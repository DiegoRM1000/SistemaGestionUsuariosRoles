import axios from 'axios';
import { toast } from 'react-toastify';

let authDataForInterceptors = {
    logout: () => console.warn('Logout function not yet set for interceptors.'),
    navigate: () => console.warn('Navigate function not yet set for interceptors.'),
};

export const setAuthDataForInterceptors = (logoutFn, navigateFn) => {
    authDataForInterceptors.logout = logoutFn;
    authDataForInterceptors.navigate = navigateFn;
};

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRedirecting = false;

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const { status, config } = error.response;

            if (status === 401 && !config.url.includes('/auth/login') && !isRedirecting) {
                isRedirecting = true; // Establece la bandera
                console.error('Error 401: Token expirado o inválido. Redirigiendo a login.');
                toast.error('Tu sesión ha expirado o es inválida. Por favor, inicia sesión de nuevo.');
                authDataForInterceptors.logout();
                authDataForInterceptors.navigate('/login');

                // Reinicia la bandera después de un tiempo prudente
                setTimeout(() => {
                    isRedirecting = false;
                }, 2000);

                return Promise.reject(error);
            }

            if (status === 403) {
                toast.error('No tienes permiso para realizar esta acción.');
            } else if (status >= 500) {
                toast.error('Ha ocurrido un error en el servidor. Inténtalo de nuevo más tarde.');
            } else if (status >= 400 && status < 500) {
                const errorMessage = error.response.data?.message || 'Error en la solicitud.';
                toast.error(errorMessage);
            }
        } else if (error.request) {
            toast.error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        } else {
            toast.error('Ha ocurrido un error inesperado.');
        }

        return Promise.reject(error);
    }
);

export default apiClient;