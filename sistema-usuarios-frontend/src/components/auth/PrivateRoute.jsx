import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * @description Un componente de ruta privada que verifica la autenticación y los roles del usuario.
 * @param {object} props Las propiedades del componente.
 * @param {string[]} props.requiredRoles Un array de roles requeridos.
 * @param {React.ReactNode} props.children El componente hijo a renderizar si el usuario tiene permiso.
 */
const PrivateRoute = ({ children, requiredRoles }) => {
    const { isAuthenticated, isLoading, userRoles } = useAuth();

    // El hook useEffect ahora se llama incondicionalmente en la parte superior,
    // pero la lógica de las alertas se ha ajustado para evitar duplicados.
    useEffect(() => {
        if (!isLoading) {
            // El toast de "Debes iniciar sesión" no es necesario aquí, ya que el componente
            // de logout ya lo maneja y la redirección es suficiente.
            // Mantenemos solo el toast para la falta de roles, que es una lógica diferente.
            if (isAuthenticated) {
                const hasRequiredRole = requiredRoles && requiredRoles.length > 0
                    ? requiredRoles.some(role => userRoles.includes(role))
                    : true;

                if (!hasRequiredRole) {
                    console.warn(`Acceso Denegado: Usuario con roles '${userRoles.join(', ')}' intentó acceder a una ruta que requiere: ${requiredRoles.join(', ')}`);
                    toast.error('No tienes los permisos necesarios para acceder a esta página.');
                }
            }
        }
    }, [isAuthenticated, isLoading, requiredRoles, userRoles]);

    // 1. Manejar el estado de carga
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-xl">
                Verificando autenticación...
            </div>
        );
    }

    // 2. Manejar la redirección de forma declarativa con Navigate
    if (!isAuthenticated) {
        // Redirigimos sin mostrar un toast, ya que la alerta de cierre de sesión
        // ya se ha mostrado.
        return <Navigate to="/login" replace />;
    }

    // 3. Manejar la autorización (roles)
    const hasRequiredRole = requiredRoles && requiredRoles.length > 0
        ? requiredRoles.some(role => userRoles.includes(role))
        : true;

    if (!hasRequiredRole) {
        // Aquí sí es apropiado el toast, ya que es una denegación de acceso
        // inesperada para el usuario autenticado.
        return <Navigate to="/dashboard" replace />;
    }

    // 4. Si todo es correcto, renderizar el componente hijo.
    return children ? children : <Outlet />;
};

export default PrivateRoute;
