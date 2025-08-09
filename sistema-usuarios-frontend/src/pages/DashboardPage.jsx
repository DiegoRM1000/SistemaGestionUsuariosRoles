import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Outlet, Link, Navigate } from 'react-router-dom';
import {
    FiHome, FiUsers, FiBarChart, FiFileText, FiUser, FiLogOut,
    FiChevronDown, FiMenu, FiBell
} from 'react-icons/fi';
// CORRECCIÓN CLAVE: La función getFriendlyRoleName ya no existe en roleUtils.js,
// por lo que eliminamos esta importación para resolver el error.
// import { getFriendlyRoleName } from '../utils/roleUtils.js';

const DashboardPage = () => {
    const { user, logout, userRoles, isLoading } = useAuth();
    // CORRECCIÓN: Se ha eliminado el hook useNavigate porque no se estaba usando.
    // Esto resuelve el error de ESLint.
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Cierra el dropdown si se hace clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-xl">
                Cargando dashboard...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const userInitials = user.firstName && user.lastName
        ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
        : user.username
            ? user.username.charAt(0).toUpperCase()
            : 'US';

    // Se ha corregido la variable de visualización para que coincida con los nuevos roles
    const displayRole = userRoles.length > 0 ? userRoles[0] : 'EMPLEADO';

    return (
        <div className="flex flex-col md:flex-row h-screen md:h-[100dvh] bg-gray-100 dark:bg-gray-900">
            <aside
                className={`
                fixed md:relative
                top-0 left-0 z-30
                w-64 h-screen md:h-[100dvh]
                bg-gray-800 dark:bg-gray-900 text-white
                flex-shrink-0
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
                overflow-y-auto
            `}
            >
                <div className="p-6">
                    <div className="mb-8 flex justify-center items-center">
                        <img
                            src="/src/assets/LogoEmpresa1.png"
                            alt="Logo de la Empresa"
                            className="h-16 w-auto"
                        />
                    </div>
                    <nav className="space-y-3">
                        <Link to="/dashboard" className="flex items-center p-3 rounded-lg text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-800 transition duration-200 group">
                            <FiHome className="mr-3 text-lg group-hover:text-blue-400 transition-colors" />
                            <span className="font-medium">Inicio</span>
                        </Link>

                        {/* CORRECCIÓN: Se actualizó la verificación de roles a 'ADMIN' y 'SUPERVISOR' */}
                        {(userRoles.includes('ADMIN') || userRoles.includes('SUPERVISOR')) && (
                            <Link to="/dashboard/users" className="flex items-center p-3 rounded-lg text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-800 transition duration-200 group">
                                <FiUsers className="mr-3 text-lg group-hover:text-blue-400 transition-colors" />
                                <span className="font-medium">Usuarios</span>
                            </Link>
                        )}

                        {/* CORRECCIÓN: Se actualizó la verificación de roles a 'ADMIN' y 'SUPERVISOR' */}
                        {(userRoles.includes('ADMIN') || userRoles.includes('SUPERVISOR')) && (
                            <Link to="/dashboard/reports" className="flex items-center p-3 rounded-lg text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-800 transition duration-200 group">
                                <FiBarChart className="mr-3 text-lg group-hover:text-blue-400 transition-colors" />
                                <span className="font-medium">Reportes</span>
                            </Link>
                        )}

                        {/* CORRECCIÓN: Se actualizó la verificación de rol a 'ADMIN' */}
                        {userRoles.includes('ADMIN') && (
                            <Link to="/dashboard/logs" className="flex items-center p-3 rounded-lg text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-800 transition duration-200 group">
                                <FiFileText className="mr-3 text-lg group-hover:text-blue-400 transition-colors" />
                                <span className="font-medium">Logs</span>
                            </Link>
                        )}

                        <Link to="/dashboard/profile" className="flex items-center p-3 rounded-lg text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-800 transition duration-200 group">
                            <FiUser className="mr-3 text-lg group-hover:text-blue-400 transition-colors" />
                            <span className="font-medium">Perfil</span>
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Overlay para el sidebar en móviles */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-20 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col min-h-0">
                <header className="flex-shrink-0 bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center z-20">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden"
                    >
                        <FiMenu className="text-2xl" />
                    </button>
                    <div className="text-xl font-extrabold text-gray-600 dark:text-gray-100 md:block hidden">
                        Sistema de Gestion de Usuarios y Roles
                    </div>

                    {/* Ícono de Notificaciones y User Avatar / Dropdown */}
                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none">
                            <FiBell className="text-2xl" />
                        </button>

                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200 focus:outline-none"
                            >
                                <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                                    {userInitials}
                                </div>
                                <span className="hidden md:block text-gray-800 dark:text-gray-100 font-medium">{user.firstName}</span>
                                <FiChevronDown className={`text-gray-500 dark:text-gray-300 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-40">
                                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-600">
                                        <p className="font-semibold">{user.firstName} {user.lastName}</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs">{user.email}</p>
                                        {/* CORRECCIÓN: Mostramos el rol directamente, sin la función getFriendlyRoleName */}
                                        <p className="text-blue-500 dark:text-blue-400 text-xs mt-1">{displayRole}</p>
                                    </div>
                                    <Link to="/dashboard/profile" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <FiUser className="mr-2" /> Mi Perfil
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                        <FiLogOut className="mr-2" /> Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Área de contenido dinámico */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
