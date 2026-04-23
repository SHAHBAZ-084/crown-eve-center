// frontend/src/pages/checkout/Checkout.jsx
import React from 'react';
import { CreditCard, Truck, ShieldCheck } from 'lucide-react';

const Checkout = () => {
  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-8">
        <section className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Truck className="mr-3 text-blue-400" /> Shipping Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="First Name" className="bg-slate-950 border border-slate-800 p-4 rounded-xl" />
            <input placeholder="Last Name" className="bg-slate-950 border border-slate-800 p-4 rounded-xl" />
            <input placeholder="Address" className="col-span-2 bg-slate-950 border border-slate-800 p-4 rounded-xl" />
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <CreditCard className="mr-3 text-emerald-400" /> Payment Method
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-blue-500 rounded-xl flex items-center justify-between">
              <span>Credit / Debit Card</span>
              <ShieldCheck className="text-blue-400" />
            </div>
            <input placeholder="Card Number" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl" />
          </div>
        </section>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl h-fit sticky top-8">
        <h3 className="text-xl font-bold mb-6">Order Summary</h3>
        <div className="space-y-4 text-slate-400 border-b border-slate-800 pb-6 mb-6">
          <div className="flex justify-between"><span>Subtotal</span><span className="text-white">$2,450.00</span></div>
          <div className="flex justify-between"><span>Shipping</span><span className="text-white">Free</span></div>
          <div className="flex justify-between"><span>Tax</span><span className="text-white">$120.00</span></div>
        </div>
        <div className="flex justify-between text-xl font-bold mb-8">
          <span>Total</span>
          <span className="text-emerald-400">$2,570.00</span>
        </div>
        <button className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-900/20">
          Place Order
        </button>
      </div>
    </div>
  );
};

export default Checkout;
