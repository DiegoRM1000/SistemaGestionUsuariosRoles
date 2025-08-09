import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRoutes from './AppRoutes.jsx'; // Importa tu configuración de rutas
import { ToastContainer } from 'react-toastify'; // Importa ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Importa los estilos CSS de Toastify

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <AppRoutes />
      <ToastContainer // Agrega ToastContainer aquí
          position="top-right" // Posición de las notificaciones
          autoClose={5000}     // Cierra automáticamente después de 5 segundos
          hideProgressBar={false} // Muestra la barra de progreso
          newestOnTop={false}     // Las nuevas notificaciones no aparecen encima de las antiguas
          closeOnClick          // Cierra al hacer clic
          rtl={false}           // Soporte de derecha a izquierda
          pauseOnFocusLoss      // Pausa en pérdida de foco
          draggable             // Se pueden arrastrar
          pauseOnHover          // Pausa al pasar el ratón
          theme="colored"       // Estilo del tema (light, dark, colored)
      />
  </StrictMode>,
)
