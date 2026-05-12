'use client';

import { Search, ArrowUpLeft } from 'lucide-react';

interface SearchSuggestionItemProps {
  label: string;
  isHighlighted?: boolean;
  onClick: () => void;
  type?: 'suggestion' | 'history' | 'trending';
}

export default function SearchSuggestionItem({ label, isHighlighted, onClick, type = 'suggestion' }: SearchSuggestionItemProps) {
  return (
    <button
      onClick={onClick}
      data-highlighted={isHighlighted}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
        isHighlighted ? 'bg-slate-50' : 'hover:bg-slate-50'
      }`}
    >
      <Search className={`h-4 w-4 ${isHighlighted ? 'text-emerald-600' : 'text-slate-300'}`} />
      <span className={`flex-1 text-sm ${isHighlighted ? 'font-bold text-emerald-950' : 'text-slate-600 font-medium'}`}>
        {label}
      </span>
      {type === 'history' && <ArrowUpLeft className="h-3 w-3 text-slate-300" />}
    </button>
  );
}
