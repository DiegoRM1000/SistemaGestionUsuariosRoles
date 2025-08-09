import React, { useState, useEffect } from 'react';
import { FiSave, FiArrowLeft, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import apiClient from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

const CreateUserPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        dni: '',
        dateOfBirth: '',
        phoneNumber: '',
        role: 'EMPLEADO',
    });
    const [roles, setRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [errors, setErrors] = useState({});

    // Estado para la validación en vivo de la contraseña
    const [passwordValidations, setPasswordValidations] = useState({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await apiClient.get('/roles/all');
                setRoles(response.data);
                if (response.data.length > 0) {
                    setFormData(prev => ({ ...prev, role: response.data[0].name }));
                }
            } catch (error) {
                console.error("Error al obtener los roles:", error);
                toast.error("No se pudieron cargar los roles del sistema.");
            } finally {
                setLoadingRoles(false);
            }
        };
        fetchRoles();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));

        // Lógica de validación en vivo para la contraseña
        if (name === 'password') {
            setPasswordValidations({
                minLength: value.length >= 8,
                hasUpperCase: /[A-Z]/.test(value),
                hasLowerCase: /[a-z]/.test(value),
                hasNumber: /[0-9]/.test(value),
                hasSpecialChar: /[!@#$%^&+=]/.test(value),
            });
        }

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
        setErrors({});
        try {
            const userToCreate = {
                ...formData,
                role: { name: formData.role }
            };

            await apiClient.post('/users/create', userToCreate);
            toast.success('¡Usuario creado con éxito!');
            navigate('/dashboard/users');
        } catch (error) {
            console.error('Error al crear usuario:', error);

            if (error.response && error.response.status === 400 && error.response.data) {
                setErrors(error.response.data);

                if (error.response.data.password) {
                    toast.error(error.response.data.password);
                } else {
                    toast.error('Por favor, corrige los errores en el formulario.');
                }
            } else {
                const errorMessage = error.response?.data?.message || 'Error al crear usuario. Verifica los datos.';
                toast.error(errorMessage);
            }
        }
    };

    return (
        <div className="p-4 sm:p-8 bg-gray-100 dark:bg-gray-900 font-sans antialiased">
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Crear Nuevo Usuario</h1>
                <button
                    onClick={() => navigate('/dashboard/users')}
                    className="flex items-center justify-center px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150 ease-in-out"
                >
                    <FiArrowLeft className="mr-2" /> Volver
                </button>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ... (campos firstName, lastName, username, email) ... */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className={`input-field ${errors.firstName ? 'border-red-500' : ''}`} />
                        {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
                    </div>
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

                    {/* Campo de Contraseña con validación en vivo */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}

                        {/* Lista de verificación de la contraseña */}
                        {formData.password && (
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

                    {/* ... (campos DNI, Fecha de Nacimiento, Teléfono, Rol) ... */}
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
                            {loadingRoles ? (
                                <option>Cargando roles...</option>
                            ) : (
                                roles.map(role => (
                                    <option key={role.id} value={role.name}>{role.name}</option>
                                ))
                            )}
                        </select>
                        {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role}</p>}
                    </div>

                    <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
                        <button
                            type="submit"
                            className="flex items-center justify-center px-6 py-2.5 rounded-lg text-white font-medium bg-indigo-600 hover:bg-indigo-700 transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <FiSave className="mr-2" /> Guardar Usuario
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserPage;