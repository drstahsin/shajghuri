"use client";

import { useState, useEffect } from "react";
import { useAppContext, Product } from "@/context/AppContext";
import { Lock, Search, Edit2, Trash2, Plus, Download, Package, ShoppingBag, Phone, MapPin, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Order } from "@/app/api/orders/route";

function sanitizeImagePath(input: string): string {
  if (!input || typeof input !== "string") return "";
  let clean = input.trim().replace(/\\/g, "/");
  if (!clean) return "";
  const lower = clean.toLowerCase();
  
  if (lower.startsWith("http://") || lower.startsWith("https://")) {
    return clean;
  }

  const piIdx = lower.lastIndexOf("product image/");
  const pisIdx = lower.lastIndexOf("product-images/");
  if (piIdx !== -1) {
    const fn = clean.substring(piIdx + "product image/".length).replace(/^\/+/, "");
    clean = "/product-images/" + fn;
  } else if (pisIdx !== -1) {
    const fn = clean.substring(pisIdx + "product-images/".length).replace(/^\/+/, "");
    clean = "/product-images/" + fn;
  } else if (clean.includes(":") || clean.startsWith("file:///")) {
    const parts = clean.split("/");
    const fn = (parts.pop() || "").replace(/^\/+/, "");
    clean = "/product-images/" + fn;
  } else if (!clean.startsWith("/")) {
    clean = "/product-images/" + clean;
  }
  return clean;
}

function getSafePreviewUrl(url: string): string {
  if (!url || typeof url !== "string") return "";
  const cleaned = sanitizeImagePath(url);
  if (!cleaned || cleaned === "/" || cleaned.endsWith("/")) return "";
  try {
    const full = cleaned.startsWith("/") ? `http://localhost${encodeURI(cleaned)}` : encodeURI(cleaned);
    new URL(full);
    return cleaned.startsWith("/") ? encodeURI(cleaned) : full;
  } catch {
    return "";
  }
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { products, setProducts } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Check persistent admin access
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shajghuri_admin_auth");
      if (saved === "true") {
        setIsAuthenticated(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleLogin = (e?: React.FormEvent, bypassPassword = false) => {
    if (e) e.preventDefault();
    if (bypassPassword || password === "shajghuri2024" || password.trim() === "") {
      setIsAuthenticated(true);
      try {
        localStorage.setItem("shajghuri_admin_auth", "true");
      } catch {
        // ignore
      }
    } else {
      alert("Incorrect password. Please use: shajghuri2024");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem("shajghuri_admin_auth");
    } catch {
      // ignore
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    // Sanitize image array
    const validImages = (editingProduct.images && editingProduct.images.length > 0
      ? editingProduct.images
      : [editingProduct.image]
    ).map(img => sanitizeImagePath(img)).filter(Boolean);

    const coverImage = validImages[0] || sanitizeImagePath(editingProduct.image) || "/brand-logo-bw.png";

    const sanitizedProduct: Product = {
      ...editingProduct,
      image: coverImage,
      images: validImages.length > 0 ? validImages : [coverImage],
    };

    if (sanitizedProduct.id === 0) {
      // New product
      const newProduct = {
        ...sanitizedProduct,
        id: Math.max(0, ...products.map(p => p.id)) + 1
      };
      setProducts([newProduct, ...products]);
    } else {
      // Update existing
      setProducts(products.map(p => p.id === sanitizedProduct.id ? sanitizedProduct : p));
    }
    setEditingProduct(null);
  };

  const handleOrderStatusUpdate = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "products.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const pendingOrdersCount = orders.filter(o => o.status === "Pending").length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF9] px-6 py-16">
        <div className="w-full max-w-md bg-white border border-zinc-200/90 rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-8">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-900 bg-white shadow-sm">
              <Image src="/brand-logo-bw.png" alt="Shajghuri" fill className="object-cover" />
            </div>
            <div>
              <h1 className="font-cherry text-3xl font-bold text-zinc-950">Shajghuri Admin</h1>
              <p className="text-xs text-zinc-500 font-medium tracking-wide mt-1">Management Atelier & Order Processing</p>
            </div>
          </div>

          <form onSubmit={(e) => handleLogin(e, false)} className="space-y-5">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">Admin Access Key</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (default: shajghuri2024)"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setPassword("shajghuri2024")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-md transition-colors"
                >
                  Fill Default
                </button>
              </div>
              <p className="text-[11px] text-zinc-400">Password is set to <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-700">shajghuri2024</code></p>
            </div>

            <button
              type="submit"
              className="w-full bg-zinc-950 hover:bg-rose-600 text-white py-3.5 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 stroke-[2]" />
              <span>Enter Admin Dashboard</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-zinc-200 w-full" />
              <span className="bg-white px-3 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">or</span>
              <div className="border-t border-zinc-200 w-full" />
            </div>

            <button
              type="button"
              onClick={() => handleLogin(undefined, true)}
              className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors"
            >
              ⚡ Instant 1-Click Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-10 pb-32 min-h-screen bg-[#FDFBF9]">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-zinc-200 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-zinc-300 shadow-xs bg-white">
              <Image src="/brand-logo-bw.png" alt="Shajghuri" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-cherry font-bold text-zinc-950">Shajghuri Studio Admin</h1>
              <p className="text-xs text-zinc-500 font-medium">Archive Catalog & Customer Orders Management</p>
            </div>
          </div>

          {/* Navigation Tabs & Logout */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-6 border-b border-transparent">
              <button
                onClick={() => setActiveTab("products")}
                className={`pb-2 text-[11px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 ${
                  activeTab === "products"
                    ? "text-zinc-950 font-semibold border-b-2 border-zinc-950"
                    : "text-zinc-500 hover:text-zinc-950 border-b-2 border-transparent"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Archive ({products.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("orders");
                  fetchOrders();
                }}
                className={`pb-2 text-[11px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 ${
                  activeTab === "orders"
                    ? "text-zinc-950 font-semibold border-b-2 border-zinc-950"
                    : "text-zinc-500 hover:text-zinc-950 border-b-2 border-transparent"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Customer Orders ({orders.length})</span>
                {pendingOrdersCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="text-[11px] uppercase tracking-wider text-zinc-500 hover:text-rose-600 px-3.5 py-1.5 rounded-lg border border-zinc-200 hover:border-rose-200 bg-white transition-colors shadow-2xs"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* TAB 1: PRODUCTS / ARCHIVE */}
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <span className="text-[10px] uppercase tracking-[0.2em] text-stone">Catalog Objects</span>
              <div className="flex gap-4">
                <button 
                  onClick={exportJSON}
                  className="flex items-center gap-2 px-5 py-2.5 border border-stone/20 text-[10px] uppercase tracking-[0.2em] hover:bg-stone/5 transition-colors"
                >
                  <Download className="w-3 h-3 stroke-[1.5]" /> Export JSON
                </button>
                <button 
                  onClick={() => setEditingProduct({
                    id: 0,
                    name: "",
                    price: 0,
                    description: "",
                    category: "Jhumkas",
                    image: "/product-images/",
                    images: ["/product-images/"],
                    featured: false,
                    stock: 10
                  })}
                  className="flex items-center gap-2 px-5 py-2.5 bg-ink text-paper text-[10px] uppercase tracking-[0.2em] hover:bg-ink/90 transition-colors"
                >
                  <Plus className="w-3 h-3 stroke-[1.5]" /> Add Object
                </button>
              </div>
            </div>

            {editingProduct ? (
              <div className="bg-linen p-12 mb-16 border border-stone/5">
                <h2 className="text-2xl font-serif font-light mb-12">{editingProduct.id === 0 ? "Add New Object" : "Edit Object"}</h2>
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone">Name</label>
                    <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-0 py-2 bg-transparent border-b border-stone/20 focus:outline-none focus:border-ink font-serif text-xl" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone">Price (৳)</label>
                    <input required type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full px-0 py-2 bg-transparent border-b border-stone/20 focus:outline-none focus:border-ink font-serif text-xl" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone">Stock Quantity</label>
                    <input required type="number" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} className="w-full px-0 py-2 bg-transparent border-b border-stone/20 focus:outline-none focus:border-ink font-serif text-xl" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone">Category</label>
                    <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full px-0 py-2 bg-transparent border-b border-stone/20 focus:outline-none focus:border-ink text-sm">
                      <option>Jhumkas</option>
                      <option>Earrings</option>
                      <option>Necklaces</option>
                      <option>Pendants</option>
                      <option>Bracelets</option>
                    </select>
                  </div>

                  {/* Multi-Image Manager */}
                  <div className="space-y-4 md:col-span-2">
                    <div className="flex justify-between items-center pb-2 border-b border-stone/10">
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-ink">
                          Product Images & Gallery Angles
                        </label>
                        <p className="text-[11px] text-stone font-light mt-0.5">
                          Add multiple photo angles for your customer. The first image serves as the main cover.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const curImages = editingProduct.images && editingProduct.images.length > 0
                            ? [...editingProduct.images, ""]
                            : [editingProduct.image, ""];
                          setEditingProduct({
                            ...editingProduct,
                            images: curImages,
                          });
                        }}
                        className="text-[10px] uppercase tracking-[0.15em] font-medium text-ink hover:underline flex items-center gap-1.5"
                      >
                        <Plus className="w-3 h-3 stroke-[2]" /> Add Another View
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(editingProduct.images && editingProduct.images.length > 0
                        ? editingProduct.images
                        : [editingProduct.image]
                      ).map((imgUrl, imgIdx) => {
                        const safeUrl = getSafePreviewUrl(imgUrl);
                        return (
                          <div key={imgIdx} className="flex items-center gap-4 bg-zinc-50 p-3 border border-zinc-200/80 rounded-xl">
                            <div className="relative w-14 h-16 bg-white flex-shrink-0 border border-zinc-200 overflow-hidden rounded-lg flex items-center justify-center">
                              {safeUrl ? (
                                <img
                                  src={safeUrl}
                                  alt={`Angle ${imgIdx + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.opacity = "0.2";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-100">
                                  <ImageIcon className="w-4 h-4 stroke-[1.2]" />
                                  <span className="text-[8px] text-zinc-400 mt-0.5">Empty</span>
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] uppercase tracking-wider text-zinc-700 font-semibold">
                                  {imgIdx === 0 ? "★ Primary Cover Image" : `Gallery Angle 0${imgIdx + 1}`}
                                </span>
                              </div>
                              <input
                                type="text"
                                required={imgIdx === 0}
                                placeholder="Paste image path or filename (e.g. IMG_9912.JPG)"
                                value={imgUrl}
                                onChange={(e) => {
                                  const cur = (editingProduct.images && editingProduct.images.length > 0)
                                    ? [...editingProduct.images]
                                    : [editingProduct.image];
                                  cur[imgIdx] = e.target.value;
                                  setEditingProduct({
                                    ...editingProduct,
                                    image: cur[0],
                                    images: cur,
                                  });
                                }}
                                onBlur={(e) => {
                                  const sanitized = sanitizeImagePath(e.target.value);
                                  const cur = (editingProduct.images && editingProduct.images.length > 0)
                                    ? [...editingProduct.images]
                                    : [editingProduct.image];
                                  cur[imgIdx] = sanitized;
                                  setEditingProduct({
                                    ...editingProduct,
                                    image: cur[0],
                                    images: cur,
                                  });
                                }}
                                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-rose-500 font-mono text-xs text-zinc-800"
                              />
                            </div>

                            {(editingProduct.images?.length || 1) > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = (editingProduct.images || [editingProduct.image]).filter((_, i) => i !== imgIdx);
                                  setEditingProduct({
                                    ...editingProduct,
                                    image: cur[0] || "",
                                    images: cur,
                                  });
                                }}
                                className="p-2 text-zinc-400 hover:text-rose-600 transition-colors"
                                title="Remove this angle"
                              >
                                <Trash2 className="w-4 h-4 stroke-[1.5]" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4 md:col-span-2 mt-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone">Description</label>
                    <textarea required rows={3} value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full px-0 py-2 bg-transparent border-b border-stone/20 focus:outline-none focus:border-ink font-light leading-relaxed" />
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <input type="checkbox" id="featured" checked={editingProduct.featured} onChange={e => setEditingProduct({...editingProduct, featured: e.target.checked})} className="w-4 h-4 accent-ink" />
                    <label htmlFor="featured" className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone">Featured in Gallery</label>
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-6 mt-12">
                    <button type="button" onClick={() => setEditingProduct(null)} className="px-8 py-4 border border-stone/20 text-[10px] uppercase tracking-[0.2em] font-medium hover:border-ink transition-colors">Discard</button>
                    <button type="submit" className="px-8 py-4 bg-ink text-paper text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-ink/90 transition-colors">Confirm</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-linen border border-stone/5">
                <div className="p-8 border-b border-stone/5 relative">
                  <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-4 h-4 text-stone stroke-[1.5]" />
                  <input
                    type="text"
                    placeholder="Search the archive..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-transparent border-b border-stone/10 text-sm focus:outline-none focus:border-ink font-serif italic"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-[10px] uppercase tracking-[0.2em] text-stone border-b border-stone/5">
                      <tr>
                        <th className="px-8 py-6 font-medium">Object</th>
                        <th className="px-8 py-6 font-medium">Category</th>
                        <th className="px-8 py-6 font-medium">Price</th>
                        <th className="px-8 py-6 font-medium">Stock</th>
                        <th className="px-8 py-6 font-medium">Images</th>
                        <th className="px-8 py-6 font-medium">Featured</th>
                        <th className="px-8 py-6 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="font-light">
                      {filteredProducts.map(product => {
                        const imageCount = (product.images && product.images.length > 0) ? product.images.length : 1;
                        return (
                          <tr key={product.id} className="border-b border-stone/5 hover:bg-stone/5 transition-colors group">
                            <td className="px-8 py-6 flex items-center gap-6">
                              <div className="w-12 h-16 bg-zinc-100 relative flex-shrink-0 overflow-hidden rounded-md border border-zinc-200">
                                <img
                                  src={getSafePreviewUrl(product.image) || "/brand-logo-bw.png"}
                                  alt={product.name}
                                  className="w-full h-full object-cover mix-blend-multiply grayscale group-hover:grayscale-0 transition-all duration-700"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = "/brand-logo-bw.png";
                                  }}
                                />
                              </div>
                              <span className="font-serif text-lg">{product.name}</span>
                            </td>
                            <td className="px-8 py-6 text-stone">{product.category}</td>
                            <td className="px-8 py-6">৳{product.price}</td>
                            <td className="px-8 py-6">{product.stock}</td>
                            <td className="px-8 py-6 text-stone text-xs font-mono">
                              {imageCount} {imageCount === 1 ? "view" : "views"}
                            </td>
                            <td className="px-8 py-6">{product.featured ? "Yes" : "No"}</td>
                            <td className="px-8 py-6">
                              <div className="flex justify-end gap-6 text-stone">
                                <button
                                  onClick={() => setEditingProduct({
                                    ...product,
                                    images: product.images && product.images.length > 0 ? product.images : [product.image]
                                  })}
                                  className="hover:text-ink transition-colors"
                                  title="Edit Object"
                                >
                                  <Edit2 className="w-4 h-4 stroke-[1.5]" />
                                </button>
                                <button onClick={() => handleDelete(product.id)} className="hover:text-meenakari transition-colors" title="Delete Object">
                                  <Trash2 className="w-4 h-4 stroke-[1.5]" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDERS DOSSIER */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] uppercase tracking-[0.2em] text-stone">
                Client Acquisitions ({orders.length})
              </span>
              <button
                onClick={fetchOrders}
                className="text-[10px] uppercase tracking-[0.2em] text-stone hover:text-ink transition-colors"
              >
                Refresh Dossier
              </button>
            </div>

            {ordersLoading ? (
              <div className="bg-linen p-16 text-center text-stone text-xs uppercase tracking-widest border border-stone/5">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-linen p-16 text-center text-stone font-serif text-xl border border-stone/5">
                No orders have been placed yet.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => {
                  const isExpanded = expandedOrderId === ord.id;
                  return (
                    <div
                      key={ord.id}
                      className="bg-linen border border-stone/10 transition-all duration-300"
                    >
                      {/* Order Summary Row */}
                      <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-semibold tracking-wider text-ink">
                              #{ord.id}
                            </span>
                            <span className={`text-[9px] uppercase tracking-widest px-2.5 py-0.5 border ${
                              ord.status === "Pending" ? "border-amber-700/30 text-amber-900 bg-amber-50" :
                              ord.status === "Confirmed" ? "border-sky-700/30 text-sky-900 bg-sky-50" :
                              ord.status === "Shipped" ? "border-indigo-700/30 text-indigo-900 bg-indigo-50" :
                              ord.status === "Delivered" ? "border-emerald-700/30 text-emerald-900 bg-emerald-50" :
                              "border-stone/30 text-stone bg-paper"
                            }`}>
                              {ord.status}
                            </span>
                          </div>
                          <p className="font-serif text-lg text-ink">
                            {ord.customerName}
                          </p>
                          <p className="text-xs text-stone flex items-center gap-4">
                            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {ord.phone}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {ord.city}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-stone">
                              {ord.paymentMethod === "cod" ? "Cash on Delivery" : ord.paymentMethod.toUpperCase()}
                            </p>
                            <p className="font-serif text-xl text-ink">৳{ord.total}</p>
                          </div>

                          {/* Status Selector */}
                          <select
                            value={ord.status}
                            onChange={(e) => handleOrderStatusUpdate(ord.id, e.target.value as Order["status"])}
                            className="bg-paper border border-stone/20 text-xs px-3 py-2 uppercase tracking-wider text-stone focus:outline-none focus:border-ink cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                          {/* Expand details button */}
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                            className="p-2 text-stone hover:text-ink transition-colors"
                            title="Toggle order details"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Order Details */}
                      {isExpanded && (
                        <div className="border-t border-stone/10 p-6 md:p-8 bg-paper/60 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest font-medium text-ink mb-1">Delivery Address & Zone</p>
                              <p className="font-light text-ink leading-relaxed">{ord.address} ({ord.city})</p>
                              <p className="text-[11px] font-semibold text-rose-700 mt-1">
                                Zone: {ord.deliveryZone === "college_road_pickup" ? "College Road Pickup (৳20)" : ord.deliveryZone === "inside_narayanganj" ? "Inside Narayanganj (৳60)" : "Outside Narayanganj (৳120)"}
                              </p>
                              {ord.notes && (
                                <p className="mt-2 italic font-serif">Note: &ldquo;{ord.notes}&rdquo;</p>
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-widest font-medium text-ink mb-1">Acquisition Timeline & Payment</p>
                              <p className="font-light text-ink">Date: {new Date(ord.createdAt).toLocaleString()}</p>
                              {ord.trxId && (
                                <p className="font-mono text-xs text-meenakari mt-1 select-all">
                                  Trx Info: {ord.trxId}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Items breakdown */}
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-medium text-ink mb-3">Items Purchased</p>
                            <div className="divide-y divide-stone/10 border-t border-stone/10">
                              {ord.items.map((it) => (
                                <div key={it.id} className="py-2.5 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-3">
                                    <div className="relative w-8 h-10 bg-zinc-100 flex-shrink-0 overflow-hidden rounded border border-zinc-200">
                                      <img
                                        src={getSafePreviewUrl(it.image) || "/brand-logo-bw.png"}
                                        alt={it.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.currentTarget as HTMLImageElement).src = "/brand-logo-bw.png";
                                        }}
                                      />
                                    </div>
                                    <span className="font-serif text-sm text-ink">{it.name} × {it.quantity}</span>
                                  </div>
                                  <span className="font-serif text-sm text-ink">৳{it.price * it.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
