import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // Importa los íconos de ojo
import { useNavigate } from 'react-router-dom'; // ¡Importa useNavigate!
import { useAuth } from '../context/AuthContext'; // ¡Importa useAuth desde el contexto!
import { toast } from 'react-toastify'; // ¡Importa toast para el éxito!

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Estado para la visibilidad de la contraseña

    const navigate = useNavigate(); // ¡Inicializa useNavigate!
    const { login } = useAuth(); // ¡Obtiene la función 'login' del contexto!

    const handleLogin = async (e) => {
        e.preventDefault();

        // ¡AHORA LLAMAMOS A LA FUNCIÓN LOGIN DEL CONTEXTO!
        const result = await login(email, password);

        if (result.success) {
            console.log('Login exitoso desde LoginPage!');
            // CORRECCIÓN CLAVE: Eliminamos el toast.success aquí.
            // AuthProvider ya lo maneja para evitar notificaciones duplicadas.
            // ¡AHORA TODOS SE REDIRIGEN AL MISMO PUNTO DE ENTRADA DEL DASHBOARD LAYOUT!
            navigate('/dashboard');

        } else {
            // El error ya se maneja y notifica desde AuthProvider con toast.error
            console.log('Login fallido (notificado desde AuthProvider):', result.message);
        }
    };

    return (
        <div
            className="
                p-7
                max-w-sm
                sm:max-w-md
                md:max-w-lg
                w-full
                border
                border-gray-700
                rounded-2xl
                shadow-2xl
                bg-white/90
                backdrop-blur-md
                overflow-hidden
                animate-fade-in
            "
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
                            className="
                                shadow-sm
                                appearance-none
                                border
                                border-gray-300
                                rounded-xl
                                w-full
                                py-3
                                px-4
                                pr-10
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
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="
                                absolute
                                inset-y-0
                                right-0
                                pr-3
                                flex
                                items-center
                                text-sm
                                leading-5
                                text-gray-600
                                hover:text-gray-900
                                focus:outline-none
                                transition-colors
                                duration-200
                                mt-8
                            "
                        >
                            {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                        </button>
                    </div>

                    <div className="text-right mb-8">
                        <a
                            // ⬅️ CAMBIO: Enlazar con una nueva ruta
                            onClick={() => navigate('/forgot-password')}
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
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <button
                            type="submit"
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
                            "
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;