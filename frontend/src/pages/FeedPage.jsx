import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { haversineKm, getCurrentPosition } from '../utils/geo';
import ReportCard from '../components/ReportCard';
import CategoryFilter from '../components/CategoryFilter';

export default function FeedPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('upvotes');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  // Near Me
  const [userCoords, setUserCoords] = useState(null); // { lat, lng }
  const [nearMeRadius] = useState(10); // km
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [votedIds, setVotedIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('fixit_voted_ids') || '[]');
      return new Set(saved);
    } catch { return new Set(); }
  });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getReports({ sort, category, status });
      setReports(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [sort, category, status]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleVote = async (reportId) => {
    try {
      const res = await api.upvoteReport(reportId);
      setVotedIds(prev => {
        const next = new Set(prev);
        next.add(reportId);
        localStorage.setItem('fixit_voted_ids', JSON.stringify([...next]));
        return next;
      });
      setReports(prev => prev.map(r =>
        r.id === reportId ? { ...r, upvote_count: res.data.upvote_count } : r
      ));
    } catch (e) {
      if (e.message.includes('already')) {
        setVotedIds(prev => {
          const next = new Set(prev);
          next.add(reportId);
          localStorage.setItem('fixit_voted_ids', JSON.stringify([...next]));
          return next;
        });
      }
      console.error('Upvote error:', e.message);
    }
  };

  const handleNearMe = async () => {
    if (nearMeActive) { setNearMeActive(false); setUserCoords(null); return; }
    setNearMeLoading(true);
    try {
      const pos = await getCurrentPosition();
      setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setNearMeActive(true);
    } catch {
      alert('Could not get your location. Please allow location access in your browser.');
    } finally { setNearMeLoading(false); }
  };

  // Client-side Near Me filter + sort by distance
  const displayedReports = nearMeActive && userCoords
    ? reports
        .filter(r => r.latitude && r.longitude &&
          haversineKm(userCoords.lat, userCoords.lng, r.latitude, r.longitude) <= nearMeRadius)
        .sort((a, b) =>
          haversineKm(userCoords.lat, userCoords.lng, a.latitude, a.longitude) -
          haversineKm(userCoords.lat, userCoords.lng, b.latitude, b.longitude))
    : reports;

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b-3 border-ink bg-bg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <div className="bg-primary border-3 border-ink shadow-brutal px-3 py-1">
                <span className="font-mono font-bold text-white text-xl tracking-tight">FIX</span>
                <span className="font-mono font-bold text-accent text-xl tracking-tight">IT</span>
              </div>
            </Link>
            <p className="text-xs text-ink/50 hidden sm:block font-mono">
              GitHub Issues for community problems
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/stats" id="nav-stats" className="btn-outline text-sm">
              📊 Statistics
            </Link>
            <Link to="/submit" id="nav-submit" className="btn-brutal text-sm">
              + Report Issue
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 className="text-4xl sm:text-5xl font-black text-ink leading-none">
              REPORTS
            </h1>
            <div
              className="absolute -top-3 -right-8 bg-accent border-3 border-ink px-2 py-0.5 text-xs font-mono font-bold"
              style={{ transform: 'rotate(-3deg)' }}
            >
              LATEST
            </div>
          </div>
          <p className="text-ink/60 mt-2 font-medium">
            Track, support, and follow the resolution of issues in your community.
          </p>
        </div>

        {/* Controls */}
        <div className="border-3 border-ink bg-white shadow-brutal p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CategoryFilter
              category={category}
              status={status}
              onCategoryChange={setCategory}
              onStatusChange={setStatus}
            />
            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              <button
                id="btn-near-me"
                onClick={handleNearMe}
                disabled={nearMeLoading}
                className={`border-3 border-ink px-3 py-2 text-sm font-bold shadow-brutal-sm transition-all duration-100 disabled:opacity-60
                  ${nearMeActive ? 'bg-success text-ink' : 'bg-bg text-ink hover:bg-success/50'}`}
              >
                {nearMeLoading ? '📍 Getting GPS...' : nearMeActive ? `✓ Near Me (${nearMeRadius}km)` : '📍 Near Me'}
              </button>
              <button
                id="sort-upvotes"
                onClick={() => { setSort('upvotes'); setNearMeActive(false); }}
                className={`border-3 border-ink px-3 py-2 text-sm font-bold shadow-brutal-sm transition-all duration-100
                  ${sort === 'upvotes' && !nearMeActive ? 'bg-ink text-bg' : 'bg-bg hover:bg-accent'}`}
              >
                🔥 Most Voted
              </button>
              <button
                id="sort-newest"
                onClick={() => { setSort('newest'); setNearMeActive(false); }}
                className={`border-3 border-ink px-3 py-2 text-sm font-bold shadow-brutal-sm transition-all duration-100
                  ${sort === 'newest' && !nearMeActive ? 'bg-ink text-bg' : 'bg-bg hover:bg-accent'}`}
              >
                🕐 Newest
              </button>
            </div>
          </div>
        </div>

        {/* Feed */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="border-3 border-ink bg-accent shadow-brutal px-8 py-4">
              <p className="font-mono font-bold animate-pulse">Loading reports...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="border-3 border-danger bg-danger/10 shadow-brutal p-4 mb-6">
            <p className="font-bold text-danger">⚠️ Failed to load: {error}</p>
            <button onClick={fetchReports} className="btn-brutal mt-2 text-sm">
              Try Again
            </button>
          </div>
        )}

        {nearMeActive && (
          <div className="border-3 border-success bg-success/10 shadow-brutal-sm p-3 mb-4 flex items-center justify-between">
            <p className="text-sm font-bold">
              📍 Showing reports within {nearMeRadius}km of your location
              {displayedReports.length === 0 && ' — none found. Try moving closer or reporting one!'}
            </p>
            <button onClick={() => { setNearMeActive(false); setUserCoords(null); }}
              className="text-xs font-bold text-ink/60 hover:text-danger">✕ Clear</button>
          </div>
        )}

        {!loading && !error && displayedReports.length === 0 && !nearMeActive && (
          <div className="border-3 border-ink bg-white shadow-brutal p-12 text-center">
            <p className="text-5xl mb-4">📋</p>
            <p className="font-bold text-xl mb-2">No reports yet</p>
            <p className="text-ink/60 mb-6">Be the first to report an issue!</p>
            <Link to="/submit" className="btn-brutal">+ Report Now</Link>
          </div>
        )}

        {!loading && displayedReports.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedReports.map((report, idx) => (
              <div key={report.id} className="relative h-full">
                {nearMeActive && userCoords && report.latitude && report.longitude && (
                  <div className="absolute top-2 left-2 z-10 border-3 border-ink bg-success px-2 py-0.5 text-xs font-mono font-bold shadow-brutal-sm">
                    📍 {haversineKm(userCoords.lat, userCoords.lng, report.latitude, report.longitude).toFixed(1)}km
                  </div>
                )}
                <ReportCard
                  report={report}
                  votedIds={votedIds}
                  onVote={handleVote}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
