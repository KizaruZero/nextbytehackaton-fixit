import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import ReportCard from '../components/ReportCard';
import CategoryFilter from '../components/CategoryFilter';

export default function FeedPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('upvotes');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
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
            <div className="flex gap-2 flex-shrink-0">
              <button
                id="sort-upvotes"
                onClick={() => setSort('upvotes')}
                className={`border-3 border-ink px-3 py-2 text-sm font-bold shadow-brutal-sm transition-all duration-100
                  ${sort === 'upvotes' ? 'bg-ink text-bg' : 'bg-bg hover:bg-accent'}`}
              >
                🔥 Most Voted
              </button>
              <button
                id="sort-newest"
                onClick={() => setSort('newest')}
                className={`border-3 border-ink px-3 py-2 text-sm font-bold shadow-brutal-sm transition-all duration-100
                  ${sort === 'newest' ? 'bg-ink text-bg' : 'bg-bg hover:bg-accent'}`}
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

        {!loading && !error && reports.length === 0 && (
          <div className="border-3 border-ink bg-white shadow-brutal p-12 text-center">
            <p className="text-5xl mb-4">📋</p>
            <p className="font-bold text-xl mb-2">No reports yet</p>
            <p className="text-ink/60 mb-6">Be the first to report an issue!</p>
            <Link to="/submit" className="btn-brutal">+ Report Now</Link>
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                votedIds={votedIds}
                onVote={handleVote}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
