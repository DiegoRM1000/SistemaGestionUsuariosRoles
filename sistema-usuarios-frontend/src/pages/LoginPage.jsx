// src/components/auth/LoginPage.jsx
import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLock } from 'react-icons/fa';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [twoFactorVerificationCode, setTwoFactorVerificationCode] = useState('');

    // Obtiene los estados y funciones de 2FA desde el contexto
    const { login, twoFactorRequired, verify2FA, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        await login(email, password);

        // El AuthProvider ya maneja el éxito y la redirección al dashboard
        // si el 2FA no es requerido. No se necesita más lógica aquí.
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        await verify2FA(twoFactorVerificationCode);
        // La navegación se maneja en el AuthProvider
    };

    // Si se requiere 2FA, muestra el formulario de verificación
    if (twoFactorRequired) {
        return (
            <div className="flex flex-col items-center justify-center p-7 max-w-sm w-full border rounded-2xl shadow-2xl bg-white/90 backdrop-blur-md">
                <div className="text-center mb-8">
                    <FaLock size={50} className="mx-auto mb-4 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Verificación de Dos Factores</h2>
                    <p className="text-gray-600 mt-2">
                        Ingresa el código de 6 dígitos de tu aplicación de autenticación.
                    </p>
                </div>
                <form onSubmit={handleVerify2FA} className="w-full">
                    <div className="mb-4">
                        <input
                            type="text"
                            value={twoFactorVerificationCode}
                            onChange={(e) => setTwoFactorVerificationCode(e.target.value)}
                            placeholder="Código de 6 dígitos"
                            className="input-field text-center"
                            maxLength="6"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-6 rounded-xl w-full"
                        disabled={isLoading} // Deshabilita el botón mientras se verifica
                    >
                        {isLoading ? 'Verificando...' : 'Verificar'}
                    </button>
                </form>
            </div>
        );
    }

    // De lo contrario, muestra el formulario de login normal
    return (
        <div
            className="p-7 max-w-sm sm:max-w-md md:max-w-lg w-full border border-gray-700 rounded-2xl shadow-2xl bg-white/90 backdrop-blur-md overflow-hidden animate-fade-in"
        >
            <div className="text-center mb-10 bg-gray-300 rounded-xl p-4 ">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
                    Bienvenido al Sistema
                </h2>
                <p className="text-base sm:text-lg text-gray-700">
                    Inicia sesión en tu cuenta
                </p>
            </div>
            <div className="my-6 text-left">
                <form onSubmit={handleLogin}>
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-gray-800 text-base font-semibold mb-2">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Ingresa tu correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                            required
                        />
                    </div>
                    <div className="mb-4 relative">
                        <label htmlFor="password" className="block text-gray-800 text-base font-semibold mb-2">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow-sm appearance-none border border-gray-300 rounded-xl w-full py-3 px-4 pr-10 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors duration-200 mt-8"
                        >
                            {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                        </button>
                    </div>
                    <div className="text-right mb-8">
                        <a
                            onClick={() => navigate('/forgot-password')}
                            className="inline-block align-baseline font-medium text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 cursor-pointer"
                        >
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                        <button
                            type="submit"
                            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 px-6 rounded-xl focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-600 focus:ring-opacity-75 w-full transition-all duration-300 ease-in-out transform active:scale-95 animate-button-press"
                            disabled={isLoading} // Deshabilita el botón mientras se carga
                        >
                            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;