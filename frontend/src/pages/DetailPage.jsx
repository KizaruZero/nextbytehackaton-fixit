import { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, UPLOADS_URL } from '../api/client';
import { getDeviceToken } from '../utils/deviceToken';
import StatusBadge from '../components/StatusBadge';
import UpvoteButton from '../components/UpvoteButton';
import StatusTimeline from '../components/StatusTimeline';

const LocationPicker = lazy(() => import('../components/LocationPicker'));

const CATEGORY_LABELS = {
  jalan_rusak: '🛣️ Damaged Road',
  sampah: '🗑️ Waste / Trash',
  lampu_mati: '💡 Broken Light',
  fasilitas_umum: '🏗️ Public Facility',
  keamanan: '🚨 Security',
  lainnya: '📌 Other',
};

const VALID_STATUSES = [
  { value: 'pending', label: '⏳ Pending' },
  { value: 'in_progress', label: '🔧 In Progress' },
  { value: 'resolved', label: '✅ Resolved' },
];

function formatDate(dt) {
  return new Date(dt).toLocaleString('en-US', {
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
        alert('Upvote failed: ' + e.message);
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
      alert('Failed to update status: ' + e.message);
    } finally {
      setStatusLoading(false);
    }
  };

  const isReporter = report && report.reporter_device_token === getDeviceToken();

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="border-3 border-ink bg-accent shadow-brutal px-8 py-4">
        <p className="font-mono font-bold animate-pulse">Loading report...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="border-3 border-danger bg-danger/10 shadow-brutal p-8 text-center max-w-md">
        <p className="text-2xl mb-2">⚠️</p>
        <p className="font-bold text-danger mb-4">{error}</p>
        <button onClick={() => navigate('/')} className="btn-brutal">← Back to Feed</button>
      </div>
    </div>
  );

  if (!report) return null;

  const imgSrc = report.image_path ? `${UPLOADS_URL}${report.image_path}` : null;

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b-3 border-ink bg-bg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/feed" id="back-feed" className="btn-outline text-sm px-3 py-2">← Feed</Link>
          <Link to="/">
            <div className="bg-primary border-3 border-ink shadow-brutal px-3 py-1">
              <span className="font-mono font-bold text-white text-xl tracking-tight">FIX</span>
              <span className="font-mono font-bold text-accent text-xl tracking-tight">IT</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-5">
            {imgSrc ? (
              <div className="border-3 border-ink overflow-hidden shadow-brutal">
                <img src={imgSrc} alt={report.title} className="w-full object-cover max-h-80" />
              </div>
            ) : (
              <div className="border-3 border-ink bg-accent/20 shadow-brutal h-32 flex items-center justify-center">
                <span className="text-5xl opacity-30">📷</span>
              </div>
            )}

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
                <UpvoteButton count={report.upvote_count} voted={voted} onClick={handleUpvote} loading={upvoteLoading} />
              </div>
              <div className="border-t-3 border-ink/20 pt-4 mb-4">
                <p className="text-ink/80 leading-relaxed whitespace-pre-wrap">{report.description}</p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm font-mono text-ink/60">
                <span>📍 {report.location_text}</span>
                <span>🕐 {formatDate(report.created_at)}</span>
              </div>
            </div>

            {/* Map — shown only if coordinates are available */}
            {report.latitude && report.longitude && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-mono font-bold text-xs uppercase tracking-widest">📍 Pinned Location</p>
                  <a
                    href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs border-3 border-ink px-3 py-1.5 font-bold bg-bg hover:bg-primary hover:text-white shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal"
                  >
                    Open in Google Maps ↗
                  </a>
                </div>
                <Suspense fallback={
                  <div className="border-3 border-ink bg-accent/20 h-[280px] flex items-center justify-center">
                    <p className="font-mono font-bold animate-pulse">Loading map...</p>
                  </div>
                }>
                  <LocationPicker
                    coords={{ lat: report.latitude, lng: report.longitude }}
                    readonly={true}
                  />
                </Suspense>
              </div>
            )}

            {isReporter && (
              <div className="border-3 border-primary bg-primary/5 shadow-brutal p-5">
                <p className="font-mono font-bold text-xs uppercase tracking-widest mb-3 text-primary">
                  🛠️ Update Status (You are the reporter)
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
                    {statusLoading ? 'Saving...' : 'Update'}
                  </button>
                </div>
              </div>
            )}
          </div>

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
