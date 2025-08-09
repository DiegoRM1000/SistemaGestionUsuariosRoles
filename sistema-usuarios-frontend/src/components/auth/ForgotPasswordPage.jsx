// src/components/auth/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/axiosConfig';
import { toast } from 'react-toastify';
import { FiMail } from 'react-icons/fi'; // Importar el ícono de correo

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Llama al nuevo endpoint del backend
            const response = await apiClient.post('/auth/forgot-password', { email });

            toast.success(response.data);

            // Redirigir al usuario a una página de confirmación
            navigate('/login');

        } catch (error) {
            console.error("Error al solicitar el restablecimiento de contraseña:", error);
            const errorMessage = error.response?.data?.message || 'Ocurrió un error. Por favor, intenta de nuevo.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (

            <div className="p-7 max-w-sm sm:max-w-md w-full border border-gray-700 rounded-2xl shadow-2xl bg-white/90 backdrop-blur-md overflow-hidden animate-fade-in">
                <div className="text-center mb-6 bg-gray-300 rounded-xl p-4">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                        ¿Olvidaste tu Contraseña?
                    </h2>
                    <p className="text-base text-gray-700">
                        Ingresa tu correo para recibir un enlace de recuperación.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="my-6 text-left">
                    <div className="mb-6 relative">
                        <label htmlFor="email" className="block text-gray-800 text-base font-semibold mb-2">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Ingresa tu correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="
                                shadow-sm
                                appearance-none
                                border
                                border-gray-300
                                rounded-xl
                                w-full
                                py-3
                                px-4
                                text-gray-900
                                leading-tight
                                focus:outline-none
                                focus:ring-2
                                focus:ring-blue-600
                                focus:border-transparent
                                transition-all
                                duration-200
                                placeholder-gray-500
                            "
                            required
                        />
                        <FiMail className="absolute right-3 top-11 text-gray-400" size={20} />
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                bg-blue-700
                                hover:bg-blue-800
                                text-white
                                font-bold
                                py-3.5
                                px-6
                                rounded-xl
                                focus:outline-none
                                focus:shadow-outline
                                focus:ring-2
                                focus:ring-blue-600
                                focus:ring-opacity-75
                                w-full
                                transition-all
                                duration-300
                                ease-in-out
                                transform
                                active:scale-95
                                animate-button-press
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            {loading ? 'Enviando...' : 'Enviar Enlace'}
                        </button>
                    </div>
                </form>
                <div className="mt-4 text-center">
                    <a
                        onClick={() => navigate('/login')}
                        className="
                            inline-block
                            align-baseline
                            font-medium
                            text-sm
                            text-blue-600
                            hover:text-blue-800
                            hover:underline
                            transition-colors
                            duration-200
                            cursor-pointer
                        "
                    >
                        Volver a Iniciar Sesión
                    </a>
                </div>
            </div>

    );
};

export default ForgotPasswordPage;