import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import UpvoteButton from './UpvoteButton';
import { UPLOADS_URL } from '../api/client';

const CATEGORY_LABELS = {
  jalan_rusak: '🛣️ Damaged Road',
  sampah: '🗑️ Waste / Trash',
  lampu_mati: '💡 Broken Light',
  fasilitas_umum: '🏗️ Public Facility',
  keamanan: '🚨 Security',
  lainnya: '📌 Other',
};

function formatDate(dt) {
  return new Date(dt).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function ReportCard({ report, votedIds, onVote }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const voted = votedIds.has(report.id);

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (voted || loading) return;
    setLoading(true);
    try { await onVote(report.id); }
    finally { setLoading(false); }
  };

  const handleMapsClick = (e) => {
    e.stopPropagation();
    window.open(
      `https://www.google.com/maps?q=${report.latitude},${report.longitude}`,
      '_blank', 'noopener,noreferrer'
    );
  };

  const imgSrc = report.image_path ? `${UPLOADS_URL}${report.image_path}` : null;
  const hasCoords = report.latitude && report.longitude;

  return (
    // h-full ensures the card fills the grid cell height → equal card heights in every row
    <article
      id={`report-card-${report.id}`}
      className="card-brutal cursor-pointer flex flex-col h-full"
      onClick={() => navigate(`/reports/${report.id}`)}
    >
      {/* Fixed-height image area — same for every card */}
      <div className="border-b-3 border-ink h-44 overflow-hidden flex-shrink-0">
        {imgSrc ? (
          <img src={imgSrc} alt={report.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent/20">
            <span className="text-4xl opacity-40">📷</span>
          </div>
        )}
      </div>

      {/* Content — flex-1 pushes footer to bottom */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <p className="text-xs font-mono text-ink/50 mb-1">
            {CATEGORY_LABELS[report.category] || report.category}
          </p>
          <h2 className="font-bold text-base leading-tight line-clamp-2">{report.title}</h2>
        </div>

        <p className="text-sm text-ink/70 line-clamp-2 flex-1">{report.description}</p>

        {/* Location row */}
        <div className="flex items-center gap-2 text-xs font-mono text-ink/50 mt-auto">
          {report.location_text && (
            <span className="truncate">📍 {report.location_text}</span>
          )}
          {hasCoords && (
            <button
              onClick={handleMapsClick}
              className="flex-shrink-0 border-2 border-ink bg-primary text-white font-bold px-2 py-0.5
                         hover:bg-primary/80 transition-colors shadow-brutal-sm text-[10px]"
              title={`${report.latitude}, ${report.longitude}`}
            >
              🗺️ Maps
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t-3 border-ink/20">
          <div className="flex items-center gap-2">
            <StatusBadge status={report.status} />
            <span className="text-xs font-mono text-ink/40">{formatDate(report.created_at)}</span>
          </div>
          <UpvoteButton
            count={report.upvote_count}
            voted={voted}
            onClick={handleUpvote}
            loading={loading}
          />
        </div>
      </div>
    </article>
  );
}
