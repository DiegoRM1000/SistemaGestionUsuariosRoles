import React from 'react';
import { useAuth } from '../../context/AuthContext';
// CORRECCIÓN CLAVE: La función getFriendlyRoleName ya no existe,
// por lo que se elimina la importación para solucionar el error.
// import { getFriendlyRoleName } from '../../utils/roleUtils';

const DashboardHome = () => {
    const { user, userRoles } = useAuth();

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md min-h-[calc(100vh-160px)] flex flex-col justify-center items-center">
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-4 text-center">
                ¡Bienvenido, {user?.firstName || 'Usuario'}!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2 text-center max-w-2xl">
                {/* CORRECCIÓN: Mostramos el rol directamente del array userRoles */}
                Tu rol actual es: <span className="font-bold text-blue-600 dark:text-blue-400">{userRoles[0]}</span>
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 text-center max-w-2xl">
                Este es el panel principal de tu sistema. Utiliza el menú de la izquierda para navegar por las diferentes secciones y gestionar tu trabajo de manera eficiente.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-2">Métricas Rápidas</h3>
                    <p className="text-blue-700 dark:text-blue-300">Resumen de tus datos y actividades principales.</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900 p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">Tareas Pendientes</h3>
                    <p className="text-green-700 dark:text-green-300">Revisa y gestiona tus tareas más urgentes.</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900 p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Notificaciones</h3>
                    <p className="text-yellow-700 dark:text-yellow-300">Mantente al día con las últimas alertas del sistema.</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
