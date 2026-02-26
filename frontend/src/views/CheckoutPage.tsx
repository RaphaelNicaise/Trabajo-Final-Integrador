import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart, calculateItemTotal } from '../contexts/CartContext';
import { ordersService } from '../services/orders.service';
import type { ShippingQuote } from '../services/orders.service';
import { fetchProvincias, fetchLocalidades } from '../services/georef.service';
import type { Provincia, Localidad } from '../services/georef.service';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { ShoppingBag, CreditCard, User, MapPin, Phone, Mail, Truck, ChevronRight, ChevronLeft, Check, Lock, Hash } from 'lucide-react';
import { type Configuration } from '../services/configurations.service';

const STEPS = [
  { id: 1, label: 'Datos', icon: User },
  { id: 2, label: 'Envío', icon: Truck },
  { id: 3, label: 'Pago', icon: CreditCard },
  { id: 4, label: 'Confirmar', icon: Check },
];

export function CheckoutPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { items, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [minPurchaseAmount, setMinPurchaseAmount] = useState<number | null>(null);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null);

  // Step 1: Buyer info
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Step 2: Shipping address
  const [addressData, setAddressData] = useState({
    province: '',
    city: '',
    address: '',
    streetNumber: '',
    postalCode: '',
    notes: '',
  });

  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  // Step 3: Payment info (mock)
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
  });
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});

  // Filter shop items
  const shopItems = items.filter(item => item.shopSlug === slug);
  const subtotal = shopItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const shippingCost = shippingQuote?.cost || 0;
  const grandTotal = subtotal + shippingCost;

  const meetsMinPurchase = !minPurchaseAmount || subtotal >= minPurchaseAmount;
  const freeShippingApplied = freeShippingThreshold && freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;

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

  // Load provincias on mount
  useEffect(() => {
    setLoadingProvincias(true);
    fetchProvincias()
      .then(setProvincias)
      .catch(() => {})
      .finally(() => setLoadingProvincias(false));
  }, []);

  // Load localidades when province changes
  useEffect(() => {
    if (!addressData.province) {
      setLocalidades([]);
      return;
    }
    setLoadingLocalidades(true);
    setAddressData(prev => ({ ...prev, city: '' }));
    fetchLocalidades(addressData.province)
      .then(setLocalidades)
      .catch(() => {})
      .finally(() => setLoadingLocalidades(false));
  }, [addressData.province]);

  // Fetch shipping quote when address is complete
  useEffect(() => {
    if (!addressData.postalCode || !addressData.province || !slug) {
      setShippingQuote(null);
      return;
    }
    setLoadingQuote(true);
    ordersService.getShippingQuote(slug, addressData.postalCode, addressData.province)
      .then(setShippingQuote)
      .catch(() => setShippingQuote(null))
      .finally(() => setLoadingQuote(false));
  }, [addressData.postalCode, addressData.province, slug]);

  // Validation
  const isStep1Valid = formData.name.trim() && formData.email.trim() && formData.phone.trim();
  const isStep2Valid = addressData.province && addressData.city && addressData.address.trim() && addressData.streetNumber.trim() && addressData.postalCode.trim() && shippingQuote;
  const isStep3Valid = !Object.values(paymentErrors).some(Boolean) && paymentData.cardNumber.replace(/\s/g, '').length >= 13 && paymentData.cardHolder.trim() && paymentData.expiry.trim().length >= 4 && paymentData.cvv.trim().length >= 3;

  const validatePaymentField = (field: string, value: string) => {
    const errs = { ...paymentErrors };
    switch (field) {
      case 'cardNumber': {
        const clean = value.replace(/\s/g, '');
        errs.cardNumber = clean.length < 13 || clean.length > 19 || !/^\d+$/.test(clean) ? 'Número de tarjeta inválido' : '';
        break;
      }
      case 'cardHolder':
        errs.cardHolder = value.trim().length < 3 ? 'Nombre requerido' : '';
        break;
      case 'expiry': {
        const cleanExp = value.replace('/', '');
        errs.expiry = cleanExp.length < 4 || !/^\d+$/.test(cleanExp) ? 'Formato MM/AA' : '';
        break;
      }
      case 'cvv':
        errs.cvv = value.length < 3 || value.length > 4 || !/^\d+$/.test(value) ? 'CVV inválido' : '';
        break;
    }
    setPaymentErrors(errs);
  };

  const formatCardNumber = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 16);
    return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) return `${clean.slice(0, 2)}/${clean.slice(2)}`;
    return clean;
  };

  const nextStep = () => {
    setError('');
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    setError('');
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleConfirmOrder = async () => {
    setError('');
    setLoading(true);

    const minAmount = minPurchaseAmount || 0;
    if (minAmount > 0 && subtotal < minAmount) {
      setError(`El monto mínimo de compra es $${minAmount.toFixed(2)}`);
      setLoading(false);
      return;
    }

    try {
      const effectiveShippingCost = freeShippingApplied ? 0 : shippingCost;

      const orderData = {
        buyer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: addressData.address,
          streetNumber: addressData.streetNumber,
          city: addressData.city,
          province: addressData.province,
          postalCode: addressData.postalCode,
          notes: addressData.notes,
        },
        products: shopItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shipping: {
          cost: effectiveShippingCost,
          estimatedDays: shippingQuote?.estimatedDays || 0,
          method: shippingQuote?.method || 'Estándar',
        },
        payment: {
          method: 'Tarjeta',
          cardLastFour: paymentData.cardNumber.replace(/\s/g, '').slice(-4),
          cardHolder: paymentData.cardHolder,
          status: 'Aprobado',
        },
      };

      await ordersService.createOrder(slug!, orderData);
      setSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error('Error al crear orden:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Error al procesar la orden. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
        <PublicNavbar />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-12 text-center animate-scale-in">
            <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">¡Orden Confirmada!</h2>
            <p className="text-slate-600 mb-2">Tu orden ha sido procesada exitosamente.</p>
            <p className="text-sm text-slate-500 mb-1">Recibirás un email de confirmación en <strong>{formData.email}</strong></p>
            <p className="text-sm text-slate-500">La tienda también fue notificada y preparará tu pedido.</p>
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

  const effectiveShippingCost = freeShippingApplied ? 0 : shippingCost;
  const displayTotal = subtotal + effectiveShippingCost;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <PublicNavbar />

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Finalizar Compra</h1>
          <p className="text-slate-600">Completa los pasos para procesar tu orden</p>
        </div>

        {/* Stepper */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-center gap-0">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-200 text-slate-400'}`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs mt-1.5 font-medium ${isActive ? 'text-emerald-600' : isCompleted ? 'text-emerald-500' : 'text-slate-400'}`}>{step.label}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-all ${isCompleted ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

              {/* ── STEP 1: Buyer Info ── */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Información Personal</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo *</label>
                      <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" placeholder="Juan Pérez" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Teléfono *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" placeholder="+54 9 11 1234-5678" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" placeholder="tu@email.com" />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Shipping ── */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-cyan-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Dirección de Envío</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Provincia *</label>
                      <select
                        required
                        value={addressData.province}
                        onChange={(e) => setAddressData({ ...addressData, province: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                        disabled={loadingProvincias}
                      >
                        <option value="">{loadingProvincias ? 'Cargando...' : 'Seleccionar provincia'}</option>
                        {provincias.map((p) => (
                          <option key={p.id} value={p.nombre}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Ciudad *</label>
                      <select
                        required
                        value={addressData.city}
                        onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                        disabled={!addressData.province || loadingLocalidades}
                      >
                        <option value="">{loadingLocalidades ? 'Cargando...' : !addressData.province ? 'Primero seleccioná provincia' : 'Seleccionar ciudad'}</option>
                        {localidades.map((l) => (
                          <option key={l.id} value={l.nombre}>{l.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Dirección *</label>
                      <input type="text" required value={addressData.address} onChange={(e) => setAddressData({ ...addressData, address: e.target.value })} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" placeholder="Av. Siempre Viva" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Número *</label>
                      <input type="text" required value={addressData.streetNumber} onChange={(e) => setAddressData({ ...addressData, streetNumber: e.target.value })} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" placeholder="742" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Código Postal *</label>
                      <input type="text" required value={addressData.postalCode} onChange={(e) => setAddressData({ ...addressData, postalCode: e.target.value })} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" placeholder="1234" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Notas (opcional)</label>
                      <input type="text" value={addressData.notes} onChange={(e) => setAddressData({ ...addressData, notes: e.target.value })} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" placeholder="Piso, depto, timbre..." />
                    </div>
                  </div>

                  {/* Shipping quote result */}
                  {loadingQuote && (
                    <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-cyan-700">Calculando envío...</span>
                    </div>
                  )}
                  {shippingQuote && !loadingQuote && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold text-emerald-800">Cotización de envío</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Método</p>
                          <p className="font-medium text-slate-800">{shippingQuote.method}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Costo</p>
                          <p className="font-medium text-slate-800">
                            {freeShippingApplied ? (
                              <><span className="line-through text-slate-400 mr-1">${shippingQuote.cost.toFixed(2)}</span><span className="text-emerald-600 font-bold">GRATIS</span></>
                            ) : (
                              `$${shippingQuote.cost.toFixed(2)}`
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Estimado</p>
                          <p className="font-medium text-slate-800">{shippingQuote.estimatedDays} días hábiles</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 3: Payment ── */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Información de Pago</h2>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      Entorno de prueba — cualquier dato será aceptado.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Número de tarjeta *</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        value={paymentData.cardNumber}
                        onChange={(e) => {
                          const val = formatCardNumber(e.target.value);
                          setPaymentData({ ...paymentData, cardNumber: val });
                          validatePaymentField('cardNumber', val);
                        }}
                        className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${paymentErrors.cardNumber ? 'border-red-300' : 'border-slate-300'}`}
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                      />
                    </div>
                    {paymentErrors.cardNumber && <p className="text-xs text-red-500 mt-1">{paymentErrors.cardNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Titular de la tarjeta *</label>
                    <input
                      type="text"
                      required
                      value={paymentData.cardHolder}
                      onChange={(e) => {
                        setPaymentData({ ...paymentData, cardHolder: e.target.value });
                        validatePaymentField('cardHolder', e.target.value);
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${paymentErrors.cardHolder ? 'border-red-300' : 'border-slate-300'}`}
                      placeholder="JUAN PEREZ"
                    />
                    {paymentErrors.cardHolder && <p className="text-xs text-red-500 mt-1">{paymentErrors.cardHolder}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Vencimiento *</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        value={paymentData.expiry}
                        onChange={(e) => {
                          const val = formatExpiry(e.target.value);
                          setPaymentData({ ...paymentData, expiry: val });
                          validatePaymentField('expiry', val);
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${paymentErrors.expiry ? 'border-red-300' : 'border-slate-300'}`}
                        placeholder="MM/AA"
                        maxLength={5}
                      />
                      {paymentErrors.expiry && <p className="text-xs text-red-500 mt-1">{paymentErrors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">CVV *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          value={paymentData.cvv}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setPaymentData({ ...paymentData, cvv: val });
                            validatePaymentField('cvv', val);
                          }}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${paymentErrors.cvv ? 'border-red-300' : 'border-slate-300'}`}
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                      {paymentErrors.cvv && <p className="text-xs text-red-500 mt-1">{paymentErrors.cvv}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 4: Review & Confirm ── */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Confirmación del Pedido</h2>
                  </div>

                  {/* Buyer review */}
                  <div className="p-4 bg-slate-50 rounded-lg space-y-1">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><User className="w-4 h-4" /> Comprador</h3>
                    <p className="text-sm text-slate-600">{formData.name}</p>
                    <p className="text-sm text-slate-600">{formData.email}</p>
                    <p className="text-sm text-slate-600">{formData.phone}</p>
                  </div>

                  {/* Shipping review */}
                  <div className="p-4 bg-slate-50 rounded-lg space-y-1">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><MapPin className="w-4 h-4" /> Envío</h3>
                    <p className="text-sm text-slate-600">{addressData.address} {addressData.streetNumber}</p>
                    <p className="text-sm text-slate-600">{addressData.city}, {addressData.province} - CP {addressData.postalCode}</p>
                    {addressData.notes && <p className="text-sm text-slate-500 italic">{addressData.notes}</p>}
                    {shippingQuote && (
                      <p className="text-sm text-emerald-600 font-medium mt-1">
                        {shippingQuote.method} — {freeShippingApplied ? 'GRATIS' : `$${shippingQuote.cost.toFixed(2)}`} — {shippingQuote.estimatedDays} días hábiles
                      </p>
                    )}
                  </div>

                  {/* Payment review */}
                  <div className="p-4 bg-slate-50 rounded-lg space-y-1">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><CreditCard className="w-4 h-4" /> Pago</h3>
                    <p className="text-sm text-slate-600">Tarjeta terminada en •••• {paymentData.cardNumber.replace(/\s/g, '').slice(-4)}</p>
                    <p className="text-sm text-slate-600">{paymentData.cardHolder}</p>
                  </div>

                  {/* Products review */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3"><ShoppingBag className="w-4 h-4" /> Productos</h3>
                    {shopItems.map((item) => (
                      <div key={item.productId} className="flex justify-between text-sm py-1.5 border-b border-slate-200 last:border-0">
                        <span className="text-slate-700">{item.name} <span className="text-slate-400">x{item.quantity}</span></span>
                        <span className="font-medium text-slate-800">${calculateItemTotal(item).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm pt-2 mt-2 border-t border-slate-300">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-1">
                      <span className="text-slate-600">Envío</span>
                      <span className="font-medium">{freeShippingApplied ? <span className="text-emerald-600">GRATIS</span> : `$${shippingCost.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between pt-2 mt-2 border-t-2 border-slate-300">
                      <span className="text-lg font-bold text-slate-900">Total</span>
                      <span className="text-lg font-bold text-emerald-600">${displayTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in-down">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-200">
                {currentStep > 1 ? (
                  <button type="button" onClick={prevStep} className="inline-flex items-center gap-2 px-5 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all cursor-pointer font-medium">
                    <ChevronLeft className="w-5 h-5" /> Anterior
                  </button>
                ) : <div />}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !isStep1Valid) ||
                      (currentStep === 2 && !isStep2Valid) ||
                      (currentStep === 3 && !isStep3Valid)
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Siguiente <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Confirmar y Pagar
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Resumen</h2>
              </div>

              <div className="mb-6 max-h-[340px] overflow-y-auto pr-1 space-y-4">
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
                        ${calculateItemTotal(item).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t-2 border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Envío</span>
                  <span className="font-semibold">
                    {!shippingQuote ? (
                      <span className="text-slate-400 text-sm">Por calcular</span>
                    ) : freeShippingApplied ? (
                      <span className="text-emerald-600">GRATIS</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                {freeShippingThreshold && freeShippingThreshold > 0 && subtotal < freeShippingThreshold && (
                  <p className="text-xs text-slate-500">
                    Te faltan <span className="font-semibold text-slate-700">${(freeShippingThreshold - subtotal).toFixed(2)}</span> para envío gratis.
                  </p>
                )}
                <div className="flex justify-between text-xl font-bold text-slate-900 pt-3 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-emerald-600">${displayTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
