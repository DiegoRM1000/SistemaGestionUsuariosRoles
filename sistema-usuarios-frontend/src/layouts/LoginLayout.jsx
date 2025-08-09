import React from 'react';
import LoginPage from '../pages/LoginPage'; // Ajusta la ruta si es necesario

function LoginLayout({ children }) {
    return (
        <div
            className="
                bg-cover bg-center
                min-h-screen
                flex items-center justify-center
                relative
                bg-gray-100 dark:bg-gray-900
            "
            style={{backgroundImage: "url('/src/assets/FondoLogin.jpg')"}} // <-- Tu imagen de fondo
        >
            <div className="absolute inset-0 bg-black opacity-30"></div>
            {children}
        </div>
    );
};

export default LoginLayout;