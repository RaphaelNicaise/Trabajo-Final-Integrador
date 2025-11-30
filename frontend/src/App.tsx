import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PublicNavbar } from './components/layout/PublicNavbar'
import { AdminLayout } from './layouts/AdminLayout'
import { DashboardPage } from './pages/admin/Dashboard'
import { ProductosPage } from './pages/admin/Productos'
import { OrdenesPage } from './pages/admin/Ordenes'
import { CategoriasPage } from './pages/admin/Categorias'
import { TiendasPage } from './pages/admin/Tiendas'
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
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<TiendasPage />} />
          <Route path="tiendas" element={<TiendasPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="productos" element={<ProductosPage />} />
          <Route path="ordenes" element={<OrdenesPage />} />
          <Route path="categorias" element={<CategoriasPage />} />
          <Route path="configuracion" element={<ConfiguracionPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

