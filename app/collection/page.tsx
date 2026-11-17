"use client";

import { useState, useMemo, Suspense } from "react";
import { useAppContext } from "@/context/AppContext";
import { ProductCard } from "@/components/ProductCard";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, RotateCcw } from "lucide-react";

function CollectionContent() {
  const { products } = useAppContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const categoryParam = searchParams.get("category") || "All";
  const searchParam = searchParams.get("search") || "";
  
  const activeCategory = categoryParam;
  const searchTerm = searchParam;
  const [priceSort, setPriceSort] = useState<"default" | "low-high" | "high-low">("default");

  const updateFilters = (updates: { category?: string; search?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.category !== undefined) {
      if (updates.category === "All") params.delete("category");
      else params.set("category", updates.category);
    }
    if (updates.search !== undefined) {
      if (!updates.search.trim()) params.delete("search");
      else params.set("search", updates.search);
    }
    const query = params.toString();
    router.replace(query ? `/collection?${query}` : "/collection", { scroll: false });
  };

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (activeCategory !== "All") {
      filtered = filtered.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    
    // Sort by price
    if (priceSort === "low-high") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (priceSort === "high-low") {
      filtered.sort((a, b) => b.price - a.price);
    }
    
    return filtered;
  }, [products, activeCategory, searchTerm, priceSort]);

  const resetFilters = () => {
    router.replace("/collection", { scroll: false });
    setPriceSort("default");
  };

  return (
    <div className="pt-6 pb-24 container mx-auto px-4 md:px-8">
      {/* Breadcrumb (Ariano style) */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-900 font-medium">All Jewelry Collection</span>
        {activeCategory !== "All" && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-rose-600 font-semibold">{activeCategory}</span>
          </>
        )}
      </nav>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h1 className="font-cherry text-3xl md:text-4xl font-bold text-zinc-950">
            {activeCategory === "All" ? "Full Jewelry Collection" : `${activeCategory} Collection`}
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Showing {filteredProducts.length} handcrafted ornaments
            {searchTerm ? ` matching "${searchTerm}"` : ""}
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-4 h-4 text-zinc-400 hidden sm:inline" />
          <select 
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value as "default" | "low-high" | "high-low")}
            className="bg-zinc-50 border border-zinc-200 text-xs font-semibold px-3.5 py-2 rounded-lg text-zinc-800 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
          >
            <option value="default">Sort by: Featured</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Categories (Ariano style) */}
        <aside className="w-full lg:w-60 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 sticky top-36 shadow-2xs space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3 flex items-center justify-between">
                <span>Categories</span>
                {(activeCategory !== "All" || searchTerm) && (
                  <button
                    onClick={resetFilters}
                    className="text-[10px] text-rose-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> Reset
                  </button>
                )}
              </h3>
              <ul className="space-y-1 text-xs">
                {categories.map((cat) => {
                  const count = cat === "All"
                    ? products.length
                    : products.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length;
                  return (
                    <li key={cat}>
                      <button
                        onClick={() => updateFilters({ category: cat })}
                        className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all flex items-center justify-between cursor-pointer ${
                          activeCategory.toLowerCase() === cat.toLowerCase()
                            ? "bg-rose-50 text-rose-700 font-bold"
                            : "text-zinc-600 hover:bg-zinc-50 hover:text-black"
                        }`}
                      >
                        <span>{cat}</span>
                        <span className="text-[10px] text-zinc-400">({count})</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Price Quick Info */}
            <div className="pt-4 border-t border-zinc-100 text-xs text-zinc-500 space-y-2">
              <p className="font-semibold text-zinc-800">Shajghuri Promise:</p>
              <p className="text-[11px] leading-relaxed">
                All ornaments are packaged in custom gift boxes with protective seals.
              </p>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-16 text-center space-y-4">
              <p className="font-cherry text-2xl text-zinc-900">No ornaments found</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                We couldn&apos;t find any items matching your current filters. Try resetting the filters or searching for something else.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-zinc-950 text-white text-xs font-semibold rounded-full hover:bg-rose-600 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center text-xs text-zinc-500">Loading collection...</div>}>
      <CollectionContent />
    </Suspense>
  );
}
