import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

// Dashboard Component
function Dashboard({ customers, products, challans, onRefresh }) {
  const lowStock = products.filter(
    (product) =>
      Number(product.stock_quantity) <= Number(product.reorder_level)
  );

  return (
    <>
      <header className="header">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome to your Mini ERP & CRM system</p>
        </div>
        <button onClick={onRefresh}>Refresh</button>
      </header>

      <section className="cards">
        <div className="card">
          <span>👥</span>
          <div>
            <p>Total Customers</p>
            <h3>{customers.length}</h3>
          </div>
        </div>

        <div className="card">
          <span>📦</span>
          <div>
            <p>Total Products</p>
            <h3>{products.length}</h3>
          </div>
        </div>

        <div className="card">
          <span>🚚</span>
          <div>
            <p>Total Challans</p>
            <h3>{challans.length}</h3>
          </div>
        </div>

        <div className="card warning">
          <span>⚠️</span>
          <div>
            <p>Low Stock</p>
            <h3>{lowStock.length}</h3>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Products</h3>
            <span>{products.length} products</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Price</th>
              </tr>
            </thead>

            <tbody>
              {products.slice(0, 8).map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>
                    <span
                      className={
                        Number(product.stock_quantity) <=
                        Number(product.reorder_level)
                          ? "low"
                          : "stock"
                      }
                    >
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td>₹{product.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Recent Challans</h3>
            <span>{challans.length} total</span>
          </div>

          {challans.slice(0, 6).map((challan) => (
            <div className="challan" key={challan.id}>
              <div>
                <strong>{challan.challan_number}</strong>
                <p>Customer: {challan.customer_name}</p>
              </div>

              <span className="status">
                {challan.status}
              </span>
            </div>
          ))}

          {challans.length === 0 && (
            <p className="empty">No challans available.</p>
          )}
        </div>
      </section>

      <section className="panel customers">
        <div className="panel-header">
          <h3>Customers</h3>
          <span>{customers.length} customers</span>
        </div>

        <div className="customer-grid">
          {customers.slice(0, 6).map((customer) => (
            <div className="customer" key={customer.id}>
              <div className="avatar">
                {customer.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{customer.name}</strong>
                <p>{customer.email || "No email"}</p>
                <small>{customer.city || "No city"}</small>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// Customers Component
function Customers({ onRefresh }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gst_number: "",
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API}/customers`);
      const data = await res.json();
      setCustomers(data.data || []);
    } catch (err) {
      setError("Failed to load customers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API}/customers/${editingId}`
        : `${API}/customers`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save customer");

      loadCustomers();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        gst_number: "",
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this customer?")) return;
    try {
      const res = await fetch(`${API}/customers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      loadCustomers();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(customer) {
    setEditingId(customer.id);
    setFormData(customer);
    setShowForm(true);
  }

  if (loading) return <div className="loading">Loading customers...</div>;

  return (
    <>
      <header className="header">
        <div>
          <h2>Customers</h2>
          <p>Manage your customers</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "", gst_number: "" }); }}>
          {showForm ? "Cancel" : "Add Customer"}
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="panel form-panel">
          <h3>{editingId ? "Edit Customer" : "Add New Customer"}</h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <input
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-row">
              <input
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <input
                placeholder="GST Number"
                value={formData.gst_number}
                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
              />
            </div>
            <div className="form-row">
              <input
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <input
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="form-row">
              <input
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
              <input
                placeholder="Pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
            </div>
            <button type="submit">{editingId ? "Update" : "Create"} Customer</button>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h3>All Customers</h3>
          <span>{customers.length} customers</span>
        </div>

        {customers.length === 0 ? (
          <p className="empty">No customers available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>GST</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.email || "-"}</td>
                  <td>{customer.phone || "-"}</td>
                  <td>{customer.city || "-"}</td>
                  <td>{customer.gst_number || "-"}</td>
                  <td className="actions">
                    <button
                      className="btn-small btn-edit"
                      onClick={() => handleEdit(customer)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-small btn-delete"
                      onClick={() => handleDelete(customer.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// Products Component
function Products({ onRefresh }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    stock_quantity: "",
    reorder_level: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API}/products/${editingId}`
        : `${API}/products`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock_quantity: Number(formData.stock_quantity),
          reorder_level: Number(formData.reorder_level),
        }),
      });

      if (!res.ok) throw new Error("Failed to save product");

      loadProducts();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        sku: "",
        price: "",
        stock_quantity: "",
        reorder_level: "",
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`${API}/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(product) {
    setEditingId(product.id);
    setFormData(product);
    setShowForm(true);
  }

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <>
      <header className="header">
        <div>
          <h2>Products</h2>
          <p>Manage your product catalog</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: "", sku: "", price: "", stock_quantity: "", reorder_level: "" }); }}>
          {showForm ? "Cancel" : "Add Product"}
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="panel form-panel">
          <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <input
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                placeholder="SKU"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <input
                placeholder="Price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <input
                placeholder="Stock Quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <input
                placeholder="Reorder Level"
                type="number"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                required
              />
            </div>
            <button type="submit">{editingId ? "Update" : "Create"} Product</button>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h3>All Products</h3>
          <span>{products.length} products</span>
        </div>

        {products.length === 0 ? (
          <p className="empty">No products available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Reorder Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>₹{product.price}</td>
                  <td>
                    <span
                      className={
                        Number(product.stock_quantity) <=
                        Number(product.reorder_level)
                          ? "low"
                          : "stock"
                      }
                    >
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td>{product.reorder_level}</td>
                  <td className="actions">
                    <button
                      className="btn-small btn-edit"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-small btn-delete"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// Stock Component
function Stock({ onRefresh }) {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    product_id: "",
    type: "IN",
    quantity: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [movRes, prodRes] = await Promise.all([
        fetch(`${API}/stock-movements`),
        fetch(`${API}/products`),
      ]);

      const movData = await movRes.json();
      const prodData = await prodRes.json();

      setMovements(movData.data || []);
      setProducts(prodData.data || []);
    } catch (err) {
      setError("Failed to load stock data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/stock-movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          product_id: Number(formData.product_id),
          quantity: Number(formData.quantity),
        }),
      });

      if (!res.ok) throw new Error("Failed to create stock movement");

      loadData();
      setShowForm(false);
      setFormData({ product_id: "", type: "IN", quantity: "", notes: "" });
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="loading">Loading stock data...</div>;

  return (
    <>
      <header className="header">
        <div>
          <h2>Stock Management</h2>
          <p>Track stock movements</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New Movement"}
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="panel form-panel">
          <h3>Record Stock Movement</h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <select
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                required
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (SKU: {p.sku})
                  </option>
                ))}
              </select>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="IN">Stock IN</option>
                <option value="OUT">Stock OUT</option>
              </select>
            </div>
            <div className="form-row">
              <input
                placeholder="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
              <input
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <button type="submit">Record Movement</button>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h3>Stock Movements</h3>
          <span>{movements.length} movements</span>
        </div>

        {movements.length === 0 ? (
          <p className="empty">No stock movements recorded.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Notes</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((mov) => (
                <tr key={mov.id}>
                  <td>{mov.product_name}</td>
                  <td>
                    <span className={mov.type === "IN" ? "badge-in" : "badge-out"}>
                      {mov.type}
                    </span>
                  </td>
                  <td>{mov.quantity}</td>
                  <td>{mov.notes || "-"}</td>
                  <td>{new Date(mov.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// Challans Component
function Challans({ onRefresh }) {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadChallans();
  }, []);

  async function loadChallans() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API}/challans`);
      const data = await res.json();
      setChallans(data.data || []);
    } catch (err) {
      setError("Failed to load challans");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="loading">Loading challans...</div>;

  return (
    <>
      <header className="header">
        <div>
          <h2>Challans</h2>
          <p>View all challan documents</p>
        </div>
        <button onClick={loadChallans}>Refresh</button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="panel">
        <div className="panel-header">
          <h3>All Challans</h3>
          <span>{challans.length} challans</span>
        </div>

        {challans.length === 0 ? (
          <p className="empty">No challans available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Challan #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((challan) => (
                <tr key={challan.id}>
                  <td>
                    <strong>{challan.challan_number}</strong>
                  </td>
                  <td>{challan.customer_name}</td>
                  <td>{new Date(challan.challan_date).toLocaleDateString()}</td>
                  <td>
                    <span className="status">
                      {challan.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentPage === "dashboard") {
      loadDashboard();
    }
  }, [currentPage]);

  async function loadDashboard() {
    try {
      const [customerRes, productRes, challanRes] = await Promise.all([
        fetch(`${API}/customers`),
        fetch(`${API}/products`),
        fetch(`${API}/challans`),
      ]);

      const customerData = await customerRes.json();
      const productData = await productRes.json();
      const challanData = await challanRes.json();

      setCustomers(customerData.data || []);
      setProducts(productData.data || []);
      setChallans(challanData.data || []);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && currentPage === "dashboard") {
    return <div className="loading">Loading Mini ERP CRM...</div>;
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>Mini ERP</h1>
        <p className="subtitle">CRM Dashboard</p>

        <nav>
          <a
            className={currentPage === "dashboard" ? "active" : ""}
            onClick={() => setCurrentPage("dashboard")}
          >
            Dashboard
          </a>
          <a
            className={currentPage === "customers" ? "active" : ""}
            onClick={() => setCurrentPage("customers")}
          >
            Customers
          </a>
          <a
            className={currentPage === "products" ? "active" : ""}
            onClick={() => setCurrentPage("products")}
          >
            Products
          </a>
          <a
            className={currentPage === "stock" ? "active" : ""}
            onClick={() => setCurrentPage("stock")}
          >
            Stock
          </a>
          <a
            className={currentPage === "challans" ? "active" : ""}
            onClick={() => setCurrentPage("challans")}
          >
            Challans
          </a>
        </nav>
      </aside>

      <main className="main">
        {currentPage === "dashboard" && (
          <Dashboard
            customers={customers}
            products={products}
            challans={challans}
            onRefresh={loadDashboard}
          />
        )}
        {currentPage === "customers" && <Customers onRefresh={loadDashboard} />}
        {currentPage === "products" && <Products onRefresh={loadDashboard} />}
        {currentPage === "stock" && <Stock onRefresh={loadDashboard} />}
        {currentPage === "challans" && <Challans onRefresh={loadDashboard} />}
      </main>
    </div>
  );
}

export default App;