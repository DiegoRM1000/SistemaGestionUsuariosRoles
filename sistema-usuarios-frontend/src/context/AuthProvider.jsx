// src/components/context/AuthProvider.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';
import { setAuthDataForInterceptors } from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

export const AuthProvider = ({ children }) => {
    // AÑADE 'avatarUrl' al estado inicial del usuario
    const initialUser = JSON.parse(localStorage.getItem('user')) || { avatarUrl: null };
    const [user, setUser] = useState(initialUser);
    const [token, setToken] = useState(localStorage.getItem('jwtToken'));
    const [userRoles, setUserRoles] = useState(localStorage.getItem('userRoles') ? JSON.parse(localStorage.getItem('userRoles')) : []);
    const [isLoading, setIsLoading] = useState(true);

    const [tempToken, setTempToken] = useState(null);
    const [twoFactorRequired, setTwoFactorRequired] = useState(false);

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

    // ➡️ CORRECCIÓN: La función `updateUserAvatar` debe manejar la URL completa para el estado
    const updateUserAvatar = (newAvatarUrl) => {
        setUser(prevUser => {
            const updatedUser = { ...prevUser, avatarUrl: newAvatarUrl };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', { email, password });

            if (response.data["2faRequired"]) {
                setTwoFactorRequired(true);
                setTempToken(response.data.token);
                toast.info('Se requiere un código de verificación de dos factores.');
                setIsLoading(false);
                return { success: true, twoFactorRequired: true };
            } else {
                const { accessToken, id, firstName, lastName, email: userEmail, dni, role, avatarUrl } = response.data;

                // ➡️ CORRECCIÓN CLAVE: El backend ya devuelve la URL completa.
                const fullAvatarUrl = avatarUrl;

                // Usar la URL completa para el estado y el localStorage
                const userFromLogin = { id, firstName, lastName, email: userEmail, dni, role, avatarUrl: fullAvatarUrl };
                const rolesFromLogin = [role];

                localStorage.setItem('jwtToken', accessToken);
                // ➡️ CORRECCIÓN: Guarda `userFromLogin` que contiene la URL completa
                localStorage.setItem('user', JSON.stringify(userFromLogin));
                localStorage.setItem('userRoles', JSON.stringify(rolesFromLogin));
                localStorage.setItem('userRole', role);

                setToken(accessToken);
                setUser(userFromLogin);
                setUserRoles(rolesFromLogin);

                toast.success('¡Inicio de sesión exitoso!');
                setIsLoading(false);
                navigate('/dashboard');

                return { success: true, twoFactorRequired: false };
            }
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

    const verify2FA = useCallback(async (verificationCode) => {
        setIsLoading(true);
        try {
            // ➡️ CORRECCIÓN CLAVE: Agrega esta línea para hacer la llamada a la API y
            // guardar la respuesta en la variable 'response'.
            const response = await axios.post('http://localhost:8080/api/auth/verify-2fa', { verificationCode }, {
                headers: { 'Authorization': `Bearer ${tempToken}` }
            });

            // Ahora 'response' está definida y podemos usarla.
            const { accessToken, id, firstName, lastName, email: userEmail, dni, role, avatarUrl } = response.data;

            // El resto de la lógica de guardado en localStorage y estado
            // del usuario
            const fullAvatarUrl = avatarUrl;
            const userFromLogin = { id, firstName, lastName, email: userEmail, dni, role, avatarUrl: fullAvatarUrl };
            const rolesFromLogin = [role];

            localStorage.setItem('jwtToken', accessToken);
            localStorage.setItem('user', JSON.stringify(userFromLogin));
            localStorage.setItem('userRoles', JSON.stringify(rolesFromLogin));
            localStorage.setItem('userRole', role);

            setToken(accessToken);
            setUser(userFromLogin);
            setUserRoles(rolesFromLogin);
            setTempToken(null);
            setTwoFactorRequired(false);

            toast.success('Verificación de 2FA exitosa. ¡Bienvenido!');
            setIsLoading(false);
            navigate('/dashboard');

            return { success: true };
        } catch (error) {
            console.error('Error al verificar 2FA:', error);
            const errorMessage = error.response?.data?.message || 'Código de verificación incorrecto. Intenta de nuevo.';
            toast.error(errorMessage);
            setIsLoading(false);
            return { success: false, message: errorMessage };
        }
    }, [tempToken, navigate]);

    useEffect(() => {
        setAuthDataForInterceptors(logout, navigate);
    }, [logout, navigate]);

    useEffect(() => {
        const storedToken = localStorage.getItem('jwtToken');
        const storedUser = localStorage.getItem('user');
        const storedRoles = localStorage.getItem('userRoles');

        if (storedToken && storedUser && storedRoles) {
            setToken(storedToken);
            const parsedUser = JSON.parse(storedUser);

            // ➡️ CORRECCIÓN CLAVE: No construyas la URL de nuevo. Úsala directamente.
            // La URL que viene del backend ya es completa.
            setUser(parsedUser);

            setUserRoles(JSON.parse(storedRoles));
        }

        setIsLoading(false);
    }, []); // Este array de dependencias debe estar vacío

    const authContextValue = {
        isAuthenticated: !!token,
        user,
        userRoles,
        token,
        isLoading,
        login,
        logout,
        verify2FA,
        twoFactorRequired,
        updateUserAvatar, // ➡️ AÑADE LA NUEVA FUNCIÓN AQUÍ
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};