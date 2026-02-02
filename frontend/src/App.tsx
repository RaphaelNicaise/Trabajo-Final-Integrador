import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PrivateRoute } from './components/PrivateRoute'
import { ShopGuard } from './components/ShopGuard'
import { AdminLayout } from './layouts/AdminLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { PublicStoresPage } from './pages/PublicStoresPage'
import { PublicStorePage } from './pages/PublicStorePage'
import { TiendasPage } from './pages/admin/Tiendas'
import { DashboardPage } from './pages/admin/Dashboard'
import { ProductosPage } from './pages/admin/Productos'
import { OrdenesPage } from './pages/admin/Ordenes'
import { CategoriasPage } from './pages/admin/Categorias'
import { ConfiguracionPage } from './pages/admin/Configuracion'
import { UsuariosPage } from './pages/admin/Usuarios'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas Publicas */}
          <Route path="/" element={<PublicStoresPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/tienda/:slug" element={<PublicStorePage />} />

          {/* Rutas Privadas (Panel de Administracion) */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            {/* Pagina de seleccion de tiendas (no requiere activeShop) */}
            <Route index element={<TiendasPage />} />
            <Route path="tiendas" element={<TiendasPage />} />

            {/* Rutas que REQUIEREN tienda activa */}
            <Route
              path="dashboard"
              element={
                <ShopGuard>
                  <DashboardPage />
                </ShopGuard>
              }
            />
            <Route
              path="productos"
              element={
                <ShopGuard>
                  <ProductosPage />
                </ShopGuard>
              }
            />
            <Route
              path="ordenes"
              element={
                <ShopGuard>
                  <OrdenesPage />
                </ShopGuard>
              }
            />
            <Route
              path="categorias"
              element={
                <ShopGuard>
                  <CategoriasPage />
                </ShopGuard>
              }
            />
            <Route
              path="configuracion"
              element={
                <ShopGuard>
                  <ConfiguracionPage />
                </ShopGuard>
              }
            />
            <Route
              path="usuarios"
              element={
                <ShopGuard>
                  <UsuariosPage />
                </ShopGuard>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
