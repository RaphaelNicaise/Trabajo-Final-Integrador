import { useState } from 'react';
import { useCart, calculateItemTotal, calculateUnitPrice } from '../contexts/CartContext';
import { ShoppingCart, X, Plus, Minus, Trash2, Tag } from 'lucide-react';
import Link from 'next/link';

export function FloatingCart() {
  const { items, removeItem, updateQuantity, getTotal, getItemCount, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const itemCount = getItemCount();
  const total = getTotal();

  if (itemCount === 0 && !isOpen) return null;

  return (
    <>
      {/* Boton Flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-2xl hover:shadow-emerald-500/50 transition-all z-50 group animate-fade-in cursor-pointer hover:-translate-y-1"
      >
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-scale-in">
            {itemCount}
          </span>
        )}
      </button>

      {/* Panel Deslizante */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Carrito */}
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Tu Carrito</h2>
                    <p className="text-sm text-slate-600">{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <ShoppingCart className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium">Tu carrito está vacío</p>
                  <p className="text-sm text-slate-500 mt-1">Agrega productos para comenzar</p>
                </div>
              ) : (
                <>
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all animate-fade-in-up"
                    >
                      <div className="flex gap-4">
                        {/* Imagen */}
                        <div className="w-20 h-20 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-slate-400 text-xs">Sin imagen</span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">{item.name}</h3>
                          <p className="text-xs text-slate-500 mt-1">{item.shopName}</p>

                          {/* Promoción badge + precio */}
                          {item.promotion?.activa ? (
                            <div className="mt-2">
                              <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full mb-1">
                                <Tag className="w-3 h-3" />
                                {item.promotion.tipo === 'porcentaje' && `${item.promotion.valor}% OFF`}
                                {item.promotion.tipo === 'fijo' && `-$${item.promotion.valor}`}
                                {item.promotion.tipo === 'nxm' && `${item.promotion.valor}x${item.promotion.valor_secundario}`}
                              </span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-emerald-600 font-bold">${calculateUnitPrice(item.price, item.promotion).toFixed(2)}</span>
                                <span className="text-xs text-slate-400 line-through">${item.price.toFixed(2)}</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Subtotal: <span className="font-semibold text-slate-700">${calculateItemTotal(item).toFixed(2)}</span>
                              </p>
                            </div>
                          ) : (
                            <p className="text-emerald-600 font-bold mt-2">${item.price.toFixed(2)}</p>
                          )}

                          {/* Controles de cantidad */}
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Eliminar */}
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-colors cursor-pointer self-start"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Vaciar carrito */}
                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="w-full text-sm text-red-600 hover:text-red-700 hover:bg-red-50 py-2 rounded-md transition-colors cursor-pointer"
                    >
                      Vaciar carrito
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-slate-200 bg-white space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between text-lg font-bold">
                  <span className="text-slate-700">Total:</span>
                  <span className="text-emerald-600">${total.toFixed(2)}</span>
                </div>

                {/* Boton Checkout */}
                <Link
                  href={`/checkout/${items[0]?.shopSlug}`}
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg text-center transition-all hover:shadow-lg cursor-pointer hover:-translate-y-0.5"
                >
                  Proceder al Checkout
                </Link>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-slate-600 hover:text-slate-800 font-medium py-2 transition-colors cursor-pointer"
                >
                  Seguir comprando
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
