import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';
import { setAuthDataForInterceptors } from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

export const AuthProvider = ({ children }) => {
    // Inicializamos el estado del usuario y los roles con los valores de localStorage.
    // Usamos un estado para isLoading que será true al principio para evitar el renderizado prematuro.
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [token, setToken] = useState(localStorage.getItem('jwtToken'));
    // El backend devuelve un solo rol, lo almacenamos en un array para consistencia
    const [userRoles, setUserRoles] = useState(localStorage.getItem('userRoles') ? JSON.parse(localStorage.getItem('userRoles')) : []);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const logout = useCallback(() => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRoles');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        setToken(null);
        setUserRoles([]);
        setUser(null);
        toast.info('Has cerrado sesión correctamente.');
        navigate('/login');
    }, [navigate]);

    const login = useCallback(async (email, password) => {
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email,
                password,
            });

            const { accessToken, id, firstName, lastName, email: userEmail, dni, role } = response.data;

            const userFromLogin = {
                id,
                firstName,
                lastName,
                email: userEmail,
                dni,
                role
            };

            const rolesFromLogin = [role];

            localStorage.setItem('jwtToken', accessToken);
            localStorage.setItem('user', JSON.stringify(userFromLogin));
            localStorage.setItem('userRoles', JSON.stringify(rolesFromLogin));
            localStorage.setItem('userRole', role);

            setToken(accessToken);
            setUser(userFromLogin);
            setUserRoles(rolesFromLogin);

            toast.success('¡Inicio de sesión exitoso!');
            setIsLoading(false);
            navigate('/dashboard');

            return { success: true };
        } catch (error) {
            console.error('Login fallido desde AuthProvider:', error);
            let errorMessage = 'Error desconocido al iniciar sesión.';
            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'Credenciales inválidas. Por favor, verifica tu email y contraseña.';
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.data;
                } else {
                    errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
                }
            } else if (error.request) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet o la disponibilidad del servidor.';
            } else {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
            setIsLoading(false);
            return { success: false, message: errorMessage };
        }
    }, [navigate]);

    useEffect(() => {
        setAuthDataForInterceptors(logout, navigate);
    }, [logout, navigate]);

    useEffect(() => {
        const storedToken = localStorage.getItem('jwtToken');
        const storedUser = localStorage.getItem('user');
        const storedRoles = localStorage.getItem('userRoles');

        // Se verifica si todos los datos necesarios están en localStorage
        // Si es así, se actualiza el estado.
        if (storedToken && storedUser && storedRoles) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setUserRoles(JSON.parse(storedRoles));
        }

        // Finalmente, una vez que el useEffect ha terminado de evaluar
        // el estado de localStorage, se establece isLoading en false.
        setIsLoading(false);
    }, []);

    const authContextValue = {
        isAuthenticated: !!token,
        user,
        userRoles,
        token,
        isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};
