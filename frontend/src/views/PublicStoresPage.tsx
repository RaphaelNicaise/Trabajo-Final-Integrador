import { useEffect, useState } from 'react';
import Link from 'next/link';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <PublicNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-500 animate-spin"></div>
            </div>
            <p className="mt-4 text-slate-600 text-lg font-medium">Cargando tiendas increíbles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <PublicNavbar />

      <main className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header Section */}
        <div className="mb-16 text-center animate-fade-in-up">
          <div className="mb-6 animate-scale-in">
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4 border border-emerald-200">
              Marketplace de Tiendas
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4 animate-fade-in-down">
            Explora Nuestras <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">Tiendas</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto animate-fade-in-down" style={{ animationDelay: '0.1s' }}>
            Descubre una colección curada de tiendas con productos únicos y de alta calidad
          </p>
        </div>

        {shops.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-slate-400"
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
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-900">
              No hay tiendas disponibles
            </h3>
            <p className="mt-2 text-slate-500 text-lg">
              Vuelve más tarde para descubrir nuevas tiendas increíbles
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {shops.map((shop, index) => (
              <Link
                key={shop.id}
                href={`/tienda/${shop.slug}`}
                className="group relative h-full stagger-item"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-emerald-200 hover-lift">
                  {/* Shop Header Image */}
                  <div className="relative h-48 bg-gradient-to-br from-emerald-400 via-cyan-400 to-cyan-500 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <svg
                          className="h-24 w-24 text-white opacity-80 group-hover:scale-110 transition-transform duration-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity"></div>
                      </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col h-full">
                    {/* Shop Name */}
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {shop.name}
                    </h3>

                    {/* Location */}
                    {shop.location && (
                      <div className="flex items-center text-sm text-slate-600 mb-3 gap-2">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-4 w-4 text-emerald-500"
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
                        </div>
                        <span className="font-medium">{shop.location}</span>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-slate-600 text-sm line-clamp-2 flex-grow">
                      {shop.description || 'Explora nuestros productos seleccionados'}
                    </p>

                    {/* Footer CTA */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-500">Ver tienda</span>
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-all duration-300">
                          <svg
                            className="w-4 h-4 text-emerald-600 group-hover:text-white transition-colors group-hover:translate-x-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Border Effect */}
                  <div className="absolute inset-0 rounded-2xl pointer-events-none group-hover:ring-2 group-hover:ring-emerald-200 transition-all"></div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom CTA Section */}
        {shops.length > 0 && (
          <div className="mt-20 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-3xl p-12 border border-emerald-100 text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="text-slate-600 mb-6 text-lg max-w-2xl mx-auto">
              Descubre más productos visitando nuestras tiendas destacadas
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer inline-flex items-center gap-2">
              Explorar todas las tiendas
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
