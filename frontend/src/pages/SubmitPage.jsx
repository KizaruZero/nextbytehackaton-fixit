import { useState, useRef, Suspense, lazy } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';

const LocationPicker = lazy(() => import('../components/LocationPicker'));

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
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [showMap, setShowMap] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleMapPick = (picked) => {
    // Only store the coordinates — do NOT touch the location_text field
    setCoords(picked);
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const picked = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(picked);
        setShowMap(true);
        if (!form.location_text.trim()) {
          setForm(prev => ({
            ...prev,
            location_text: `${picked.lat.toFixed(5)}, ${picked.lng.toFixed(5)}`,
          }));
        }
      },
      () => alert('Could not get your location. Please allow location access.')
    );
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
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('description', form.description.trim());
    formData.append('category', form.category);
    formData.append('location_text', form.location_text.trim());
    if (coords) {
      formData.append('latitude', coords.lat.toString());
      formData.append('longitude', coords.lng.toString());
    }
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
          <Link to="/feed" id="back-home" className="btn-outline text-sm px-3 py-2">← Back</Link>
          <Link to="/">
            <div className="bg-primary border-3 border-ink shadow-brutal px-3 py-1">
              <span className="font-mono font-bold text-white text-xl tracking-tight">FIX</span>
              <span className="font-mono font-bold text-accent text-xl tracking-tight">IT</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
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
            <input id="field-title" name="title" type="text" value={form.title}
              onChange={handleChange} placeholder="e.g. Large pothole at the main intersection"
              maxLength={100} className="input-brutal" />
            {fieldErrors.title && <p className="text-danger text-xs font-bold mt-1">⚠️ {fieldErrors.title}</p>}
            <p className="text-xs text-ink/40 mt-1 text-right">{form.title.length}/100</p>
          </div>

          {/* Category */}
          <div>
            <label className="block font-mono font-bold text-xs uppercase tracking-widest mb-2">
              Category <span className="text-danger">*</span>
            </label>
            <select id="field-category" name="category" value={form.category}
              onChange={handleChange} className="input-brutal appearance-none">
              <option value="">-- Select a category --</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {fieldErrors.category && <p className="text-danger text-xs font-bold mt-1">⚠️ {fieldErrors.category}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono font-bold text-xs uppercase tracking-widest mb-2">
              Description <span className="text-danger">*</span>
            </label>
            <textarea id="field-description" name="description" value={form.description}
              onChange={handleChange} rows={5}
              placeholder="Describe the issue in detail: current condition, impact, and how long it has persisted..."
              className="input-brutal resize-none" />
            {fieldErrors.description && <p className="text-danger text-xs font-bold mt-1">⚠️ {fieldErrors.description}</p>}
          </div>

          {/* ── Field 1: Location Description (manual text) ── */}
          <div>
            <label className="block font-mono font-bold text-xs uppercase tracking-widest mb-2">
              Location Description <span className="text-danger">*</span>
            </label>
            <input id="field-location" name="location_text" type="text"
              value={form.location_text} onChange={handleChange}
              placeholder="e.g. Corner of Oak St. and Maple Ave., near the park entrance"
              className="input-brutal" />
            <p className="text-xs text-ink/40 mt-1">Describe the location in words so it's easy to find.</p>
            {fieldErrors.location_text && <p className="text-danger text-xs font-bold mt-1">⚠️ {fieldErrors.location_text}</p>}
          </div>

          {/* ── Field 2: GPS / Map Pin (optional) ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono font-bold text-xs uppercase tracking-widest">
                GPS Coordinates
                <span className="ml-2 font-normal normal-case text-ink/40">(optional)</span>
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={handleUseGPS}
                  className="text-xs border-3 border-ink px-3 py-1.5 font-bold bg-bg hover:bg-accent shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal">
                  📍 Use GPS
                </button>
                <button type="button" onClick={() => setShowMap(v => !v)}
                  className="text-xs border-3 border-ink px-3 py-1.5 font-bold bg-bg hover:bg-primary hover:text-white shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal">
                  {showMap ? '▲ Hide Map' : '🗺️ Pick on Map'}
                </button>
              </div>
            </div>

            {/* Coordinate display */}
            {coords ? (
              <div className="border-3 border-success bg-success/10 p-3 flex items-center justify-between">
                <div>
                  <p className="font-mono font-bold text-sm">
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </p>
                  <p className="text-xs text-ink/50 mt-0.5">Coordinates saved — will be stored with your report.</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs border-3 border-ink px-3 py-1.5 font-bold bg-primary text-white shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal transition-all"
                    onClick={e => e.stopPropagation()}
                  >
                    🗺️ Preview
                  </a>
                  <button type="button" onClick={() => setCoords(null)}
                    className="text-xs text-danger font-bold hover:underline">✕ Clear</button>
                </div>
              </div>
            ) : (
              <div className="border-3 border-dashed border-ink/30 p-3 text-center">
                <p className="text-xs text-ink/40 font-mono">No coordinates set — use GPS or pick on the map below.</p>
              </div>
            )}

            {/* Map */}
            {showMap && (
              <Suspense fallback={
                <div className="border-3 border-ink bg-accent/20 h-[280px] flex items-center justify-center mt-3">
                  <p className="font-mono font-bold animate-pulse">Loading map...</p>
                </div>
              }>
                <div className="mt-3">
                  <LocationPicker coords={coords} onPick={handleMapPick} />
                  <p className="text-xs text-ink/50 mt-2 font-mono">Click anywhere on the map to drop a pin.</p>
                </div>
              </Suspense>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block font-mono font-bold text-xs uppercase tracking-widest mb-2">
              Photo (optional, max 5MB)
            </label>
            <input id="field-image" ref={fileRef} type="file"
              accept=".jpg,.jpeg,.png,.webp" onChange={handleFileChange} className="hidden" />
            <div onClick={() => fileRef.current?.click()}
              className="border-3 border-dashed border-ink p-6 text-center cursor-pointer hover:bg-accent/20 transition-colors">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview"
                  className="max-h-48 mx-auto object-cover border-3 border-ink" />
              ) : (
                <div>
                  <p className="text-4xl mb-2">📷</p>
                  <p className="font-bold text-sm">Click to upload a photo</p>
                  <p className="text-xs text-ink/50 mt-1">JPG, PNG, or WebP • Max 5MB</p>
                </div>
              )}
            </div>
            {imagePreview && (
              <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="text-xs text-danger font-bold mt-2 hover:underline">
                ✕ Remove photo
              </button>
            )}
            {fieldErrors.image && <p className="text-danger text-xs font-bold mt-1">⚠️ {fieldErrors.image}</p>}
          </div>

          {error && (
            <div className="border-3 border-danger bg-danger/10 p-3">
              <p className="text-danger font-bold text-sm">⚠️ {error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button id="btn-submit" type="submit" disabled={loading}
              className="btn-brutal flex-1 text-center">
              {loading ? 'Submitting...' : '📤 Submit Report'}
            </button>
            <Link to="/feed" className="btn-outline px-6">Cancel</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
