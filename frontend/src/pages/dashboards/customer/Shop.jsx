// frontend/src/pages/dashboards/customer/Shop.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../../components/customer/CustomerShared";
import api from "../../../services/api";
import { useCart } from "../../../context/CartContext";

const Shop = () => {
  const navigate = useNavigate();
  const { addItem, count } = useCart();
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState("");
  const [sortBy, setSortBy] = useState("stock_desc");

  // Initial loads
  useEffect(() => {
    Promise.all([
      api.get("/branches").catch(() => ({ data: { data: [] } })),
      api.get("/categories").catch(() => ({ data: [] }))
    ]).then(([br, ct]) => {
      // Branches returns { data: [], meta: {} }
      const branchList = br.data?.data || br.data || [];
      setBranches(Array.isArray(branchList) ? branchList : []);
      
      // Categories returns [...]
      const categoryList = ct.data?.data || ct.data || [];
      setCategories(Array.isArray(categoryList) ? categoryList : []);
    });
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    setLoading(true);
    const [sort, order] = sortBy.split("_");
    const params = {
      branchId: branchId || undefined,
      categoryId: cat === "All" ? undefined : cat,
      search: search || undefined,
      sortBy: sort,
      order: order || "desc"
    };

    api.get("/products", { params })
      .then(r => {
        const d = r?.data?.data ?? r?.data;
        setProducts(Array.isArray(d) ? d : []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [branchId, cat, search, sortBy]);

  const handleAdd = (e, p) => {
    e.stopPropagation();
    addItem({ id: p.id, name: p.name, price: p.price, category: p.category?.name }, 1);
  };

  const clearFilters = () => {
    setCat("All");
    setSearch("");
    setBranchId("");
    setSortBy("stock_desc");
  };

  return (
    <div className="shop-container">
      <div className="pg-hd">
        <div>
          <h1>Browse Shop</h1>
          <p>Authentic Crown Eve bikes, parts and accessories.</p>
        </div>
        <div className="pg-actions">
          <div className="fsearch">
            <span style={{ fontSize: 14, opacity: 0.5 }}>🔍</span>
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/cart")} style={{ position: "relative" }}>
            🛒 Cart {count > 0 && <span style={{ background: "var(--orange)", color: "#000", borderRadius: "50%", padding: "1px 6px", fontSize: 10, marginLeft: 4 }}>{count}</span>}
          </button>
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="filter-bar-premium">
        <div className="filter-group">
          <label>Category</label>
          <div className="fbar-scrollable">
            <button className={`fpill ${cat === "All" ? "on" : ""}`} onClick={() => setCat("All")}>All</button>
            {categories.map(c => (
              <button key={c.id} className={`fpill ${cat === c.id ? "on" : ""}`} onClick={() => setCat(c.id)}>{c.name}</button>
            ))}
          </div>
        </div>

        <div className="filter-controls-row">
          <div className="control-item">
            <label>Select Branch</label>
            <select value={branchId} onChange={e => setBranchId(e.target.value)} className="premium-select">
              <option value="">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="control-item">
            <label>Sort By</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="premium-select">
              <option value="stock_desc">High Stock First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>

          {(branchId || cat !== "All" || search) && (
            <button className="btn-clear" onClick={clearFilters}>Reset</button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="g4">
            {products.map(p => {
              const mainImg = p.images?.find(img => img.is_primary)?.url || p.images?.[0]?.url;
              const imgSrc = mainImg 
                ? (mainImg.startsWith('http') ? mainImg : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${mainImg}`)
                : null;

              return (
                <div key={p.id} className="card product-card" onClick={() => navigate(`/shop/${p.id}`)}>
                  <div className="product-img-wrapper">
                    {imgSrc ? (
                      <img src={imgSrc} alt={p.name} />
                    ) : (
                      <div className="no-img">📦</div>
                    )}
                    {p.stock_qty <= 0 && <div className="out-of-stock-tag">Out of Stock</div>}
                  </div>

                  <div className="product-info">
                    <div className="product-name">{p.name}</div>
                    <div className="product-branch">📍 {p.branch?.name}</div>
                    
                    <div className="product-meta">
                      <div className="product-cat">
                        {p.category?.name || "Uncategorized"}
                      </div>
                      <div className="product-price-box">
                        <div className="stock-label">QTY: {p.stock_qty}</div>
                        <div className="price-tag">PKR {Number(p.sale_price || p.price).toLocaleString()}</div>
                      </div>
                    </div>

                    <button 
                      className="add-cart-btn" 
                      disabled={p.stock_qty <= 0}
                      onClick={e => handleAdd(e, p)}
                    >
                      {p.stock_qty > 0 ? "ADD TO CART +" : "UNAVAILABLE"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {products.length === 0 && (
            <div className="empty-state">
              <div className="ei">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters.</p>
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear All Filters</button>
            </div>
          )}
        </>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .filter-bar-premium {
          background: #0c0c0c;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .filter-group label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          color: #666;
          font-weight: 800;
          margin-bottom: 10px;
          letter-spacing: 1px;
        }
        .fbar-scrollable {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 5px;
        }
        .filter-controls-row {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          align-items: flex-end;
          border-top: 1px solid #1a1a1a;
          padding-top: 20px;
        }
        .control-item {
          flex: 1;
          min-width: 200px;
        }
        .control-item label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          color: #666;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .premium-select {
          width: 100%;
          background: #000;
          border: 1px solid #333;
          color: #fff;
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .premium-select:focus {
          border-color: var(--orange);
        }
        .btn-clear {
          background: none;
          border: 1px solid #ff4d4d;
          color: #ff4d4d;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-clear:hover {
          background: #ff4d4d;
          color: #000;
        }
        .product-card {
          background: #0c0c0c !important;
          border: 1px solid #1a1a1a !important;
          padding: 15px !important;
          border-radius: 12px !important;
        }
        .product-img-wrapper {
          position: relative;
          height: 180px;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
        }
        .product-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .out-of-stock-tag {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 77, 77, 0.9);
          color: white;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .product-name {
          font-weight: 800;
          font-size: 14px;
          color: #fff;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .product-branch {
          font-size: 11px;
          color: #888;
          margin-bottom: 12px;
        }
        .product-meta {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 15px;
        }
        .product-cat {
          font-size: 10px;
          color: #00a3ff;
          font-weight: 700;
          text-transform: uppercase;
        }
        .product-price-box {
          text-align: right;
        }
        .stock-label {
          font-size: 10px;
          color: #ff4d4d;
          font-weight: 800;
          margin-bottom: 2px;
        }
        .price-tag {
          font-size: 20px;
          color: #fff;
          font-weight: 800;
          font-family: var(--font-m);
        }
        .add-cart-btn {
          width: 100%;
          background: var(--orange);
          color: #000;
          border: none;
          padding: 10px;
          border-radius: 6px;
          font-weight: 800;
          font-size: 12px;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .add-cart-btn:hover:not(:disabled) {
          transform: scale(1.02);
        }
        .add-cart-btn:disabled {
          background: #333;
          color: #666;
          cursor: not-allowed;
        }
      `}} />
    </div>
  );
};

export default Shop;
