import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      
      // Guardar usuario y token en el contexto
      login(
        {
          id: response.user._id,
          name: response.user.name,
          email: response.user.email,
        },
        response.token
      );

      // Redirigir al panel de administración
      navigate('/admin');
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      setError(
        err.response?.data?.message || 
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo o Título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">StoreHub</h1>
          <p className="text-slate-600">Inicia sesión en tu cuenta</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="tu@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-emerald-500 text-white font-semibold rounded-md hover:bg-emerald-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Link a Registro */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Regístrate aquí
              </Link>
            </p>
          </div>

          {/* Link a Home */}
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
