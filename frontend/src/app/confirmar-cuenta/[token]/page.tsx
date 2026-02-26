'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';

export default function ConfirmAccountPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const confirm = async () => {
      try {
        await authService.confirmAccount(token);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Error al confirmar la cuenta.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      confirm();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200 to-cyan-200 rounded-full blur-3xl opacity-20 -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200 to-emerald-200 rounded-full blur-3xl opacity-20 -ml-48 -mb-48"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-2">StoreHub</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
          {loading ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Confirmando tu cuenta...</h2>
              <p className="text-slate-600 text-sm">Esto solo tomará un momento.</p>
            </div>
          ) : success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">¡Cuenta confirmada!</h2>
              <p className="text-slate-600 text-sm">
                Tu cuenta fue verificada exitosamente. Ya podés iniciar sesión.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all cursor-pointer mt-4"
              >
                Iniciar Sesión
              </Link>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Error de confirmación</h2>
              <p className="text-slate-600 text-sm">{error}</p>
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all cursor-pointer mt-4"
              >
                Ir al Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
