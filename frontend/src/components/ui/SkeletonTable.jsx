// frontend/src/components/skeletons/TableSkeleton.jsx
import React from 'react';

const TableSkeleton = ({ rows = 5 }) => (
  <div className="w-full animate-pulse space-y-4">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex space-x-4 p-4 border-b border-slate-800">
        <div className="h-4 bg-slate-800 rounded w-1/4" />
        <div className="h-4 bg-slate-800 rounded w-1/4" />
        <div className="h-4 bg-slate-800 rounded w-1/4" />
        <div className="h-4 bg-slate-800 rounded w-1/4" />
      </div>
    ))}
  </div>
);

export default TableSkeleton;
