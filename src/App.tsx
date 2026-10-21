import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, ChevronDown, Heart, ShoppingBag, User, X, Camera, MessageCircle, House } from 'lucide-react';
import { useDYSearch } from './hooks/useDYSearch';
import { useConfig } from './context/ConfigContext';
import { extractDyPayload } from './utils/dyResponseAdapter';
import { ProductCard } from './components/ProductCard';
import { ConfigPanel } from './components/ConfigPanel';
import { VisualSearchOverlay } from './components/VisualSearchOverlay';
import { MuseChatOverlay } from './components/MuseChatOverlay';
import { PersonaSwitcher } from './components/PersonaSwitcher';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash/debounce';

export default function App() {
  const { config } = useConfig();
  const [searchTerm, setSearchTerm] = useState('t-shirts');
  const [debouncedSearch, setDebouncedSearch] = useState('t-shirts');
  const [offset, setOffset] = useState(0);
  const [showConfig, setShowConfig] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<any[]>([]);
  const [logoError, setLogoError] = useState(false);
  const [showVisualSearch, setShowVisualSearch] = useState(false);
  const [productImageForSearch, setProductImageForSearch] = useState<string | undefined>();
  const [showMuseChat, setShowMuseChat] = useState(false);
  const [showErrorDetail, setShowErrorDetail] = useState(false);

  const breadcrumbParts = config.categoryPath
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);

  // Debounce search input
  const updateSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearch(value);
      setOffset(0);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    updateSearch(e.target.value);
  };

  useEffect(() => {
    setLogoError(false);
  }, [config.logoUrl]);

  const { data, isLoading, isFetching, isError, error, failureCount } = useDYSearch(debouncedSearch, offset, selectedFilters);
  const { items, facets, totalNumResults } = extractDyPayload(data);
  const isFallback = data?.isFallback ?? false;

  const genderValues = selectedFilters.find(filter => filter.field === 'gender')?.values ?? [];

  const selectGender = (gender: 'male' | 'female' | null) => {
    setSelectedFilters(previous => [
      ...previous.filter(filter => filter.field !== 'gender'),
      ...(gender ? [{ field: 'gender', values: [gender] }] : []),
    ]);
    setOffset(0);
  };

  const toggleFilter = (field: string, value: string) => {
    setSelectedFilters(prev => {
      const existing = prev.find(f => f.field === field);
      if (existing) {
        const newValues = existing.values.includes(value)
          ? existing.values.filter((v: string) => v !== value)
          : [...existing.values, value];
        
        if (newValues.length === 0) {
          return prev.filter(f => f.field !== field);
        }
        return prev.map(f => f.field === field ? { ...f, values: newValues } : f);
      }
      return [...prev, { field, values: [value] }];
    });
    setOffset(0);
  };

  return (
    <div className="min-h-screen bg-canvas transition-colors duration-500">
      <AnimatePresence>
        {showConfig && <ConfigPanel onClose={() => setShowConfig(false)} />}
      </AnimatePresence>

      {/* Not-configured banner */}
      {config.apiMode !== 'standard' && !config.feedId && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between gap-4">
          <p className="text-amber-800 text-xs font-medium">
            <span className="font-bold">Feed ID not configured.</span> Open settings to enter your Feed ID for section {config.sectionId}.
          </p>
          <button
            onClick={() => setShowConfig(true)}
            className="shrink-0 px-4 py-1.5 bg-amber-800 text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-amber-900 transition-colors"
          >
            Open Settings
          </button>
        </div>
      )}

      <div className="bg-primary text-white text-center text-[10px] font-semibold uppercase py-2.5 px-4">
        HUGO BOSS / Search Playground
      </div>
      <header className="sticky top-0 z-50 frosted-glass">
        <div className="max-w-400 mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-6">
          <a href="/" aria-label="HUGO BOSS search" className="shrink-0">
            {config.logoUrl && !logoError ? (
              <img src={config.logoUrl} alt="HUGO BOSS" className="w-28 sm:w-44 h-10 object-contain" onError={() => setLogoError(true)} />
            ) : (
              <span className="flex flex-col items-center text-ink leading-none">
                <span className="font-heading text-[38px] font-extrabold">BOSS</span>
                <span className="text-[9px] font-semibold mt-0.5">HUGO BOSS</span>
              </span>
            )}
          </a>
          <nav aria-label="Main navigation" className="flex items-center gap-5 sm:gap-8 flex-1 text-xs font-semibold uppercase">
            <a href="/" aria-current="page" className="border-b-2 border-black py-2">Search</a>
            <a href="/benchmark" className="py-2 text-muted hover:text-ink">Benchmark</a>
          </nav>
          <div className="hidden sm:flex items-center gap-6" aria-label="Storefront preview">
            <User size={21} strokeWidth={1.5} aria-label="Account" />
            <Heart size={21} strokeWidth={1.5} aria-label="Wishlist" />
            <div className="flex items-center gap-2">
              <ShoppingBag size={21} strokeWidth={1.5} aria-label="Shopping bag" />
              <span className="text-xs">0</span>
            </div>
          </div>
        </div>
        <div className="border-t border-line">
          <div className="max-w-250 mx-auto px-4 sm:px-8 py-4 flex items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                aria-label="Search products"
                value={searchTerm}
                placeholder="Search products and brands"
                className="w-full bg-[#f5f5f5] focus:bg-white border border-transparent focus:border-primary rounded-none h-12 pl-11 pr-24 text-sm transition-colors outline-none"
                onChange={handleSearchChange}
              />
              <Search className="absolute left-4 top-4 text-muted" size={17} />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(''); updateSearch(''); }}
                  className="absolute right-1 top-1 h-10 w-10 flex items-center justify-center text-muted hover:text-ink"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <X size={17} />
                </button>
              )}
              <button
                onClick={() => {
                  setProductImageForSearch(undefined);
                  setShowVisualSearch(true);
                }}
                className="absolute right-11 top-1 h-10 w-10 flex items-center justify-center text-muted hover:text-ink"
                title="Visual search"
                aria-label="Visual search"
              >
                <Camera size={19} strokeWidth={1.5} />
              </button>
            </div>
            <button
              onClick={() => setShowMuseChat(true)}
              className="h-12 w-12 sm:w-auto sm:px-5 shrink-0 border border-primary bg-primary text-white hover:bg-primary-dark transition-colors text-[11px] font-bold uppercase flex items-center justify-center gap-2"
              aria-label="Ask Muse"
              title="Ask Muse"
            >
              <MessageCircle size={18} strokeWidth={1.5} />
              <span className="hidden sm:inline">Ask Muse</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-400 mx-auto px-4 sm:px-8 lg:px-12 pt-8 pb-28">
        <div role="group" aria-label="Gender filter" className="inline-flex border border-line mb-6">
          <button
            type="button"
            onClick={() => selectGender(null)}
            aria-pressed={genderValues.length === 0}
            aria-label="Home - all genders"
            title="Home - all genders"
            className={`h-11 w-12 flex items-center justify-center transition-colors ${genderValues.length === 0 ? 'bg-primary text-white' : 'bg-white text-muted hover:bg-primary-container'}`}
          >
            <House size={18} strokeWidth={1.5} />
          </button>
          {(['male', 'female'] as const).map(gender => (
            <button
              key={gender}
              type="button"
              onClick={() => selectGender(gender)}
              aria-pressed={genderValues.length === 1 && genderValues[0] === gender}
              className={`h-11 w-24 border-l border-line text-xs font-semibold uppercase transition-colors ${genderValues.length === 1 && genderValues[0] === gender ? 'bg-primary text-white' : 'bg-white text-muted hover:bg-primary-container'}`}
            >
              {gender === 'male' ? 'Men' : 'Women'}
            </button>
          ))}
        </div>
        {/* Page Title and Sort - High Density Layout */}
        <div className="flex flex-col md:flex-row justify-between items-baseline gap-4 mb-8 pb-7 border-b border-line">
          <div className="min-w-0">
            <nav className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest mb-3">
              {breadcrumbParts.length > 0 ? (
                breadcrumbParts.map((part, idx) => (
                  <React.Fragment key={`${part}-${idx}`}>
                    <span className={idx === breadcrumbParts.length - 1 ? 'text-ink font-bold' : 'hover:text-primary cursor-pointer'}>
                      {part}
                    </span>
                    {idx < breadcrumbParts.length - 1 ? <span>/</span> : null}
                  </React.Fragment>
                ))
              ) : (
                <span className="text-ink font-bold">Search</span>
              )}
            </nav>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold uppercase flex flex-wrap items-baseline gap-x-4 gap-y-2 wrap-anywhere">
              <span>{debouncedSearch ? `Search results: ${debouncedSearch}` : 'Featured products'}</span>
              <span className="text-xs text-muted font-normal normal-case shrink-0">
                ({totalNumResults || 0} items{isFallback && <span className="text-primary text-[10px] ml-0.5" title="Showing fallback results (affinity profile returned no results)">f</span>})
              </span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
            <span className="hidden sm:inline">Sort by:</span>
            <div className="relative group cursor-pointer border-b border-transparent hover:border-primary transition-all">
              <button className="flex items-center gap-1.5 text-ink py-1">
                Recommended <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8 xl:gap-10">
          {/* DY Dynamic Facets Sidebar */}
          <aside aria-label="Product filters" className="hidden lg:block w-48 xl:w-52 shrink-0 space-y-8">
            {isLoading || isFetching ? (
              Array(4).fill(0).map((_, i) => <SkeletonFilter key={i} />)
            ) : (
              facets.map((facet) => (
                <div key={facet.key} className="border-t border-gray-100 pt-8 first:border-t-0 first:pt-0">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest mb-5 flex justify-between items-center group cursor-pointer">
                    {facet.title}
                    <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                  </h4>
                  <div className="space-y-3.5 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                    {facet.options && facet.options.length > 0 ? (
                      facet.options.map((opt) => (
                        <label 
                          key={opt.value} 
                          className="flex items-center gap-3.5 text-[13px] text-gray-600 hover:text-primary cursor-pointer group transition-colors"
                        >
                          <div className="relative flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              className="peer h-4 w-4 border-gray-200 rounded-none checked:bg-primary checked:border-primary transition-all appearance-none border" 
                              checked={selectedFilters.some(f => f.field === facet.key && f.values.includes(opt.value))}
                              onChange={() => toggleFilter(facet.key, opt.value)}
                            />
                            <div className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none text-white transition-opacity">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                          <span className="group-hover:translate-x-0.5 transition-transform">{opt.value}</span>
                          <span className="ml-auto text-[10px] text-gray-300 font-medium">{opt.count != null ? `(${opt.count})` : ''}</span>
                        </label>
                      ))
                    ) : facet.type === 'number' ? (
                      <div className="text-[11px] text-gray-500 uppercase tracking-[0.2em]">
                        {facet.min != null || facet.max != null ? `${facet.min ?? '-'} – ${facet.max ?? '-'}` : 'No values available'}
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-500 uppercase tracking-[0.2em]">No options available</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </aside>

          {/* Product Grid - 4 Columns Responsive */}
          <div className="flex-1 min-w-0">
            {/* Subtle retrying indicator */}
            {failureCount > 0 && isFetching && (
              <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-4 animate-pulse">Retrying…</p>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 sm:gap-x-5 gap-y-10">
              {isLoading || isFetching ? (
                Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)
              ) : (
                items.map((item, idx) => (
                  <ProductCard 
                    key={`${(item as any)?.sku ?? (item as any)?.id ?? (item as any)?.group_id ?? String(idx)}-${idx}`} 
                    item={item}
                    onVisualSearch={(imageUrl) => {
                      setProductImageForSearch(imageUrl);
                      setShowVisualSearch(true);
                    }}
                  />
                ))
              )}
            </div>

            {/* Empty / Error State — always shows "No products found" to the end user;
                error detail is hidden behind a click for debugging during demos */}
            {!isLoading && !isFetching && items.length === 0 && (() => {
              console.warn('Rendering: Zero valid items extracted', { data, isError, error });
              return (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Search size={32} className="text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-tight mb-2">No products found</h3>
                  <p className="text-gray-400 max-w-sm text-sm">
                    We couldn't find anything matching your search. Try different keywords or adjust your filters.
                  </p>
                  <button
                    onClick={() => { setSearchTerm(''); updateSearch(''); setSelectedFilters([]); }}
                    className="mt-8 px-8 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition-colors"
                  >
                    Clear all filters
                  </button>
                  {isError && (
                    <div className="mt-6">
                      <button
                        onClick={() => setShowErrorDetail(v => !v)}
                        className="text-[10px] text-gray-300 hover:text-gray-500 uppercase tracking-widest transition-colors"
                      >
                        {showErrorDetail ? 'Hide detail' : 'Details'}
                      </button>
                      {showErrorDetail && (
                        <p className="mt-2 text-[11px] text-gray-400 max-w-sm font-mono break-all">
                          {error instanceof Error ? error.message : String(error)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
            {!isLoading && !isFetching && totalNumResults > 0 && (
              <div className="mt-20 flex justify-center items-center gap-4">
                <button 
                  disabled={offset === 0}
                  onClick={() => setOffset(Math.max(0, offset - config.itemsPerPage))}
                  className="px-6 py-2 border border-gray-200 text-[11px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-current transition-all"
                >
                  Previous
                </button>
                <span className="text-[11px] font-bold text-gray-400">
                  Page {Math.floor(offset / config.itemsPerPage) + 1} / {Math.ceil(totalNumResults / config.itemsPerPage)}
                </span>
                <button 
                  disabled={offset + config.itemsPerPage >= totalNumResults}
                  onClick={() => setOffset(offset + config.itemsPerPage)}
                  className="px-6 py-2 border border-gray-200 text-[11px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-current transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Sticky Toggle */}
      <div className="lg:hidden fixed bottom-6 left-4 z-50">
        <button 
          onClick={() => setIsMobileFilterOpen(true)}
          className="h-12 flex items-center gap-3 bg-primary text-white px-5 text-xs font-bold uppercase shadow-lg active:scale-95 transition-all"
        >
          <SlidersHorizontal size={18} /> Filter & Sort
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-60 backdrop-blur-sm"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-70 p-6 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-8 pb-4 border-b">
                <h2 className="text-lg font-bold uppercase tracking-tight">Filters</h2>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-2" aria-label="Close filters" title="Close filters"><X /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-8 pr-2">
                {facets.map((facet) => (
                  <div key={facet.key}>
                    <h4 className="text-[11px] font-bold uppercase tracking-widest mb-5">{facet.title}</h4>
                    {facet.options && facet.options.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {facet.options.map((opt) => (
                          <button 
                            key={opt.value} 
                            onClick={() => toggleFilter(facet.key, opt.value)}
                            className={`text-left px-4 py-3 text-[11px] font-bold uppercase tracking-widest border transition-all ${
                              selectedFilters.some(f => f.field === facet.key && f.values.includes(opt.value))
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-600 border-gray-100'
                            }`}
                          >
                            {opt.value}
                          </button>
                        ))}
                      </div>
                    ) : facet.type === 'number' ? (
                      <div className="text-[11px] text-gray-500 uppercase tracking-[0.2em]">
                        {facet.min != null || facet.max != null ? `${facet.min ?? '-'} – ${facet.max ?? '-'}` : 'No values available'}
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-500 uppercase tracking-[0.2em]">No options available</div>
                    )}
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="mt-6 w-full bg-primary text-white py-4 font-bold uppercase text-xs tracking-widest"
              >
                Show Results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Visual Search Overlay */}
      <AnimatePresence>
        {showVisualSearch && (
          <VisualSearchOverlay
            productImageUrl={productImageForSearch}
            onClose={() => setShowVisualSearch(false)}
          />
        )}
      </AnimatePresence>

      {/* Shopping Muse Overlay */}
      <AnimatePresence>
        {showMuseChat && (
          <MuseChatOverlay onClose={() => setShowMuseChat(false)} />
        )}
      </AnimatePresence>

      {/* Settings FAB + Persona Switcher */}
      <PersonaSwitcher onOpenSettings={() => setShowConfig(true)} />
    </div>
  );
}

// --- Skeleton Components ---

const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col">
    <div className="aspect-3/4 w-full bg-gray-100" />
    <div className="h-3 bg-gray-100 w-1/3 mt-4" />
    <div className="h-3 bg-gray-100 w-3/4 mt-3" />
    <div className="h-3 bg-gray-100 w-1/2 mt-3" />
  </div>
);

const SkeletonFilter = () => (
  <div className="animate-pulse">
    <div className="h-3 bg-gray-100 w-1/2 rounded-full mb-6" />
    <div className="space-y-4">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-4 h-4 bg-gray-100 rounded-none" />
          <div className="h-2.5 bg-gray-100 w-2/3 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);
