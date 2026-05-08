// frontend/src/pages/dashboards/employee/Products.jsx
import { useState } from "react";
import { useFetch, useDebounce, api, Icon, Modal, Confirm, toast, UPLOAD_BASE } from "./EmployeeShared";

export default function ProductsPage({ branchId }) {
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const ds = useDebounce(search);
  const params = `branchId=${branchId}&page=${page}&limit=100${ds ? `&search=${ds}` : ""}`;
  const { data, loading, refetch } = useFetch(`/products?${params}`, [branchId, page, ds]);
  const { data: partsData }        = useFetch("/parts?limit=200");

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmId, setConfirmId]   = useState(null);

  const getImgUrl = (url) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    const base = UPLOAD_BASE.endsWith('/') ? UPLOAD_BASE.slice(0, -1) : UPLOAD_BASE;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${base}${path}`;
  };
  const [form, setForm]             = useState({ 
    name: "", 
    product_type: "part", // Default to part for employee bundles
    price: "", 
    image: "", 
    description: "", 
    parts: [],
    bikeDetail: { 
      motor_type: "", 
      motor_watt_min: "", 
      motor_watt_max: "", 
      battery_voltage: "", 
      battery_capacity_ah: "", 
      battery_type: "", 
      speed_min_kmh: "", 
      speed_max_kmh: "", 
      range_eco_min_km: "", 
      range_eco_max_km: "", 
      speed_modes: "", 
      charger: "", 
      charging_time_min_hrs: "", 
      charging_time_max_hrs: "", 
      net_weight_kg: "", 
      loading_capacity_kg: "", 
      security: "", 
      braking_system: "", 
      color_options: [], 
      frame_material: "", 
      wheel_size: "", 
      warranty: "" 
    },
    partDetail: { 
      serial_no: "", 
      item_code: "", 
      model: "", 
      description: "", 
      cp_price: "", 
      compatible_models: [], 
      compatible_bike_ids: [], 
      unit: "piece" 
    }
  });
  const [saving, setSaving]         = useState(false);

  const filtered = (data?.data || []).filter(p => !ds || p.name?.toLowerCase().includes(ds.toLowerCase()));

  const openAdd  = () => { 
    setForm({ 
      name: "", product_type: "part", price: "", image: "", description: "", parts: [],
      bikeDetail: { motor_type: "", motor_watt_min: "", motor_watt_max: "", battery_voltage: "", battery_capacity_ah: "", battery_type: "", speed_min_kmh: "", speed_max_kmh: "", range_eco_min_km: "", range_eco_max_km: "", speed_modes: "", charger: "", charging_time_min_hrs: "", charging_time_max_hrs: "", net_weight_kg: "", loading_capacity_kg: "", security: "", braking_system: "", color_options: [], frame_material: "", wheel_size: "", warranty: "" },
      partDetail: { serial_no: "", item_code: "", model: "", description: "", cp_price: "", compatible_models: [], compatible_bike_ids: [], unit: "piece" }
    }); 
    setEditTarget(null); setShowModal(true); 
  };
  const openEdit = p  => { 
    setForm({ 
      name: p.name, 
      product_type: p.product_type || "part",
      price: p.price, 
      image: p.image || p.images?.find(img => img.is_primary)?.url || "", 
      description: p.description || "", 
      parts: p.parts?.map(pp => ({ partId: pp.partId, quantity: pp.quantity })) || [],
      bikeDetail: p.bikeDetail || { motor_type: "", motor_watt_min: "", motor_watt_max: "", battery_voltage: "", battery_capacity_ah: "", battery_type: "", speed_min_kmh: "", speed_max_kmh: "", range_eco_min_km: "", range_eco_max_km: "", speed_modes: "", charger: "", charging_time_min_hrs: "", charging_time_max_hrs: "", net_weight_kg: "", loading_capacity_kg: "", security: "", braking_system: "", color_options: [], frame_material: "", wheel_size: "", warranty: "" },
      partDetail: p.partDetail || { serial_no: "", item_code: "", model: "", description: "", cp_price: "", compatible_models: [], compatible_bike_ids: [], unit: "piece" }
    }); 
    setEditTarget(p); setShowModal(true); 
  };

  const addPart    = () => setForm(f => ({ ...f, parts: [...f.parts, { partId: "", quantity: 1 }] }));
  const remPart    = i  => setForm(f => ({ ...f, parts: f.parts.filter((_, j) => j !== i) }));
  const updPart    = (i, k, v) => setForm(f => ({ ...f, parts: f.parts.map((p, j) => j === i ? { ...p, [k]: v } : p) }));

  const submit = async () => {
    if (!form.name?.trim() || !form.price) return toast("Name and price are required", "err");
    setSaving(true);
    try {
      const body = {
        name: form.name,
        product_type: form.product_type,
        price: parseFloat(form.price),
        image: form.image,
        description: form.description,
        branchId: Number(branchId),
        parts: form.parts.filter(p => p.partId).map(p => ({ partId: Number(p.partId), quantity: Number(p.quantity) || 1 })),
        bikeDetail: form.product_type === 'bike' ? form.bikeDetail : undefined,
        partDetail: form.product_type === 'part' ? form.partDetail : undefined
      };
      if (editTarget) { await api(`/products/${editTarget.id}`, { method: "PUT", body }); toast("Product updated"); }
      else            { await api("/products", { method: "POST", body }); toast("Product created"); }
      setShowModal(false); refetch();
    } catch (e) { toast(e.message, "err"); }
    setSaving(false);
  };

  const remove = async id => {
    try { await api(`/products/${id}`, { method: "DELETE" }); toast("Product deleted"); refetch(); }
    catch (e) { toast(e.message, "err"); }
    setConfirmId(null);
  };

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-l">
          <div className="ey">Product Catalog</div>
          <div className="ptitle">PRODUCTS</div>
          <div className="psub">Maintenance kits & bundles · {data?.meta?.total || 0} listed</div>
        </div>
        <div className="ph-r">
          <button className="btn btn-acc" onClick={openAdd}><Icon n="plus" /> New Product</button>
        </div>
      </div>
      <div className="fbar">
        <div className="sw"><Icon n="search" /><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products…" /></div>
      </div>
      {loading ? (
        <div className="prod-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="sk" style={{ height: 185, borderRadius: 20 }} />)}</div>
      ) : (
        <div className="prod-grid">
          {filtered.map(p => (
            <div key={p.id} className="prod-card">
              <div className="prod-stripe" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, paddingTop: 8 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: "rgba(255,77,0,.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--acc)", overflow: "hidden" }}>
                  {p.images?.find(img => img.is_primary)?.url ? (
                    <img 
                      src={getImgUrl(p.images.find(img => img.is_primary).url)} 
                      alt="" 
                      style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                    />
                  ) : <Icon n="tag" s={17} />}
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <button className="ico-btn" onClick={() => openEdit(p)}><Icon n="edit" s={13} /></button>
                  <button className="ico-btn del" onClick={() => setConfirmId(p.id)}><Icon n="trash" s={13} /></button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, color: "#fff", textTransform: "uppercase" }}>{p.name}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>
                  {p.brand?.name}
                  {p.brand?.name && p.category?.name ? " · " : ""}
                  {p.category?.name}
                </span>
                <span style={{ fontWeight: 600, color: p.stock_qty > 0 ? "var(--acc)" : "#ff4d4d" }}>
                  QTY: {p.stock_qty}
                </span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8 }}>
                <div style={{ fontSize: 11, color: "var(--acc)", fontWeight: 700, textTransform: "uppercase", flex: 1, paddingRight: 8 }}>
                  {p.partDetail?.model || p.bikeDetail?.motor_type || ""}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  {p.sale_price && <div style={{ fontSize: 11, color: "var(--muted)", textDecoration: "line-through", marginBottom: 2 }}>{p.price}</div>}
                  <div style={{ fontFamily: "var(--font-d)", fontSize: 20, color: "#fff", lineHeight: 1 }}>PKR {parseFloat(p.sale_price || p.price).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {(data?.meta?.totalPages || 1) > 1 && (
        <div className="pag" style={{ background: "var(--surf)", border: "1px solid var(--bdr)", borderRadius: "var(--r3)", marginTop: 14 }}>
          <div className="pag-info">Page {page} · {data?.meta?.total || 0} total</div>
          <div className="pag-ctrl">
            <button className="pb" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            <button className="pb" disabled={page >= (data?.meta?.totalPages || 1)} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}
      {showModal && (
        <Modal title={editTarget ? "EDIT PRODUCT" : "NEW PRODUCT"} onClose={() => setShowModal(false)} wide
          footer={<>
            <button className="btn btn-sec btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-acc btn-sm" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save Product"}</button>
          </>}
        >
          <div className="fr">
            <div className="fg" style={{ flex: 2 }}><label>Product Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Elite Road Bundle" /></div>
            <div className="fg">
              <label>Type</label>
              <select value={form.product_type} onChange={e => setForm(f => ({ ...f, product_type: e.target.value }))}>
                <option value="part">Spare Part / Bundle</option>
                <option value="bike">Electric Bike</option>
              </select>
            </div>
          </div>
          <div className="fr">
            <div className="fg">
              <label>Price (PKR) *</label>
              <div style={{ position: "relative" }}>
                <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
              </div>
            </div>
            <div className="fg">
              <label>Stock Qty</label>
              <input type="number" min="0" value={form.stock_qty} onChange={e => setForm(f => ({ ...f, stock_qty: e.target.value }))} placeholder="0" />
            </div>
          </div>
          <div className="fg"><label>Product Image URL</label><input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://example.com/image.jpg" /></div>
          <div className="fg"><label>Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed product description…" style={{ height: 80, background: "var(--surf)", border: "1px solid var(--bdr)", borderRadius: "var(--r1)", color: "#fff", width: "100%", padding: 10, outline: "none" }} /></div>

          {form.product_type === "bike" && (
            <div style={{ padding: 15, background: "rgba(255,255,255,0.02)", borderRadius: 12, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 15, color: "var(--acc)" }}>BIKE SPECIFICATIONS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                <div className="fg"><label>Motor Type</label><input placeholder="e.g. Multi Mode Motor" value={form.bikeDetail.motor_type} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, motor_type: e.target.value } }))} /></div>
                <div className="fg"><label>Motor Watt (Min/Max)</label>
                  <div style={{ display: "flex", gap: 5 }}>
                    <input type="number" placeholder="Min" value={form.bikeDetail.motor_watt_min} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, motor_watt_min: e.target.value } }))} />
                    <input type="number" placeholder="Max" value={form.bikeDetail.motor_watt_max} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, motor_watt_max: e.target.value } }))} />
                  </div>
                </div>
                <div className="fg"><label>Battery (V / Ah)</label>
                  <div style={{ display: "flex", gap: 5 }}>
                    <input type="number" step="0.1" placeholder="Volts" value={form.bikeDetail.battery_voltage} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, battery_voltage: e.target.value } }))} />
                    <input type="number" step="0.1" placeholder="Ah" value={form.bikeDetail.battery_capacity_ah} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, battery_capacity_ah: e.target.value } }))} />
                  </div>
                </div>
                <div className="fg"><label>Battery Type</label><input placeholder="e.g. Lithium LFP" value={form.bikeDetail.battery_type} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, battery_type: e.target.value } }))} /></div>
                <div className="fg"><label>Speed (Min/Max km/h)</label>
                  <div style={{ display: "flex", gap: 5 }}>
                    <input type="number" step="0.1" placeholder="Min" value={form.bikeDetail.speed_min_kmh} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, speed_min_kmh: e.target.value } }))} />
                    <input type="number" step="0.1" placeholder="Max" value={form.bikeDetail.speed_max_kmh} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, speed_max_kmh: e.target.value } }))} />
                  </div>
                </div>
                <div className="fg"><label>Range Eco (Min/Max km)</label>
                  <div style={{ display: "flex", gap: 5 }}>
                    <input type="number" placeholder="Min" value={form.bikeDetail.range_eco_min_km} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, range_eco_min_km: e.target.value } }))} />
                    <input type="number" placeholder="Max" value={form.bikeDetail.range_eco_max_km} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, range_eco_max_km: e.target.value } }))} />
                  </div>
                </div>
                <div className="fg"><label>Speed Modes</label><input type="number" value={form.bikeDetail.speed_modes} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, speed_modes: e.target.value } }))} /></div>
                <div className="fg"><label>Charger</label><input placeholder="e.g. 72V10A" value={form.bikeDetail.charger} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, charger: e.target.value } }))} /></div>
                <div className="fg"><label>Charging Time (Min/Max hrs)</label>
                  <div style={{ display: "flex", gap: 5 }}>
                    <input type="number" step="0.1" placeholder="Min" value={form.bikeDetail.charging_time_min_hrs} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, charging_time_min_hrs: e.target.value } }))} />
                    <input type="number" step="0.1" placeholder="Max" value={form.bikeDetail.charging_time_max_hrs} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, charging_time_max_hrs: e.target.value } }))} />
                  </div>
                </div>
                <div className="fg"><label>Weight / Capacity (kg)</label>
                  <div style={{ display: "flex", gap: 5 }}>
                    <input type="number" placeholder="Weight" value={form.bikeDetail.net_weight_kg} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, net_weight_kg: e.target.value } }))} />
                    <input type="number" placeholder="Load" value={form.bikeDetail.loading_capacity_kg} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, loading_capacity_kg: e.target.value } }))} />
                  </div>
                </div>
                <div className="fg"><label>Security</label><input placeholder="e.g. NFC Unlock" value={form.bikeDetail.security} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, security: e.target.value } }))} /></div>
                <div className="fg"><label>Braking System</label><input placeholder="e.g. F/R CBS" value={form.bikeDetail.braking_system} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, braking_system: e.target.value } }))} /></div>
                <div className="fg"><label>Frame Material</label><input value={form.bikeDetail.frame_material} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, frame_material: e.target.value } }))} /></div>
                <div className="fg"><label>Wheel Size</label><input value={form.bikeDetail.wheel_size} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, wheel_size: e.target.value } }))} /></div>
                <div className="fg"><label>Warranty</label><input value={form.bikeDetail.warranty} onChange={e => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, warranty: e.target.value } }))} /></div>
                <div className="fg" style={{ gridColumn: "1 / -1" }}>
                  <label>Color Options</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                    {(form.bikeDetail.color_options || []).map((c, i) => (
                      <div key={i} style={{ background: "var(--acc)", color: "#fff", padding: "4px 10px", borderRadius: 20, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                        {c}
                        <button onClick={() => setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, color_options: f.bikeDetail.color_options.filter((_, j) => j !== i) } }))} style={{ border: "none", background: "none", color: "#fff", cursor: "pointer", padding: 0, display: "flex" }}><Icon n="close" size={10} /></button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input id="new-color-emp" placeholder="e.g. Metallic Black" onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = e.target.value.trim();
                        if (val) {
                          setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, color_options: [...(f.bikeDetail.color_options || []), val] } }));
                          e.target.value = "";
                        }
                      }
                    }} />
                    <button className="btn btn-sec btn-sm" onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById("new-color-emp");
                      const val = el.value.trim();
                      if (val) {
                        setForm(f => ({ ...f, bikeDetail: { ...f.bikeDetail, color_options: [...(f.bikeDetail.color_options || []), val] } }));
                        el.value = "";
                      }
                    }}>Add</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {form.product_type === "part" && (
            <div style={{ padding: 15, background: "rgba(255,255,255,0.02)", borderRadius: 12, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 15, color: "var(--acc)" }}>PART SPECIFICATIONS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                <div className="fg"><label>Serial No</label><input type="number" value={form.partDetail.serial_no} onChange={e => setForm(f => ({ ...f, partDetail: { ...f.partDetail, serial_no: e.target.value } }))} /></div>
                <div className="fg"><label>Item Code</label><input placeholder="e.g. SK-0104-FR" value={form.partDetail.item_code} onChange={e => setForm(f => ({ ...f, partDetail: { ...f.partDetail, item_code: e.target.value } }))} /></div>
                <div className="fg"><label>Model</label><input placeholder="e.g. SPARK RD" value={form.partDetail.model} onChange={e => setForm(f => ({ ...f, partDetail: { ...f.partDetail, model: e.target.value } }))} /></div>
                <div className="fg"><label>Cost Price (CP)</label><input type="number" step="0.01" value={form.partDetail.cp_price} onChange={e => setForm(f => ({ ...f, partDetail: { ...f.partDetail, cp_price: e.target.value } }))} /></div>
                <div className="fg"><label>Unit</label><input placeholder="piece, set, pair" value={form.partDetail.unit} onChange={e => setForm(f => ({ ...f, partDetail: { ...f.partDetail, unit: e.target.value } }))} /></div>
                <div className="fg"><label>Technical Detail</label><textarea value={form.partDetail.description} onChange={e => setForm(f => ({ ...f, partDetail: { ...f.partDetail, description: e.target.value } }))} style={{ height: 40 }} /></div>
                
                <div className="fg" style={{ gridColumn: "1 / -1" }}>
                  <label>Compatible Models</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                    {(form.partDetail.compatible_models || []).map((m, i) => (
                      <div key={i} style={{ background: "rgba(0,0,0,0.03)", border: "1px solid var(--bdr)", padding: "4px 10px", borderRadius: 20, fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
                        {m}
                        <button onClick={() => setForm(f => ({ ...f, partDetail: { ...f.partDetail, compatible_models: f.partDetail.compatible_models.filter((_, j) => j !== i) } }))} style={{ border: "none", background: "none", color: "var(--muted)", cursor: "pointer", padding: 0, display: "flex" }}><Icon n="close" size={10} /></button>
                      </div>
                    ))}
                  </div>
                  <input placeholder="Type model and press Enter" onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = e.target.value.trim();
                      if (val) {
                        setForm(f => ({ ...f, partDetail: { ...f.partDetail, compatible_models: [...(f.partDetail.compatible_models || []), val] } }));
                        e.target.value = "";
                      }
                    }
                  }} />
                </div>
              </div>
            </div>
          )}

          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, marginTop: 20 }}>COMPONENTS / PARTS</div>
          {form.parts.map((p, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <select value={p.partId} onChange={e => updPart(i, "partId", e.target.value)}>
                <option value="">— Select Part —</option>
                {(partsData?.data || []).map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
              </select>
              <input type="number" min="1" value={p.quantity} onChange={e => updPart(i, "quantity", e.target.value)} placeholder="Qty" />
              <button className="ico-btn del" onClick={() => remPart(i)}><Icon n="trash" s={13} /></button>
            </div>
          ))}
          <button className="btn btn-sec btn-sm" onClick={addPart}><Icon n="plus" /> Add Part</button>
        </Modal>
      )}
      {confirmId && <Confirm msg="Delete this product?" onYes={() => remove(confirmId)} onNo={() => setConfirmId(null)} />}
    </div>
  );
}
