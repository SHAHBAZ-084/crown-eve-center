// frontend/src/pages/dashboards\customer/Cart.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQty, total } = useCart();
  const [selectedItems, setSelectedItems] = useState(items.map(i => i.id));

  const isAllSelected = selectedItems.length === items.length && items.length > 0;

  const toggleSelectAll = () => {
    if (isAllSelected) setSelectedItems([]);
    else setSelectedItems(items.map(i => i.id));
  };

  const toggleItem = (id) => {
    if (selectedItems.includes(id)) setSelectedItems(selectedItems.filter(i => i !== id));
    else setSelectedItems([...selectedItems, id]);
  };

  const getImgUrl = (url) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;
  };

  const selectedTotal = items
    .filter(i => selectedItems.includes(i.id))
    .reduce((acc, i) => acc + (i.sale_price || i.price) * i.qty, 0);

  return (
    <div className="cart-page-new">
      <div className="cart-layout-new">
        
        {/* LEFT COLUMN: ITEMS */}
        <div className="cart-main-col">
          {items.length > 0 ? (
            <>
              {/* SELECT ALL HEADER */}
              <div className="cart-header-bar">
                <div className="chk-container">
                  <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} />
                  <span>SELECT ALL ({items.length} ITEM(S))</span>
                </div>
                <button className="delete-all-btn" onClick={() => items.forEach(i => removeItem(i.id))}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  DELETE
                </button>
              </div>

              {/* SHOP HEADER */}
              <div className="shop-header-bar">
                <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} />
                <div className="shop-name">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--orange)" stroke="none"><path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 4h4v3h-4V4z"/></svg>
                  Crown Eve Bikes <span>&gt;</span>
                </div>
              </div>

              {/* ITEM LIST */}
              <div className="cart-items-list">
                {items.map(item => {
                  const mainImg = item.images?.find(img => img.is_primary)?.url || item.images?.[0]?.url;
                  return (
                    <div key={item.id} className="cart-item-row">
                      <div className="item-chk">
                        <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => toggleItem(item.id)} />
                      </div>
                      <div className="item-img-box">
                        {mainImg ? (
                          <img src={getImgUrl(mainImg)} alt={item.name} />
                        ) : (
                          <div className="item-placeholder">📦</div>
                        )}
                      </div>
                      <div className="item-info">
                        <div className="item-title-group">
                          <h4 className="item-name">{item.name}</h4>
                          <p className="item-meta">{item.category?.name || (item.product_type === 'bike' ? 'Bike' : 'Part')} Official</p>
                        </div>
                        <div className="item-price-actions">
                          <div className="item-pricing">
                            <div className="current-price">Rs. {Number(item.sale_price || item.price).toLocaleString()}</div>
                            {item.sale_price && item.price !== item.sale_price && (
                              <div className="old-price">Rs. {Number(item.price).toLocaleString()}</div>
                            )}
                          </div>
                          <div className="item-tools">
                            <button className="tool-btn" onClick={() => removeItem(item.id)}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="item-qty-col">
                        <div className="qty-picker-new">
                          <button onClick={() => updateQty(item.id, item.qty - 1)} disabled={item.qty <= 1}>-</button>
                          <input type="text" value={item.qty} readOnly />
                          <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="empty-cart-state">
              <div className="empty-icon">🛒</div>
              <h3>Your shopping cart is empty</h3>
              <p>Items added to your cart will appear here.</p>
              <button className="btn-primary" onClick={() => navigate("/shop")}>CONTINUE SHOPPING</button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SUMMARY */}
        <div className="cart-summary-col">
          <div className="summary-card-new">
            <h3 className="summary-title">Order Summary</h3>
            
            <div className="summary-row">
              <span className="summary-label">Subtotal ({selectedItems.length} items)</span>
              <span className="summary-value">Rs. {selectedTotal.toLocaleString()}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-label">Shipping Fee</span>
              <span className="summary-value">Rs. 0</span>
            </div>

            <div className="total-box">
              <span className="total-label">Total</span>
              <span className="total-value">Rs. {selectedTotal.toLocaleString()}</span>
            </div>

            <button 
              className="checkout-btn-large" 
              disabled={selectedItems.length === 0}
              onClick={() => navigate("/my/checkout", { state: { selectedItems } })}
            >
              PROCEED TO CHECKOUT({selectedItems.length})
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
