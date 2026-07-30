export default function UpvoteButton({ count, voted, onClick, loading }) {
  return (
    <button
      id="upvote-btn"
      onClick={onClick}
      disabled={voted || loading}
      className={`
        flex flex-col items-center justify-center
        border-3 border-ink w-16 h-16
        font-bold shadow-brutal transition-all duration-100
        select-none
        ${voted
          ? 'bg-accent text-ink cursor-default translate-x-[2px] translate-y-[2px] shadow-brutal-sm'
          : 'bg-white text-ink hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-hover active:translate-x-[4px] active:translate-y-[4px] active:shadow-none cursor-pointer'
        }
        ${loading ? 'opacity-60' : ''}
      `}
      title={voted ? 'Sudah diupvote' : 'Upvote laporan ini'}
    >
      <span className="text-lg leading-none">{voted ? '▲' : '△'}</span>
      <span className="text-sm font-mono font-bold leading-tight mt-0.5">{count}</span>
    </button>
  );
}
