// frontend/src/components/skeletons/CardSkeleton.jsx
import React from 'react';

const CardSkeleton = () => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-4 bg-slate-800 rounded w-1/3" />
      <div className="h-6 w-6 bg-slate-800 rounded-full" />
    </div>
    <div className="h-8 bg-slate-800 rounded w-1/2 mb-3" />
    <div className="h-3 bg-slate-800 rounded w-2/3" />
  </div>
);

export default CardSkeleton;
