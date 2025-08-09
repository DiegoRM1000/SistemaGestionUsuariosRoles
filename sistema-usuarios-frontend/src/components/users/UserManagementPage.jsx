// src/components/users/UserManagementPage.jsx

import React, { useState, useEffect } from 'react';
import {
    FiEdit,
    FiTrash2,
    FiDownload,
    FiSearch,
    FiUserPlus,
    FiUsers,
    FiUser,
} from 'react-icons/fi';
import {
    BiSolidToggleRight,
    BiSolidToggleLeft,
} from 'react-icons/bi';
import DataTable from 'react-data-table-component';
import { getRoleColor } from '../../utils/roleUtils';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-Content';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Componente para el loader... (sin cambios)
const Loader = () => (
    <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="mt-4 text-lg font-medium">Cargando usuarios...</span>
    </div>
);

// Componente para las tarjetas de indicadores... (sin cambios)
const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transform transition-all hover:scale-[1.03] group">
        <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-full ${color} bg-opacity-20 group-hover:scale-110 transition`}>
                <div className="text-3xl">{icon}</div>
            </div>
            <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
            </div>
        </div>
    </div>
);

const tableStyles = {
    headCells: {
        style: {
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: '#4a5568',
            padding: '12px',
        },
    },
    cells: {
        style: {
            fontSize: '14px',
            padding: '12px',
            '&:not(:last-of-type)': {
                borderRight: '1px solid #e2e8f0',
            },
        },
    },
    rows: {
        highlightOnHoverStyle: {
            backgroundColor: '#f7fafc',
            borderBottomColor: '#f7fafc',
            borderRadius: '10px',
            outline: '1px solid #edf2f7',
        },
    },
    pagination: {
        style: {
            backgroundColor: '#ffffff',
            color: '#4a5568',
        },
    },
};

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const MySwal = withReactContent(Swal);
    const { userRoles } = useAuth();
    const isAdmin = userRoles.includes('ADMIN');
    const isSupervisor = userRoles.includes('SUPERVISOR');

    const [totalUsers, setTotalUsers] = useState(0);
    const [adminCount, setAdminCount] = useState(0);
    const [supervisorCount, setSupervisorCount] = useState(0);
    const [empleadoCount, setEmpleadoCount] = useState(0);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/users/all');
            const data = response.data;
            setUsers(data);
            setTotalUsers(data.length);
            setAdminCount(data.filter(u => u.role?.name === 'ADMIN').length);
            setSupervisorCount(data.filter(u => u.role?.name === 'SUPERVISOR').length);
            setEmpleadoCount(data.filter(u => u.role?.name === 'EMPLEADO').length);
        } catch (error) {
            console.error("Error al cargar los usuarios:", error);
            if (isSupervisor) {
                toast.error("No tienes permisos para ver todos los datos de usuario.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const searchText = filterText.toLowerCase();
        const roleName = user.role?.name?.toLowerCase() || '';
        return (
            user.firstName?.toLowerCase().includes(searchText) ||
            user.lastName?.toLowerCase().includes(searchText) ||
            user.email?.toLowerCase().includes(searchText) ||
            user.dni?.toLowerCase().includes(searchText) ||
            roleName.includes(searchText)
        );
    });

    const handleEdit = (id) => {
        navigate(`/dashboard/users/edit/${id}`);
    };

    const handleDelete = async (id) => {
        MySwal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, ¡elimínalo!',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await apiClient.delete(`/users/${id}`);
                    setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
                    MySwal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');
                } catch (error) {
                    console.error("Error al eliminar usuario:", error);
                }
            }
        });
    };

    const handleToggleStatus = async (id) => {
        MySwal.fire({
            title: '¿Cambiar estado?',
            text: "El estado de la cuenta del usuario será modificado.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await apiClient.patch(`/users/${id}/toggle-status`);
                    const updatedUser = response.data;
                    setUsers(prevUsers =>
                        prevUsers.map(user =>
                            user.id === updatedUser.id ? updatedUser : user
                        )
                    );
                    MySwal.fire('¡Estado actualizado!', `El estado del usuario ha sido cambiado.`, 'success');
                } catch (error) {
                    console.error("Error al cambiar estado:", error);
                }
            }
        });
    };

    // CAMBIO: Se revirtieron las rutas para que la exportación de usuarios sea exclusiva de esta página.
    const handleExport = async (format) => {
        try {
            const response = await apiClient.get(`/exports/users/${format}`, {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], {
                type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            if (format === 'excel') {
                link.setAttribute('download', `usuarios_reporte.xlsx`);
            } else if (format === 'pdf') {
                link.setAttribute('download', `usuarios_reporte.pdf`);
            }

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success(`El reporte en formato ${format.toUpperCase()} se ha descargado.`);
        } catch (error) {
            console.error(`Error al exportar a ${format}:`, error);
            const errorMessage = error.response?.data?.message || 'Error al exportar. Asegúrate de ser administrador.';
            toast.error(errorMessage);
        }
    };


    // Definición de las columnas para la tabla... (sin cambios)
    const columns = [
        { name: 'ID', selector: row => row.id, sortable: true, width: '80px', hide: 'md' },
        { name: 'Nombre', selector: row => row.firstName, sortable: true, wrap: true },
        { name: 'Apellido', selector: row => row.lastName, sortable: true, wrap: true },
        { name: 'Email', selector: row => row.email, sortable: true, wrap: true, minWidth: '220px' },
        {
            name: 'DNI',
            selector: row => row.dni,
            sortable: true,
            wrap: true,
            grow: 0.5,
            hide: 'sm',
            style: {
                justifyContent: 'center',
            },
        },
        {
            name: 'Rol',
            selector: row => row.role?.name,
            sortable: true,
            grow: 0.6,
            cell: row => (
                <span
                    className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white"
                    style={{ backgroundColor: getRoleColor(row.role?.name) }}
                >
                    {row.role?.name || 'Sin Rol'}
                </span>
            ),
        },
        ...(isAdmin ? [{
            name: 'Estado',
            selector: row => row.enabled,
            sortable: true,
            grow: 0.5,
            cell: row => (
                <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${row.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}
                >
                    {row.enabled ? 'Activo' : 'Inactivo'}
                </span>
            ),
        }] : []),
        {
            name: 'Acciones',
            cell: row => (
                <div className="flex space-x-2">
                    {isAdmin && (
                        <button
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-600 transition duration-150 ease-in-out transform hover:scale-110"
                            onClick={() => handleEdit(row.id)}
                            aria-label={`Editar usuario ${row.firstName}`}
                        >
                            <FiEdit className="h-5 w-5" />
                        </button>
                    )}
                    {isAdmin && (
                        <>
                            <button
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600 transition duration-150 ease-in-out transform hover:scale-110"
                                onClick={() => handleDelete(row.id)}
                                aria-label={`Eliminar usuario ${row.firstName}`}
                            >
                                <FiTrash2 className="h-5 w-5" />
                            </button>
                            <button
                                className="transition duration-150 ease-in-out transform hover:scale-110"
                                onClick={() => handleToggleStatus(row.id)}
                                aria-label={`Alternar estado de usuario ${row.firstName}`}
                            >
                                {row.enabled ? (
                                    <BiSolidToggleRight className="h-5 w-5 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-600" />
                                ) : (
                                    <BiSolidToggleLeft className="h-5 w-5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600" />
                                )}
                            </button>
                        </>
                    )}
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '150px'
        },
    ];

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="p-4 sm:p-8 bg-gray-100 dark:bg-gray-900 font-sans antialiased">
            <header className="mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    Gestión de Usuarios
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                    Administra los usuarios y sus roles en el sistema de manera eficiente.
                </p>
            </header>

            {isAdmin && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total de Usuarios"
                        value={totalUsers}
                        icon={<FiUsers className="h-6 w-6 text-gray-700 dark:text-gray-200" />}
                        color="bg-gray-200 dark:bg-gray-700"
                    />
                    <StatCard
                        title="Administradores"
                        value={adminCount}
                        icon={<FiUser className="h-6 w-6 text-red-700 dark:text-red-200" />}
                        color="bg-pink-200 dark:bg-pink-700"
                    />
                    <StatCard
                        title="Supervisores"
                        value={supervisorCount}
                        icon={<FiUser className="h-6 w-6 text-blue-700 dark:text-blue-200" />}
                        color="bg-blue-200 dark:bg-blue-700"
                    />
                    <StatCard
                        title="Empleados"
                        value={empleadoCount}
                        icon={<FiUser className="h-6 w-6 text-indigo-700 dark:text-indigo-200" />}
                        color="bg-indigo-200 dark:bg-indigo-700"
                    />
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-1/3">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar usuarios..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white shadow-sm transition-colors"
                        />
                    </div>
                    <div className="flex flex-wrap justify-end gap-2 md:space-x-4 w-full md:w-auto">
                        {isAdmin && (
                            <button
                                onClick={() => navigate('/dashboard/users/new')}
                                className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 rounded-lg shadow-md text-white font-medium bg-gray-500 hover:bg-gray-600 transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <FiUserPlus className="mr-2 h-5 w-5" />
                                <span className="hidden sm:inline">Nuevo Usuario</span>
                                <span className="inline sm:hidden">Nuevo</span>
                            </button>
                        )}
                        {isAdmin && (
                            <>
                                <button
                                    onClick={() => handleExport('pdf')}
                                    className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 rounded-lg shadow-md text-white font-medium bg-red-600 hover:bg-red-700 transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    <FiDownload className="mr-2 h-5 w-5" />
                                    <span className="hidden sm:inline">PDF</span>
                                    <span className="inline sm:hidden">PDF</span>
                                </button>
                                <button
                                    onClick={() => handleExport('excel')}
                                    className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 rounded-lg shadow-md text-white font-medium bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    <FiDownload className="mr-2 h-5 w-5" />
                                    <span className="hidden sm:inline">Excel</span>
                                    <span className="inline sm:hidden">Excel</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    pagination
                    highlightOnHover
                    pointerOnHover
                    responsive
                    customStyles={tableStyles}
                />
            </div>
        </div>
    );
};

export default UserManagementPage;