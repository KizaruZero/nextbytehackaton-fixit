import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';

const CATEGORIES = [
  { value: 'jalan_rusak', label: '🛣️ Jalan Rusak' },
  { value: 'sampah', label: '🗑️ Sampah' },
  { value: 'lampu_mati', label: '💡 Lampu Mati' },
  { value: 'fasilitas_umum', label: '🏗️ Fasilitas Umum' },
  { value: 'keamanan', label: '🚨 Keamanan' },
  { value: 'lainnya', label: '📌 Lainnya' },
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
      setFieldErrors(prev => ({ ...prev, image: 'Ukuran gambar maksimal 5MB' }));
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFieldErrors(prev => ({ ...prev, image: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Judul wajib diisi';
    if (form.title.length > 100) errs.title = 'Judul maksimal 100 karakter';
    if (!form.description.trim()) errs.description = 'Deskripsi wajib diisi';
    if (!form.category) errs.category = 'Kategori wajib dipilih';
    if (!form.location_text.trim()) errs.location_text = 'Lokasi wajib diisi';
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
            ← Kembali
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
          <h1 className="text-4xl font-black text-ink">LAPOR MASALAH</h1>
          <p className="text-ink/60 mt-1">Isi detail laporan dengan jelas agar mudah ditindaklanjuti.</p>
        </div>

        <form id="submit-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Title */}
          <div>
            <label className="block font-mono font-bold text-xs uppercase tracking-widest mb-2">
              Judul <span className="text-danger">*</span>
            </label>
            <input
              id="field-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Contoh: Jalan berlubang di depan SD Negeri 01"
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
              Kategori <span className="text-danger">*</span>
            </label>
            <select
              id="field-category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input-brutal appearance-none"
            >
              <option value="">-- Pilih kategori --</option>
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
              Deskripsi <span className="text-danger">*</span>
            </label>
            <textarea
              id="field-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Jelaskan masalahnya secara detail: kondisi saat ini, dampaknya, dan sudah berapa lama terjadi..."
              className="input-brutal resize-none"
            />
            {fieldErrors.description && (
              <p className="text-danger text-xs font-bold mt-1">⚠️ {fieldErrors.description}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block font-mono font-bold text-xs uppercase tracking-widest mb-2">
              Lokasi <span className="text-danger">*</span>
            </label>
            <input
              id="field-location"
              name="location_text"
              type="text"
              value={form.location_text}
              onChange={handleChange}
              placeholder="Contoh: Jl. Pahlawan No. 10, RT 03/RW 05, Kelurahan Maju"
              className="input-brutal"
            />
            {fieldErrors.location_text && (
              <p className="text-danger text-xs font-bold mt-1">⚠️ {fieldErrors.location_text}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block font-mono font-bold text-xs uppercase tracking-widest mb-2">
              Foto (opsional, maks 5MB)
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
                  <p className="font-bold text-sm">Klik untuk upload foto</p>
                  <p className="text-xs text-ink/50 mt-1">JPG, PNG, atau WebP • Maks 5MB</p>
                </div>
              )}
            </div>
            {imagePreview && (
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="text-xs text-danger font-bold mt-2 hover:underline"
              >
                ✕ Hapus foto
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
              {loading ? 'Mengirim...' : '📤 Kirim Laporan'}
            </button>
            <Link to="/" className="btn-outline px-6">
              Batal
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
