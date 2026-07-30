import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';

const CATEGORIES = [
  { value: 'jalan_rusak', label: '🛣️ Damaged Road' },
  { value: 'sampah', label: '🗑️ Waste / Trash' },
  { value: 'lampu_mati', label: '💡 Broken Light' },
  { value: 'fasilitas_umum', label: '🏗️ Public Facility' },
  { value: 'keamanan', label: '🚨 Security' },
  { value: 'lainnya', label: '📌 Other' },
];

export default function SubmitPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    title: '', description: '', category: '', location_text: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors(prev => ({ ...prev, image: 'Image must be smaller than 5MB' }));
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFieldErrors(prev => ({ ...prev, image: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (form.title.length > 100) errs.title = 'Title must not exceed 100 characters';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.location_text.trim()) errs.location_text = 'Location is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('description', form.description.trim());
    formData.append('category', form.category);
    formData.append('location_text', form.location_text.trim());
    if (imageFile) formData.append('image', imageFile);

    try {
      const res = await api.createReport(formData);
      navigate(`/reports/${res.data.id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b-3 border-ink bg-bg sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" id="back-home" className="btn-outline text-sm px-3 py-2">
            ← Back
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-primary border-3 border-ink shadow-brutal px-3 py-1">
              <span className="font-mono font-bold text-white text-xl tracking-tight">FIX</span>
              <span className="font-mono font-bold text-accent text-xl tracking-tight">IT</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-ink">REPORT AN ISSUE</h1>
          <p className="text-ink/60 mt-1">Fill in the details clearly so it can be acted upon quickly.</p>
        </div>

        <form id="submit-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Title */}
          <div>
            <label className="block font-mono font-bold text-xs uppercase tracking-widest mb-2">
              Title <span className="text-danger">*</span>
            </label>
            <input
              id="field-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Large pothole at the main intersection"
              maxLength={100}
              className="input-brutal"
            />
            {fieldErrors.title && (
              <p className="text-danger text-xs font-bold mt-1">⚠️ {fieldErrors.title}</p>
            )}
            <p className="text-xs text-ink/40 mt-1 text-right">{form.title.length}/100</p>
          </div>

          {/* Category */}
          <div>
            <label className="block font-mono font-bold text-xs uppercase tracking-widest mb-2">
              Category <span className="text-danger">*</span>
            </label>
            <select
              id="field-category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input-brutal appearance-none"
            >
              <option value="">-- Select a category --</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {fieldErrors.category && (
              <p className="text-danger text-xs font-bold mt-1">⚠️ {fieldErrors.category}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono font-bold text-xs uppercase tracking-widest mb-2">
              Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="field-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe the issue in detail: current condition, impact, and how long it has persisted..."
              className="input-brutal resize-none"
            />
            {fieldErrors.description && (
              <p className="text-danger text-xs font-bold mt-1">⚠️ {fieldErrors.description}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block font-mono font-bold text-xs uppercase tracking-widest mb-2">
              Location <span className="text-danger">*</span>
            </label>
            <input
              id="field-location"
              name="location_text"
              type="text"
              value={form.location_text}
              onChange={handleChange}
              placeholder="e.g. Corner of Oak St. and Maple Ave., near the park entrance"
              className="input-brutal"
            />
            {fieldErrors.location_text && (
              <p className="text-danger text-xs font-bold mt-1">⚠️ {fieldErrors.location_text}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block font-mono font-bold text-xs uppercase tracking-widest mb-2">
              Photo (optional, max 5MB)
            </label>
            <input
              id="field-image"
              ref={fileRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileRef.current?.click()}
              className="border-3 border-dashed border-ink p-6 text-center cursor-pointer hover:bg-accent/20 transition-colors"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 mx-auto object-cover border-3 border-ink"
                />
              ) : (
                <div>
                  <p className="text-4xl mb-2">📷</p>
                  <p className="font-bold text-sm">Click to upload a photo</p>
                  <p className="text-xs text-ink/50 mt-1">JPG, PNG, or WebP • Max 5MB</p>
                </div>
              )}
            </div>
            {imagePreview && (
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="text-xs text-danger font-bold mt-2 hover:underline"
              >
                ✕ Remove photo
              </button>
            )}
            {fieldErrors.image && (
              <p className="text-danger text-xs font-bold mt-1">⚠️ {fieldErrors.image}</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="border-3 border-danger bg-danger/10 p-3">
              <p className="text-danger font-bold text-sm">⚠️ {error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              id="btn-submit"
              type="submit"
              disabled={loading}
              className="btn-brutal flex-1 text-center"
            >
              {loading ? 'Submitting...' : '📤 Submit Report'}
            </button>
            <Link to="/" className="btn-outline px-6">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
