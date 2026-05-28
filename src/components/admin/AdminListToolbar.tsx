'use client';

import React, { useState } from 'react';
import { Search, Filter, Calendar, ArrowUpDown, Download, Plus, CheckCircle, XCircle, Trash, MoreHorizontal, Layers, CheckSquare, Square, ChevronDown } from 'lucide-react';

interface QuickStat {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  gradient: string;
  icon: React.ReactNode;
}

interface AdminListToolbarProps {
  searchPlaceholder?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusOptions?: { label: string; value: string }[];
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  sortOptions?: { label: string; value: string }[];
  selectedSort: string;
  onSortChange: (value: string) => void;
  quickStats?: QuickStat[];
  onAddNewClick?: () => void;
  addNewLabel?: string;
  onExportClick?: (format: 'CSV' | 'EXCEL' | 'PDF') => void;
  selectedCount?: number;
  onBulkAction?: (action: 'approve' | 'reject' | 'delete') => void;
}

export default function AdminListToolbar({
  searchPlaceholder = 'Search records...',
  searchTerm,
  onSearchChange,
  statusOptions = [],
  selectedStatus,
  onStatusChange,
  sortOptions = [],
  selectedSort,
  onSortChange,
  quickStats = [],
  onAddNewClick,
  addNewLabel = 'Add New',
  onExportClick,
  selectedCount = 0,
  onBulkAction,
}: AdminListToolbarProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  return (
    <div className="space-y-6 w-full animate-in fade-in slide-in-from-top-4 duration-500">

      {/* STICKY TOOLBAR WRAPPER */}
      <div className="sticky top-2 z-30 bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-3 shadow-md shadow-slate-900/5 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* SEARCH */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full h-11 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 text-xs font-bold outline-none focus:bg-white focus:border-emerald-600 transition-all"
            />
          </div>

          {/* CONTROLS */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* STATUS FILTER */}
            {statusOptions.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className={`h-11 px-4 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    selectedStatus !== 'ALL' && selectedStatus !== ''
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Filter size={14} />
                  <span>
                    Status:{' '}
                    {statusOptions.find(o => o.value === selectedStatus)?.label || 'All'}
                  </span>
                  <ChevronDown size={12} />
                </button>

                {showStatusMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {statusOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onStatusChange(option.value);
                            setShowStatusMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                            selectedStatus === option.value
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* SORT BUTTON */}
            {sortOptions.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all"
                >
                  <ArrowUpDown size={14} />
                  <span>Sort By: {sortOptions.find(o => o.value === selectedSort)?.label || 'Latest'}</span>
                  <ChevronDown size={12} />
                </button>

                {showSortMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {sortOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onSortChange(option.value);
                            setShowSortMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                            selectedSort === option.value
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* EXPORT OPTIONS */}
            {onExportClick && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all"
                >
                  <Download size={14} />
                  <span>Export</span>
                  <ChevronDown size={12} />
                </button>

                {showExportMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {(['CSV', 'EXCEL', 'PDF'] as const).map(format => (
                        <button
                          key={format}
                          onClick={() => {
                            onExportClick(format);
                            setShowExportMenu(false);
                          }}
                          className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Export as {format}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ADD NEW BUTTON */}
            {onAddNewClick && (
              <button
                onClick={onAddNewClick}
                className="h-11 px-6 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-emerald-700 shadow-md shadow-emerald-500/10 active:scale-95 transition-all"
              >
                <Plus size={16} />
                <span>{addNewLabel}</span>
              </button>
            )}

          </div>
        </div>

        {/* BULK ACTIONS STRIP */}
        {selectedCount > 0 && onBulkAction && (
          <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-300">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-widest pl-2">
              {selectedCount} rows selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onBulkAction('approve')}
                className="h-8 px-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle size={12} /> Bulk Approve
              </button>
              <button
                onClick={() => onBulkAction('reject')}
                className="h-8 px-3 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-red-700 transition-colors"
              >
                <XCircle size={12} /> Bulk Reject
              </button>
              <button
                onClick={() => onBulkAction('delete')}
                className="h-8 px-3 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
              >
                <Trash size={12} /> Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
