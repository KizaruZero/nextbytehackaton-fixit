const STATUS_CONFIG = {
  pending: { label: 'PENDING', dot: 'bg-accent border-ink', line: 'border-ink' },
  in_progress: { label: 'IN PROGRESS', dot: 'bg-primary border-ink', line: 'border-primary' },
  resolved: { label: 'RESOLVED', dot: 'bg-success border-ink', line: 'border-success' },
};

function formatDateTime(dt) {
  return new Date(dt).toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function StatusTimeline({ logs = [] }) {
  if (!logs.length) {
    return <p className="text-sm text-ink/50 italic">No status history yet.</p>;
  }

  return (
    <div className="relative">
      <h3 className="font-mono font-bold text-xs uppercase tracking-widest mb-4 text-ink">
        Status History
      </h3>
      <div className="flex flex-col gap-0">
        {logs.map((log, i) => {
          const cfg = STATUS_CONFIG[log.status] || STATUS_CONFIG.pending;
          const isLast = i === logs.length - 1;
          return (
            <div key={log.id} className="flex items-start gap-4">
              {/* Line + Dot column */}
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 border-3 ${cfg.dot} flex-shrink-0 mt-0.5`} />
                {!isLast && (
                  <div className={`w-0 flex-1 border-l-3 border-dashed ${cfg.line} min-h-[32px]`} />
                )}
              </div>
              {/* Content */}
              <div className="pb-6">
                <span className={`inline-block px-2 py-0.5 text-xs font-mono font-bold border-3 border-ink
                  ${log.status === 'pending' ? 'bg-accent text-ink' : ''}
                  ${log.status === 'in_progress' ? 'bg-primary text-white' : ''}
                  ${log.status === 'resolved' ? 'bg-success text-ink' : ''}
                `}>
                  {cfg.label}
                </span>
                <p className="text-xs text-ink/60 mt-1 font-mono">
                  {formatDateTime(log.changed_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
