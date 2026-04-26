import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center relative overflow-hidden text-[#F0EFE9] font-sans">
      
      {/* Content */}
      <div className="z-10 flex flex-col items-center text-center px-4 max-w-2xl mx-auto mt-[-5vh]">
        
        {/* Bike Icon */}
        <svg 
          width="54" height="54" viewBox="0 0 24 24" fill="none" 
          stroke="#FF4D00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" 
          className="mb-8"
        >
          <circle cx="5.5" cy="17.5" r="3.5"/>
          <circle cx="18.5" cy="17.5" r="3.5"/>
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/>
        </svg>

        {/* Badge */}
        <div className="border border-[#FF4D00]/30 rounded-full px-5 py-[6px] text-[#FF4D00] text-[11px] font-bold tracking-[0.25em] mb-10 uppercase bg-[#FF4D00]/5">
          Wrong Lane
        </div>

        {/* 404 Text */}
        <h1 
          className="text-[160px] md:text-[220px] font-['Bebas_Neue'] leading-none text-[#FF4D00] mb-6 tracking-wide"
          style={{ textShadow: "0 0 60px rgba(255,77,0,0.15), 0 0 20px rgba(255,77,0,0.05)" }}
        >
          404
        </h1>

        <h2 className="text-3xl md:text-[42px] font-medium tracking-wide mb-6">
          You rode off the map.
        </h2>

        <p className="text-[#7A7977] text-sm md:text-[15px] max-w-md mx-auto mb-14 leading-relaxed">
          This page doesn't exist. Even the best riders<br className="hidden md:block"/> miss an exit sometimes.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-5">
          <button 
            onClick={() => navigate(-1)}
            className="px-7 py-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all flex items-center gap-3 text-[13px] font-semibold text-white/90"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Ride Home
          </button>
          
          <Link 
            to="/shop"
            className="px-7 py-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all text-[13px] font-semibold text-white/90"
          >
            Browse Shop
          </Link>
        </div>
      </div>

      {/* Road Perspective Background Effect */}
      <div className="absolute bottom-0 w-full h-[40vh] overflow-hidden pointer-events-none opacity-40 z-0">
        {/* Horizontal orange dashed lines & vertical grey tracks */}
        <div 
          className="absolute bottom-0 left-[50%] w-[200vw] h-[200vh]"
          style={{
            transform: 'translateX(-50%) perspective(400px) rotateX(78deg)',
            transformOrigin: 'bottom center',
            backgroundImage: `
              repeating-linear-gradient(to bottom, transparent, transparent 40px, rgba(255, 77, 0, 0.5) 40px, rgba(255, 77, 0, 0.5) 45px),
              repeating-linear-gradient(to right, transparent, transparent 48%, rgba(150, 150, 150, 0.15) 48%, rgba(150, 150, 150, 0.15) 48.5%, transparent 48.5%, transparent 51.5%, rgba(150, 150, 150, 0.15) 51.5%, rgba(150, 150, 150, 0.15) 52%, transparent 52%)
            `,
            backgroundSize: '100% 120px, 100% 100%'
          }}
        />
        {/* Dark gradient fade at the top of the road */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0A0A0B] via-[#0A0A0B]/80 to-transparent" />
      </div>
    </div>
  );
}
