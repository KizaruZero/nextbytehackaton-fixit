const STATUS_CONFIG = {
  pending: {
    label: 'PENDING',
    bg: 'bg-accent',
    text: 'text-ink',
    border: 'border-ink',
  },
  in_progress: {
    label: 'IN PROGRESS',
    bg: 'bg-primary',
    text: 'text-white',
    border: 'border-ink',
  },
  resolved: {
    label: 'RESOLVED',
    bg: 'bg-success',
    text: 'text-ink',
    border: 'border-ink',
  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-block px-2.5 py-1 text-xs font-mono font-bold border-3 ${config.bg} ${config.text} ${config.border} tracking-wider`}
    >
      {config.label}
    </span>
  );
}
