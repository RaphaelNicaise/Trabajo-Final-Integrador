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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200 to-cyan-200 rounded-full blur-3xl opacity-20 -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200 to-emerald-200 rounded-full blur-3xl opacity-20 -ml-48 -mb-48"></div>

       <div className="w-full max-w-md relative z-10 animate-fade-in-up">
         {/* Header */}
         <div className="text-center mb-12">
           <div className="inline-block mb-4 p-3 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-full animate-scale-in">
             <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
             </svg>
           </div>
           <h1 className="text-5xl font-bold text-slate-900 mb-2 animate-fade-in-down">StoreHub</h1>
           <p className="text-slate-600 text-lg animate-fade-in-down" style={{ animationDelay: '0.1s' }}>Tu plataforma de comercio electrónico</p>
         </div>

         {/* Login Card */}
         <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100 animate-scale-in backdrop-blur-sm" style={{ animationDelay: '0.2s' }}>
           <form onSubmit={handleSubmit} className="space-y-6">
             {/* Email */}
             <div className="space-y-2 stagger-item">
               <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                 Correo Electrónico
               </label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                   </svg>
                 </div>
                 <input
                   id="email"
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   required
                   className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                   placeholder="tu@email.com"
                 />
               </div>
             </div>

             {/* Password */}
             <div className="space-y-2 stagger-item">
               <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                 Contraseña
               </label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                   </svg>
                 </div>
                 <input
                   id="password"
                   type={showPassword ? 'text' : 'password'}
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                   className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                   placeholder="••••••••"
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                 >
                   {showPassword ? (
                     <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                     </svg>
                   ) : (
                     <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                     </svg>
                   )}
                 </button>
               </div>
             </div>

             {/* Error Message */}
             {error && (
               <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in-down">
                 <div className="flex items-start gap-3">
                   <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   <p className="text-sm text-red-700 font-medium">{error}</p>
                 </div>
               </div>
             )}

             {/* Submit Button */}
             <button
               type="submit"
               disabled={loading}
               className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 stagger-item"
             >
               {loading ? (
                 <>
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   Iniciando sesión...
                 </>
               ) : (
                 <>
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                   </svg>
                   Iniciar Sesión
                 </>
               )}
             </button>
           </form>

           {/* Divider */}
           <div className="mt-8 relative">
             <div className="absolute inset-0 flex items-center">
               <div className="w-full border-t border-slate-200"></div>
             </div>
             <div className="relative flex justify-center text-sm">
               <span className="px-2 bg-white text-slate-500">¿Nuevo en StoreHub?</span>
             </div>
           </div>

           {/* Link a Registro */}
           <div className="mt-8 text-center">
             <Link 
               to="/register" 
               className="inline-flex items-center px-6 py-2.5 border-2 border-emerald-200 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 hover:-translate-y-0.5 transition-all cursor-pointer stagger-item"
             >
               Crear una cuenta
               <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
               </svg>
             </Link>
           </div>

           {/* Link a Home */}
           <div className="mt-4 text-center">
             <Link to="/" className="text-sm text-slate-500 hover:text-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
               </svg>
               Volver al inicio
             </Link>
           </div>
         </div>

         {/* Footer */}
         <p className="text-center text-sm text-slate-500 mt-8">
           © 2024 StoreHub. Todos los derechos reservados.
         </p>
       </div>
    </div>
  );
}
