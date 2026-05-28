import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function AdminPagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages || 1 }, (_, i) => i + 1);

  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex items-center justify-between px-10 py-8 bg-white border-t border-slate-50">
      <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="h-10 px-4 rounded-xl border border-slate-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--admin-sidebar)] disabled:opacity-30 hover:bg-slate-50 transition-all"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        
        <div className="flex items-center gap-1">
          {pages.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`h-10 w-10 rounded-xl text-[10px] font-black transition-all ${
                currentPage === page 
                ? 'bg-[var(--admin-sidebar)] text-white shadow-lg' 
                : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="h-10 px-4 rounded-xl border border-slate-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--admin-sidebar)] disabled:opacity-30 hover:bg-slate-50 transition-all"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
