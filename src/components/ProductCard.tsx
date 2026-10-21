import { useState } from 'react';
import { Heart, ShoppingBag, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScoreInfo } from './ScoreInfoIcon';
import { useConfig } from '../context/ConfigContext';

const RiyalSymbol: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 1124.14 1256.39"
    className={className}
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.48,33.31-92.75,38.4-143.37l-424.51,90.24Z" />
    <path d="M1085.73,895.8c20.06-44.48,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.48,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.48-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.48-33.32,92.75-38.4,143.37l396.7-84.33v135.2l-53.58,11.39c-20.06,44.48-33.32,92.75-38.4,143.37l91.98-19.55v135.2c50.67-28.45,95.67-66.32,132.25-110.99v-104.7l132.25-28.12v135.2c50.67-28.44,95.67-66.32,132.25-110.99v-104.7l111.4-23.69c20.06-44.48,33.32-92.75,38.4-143.37l-149.8,31.86v-135.2l246.32-52.37Z" />
  </svg>
);

interface ProductCardProps {
  item: any;
  onVisualSearch?: (imageUrl: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onVisualSearch }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { config } = useConfig();

  if (!item) return null;

  const title = item.name || item.productName || 'Unknown Product';
  const price = item.price !== undefined ? item.price : (item.dy_display_price || '0.00');
  const imageUrl = item.image_url || item.image_url_small || item.imageUrl || '';
  const productUrl = item.url || item.product_url || '#';
  const brand = typeof item.brand === 'string' ? item.brand.trim() : '';
  const secondaryImageUrl = item.image_mouseover || item.image_url_secondary || imageUrl;
  const currency = (config.currency || 'SAR').toUpperCase();
  const currencyIsSAR = currency === 'SAR' || currency === 'SR';

  const description =
    brand && title.toLowerCase().startsWith(brand.toLowerCase())
      ? title.slice(brand.length).replace(/^[\s\-–—,:•]+/, '')
      : title;

  // Discount handling — supports either a fraction (0.3) or a percentage (30)
  const rawPct = Number(item.discount_percentage) || 0;
  const discountPct = rawPct > 0 && rawPct < 1 ? Math.round(rawPct * 100) : Math.round(rawPct);
  const hasDiscount = discountPct > 0;
  const numericPrice = Number(price) || 0;
  const originalPrice = hasDiscount && numericPrice > 0 ? numericPrice / (1 - discountPct / 100) : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col min-w-0 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => productUrl !== '#' && window.open(productUrl, '_blank')}
    >
      <div className="relative aspect-3/4 bg-[#f5f5f5] overflow-hidden">
        {imageUrl ? (
          <img 
            src={isHovered ? (secondaryImageUrl || imageUrl) : imageUrl} 
            alt={title}
            className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.03]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-300">
            <ShoppingBag size={48} strokeWidth={1} />
          </div>
        )}

        {/* Score Info Icon (demo tooling) */}
        <div className="absolute top-2 left-2 transition-opacity z-10">
          <ScoreInfo item={item} />
        </div>

        {/* ECO / Organic Badge */}
        {item.eco_aware && (
          <div className="absolute bottom-14 left-2 bg-white text-ink text-[9px] font-bold px-2 py-1 uppercase">
            Organic
          </div>
        )}

        {/* Wishlist Button — appears on hover for a clean default state */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 h-9 w-9 flex items-center justify-center bg-white/80 hover:bg-white transition-colors"
          aria-label="Add to wishlist"
          title="Add to wishlist"
        >
          <Heart size={18} className="text-ink group-hover:text-primary transition-colors drop-shadow-sm" />
        </button>

        {/* Visual Search — appears on hover */}
        {onVisualSearch && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const selectedImageUrl = imageUrl || item.image_url_small || item.imageUrl || '';
              if (selectedImageUrl) {
                onVisualSearch(selectedImageUrl);
              }
            }}
            className="absolute bottom-2 left-2 h-9 w-9 flex items-center justify-center bg-white/90 text-ink hover:bg-white transition-colors"
            title="Search with this product image"
            aria-label="Visual search"
          >
            <Camera size={16} />
          </button>
        )}
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-2 right-2 z-10 h-9 w-9 bg-white/90 text-ink flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Add to cart"
          title="Add to cart"
        >
          <ShoppingBag size={17} strokeWidth={1.5} />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="order-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink">
            {currencyIsSAR
              ? <RiyalSymbol className="h-[0.8em] w-[0.72em]" />
              : <span className="text-[0.8em] font-semibold">{currency}</span>}
            {price}
          </span>
          {originalPrice && (
            <span className="relative inline-flex items-center gap-1 text-[12px] text-gray-400">
              {currencyIsSAR && <RiyalSymbol className="h-[0.8em] w-[0.72em]" />}
              {originalPrice.toFixed(2)}
              <span className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gray-400" />
            </span>
          )}
        </div>
        <h3 className="text-[12px] leading-relaxed min-h-[3em] wrap-break-word">
          {brand && description ? (
            <>
              <span className="block font-bold uppercase text-ink mb-1">{brand}</span>
              <span className="text-muted line-clamp-2">{description}</span>
            </>
          ) : (
            <span className="font-medium text-ink">{brand || title}</span>
          )}
        </h3>
      </div>
    </motion.div>
  );
};
