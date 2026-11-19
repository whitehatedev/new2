import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  Trash2,
  Tag,
  CheckCircle2,
  ZoomIn,
  X,
  Play,
  ChevronDown,
  FileText,
  PackageCheck,
  MapPin,
  ShieldCheck,
  Box,
  MessageSquarePlus,
  Truck,
  Star,
  Mail,
  Search,
  Clock,
  CreditCard,
  UserCheck,
  Download,
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { AddressData, Product } from '../types/platform';
import { AddressSelector } from '../components/AddressSelector';
import { RazorpayCheckoutModal } from '../components/RazorpayCheckoutModal';
import { downloadInvoicePdf } from '../lib/pdf';
import krashivantriXFieldImg from '../assets/images/krashivantri_x_field_1795013369836.jpg';
import krashivantriXProImg from '../assets/images/krashivantri_x_pro_1795013371537.jpg';

interface RecentProductSnapshot {
  id: number;
  slug: string;
  name: string;
  sku: string;
  imageUrl: string;
  priceInr: number;
  discountPriceInr: number | null;
  productType?: string;
}

const RECENTLY_VIEWED_KEY = 'ntf_recently_viewed';

export const ShopListingPage: React.FC<{
  scope?: 'general' | '3d_printed';
  categorySlug?: string;
  saleOnly?: boolean;
}> = ({ scope, categorySlug, saleOnly }) => {
  const {
    categories,
    brands,
    settings,
    banners,
    featuredProducts,
    bestsellerProducts,
    newArrivalProducts,
    navigate,
    addToCart,
    isSignedIn,
    apiFetch,
    notify,
  } = usePlatform();
  const storeCms = settings.cmsContent?.storeContent;
  const storeBanners = (banners || []).filter(
    (b) => b.placement === 'store' && b.isActive && b.status === 'published'
  );
  const [items, setItems] = useState<Product[]>([]);
  const [catalogOffers, setCatalogOffers] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<RecentProductSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState(() => new URLSearchParams(window.location.search).get('q') || '');
  const [selectedCat, setSelectedCat] = useState(categorySlug || '');
  const [material, setMaterial] = useState('');
  const [brand, setBrand] = useState('');
  const [productType, setProductType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [quickFilter, setQuickFilter] = useState<'all' | 'featured' | 'bestseller' | 'new_arrival'>('all');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    setSelectedCat(categorySlug || '');
    setPage(1);
  }, [categorySlug, scope, saleOnly]);

  useEffect(() => {
    try {
      const stored: RecentProductSnapshot[] = JSON.parse(
        localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]'
      );
      setRecentProducts(Array.isArray(stored) ? stored.slice(0, 4) : []);
    } catch {
      setRecentProducts([]);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch<{ items: Product[] }>('/api/products?sale=true&limit=8')
      .then((res) => {
        if (active) setCatalogOffers(res.items || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [apiFetch]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (scope) params.set('scope', scope);
        if (selectedCat) params.set('category', selectedCat);
        if (q) params.set('q', q);
        if (material) params.set('material', material);
        if (brand) params.set('brand', brand);
        if (productType) params.set('productType', productType);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (inStockOnly) params.set('inStock', 'true');
        if (quickFilter === 'bestseller') params.set('bestseller', 'true');
        if (quickFilter === 'new_arrival') params.set('newArrival', 'true');
        if (saleOnly) params.set('sale', 'true');
        params.set('sort', quickFilter === 'featured' && sort === 'newest' ? 'featured' : sort);
        params.set('page', String(page));
        params.set('limit', '12');

        const data = await apiFetch<{ items: Product[]; total: number; totalPages: number }>(
          `/api/products?${params.toString()}`
        );
        if (active) {
          const list =
            quickFilter === 'featured'
              ? (data.items || []).filter((p) => p.isFeatured)
              : data.items || [];
          setItems(list);
          setTotal(quickFilter === 'featured' ? list.length : data.total || list.length);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [
    scope,
    selectedCat,
    q,
    material,
    brand,
    productType,
    minPrice,
    maxPrice,
    inStockOnly,
    quickFilter,
    saleOnly,
    sort,
    page,
    apiFetch,
  ]);

  const toggleWishlist = async (productId: number) => {
    if (!isSignedIn) {
      notify('Please sign in to save items to your wishlist.', 'info');
      return;
    }
    try {
      const res = await apiFetch<{ wishlisted: boolean }>('/api/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
      notify(res.wishlisted ? 'Saved to wishlist.' : 'Removed from wishlist.', 'success');
    } catch (err: any) {
      notify(err?.message || 'Wishlist update failed.', 'error');
    }
  };

  const resetFilters = () => {
    setQ('');
    setSelectedCat('');
    setMaterial('');
    setBrand('');
    setProductType('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setQuickFilter('all');
    setSort('newest');
    setPage(1);
  };

  const visibleCategories = scope
    ? categories.filter((c) => c.storeScope === scope)
    : categories;

  const activeCategoryObj = visibleCategories.find((c) => c.slug === selectedCat);
  const activeCategorySummary = selectedCat
    ? storeCms?.categoryDescriptions?.[selectedCat] ||
      (activeCategoryObj ? storeCms?.categoryDescriptions?.[activeCategoryObj.name] : '') ||
      activeCategoryObj?.description ||
      ''
    : '';

  const isDefaultStoreHome =
    !q &&
    !selectedCat &&
    !scope &&
    !saleOnly &&
    quickFilter === 'all' &&
    page === 1 &&
    !brand &&
    !material &&
    !productType &&
    !minPrice &&
    !maxPrice &&
    !inStockOnly;

  const heading =
    scope === '3d_printed'
      ? 'Ready-Made 3D Printed Products Store'
      : 'NexusTekFusion Hardware, Drones & Components Store';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Amazon-Style Search Hero & Store Switcher */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-[#15803D]">
              {scope === '3d_printed'
                ? 'Additive Manufacturing Store'
                : 'KRASHIVANTRI Agricultural UAVs, Embedded Hardware & Components'}
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-950">{heading}</h1>
            <p className="text-xs text-slate-500 font-mono tabular-nums">
              Showing {items.length} of {total} catalog SKU(s) · GST Tax Invoice on Verified Payment
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/store')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap shrink-0 ${
                !scope ? 'bg-[#111417] text-white border-[#111417]' : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              All Hardware
            </button>
            <button
              onClick={() => navigate('/store/3d-printed-products')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap shrink-0 ${
                scope === '3d_printed' ? 'bg-[#111417] text-white border-[#111417]' : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              3D Printed Store
            </button>
            <button
              onClick={() => navigate('/krashivantri/compare')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-300 bg-emerald-50 text-[#15803D] hover:bg-emerald-100 whitespace-nowrap shrink-0"
            >
              Compare Drones
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              placeholder="Search KRASHIVANTRI X, X PRO, agricultural drones, LiPo batteries, PCB, motors, SKU..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/70 focus:bg-white pl-10 pr-4 py-3 text-sm"
            />
          </div>
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ('');
                setPage(1);
              }}
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              Clear Search
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="px-4 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="w-4 h-4" /> View Cart
          </button>
        </div>
      </div>

      {/* Store CMS Promotional Banner */}
      {storeCms?.promoBannerEnabled &&
        (storeCms.promoBannerTitle || storeCms.promoBannerImageUrl || storeCms.promoBannerVideoUrl) && (
          <div className="rounded-2xl border border-slate-800 bg-[#111417] text-white overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-3">
              {storeCms.promoBannerKicker && (
                <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                  {storeCms.promoBannerKicker}
                </div>
              )}
              {storeCms.promoBannerTitle && (
                <h2 className="font-display text-2xl font-bold">{storeCms.promoBannerTitle}</h2>
              )}
              {storeCms.promoBannerSubtitle && (
                <p className="text-sm text-slate-300 leading-relaxed">{storeCms.promoBannerSubtitle}</p>
              )}
              {storeCms.promoBannerCtaLabel && storeCms.promoBannerCtaLink && (
                <div className="pt-1">
                  <button
                    onClick={() => navigate(storeCms.promoBannerCtaLink)}
                    className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
                  >
                    {storeCms.promoBannerCtaLabel} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            {(storeCms.promoBannerVideoUrl || storeCms.promoBannerImageUrl) && (
              <div className="lg:col-span-5 aspect-[16/9] lg:aspect-auto bg-[#181C20]">
                {storeCms.promoBannerVideoUrl ? (
                  <video
                    src={storeCms.promoBannerVideoUrl}
                    poster={storeCms.promoBannerImageUrl || undefined}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={storeCms.promoBannerImageUrl}
                    alt={storeCms.promoBannerTitle || 'Store Promotion'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
          </div>
        )}

      {storeBanners.length > 0 && (
        <div className="space-y-3">
          {storeBanners.map((b) => (
            <div
              key={b.id ?? b.bannerKey}
              className="rounded-2xl border border-emerald-200 bg-white overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-sm"
            >
              <div className="lg:col-span-7 p-6 flex flex-col justify-center space-y-2">
                <h2 className="font-display text-xl font-bold text-[#111417]">{b.title}</h2>
                {b.subtitle && <p className="text-sm text-slate-600">{b.subtitle}</p>}
                {b.ctaLabel && b.ctaLink && (
                  <div className="pt-1">
                    <button
                      onClick={() => navigate(b.ctaLink)}
                      className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
                    >
                      {b.ctaLabel} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              {(b.videoUrl || b.imageUrl) && (
                <div className="lg:col-span-5 aspect-[16/9] lg:aspect-auto bg-slate-100">
                  {b.videoUrl ? (
                    <video
                      src={b.videoUrl}
                      poster={b.imageUrl || undefined}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Category Tabs across all 14 Dedicated Categories */}
      {visibleCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedCat('');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-colors ${
              !selectedCat
                ? 'bg-[#15803D] text-white border-[#15803D]'
                : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
            }`}
          >
            All Categories
          </button>
          {visibleCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedCat(c.slug);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCat === c.slug
                  ? 'bg-[#15803D] text-white border-[#15803D]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {selectedCat && activeCategorySummary && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-slate-700">
          <span className="font-semibold text-[#111417] mr-2">
            {activeCategoryObj?.name || selectedCat}:
          </span>
          {activeCategorySummary}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <input
            type="search"
            placeholder="Search products, model or SKU..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="lg:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={selectedCat}
            onChange={(e) => {
              setSelectedCat(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
          >
            <option value="">All Categories</option>
            {visibleCategories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <select
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
          <select
            value={productType}
            onChange={(e) => {
              setProductType(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
          >
            <option value="">All Product Types</option>
            <option value="simple">Simple Product</option>
            <option value="variable">Variable Product</option>
            <option value="customizable">Customizable</option>
            <option value="made_to_order">Made to Order</option>
            <option value="quote_only">Quote Only</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
          >
            <option value="newest">Sort: Newest</option>
            <option value="featured">Sort: Featured</option>
            <option value="bestseller">Sort: Best Sellers</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              ['all', 'All Items'],
              ['featured', 'Featured'],
              ['bestseller', 'Best Sellers'],
              ['new_arrival', 'New Arrivals'],
            ].map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setQuickFilter(k as typeof quickFilter);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-lg border text-xs font-medium whitespace-nowrap ${
                  quickFilter === k
                    ? 'bg-[#111417] text-white border-[#111417]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
            <input
              placeholder="Material filter..."
              value={material}
              onChange={(e) => {
                setMaterial(e.target.value);
                setPage(1);
              }}
              className="w-32 rounded-lg border border-slate-300 px-2.5 py-1 text-xs"
            />
            <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setPage(1);
                }}
              />
              In Stock Only
            </label>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Price ₹</span>
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
              className="w-24 rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono"
            />
            <span className="text-slate-400">–</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              className="w-24 rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono"
            />
            {(q || selectedCat || material || brand || productType || minPrice || maxPrice || inStockOnly || quickFilter !== 'all') && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-2.5 py-1.5 text-xs font-semibold text-[#15803D] hover:underline whitespace-nowrap"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Curated Amazon-Style Storefront Showcase (Visible on Default Store Home) */}
      {isDefaultStoreHome && (
        <div className="space-y-8">
          {/* Dual KRASHIVANTRI Flagship Banners */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-emerald-200 bg-[#111417] text-white overflow-hidden grid grid-cols-1 sm:grid-cols-12">
              <div className="sm:col-span-7 p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                    KRASHIVANTRI Series · Agri UAV
                  </div>
                  <h2 className="font-display text-2xl font-bold">KRASHIVANTRI X</h2>
                  <p className="text-xs text-slate-300">Smart Agriculture. Precision Spraying.</p>
                  <div className="font-mono text-xl font-bold text-white tabular-nums pt-1">₹4,50,000</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/krashivantri-x')}
                    className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    View Drone <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/krashivantri/enquiry')}
                    className="px-3.5 py-2 border border-slate-600 text-slate-200 hover:bg-slate-800 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0"
                  >
                    Enquire
                  </button>
                </div>
              </div>
              <div className="sm:col-span-5 aspect-[4/3] sm:aspect-auto bg-slate-900">
                <img
                  src={krashivantriXFieldImg}
                  alt="KRASHIVANTRI X Agricultural Drone"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#181C20] text-white overflow-hidden grid grid-cols-1 sm:grid-cols-12">
              <div className="sm:col-span-7 p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                    KRASHIVANTRI Flagship · Pro Edition
                  </div>
                  <h2 className="font-display text-2xl font-bold">KRASHIVANTRI X PRO</h2>
                  <p className="text-xs text-slate-300">Advanced Intelligence. Precision Agriculture.</p>
                  <div className="font-mono text-xl font-bold text-white tabular-nums pt-1">₹5,60,000</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/krashivantri-x-pro')}
                    className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    View Drone <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/krashivantri/compare')}
                    className="px-3.5 py-2 border border-slate-600 text-slate-200 hover:bg-slate-800 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0"
                  >
                    Compare X vs X PRO
                  </button>
                </div>
              </div>
              <div className="sm:col-span-5 aspect-[4/3] sm:aspect-auto bg-slate-900">
                <img
                  src={krashivantriXProImg}
                  alt="KRASHIVANTRI X PRO Agricultural Drone"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Featured Products Shelf */}
          {featuredProducts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-slate-950">Featured Products</h2>
                <button
                  type="button"
                  onClick={() => setQuickFilter('featured')}
                  className="text-xs font-semibold text-[#15803D] hover:underline"
                >
                  View Featured
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredProducts.slice(0, 4).map((fp) => {
                  const unit = fp.discountPriceInr ?? fp.priceInr;
                  return (
                    <div
                      key={`feat-${fp.id}`}
                      className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col justify-between gap-3 hover:border-emerald-400 transition-colors"
                    >
                      <button onClick={() => navigate(`/product/${fp.slug}`)} className="text-left space-y-2">
                        <img
                          src={fp.imageUrl}
                          alt={fp.name}
                          referrerPolicy="no-referrer"
                          className="w-full aspect-[4/3] object-cover rounded-lg bg-slate-100"
                        />
                        <div className="font-display font-semibold text-sm text-slate-950 line-clamp-1">{fp.name}</div>
                        <div className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                          {fp.priceInr > 0 ? `₹${unit.toLocaleString('en-IN')}` : 'Contact for Price'}
                        </div>
                      </button>
                      {fp.priceInr > 0 && fp.stockQty > 0 && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => addToCart(fp, 1, fp.availableVariants?.[0], fp.availableColors?.[0])}
                            className="flex-1 py-1.5 bg-[#111417] text-white rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0"
                          >
                            Add to Cart
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              addToCart(fp, 1, fp.availableVariants?.[0], fp.availableColors?.[0]);
                              navigate('/checkout');
                            }}
                            className="px-2.5 py-1.5 bg-[#15803D] text-white rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0"
                          >
                            Buy Now
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Best-Selling & Special Offers Shelves */}
          {(bestsellerProducts.length > 0 || catalogOffers.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bestsellerProducts.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-base font-bold text-slate-950">Best-Selling Hardware</h2>
                    <button
                      type="button"
                      onClick={() => setQuickFilter('bestseller')}
                      className="text-xs font-semibold text-[#15803D] hover:underline"
                    >
                      See All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {bestsellerProducts.slice(0, 4).map((bp) => (
                      <button
                        key={`bs-${bp.id}`}
                        onClick={() => navigate(`/product/${bp.slug}`)}
                        className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 flex items-center gap-3"
                      >
                        <img
                          src={bp.imageUrl}
                          alt={bp.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-14 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-display font-semibold text-xs text-slate-950 line-clamp-1">{bp.name}</div>
                          <div className="font-mono text-xs font-bold text-[#15803D] tabular-nums mt-0.5">
                            ₹{(bp.discountPriceInr ?? bp.priceInr).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {catalogOffers.length > 0 && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-base font-bold text-slate-950">Special Offers &amp; Discounts</h2>
                    <button
                      type="button"
                      onClick={() => navigate('/store/offers')}
                      className="text-xs font-semibold text-[#15803D] hover:underline"
                    >
                      View Offers
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {catalogOffers.slice(0, 4).map((op) => {
                      const pct =
                        op.discountPriceInr && op.priceInr > 0
                          ? Math.round(((op.priceInr - op.discountPriceInr) / op.priceInr) * 100)
                          : 0;
                      return (
                        <button
                          key={`off-${op.id}`}
                          onClick={() => navigate(`/product/${op.slug}`)}
                          className="text-left p-2.5 rounded-xl border border-emerald-200 bg-white hover:border-[#15803D] flex items-center gap-3"
                        >
                          <img
                            src={op.imageUrl}
                            alt={op.name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-14 rounded-lg object-cover bg-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-display font-semibold text-xs text-slate-950 line-clamp-1">{op.name}</div>
                            <div className="font-mono text-xs font-bold text-slate-950 tabular-nums mt-0.5">
                              ₹{(op.discountPriceInr ?? op.priceInr).toLocaleString('en-IN')}{' '}
                              {pct > 0 && <span className="text-[#15803D]">(-{pct}%)</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recommended & Recently Viewed Shelves */}
          {(newArrivalProducts.length > 0 || recentProducts.length > 0) && (
            <div className="space-y-6">
              {newArrivalProducts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold text-slate-950">Recommended For You</h2>
                    <button
                      type="button"
                      onClick={() => setQuickFilter('new_arrival')}
                      className="text-xs font-semibold text-[#15803D] hover:underline"
                    >
                      Explore New Arrivals
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {newArrivalProducts.slice(0, 4).map((rec) => (
                      <button
                        key={`rec-${rec.id}`}
                        onClick={() => navigate(`/product/${rec.slug}`)}
                        className="text-left rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-emerald-400"
                      >
                        <img
                          src={rec.imageUrl}
                          alt={rec.name}
                          referrerPolicy="no-referrer"
                          className="w-full aspect-[4/3] object-cover bg-slate-100"
                        />
                        <div className="p-3 space-y-1">
                          <div className="font-display font-semibold text-xs text-slate-950 line-clamp-1">{rec.name}</div>
                          <div className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                            {rec.priceInr > 0
                              ? `₹${(rec.discountPriceInr ?? rec.priceInr).toLocaleString('en-IN')}`
                              : 'Request Quote'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {recentProducts.length > 0 && (
                <div className="space-y-3">
                  <h2 className="font-display text-base font-bold text-slate-950 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#15803D]" /> Recently Viewed
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {recentProducts.map((rp) => (
                      <button
                        key={`rv-${rp.id}`}
                        onClick={() => navigate(`/product/${rp.slug}`)}
                        className="text-left rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-emerald-400"
                      >
                        <img
                          src={rp.imageUrl}
                          alt={rp.name}
                          referrerPolicy="no-referrer"
                          className="w-full aspect-[4/3] object-cover bg-slate-100"
                        />
                        <div className="p-3 space-y-0.5">
                          <div className="font-mono text-[10px] text-slate-500">{rp.sku}</div>
                          <div className="font-display font-semibold text-xs text-slate-950 line-clamp-1">{rp.name}</div>
                          <div className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                            {rp.priceInr > 0
                              ? `₹${(rp.discountPriceInr ?? rp.priceInr).toLocaleString('en-IN')}`
                              : 'Contact for Price'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-80 rounded-xl border border-slate-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <div className="font-display font-bold text-lg text-slate-900">No Matching Products</div>
          <p className="text-sm text-slate-600">Try clearing your search filters or explore custom 3D printing and project builds.</p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-[#111417] text-white text-xs font-semibold rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => {
            const isQuoteOnly = product.productType === 'quote_only' || product.priceInr <= 0;
            const hasDiscount =
              !isQuoteOnly &&
              product.discountPriceInr !== null &&
              product.discountPriceInr < product.priceInr &&
              product.priceInr > 0;
            const discountPct = hasDiscount
              ? Math.round(((product.priceInr - (product.discountPriceInr || 0)) / product.priceInr) * 100)
              : 0;
            const activePrice = hasDiscount ? product.discountPriceInr! : product.priceInr;
            const specEntries = Object.entries(product.technicalSpecs || {}).slice(0, 2);
            return (
              <div
                key={product.id}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between hover:border-emerald-400 transition-colors"
              >
                <div>
                  <div className="relative aspect-[4/3] bg-slate-100">
                    <button
                      onClick={() => navigate(`/product/${product.slug}`)}
                      className="block w-full h-full"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                    {hasDiscount && discountPct > 0 && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-[#15803D] text-white font-mono text-[11px] font-bold">
                        -{discountPct}%
                      </span>
                    )}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      aria-label="Save to wishlist"
                      className="absolute top-2.5 right-2.5 p-2 rounded-lg bg-white/90 border border-slate-200 text-slate-700 hover:text-red-600"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
                      <span className="font-mono">{product.sku}</span>
                      <span aria-hidden="true">·</span>
                      {isQuoteOnly ? (
                        <span className="text-[#15803D] font-medium">Request Quote</span>
                      ) : (
                        <span className={product.stockQty > 0 ? 'text-[#15803D] font-medium' : 'text-red-700 font-medium'}>
                          {product.stockQty > 0 ? `In Stock (${product.stockQty})` : 'Out of Stock'}
                        </span>
                      )}
                      {product.isBestseller && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#111417] font-semibold">Bestseller</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/product/${product.slug}`)}
                      className="text-left font-display font-semibold text-slate-950 hover:text-[#15803D] line-clamp-2"
                    >
                      {product.name}
                    </button>
                    {(product.shortDescription || product.description) && (
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {product.shortDescription || product.description}
                      </p>
                    )}
                    {specEntries.length > 0 && (
                      <div className="pt-1 border-t border-slate-100 space-y-0.5 text-[11px] text-slate-500">
                        {specEntries.map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-2 truncate">
                            <span className="truncate">{k}</span>
                            <span className="font-mono text-slate-700 truncate">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-0.5">
                      {product.ratingAvg && product.ratingAvg > 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          {product.ratingAvg} ({product.reviewCount || 0})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" /> Verified SKU
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2 font-mono tabular-nums pt-1">
                      {isQuoteOnly ? (
                        <span className="text-sm font-bold text-[#111417] font-sans">Contact for Price</span>
                      ) : (
                        <>
                          <span className="text-base font-bold text-slate-950">
                            ₹{activePrice.toLocaleString('en-IN')}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{product.priceInr.toLocaleString('en-IN')}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-5 space-y-2">
                  {isQuoteOnly ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/product/${product.slug}`)}
                        className="flex-1 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigate(`/product/${product.slug}#quote`)}
                        className="flex-1 py-2 bg-[#15803D] hover:bg-[#166534] text-white rounded-lg text-xs font-semibold whitespace-nowrap"
                      >
                        Enquire
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <button
                          disabled={product.stockQty <= 0}
                          onClick={() => addToCart(product, 1, product.availableVariants[0], product.availableColors[0])}
                          className="flex-1 py-2 bg-[#111417] hover:bg-[#1E242B] text-white rounded-lg text-xs font-semibold disabled:opacity-40 whitespace-nowrap"
                        >
                          Add to Cart
                        </button>
                        <button
                          disabled={product.stockQty <= 0}
                          onClick={() => {
                            addToCart(product, 1, product.availableVariants[0], product.availableColors[0]);
                            navigate('/checkout');
                          }}
                          className="py-2 px-3 border border-[#15803D] text-[#15803D] hover:bg-emerald-50 rounded-lg text-xs font-semibold disabled:opacity-40 whitespace-nowrap"
                        >
                          Buy Now
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/product/${product.slug}`)}
                          className="flex-1 py-1.5 border border-slate-200 hover:border-slate-400 text-slate-700 rounded-lg text-[11px] font-medium whitespace-nowrap"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => navigate(`/product/${product.slug}#quote`)}
                          className="px-3 py-1.5 border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-[#15803D] rounded-lg text-[11px] font-semibold whitespace-nowrap"
                        >
                          Enquire
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold border ${
                p === page ? 'bg-[#111417] text-white border-[#111417]' : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const ProductDetailPage: React.FC<{ slug: string }> = ({ slug }) => {
  const { apiFetch, addToCart, navigate, isSignedIn, dbUser, notify, settings } = usePlatform();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<
    Array<{ id: number; authorName: string; rating: number; comment: string; verifiedPurchase: boolean; createdAt: string }>
  >([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [boughtTogether, setBoughtTogether] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<RecentProductSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState<string | undefined>();
  const [color, setColor] = useState<string | undefined>();
  const [activeImage, setActiveImage] = useState('');
  const [zoomOpen, setZoomOpen] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Delivery PIN Code Checker State
  const [pinCode, setPinCode] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinResult, setPinResult] = useState<{
    serviceable: boolean;
    pinCode: string;
    estimatedDays: string;
    originCity: string;
    shippingFeeInr: number;
    qualifiesFreeShipping: boolean;
  } | null>(null);
  const [pinError, setPinError] = useState('');

  // Quote Modal State
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    customerName: dbUser?.fullName || '',
    customerEmail: dbUser?.email || '',
    customerPhone: dbUser?.mobile || '',
    companyOrCollege: dbUser?.companyOrCollege || '',
    quantity: 1,
    message: '',
  });
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [quoteRef, setQuoteRef] = useState('');

  useEffect(() => {
    if (dbUser) {
      setQuoteForm((prev) => ({
        ...prev,
        customerName: prev.customerName || dbUser.fullName,
        customerEmail: prev.customerEmail || dbUser.email,
        customerPhone: prev.customerPhone || dbUser.mobile,
        companyOrCollege: prev.companyOrCollege || dbUser.companyOrCollege,
      }));
    }
  }, [dbUser]);

  const load = async () => {
    setLoading(true);
    setPinResult(null);
    setPinError('');
    setQuoteRef('');
    try {
      const data = await apiFetch<{
        product: Product;
        reviews: any[];
        related: Product[];
        boughtTogether?: Product[];
      }>(`/api/products/${slug}`);
      setProduct(data.product);
      setReviews(data.reviews || []);
      setRelated(data.related || []);
      setBoughtTogether(data.boughtTogether || []);
      setVariant(data.product.availableVariants?.[0]);
      setColor(data.product.availableColors?.[0]);
      setActiveImage(data.product.imageUrl);

      try {
        const stored: RecentProductSnapshot[] = JSON.parse(
          localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]'
        );
        const currentSnap: RecentProductSnapshot = {
          id: data.product.id,
          slug: data.product.slug,
          name: data.product.name,
          sku: data.product.sku,
          imageUrl: data.product.imageUrl,
          priceInr: data.product.priceInr,
          discountPriceInr: data.product.discountPriceInr,
          productType: data.product.productType,
        };
        const nextStored = [
          currentSnap,
          ...stored.filter((x) => x.id !== data.product.id),
        ].slice(0, 8);
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(nextStored));
        setRecentProducts(nextStored.filter((x) => x.id !== data.product.id).slice(0, 4));
      } catch {
        // ignore storage errors
      }
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    setQuoteModalOpen(window.location.hash === '#quote');
    const onHashChange = () => {
      if (window.location.hash === '#quote') {
        setQuoteModalOpen(true);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [slug]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list = [product.imageUrl, ...(product.galleryUrls || [])].filter(Boolean);
    return Array.from(new Set(list));
  }, [product]);

  const handleCheckPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinResult(null);
    setPinLoading(true);
    try {
      const activeUnit = product
        ? product.discountPriceInr !== null && product.discountPriceInr < product.priceInr
          ? product.discountPriceInr
          : product.priceInr
        : 0;
      const res = await apiFetch<typeof pinResult>('/api/shipping/check-pin', {
        method: 'POST',
        body: JSON.stringify({ pinCode: pinCode.trim(), subtotalInr: activeUnit * qty }),
      });
      setPinResult(res);
    } catch (err: any) {
      setPinError(err?.message || 'Enter a valid 6-digit Indian PIN code.');
    } finally {
      setPinLoading(false);
    }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setQuoteBusy(true);
    try {
      const res = await apiFetch<{ referenceNumber: string }>('/api/product-quote-enquiry', {
        method: 'POST',
        body: JSON.stringify({
          ...quoteForm,
          productName: product.name,
          sku: product.sku,
        }),
      });
      setQuoteRef(res.referenceNumber);
      notify(`Quote request ${res.referenceNumber} submitted!`, 'success');
    } catch (err: any) {
      notify(err?.message || 'Failed to submit quote request.', 'error');
    } finally {
      setQuoteBusy(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !isSignedIn) return;
    try {
      await apiFetch('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, rating: reviewRating, comment: reviewComment }),
      });
      setReviewComment('');
      notify('Verified-purchase review published.', 'success');
      load();
    } catch (err: any) {
      notify(err?.message || 'Unable to submit review.', 'error');
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
    if (!isSignedIn) {
      notify('Please sign in to save items to your wishlist.', 'info');
      return;
    }
    try {
      const res = await apiFetch<{ wishlisted: boolean }>('/api/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id }),
      });
      notify(res.wishlisted ? 'Saved to wishlist.' : 'Removed from wishlist.', 'success');
    } catch (err: any) {
      notify(err?.message || 'Wishlist update failed.', 'error');
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-sm text-slate-500">Loading product specifications...</div>;
  }
  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold">Product Not Found</h1>
        <button onClick={() => navigate('/store')} className="px-4 py-2 bg-[#111417] text-white rounded-lg text-sm">
          Return to Store
        </button>
      </div>
    );
  }

  const isQuoteOnly = product.productType === 'quote_only' || product.priceInr <= 0;
  const activePrice =
    product.discountPriceInr !== null && product.discountPriceInr < product.priceInr
      ? product.discountPriceInr
      : product.priceInr;
  const discountPct =
    !isQuoteOnly && product.discountPriceInr !== null && product.discountPriceInr < product.priceInr && product.priceInr > 0
      ? Math.round(((product.priceInr - product.discountPriceInr) / product.priceInr) * 100)
      : 0;

  const bundleItems = [product, ...boughtTogether].filter(
    (item) => item.stockQty > 0 && item.productType !== 'quote_only' && item.priceInr > 0
  );
  const bundleTotal = bundleItems.reduce(
    (sum, item) => sum + (item.discountPriceInr ?? item.priceInr),
    0
  );
  const avgRating =
    reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-14">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
        <button onClick={() => navigate('/')} className="hover:text-[#15803D]">Home</button>
        <span>/</span>
        <button onClick={() => navigate('/store')} className="hover:text-[#15803D]">Store</button>
        {product.subcategory && (
          <>
            <span>/</span>
            <span className="text-slate-700">{product.subcategory}</span>
          </>
        )}
        <span>/</span>
        <span className="text-slate-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* 3-Column Buy & Enquiry Experience */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Column 1: Left Sticky Image Gallery (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-white">
            <img
              src={activeImage || product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              aria-label="Zoom product image"
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#111417]/85 text-white text-xs font-medium inline-flex items-center gap-1.5 hover:bg-[#111417]"
            >
              <ZoomIn className="w-3.5 h-3.5" /> Zoom Image
            </button>
          </div>

          {galleryImages.length > 1 && (
            <div className="flex flex-wrap gap-2.5">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={`${imgUrl}-${idx}`}
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-18 h-14 rounded-lg overflow-hidden border-2 bg-white ${
                    (activeImage || product.imageUrl) === imgUrl
                      ? 'border-[#15803D]'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} view ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {product.videoUrl && (
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Play className="w-4 h-4 text-[#15803D] shrink-0" />
                <span className="font-medium">Product Demonstration Video</span>
              </div>
              <a
                href={product.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#15803D] hover:underline whitespace-nowrap"
              >
                Watch Demo
              </a>
            </div>
          )}

          {product.model3dUrl && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#111417]">
                <Box className="w-4 h-4 text-[#15803D] shrink-0" />
                <span className="font-medium">3D CAD Reference Model Available</span>
              </div>
              <a
                href={product.model3dUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#15803D] hover:underline whitespace-nowrap"
              >
                Open 3D Asset
              </a>
            </div>
          )}
        </div>

        {/* Column 2: Middle Product Overview & Key Specs (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="border-b border-slate-200 pb-4 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#15803D] font-semibold">
              <span>Brand: {product.brand}</span>
              {product.modelNumber && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="font-mono text-slate-600">Model: {product.modelNumber}</span>
                </>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 leading-tight">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="font-mono">SKU: {product.sku}</span>
              {avgRating ? (
                <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-500" /> {avgRating} ({reviews.length} reviews)
                </span>
              ) : (
                <span>No reviews yet</span>
              )}
            </div>
          </div>

          {(product.shortDescription || product.description) && (
            <p className="text-sm text-slate-700 leading-relaxed">
              {product.shortDescription || product.description}
            </p>
          )}

          {product.features && product.features.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Key Features
              </div>
              <ul className="space-y-1.5 text-sm text-slate-700">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Object.keys(product.technicalSpecs || {}).length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Quick Specifications
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {Object.entries(product.technicalSpecs).slice(0, 6).map(([k, v]) => (
                  <div key={k} className="py-1.5 flex justify-between gap-3">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-mono font-medium text-slate-900 text-right">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(product.datasheetUrl || product.brochureUrl) && (
            <div className="flex flex-wrap gap-2.5 pt-1">
              {product.brochureUrl && (
                <a
                  href={product.brochureUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 inline-flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-[#15803D]" /> Download Brochure
                </a>
              )}
              {product.datasheetUrl && (
                <a
                  href={product.datasheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 inline-flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-[#15803D]" /> Technical Datasheet
                </a>
              )}
            </div>
          )}
        </div>

        {/* Column 3: Right Contiguous Buy Box & PIN Checker (3 cols) */}
        <div className="lg:col-span-3 lg:sticky lg:top-24 rounded-xl border border-slate-200 bg-white p-5 space-y-5 shadow-sm">
          {/* Price Block */}
          <div className="space-y-1 border-b border-slate-100 pb-4">
            {isQuoteOnly ? (
              <>
                <div className="text-xs font-mono uppercase text-[#15803D] font-semibold">Custom Quotation Model</div>
                <div className="font-display text-2xl font-bold text-[#111417]">Contact for Price</div>
                <div className="text-xs text-slate-500">Official commercial quote from NexusTekFusion Nagpur</div>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-2 font-mono tabular-nums">
                  <span className="text-2xl font-bold text-slate-950">₹{activePrice.toLocaleString('en-IN')}</span>
                  {discountPct > 0 && (
                    <span className="text-xs font-semibold text-[#15803D]">Save {discountPct}%</span>
                  )}
                </div>
                {product.discountPriceInr !== null && product.discountPriceInr < product.priceInr && (
                  <div className="text-xs text-slate-400 font-mono">
                    M.R.P.: <span className="line-through">₹{product.priceInr.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="text-xs text-slate-500">
                  Inclusive pricing note: +{product.gstPercent}% GST calculated at checkout
                </div>
                <div className={`text-xs font-semibold pt-1 ${product.stockQty > 0 ? 'text-[#15803D]' : 'text-red-700'}`}>
                  {product.stockQty > 0 ? `In Stock (${product.stockQty} available)` : 'Currently Out of Stock'}
                </div>
              </>
            )}
          </div>

          {/* Variants & Colors */}
          {product.availableVariants?.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-slate-600">Configuration / Variant</div>
              <div className="flex flex-wrap gap-1.5">
                {product.availableVariants.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVariant(v)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${
                      variant === v ? 'border-[#15803D] bg-emerald-50 text-emerald-950' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.availableColors?.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-slate-600">Finish / Colour</div>
              <div className="flex flex-wrap gap-1.5">
                {product.availableColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${
                      color === c ? 'border-[#15803D] bg-emerald-50 text-emerald-950' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isQuoteOnly ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <label className="font-medium text-slate-600">Quantity:</label>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, product.stockQty)}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  className="w-20 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-mono"
                />
              </div>
              <button
                disabled={product.stockQty <= 0}
                onClick={() => addToCart(product, qty, variant, color)}
                className="w-full py-2.5 px-4 border border-[#111417] text-[#111417] hover:bg-slate-50 rounded-lg text-xs font-semibold disabled:opacity-40 inline-flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
              </button>
              <button
                disabled={product.stockQty <= 0}
                onClick={() => {
                  addToCart(product, qty, variant, color);
                  navigate('/checkout');
                }}
                className="w-full py-2.5 px-4 bg-[#15803D] hover:bg-[#166534] text-white rounded-lg text-xs font-semibold disabled:opacity-40 inline-flex items-center justify-center gap-1.5"
              >
                Buy Now <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setQuoteModalOpen(true)}
                className="w-full py-2 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" /> Bulk / B2B Quote Request
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setQuoteModalOpen(true)}
                className="w-full py-3 px-4 bg-[#15803D] hover:bg-[#166534] text-white rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2"
              >
                <MessageSquarePlus className="w-4 h-4" /> Request a Quote
              </button>
              <button
                type="button"
                onClick={() => navigate('/krashivantri#compare')}
                className="w-full py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Compare KRASHIVANTRI Models
              </button>
            </div>
          )}

          {/* Save to Wishlist */}
          <button
            type="button"
            onClick={toggleWishlist}
            className="w-full py-2 text-xs font-medium text-slate-600 hover:text-red-600 inline-flex items-center justify-center gap-1.5 border-t border-slate-100 pt-3"
          >
            <Heart className="w-3.5 h-3.5" /> Save to Wishlist
          </button>

          {/* Indian PIN Code Delivery Checker */}
          <div className="border-t border-slate-200 pt-4 space-y-2.5">
            <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#15803D]" /> Check Delivery Availability
            </div>
            <form onSubmit={handleCheckPin} className="flex gap-1.5">
              <input
                type="text"
                maxLength={6}
                placeholder="6-digit PIN"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="flex-1 min-w-0 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono"
              />
              <button
                type="submit"
                disabled={pinLoading}
                className="px-3 py-1.5 bg-[#111417] text-white text-xs font-semibold rounded-lg disabled:opacity-50"
              >
                {pinLoading ? '...' : 'Check'}
              </button>
            </form>
            {pinError && <div className="text-[11px] text-red-700">{pinError}</div>}
            {pinResult && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-[11px] text-[#111417] space-y-1">
                <div className="font-semibold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#15803D]" />
                  Deliverable to {pinResult.pinCode} in {pinResult.estimatedDays}
                </div>
                <div className="text-slate-600">
                  {pinResult.qualifiesFreeShipping
                    ? 'Qualifies for FREE standard shipping.'
                    : `Shipping: ₹${pinResult.shippingFeeInr} (Free above ₹${settings.shippingConfig?.freeShippingAboveInr ?? 2500})`}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
              Dispatched from Nagpur Lab ({product.productionTimeDays} business day lead time)
            </div>
            {product.warrantyInfo && <div>Warranty: {product.warrantyInfo}</div>}
          </div>
        </div>
      </div>

      {/* Detailed Description, Technical Specs & Box Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5">
          <h2 className="font-display text-xl font-bold text-slate-950">Product Description &amp; Engineering Notes</h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{product.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs text-slate-600">
            {product.compatibility && (
              <div>
                <div className="font-semibold text-[#15803D] mb-1">Compatibility</div>
                <p>{product.compatibility}</p>
              </div>
            )}
            {product.applications && (
              <div>
                <div className="font-semibold text-[#15803D] mb-1">Target Applications</div>
                <p>{product.applications}</p>
              </div>
            )}
            {product.dimensions && (
              <div>
                <div className="font-semibold text-slate-900 mb-0.5">Dimensions</div>
                <div className="font-mono">{product.dimensions}</div>
              </div>
            )}
            {product.material && (
              <div>
                <div className="font-semibold text-slate-900 mb-0.5">Construction Material</div>
                <div>{product.material}</div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          {product.packageContents && product.packageContents.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
              <h2 className="font-display text-lg font-bold text-slate-950 flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-[#15803D]" /> What&apos;s Included in the Box
              </h2>
              <ul className="text-sm text-slate-700 space-y-1.5 list-disc list-inside">
                {product.packageContents.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2">
            <h2 className="font-display text-lg font-bold text-slate-950">Shipping, Warranty &amp; Support</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {product.deliveryInfo ||
                'Dispatched securely from NexusTekFusion Private Limited, Nagpur with antistatic / protective engineering packaging.'}
            </p>
            {product.warrantyInfo && (
              <p className="text-xs text-slate-700 font-medium pt-1">Warranty: {product.warrantyInfo}</p>
            )}
            <div className="pt-2 border-t border-slate-100">
              <a
                href={`mailto:${settings.companyInfo?.customerCareEmail || 'info@nexustekfusion.in'}?subject=${encodeURIComponent(`Product Support: ${product.name} (${product.sku})`)}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D] hover:underline"
              >
                <Mail className="w-3.5 h-3.5" /> Contact Customer Support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Bought Together */}
      {boughtTogether.length > 0 && !isQuoteOnly && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="text-xs font-semibold text-[#15803D]">System Integration Bundle</div>
              <h2 className="font-display text-xl font-bold text-slate-950">Frequently Bought Together</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-mono text-sm font-bold text-slate-950 tabular-nums">
                Bundle Total: ₹{bundleTotal.toLocaleString('en-IN')}
              </div>
              <button
                type="button"
                onClick={() => {
                  bundleItems.forEach((b) =>
                    addToCart(b, 1, b.availableVariants?.[0], b.availableColors?.[0])
                  );
                  notify(`Added ${bundleItems.length} bundle items to cart.`, 'success');
                }}
                className="px-4 py-2 bg-[#111417] hover:bg-[#1E242B] text-white text-xs font-semibold rounded-lg whitespace-nowrap"
              >
                Add Bundle ({bundleItems.length} Items)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {bundleItems.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => navigate(`/product/${b.slug}`)}
                className="text-left flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-[#15803D] transition-colors"
              >
                <img
                  src={b.imageUrl}
                  alt={b.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-14 rounded-md object-cover bg-slate-100 shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-display font-semibold text-xs text-slate-950 line-clamp-2">{b.name}</div>
                  <div className="font-mono text-xs font-bold text-slate-700 mt-0.5 tabular-nums">
                    ₹{(b.discountPriceInr ?? b.priceInr).toLocaleString('en-IN')}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full Technical Specifications & Customer Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-950">Full Technical Specifications</h2>
          {Object.keys(product.technicalSpecs || {}).length === 0 ? (
            <p className="text-sm text-slate-500">
              Specifications Coming Soon — Official technical sheets can be requested via the &quot;Request a Quote&quot; button.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 text-sm">
              {Object.entries(product.technicalSpecs || {}).map(([k, v]) => (
                <div key={k} className="py-2.5 flex justify-between gap-4">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-mono text-slate-900 text-right">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-950">Verified Customer Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-500">No verified-purchase reviews yet for this item.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-slate-100 pb-3 space-y-1">
                  <div className="text-xs font-semibold text-slate-900">
                    {r.authorName} · {r.rating}/5 {r.verifiedPurchase ? '· Verified Purchase' : ''}
                  </div>
                  <p className="text-sm text-slate-600">{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          {isSignedIn && (
            <form onSubmit={handleReviewSubmit} className="border-t border-slate-200 pt-4 space-y-3">
              <div className="text-xs font-semibold text-slate-700">Leave a Verified Purchase Review</div>
              <div className="flex gap-2">
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} Stars</option>
                  ))}
                </select>
                <input
                  required
                  placeholder="Share product performance notes..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                />
                <button type="submit" className="px-3 py-1.5 bg-[#111417] text-white text-xs font-semibold rounded-lg">
                  Submit
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Product FAQs Accordion */}
      {product.productFaqs && product.productFaqs.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-950">Engineering Questions &amp; Answers</h2>
          <div className="divide-y divide-slate-200">
            {product.productFaqs.map((faq, idx) => (
              <div key={idx} className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 py-1"
                >
                  <span className="font-semibold text-sm text-slate-900">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      openFaqIdx === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaqIdx === idx && (
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-slate-950">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((rel) => {
              const relQuote = rel.productType === 'quote_only' || rel.priceInr <= 0;
              return (
                <button
                  key={rel.id}
                  onClick={() => navigate(`/product/${rel.slug}`)}
                  className="text-left rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-[#15803D] transition-colors"
                >
                  <div className="aspect-[4/3] bg-slate-100">
                    <img src={rel.imageUrl} alt={rel.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-1">
                    <div className="font-display font-semibold text-sm text-slate-950 line-clamp-1">{rel.name}</div>
                    <div className="font-mono text-xs font-bold text-slate-700 tabular-nums">
                      {relQuote ? 'Contact for Price' : `₹${(rel.discountPriceInr ?? rel.priceInr).toLocaleString('en-IN')}`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {recentProducts.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-950">Recently Viewed</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentProducts.map((rp) => {
              const rpQuote = rp.productType === 'quote_only' || rp.priceInr <= 0;
              return (
                <button
                  key={rp.id}
                  onClick={() => navigate(`/product/${rp.slug}`)}
                  className="text-left rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-[#15803D] transition-colors"
                >
                  <div className="aspect-[4/3] bg-slate-100">
                    <img src={rp.imageUrl} alt={rp.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 space-y-0.5">
                    <div className="font-mono text-[11px] text-slate-500">{rp.sku}</div>
                    <div className="font-display font-semibold text-xs text-slate-950 line-clamp-1">{rp.name}</div>
                    <div className="font-mono text-xs font-bold text-slate-800 tabular-nums">
                      {rpQuote ? 'Contact for Price' : `₹${(rp.discountPriceInr ?? rp.priceInr).toLocaleString('en-IN')}`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {zoomOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoom modal"
            className="absolute top-5 right-5 p-2 rounded-lg bg-white text-slate-950"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={activeImage || product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[85vh] rounded-xl object-contain bg-white"
          />
        </div>
      )}

      {/* Request a Quote Modal */}
      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-[#111417] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-mono text-emerald-300">Commercial &amp; Technical Quote</div>
                <h3 className="font-display font-bold text-base">{product.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setQuoteModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {quoteRef ? (
              <div className="p-6 space-y-4">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-1 text-sm text-[#111417]">
                  <div className="font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
                    Quote Request Submitted — {quoteRef}
                  </div>
                  <p className="text-xs text-slate-700">
                    Your enquiry has been routed to our sales &amp; engineering CRM team. We will send official pricing and technical datasheets shortly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setQuoteModalOpen(false)}
                  className="w-full py-2.5 bg-[#111417] text-white text-xs font-semibold rounded-lg"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="p-6 space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="Full Name *"
                    value={quoteForm.customerName}
                    onChange={(e) => setQuoteForm({ ...quoteForm, customerName: e.target.value })}
                    className="rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email Address *"
                    value={quoteForm.customerEmail}
                    onChange={(e) => setQuoteForm({ ...quoteForm, customerEmail: e.target.value })}
                    className="rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <input
                    required
                    placeholder="Mobile Number *"
                    value={quoteForm.customerPhone}
                    onChange={(e) => setQuoteForm({ ...quoteForm, customerPhone: e.target.value })}
                    className="rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <input
                    placeholder="Company / Organization"
                    value={quoteForm.companyOrCollege}
                    onChange={(e) => setQuoteForm({ ...quoteForm, companyOrCollege: e.target.value })}
                    className="rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-slate-600">Requested Quantity:</label>
                  <input
                    type="number"
                    min={1}
                    value={quoteForm.quantity}
                    onChange={(e) => setQuoteForm({ ...quoteForm, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 font-mono"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Share deployment details, fleet size, customization requirements, or delivery city..."
                  value={quoteForm.message}
                  onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setQuoteModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={quoteBusy}
                    className="px-5 py-2 bg-[#15803D] hover:bg-[#166534] text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                  >
                    {quoteBusy ? 'Submitting...' : 'Submit Quote Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const CartPage: React.FC = () => {
  const { cart, updateCartQty, removeFromCart, navigate, settings } = usePlatform();
  const customerCareEmail = settings.companyInfo?.customerCareEmail || 'info@nexustekfusion.in';
  const subtotal = cart.reduce((s, i) => {
    const unit = i.product.discountPriceInr ?? i.product.priceInr;
    return s + unit * i.qty;
  }, 0);
  const freeAbove = settings.shippingConfig?.freeShippingAboveInr ?? 2500;
  const shipping = subtotal === 0 ? 0 : subtotal >= freeAbove ? 0 : (settings.shippingConfig?.standardShippingInr ?? 99);
  const gst = cart.reduce((s, i) => {
    const unit = i.product.discountPriceInr ?? i.product.priceInr;
    return s + Math.round((unit * i.qty * i.product.gstPercent) / 100);
  }, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <h1 className="font-display text-3xl font-bold text-slate-950">Store Cart</h1>

      {cart.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-4">
          <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
          <div className="font-display font-bold text-lg">Your store cart is empty</div>
          <button
            onClick={() => navigate('/store')}
            className="px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-sm font-semibold rounded-lg"
          >
            Browse Store
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => {
              const unit = item.product.discountPriceInr ?? item.product.priceInr;
              return (
                <div
                  key={`${item.product.id}-${item.variant}-${item.color}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-4"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="font-display font-semibold text-slate-950 truncate">{item.product.name}</div>
                    <div className="text-xs text-slate-500">
                      {[item.variant, item.color].filter(Boolean).join(' · ') || item.product.sku}
                    </div>
                    <div className="font-mono text-sm font-bold text-slate-900">
                      ₹{unit.toLocaleString('en-IN')} × {item.qty}
                    </div>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={item.product.stockQty}
                    value={item.qty}
                    onChange={(e) =>
                      updateCartQty(item.product.id, item.variant, item.color, Number(e.target.value))
                    }
                    className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-mono"
                  />
                  <button
                    onClick={() => removeFromCart(item.product.id, item.variant, item.color)}
                    className="p-2 text-slate-400 hover:text-red-600"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-4 space-y-4 h-fit">
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <h2 className="font-display font-bold text-lg text-slate-950">Order Summary</h2>
              <div className="space-y-2 text-sm text-slate-600 font-mono tabular-nums">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span>GST</span><span>₹{gst.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-950 text-base">
                  <span>Total</span>
                  <span>₹{(subtotal + gst + shipping).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3 bg-[#15803D] hover:bg-[#166534] text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1.5">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#15803D]" /> Customer Care Support
              </div>
              <p>Questions about delivery, bulk orders, or product compatibility?</p>
              <a
                href={`mailto:${customerCareEmail}?subject=${encodeURIComponent('Cart / Order Enquiry — NexusTekFusion')}`}
                className="inline-block font-mono font-semibold text-[#15803D] hover:underline"
              >
                {customerCareEmail}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    clearCart,
    isSignedIn,
    dbUser,
    openAuthModal,
    startGuestSession,
    apiFetch,
    notify,
    navigate,
    settings,
  } = usePlatform();
  const customerCareEmail = settings.companyInfo?.customerCareEmail || 'info@nexustekfusion.in';
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(() => (isSignedIn ? 2 : 1));
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [shippingAddress, setShippingAddress] = useState<AddressData | null>(null);
  const [billingAddress, setBillingAddress] = useState<AddressData | null>(null);
  const [sameBilling, setSameBilling] = useState(true);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestAddress, setGuestAddress] = useState({
    fullName: '',
    mobile: '',
    houseFlat: '',
    streetArea: '',
    landmark: '',
    city: '',
    district: '',
    state: '',
    pinCode: '',
    country: 'India',
  });
  const [couponCode, setCouponCode] = useState('');
  const [discountInr, setDiscountInr] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [placing, setPlacing] = useState(false);
  const checkoutLockRef = useRef(false);
  const [createdOrder, setCreatedOrder] = useState<{ id: number; orderNumber: string; totalInr: number } | null>(null);
  const [confirmedInvoice, setConfirmedInvoice] = useState<any>(null);
  const [payOpen, setPayOpen] = useState(false);

  const loadAddresses = async () => {
    if (!isSignedIn) return;
    try {
      const me = await apiFetch<{ addresses: AddressData[] }>('/api/me');
      setAddresses(me.addresses || []);
      if (me.addresses?.length > 0 && !shippingAddress) {
        const def = me.addresses.find((a) => a.isDefault) || me.addresses[0];
        setShippingAddress(def);
        setBillingAddress(def);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadAddresses();
    if (isSignedIn && step === 1) {
      setStep(2);
    }
  }, [isSignedIn]);

  const subtotal = cart.reduce((s, i) => s + (i.product.discountPriceInr ?? i.product.priceInr) * i.qty, 0);
  const freeAbove = settings.shippingConfig?.freeShippingAboveInr ?? 2500;
  const shipping = subtotal === 0 ? 0 : subtotal >= freeAbove ? 0 : (settings.shippingConfig?.standardShippingInr ?? 99);
  const gst = cart.reduce((s, i) => {
    const unit = i.product.discountPriceInr ?? i.product.priceInr;
    return s + Math.round((unit * i.qty * i.product.gstPercent) / 100);
  }, 0);
  const total = Math.max(1, subtotal - discountInr + shipping + gst);

  const activeShipping = isSignedIn ? shippingAddress : guestAddress;

  const validateAddressAndContinue = () => {
    const chosen = activeShipping;
    if (
      !chosen ||
      !chosen.fullName?.trim() ||
      !chosen.mobile?.trim() ||
      !chosen.houseFlat?.trim() ||
      !chosen.streetArea?.trim() ||
      !chosen.city?.trim() ||
      !chosen.state?.trim() ||
      !/^\d{6}$/.test(String(chosen.pinCode || '').trim())
    ) {
      notify('Please select or complete a valid Indian delivery address with a 6-digit PIN code.', 'error');
      return;
    }
    if (!isSignedIn && (!guestEmail.trim() || !guestEmail.includes('@'))) {
      notify('Please enter a valid email address in Step 1 or Delivery Details.', 'error');
      return;
    }
    setStep(3);
  };

  const applyCoupon = async () => {
    try {
      const res = await apiFetch<{ discountInr: number; coupon: { code: string } }>('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: couponCode, subtotalInr: subtotal }),
      });
      setDiscountInr(res.discountInr);
      setAppliedCoupon(res.coupon.code);
      notify(`Coupon ${res.coupon.code} applied (-₹${res.discountInr}).`, 'success');
    } catch (err: any) {
      notify(err?.message || 'Invalid coupon.', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (checkoutLockRef.current || placing) return;
    const chosenShipping = isSignedIn && shippingAddress ? shippingAddress : guestAddress;
    if (
      !chosenShipping.fullName ||
      !chosenShipping.mobile ||
      !chosenShipping.houseFlat ||
      !chosenShipping.streetArea ||
      !chosenShipping.city ||
      !chosenShipping.state ||
      !chosenShipping.pinCode
    ) {
      notify('Please complete all required delivery address fields.', 'error');
      setStep(2);
      return;
    }
    if (!isSignedIn && (!guestEmail.trim() || !guestEmail.includes('@'))) {
      notify('Please enter your email address for order tracking & GST invoice delivery.', 'error');
      setStep(1);
      return;
    }

    checkoutLockRef.current = true;
    setPlacing(true);
    try {
      const payload = {
        items: cart.map((i) => ({
          productId: i.product.id,
          qty: i.qty,
          variant: i.variant,
          color: i.color,
        })),
        shippingAddress: chosenShipping,
        billingAddress:
          isSignedIn && shippingAddress
            ? sameBilling
              ? shippingAddress
              : billingAddress || shippingAddress
            : chosenShipping,
        couponCode: appliedCoupon,
        customerEmail: isSignedIn ? undefined : guestEmail.trim(),
      };

      const res = await apiFetch<{
        order: { id: number; orderNumber: string; totalInr: number };
        sessionToken?: string;
        user?: any;
      }>(isSignedIn && shippingAddress ? '/api/store-orders' : '/api/express-checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.sessionToken && res.user) {
        startGuestSession(res.sessionToken, res.user);
      }

      setCreatedOrder(res.order);
      setStep(5);
      setPayOpen(true);
    } catch (err: any) {
      notify(err?.message || 'Checkout failed.', 'error');
    } finally {
      checkoutLockRef.current = false;
      setPlacing(false);
    }
  };

  const handlePaymentConfirmed = async () => {
    clearCart();
    if (createdOrder) {
      try {
        const me = await apiFetch<{ invoices: any[] }>('/api/me');
        const inv = (me.invoices || []).find(
          (x: any) => x.entityType === 'store_order' && x.entityId === createdOrder.id
        );
        if (inv) setConfirmedInvoice(inv);
      } catch {
        // non-blocking
      }
    }
    setStep(6);
  };

  if (cart.length === 0 && !createdOrder && step < 6) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold">No Items in Cart</h1>
        <button
          onClick={() => navigate('/store')}
          className="px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white rounded-lg text-sm font-semibold"
        >
          Go to Store
        </button>
      </div>
    );
  }

  const CHECKOUT_STEPS: Array<{ num: 1 | 2 | 3 | 4 | 5 | 6; label: string }> = [
    { num: 1, label: 'Account' },
    { num: 2, label: 'Delivery Address' },
    { num: 3, label: 'Order Summary' },
    { num: 4, label: 'Payment Method' },
    { num: 5, label: 'Razorpay Pay' },
    { num: 6, label: 'Confirmed' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="text-xs font-semibold text-[#15803D]">Secure 6-Step Storefront Checkout</div>
          <h1 className="font-display text-3xl font-bold text-slate-950">Checkout &amp; Payment</h1>
        </div>
        <a
          href={`mailto:${customerCareEmail}?subject=${encodeURIComponent('Checkout & Order Customer Care')}`}
          className="text-xs font-mono font-semibold text-[#15803D] hover:underline inline-flex items-center gap-1.5"
        >
          <Mail className="w-3.5 h-3.5" /> {customerCareEmail}
        </a>
      </div>

      {/* 6-Step Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {CHECKOUT_STEPS.map((s) => {
          const reached = s.num <= step;
          const active = s.num === step;
          const clickable = s.num < step && step < 5;
          return (
            <button
              key={s.num}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && setStep(s.num)}
              className={`p-3 rounded-xl border text-left transition-colors ${
                active
                  ? 'border-[#15803D] bg-emerald-50 text-[#111417]'
                  : reached
                  ? 'border-emerald-200 bg-white text-slate-800'
                  : 'border-slate-200 bg-slate-50 text-slate-400'
              } ${clickable ? 'cursor-pointer hover:border-[#15803D]' : 'cursor-default'}`}
            >
              <div className="font-mono text-[10px] font-bold">STEP {s.num}</div>
              <div className="text-xs font-semibold truncate">{s.label}</div>
            </button>
          );
        })}
      </div>

      {/* Step 6: Order Confirmation */}
      {step === 6 && createdOrder ? (
        <div className="rounded-2xl border border-emerald-200 bg-white p-8 max-w-3xl mx-auto space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#15803D] shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold uppercase text-[#15803D]">Order Confirmed &amp; Payment Verified</div>
              <h2 className="font-display text-2xl font-bold text-slate-950">
                Thank you! Order {createdOrder.orderNumber} is Confirmed
              </h2>
              <p className="text-sm text-slate-600">
                Verified Total: <span className="font-mono font-bold text-slate-950">₹{createdOrder.totalInr.toLocaleString('en-IN')}</span>.
                Your shipment has been queued for processing at NexusTekFusion Private Limited, Nagpur.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={async () => {
                let inv = confirmedInvoice;
                if (!inv) {
                  try {
                    const me = await apiFetch<{ invoices: any[] }>('/api/me');
                    inv = (me.invoices || []).find(
                      (x: any) => x.entityType === 'store_order' && x.entityId === createdOrder.id
                    );
                    if (inv) setConfirmedInvoice(inv);
                  } catch {
                    // ignore
                  }
                }
                if (inv) {
                  await downloadInvoicePdf({
                    invoiceNumber: inv.invoiceNumber,
                    docType: inv.docType,
                    entityType: inv.entityType,
                    amountInr: inv.amountInr,
                    gstInr: inv.gstInr,
                    issuedAt: inv.issuedAt,
                    customerEmail: dbUser?.email || guestEmail || '',
                    gstin:
                      settings.projectSettings?.enableGstTax && settings.companyInfo?.gstin
                        ? settings.companyInfo.gstin
                        : undefined,
                    payload: inv.payload || {},
                  });
                } else {
                  notify('Open My Invoices in your account to download the GST Tax Invoice.', 'info');
                  navigate('/my-account/invoices');
                }
              }}
              className="px-5 py-2.5 bg-[#111417] hover:bg-[#1E242B] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4" /> Download Tax Invoice PDF
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-account/track-orders')}
              className="px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Truck className="w-4 h-4" /> Track Your Order
            </button>
            <button
              type="button"
              onClick={() => navigate('/store')}
              className="px-5 py-2.5 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Login / Registration */}
            {step === 1 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <UserCheck className="w-5 h-5 text-[#15803D]" />
                  <h2 className="font-display text-lg font-bold text-slate-950">Step 1: Account Login or Express Checkout</h2>
                </div>
                {isSignedIn ? (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm">
                      <div className="font-semibold text-[#111417]">Signed in as {dbUser?.fullName || dbUser?.email}</div>
                      <div className="text-xs text-slate-600 font-mono mt-0.5">{dbUser?.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2"
                    >
                      Continue to Delivery Address <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => openAuthModal('login')}
                        className="px-5 py-2.5 bg-[#111417] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
                      >
                        Sign In to Existing Account
                      </button>
                      <button
                        type="button"
                        onClick={() => openAuthModal('register')}
                        className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg"
                      >
                        Create Customer Account
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <div className="text-xs font-semibold text-slate-700">Or Continue Express Checkout with Email</div>
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                          type="email"
                          placeholder="Enter your email for order tracking & GST invoice *"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!guestEmail.trim() || !guestEmail.includes('@')) {
                              notify('Enter a valid email address to continue.', 'error');
                              return;
                            }
                            setStep(2);
                          }}
                          className="px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                        >
                          Continue <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Delivery Address */}
            {step === 2 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
                {isSignedIn ? (
                  <>
                    <AddressSelector
                      title="Step 2: Select or Add Delivery Address"
                      addresses={addresses}
                      selected={shippingAddress}
                      onSelect={setShippingAddress}
                      onAddressSaved={loadAddresses}
                    />
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 pt-2">
                      <input
                        type="checkbox"
                        checked={sameBilling}
                        onChange={(e) => setSameBilling(e.target.checked)}
                      />
                      Billing address is the same as delivery address
                    </label>
                    {!sameBilling && (
                      <AddressSelector
                        title="Billing Address"
                        addresses={addresses}
                        selected={billingAddress}
                        onSelect={setBillingAddress}
                        onAddressSaved={loadAddresses}
                      />
                    )}
                  </>
                ) : (
                  <div className="space-y-4 text-sm">
                    <div className="border-b border-slate-100 pb-3">
                      <h2 className="font-display text-lg font-bold text-slate-950">Step 2: Delivery Address</h2>
                      <p className="text-xs text-slate-500 mt-0.5">All courier shipments dispatch from Nagpur, Maharashtra.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        required
                        placeholder="Full Name *"
                        value={guestAddress.fullName}
                        onChange={(e) => setGuestAddress({ ...guestAddress, fullName: e.target.value })}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                      />
                      <input
                        required
                        type="email"
                        placeholder="Email for Order & Invoice *"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                      />
                      <input
                        required
                        placeholder="Mobile Number *"
                        value={guestAddress.mobile}
                        onChange={(e) => setGuestAddress({ ...guestAddress, mobile: e.target.value })}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                      />
                      <input
                        required
                        maxLength={6}
                        placeholder="6-Digit PIN Code *"
                        value={guestAddress.pinCode}
                        onChange={(e) => setGuestAddress({ ...guestAddress, pinCode: e.target.value.replace(/[^0-9]/g, '') })}
                        className="rounded-lg border border-slate-300 px-3 py-2 font-mono"
                      />
                      <input
                        required
                        placeholder="House / Flat / Lab / Building *"
                        value={guestAddress.houseFlat}
                        onChange={(e) => setGuestAddress({ ...guestAddress, houseFlat: e.target.value })}
                        className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2"
                      />
                      <input
                        required
                        placeholder="Street / Colony / Industrial Area *"
                        value={guestAddress.streetArea}
                        onChange={(e) => setGuestAddress({ ...guestAddress, streetArea: e.target.value })}
                        className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2"
                      />
                      <input
                        placeholder="Landmark (Optional)"
                        value={guestAddress.landmark}
                        onChange={(e) => setGuestAddress({ ...guestAddress, landmark: e.target.value })}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                      />
                      <input
                        required
                        placeholder="City *"
                        value={guestAddress.city}
                        onChange={(e) => setGuestAddress({ ...guestAddress, city: e.target.value })}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                      />
                      <input
                        placeholder="District"
                        value={guestAddress.district}
                        onChange={(e) => setGuestAddress({ ...guestAddress, district: e.target.value })}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                      />
                      <input
                        required
                        placeholder="State *"
                        value={guestAddress.state}
                        onChange={(e) => setGuestAddress({ ...guestAddress, state: e.target.value })}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={validateAddressAndContinue}
                    className="px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
                  >
                    Continue to Order Summary <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Order Summary */}
            {step === 3 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="font-display text-lg font-bold text-slate-950">Step 3: Review Items &amp; Shipping Address</h2>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-semibold text-[#15803D] hover:underline"
                  >
                    Edit Address
                  </button>
                </div>

                {activeShipping && (
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700 space-y-0.5">
                    <div className="font-semibold text-slate-950">
                      Delivering to: {activeShipping.fullName} · {activeShipping.mobile}
                    </div>
                    <div>
                      {activeShipping.houseFlat}, {activeShipping.streetArea}, {activeShipping.city}, {activeShipping.state} — {activeShipping.pinCode}
                    </div>
                  </div>
                )}

                <div className="divide-y divide-slate-100">
                  {cart.map((i) => {
                    const unit = i.product.discountPriceInr ?? i.product.priceInr;
                    return (
                      <div key={`${i.product.id}-${i.variant}-${i.color}`} className="py-3 flex items-center gap-3">
                        <img
                          src={i.product.imageUrl}
                          alt={i.product.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-14 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-display font-semibold text-sm text-slate-950 truncate">{i.product.name}</div>
                          <div className="text-xs text-slate-500">
                            {[i.variant, i.color].filter(Boolean).join(' · ') || i.product.sku} · Qty {i.qty}
                          </div>
                        </div>
                        <div className="font-mono text-sm font-bold text-slate-950 tabular-nums">
                          ₹{(unit * i.qty).toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
                  >
                    Continue to Payment Method <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Payment Method */}
            {step === 4 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <CreditCard className="w-5 h-5 text-[#15803D]" />
                  <h2 className="font-display text-lg font-bold text-slate-950">Step 4: Select Payment Method</h2>
                </div>

                <div className="rounded-xl border-2 border-[#15803D] bg-emerald-50/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-sm text-slate-950">
                      Razorpay Secure Online Payment (Recommended)
                    </span>
                    <span className="font-mono text-xs font-bold text-[#15803D]">UPI · Cards · NetBanking</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Complete your payment securely via Razorpay. Your GST Tax Invoice PDF is automatically issued once payment signature verification completes on our backend.
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={placing}
                    onClick={handlePlaceOrder}
                    className="px-6 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {placing ? 'Creating Order...' : `Proceed to Pay ₹${total.toLocaleString('en-IN')}`}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Razorpay Payment Confirmation */}
            {step === 5 && createdOrder && (
              <div className="rounded-xl border border-emerald-200 bg-white p-6 space-y-4">
                <div className="text-xs font-mono uppercase text-[#15803D] font-bold">Step 5: Complete Payment</div>
                <h2 className="font-display text-xl font-bold text-slate-950">
                  Order {createdOrder.orderNumber} Created — Complete Razorpay Payment
                </h2>
                <p className="text-sm text-slate-600">
                  Click below to open the Razorpay payment window and verify ₹{createdOrder.totalInr.toLocaleString('en-IN')}.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setPayOpen(true)}
                    className="px-6 py-3 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" /> Open Razorpay Checkout (₹{createdOrder.totalInr.toLocaleString('en-IN')})
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/my-account/orders')}
                    className="px-4 py-3 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    View Order Status in Account
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Persistent Right-Side Price Breakdown */}
          <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 space-y-5 h-fit lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-bold text-slate-950">Price &amp; Tax Breakdown</h2>
            <div className="divide-y divide-slate-100 text-xs">
              {cart.map((i) => (
                <div key={`${i.product.id}-${i.variant}-${i.color}`} className="py-2 flex justify-between gap-2">
                  <span className="truncate">{i.product.name} × {i.qty}</span>
                  <span className="font-mono font-semibold shrink-0 tabular-nums">
                    ₹{((i.product.discountPriceInr ?? i.product.priceInr) * i.qty).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {step < 5 && (
              <div className="flex gap-2">
                <input
                  placeholder="Coupon code (e.g. NTFWELCOME)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono uppercase"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <Tag className="w-3.5 h-3.5" /> Apply
                </button>
              </div>
            )}

            <div className="space-y-1.5 text-sm font-mono tabular-nums text-slate-600 border-t border-slate-200 pt-3">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              {discountInr > 0 && (
                <div className="flex justify-between text-[#15803D]"><span>Discount ({appliedCoupon})</span><span>-₹{discountInr}</span></div>
              )}
              <div className="flex justify-between"><span>GST</span><span>₹{gst.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              <div className="flex justify-between font-bold text-slate-950 text-base pt-2 border-t border-slate-200">
                <span>Payable Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 border-t border-slate-100 pt-3">
              <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0" />
              GST Tax Invoice PDF is unlocked immediately after verified Razorpay payment.
            </div>
          </div>
        </div>
      )}

      {createdOrder && (
        <RazorpayCheckoutModal
          open={payOpen}
          onClose={() => setPayOpen(false)}
          entityType="store_order"
          entityId={createdOrder.id}
          title={`Store Order ${createdOrder.orderNumber}`}
          amountInr={createdOrder.totalInr}
          onSuccess={handlePaymentConfirmed}
        />
      )}
    </div>
  );
};
