const { useState, useEffect } = React;
import { formatINR } from '../utils/formatters.js';

const BANNERS = [
  {
    id: 1,
    title: "Diwali Mega Sale 🪔 Up to 80% OFF",
    subtitle: "THE GREAT INDIAN FESTIVAL",
    description: "Celebrate Diwali with unbelievable discounts on Audiophile Noise-Canceling Headphones, Smartwatches, and Mobiles.",
    buttonText: "Shop Diwali Deals",
    category: "electronics",
    badge: "BIG BILLION DEALS",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200",
    gradient: "from-amber-950/90 via-slate-900/80 to-transparent"
  },
  {
    id: 2,
    title: "Traditional Ethnic Wear & Festive Festive Fashion",
    subtitle: "INDIAN ETHNIC THREADS",
    description: "Handcrafted Lucknowi Chikankari Kurta sets, Sarees, and designer festive ethnic fashion starting at just ₹999.",
    buttonText: "Explore Ethnic Wear",
    category: "fashion",
    badge: "FLAT 50% OFF",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=1200",
    gradient: "from-rose-950/90 via-slate-900/80 to-transparent"
  },
  {
    id: 3,
    title: "Upgrade Your Home & Kitchen Setup",
    subtitle: "FESTIVE HOME DECOR",
    description: "Solid walnut lamps, brass diyas, designer bedsheets, and stainless cookware deals under ₹1,999.",
    buttonText: "Shop Home Decor",
    category: "home-living",
    badge: "FESTIVE SPECIAL",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200",
    gradient: "from-indigo-950/90 via-slate-900/80 to-transparent"
  }
];

export function HeroCarousel({ onSelectCategory, onNavigate }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = BANNERS[currentSlide];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-900 my-6 group">
      {/* Banner Background Image */}
      <div className="relative h-[380px] sm:h-[450px] lg:h-[500px] w-full">
        <img
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 transform scale-105 group-hover:scale-100"
        />

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />

        {/* Content Container */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center max-w-2xl text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/30 backdrop-blur-md border border-brand-400/40 text-brand-300 text-xs font-bold w-fit mb-4">
            <span>🪔</span>
            <span>{slide.badge}</span>
          </div>

          <span className="text-xs sm:text-sm font-semibold tracking-widest text-brand-400 uppercase mb-2">
            {slide.subtitle}
          </span>

          <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl leading-tight mb-4 tracking-tight">
            {slide.title}
          </h2>

          <p className="text-xs sm:text-base text-slate-300 mb-8 line-clamp-2 leading-relaxed font-light">
            {slide.description}
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (onSelectCategory) onSelectCategory(slide.category);
                if (onNavigate) onNavigate('products');
              }}
              className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-glow transition-all transform active:scale-95 flex items-center gap-2"
            >
              <span>{slide.buttonText}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide Navigation Arrows */}
      <button
        onClick={() => setCurrentSlide((currentSlide - 1 + BANNERS.length) % BANNERS.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
      >
        ‹
      </button>

      <button
        onClick={() => setCurrentSlide((currentSlide + 1) % BANNERS.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
      >
        ›
      </button>

      {/* Slide Dots Indicator */}
      <div className="absolute bottom-6 right-8 z-20 flex items-center gap-2">
        {BANNERS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'w-8 bg-brand-500' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
