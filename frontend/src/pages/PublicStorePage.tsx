import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { productsService } from '../services/products.service';
import { shopsService } from '../services/shops.service';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categories?: string[];
}

interface Shop {
  slug: string;
  storeName: string;
  location?: string;
  description?: string;
}

export function PublicStorePage() {
  const { slug } = useParams<{ slug: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoreData = async () => {
      if (!slug) return;

      try {
        // Cargar información de la tienda
        const shopData = await shopsService.getShopBySlug(slug);
        setShop(shopData);

        // Cargar productos (configurar el tenant-id temporalmente para esta llamada)
        const tempShop = { slug };
        localStorage.setItem('activeShop', JSON.stringify(tempShop));
        
        const productsData = await productsService.getAll();
        setProducts(productsData);
        
      } catch (error) {
        console.error('Error al cargar datos de la tienda:', error);
      } finally {
        // Limpiar el activeShop temporal después de que la llamada termine
        const currentActiveShop = localStorage.getItem('activeShop');
        if (currentActiveShop) {
          const parsed = JSON.parse(currentActiveShop);
          // Solo eliminar si es el temporal que creamos (solo tiene slug)
          if (parsed && Object.keys(parsed).length === 1 && parsed.slug === slug) {
            localStorage.removeItem('activeShop');
          }
        }
        setLoading(false);
      }
    };

    loadStoreData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PublicNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Cargando tienda...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PublicNavbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Tienda no encontrada
          </h2>
          <Link
            to="/"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Volver a tiendas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />

      {/* Header de la Tienda */}
      <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <Link
            to="/"
            className="inline-flex items-center text-white/80 hover:text-white mb-4 text-sm"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver a tiendas
          </Link>

          <h1 className="text-4xl font-bold mb-2">{shop.storeName}</h1>
          
          {shop.location && (
            <div className="flex items-center text-white/90 mb-2">
              <svg
                className="h-5 w-5 mr-2"
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

          {shop.description && (
            <p className="text-white/90 max-w-2xl">{shop.description}</p>
          )}
        </div>
      </div>

      {/* Productos */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Productos</h2>
          <p className="text-slate-600">
            {products.length} {products.length === 1 ? 'producto' : 'productos'} disponibles
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900">
              No hay productos disponibles
            </h3>
            <p className="mt-2 text-slate-500">
              Esta tienda aún no tiene productos publicados
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-slate-200 flex flex-col"
              >
                {/* Imagen del producto */}
                <div className="h-64 bg-slate-100 flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="h-20 w-20 text-slate-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  <p className="text-slate-600 text-sm mb-3 line-clamp-2 flex-1">
                    {product.description}
                  </p>

                  {/* Precio y Stock */}
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-emerald-600">
                        ${product.price.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="mt-1">
                      {product.stock > 0 ? (
                        <span className="text-xs text-slate-500">
                          Stock disponible: {product.stock}
                        </span>
                      ) : (
                        <span className="text-xs text-red-500 font-medium">
                          Sin stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botón de Agregar al Carrito (sin funcionalidad) */}
                  <button
                    disabled={product.stock === 0}
                    className={`w-full py-2.5 px-4 rounded-md font-medium transition-colors ${
                      product.stock > 0
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {product.stock > 0 ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Agregar al carrito
                      </span>
                    ) : (
                      'Agotado'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Carrito flotante (solo visual) */}
      <button className="fixed bottom-6 right-6 bg-emerald-500 text-white rounded-full p-4 shadow-lg hover:bg-emerald-600 transition-colors">
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          0
        </span>
      </button>
    </div>
  );
}
