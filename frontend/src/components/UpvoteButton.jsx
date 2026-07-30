import { useState, useEffect } from 'react';

export default function UpvoteButton({ count, voted, onClick, loading }) {
  const [animating, setAnimating] = useState(false);
  const [showParticle, setShowParticle] = useState(false);
  const [prevCount, setPrevCount] = useState(count);
  const [displayCount, setDisplayCount] = useState(count);

  // When count increases (just voted), trigger animations
  useEffect(() => {
    if (count > prevCount) {
      setAnimating(true);
      setShowParticle(true);
      // Animate the number rolling up
      setDisplayCount(count);
      const t1 = setTimeout(() => setAnimating(false), 400);
      const t2 = setTimeout(() => setShowParticle(false), 800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    setDisplayCount(count);
    setPrevCount(count);
  }, [count]);

  return (
    <div className="relative flex-shrink-0">
      {/* Floating "+1" particle */}
      {showParticle && (
        <span
          className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-black text-primary
                     pointer-events-none select-none"
          style={{ animation: 'floatUp 0.8s ease-out forwards' }}
        >
          +1
        </span>
      )}

      <button
        id="upvote-btn"
        onClick={onClick}
        disabled={voted || loading}
        className={`
          flex flex-col items-center justify-center
          border-3 border-ink w-16 h-16
          font-bold shadow-brutal transition-all duration-100
          select-none relative overflow-hidden
          ${voted
            ? 'bg-accent text-ink cursor-default translate-x-[2px] translate-y-[2px] shadow-brutal-sm'
            : 'bg-white text-ink hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-hover active:translate-x-[4px] active:translate-y-[4px] active:shadow-none cursor-pointer'
          }
          ${loading ? 'opacity-60' : ''}
          ${animating ? 'scale-110' : 'scale-100'}
        `}
        style={{ transition: animating ? 'transform 0.15s ease-out' : 'transform 0.1s ease-in, box-shadow 0.1s, translate 0.1s' }}
        title={voted ? 'Already upvoted' : 'Upvote this report'}
      >
        {/* Ripple flash on vote */}
        {animating && (
          <span
            className="absolute inset-0 bg-accent/60 pointer-events-none"
            style={{ animation: 'rippleFade 0.4s ease-out forwards' }}
          />
        )}

        <span
          className="text-lg leading-none"
          style={animating ? { animation: 'bounceArrow 0.4s ease-out' } : {}}
        >
          {voted ? '▲' : '△'}
        </span>

        <span
          className="text-sm font-mono font-bold leading-tight mt-0.5"
          style={animating ? { animation: 'countPop 0.35s ease-out' } : {}}
        >
          {displayCount}
        </span>
      </button>

      {/* Keyframe definitions injected once via a style tag */}
      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-28px); }
        }
        @keyframes rippleFade {
          0%   { opacity: 0.7; }
          100% { opacity: 0; }
        }
        @keyframes bounceArrow {
          0%   { transform: translateY(0); }
          40%  { transform: translateY(-5px); }
          70%  { transform: translateY(2px); }
          100% { transform: translateY(0); }
        }
        @keyframes countPop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
