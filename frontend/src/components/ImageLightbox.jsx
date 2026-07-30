import { useEffect, useCallback } from 'react';

export default function ImageLightbox({ src, alt, onClose }) {
  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  return (
    <div
      id="lightbox-overlay"
      className="fixed inset-0 z-[9000] bg-ink/90 flex items-center justify-center p-4 cursor-zoom-out"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 border-3 border-bg text-bg bg-ink
                   w-10 h-10 font-black text-xl flex items-center justify-center
                   hover:bg-danger hover:border-danger transition-colors z-10"
        aria-label="Close"
      >
        ✕
      </button>

      {/* ESC hint */}
      <p className="absolute top-5 left-1/2 -translate-x-1/2 font-mono text-xs text-bg/50">
        Press ESC or click outside to close
      </p>

      {/* Image */}
      <div
        className="border-3 border-bg shadow-brutal-lg max-w-5xl max-h-[85vh] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[85vh] object-contain block"
        />
      </div>
    </div>
  );
}
