// frontend/src/pages/shop/Shop.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const Shop = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['shop-products', search, category],
    queryFn: () => 
      api.get('/products', { params: { search, category: category === 'All' ? '' : category, limit: 12 } })
         .then(r => r.data),
    staleTime: 60000,
  });

  return (
    <div id="page-shop" className="page">
      <div className="shop-hero">
        <div className="section-label"><div className="section-label-line"></div><span>Our Collection</span></div>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(60px,8vw,110px)', lineHeight: '0.9', letterSpacing: '-2px' }}>
          Shop <span style={{ color: 'var(--orange)' }}>Premium</span><br />Bikes.
        </h1>
        <div className="shop-filters">
          {['All', 'Sport', 'Naked', 'Adventure', 'Commuter', 'Parts'].map(cat => (
            <button 
              key={cat}
              className={`filter-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="shop-layout">
        <aside className="shop-sidebar">
          <div className="sidebar-section">
            <h4>Category</h4>
            <div className="sidebar-options">
              {['All Bikes', 'Sport Series', 'Naked Series', 'Adventure', 'Commuter', 'Parts Only'].map(opt => (
                <div key={opt} className="sidebar-opt">
                  <span>{opt}</span>
                  <span className="opt-count">12+</span>
                </div>
              ))}
            </div>
          </div>
          <div className="sidebar-section">
            <h4>Price Range</h4>
            <input type="range" className="price-range" min="50000" max="2000000" defaultValue="1000000" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--muted)' }}>
              <span>PKR 50K</span><span>PKR 20L</span>
            </div>
          </div>
          <div className="sidebar-section">
            <h4>Availability</h4>
            <div className="sidebar-options">
              <div className="sidebar-opt"><span>In Stock</span><span className="opt-count">38</span></div>
              <div className="sidebar-opt"><span>On Order</span><span className="opt-count">8</span></div>
            </div>
          </div>
        </aside>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'var(--black2)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Showing {data?.data.length || 0} bikes</span>
            <select style={{ background: 'var(--black)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--white)', padding: '8px 14px', fontSize: '12px', outline: 'none', fontFamily: "'Barlow',sans-serif" }}>
              <option>Sort: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          <div className="shop-grid">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="product-card" style={{ height: '300px', background: 'var(--black3)', opacity: 0.5 }}></div>
              ))
            ) : (
              data?.data.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-card-img">
                    [ BIKE ]
                    <div className="product-card-overlay"></div>
                    <div className="product-card-quick">View Details</div>
                  </div>
                  <div className="product-card-body">
                    <div className="product-cat">{product.category || 'Premium'}</div>
                    <div className="product-name">{product.name}</div>
                    <div className="product-price-row">
                      <div className="product-price">PKR {(product.price / 1000).toFixed(0)}K</div>
                      <div className="product-badge">In Stock</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '40px' }}>
            <button className="filter-pill active">1</button>
            <button className="filter-pill">2</button>
            <button className="filter-pill">3</button>
            <span style={{ color: 'var(--muted)', fontSize: '13px' }}>...</span>
            <button className="filter-pill">Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
