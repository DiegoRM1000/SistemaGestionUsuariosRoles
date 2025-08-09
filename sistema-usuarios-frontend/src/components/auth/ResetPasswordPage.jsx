// src/components/auth/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../utils/axiosConfig';
// Importamos los íconos de verificación y error
import { FiLock, FiCheckCircle, FiXCircle } from 'react-icons/fi';


const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);
    const [passwordValidations, setPasswordValidations] = useState({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });


    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            toast.error('Token de recuperación no encontrado.');
            navigate('/forgot-password');
        }
    }, [searchParams, navigate]);

    // ⬅️ NUEVA FUNCIÓN PARA MANEJAR CAMBIOS EN LA CONTRASEÑA
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setPasswordValidations({
            minLength: value.length >= 8,
            hasUpperCase: /[A-Z]/.test(value),
            hasLowerCase: /[a-z]/.test(value),
            hasNumber: /[0-9]/.test(value),
            hasSpecialChar: /[!@#$%^&+=]/.test(value),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        setLoading(true);

        try {
            const response = await apiClient.post('/auth/reset-password', {
                token,
                newPassword: password
            });

            toast.success(response.data);
            navigate('/login');

        } catch (error) {
            console.error("Error al restablecer la contraseña:", error);
            const errorMessage = error.response?.data?.message || 'Ocurrió un error. Por favor, intenta de nuevo.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
    }

    return (
        <div className="p-7 max-w-sm sm:max-w-md w-full border border-gray-700 rounded-2xl shadow-2xl bg-white/90 backdrop-blur-md overflow-hidden animate-fade-in">
            <div className="text-center mb-6 bg-gray-300 rounded-xl p-4">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                    Restablecer Contraseña
                </h2>
                <p className="text-base text-gray-700">
                    Ingresa tu nueva contraseña
                </p>
            </div>

            <form onSubmit={handleSubmit} className="my-6 text-left">
                <div className="mb-6 relative">
                    <label htmlFor="password" className="block text-gray-800 text-base font-semibold mb-2">
                        Nueva Contraseña
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        value={password}
                        onChange={handlePasswordChange}
                        className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-3 px-4 pr-10 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                        required
                    />
                    <FiLock className="absolute right-3 top-11 text-gray-400" size={20} />
                </div>

                {/* ⬅️ LISTA DE VERIFICACIÓN DINÁMICA */}
                {password && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <p className={`flex items-center ${passwordValidations.minLength ? 'text-green-500' : 'text-red-500'}`}>
                            {passwordValidations.minLength ? <FiCheckCircle className="mr-2" /> : <FiXCircle className="mr-2" />}
                            Mínimo 8 caracteres
                        </p>
                        <p className={`flex items-center ${passwordValidations.hasUpperCase ? 'text-green-500' : 'text-red-500'}`}>
                            {passwordValidations.hasUpperCase ? <FiCheckCircle className="mr-2" /> : <FiXCircle className="mr-2" />}
                            Una letra mayúscula
                        </p>
                        <p className={`flex items-center ${passwordValidations.hasLowerCase ? 'text-green-500' : 'text-red-500'}`}>
                            {passwordValidations.hasLowerCase ? <FiCheckCircle className="mr-2" /> : <FiXCircle className="mr-2" />}
                            Una letra minúscula
                        </p>
                        <p className={`flex items-center ${passwordValidations.hasNumber ? 'text-green-500' : 'text-red-500'}`}>
                            {passwordValidations.hasNumber ? <FiCheckCircle className="mr-2" /> : <FiXCircle className="mr-2" />}
                            Un número
                        </p>
                        <p className={`flex items-center ${passwordValidations.hasSpecialChar ? 'text-green-500' : 'text-red-500'}`}>
                            {passwordValidations.hasSpecialChar ? <FiCheckCircle className="mr-2" /> : <FiXCircle className="mr-2" />}
                            Un carácter especial
                        </p>
                    </div>
                )}

                <div className="mb-6 relative">
                    <label htmlFor="confirmPassword" className="block text-gray-800 text-base font-semibold mb-2">
                        Confirmar Contraseña
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repite la nueva contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-3 px-4 pr-10 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                        required
                    />
                    <FiLock className="absolute right-3 top-11 text-gray-400" size={20} />
                </div>

                <div className="flex items-center justify-between mt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 px-6 rounded-xl focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-600 focus:ring-opacity-75 w-full transition-all duration-300 ease-in-out transform active:scale-95 animate-button-press disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResetPasswordPage;