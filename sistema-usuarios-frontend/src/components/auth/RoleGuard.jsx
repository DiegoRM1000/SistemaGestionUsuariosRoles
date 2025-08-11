import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Navigate } from 'react-router-dom';

const RoleGuard = ({ children, requiredRoles }) => {
    const { userRoles, isLoading } = useAuth();

    // 1. Muestra un estado de carga mientras se obtienen los datos del usuario.
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-xl">
                Cargando...
            </div>
        );
    }

    // 2. Si no hay roles requeridos para la ruta, permite el acceso.
    if (!requiredRoles || requiredRoles.length === 0) {
        return children;
    }

    // 3. Verifica si el usuario tiene al menos uno de los roles requeridos.
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (hasRequiredRole) {
        return children;
    } else {
        // 4. Si el usuario no tiene el rol, muestra un error y redirige al dashboard.
        toast.error('No tienes los permisos necesarios para acceder a esta página.');
        return <Navigate to="/dashboard" replace />;
    }
};

export default RoleGuard;