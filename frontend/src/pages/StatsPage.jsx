import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts';

const CATEGORY_LABELS = {
  jalan_rusak: 'Damaged Road',
  sampah: 'Waste / Trash',
  lampu_mati: 'Broken Light',
  fasilitas_umum: 'Public Facility',
  keamanan: 'Security',
  lainnya: 'Other',
};

const BAR_COLORS = ['#4D61FC', '#FFDE59', '#FF3D3D', '#3DFFA2', '#111111', '#4D61FC'];

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getStats()
      .then(res => setStats(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b-3 border-ink bg-bg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" id="back-to-feed" className="btn-outline text-sm px-3 py-2">← Feed</Link>
          <div className="bg-primary border-3 border-ink shadow-brutal px-3 py-1">
            <span className="font-mono font-bold text-white text-xl tracking-tight">FIX</span>
            <span className="font-mono font-bold text-accent text-xl tracking-tight">IT</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-ink">STATISTICS</h1>
          <p className="text-ink/60 mt-1">A summary of community reports right now.</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="border-3 border-ink bg-accent shadow-brutal px-8 py-4">
              <p className="font-mono font-bold animate-pulse">Loading statistics...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="border-3 border-danger bg-danger/10 shadow-brutal p-4">
            <p className="font-bold text-danger">⚠️ Failed to load: {error}</p>
          </div>
        )}

        {stats && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="border-3 border-ink bg-primary shadow-brutal p-5 text-white">
                <p className="font-mono text-xs uppercase tracking-widest opacity-70">Total Reports</p>
                <p className="text-5xl font-black mt-2">{stats.total_reports}</p>
              </div>
              <div className="border-3 border-ink bg-success shadow-brutal p-5 text-ink">
                <p className="font-mono text-xs uppercase tracking-widest opacity-70">Resolved</p>
                <p className="text-5xl font-black mt-2">{stats.resolved_count}</p>
              </div>
              <div className="border-3 border-ink bg-accent shadow-brutal p-5 text-ink">
                <p className="font-mono text-xs uppercase tracking-widest opacity-70">Resolved Rate</p>
                <p className="text-5xl font-black mt-2">{stats.resolved_rate.toFixed(1)}%</p>
              </div>
            </div>

            <div className="border-3 border-ink bg-white shadow-brutal p-6">
              <h2 className="font-mono font-bold text-xs uppercase tracking-widest mb-6">
                Reports by Category
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={(stats.by_category || []).map(c => ({
                    name: CATEGORY_LABELS[c.category] || c.category,
                    count: c.count,
                  }))}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#11111130" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'Space Mono', fontWeight: 700 }} />
                  <YAxis tick={{ fontSize: 10, fontFamily: 'Space Mono' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      border: '3px solid #111111',
                      borderRadius: 0,
                      fontFamily: 'Space Grotesk',
                      fontWeight: 700,
                      boxShadow: '4px 4px 0px #111111',
                    }}
                  />
                  <Bar dataKey="count" stroke="#111111" strokeWidth={2}>
                    {(stats.by_category || []).map((_, idx) => (
                      <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {stats.top_voted && stats.top_voted.length > 0 && (
              <div className="border-3 border-ink bg-white shadow-brutal p-6">
                <h2 className="font-mono font-bold text-xs uppercase tracking-widest mb-4">
                  🔥 Top 5 Most Voted Reports
                </h2>
                <div className="flex flex-col gap-3">
                  {stats.top_voted.map((r, i) => (
                    <Link
                      key={r.id}
                      to={`/reports/${r.id}`}
                      id={`top-report-${r.id}`}
                      className="flex items-center gap-4 border-3 border-ink p-3 hover:bg-accent/20 transition-colors"
                    >
                      <span className="font-mono font-black text-2xl text-ink/30 w-8 text-center">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{r.title}</p>
                        <p className="text-xs text-ink/50 font-mono">{r.location_text}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="font-mono font-bold text-lg">▲</span>
                        <span className="font-mono font-bold">{r.upvote_count}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
