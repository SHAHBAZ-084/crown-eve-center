// frontend/src/pages/dashboards/customer/Shop.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import publicApi from "../../../services/publicApi";
import { useCart } from "../../../context/CartContext";
import { useDebounce } from "../../../hooks/useDebounce";
import { getImgUrl } from "../../../utils/imgUrl";
import { normalizePaginated } from "../../../utils/normalizeApiList";
import CustomerPageHeader from "../../../components/customer/CustomerPageHeader";
import { CustomerEmpty } from "../../../components/customer/CustomerUI";
import CatalogProductImage from "../../../components/catalog/CatalogProductImage";
import ProductGridSkeleton from "../../../components/catalog/ProductGridSkeleton";
import { Search } from "lucide-react";
import "../../public/Shop.css";

const Shop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem, count } = useCart();

  const [cat, setCat] = useState("All");
  const [type, setType] = useState("All");
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState("");
  const [sortBy, setSortBy] = useState("stock_desc");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 350);
  const cartPath = location.pathname.startsWith('/my/') ? '/my/cart' : '/cart';
  const productPath = (id) => (location.pathname.startsWith('/my/') ? `/my/product/${id}` : `/product/${id}`);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get("type");
    if (typeParam) {
      setType(typeParam);
      setPage(1);
    }
  }, [location.search]);

  const { data: branches = [] } = useQuery({
    queryKey: ["shop", "branches"],
    queryFn: () =>
      publicApi.get("/branches").then((r) => {
        const list = r.data?.data ?? r.data ?? [];
        return Array.isArray(list) ? list : [];
      }),
    staleTime: 10 * 60 * 1000,
  });

  const productParams = useMemo(() => {
    const [sort, order] = sortBy.split("_");
    return {
      branchId: branchId || undefined,
      categoryId: cat === "All" ? undefined : cat,
      product_type: type === "All" ? undefined : type,
      search: debouncedSearch || undefined,
      sortBy: sort,
      order: order || "desc",
      page,
      limit: 12,
      lite: "1",
    };
  }, [branchId, cat, type, debouncedSearch, sortBy, page]);

  const {
    data: productsResult,
    isLoading,
    isFetching,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["shop", "products", productParams],
    queryFn: () =>
      publicApi.get("/products", { params: productParams }).then((r) => normalizePaginated(r.data)),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: 2,
  });

  const products = productsResult?.data ?? [];

  const totalPages = productsResult?.meta?.totalPages || 1;
  const totalItems = productsResult?.meta?.total || 0;
  const showLoading = isLoading && products.length === 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page, type, cat, branchId, debouncedSearch, sortBy]);

  const clearFilters = () => {
    setCat("All");
    setType("All");
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

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }

    if (page - delta > 2) range.unshift("...");
    range.unshift(1);

    if (page + delta < totalPages - 1) range.push("...");
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  return (
    <div className="ce-page ce-shop shop-container">
      <CustomerPageHeader
        eyebrow="Shop"
        title="Premium Catalog"
        subtitle={`Showing ${products.length} of ${totalItems} items${isFetching && !showLoading ? " · updating…" : ""}`}
        actions={
          <>
            <div className="fsearch">
              <Search size={16} aria-hidden />
              <input
                placeholder="Search models or parts..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <button type="button" className="premium-cart-btn" onClick={() => navigate(cartPath)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span>Cart</span>
              {count > 0 && <span className="cart-badge">{count}</span>}
            </button>
          </>
        }
      />

      <div className="filter-bar-premium">
        <div className="filter-group">
          <label>Browse By Type</label>
          <div className="fbar-scrollable">
            <button className={`fpill ${type === "All" ? "on" : ""}`} onClick={() => { setType("All"); setPage(1); }}>All Products</button>
            <button className={`fpill ${type === "bike" ? "on" : ""}`} onClick={() => { setType("bike"); setPage(1); }}>Electric Bikes</button>
            <button className={`fpill ${type === "part" ? "on" : ""}`} onClick={() => { setType("part"); setPage(1); }}>Spare Parts</button>
          </div>
        </div>

        <div className="filter-controls-row">
          <div className="control-item">
            <label>Available at Branch</label>
            <select className="premium-select" value={branchId} onChange={(e) => { setBranchId(e.target.value); setPage(1); }}>
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="control-item">
            <label>Sort By</label>
            <select className="premium-select" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
              <option value="stock_desc">Availability (Highest First)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A-Z</option>
            </select>
          </div>
          <button className="btn-clear" onClick={clearFilters}>Reset Filters</button>
        </div>
      </div>

      {showLoading ? (
        <ProductGridSkeleton count={8} className="products-grid" />
      ) : products.length > 0 ? (
        <>
          <div className="products-grid products-grid--reserved">
            {products.map((p) => {
              const mainImg = p.images?.find((img) => img.is_primary)?.url || p.images?.[0]?.url;

              return (
                <Link to={productPath(p.id)} key={p.id} className="bike-card-new">
                  <div className="product-card-img">
                    {mainImg ? (
                      <CatalogProductImage src={getImgUrl(mainImg)} alt={p.name} />
                    ) : (
                      <div className="placeholder-img">{p.name}</div>
                    )}
                    {p.stock_qty <= 0 && <div className="out-of-stock-tag">Out of Stock</div>}
                  </div>
                  <div className="product-card-body">
                    <div className="product-cat">{p.category?.name || (p.product_type === "bike" ? "Bike" : "Part")}</div>
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
                {getPaginationRange().map((p, i) => (
                  <React.Fragment key={i}>
                    {p === "..." ? (
                      <span className="pag-ellipsis">...</span>
                    ) : (
                      <button
                        className={`pag-num ${page === p ? "active" : ""}`}
                        onClick={() => handlePageChange(p)}
                      >
                        {p}
                      </button>
                    )}
                  </React.Fragment>
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
      ) : isProductsError ? (
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <p>Could not load products. The server may be busy — please try again.</p>
          <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => refetchProducts()}>
            Retry
          </button>
        </div>
      ) : (
        <div className="card">
          <CustomerEmpty
            title="No products found"
            description="Try adjusting your search or filters. Seeded parts must be active in the database."
            actionLabel="Clear All Filters"
            onAction={clearFilters}
          />
        </div>
      )}
    </div>
  );
};

export default Shop;
