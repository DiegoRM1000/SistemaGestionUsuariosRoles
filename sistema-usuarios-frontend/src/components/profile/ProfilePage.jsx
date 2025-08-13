// src/components/profile/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiCalendar, FiPhone, FiLock, FiKey, FiCamera, FiSave, FiCheckCircle, FiXCircle, FiRefreshCcw } from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';

const ProfilePage = () => {
    // Importa 'token' y `updateUserAvatar` desde useAuth para usarlo en las peticiones
    // AÑADIMOS updateUserAvatar
    const { user, logout, updateUserAvatar } = useAuth();
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        dni: '',
        dateOfBirth: '',
        phoneNumber: '',
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('general');

    // ESTADO PARA LA URL DEL AVATAR. YA NO ES TEMPORAL.
    const [avatarUrl, setAvatarUrl] = useState('');

    const [qrCodeData, setQrCodeData] = useState('');
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [twoFactorVerificationCode, setTwoFactorVerificationCode] = useState('');
    const [is2FALoading, setIs2FALoading] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [passwordValidations, setPasswordValidations] = useState({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });

    // ➡️ ELIMINAMOS LA FUNCIÓN fetchAvatar() QUE YA NO ES NECESARIA

    const fetchUserProfile = async () => {
        try {
            const response = await apiClient.get('/users/me');
            const userData = response.data;
            setProfileData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                dni: userData.dni || '',
                dateOfBirth: userData.dateOfBirth || '',
                phoneNumber: userData.phoneNumber || '',
            });
            setTwoFactorEnabled(userData.twoFactorEnabled);

            // ➡️ USAMOS DIRECTAMENTE LA URL DEL AVATAR QUE DEVUELVE EL BACKEND
            if (userData.avatarUrl) {
                setAvatarUrl(`http://localhost:8080${userData.avatarUrl}`);
            } else {
                setAvatarUrl('');
            }
        } catch (error) {
            console.error("Error al obtener el perfil del usuario:", error);
            toast.error("No se pudo cargar la información del perfil.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [user]);

    // ➡️ ELIMINAMOS ESTE useEffect COMPLETO QUE YA NO ES NECESARIO
    // useEffect(() => {
    //     fetchAvatar();
    //
    //     return () => {
    //         if (avatarTempUrl) {
    //             URL.revokeObjectURL(avatarTempUrl);
    //         }
    //     };
    // }, [avatarFilename, token]);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiClient.post('/users/me/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // ➡️ CORRECCIÓN: Construimos la URL completa para el frontend
            const newAvatarPath = response.data;
            const newAvatarUrl = `http://localhost:8080${newAvatarPath}`;

            // Actualizamos el estado local y el estado global (AuthProvider)
            setAvatarUrl(newAvatarUrl);
            updateUserAvatar(newAvatarUrl); // ⬅️ Le pasamos la URL completa

            toast.success('Foto de perfil actualizada con éxito. 🎉');

        } catch (error) {
            console.error('Error al subir el avatar:', error);
            toast.error('Error al subir la foto. Intenta de nuevo.');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.patch('/users/me', profileData);
            setProfileData(response.data);
            toast.success('Datos de perfil actualizados con éxito.');
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            const errorMessage = error.response?.data?.message || 'Error al actualizar el perfil. Verifica los datos.';
            toast.error(errorMessage);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));

        if (name === 'newPassword') {
            setPasswordValidations({
                minLength: value.length >= 8,
                hasUpperCase: /[A-Z]/.test(value),
                hasLowerCase: /[a-z]/.test(value),
                hasNumber: /[0-9]/.test(value),
                hasSpecialChar: /[!@#$%^&+=]/.test(value),
            });
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Las nuevas contraseñas no coinciden.');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error('La nueva contraseña debe tener al menos 8 caracteres.');
            return;
        }

        try {
            await apiClient.patch('/users/me/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            toast.success('Contraseña actualizada con éxito. Por favor, inicia sesión de nuevo.');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            logout();
        } catch (error) {
            console.error('Error al cambiar la contraseña:', error);
            const errorMessage = error.response?.data?.message || 'Error al cambiar la contraseña. Verifica la contraseña actual.';
            toast.error(errorMessage);
        }
    };

    const handleGenerate2FA = async () => {
        setIs2FALoading(true);
        try {
            const response = await apiClient.post('/users/me/2fa/generate');
            setQrCodeData(response.data);
            toast.info('Escanea el código QR para habilitar 2FA.');
        } catch (error) {
            console.error('Error al generar el QR de 2FA:', error);
            toast.error('No se pudo generar el código QR. Intenta de nuevo.');
        } finally {
            setIs2FALoading(false);
        }
    };

    const handleEnable2FA = async (e) => {
        e.preventDefault();
        setIs2FALoading(true);
        try {
            await apiClient.post('/users/me/2fa/enable', {
                verificationCode: twoFactorVerificationCode,
            });
            await fetchUserProfile();
            setQrCodeData('');
            setTwoFactorVerificationCode('');
            toast.success('¡La autenticación de dos factores ha sido habilitada!');
        } catch (error) {
            console.error('Error al habilitar 2FA:', error);
            const errorMessage = error.response?.data?.message || 'Código de verificación incorrecto. Intenta de nuevo.';
            toast.error(errorMessage);
        } finally {
            setIs2FALoading(false);
        }
    };

    const handleDisable2FA = async (e) => {
        e.preventDefault();
        setIs2FALoading(true);
        try {
            await apiClient.post('/users/me/2fa/disable', {
                verificationCode: twoFactorVerificationCode,
            });
            await fetchUserProfile();
            setTwoFactorVerificationCode('');
            toast.success('La autenticación de dos factores ha sido deshabilitada.');
        } catch (error) {
            console.error('Error al deshabilitar 2FA:', error);
            const errorMessage = error.response?.data?.message || 'Error al deshabilitar 2FA. Verifica el código.';
            toast.error(errorMessage);
        } finally {
            setIs2FALoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
                <span className="text-lg text-gray-500 dark:text-gray-400">Cargando perfil...</span>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 bg-gray-100 dark:bg-gray-900 font-sans antialiased min-h-[calc(100vh-100px)]">
            <header className="mb-6">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    Mi Perfil
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                    Gestiona la configuración de tu cuenta y privacidad.
                </p>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
                {/* Navegación por pestañas */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                activeTab === 'general'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Datos Generales
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                activeTab === 'security'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Seguridad
                        </button>
                    </nav>
                </div>

                {/* Contenido de la pestaña */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        {/* Sección de Avatar */}
                        <section>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Foto de Perfil
                            </h3>
                            <div className="flex items-center space-x-6">
                                <div className="flex-shrink-0 relative">
                                    {/* ➡️ Usa la URL del avatar del estado `avatarUrl` */}
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar de usuario" className="h-20 w-20 rounded-full object-cover" />
                                    ) : (
                                        <div className="h-20 w-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-4xl text-white">
                                            <FaUserCircle />
                                        </div>
                                    )}
                                    <button
                                        className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full text-white hover:bg-blue-600 transition-colors"
                                        onClick={() => document.getElementById('avatar-upload').click()}
                                    >
                                        <FiCamera />
                                    </button>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        className="hidden"
                                        onChange={handleAvatarUpload}
                                        accept="image/*"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Sube una foto para tu perfil. Se recomienda una imagen cuadrada.
                                    </p>
                                </div>
                            </div>
                        </section>
                        {/* ... El resto del formulario de datos generales sigue igual */}
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Información Personal
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                                    <input type="text" name="firstName" value={profileData.firstName} onChange={e => setProfileData({...profileData, firstName: e.target.value})} className="input-field" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellido</label>
                                    <input type="text" name="lastName" value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})} className="input-field" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                    <input type="email" name="email" value={profileData.email} disabled className="input-field disabled:bg-gray-100 dark:disabled:bg-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DNI</label>
                                    <input type="text" name="dni" value={profileData.dni} onChange={e => setProfileData({...profileData, dni: e.target.value})} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Nacimiento</label>
                                    <input type="date" name="dateOfBirth" value={profileData.dateOfBirth} onChange={e => setProfileData({...profileData, dateOfBirth: e.target.value})} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                                    <input type="tel" name="phoneNumber" value={profileData.phoneNumber} onChange={e => setProfileData({...profileData, phoneNumber: e.target.value})} className="input-field" />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="flex items-center justify-center px-6 py-2.5 rounded-lg text-white font-medium bg-indigo-600 hover:bg-indigo-700 transition">
                                    <FiSave className="mr-2"/> Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {/* ... El resto de la pestaña de seguridad sigue igual */}
                {activeTab === 'security' && (
                    <div className="space-y-6">
                        {/* Sección de Cambio de Contraseña */}
                        <section>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Cambiar Contraseña
                            </h3>
                            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Contraseña Actual
                                    </label>
                                    <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="input-field" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nueva Contraseña
                                    </label>
                                    <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="input-field" required />
                                    {passwordData.newPassword && (
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
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Confirmar Nueva Contraseña
                                    </label>
                                    <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="input-field" required />
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="flex items-center justify-center px-6 py-2.5 rounded-lg text-white font-medium bg-red-600 hover:bg-red-700 transition">
                                        <FiLock className="mr-2"/> Actualizar Contraseña
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* Sección de Autenticación de Dos Factores */}
                        <section>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Autenticación de Dos Factores (2FA)
                            </h3>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                {twoFactorEnabled ? (
                                    <div>
                                        <p className="text-green-600 dark:text-green-400 font-medium mb-4">
                                            ✅ La autenticación de dos factores está habilitada. Para deshabilitarla, ingresa tu código de verificación.
                                        </p>
                                        <form onSubmit={handleDisable2FA} className="mt-4 w-full max-w-xs">
                                            <input
                                                type="text"
                                                value={twoFactorVerificationCode}
                                                onChange={(e) => setTwoFactorVerificationCode(e.target.value)}
                                                placeholder="Ingresa el código para deshabilitar"
                                                className="input-field text-center"
                                                maxLength="6"
                                                required
                                            />
                                            <button
                                                type="submit"
                                                className="mt-2 w-full px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                                                disabled={is2FALoading}
                                            >
                                                {is2FALoading ? 'Deshabilitando...' : 'Deshabilitar 2FA'}
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-red-600 dark:text-red-400 font-medium mb-4">
                                            ❌ La autenticación de dos factores está deshabilitada.
                                        </p>
                                        <button
                                            onClick={handleGenerate2FA}
                                            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                                            disabled={is2FALoading}
                                        >
                                            {is2FALoading ? 'Generando...' : 'Habilitar 2FA'}
                                        </button>
                                        {qrCodeData && (
                                            <div className="mt-4 flex flex-col items-center">
                                                <p className="text-gray-700 dark:text-gray-200 text-center mb-4">
                                                    Escanea el código QR con tu aplicación de autenticación (ej: Google Authenticator) y luego ingresa el código.
                                                </p>
                                                <QRCodeSVG value={qrCodeData} size={200} className="rounded-lg border-4 border-gray-300 dark:border-gray-600" />
                                                <form onSubmit={handleEnable2FA} className="mt-4 w-full max-w-xs">
                                                    <input
                                                        type="text"
                                                        value={twoFactorVerificationCode}
                                                        onChange={(e) => setTwoFactorVerificationCode(e.target.value)}
                                                        placeholder="Ingresa el código"
                                                        className="input-field text-center"
                                                        maxLength="6"
                                                        required
                                                    />
                                                    <button
                                                        type="submit"
                                                        className="mt-2 w-full px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors"
                                                        disabled={is2FALoading}
                                                    >
                                                        {is2FALoading ? 'Verificando...' : 'Verificar y Habilitar'}
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;