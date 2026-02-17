import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { FloatingCart } from '../components/FloatingCart';
import { useCart } from '../contexts/CartContext';
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
  imageUrl?: string;
}

export function PublicStorePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { addItem } = useCart();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <PublicNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-500 animate-spin"></div>
            </div>
            <p className="mt-4 text-slate-600 text-lg font-medium">Cargando tienda...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <PublicNavbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Tienda no encontrada
          </h2>
          <p className="text-slate-600 mb-8 text-lg">Lo sentimos, no pudimos encontrar la tienda que buscas</p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-all button-animate"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a tiendas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <PublicNavbar />

      {/* Header de la Tienda */}
      <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-cyan-600 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center text-white/80 hover:text-white mb-6 text-sm font-medium transition-colors group button-animate"
          >
            <svg
              className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform"
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

          <div className="page-header-animate flex items-start gap-6">
            {/* Logo de la tienda */}
            {shop.imageUrl && (
              <div className="flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl shadow-xl p-2 overflow-hidden">
                  <img
                    src={shop.imageUrl}
                    alt={`Logo de ${shop.storeName}`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 title-animate">{shop.storeName}</h1>

              {shop.location && (
                <div className="flex items-center text-white/90 mb-4 gap-2 description-animate">
                  <svg
                    className="h-5 w-5 flex-shrink-0"
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
                  <span className="text-lg">{shop.location}</span>
                </div>
              )}

              {shop.description && (
                <p className="text-xl text-white/80 max-w-3xl description-animate">{shop.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Productos */}
      <main className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="mb-12 page-header-animate">
          <h2 className="text-4xl font-bold text-slate-900 mb-3 title-animate">Productos Disponibles</h2>
          <p className="text-slate-600 text-lg description-animate">
            {products.length} {products.length === 1 ? 'producto' : 'productos'} en nuestra tienda
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 card-animate">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-slate-600 text-lg">
              Esta tienda aún no ha publicado productos. Vuelve pronto para descubrir novedades
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div
                key={product._id}
                className="group stagger-item hover-lift"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-emerald-200 h-full flex flex-col">
                  {/* Imagen del producto */}
                  <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden relative">
                    {product.imageUrl ? (
                      <>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg
                          className="h-16 w-16 text-slate-400 group-hover:text-slate-500 transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-slate-500 text-sm mt-2">Sin imagen</p>
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {product.name}
                    </h3>

                    <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">
                      {product.description}
                    </p>

                    {/* Precio y Stock */}
                    <div className="mb-4 pb-4 border-t border-slate-100">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-emerald-600">
                          ${product.price.toLocaleString('es-AR')}
                        </span>
                      </div>

                      <div>
                        {product.stock > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span className="text-sm font-medium text-emerald-700">
                              {product.stock} en stock
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-medium text-red-600">
                              Agotado
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botón de Agregar al Carrito */}
                    <button
                      onClick={() => {
                        if (product.stock > 0 && shop) {
                          addItem({
                            productId: product._id,
                            name: product.name,
                            price: product.price,
                            imageUrl: product.imageUrl,
                            shopSlug: slug!,
                            shopName: shop.storeName
                          });
                        }
                      }}
                      disabled={product.stock === 0}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all cursor-pointer hover:-translate-y-0.5 flex items-center justify-center gap-2 ${product.stock > 0
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                      {product.stock > 0 ? (
                        <>
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
                        </>
                      ) : (
                        'Agotado'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Carrito Flotante */}
      <FloatingCart />
    </div>
  );
}
