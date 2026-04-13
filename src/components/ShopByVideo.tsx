import Image from 'next/image';
import { Play, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

const videos = [
  { id: 1, title: 'Pure Desi Ghee', thumbnail: '/product_ghee.png', price: 549 },
  { id: 2, title: 'Wild Forest Honey', thumbnail: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?q=80&w=400&auto=format&fit=crop', price: 399 },
  { id: 3, title: 'Traditional Rice', thumbnail: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=400&auto=format&fit=crop', price: 299 },
  { id: 4, title: 'Cold Pressed Oils', thumbnail: '/category_oils.png', price: 649 },
];

const ShopByVideo = () => {
  return (
    <div className="w-full relative z-10 bg-[#fffefc] overflow-hidden section-spacing">
      <div className="standard-container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 md:mb-12 gap-8 text-center md:text-left">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary)] mb-4 inline-block">Visual Shopping</span>
            <h2 className="text-4xl md:text-6xl font-black text-[#1a1a1a] tracking-tight">
              Shop by <span className="italic text-[var(--primary)] text-stroke">Video</span>
            </h2>
          </div>
          <Link href="/videos" className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[var(--primary)] transition-colors">
            View all stories <div className="h-0.5 w-6 bg-gray-200 group-hover:bg-[var(--primary)] group-hover:w-10 transition-all duration-300" />
          </Link>
        </div>

        <div className="flex gap-6 md:gap-8 overflow-x-auto pb-8 snap-x no-scrollbar">
          {videos.map((video) => (
            <div key={video.id} className="relative flex-shrink-0 w-64 md:w-80 h-[380px] md:h-[540px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden snap-start shadow-2xl group cursor-pointer border-[3px] md:border-4 border-white">
              <Image 
                src={video.thumbnail} 
                alt={video.title} 
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 text-white scale-90 group-hover:scale-110 transition-all duration-500 shadow-2xl">
                  <Play className="h-10 w-10 fill-white" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col gap-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-white font-black text-xl md:text-2xl leading-tight">{video.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-white font-black text-2xl">₹{video.price}</span>
                  <button className="h-12 w-12 rounded-full bg-white text-[var(--primary)] flex items-center justify-center shadow-2xl transition-all hover:bg-[var(--primary)] hover:text-white transform group-hover:rotate-[360deg]">
                    <ShoppingCart className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopByVideo;
