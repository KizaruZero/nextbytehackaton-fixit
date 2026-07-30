import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, UPLOADS_URL } from '../api/client';
import { getDeviceToken } from '../utils/deviceToken';
import StatusBadge from '../components/StatusBadge';
import UpvoteButton from '../components/UpvoteButton';
import StatusTimeline from '../components/StatusTimeline';

const CATEGORY_LABELS = {
  jalan_rusak: '🛣️ Jalan Rusak',
  sampah: '🗑️ Sampah',
  lampu_mati: '💡 Lampu Mati',
  fasilitas_umum: '🏗️ Fasilitas Umum',
  keamanan: '🚨 Keamanan',
  lainnya: '📌 Lainnya',
};

const VALID_STATUSES = [
  { value: 'pending', label: '⏳ Pending' },
  { value: 'in_progress', label: '🔧 In Progress' },
  { value: 'resolved', label: '✅ Resolved' },
];

function formatDate(dt) {
  return new Date(dt).toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upvoteLoading, setUpvoteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const [votedIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('fixit_voted_ids') || '[]');
      return new Set(saved);
    } catch { return new Set(); }
  });
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await api.getReport(id);
        setReport(res.data);
        setNewStatus(res.data.status);
        setVoted(votedIds.has(res.data.id));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleUpvote = async () => {
    if (voted || upvoteLoading) return;
    setUpvoteLoading(true);
    try {
      const res = await api.upvoteReport(report.id);
      setVoted(true);
      const updatedIds = new Set(votedIds);
      updatedIds.add(report.id);
      localStorage.setItem('fixit_voted_ids', JSON.stringify([...updatedIds]));
      setReport(prev => ({ ...prev, upvote_count: res.data.upvote_count }));
    } catch (e) {
      if (e.message.includes('already')) {
        setVoted(true);
      } else {
        alert('Upvote gagal: ' + e.message);
      }
    } finally {
      setUpvoteLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === report.status || statusLoading) return;
    setStatusLoading(true);
    try {
      const res = await api.updateStatus(report.id, newStatus);
      setReport(res.data);
      setNewStatus(res.data.status);
    } catch (e) {
      alert('Gagal update status: ' + e.message);
    } finally {
      setStatusLoading(false);
    }
  };

  const isReporter = report && report.reporter_device_token === getDeviceToken();

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="border-3 border-ink bg-accent shadow-brutal px-8 py-4">
        <p className="font-mono font-bold animate-pulse">Memuat laporan...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="border-3 border-danger bg-danger/10 shadow-brutal p-8 text-center max-w-md">
        <p className="text-2xl mb-2">⚠️</p>
        <p className="font-bold text-danger mb-4">{error}</p>
        <button onClick={() => navigate('/')} className="btn-brutal">← Kembali ke Feed</button>
      </div>
    </div>
  );

  if (!report) return null;

  const imgSrc = report.image_path ? `${UPLOADS_URL}${report.image_path}` : null;

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b-3 border-ink bg-bg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" id="back-feed" className="btn-outline text-sm px-3 py-2">
            ← Feed
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-primary border-3 border-ink shadow-brutal px-3 py-1">
              <span className="font-mono font-bold text-white text-xl tracking-tight">FIX</span>
              <span className="font-mono font-bold text-accent text-xl tracking-tight">IT</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Image */}
            {imgSrc ? (
              <div className="border-3 border-ink overflow-hidden shadow-brutal">
                <img src={imgSrc} alt={report.title} className="w-full object-cover max-h-80" />
              </div>
            ) : (
              <div className="border-3 border-ink bg-accent/20 shadow-brutal h-32 flex items-center justify-center">
                <span className="text-5xl opacity-30">📷</span>
              </div>
            )}

            {/* Report info */}
            <div className="border-3 border-ink bg-white shadow-brutal p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-ink/50">
                      {CATEGORY_LABELS[report.category] || report.category}
                    </span>
                    <StatusBadge status={report.status} />
                  </div>
                  <h1 className="text-2xl font-black leading-tight">{report.title}</h1>
                </div>
                <UpvoteButton
                  count={report.upvote_count}
                  voted={voted}
                  onClick={handleUpvote}
                  loading={upvoteLoading}
                />
              </div>

              <div className="border-t-3 border-ink/20 pt-4 mb-4">
                <p className="text-ink/80 leading-relaxed whitespace-pre-wrap">{report.description}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm font-mono text-ink/60">
                <span>📍 {report.location_text}</span>
                <span>🕐 {formatDate(report.created_at)}</span>
              </div>
            </div>

            {/* Status update (reporter only) */}
            {isReporter && (
              <div className="border-3 border-primary bg-primary/5 shadow-brutal p-5">
                <p className="font-mono font-bold text-xs uppercase tracking-widest mb-3 text-primary">
                  🛠️ Update Status (Kamu adalah pelapor)
                </p>
                <div className="flex gap-3">
                  <select
                    id="status-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="input-brutal flex-1"
                  >
                    {VALID_STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <button
                    id="btn-update-status"
                    onClick={handleStatusUpdate}
                    disabled={newStatus === report.status || statusLoading}
                    className="btn-brutal text-sm flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {statusLoading ? 'Menyimpan...' : 'Update'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: timeline */}
          <div className="lg:col-span-1">
            <div className="border-3 border-ink bg-white shadow-brutal p-5 sticky top-24">
              <StatusTimeline logs={report.status_logs || []} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
