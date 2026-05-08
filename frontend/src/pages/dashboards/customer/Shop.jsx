// frontend/src/pages/dashboards/customer/Shop.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../services/api";
import { useCart } from "../../../context/CartContext";
import "../../public/Shop.css";

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
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const getImgUrl = (url) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;
  };

  // Initial loads
  useEffect(() => {
    Promise.all([
      api.get("/branches").catch(() => ({ data: { data: [] } })),
      api.get("/categories").catch(() => ({ data: [] }))
    ]).then(([br, ct]) => {
      const branchList = br.data?.data || br.data || [];
      setBranches(Array.isArray(branchList) ? branchList : []);
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
      order: order || "desc",
      page: page,
      limit: 12 // Standard grid size
    };

    api.get("/products", { params })
      .then(r => {
        const d = r?.data?.data ?? r?.data;
        const meta = r?.data?.meta;
        setProducts(Array.isArray(d) ? d : []);
        if (meta) {
          setTotalPages(meta.totalPages || 1);
          setTotalItems(meta.total || 0);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [branchId, cat, search, sortBy, page]);

  const clearFilters = () => {
    setCat("All");
    setSearch("");
    setBranchId("");
    setSortBy("stock_desc");
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="shop-container">
      <div className="pg-hd">
        <div>
          <h1>Premium Catalog</h1>
          <p>Showing {products.length} of {totalItems} items</p>
        </div>
        <div className="pg-actions">
          <div className="fsearch">
            <span>🔍</span>
            <input placeholder="Search models or parts..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <button className="btn-clear" onClick={() => navigate("/cart")} style={{ position: "relative", borderColor: 'var(--orange)', color: 'var(--orange)' }}>
            🛒 Cart ({count})
          </button>
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="filter-bar-premium">
        <div className="filter-group">
          <label>Categories</label>
          <div className="fbar-scrollable">
            <button className={`fpill ${cat === "All" ? "on" : ""}`} onClick={() => { setCat("All"); setPage(1); }}>All Products</button>
            {categories.map(c => (
              <button key={c.id} className={`fpill ${cat === c.id ? "on" : ""}`} onClick={() => { setCat(c.id); setPage(1); }}>{c.name}</button>
            ))}
          </div>
        </div>

        <div className="filter-controls-row">
          <div className="control-item">
            <label>Available at Branch</label>
            <select className="premium-select" value={branchId} onChange={e => { setBranchId(e.target.value); setPage(1); }}>
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="control-item">
            <label>Sort By</label>
            <select className="premium-select" value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}>
              <option value="stock_desc">Availability (Highest First)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A-Z</option>
            </select>
          </div>
          <button className="btn-clear" onClick={clearFilters}>Reset Filters</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 100, textAlign: "center" }}>Loading Catalog...</div>
      ) : products.length > 0 ? (
        <>
          <div className="products-grid">
            {products.map(p => {
              const mainImg = p.images?.find(img => img.is_primary)?.url || p.images?.[0]?.url;
              
              return (
                <Link to={`/product/${p.id}`} key={p.id} className="bike-card-new">
                  <div className="product-card-img">
                    <div className="bike-card-blob"></div>
                    {mainImg ? (
                      <img src={getImgUrl(mainImg)} alt={p.name} className="bike-main-img" />
                    ) : (
                      <div className="placeholder-img">{p.name}</div>
                    )}
                    {p.stock_qty <= 0 && <div className="out-of-stock-tag">Out of Stock</div>}
                  </div>
                  <div className="product-card-body">
                    <div className="product-cat">{p.category?.name || 'Model'}</div>
                    <h3 className="bike-name-new">{p.name}</h3>
                    <div className="bike-price-new">
                      Rs. {Number(p.sale_price || p.price).toLocaleString()}
                    </div>
                    
                    <div className="bike-card-footer">
                      <span className="check-details">Check Details</span>
                      <div className="arrow-circle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-footer">
              <button 
                className="pag-btn" 
                disabled={page === 1} 
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </button>
              
              <div className="pag-numbers">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i + 1} 
                    className={`pag-num ${page === i + 1 ? 'active' : ''}`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                className="pag-btn" 
                disabled={page === totalPages} 
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
          <button className="btn-clear" onClick={clearFilters}>Clear All Filters</button>
        </div>
      )}
    </div>
  );
};

export default Shop;
