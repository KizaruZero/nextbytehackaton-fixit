const CATEGORY_LABELS = {
  '': 'All Categories',
  jalan_rusak: '🛣️ Damaged Road',
  sampah: '🗑️ Waste / Trash',
  lampu_mati: '💡 Broken Light',
  fasilitas_umum: '🏗️ Public Facility',
  keamanan: '🚨 Security',
  lainnya: '📌 Other',
};

const STATUS_LABELS = {
  '': 'All Statuses',
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

export default function CategoryFilter({ category, status, onCategoryChange, onStatusChange }) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono font-bold text-ink uppercase tracking-widest">Category</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <button
              key={val}
              id={`cat-filter-${val || 'all'}`}
              onClick={() => onCategoryChange(val)}
              className={`
                border-3 border-ink px-3 py-1.5 text-sm font-bold
                transition-all duration-100 shadow-brutal-sm
                ${category === val
                  ? 'bg-ink text-bg -translate-x-0.5 -translate-y-0.5 shadow-brutal'
                  : 'bg-bg text-ink hover:bg-accent hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono font-bold text-ink uppercase tracking-widest">Status</label>
        <div className="flex gap-2">
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <button
              key={val}
              id={`status-filter-${val || 'all'}`}
              onClick={() => onStatusChange(val)}
              className={`
                border-3 border-ink px-3 py-1.5 text-sm font-bold
                transition-all duration-100 shadow-brutal-sm
                ${status === val
                  ? 'bg-ink text-bg -translate-x-0.5 -translate-y-0.5 shadow-brutal'
                  : 'bg-bg text-ink hover:bg-primary hover:text-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
