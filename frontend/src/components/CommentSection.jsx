import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { getDeviceToken } from '../utils/deviceToken';

function formatDate(dt) {
  return new Date(dt).toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function CommentSection({ reportId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const myToken = getDeviceToken();

  useEffect(() => {
    api.getComments(reportId)
      .then(res => setComments(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [reportId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.createComment(reportId, trimmed);
      setComments(prev => [...prev, res.data]);
      setContent('');
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-3 border-ink bg-white shadow-brutal p-5">
      <h3 className="font-mono font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
        💬 Comments
        <span className="border-3 border-ink bg-accent px-2 py-0.5 text-xs font-black">
          {comments.length}
        </span>
      </h3>

      {/* Comment list */}
      {loading ? (
        <p className="font-mono text-xs text-ink/50 animate-pulse">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-ink/50 italic mb-4">No comments yet. Be the first!</p>
      ) : (
        <div className="flex flex-col gap-3 mb-5">
          {comments.map((c) => {
            const isMe = c.device_token === myToken;
            return (
              <div key={c.id}
                className={`border-3 border-ink p-3 ${isMe ? 'bg-accent/20' : 'bg-bg'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-xs text-ink/50">
                    {isMe ? '👤 You' : `👤 User #${String(c.device_token).slice(0, 6)}`}
                  </span>
                  <span className="font-mono text-xs text-ink/40">{formatDate(c.created_at)}</span>
                </div>
                <p className="text-sm text-ink leading-relaxed">{c.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* New comment form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t-3 border-ink/20 pt-4">
        <label className="font-mono font-bold text-xs uppercase tracking-widest">
          Leave a Comment
        </label>
        <textarea
          id="comment-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Share observations, updates, or additional context..."
          className="input-brutal resize-none text-sm"
        />
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-ink/40">{content.length}/1000</span>
          {error && <p className="text-danger text-xs font-bold">⚠️ {error}</p>}
          <button
            id="btn-post-comment"
            type="submit"
            disabled={submitting || !content.trim()}
            className="btn-brutal text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting...' : '💬 Post Comment'}
          </button>
        </div>
      </form>
    </div>
  );
}
