import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // 1. Mostrar un estado de carga mientras se obtienen los datos.
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-xl">
                Cargando...
            </div>
        );
    }

    // 2. Después de que la carga ha terminado, verificar la autenticación.
    //    Si NO está autenticado, redirigir al login.
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Si la carga terminó y el usuario está autenticado, renderizar el contenido.
    //    La verificación de roles se maneja en el componente RoleGuard.
    return children ? children : <Outlet />;
};

export default PrivateRoute;