import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PublicNavbar } from './components/layout/PublicNavbar'
import { AdminSidebar } from './components/layout/AdminSidebar'

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

function AdminPage() {
  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      
      {/* Contenido del Admin */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">
            Panel de Administración
          </h1>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <p className="text-slate-600">
              Bienvenido al panel de administración de StoreHub
            </p>
          </div>
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
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  )
}

export default App

