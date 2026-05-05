// frontend/src/pages/dashboards/branch/Products.jsx
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useFetch, apiFetch, toast, Icon, Modal, Confirm } from "../../../components/branch/BranchShared";

const Products = () => {
  const { user } = useOutletContext();
  const branchId = user?.branchId;

  const params = `branchId=${branchId}&limit=50&page=1`;
  const { data, loading, refetch } = useFetch(`/products?${params}`, [branchId]);
  const { data: catsData, refetch: refetchCats } = useFetch("/categories");
  const { data: brandsData, refetch: refetchBrands } = useFetch("/brands");

  const [activeTab, setActiveTab] = useState("products");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmId, setConfirmId]   = useState(null);
  const [saving, setSaving]         = useState(false);

  const initialForm = {
    name: "", product_type: "bike", description: "", price: "", sale_price: "", stock_qty: 0,
    categoryId: "", brandId: "", is_active: true, images: [{ url: "", is_primary: true, sort_order: 0 }],
    bikeDetail: { motor_type: "", motor_watt: "", battery_capacity_wh: "", range_km: "", top_speed_kmh: "", frame_material: "", brake_type: "", wheel_size: "", payload_kg: "", color: "", warranty: "" },
    partDetail: { sku: "", part_number: "", compatible_models: "", part_category: "", unit: "piece" }
  };
  const [form, setForm] = useState(initialForm);

  const [catForm, setCatForm] = useState({ name: "", parent_id: "", description: "" });
  const [brandForm, setBrandForm] = useState({ name: "", country: "", logo_url: "" });

  const openAdd  = () => { setForm(initialForm); setEditTarget(null); setShowModal(true); };
  const openEdit = p  => { 
    setForm({
      name: p.name, product_type: p.product_type, description: p.description || "", 
      price: p.price, sale_price: p.sale_price || "", stock_qty: p.stock_qty,
      categoryId: p.categoryId || "", brandId: p.brandId || "", is_active: p.is_active,
      images: p.images?.length ? p.images : [{ url: "", is_primary: true, sort_order: 0 }],
      bikeDetail: p.bikeDetail || initialForm.bikeDetail,
      partDetail: p.partDetail || initialForm.partDetail
    });
    setEditTarget(p);
    setShowModal(true);
  };

  const submit = async () => {
    if (!form.name || !form.price) return toast("Name and price required", "e");
    setSaving(true);
    try {
      const body = { ...form };
      if (editTarget) { await apiFetch(`/products/${editTarget.id}`, { method: "PUT", body }); toast("Product updated"); }
      else { await apiFetch("/products", { method: "POST", body }); toast("Product created"); }
      setShowModal(false); refetch();
    } catch (e) { toast(e.message, "e"); }
    setSaving(false);
  };

  const saveCat = async () => {
    try { await apiFetch("/categories", { method: "POST", body: catForm }); toast("Category saved"); setCatForm({ name: "", parent_id: "", description: "" }); refetchCats(); }
    catch (e) { toast(e.message, "e"); }
  };

  const saveBrand = async () => {
    try { await apiFetch("/brands", { method: "POST", body: brandForm }); toast("Brand saved"); setBrandForm({ name: "", country: "", logo_url: "" }); refetchBrands(); }
    catch (e) { toast(e.message, "e"); }
  };

  const remove = async id => {
    try { await apiFetch(`/products/${id}`, { method: "DELETE" }); toast("Product deleted"); refetch(); }
    catch (e) { toast(e.message, "e"); }
    setConfirmId(null);
  };

  return (
    <div className="branch-page">
      <div className="ph">
        <div className="ph-l">
          <div className="eyebrow">Catalog</div>
          <div className="ptitle">MASTER INVENTORY</div>
          <div className="psub">Full control over bikes, spare parts, and brand relationships.</div>
        </div>
        <div className="ph-r" style={{ display: "flex", gap: 8 }}>
          <button className={`btn ${activeTab === "products" ? "btn-p" : "btn-s"}`} onClick={() => setActiveTab("products")}>
            <Icon n="inventory" /> Manage Products
          </button>
          <button className={`btn ${activeTab === "categories" ? "btn-p" : "btn-s"}`} onClick={() => setActiveTab("categories")}>
            <Icon n="settings" /> Manage Categories
          </button>
          <button className={`btn ${activeTab === "brands" ? "btn-p" : "btn-s"}`} onClick={() => setActiveTab("brands")}>
            <Icon n="tag" /> Manage Brands
          </button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 30 }}>
        <div className={`tab ${activeTab === "products" ? "active" : ""}`} onClick={() => setActiveTab("products")}>
          <Icon n="products" size={14} /> Products List ({data?.meta?.total || 0})
        </div>
        <div className={`tab ${activeTab === "categories" ? "active" : ""}`} onClick={() => setActiveTab("categories")}>
          <Icon n="settings" size={14} /> Categories List ({catsData?.length || 0})
        </div>
        <div className={`tab ${activeTab === "brands" ? "active" : ""}`} onClick={() => setActiveTab("brands")}>
          <Icon n="tag" size={14} /> Brands List ({brandsData?.length || 0})
        </div>
      </div>

      {loading ? (
        <div className="g4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="sk" style={{ height: 200, borderRadius: 20 }} />)}
        </div>
      ) : (
        <div className="tab-content">
          {activeTab === "products" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>Product Catalog</div>
                <button className="btn btn-p" onClick={openAdd}><Icon n="plus" /> Add New Product</button>
              </div>
              <div className="g4">
                {(data?.data || []).map(p => (
                  <div key={p.id} className="card ci" style={{ transition: "all .2s" }}>
                    <div style={{ position: "relative", height: 160, borderRadius: 12, background: "var(--surf)", marginBottom: 14, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {p.images?.find(img => img.is_primary)?.url ? (
                        <img src={p.images.find(img => img.is_primary).url.startsWith('http') ? p.images.find(img => img.is_primary).url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${p.images.find(img => img.is_primary).url}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : <Icon n={p.product_type === "bike" ? "bike" : "settings"} size={40} opacity={0.2} />}
                      <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}>
                        <button className="btn-ico" onClick={() => openEdit(p)}><Icon n="edit" size={12} /></button>
                        <button className="btn-ico dng" onClick={() => setConfirmId(p.id)}><Icon n="trash" size={12} /></button>
                      </div>
                      <div style={{ position: "absolute", bottom: 8, left: 8 }}>
                        <span className={`badge badge-${p.product_type === "bike" ? "blue" : "orange"}`} style={{ fontSize: 10 }}>{p.product_type.toUpperCase()}</span>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>{p.brand?.name || "No Brand"} · {p.category?.name || "Uncategorized"}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <div style={{ fontFamily: "var(--font-d)", fontSize: 20, color: "var(--acc)" }}>PKR {parseFloat(p.sale_price || p.price).toLocaleString()}</div>
                      {p.sale_price && <div style={{ fontSize: 12, color: "var(--muted)", textDecoration: "line-through" }}>{p.price}</div>}
                    </div>
                  </div>
                ))}
                {(data?.data || []).length === 0 && <div className="empty" style={{ gridColumn: "1/-1" }}><Icon n="products" size={36} /><div className="empty-t">No products yet</div></div>}
              </div>
            </>
          )}

          {activeTab === "categories" && (
            <div className="card" style={{ overflow: "hidden" }}>
              <div className="ci" style={{ background: "var(--surf2)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>Categories Architecture</div>
              </div>
              <div className="ci" style={{ display: "flex", gap: 10, flexWrap: "wrap", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4, display: "block" }}>CATEGORY NAME</label>
                  <input placeholder="e.g. Electric Spares" value={catForm.name} onChange={e => setCatForm(c => ({ ...c, name: e.target.value }))} />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4, display: "block" }}>PARENT CATEGORY</label>
                  <select value={catForm.parent_id} onChange={e => setCatForm(c => ({ ...c, parent_id: e.target.value }))}>
                    <option value="">— Top Level —</option>
                    {catsData?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button className="btn btn-p" onClick={saveCat} style={{ height: 40 }}><Icon n="plus" /> Add Category</button>
                </div>
              </div>
              <div className="tw">
                <table>
                  <thead>
                    <tr>
                      <th>Category Name</th>
                      <th>Parent Architecture</th>
                      <th>Description</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catsData?.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td>{c.parent?.name ? <span className="badge badge-blue">{c.parent.name}</span> : <span style={{ color: "var(--muted)" }}>Root Node</span>}</td>
                        <td style={{ color: "var(--muted)", fontSize: 12 }}>{c.description || "System default category"}</td>
                        <td className="tda">
                          <button className="btn-ico dng" onClick={async () => { await apiFetch(`/categories/${c.id}`, { method: "DELETE" }); refetchCats(); }}><Icon n="trash" size={12} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "brands" && (
            <div className="card" style={{ overflow: "hidden" }}>
              <div className="ci" style={{ background: "var(--surf2)", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>Brand Partners</div>
              </div>
              <div className="ci" style={{ display: "flex", gap: 10, flexWrap: "wrap", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4, display: "block" }}>BRAND NAME</label>
                  <input placeholder="e.g. Crown EV" value={brandForm.name} onChange={e => setBrandForm(b => ({ ...b, name: e.target.value }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4, display: "block" }}>ORIGIN COUNTRY</label>
                  <input placeholder="e.g. Pakistan" value={brandForm.country} onChange={e => setBrandForm(b => ({ ...b, country: e.target.value }))} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button className="btn btn-p" onClick={saveBrand} style={{ height: 40 }}><Icon n="plus" /> Add Brand</button>
                </div>
              </div>
              <div className="tw">
                <table>
                  <thead>
                    <tr>
                      <th>Brand Identity</th>
                      <th>Origin</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brandsData?.map(b => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 700 }}>{b.name}</td>
                        <td>{b.country || "International"}</td>
                        <td className="tda">
                          <button className="btn-ico dng" onClick={async () => { await apiFetch(`/brands/${b.id}`, { method: "DELETE" }); refetchBrands(); }}><Icon n="trash" size={12} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Product Modal */}
      {showModal && (
        <Modal title={editTarget ? "EDIT PRODUCT" : "NEW PRODUCT"} onClose={() => setShowModal(false)} wide
          footer={<>
            <button className="btn btn-s btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-p btn-sm" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save Product"}</button>
          </>}
        >
          <div className="fr">
            <div className="fg" style={{ flex: 2 }}><label>Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="fg"><label>Type</label>
              <select value={form.product_type} onChange={e => setForm(f => ({ ...f, product_type: e.target.value }))}>
                <option value="bike">Electric Bike</option>
                <option value="part">Spare Part</option>
              </select>
            </div>
          </div>

          <div className="fr">
            <div className="fg"><label>Price (PKR) *</label><input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
            <div className="fg"><label>Sale Price</label><input type="number" value={form.sale_price} onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))} /></div>
            <div className="fg"><label>Stock Qty</label><input type="number" value={form.stock_qty} onChange={e => setForm(f => ({ ...f, stock_qty: e.target.value }))} /></div>
          </div>

          <div className="fr">
            <div className="fg"><label>Category</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                <option value="">— Select Category —</option>
                {catsData?.map(c => <option key={c.id} value={c.id}>{c.parent?.name ? `${c.parent.name} > ` : ""}{c.name}</option>)}
              </select>
            </div>
            <div className="fg"><label>Brand</label>
              <select value={form.brandId} onChange={e => setForm(f => ({ ...f, brandId: e.target.value }))}>
                <option value="">— Select Brand —</option>
                {brandsData?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="fg"><label>Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ height: 60 }} /></div>

          {/* Technical Specs Header */}
          <div style={{ marginTop: 20, marginBottom: 15, padding: "8px 12px", background: "rgba(14,165,233,.05)", borderRadius: 8, borderLeft: "4px solid var(--acc)", fontWeight: 700, fontSize: 13 }}>TECHNICAL SPECIFICATIONS</div>

          {form.product_type === "bike" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
              <div className="fg"><label>Motor Type</label><input placeholder="e.g. Hub Motor" value={form.bikeDetail.motor_type} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, motor_type: e.target.value } }))} /></div>
              <div className="fg"><label>Motor Watt</label><input type="number" placeholder="e.g. 1000" value={form.bikeDetail.motor_watt} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, motor_watt: e.target.value } }))} /></div>
              <div className="fg"><label>Battery (Wh)</label><input type="number" placeholder="e.g. 1200" value={form.bikeDetail.battery_capacity_wh} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, battery_capacity_wh: e.target.value } }))} /></div>
              <div className="fg"><label>Range (km)</label><input type="number" placeholder="e.g. 80" value={form.bikeDetail.range_km} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, range_km: e.target.value } }))} /></div>
              <div className="fg"><label>Top Speed (km/h)</label><input type="number" value={form.bikeDetail.top_speed_kmh} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, top_speed_kmh: e.target.value } }))} /></div>
              <div className="fg"><label>Color</label><input value={form.bikeDetail.color} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, color: e.target.value } }))} /></div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
              <div className="fg"><label>SKU / Serial</label><input value={form.partDetail.sku} onChange={e => setForm(f => ({ ...f, partDetail: { ...f.partDetail, sku: e.target.value } }))} /></div>
              <div className="fg"><label>Compatible Models</label><input placeholder="e.g. Crown EV 100, 125" value={form.partDetail.compatible_models} onChange={e => setForm(f => ({ ...f, partDetail: { ...f.partDetail, compatible_models: e.target.value } }))} /></div>
              <div className="fg"><label>Unit</label><input placeholder="piece, set, pair" value={form.partDetail.unit} onChange={e => setForm(f => ({ ...f, partDetail: { ...f.partDetail, unit: e.target.value } }))} /></div>
            </div>
          )}

          <div style={{ marginTop: 20, marginBottom: 10, fontWeight: 700, fontSize: 13 }}>PRODUCT IMAGES</div>
          {form.images.map((img, i) => (
            <div key={i} className="card ci" style={{ marginBottom: 12, background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: 15, padding: 12 }}>
              <div style={{ width: 60, height: 60, borderRadius: 8, background: "var(--surf)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                {img.url ? <img src={img.url.startsWith('http') ? img.url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${img.url}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon n="image" opacity={0.2} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button className="btn btn-s btn-sm" style={{ position: "relative", overflow: "hidden" }}>
                    <Icon n="upload" size={12} /> {img.url ? "Change Image" : "Upload Image"}
                    <input 
                      type="file" 
                      accept="image/*"
                      style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append('image', file);
                        try {
                          const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/upload`, {
                            method: "POST",
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                            body: formData
                          });
                          const data = await res.json();
                          if (data.url) {
                            setForm(f => ({ ...f, images: f.images.map((im, j) => j === i ? { ...im, url: data.url } : im) }));
                            toast("Image uploaded successfully");
                          }
                        } catch (err) { toast("Upload failed", "e"); }
                      }}
                    />
                  </button>
                  {img.url && <div style={{ fontSize: 10, color: "var(--green)", fontWeight: 700 }}>UPLOADED</div>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <label style={{ fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 700 }}>
                  <input type="radio" checked={img.is_primary} onChange={() => setForm(f => ({ ...f, images: f.images.map((im, j) => ({ ...im, is_primary: j === i })) }))} /> MAIN
                </label>
                <button className="btn-ico dng" onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}><Icon n="trash" size={13} /></button>
              </div>
            </div>
          ))}
          <button className="btn btn-s btn-sm w-full" onClick={() => setForm(f => ({ ...f, images: [...f.images, { url: "", is_primary: false, sort_order: f.images.length }] }))}><Icon n="plus" /> Add More Image Slots</button>
        </Modal>
      )}


      {confirmId && <Confirm msg="Delete this product?" onYes={() => remove(confirmId)} onNo={() => setConfirmId(null)} />}

    </div>
  );
};

export default Products;
