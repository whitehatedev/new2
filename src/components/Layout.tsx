import React, { useState } from 'react';
import {
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  ChevronDown,
  Minus,
  Plus,
  Trash2,
  Headphones,
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

const COMPANY_LOGO_SRC = '/assets/aistudio/image_1a5ac752.png';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    path,
    navigate,
    settings,
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateCartQty,
    removeFromCart,
    dbUser,
    isSignedIn,
    isAdmin,
    openAuthModal,
    apiFetch,
    notify,
    publishedPages,
  } = usePlatform();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSending, setNewsletterSending] = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = cart.reduce((s, i) => s + (i.product.discountPriceInr ?? i.product.priceInr) * i.qty, 0);
  const freeShippingAbove = settings.shippingConfig?.freeShippingAboveInr ?? 2500;
  const standardShipping = settings.shippingConfig?.standardShippingInr ?? 99;
  const remainingForFreeShipping = Math.max(0, freeShippingAbove - cartSubtotal);
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / Math.max(1, freeShippingAbove)) * 100));

  const announcement = settings.announcementBar;
  const company = settings.companyInfo;
  const customerCareEmail = company?.customerCareEmail || 'info@nexustekfusion.in';
  const socials = company?.socialLinks;

  const rawNavItems =
    settings.navigationMenus?.header && settings.navigationMenus.header.length > 0
      ? settings.navigationMenus.header
      : [
          { id: 'home', label: 'Home', to: '/', visible: true, sortOrder: 1 },
          { id: 'krashivantri', label: 'KRASHIVANTRI', to: '/krashivantri', visible: true, sortOrder: 2 },
          { id: 'store', label: 'Store', to: '/store', visible: true, sortOrder: 3 },
          { id: 'services', label: 'Services', to: '/services', visible: true, sortOrder: 4 },
          { id: 'contact', label: 'Contact', to: '/contact', visible: true, sortOrder: 5 },
        ];

  const navItems = rawNavItems
    .filter(
      (i) =>
        i.visible !== false &&
        i.id !== 'about' &&
        i.to !== '/about' &&
        !i.to?.startsWith('/about/') &&
        !/^about us$/i.test(i.label || '') &&
        i.id !== 'sale' &&
        i.to !== '/sale' &&
        i.id !== 'project-dev' &&
        i.to !== '/register-project' &&
        i.label !== 'Project Development'
    )
    .map((i) => ({
      ...i,
      children: (i.children || []).filter(
        (c) =>
          c.id !== 'shop-sale' &&
          c.to !== '/sale' &&
          c.id !== 'about' &&
          c.to !== '/about' &&
          !c.to?.startsWith('/about/') &&
          !/^about us$/i.test(c.label || '')
      ),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const go = (to: string) => {
    setDrawerOpen(false);
    setCartDrawerOpen(false);
    setSearchOpen(false);
    navigate(to);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    go(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSending(true);
    try {
      await apiFetch('/api/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email: newsletterEmail.trim(), source: 'footer' }),
      });
      setNewsletterEmail('');
      notify('Subscribed to NexusTekFusion updates.', 'success');
    } catch (err: any) {
      notify(err?.message || 'Subscription failed.', 'error');
    } finally {
      setNewsletterSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F6FA] text-[#263238]">
      {/* Slim Editable Announcement Bar */}
      {announcement?.enabled && !bannerDismissed && (
        <div className="bg-[#102A43] text-slate-100 border-b border-[#1E3A5F] px-4 h-9 flex items-center justify-between text-xs">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-center gap-3 truncate">
            <span className="truncate">{announcement.text}</span>
            {announcement.link && (
              <button
                onClick={() => go(announcement.link)}
                className="text-blue-300 hover:text-white font-semibold underline underline-offset-2 whitespace-nowrap shrink-0"
              >
                {announcement.ctaLabel || 'Explore'}
              </button>
            )}
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss announcement"
            className="text-slate-300 hover:text-white p-1 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Lockup (Official Logo + Wordmark) */}
          <button
            onClick={() => go('/')}
            className="inline-flex items-center gap-2 font-display text-base xl:text-lg font-bold tracking-tight text-[#102A43] whitespace-nowrap shrink-0 text-left focus-visible:outline-2 focus-visible:outline-[#1769AA] rounded"
          >
            <img
              src={COMPANY_LOGO_SRC}
              alt="NexusTekFusion Logo"
              className="h-8 w-8 object-contain shrink-0"
            />
            <span>{company?.brandName || 'NexusTekFusion'}</span>
          </button>

          {/* Zone 2: Concise Single-Line Navigation Links with Hover/Focus Dropdown Support */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs xl:text-sm font-medium text-[#263238]">
            {navItems.map((item) => {
              const children = item.children || [];
              const targetTo = item.to === '/shop' ? '/store' : item.to;
              const active =
                path === targetTo ||
                (targetTo === '/store' && (path.startsWith('/shop') || path.startsWith('/store'))) ||
                (targetTo !== '/' && path.startsWith(targetTo + '/')) ||
                children.some((c) => path === c.to || path.startsWith(c.to + '/'));

              if (children.length === 0) {
                return (
                  <button
                    key={item.id || targetTo}
                    onClick={() => go(targetTo)}
                    className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                      active
                        ? 'border-[#1769AA] text-[#102A43] font-semibold'
                        : 'border-transparent hover:text-[#102A43] hover:border-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              }

              return (
                <div key={item.id || targetTo} className="relative group">
                  <button
                    onClick={() => go(targetTo)}
                    className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors inline-flex items-center gap-1 ${
                      active
                        ? 'border-[#1769AA] text-[#102A43] font-semibold'
                        : 'border-transparent hover:text-[#102A43] hover:border-slate-300'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#102A43] transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="hidden group-hover:block group-focus-within:block absolute left-0 top-full pt-2 z-50 min-w-[230px]">
                    <div className="rounded-xl border border-slate-200 bg-white shadow-xl py-2">
                      {children.map((sub) => (
                        <button
                          key={sub.id || sub.to}
                          onClick={() => go(sub.to)}
                          className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors block ${
                            path === sub.to
                              ? 'bg-blue-50 text-[#1769AA] font-semibold'
                              : 'text-[#263238] hover:bg-[#F3F6FA] hover:text-[#102A43]'
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Zone 3: Account Controls + Compact Store Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search store"
              className="p-2 text-slate-600 hover:text-[#102A43] rounded-lg hover:bg-[#F3F6FA] transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCartDrawerOpen(true)}
              aria-label="Store cart"
              className="relative p-2 text-[#102A43] hover:text-[#1769AA] rounded-lg hover:bg-[#F3F6FA] transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <ShoppingBag className="w-4 h-4" />
              <span
                className={`font-mono tabular-nums px-1.5 py-0.5 rounded-md text-[11px] ${
                  cartCount > 0 ? 'bg-[#D62828] text-white' : 'text-slate-600'
                }`}
              >
                {cartCount}
              </span>
            </button>

            {isSignedIn ? (
              <button
                onClick={() => go('/my-account')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#102A43] border border-slate-300 hover:bg-[#F3F6FA] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <User className="w-3.5 h-3.5 text-[#1769AA]" />
                <span>My Account</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => go('/login')}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#263238] hover:text-[#102A43] hover:bg-[#F3F6FA] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => go('/register')}
                  className="hidden md:inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-[#1769AA] hover:bg-[#125488] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Register
                </button>
              </>
            )}

            {isAdmin && (
              <button
                onClick={() => go('/admin/dashboard')}
                className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#1769AA] bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open full navigation menu"
              className="p-2 text-[#102A43] hover:bg-[#F3F6FA] rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3">
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex gap-2">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search KRASHIVANTRI drones, agricultural drone parts, flight controllers, or SKUs..."
                className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-[#263238] focus:outline-none focus:border-[#1769AA]"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#1769AA] hover:bg-[#125488] text-white text-sm font-semibold rounded-lg whitespace-nowrap"
              >
                Search Store
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Slide-Over Complete Platform Navigation Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50">
          <div className="w-full max-w-md bg-white h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2.5">
                  <img src={COMPANY_LOGO_SRC} alt="NexusTekFusion" className="h-7 w-7 object-contain" />
                  <span className="font-display font-bold text-lg text-[#102A43]">Navigation</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-[#F3F6FA]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-slate-400">KRASHIVANTRI &amp; Services</div>
                  {[
                    ['Home', '/'],
                    ['KRASHIVANTRI Drones', '/krashivantri'],
                    ['KRASHIVANTRI X', '/krashivantri-x'],
                    ['KRASHIVANTRI X PRO', '/krashivantri-x-pro'],
                    ['Compare Drones', '/krashivantri/compare'],
                    ['Drone Enquiry', '/krashivantri/enquiry'],
                    ['Farmer Spraying Portal', '/krashivantri/farmer-portal'],
                    ['Drone Pilot Portal', '/krashivantri/pilot-portal'],
                    ['All Services', '/services'],
                    ['3D Printing & Prototyping', '/services/3d-printing'],
                    ['Project Development', '/services/custom-engineering'],
                    ['Register Your Project', '/register-project'],
                    ['Drone Repair & Diagnostics', '/services/drone-repair'],
                  ].map(([label, to]) => (
                    <button
                      key={to}
                      onClick={() => go(to)}
                      className="block text-left text-[#263238] hover:text-[#1769AA] py-0.5"
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-slate-400">Store &amp; Regions</div>
                  {[
                    ['Engineering & Drone Store', '/store'],
                    ['Agricultural Drones', '/store/category/agricultural-drones'],
                    ['3D Printed Products', '/store/3d-printed-products'],
                    ['Engineering Projects', '/projects'],
                    ['B2B / Bulk Orders', '/b2b'],
                    ['Nagpur Hub', '/nagpur'],
                    ['Maharashtra Network', '/maharashtra'],
                    ['Blogs & Articles', '/blogs'],
                    ['Track Order', '/track-order'],
                    ['Contact & Support', '/contact'],
                    ['FAQs', '/faq'],
                  ].map(([label, to]) => (
                    <button
                      key={to}
                      onClick={() => go(to)}
                      className="block text-left text-[#263238] hover:text-[#1769AA] py-0.5"
                    >
                      {label}
                    </button>
                  ))}
                  {publishedPages.map((pg) => (
                    <button
                      key={pg.id}
                      onClick={() => go(`/p/${pg.slug}`)}
                      className="block text-left text-[#263238] hover:text-[#1769AA] py-0.5"
                    >
                      {pg.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-2">
                {isSignedIn ? (
                  <button
                    onClick={() => go('/my-account')}
                    className="w-full py-2.5 px-4 rounded-lg border border-slate-300 text-sm font-medium text-[#102A43] hover:bg-[#F3F6FA] flex items-center justify-between"
                  >
                    <span>My Account ({dbUser?.email || 'Account'})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => go('/login')}
                      className="py-2.5 px-4 rounded-lg border border-slate-300 text-sm font-medium text-[#102A43] hover:bg-[#F3F6FA] text-center"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => go('/register')}
                      className="py-2.5 px-4 rounded-lg bg-[#1769AA] hover:bg-[#125488] text-white text-sm font-semibold text-center"
                    >
                      Register
                    </button>
                  </div>
                )}
                {isAdmin ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => go('/admin/dashboard')}
                      className="w-full py-2.5 px-4 rounded-lg bg-[#102A43] text-white text-sm font-medium hover:bg-[#1E3A5F] flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-300" />
                        Admin Control Panel
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => go('/admin/website-editor')}
                        className="py-2 px-2.5 rounded-lg border border-slate-200 text-[#263238] hover:bg-[#F3F6FA] text-left"
                      >
                        Visual Editor
                      </button>
                      <button
                        onClick={() => go('/admin/project-enquiries')}
                        className="py-2 px-2.5 rounded-lg border border-slate-200 text-[#263238] hover:bg-[#F3F6FA] text-left"
                      >
                        Project Quotes
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => go('/admin/login')}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#F3F6FA] text-[#102A43] text-sm font-medium hover:bg-slate-200 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-slate-500" />
                      Admin Login Portal
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <a
                  href={`mailto:${customerCareEmail}?subject=${encodeURIComponent('Customer Care Enquiry — NexusTekFusion')}`}
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-50 border border-blue-200 text-[#102A43] text-xs font-semibold hover:bg-blue-100 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Headphones className="w-4 h-4 text-[#1769AA] shrink-0" />
                    <span className="truncate">Contact Customer Support ({customerCareEmail})</span>
                  </span>
                  <Mail className="w-4 h-4 text-[#1769AA] shrink-0" />
                </a>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 text-xs text-slate-500 space-y-1">
              <div className="font-semibold text-slate-700">{company?.legalName}</div>
              <div>CIN: {company?.cin}</div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-Over Store Cart Drawer */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/55">
          <div className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#1769AA]" />
                <span className="font-display font-bold text-lg text-[#102A43]">
                  Store Cart ({cartCount})
                </span>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                aria-label="Close cart drawer"
                className="p-2 rounded-lg text-slate-500 hover:bg-[#F3F6FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="px-6 py-3 bg-[#F3F6FA] border-b border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between font-medium text-[#263238]">
                {remainingForFreeShipping === 0 ? (
                  <span className="text-[#1769AA] font-semibold">
                    Unlocked FREE Pan-India Shipping!
                  </span>
                ) : (
                  <span>
                    Add <strong className="font-mono text-[#102A43]">₹{remainingForFreeShipping.toLocaleString('en-IN')}</strong> for FREE shipping
                  </span>
                )}
                <span className="font-mono text-slate-500">{freeShippingProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1769AA] transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                  <div className="space-y-1">
                    <div className="font-display font-bold text-[#102A43]">Your store cart is empty</div>
                    <p className="text-xs text-slate-500">
                      Explore agricultural drones, propulsion hardware, flight controllers, and electronics components.
                    </p>
                  </div>
                  <button
                    onClick={() => go('/store')}
                    className="px-5 py-2.5 bg-[#1769AA] hover:bg-[#125488] text-white text-xs font-semibold rounded-lg"
                  >
                    Browse Store
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const unit = item.product.discountPriceInr ?? item.product.priceInr;
                  return (
                    <div
                      key={`${item.product.id}-${item.variant}-${item.color}`}
                      className="flex gap-3 pb-4 border-b border-slate-100"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <button
                          onClick={() => go(`/product/${item.product.slug}`)}
                          className="text-left font-display font-semibold text-sm text-[#102A43] hover:text-[#1769AA] line-clamp-1"
                        >
                          {item.product.name}
                        </button>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {[item.variant, item.color].filter(Boolean).join(' · ') || item.product.sku}
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <div className="inline-flex items-center border border-slate-300 rounded-lg bg-white">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() =>
                                updateCartQty(item.product.id, item.variant, item.color, item.qty - 1)
                              }
                              className="p-1.5 text-slate-600 hover:bg-[#F3F6FA] rounded-l-lg"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-mono font-semibold tabular-nums">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() =>
                                updateCartQty(item.product.id, item.variant, item.color, item.qty + 1)
                              }
                              className="p-1.5 text-slate-600 hover:bg-[#F3F6FA] rounded-r-lg"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#102A43] tabular-nums">
                              ₹{(unit * item.qty).toLocaleString('en-IN')}
                            </span>
                            <button
                              type="button"
                              aria-label="Remove item"
                              onClick={() =>
                                removeFromCart(item.product.id, item.variant, item.color)
                              }
                              className="p-1 text-slate-400 hover:text-[#D62828]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cart Footer */}
            <div className="border-t border-slate-200 p-6 space-y-4 bg-white">
              {cart.length > 0 && (
                <>
                  <div className="space-y-1.5 text-xs font-mono tabular-nums text-[#263238]">
                    <div className="flex justify-between">
                      <span>Subtotal (excl. GST)</span>
                      <span className="font-semibold text-[#102A43]">
                        ₹{cartSubtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Shipping</span>
                      <span>
                        {remainingForFreeShipping === 0 ? 'FREE' : `₹${standardShipping}`}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => go('/cart')}
                      className="py-2.5 px-3 border border-slate-300 hover:bg-[#F3F6FA] text-[#102A43] text-xs font-semibold rounded-lg"
                    >
                      View Cart
                    </button>
                    <button
                      onClick={() => go('/checkout')}
                      className="py-2.5 px-3 bg-[#1769AA] hover:bg-[#125488] text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1.5"
                    >
                      Checkout <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>Order help? Customer Care:</span>
                <a
                  href={`mailto:${customerCareEmail}?subject=${encodeURIComponent('Store Order Help')}`}
                  className="font-mono font-semibold text-[#1769AA] hover:underline"
                >
                  {customerCareEmail}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Authoritative Dark Charcoal Footer */}
      {(() => {
        const cf = settings.cmsContent?.contactFooter;
        const dynamicCeo = (settings.aboutTeam || []).find(
          (m) => m.isActive !== false && m.status !== 'draft' && /founder|chief executive|\bceo\b/i.test(m.designation)
        )?.name;
        const ceoDisplay = Array.isArray(settings.aboutTeam)
          ? dynamicCeo
          : company?.founderCeo;
        return (
          <footer className="bg-[#102A43] text-slate-300 border-t border-[#1E3A5F] mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={COMPANY_LOGO_SRC}
                    alt="NexusTekFusion Logo"
                    className="h-9 w-9 object-contain bg-white rounded-md p-1 shrink-0"
                  />
                  <div className="font-display text-base font-bold text-white leading-tight">
                    {company?.legalName || 'NEXUSTEKFUSION PRIVATE LIMITED'}
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {cf?.footerDescription ||
                    `${company?.primaryTagline || 'Transforming Ideas into Reality'} — ${
                      company?.secondaryTagline || 'Engineering Intelligence. Manufacturing Innovation.'
                    }.`}
                </p>
                <div className="text-xs text-slate-400 space-y-1 pt-2 font-mono">
                  <div>CIN: {company?.cin || 'U30305ME2026PTC474052'}</div>
                  {company?.gstin && <div>GSTIN: {company.gstin}</div>}
                  {ceoDisplay && <div>Founder &amp; CEO: {ceoDisplay}</div>}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="font-semibold text-white">KRASHIVANTRI &amp; Services</div>
                <ul className="space-y-2 text-slate-300">
                  {[
                    ['KRASHIVANTRI Drones', '/krashivantri'],
                    ['KRASHIVANTRI X', '/krashivantri-x'],
                    ['KRASHIVANTRI X PRO', '/krashivantri-x-pro'],
                    ['Compare Drones', '/krashivantri/compare'],
                    ['Drone Enquiry', '/krashivantri/enquiry'],
                    ['Farmer Spraying Portal', '/krashivantri/farmer-portal'],
                    ['Drone Pilot Portal', '/krashivantri/pilot-portal'],
                    ['3D Printing & Rapid Prototyping', '/services/3d-printing'],
                    ['Drone Repair & Diagnostics Service', '/services/drone-repair'],
                    ['Project Development', '/services/custom-engineering'],
                    ['Register Your Project', '/register-project'],
                  ].map(([label, to]) => (
                    <li key={to}>
                      <button onClick={() => go(to)} className="hover:text-white transition-colors text-left">
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 text-sm">
                <div className="font-semibold text-white">Store &amp; Support</div>
                <ul className="space-y-2 text-slate-300">
                  {[
                    ['Engineering & Drone Store', '/store'],
                    ['3D Printed Products', '/store/3d-printed-products'],
                    ['Engineering R&D Projects', '/projects'],
                    ['B2B & Bulk Orders', '/b2b'],
                    ['Nagpur Operations Hub', '/nagpur'],
                    ['Maharashtra Coverage', '/maharashtra'],
                    ['Track Order', '/track-order'],
                    ['Engineering Blogs', '/blogs'],
                    ['FAQs', '/faq'],
                  ].map(([label, to]) => (
                    <li key={to}>
                      <button onClick={() => go(to)} className="hover:text-white transition-colors text-left">
                        {label}
                      </button>
                    </li>
                  ))}
                  <li>
                    <a
                      href={`mailto:${customerCareEmail}?subject=${encodeURIComponent('Customer Care Support — NexusTekFusion')}`}
                      className="text-blue-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Contact Customer Support
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-4 text-sm">
                <div className="font-semibold text-white">Registered Office &amp; Newsletter</div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {company?.address ||
                    'H NO. 565/19 NIT, SANKUL NEW COTTON MARK, Ganjipeth, Nagpur 440018, Maharashtra, India'}
                </p>
                <div className="text-xs text-slate-300 space-y-1.5">
                  <div>
                    Customer Care:{' '}
                    <a
                      href={`mailto:${customerCareEmail}?subject=${encodeURIComponent('Customer Care Enquiry')}`}
                      className="text-blue-300 hover:underline font-mono"
                    >
                      {customerCareEmail}
                    </a>
                  </div>
                  <div>
                    Company Email:{' '}
                    <a href={`mailto:${company?.email || 'info@nexustekfusion.in'}`} className="hover:text-white font-mono">
                      {company?.email || 'info@nexustekfusion.in'}
                    </a>
                  </div>
                  {company?.contactPhone && <div>Phone: {company.contactPhone}</div>}
                  <div>Hours: {company?.businessHours || 'Mon–Sat, 10:00 AM – 7:00 PM IST'}</div>
                </div>

                <form onSubmit={handleNewsletter} className="space-y-2 pt-1">
                  <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-300" />{' '}
                    {cf?.newsletterTitle || 'Engineering Updates & Drone Launches'}
                  </label>
                  {cf?.newsletterDescription && (
                    <p className="text-[11px] text-slate-300">{cf.newsletterDescription}</p>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 min-w-0 rounded-lg bg-[#0A1929] border border-[#1E3A5F] px-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#1769AA]"
                    />
                    <button
                      type="submit"
                      disabled={newsletterSending}
                      className="px-3 py-1.5 rounded-lg bg-[#1769AA] hover:bg-[#125488] text-white text-xs font-semibold whitespace-nowrap disabled:opacity-50"
                    >
                      {newsletterSending ? '...' : 'Subscribe'}
                    </button>
                  </div>
                </form>

                <div className="pt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
                  <button onClick={() => go('/shipping-policy')} className="hover:text-white">
                    Shipping Policy
                  </button>
                  <button onClick={() => go('/return-refund-policy')} className="hover:text-white">
                    Returns
                  </button>
                  <button onClick={() => go('/privacy-policy')} className="hover:text-white">
                    Privacy
                  </button>
                  <button onClick={() => go('/terms-and-conditions')} className="hover:text-white">
                    Terms
                  </button>
                  {socials?.linkedin && (
                    <a href={socials.linkedin} target="_blank" rel="noreferrer" className="hover:text-white">
                      LinkedIn
                    </a>
                  )}
                  {socials?.youtube && (
                    <a href={socials.youtube} target="_blank" rel="noreferrer" className="hover:text-white">
                      YouTube
                    </a>
                  )}
                  {socials?.instagram && (
                    <a href={socials.instagram} target="_blank" rel="noreferrer" className="hover:text-white">
                      Instagram
                    </a>
                  )}
                  {socials?.github && (
                    <a href={socials.github} target="_blank" rel="noreferrer" className="hover:text-white">
                      GitHub
                    </a>
                  )}
                  {socials?.twitter && (
                    <a href={socials.twitter} target="_blank" rel="noreferrer" className="hover:text-white">
                      X
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-[#1E3A5F] py-5 px-4 sm:px-6 text-xs text-slate-300">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>
                  {cf?.copyrightText ||
                    `© ${new Date().getFullYear()} ${company?.legalName || 'NEXUSTEKFUSION PRIVATE LIMITED'}. All rights reserved.`}
                </span>
                <div className="flex items-center gap-4">
                  <button onClick={() => go('/nagpur')} className="hover:text-white">
                    Nagpur
                  </button>
                  <button onClick={() => go('/contact')} className="hover:text-white">
                    Contact
                  </button>
                  {isAdmin ? (
                    <>
                      <button onClick={() => go('/admin/website-editor')} className="text-blue-300 hover:text-white">
                        Website Editor
                      </button>
                      <button onClick={() => go('/admin/dashboard')} className="text-blue-200 hover:text-white">
                        Admin Console
                      </button>
                    </>
                  ) : (
                    <button onClick={() => go('/admin/login')} className="text-slate-300 hover:text-white">
                      Admin Login
                    </button>
                  )}
                </div>
              </div>
            </div>
          </footer>
        );
      })()}
    </div>
  );
};
