import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthProvider';
import DashboardPage from './pages/DashboardPage.jsx';
import PrivateRoute from './components/auth/PrivateRoute';
import LoginLayout from "./layouts/LoginLayout.jsx";
import DashboardHome from './components/dashboard/DashboardHome';

import UserManagementPage from './components/users/UserManagementPage';
import ReportsPage from './components/reports/ReportsPage';
import LogsPage from './components/logs/LogsPage';
import ProfilePage from './components/profile/ProfilePage';
import CreateUserPage from "./components/users/CreateUserPage.jsx";
import EditUserPage from "./components/users/EditUserPage.jsx";
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import LoginPage from "./pages/LoginPage.jsx";
import ResetPasswordPage from "./components/auth/ResetPasswordPage.jsx";

const AppRoutes = () => {
    return (
        <Router>
            <AuthProvider>

                <Routes>

                    <Route path="/login" element={<LoginLayout><LoginPage /></LoginLayout>} />
                     {/* ⬅️ NUEVA RUTA para el formulario de recuperación */}
                    <Route path="/forgot-password" element={<LoginLayout><ForgotPasswordPage /></LoginLayout>} />
                    <Route path="/reset-password" element={<LoginLayout><ResetPasswordPage /></LoginLayout>} />


                    {/* Ruta protegida para el Dashboard Layout */}
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute requiredRoles={['ADMIN', 'EMPLEADO', 'SUPERVISOR']}>
                                <DashboardPage />
                            </PrivateRoute>
                        }
                    >
                        {/* Rutas anidadas que se renderizan dentro de <Outlet /> en DashboardPage */}
                        <Route index element={<DashboardHome />} />
                        <Route path="users" element={<UserManagementPage />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="logs" element={<LogsPage />} />
                        <Route path="profile" element={<ProfilePage />} />

                        {/* ------------------------------------------------------------- */}
                        {/* Rutas para Crear y Editar Usuario (Nuevas) */}
                        {/* ------------------------------------------------------------- */}
                        <Route path="users/new" element={<CreateUserPage />} />
                        <Route path="users/edit/:id" element={<EditUserPage />} />

                    </Route>

                    {/* Redirección por defecto y 404 */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<h1>404 - Página No Encontrada</h1>} />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default AppRoutes;