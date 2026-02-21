import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { FloatingCart } from '../components/FloatingCart';
import { useCart } from '../contexts/CartContext';
import { productsService } from '../services/products.service';
import { categoriesService } from '../services/categories.service';
import { shopsService } from '../services/shops.service';
import { configurationsService, type Configuration } from '../services/configurations.service';
import type { Category } from '../services/categories.service';
import {
  Search, ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight, Store as StoreIcon, Tag
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────
interface ProductPromotion {
  tipo: 'porcentaje' | 'fijo' | 'nxm';
  valor: number;
  valor_secundario?: number | null;
  activa: boolean;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categories?: string[];
  promotion?: ProductPromotion | null;
}

// ─── Helpers de promoción ──────────────────────────────────────────────
function calculateFinalPrice(price: number, promo: ProductPromotion): number {
  if (!promo.activa) return price;
  switch (promo.tipo) {
    case 'porcentaje':
      return price * (1 - promo.valor / 100);
    case 'fijo':
      return Math.max(0, price - promo.valor);
    case 'nxm':
      return price; // el descuento nxm se aplica por cantidad en el carrito
    default:
      return price;
  }
}

function getPromoBadgeText(promo: ProductPromotion): string {
  switch (promo.tipo) {
    case 'porcentaje':
      return `${promo.valor}% OFF`;
    case 'fijo':
      return `-$${promo.valor}`;
    case 'nxm':
      return `${promo.valor}x${promo.valor_secundario}`;
    default:
      return '';
  }
}

interface Shop {
  slug: string;
  storeName: string;
  location?: string;
  description?: string;
  imageUrl?: string;
}

interface CategorySection {
  id: string;
  name: string;
  products: Product[];
}

// ─── ProductCard ──────────────────────────────────────────────────────
function ProductCard({ product, shopSlug, shopName }: {
  product: Product;
  shopSlug: string;
  shopName: string;
}) {
  const { items, addItem, updateQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const cartItem = items.find((i) => i.productId === product._id);
  const quantity = cartItem?.quantity || 0;

  const promo = product.promotion?.activa ? product.promotion : null;
  const finalPrice = promo ? calculateFinalPrice(product.price, promo) : product.price;

  const handleAdd = () => {
    if (product.stock <= 0) return;
    setIsAdding(true);
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      shopSlug,
      shopName,
      promotion: promo || undefined,
    });
    setTimeout(() => setIsAdding(false), 300);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col min-w-[180px] w-[180px] sm:min-w-[200px] sm:w-[200px] flex-shrink-0">
      {/* Image */}
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <StoreIcon className="w-10 h-10 text-slate-300" />
          </div>
        )}
        {/* Promotion badge */}
        {promo && (
          <div className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 z-[2]">
            <Tag className="w-3 h-3" />
            {getPromoBadgeText(promo)}
          </div>
        )}
        {/* Quantity badge */}
        {quantity > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow">
            {quantity}
          </div>
        )}
        {/* Out of stock overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Agotado</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <div className="flex-1 mb-2 min-h-[3.5rem]">
          <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
          {product.description ? (
            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{product.description}</p>
          ) : (
            <div className="h-8" />
          )}
        </div>

        {/* Price & actions */}
        <div className="space-y-2">
          {promo ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-emerald-600">
                ${finalPrice.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-400 line-through">
                ${product.price.toLocaleString('es-AR')}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-emerald-600">
              ${product.price.toLocaleString('es-AR')}
            </span>
          )}

          <div className="flex justify-end">
            {quantity === 0 ? (
              <button
                onClick={handleAdd}
                disabled={product.stock <= 0}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  product.stock <= 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : `bg-emerald-500 hover:bg-emerald-600 text-white ${isAdding ? 'scale-95' : ''}`
                } w-full justify-center`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Agregar</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full justify-end">
                <button
                  onClick={() => updateQuantity(product._id, quantity - 1)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[28px] text-center font-semibold text-sm">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product._id, quantity + 1)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CategoryCarousel ─────────────────────────────────────────────────
function CategoryCarousel({ section, shopSlug, shopName }: {
  section: CategorySection;
  shopSlug: string;
  shopName: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [section.products]);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -400 : 400,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="scroll-mt-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold text-slate-900">{section.name}</h3>
        <span className="text-sm text-slate-500">{section.products.length} productos</span>
      </div>

      {/* Carousel */}
      <div className="relative group/carousel">
        {/* Left arrow */}
        {canScrollLeft && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 to-transparent z-[5] pointer-events-none" />
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center text-slate-700 hover:text-emerald-600 transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {section.products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              shopSlug={shopSlug}
              shopName={shopName}
            />
          ))}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent z-[5] pointer-events-none" />
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center text-slate-700 hover:text-emerald-600 transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}

// ─── CategoryFilter ───────────────────────────────────────────────────
function CategoryFilter({ categories, selected, onChange }: {
  categories: { id: string; name: string }[];
  selected: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(selected === cat.id ? 'todos' : cat.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all cursor-pointer hover:scale-105 ${
            selected === cat.id
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────
export function PublicStorePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  useEffect(() => {
    const loadStoreData = async () => {
      if (!slug) return;

      try {
        const shopData = await shopsService.getShopBySlug(slug);
        setShop(shopData);

        // Set tenant context for API calls
        const tempShop = { slug };
        localStorage.setItem('activeShop', JSON.stringify(tempShop));

        const [productsData, categoriesData, configs] = await Promise.all<[
          Product[],
          Category[],
          Configuration[]
        ]>([
          productsService.getAll(),
          categoriesService.getAll(),
          configurationsService.getPublic(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);

        try {
          localStorage.setItem(`shopConfigs_${slug}`, JSON.stringify(configs));
        } catch (err) {
          console.error('Error al guardar configuraciones de la tienda en localStorage:', err);
        }
      } catch (error) {
        console.error('Error al cargar datos de la tienda:', error);
      } finally {
        const currentActiveShop = localStorage.getItem('activeShop');
        if (currentActiveShop) {
          const parsed = JSON.parse(currentActiveShop);
          if (parsed && Object.keys(parsed).length === 1 && parsed.slug === slug) {
            localStorage.removeItem('activeShop');
          }
        }
        setLoading(false);
      }
    };

    loadStoreData();
  }, [slug]);

  // Build category lookup: id → name
  const categoryMap = useMemo(() => {
    const m = new Map<string, string>();
    categories.forEach((c) => m.set(c._id, c.name));
    return m;
  }, [categories]);

  // Filter categories for UI
  const filterCategories = useMemo(() => {
    const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name));
    return [
      { id: 'todos', name: 'Todos' },
      ...sorted.map((c) => ({ id: c._id, name: c.name })),
    ];
  }, [categories]);

  // Filtered products by search + selected category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'todos' ||
        (p.categories && p.categories.includes(selectedCategory));
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Group filtered products by category into carousel sections
  const categorySections = useMemo(() => {
    const grouped = new Map<string, Product[]>();

    filteredProducts.forEach((product) => {
      if (product.categories && product.categories.length > 0) {
        product.categories.forEach((catId) => {
          const catName = categoryMap.get(catId);
          if (catName) {
            if (!grouped.has(catName)) grouped.set(catName, []);
            const arr = grouped.get(catName)!;
            if (!arr.find((p) => p._id === product._id)) {
              arr.push(product);
            }
          }
        });
      } else {
        if (!grouped.has('Sin categoría')) grouped.set('Sin categoría', []);
        grouped.get('Sin categoría')!.push(product);
      }
    });

    // Sort: alphabetically
    const sortedKeys = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b));

    return sortedKeys.map((name) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      products: grouped.get(name)!,
    }));
  }, [filteredProducts, categoryMap]);

  // ─── Loading state ──────────────────────────────────────────────────
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

  // ─── Not found ──────────────────────────────────────────────────────
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
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Tienda no encontrada</h2>
          <p className="text-slate-600 mb-8 text-lg">Lo sentimos, no pudimos encontrar la tienda que buscas</p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-all"
          >
            Volver a tiendas
          </Link>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <PublicNavbar />

      {/* Store Header */}
      <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48" />

        <div className="container mx-auto px-4 py-16 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center text-white/80 hover:text-white mb-6 text-sm font-medium transition-colors group"
          >
            <svg className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a tiendas
          </Link>

          <div className="flex items-start gap-6">
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
              <h1 className="text-5xl md:text-6xl font-bold mb-4">{shop.storeName}</h1>
              {shop.location && (
                <div className="flex items-center text-white/90 mb-4 gap-2">
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-lg">{shop.location}</span>
                </div>
              )}
              {shop.description && (
                <p className="text-xl text-white/80 max-w-3xl">{shop.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Nuestros <span className="text-emerald-600">Productos</span>
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No hay productos disponibles</h3>
            <p className="text-slate-600 text-lg">
              Esta tienda aún no ha publicado productos. Vuelve pronto para descubrir novedades
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Search + Category Filter — Sticky */}
            <div className="sticky top-20 z-10 bg-gradient-to-b from-slate-50/95 via-slate-50/90 to-transparent backdrop-blur-sm pt-2 pb-4 space-y-4">
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                />
              </div>

              {/* Category pills */}
              {categories.length > 0 && (
                <CategoryFilter
                  categories={filterCategories}
                  selected={selectedCategory}
                  onChange={setSelectedCategory}
                />
              )}
            </div>

            {/* Products count */}
            <p className="text-sm text-slate-500">
              Mostrando <span className="font-semibold text-slate-800">{filteredProducts.length}</span> productos
            </p>

            {/* Category Carousel sections */}
            {categorySections.length > 0 ? (
              <div className="space-y-10">
                {categorySections.map((section) => (
                  <CategoryCarousel
                    key={section.id}
                    section={section}
                    shopSlug={slug!}
                    shopName={shop.storeName}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-500 text-lg">No se encontraron productos</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('todos');
                  }}
                  className="mt-4 text-emerald-600 font-medium hover:underline cursor-pointer"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Cart */}
      <FloatingCart />
    </div>
  );
}
