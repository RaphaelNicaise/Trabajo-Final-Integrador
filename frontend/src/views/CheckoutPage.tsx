import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart, calculateItemTotal } from '../contexts/CartContext';
import { ordersService } from '../services/orders.service';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { ShoppingBag, CreditCard, User, MapPin, Phone, Mail } from 'lucide-react';
import { type Configuration } from '../services/configurations.service';

export function CheckoutPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { items, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [minPurchaseAmount, setMinPurchaseAmount] = useState<number | null>(null);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });

  // Filtrar items de la tienda actual
  const shopItems = items.filter(item => item.shopSlug === slug);
  const total = shopItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  const meetsMinPurchase = !minPurchaseAmount || total >= minPurchaseAmount;
  const freeShippingApplied = !freeShippingThreshold || total >= freeShippingThreshold;

  useEffect(() => {
    if (!success && shopItems.length === 0) {
      router.push(`/tienda/${slug}`);
    }
  }, [shopItems.length, slug, router, success]);

  useEffect(() => {
    if (!slug) return;
    try {
      const stored = localStorage.getItem(`shopConfigs_${slug}`);
      if (stored) {
        const configs: Configuration[] = JSON.parse(stored);
        const minCfg = configs.find((c) => c.key === 'minPurchaseAmount');
        const freeCfg = configs.find((c) => c.key === 'freeShippingThreshold');
        setMinPurchaseAmount(minCfg ? Number(minCfg.value) || 0 : 0);
        setFreeShippingThreshold(freeCfg ? Number(freeCfg.value) || 0 : 0);
      }
    } catch (err) {
      console.error('Error al cargar configuraciones de la tienda en checkout:', err);
    }
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const minAmount = minPurchaseAmount || 0;
    if (minAmount > 0 && total < minAmount) {
      setError(`El monto mínimo de compra es $${minAmount.toFixed(2)}`);
      setLoading(false);
      return;
    }

    try {
      // Preparar datos de la orden
      const orderData = {
        buyer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode
        },
        products: shopItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      // Crear la orden
      await ordersService.createOrder(slug!, orderData);

      setSuccess(true);
      clearCart();

    } catch (err: any) {
      console.error('Error al crear orden:', err);
      setError(err.response?.data?.message || 'Error al procesar la orden. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
        <PublicNavbar />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center animate-scale-in">
            <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">¡Orden Confirmada!</h2>
            <p className="text-slate-600 mb-2">Tu orden ha sido procesada exitosamente.</p>
            <p className="text-sm text-slate-500">Recibirás un email de confirmación pronto.</p>
            <button
              onClick={() => router.push(`/tienda/${slug}`)}
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <ShoppingBag className="w-5 h-5" />
              Volver a la tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <PublicNavbar />

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Finalizar Compra</h1>
          <p className="text-slate-600">Completa tus datos para procesar la orden</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {/* Información Personal */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Información Personal</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Teléfono *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="+54 9 11 1234-5678"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Dirección de Envío */}
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Dirección de Envío</h2>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Calle Falsa 123"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Buenos Aires"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="1234"
                    />
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div className="pt-6 border-t border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                  placeholder="Instrucciones especiales de entrega..."
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in-down">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Confirmar Compra
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Resumen</h2>
              </div>

              <div className="space-y-4 mb-6">
                {shopItems.map((item) => (
                  <div key={item.productId} className="flex gap-3 pb-4 border-b border-slate-100">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-slate-400 text-xs">Sin imagen</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-slate-900 truncate">{item.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">Cantidad: {item.quantity}</p>
                      <p className="text-emerald-600 font-bold text-sm mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t-2 border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Envío</span>
                  <span className={freeShippingApplied ? 'text-emerald-600 font-semibold' : 'text-slate-600 font-semibold'}>
                    {freeShippingApplied ? 'GRATIS' : 'A cargo del comprador'}
                  </span>
                </div>
                {freeShippingThreshold && freeShippingThreshold > 0 && total < freeShippingThreshold && (
                  <p className="text-xs text-slate-500">
                    Te faltan{' '}
                    <span className="font-semibold text-slate-700">
                      ${ (freeShippingThreshold - total).toFixed(2) }
                    </span>{' '}
                    para envío gratis.
                  </p>
                )}
                <div className="flex justify-between text-xl font-bold text-slate-900 pt-3 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-emerald-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
