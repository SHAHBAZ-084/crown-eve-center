// frontend/src/pages/auth/Forgot.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const Forgot = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl space-y-8">
        <Link to="/login" className="inline-flex items-center text-slate-500 hover:text-orange-600 transition-all text-sm font-bold">
          <ArrowLeft size={16} className="mr-2" /> Back to Login
        </Link>

        <header className="text-center space-y-2">
          <h1 className="text-3xl font-black italic tracking-tighter">RESET ACCESS</h1>
          <p className="text-slate-500">We'll send a recovery link to your inbox</p>
        </header>

        {sent ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center space-y-4">
            <p className="text-emerald-400 font-medium">Reset link sent to {email}</p>
            <p className="text-xs text-slate-500 italic">Please check your spam folder if you don't see it within 2 minutes.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" 
              />
            </div>
            <button className="w-full bg-white text-black py-5 rounded-2xl font-black text-xl hover:bg-blue-500 hover:text-orange-600 transition-all shadow-2xl">
              SEND LINK
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Forgot;
