// frontend/src/pages/public/Cart.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
  // Demo state - in real app, use a CartContext
  const items = [
    { id: 1, name: 'Crown Eve Elite Road', price: 4200, qty: 1 },
    { id: 2, name: 'Aerodynamic Wheelset', price: 1200, qty: 1 },
  ];

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <header className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Your Cart</h1>
        <span className="text-slate-400">{items.length} items</span>
      </header>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* List */}
          <div className="lg:col-span-2 space-y-6">
            {items.map(item => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 flex items-center gap-8">
                <div className="w-24 h-24 bg-slate-950 rounded-2xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=200" alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold">{item.name}</h4>
                  <p className="text-emerald-400 font-bold mt-1">${item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center bg-slate-950 rounded-xl px-3 py-1">
                   <button className="p-2">-</button>
                   <span className="w-8 text-center font-bold">{item.qty}</span>
                   <button className="p-2">+</button>
                </div>
                <button className="p-3 text-red-900 hover:text-red-500 transition-all">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 h-fit space-y-8">
            <h3 className="text-2xl font-bold">Order Summary</h3>
            <div className="space-y-4 text-slate-400">
              <div className="flex justify-between"><span>Subtotal</span><span className="text-white">${subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className="text-white">Calculated at checkout</span></div>
            </div>
            <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
               <span className="text-slate-400">Estimated Total</span>
               <span className="text-3xl font-black text-emerald-400">${subtotal.toLocaleString()}</span>
            </div>
            <Link to="/checkout" className="block w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl text-center font-black text-xl shadow-2xl shadow-blue-900/20 transition-all">
              PROCEED TO CHECKOUT
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-32 space-y-6">
          <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-700">
            <ShoppingBag size={48} />
          </div>
          <h3 className="text-2xl font-bold">Your cart is empty</h3>
          <Link to="/shop" className="inline-flex items-center text-blue-400 font-bold hover:underline">
            Go back shopping <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;
