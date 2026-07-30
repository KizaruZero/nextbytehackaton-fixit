import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const STEPS = [
  {
    number: '01',
    icon: '📝',
    title: 'Report an Issue',
    desc: 'Spotted a pothole, broken streetlight, or overflowing trash? Submit a report with a photo and exact location in under a minute.',
    color: 'bg-primary',
    textColor: 'text-white',
  },
  {
    number: '02',
    icon: '▲',
    title: 'Community Votes',
    desc: 'Your neighbors upvote the issues they care about most. The most critical problems naturally rise to the top — no admin required.',
    color: 'bg-accent',
    textColor: 'text-ink',
  },
  {
    number: '03',
    icon: '✅',
    title: 'Track Resolution',
    desc: 'Every status change is logged in a transparent timeline. Watch issues move from Pending → In Progress → Resolved.',
    color: 'bg-success',
    textColor: 'text-ink',
  },
];

const CATEGORIES = [
  { emoji: '🛣️', label: 'Damaged Roads' },
  { emoji: '🗑️', label: 'Waste & Trash' },
  { emoji: '💡', label: 'Broken Lights' },
  { emoji: '🏗️', label: 'Public Facilities' },
  { emoji: '🚨', label: 'Security' },
  { emoji: '📌', label: 'Other Issues' },
];

function AnimatedCounter({ target, duration = 1500 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}</span>;
}

export default function LandingPage() {
  const [stats, setStats] = useState({ total_reports: 0, resolved_count: 0, resolved_rate: 0 });

  useEffect(() => {
    api.getStats().then(res => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      {/* ── NAV ── */}
      <nav className="border-b-3 border-ink bg-bg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="bg-primary border-3 border-ink shadow-brutal px-3 py-1">
            <span className="font-mono font-bold text-white text-xl tracking-tight">FIX</span>
            <span className="font-mono font-bold text-accent text-xl tracking-tight">IT</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/stats" id="landing-nav-stats" className="btn-outline text-sm">📊 Stats</Link>
            <Link to="/feed" id="landing-nav-feed" className="btn-brutal text-sm">View Reports →</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Label tag */}
            <div className="inline-block border-3 border-ink bg-accent shadow-brutal px-3 py-1 mb-6"
              style={{ transform: 'rotate(-2deg)' }}>
              <span className="font-mono font-bold text-xs uppercase tracking-widest">
                Community Issue Tracker
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-black text-ink leading-none mb-4">
              SEE IT.<br />
              <span className="text-primary">REPORT</span><br />
              IT. FIX IT.
            </h1>

            <p className="text-lg text-ink/70 mb-8 leading-relaxed max-w-md">
              GitHub Issues for your neighborhood. Report community problems, let your
              neighbors vote on what matters most, and track every fix transparently.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/submit" id="hero-cta-submit" className="btn-brutal text-base px-8 py-3">
                + Report an Issue
              </Link>
              <Link to="/feed" id="hero-cta-feed" className="btn-outline text-base px-8 py-3">
                Browse Reports →
              </Link>
            </div>
          </div>

          {/* Stats panel */}
          <div className="flex flex-col gap-4">
            <div className="border-3 border-ink bg-primary shadow-brutal-lg p-8 text-white">
              <p className="font-mono text-xs uppercase tracking-widest opacity-70 mb-2">Total Issues Reported</p>
              <p className="text-7xl font-black leading-none">
                <AnimatedCounter target={stats.total_reports} />
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border-3 border-ink bg-success shadow-brutal p-6 text-ink">
                <p className="font-mono text-xs uppercase tracking-widest opacity-60 mb-1">Resolved</p>
                <p className="text-4xl font-black">
                  <AnimatedCounter target={stats.resolved_count} />
                </p>
              </div>
              <div className="border-3 border-ink bg-accent shadow-brutal p-6 text-ink">
                <p className="font-mono text-xs uppercase tracking-widest opacity-60 mb-1">Success Rate</p>
                <p className="text-4xl font-black">
                  {stats.resolved_rate.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-y-3 border-ink bg-ink py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-bg">HOW IT WORKS</h2>
            <p className="text-bg/60 mt-1">Three steps. Zero bureaucracy.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.number} className={`border-3 border-bg ${s.color} shadow-brutal p-7 relative`}>
                <span className="font-mono font-black text-6xl opacity-10 absolute top-4 right-4 leading-none select-none">
                  {s.number}
                </span>
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className={`text-xl font-black mb-2 ${s.textColor}`}>{s.title}</h3>
                <p className={`text-sm leading-relaxed ${s.textColor} opacity-80`}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-10">
          <h2 className="text-3xl font-black text-ink">WHAT CAN YOU REPORT?</h2>
          <p className="text-ink/60 mt-1">Anything affecting your community.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.label}
              to={`/feed?category=${encodeURIComponent(c.label)}`}
              className="border-3 border-ink bg-white shadow-brutal p-5 text-center
                         hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-hover
                         hover:bg-accent/30 transition-all duration-100 group"
            >
              <div className="text-4xl mb-2">{c.emoji}</div>
              <p className="text-xs font-bold leading-tight">{c.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── WHY FIXIT ── */}
      <section className="border-y-3 border-ink bg-accent py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-ink mb-10">WHY FIXIT?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: '🏘️', title: 'Bottom-Up Prioritization', desc: 'Votes from real residents — not bureaucrats — determine what gets fixed first.' },
              { icon: '📍', title: 'Precise Location', desc: 'Pin exact locations on a map so responders know exactly where to go.' },
              { icon: '🔍', title: 'Full Transparency', desc: 'Every status change is timestamped and public. No more wondering what happened.' },
              { icon: '🚀', title: 'Zero Friction', desc: 'No account needed. Just open the app, report the issue, and you\'re done.' },
            ].map((item) => (
              <div key={item.title} className="border-3 border-ink bg-white shadow-brutal p-6 flex gap-4">
                <div className="text-4xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-black text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-ink/70 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="border-3 border-ink bg-primary shadow-brutal-lg p-12">
          <h2 className="text-4xl font-black text-white mb-3">READY TO MAKE A DIFFERENCE?</h2>
          <p className="text-white/70 mb-8 text-lg">Your report could be the one that finally gets that pothole fixed.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/submit" id="bottom-cta-submit" className="btn-accent text-base px-10 py-3">
              + Report an Issue Now
            </Link>
            <Link to="/feed" id="bottom-cta-feed" className="btn-outline bg-white text-base px-10 py-3">
              Browse Reports →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t-3 border-ink bg-ink py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary border-3 border-bg px-3 py-1">
              <span className="font-mono font-bold text-white text-lg tracking-tight">FIX</span>
              <span className="font-mono font-bold text-accent text-lg tracking-tight">IT</span>
            </div>
            <p className="text-bg/50 text-xs font-mono">Community Issue Tracker</p>
          </div>
          <p className="text-bg/30 text-xs font-mono">Built for communities everywhere.</p>
        </div>
      </footer>
    </div>
  );
}
