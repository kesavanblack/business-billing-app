import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard",  id: "dashboard" },
  { icon: "📦", label: "Products",   id: "products"  },
  { icon: "🧾", label: "Invoices",   id: "invoices"  },
  { icon: "👥", label: "Customers",  id: "customers" },
  { icon: "⚙️", label: "Settings",   id: "settings"  },
];

function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">💼</div>
        <span className="sidebar-logo-name">BillFlow</span>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <span className="nav-section-label">Menu</span>
        {NAV_ITEMS.map(({ icon, label, id }) => (
          <button
            key={id}
            id={`nav-${id}`}
            className={`nav-item ${activeTab === id ? "active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            <span className="nav-item-icon">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">BF</div>
          <div className="user-info">
            <div className="user-name">BillFlow Admin</div>
            <div className="user-email">Workspace Active</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function StatsSection({ products }) {
  const totalStock = products.reduce((s, p) => s + (p.stock ?? 0), 0);
  const totalValue = products.reduce((s, p) => s + (p.price ?? 0) * (p.stock ?? 0), 0);
  const lowStock   = products.filter((p) => (p.stock ?? 0) < 10).length;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-card-icon">📦</div>
        <div className="stat-card-value">{products.length}</div>
        <div className="stat-card-label">Total Products</div>
        <div className="stat-card-change">↑ Active catalogue</div>
      </div>
      <div className="stat-card">
        <div className="stat-card-icon">🔢</div>
        <div className="stat-card-value">{totalStock.toLocaleString()}</div>
        <div className="stat-card-label">Units in Stock</div>
        <div className="stat-card-change">Across all products</div>
      </div>
      <div className="stat-card">
        <div className="stat-card-icon">💰</div>
        <div className="stat-card-value">₹{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
        <div className="stat-card-label">Inventory Value</div>
        <div className="stat-card-change">At selling price</div>
      </div>
      <div className="stat-card">
        <div className="stat-card-icon">⚠️</div>
        <div className="stat-card-value" style={{ color: lowStock > 0 ? "var(--error)" : "var(--success)" }}>
          {lowStock}
        </div>
        <div className="stat-card-label">Low Stock Items</div>
        <div className="stat-card-change" style={{ color: lowStock > 0 ? "var(--error)" : "var(--success)" }}>
          {lowStock > 0 ? "Needs restock" : "All good ✓"}
        </div>
      </div>
    </div>
  );
}

function ProductsPanel() {
  const [products, setProducts] = useState([]);
  const [name, setName]         = useState("");
  const [price, setPrice]       = useState("");
  const [stock, setStock]       = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving]     = useState(false);

  async function loadProducts() {
    try {
      const res = await axios.get(`${API}/products`);
      setProducts(res.data);
      setError("");
    } catch {
      setError("Could not load products. Is the backend running?");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  async function addProduct(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    setSaving(true);
    try {
      await axios.post(`${API}/products`, {
        name,
        price: Number(price),
        stock: Number(stock),
      });
      setName(""); setPrice(""); setStock("");
      setSuccess(`"${name}" added successfully!`);
      setTimeout(() => setSuccess(""), 3000);
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.error ?? "Failed to add product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Add Product Form */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <span className="panel-title">➕ Add New Product</span>
        </div>
        <div className="panel-body">
          {error   && <div className="alert alert-error"   role="alert"><span>⚠️</span> {error}</div>}
          {success && <div className="alert alert-success" role="status"><span>✅</span> {success}</div>}
          <form onSubmit={addProduct}>
            <div className="product-form">
              <div>
                <div className="field-label">Product Name</div>
                <input id="product-name" className="field-input" placeholder="e.g. Widget Pro" value={name}  onChange={(e) => setName(e.target.value)}  required />
              </div>
              <div>
                <div className="field-label">Price (₹)</div>
                <input id="product-price" className="field-input" type="number" placeholder="0.00" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div>
                <div className="field-label">Stock (units)</div>
                <input id="product-stock" className="field-input" type="number" placeholder="0"    min="0" step="1"    value={stock} onChange={(e) => setStock(e.target.value)} required />
              </div>
              <div style={{ alignSelf: "flex-end" }}>
                <button id="add-product-btn" className="btn-add" disabled={saving}>
                  {saving ? <><span className="spinner" /> Saving…</> : <>＋ Add Product</>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Products Table */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">📦 Product Catalogue</span>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {products.length} {products.length === 1 ? "item" : "items"}
          </span>
        </div>
        {fetching ? (
          <div style={{ padding: 48, display: "flex", justifyContent: "center" }}>
            <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-text">No products yet. Add your first product above.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="products-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{i + 1}</td>
                    <td className="product-name-cell">{p.name}</td>
                    <td>₹{Number(p.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td>{p.stock}</td>
                    <td>
                      <span className={`badge ${(p.stock ?? 0) > 10 ? "badge-green" : "badge-red"}`}>
                        {(p.stock ?? 0) > 10 ? "In Stock" : "Low Stock"}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats strip */}
      {!fetching && products.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <StatsSection products={products} />
        </div>
      )}
    </>
  );
}

function PlaceholderTab({ icon, label }) {
  return (
    <div className="empty-state" style={{ paddingTop: 100 }}>
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-text">
        <strong style={{ color: "var(--text-primary)" }}>{label}</strong>
        <br />
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Coming soon — this feature is under development.</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("products");

  const tabContent = {
    dashboard: <PlaceholderTab icon="📊" label="Dashboard Overview" />,
    products:  <ProductsPanel />,
    invoices:  <PlaceholderTab icon="🧾" label="Invoices" />,
    customers: <PlaceholderTab icon="👥" label="Customers" />,
    settings:  <PlaceholderTab icon="⚙️" label="Settings" />,
  };

  const tabTitles = {
    dashboard: { title: "Dashboard",          sub: "Overview of your business" },
    products:  { title: "Product Management", sub: "Add and manage your product catalogue" },
    invoices:  { title: "Invoices",           sub: "Create and manage billing invoices" },
    customers: { title: "Customers",          sub: "Manage your client database" },
    settings:  { title: "Settings",           sub: "Configure your account and preferences" },
  };

  const { title, sub } = tabTitles[activeTab];

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="main-content">
        <header className="page-header">
          <h1 className="page-title">{title}</h1>
          <p className="page-sub">{sub}</p>
        </header>
        <main className="page-body" id="main-content">
          {tabContent[activeTab]}
        </main>
      </div>
    </div>
  );
}
