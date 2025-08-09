import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import apiClient from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const EditUserPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        dni: '',
        dateOfBirth: '',
        phoneNumber: '',
        role: '',
    });
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({}); // <-- Nuevo estado para los errores
    const { user, logout } = useAuth();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const [userResponse, rolesResponse] = await Promise.all([
                    apiClient.get(`/users/${id}`),
                    apiClient.get('/roles/all')
                ]);
                const userData = userResponse.data;
                setFormData({
                    username: userData.username,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    dni: userData.dni || '',
                    dateOfBirth: userData.dateOfBirth || '',
                    phoneNumber: userData.phoneNumber || '',
                    role: userData.role.name,
                });
                setRoles(rolesResponse.data);
            } catch (error) {
                console.error("Error al obtener datos del usuario o roles:", error);
                toast.error("No se pudieron cargar los datos del usuario.");
                navigate('/dashboard/users');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
        // Limpiar el error del campo cuando el usuario empieza a escribir
        if (errors[name]) {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({}); // Limpiar errores anteriores
        try {
            // El backend ahora espera el objeto User completo, no un Map
            const userToUpdate = {
                ...formData,
                role: { name: formData.role }
            };

            await apiClient.put(`/users/${id}`, userToUpdate);
            toast.success('¡Usuario actualizado con éxito!');

            if (user && user.id === Number(id)) {
                logout();
                navigate('/login');
                toast.info('Tus datos han sido actualizados. Por favor, inicia sesión de nuevo.');
            } else {
                navigate('/dashboard/users');
            }
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            // Capturar y mostrar errores de validación
            if (error.response && error.response.status === 400 && error.response.data) {
                setErrors(error.response.data);
                toast.error('Por favor, corrige los errores en el formulario.');
            } else {
                const errorMessage = error.response?.data?.message || 'Error al actualizar usuario. Verifica los datos.';
                toast.error(errorMessage);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <span className="text-lg text-gray-500">Cargando...</span>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 bg-gray-100 dark:bg-gray-900 font-sans antialiased">
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Editar Usuario</h1>
                <button
                    onClick={() => navigate('/dashboard/users')}
                    className="flex items-center justify-center px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150 ease-in-out"
                >
                    <FiArrowLeft className="mr-2" /> Volver
                </button>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Campos del formulario */}
                    {/* Ejemplo de campo con manejo de error */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className={`input-field ${errors.firstName ? 'border-red-500' : ''}`} />
                        {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
                    </div>
                    {/* ... Repite el patrón para todos los campos */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellido</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className={`input-field ${errors.lastName ? 'border-red-500' : ''}`} />
                        {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de Usuario</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} required className={`input-field ${errors.username ? 'border-red-500' : ''}`} />
                        {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className={`input-field ${errors.email ? 'border-red-500' : ''}`} />
                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DNI</label>
                        <input type="text" name="dni" value={formData.dni} onChange={handleChange} className={`input-field ${errors.dni ? 'border-red-500' : ''}`} />
                        {errors.dni && <p className="mt-1 text-sm text-red-500">{errors.dni}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Nacimiento</label>
                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={`input-field ${errors.dateOfBirth ? 'border-red-500' : ''}`} />
                        {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                        <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={`input-field ${errors.phoneNumber ? 'border-red-500' : ''}`} />
                        {errors.phoneNumber && <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
                        <select name="role" value={formData.role} onChange={handleChange} required className={`input-field ${errors.role ? 'border-red-500' : ''}`}>
                            {roles.map(role => (
                                <option key={role.id} value={role.name}>{role.name}</option>
                            ))}
                        </select>
                        {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role}</p>}
                    </div>
                    <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
                        <button
                            type="submit"
                            className="flex items-center justify-center px-6 py-2.5 rounded-lg text-white font-medium bg-indigo-600 hover:bg-indigo-700 transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <FiSave className="mr-2" /> Actualizar Usuario
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserPage;