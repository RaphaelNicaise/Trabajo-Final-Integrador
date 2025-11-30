import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PrivateRoute } from './components/PrivateRoute'
import { ShopGuard } from './components/ShopGuard'
import { PublicNavbar } from './components/layout/PublicNavbar'
import { AdminLayout } from './layouts/AdminLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { TiendasPage } from './pages/admin/Tiendas'
import { DashboardPage } from './pages/admin/Dashboard'
import { ProductosPage } from './pages/admin/Productos'
import { OrdenesPage } from './pages/admin/Ordenes'
import { CategoriasPage } from './pages/admin/Categorias'
import { ConfiguracionPage } from './pages/admin/Configuracion'
import { UsuariosPage } from './pages/admin/Usuarios'

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />
      
      {/* Contenido Principal - Centrado */}
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Bienvenido a StoreHub
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            La plataforma para crear y administrar tu tienda online
          </p>
          <button className="px-8 py-3 bg-emerald-500 text-white font-semibold rounded-md hover:bg-emerald-600 transition-all shadow-sm active:scale-95">
            Comenzar Ahora
          </button>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas Privadas (Panel de Administración) */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            {/* Página de selección de tiendas (no requiere activeShop) */}
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

