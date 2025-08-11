import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthProvider';
import DashboardPage from './pages/DashboardPage.jsx';
import PrivateRoute from './components/auth/PrivateRoute';
import RoleGuard from './components/auth/RoleGuard'; // <-- Importa el nuevo componente
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
                    <Route path="/forgot-password" element={<LoginLayout><ForgotPasswordPage /></LoginLayout>} />
                    <Route path="/reset-password" element={<LoginLayout><ResetPasswordPage /></LoginLayout>} />

                    {/* RUTA PADRE PROTEGIDA POR AUTENTICACIÓN SOLAMENTE */}
                    <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>}>
                        {/* Rutas anidadas que se renderizan dentro de <Outlet /> en DashboardPage */}
                        <Route index element={<DashboardHome />} />
                        <Route path="profile" element={<ProfilePage />} />

                        {/* RUTAS PROTEGIDAS POR ROLES CON EL NUEVO RoleGuard */}
                        <Route path="users" element={<RoleGuard requiredRoles={['ADMIN', 'SUPERVISOR']}><UserManagementPage /></RoleGuard>} />
                        <Route path="users/new" element={<RoleGuard requiredRoles={['ADMIN', 'SUPERVISOR']}><CreateUserPage /></RoleGuard>} />
                        <Route path="users/edit/:id" element={<RoleGuard requiredRoles={['ADMIN', 'SUPERVISOR']}><EditUserPage /></RoleGuard>} />
                        <Route path="reports" element={<RoleGuard requiredRoles={['ADMIN', 'SUPERVISOR']}><ReportsPage /></RoleGuard>} />
                        <Route path="logs" element={<RoleGuard requiredRoles={['ADMIN', 'SUPERVISOR']}><LogsPage /></RoleGuard>} />
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