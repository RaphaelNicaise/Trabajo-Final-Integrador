import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { shopsService } from '../services/shops.service';

interface Shop {
  id: string;
  slug: string;
  name: string;
  location?: string;
  description?: string;
}

export function PublicStoresPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShops = async () => {
      try {
        const data = await shopsService.getAllShops();
        setShops(data);
      } catch (error) {
        console.error('Error al cargar tiendas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadShops();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PublicNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Cargando tiendas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Explora Nuestras Tiendas
          </h1>
          <p className="text-slate-600">
            Descubre productos únicos de diferentes tiendas
          </p>
        </div>

        {shops.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-24 w-24 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900">
              No hay tiendas disponibles
            </h3>
            <p className="mt-2 text-slate-500">
              Vuelve más tarde para descubrir nuevas tiendas
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Link
                key={shop.id}
                to={`/tienda/${shop.slug}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-slate-200"
              >
                {/* Imagen de portada placeholder */}
                <div className="h-48 bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                  <svg
                    className="h-20 w-20 text-white opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>

                {/* Contenido */}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {shop.name}
                  </h3>
                  
                  {shop.location && (
                    <div className="flex items-center text-sm text-slate-600 mb-2">
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {shop.location}
                    </div>
                  )}

                  <p className="text-slate-600 text-sm line-clamp-2">
                    {shop.description || 'Explora nuestros productos'}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-emerald-600 font-medium text-sm hover:text-emerald-700">
                      Ver productos →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
