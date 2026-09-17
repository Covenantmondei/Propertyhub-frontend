'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';
import { apiCall } from '@/lib/api';

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', property_type: '', listing_type: '', price: '',
    bedrooms: '', bathrooms: '', area_sqft: '', year_built: '', parking_spaces: '',
    address: '', city: '', state: '', zip_code: '', country: 'NIG', amenities: '',
  });

  useEffect(() => {
    if (!localStorage.getItem('authToken')) { router.replace('/login'); return; }
    const userStr = localStorage.getItem('user');
    if (userStr) { try { const u = JSON.parse(userStr); if (u.role !== 'agent') router.replace('/home'); } catch {} }
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Create property
      const payload: any = {
        title: form.title,
        description: form.description,
        property_type: form.property_type,
        listing_type: form.listing_type,
        price: parseFloat(form.price),
        address: form.address,
        city: form.city,
        state: form.state,
        zip_code: form.zip_code,
        country: form.country,
      };
      if (form.bedrooms) payload.bedrooms = parseInt(form.bedrooms);
      if (form.bathrooms) payload.bathrooms = parseInt(form.bathrooms);
      if (form.area_sqft) payload.area_sqft = parseFloat(form.area_sqft);
      if (form.year_built) payload.year_built = parseInt(form.year_built);
      if (form.parking_spaces) payload.parking_spaces = parseInt(form.parking_spaces);
      if (form.amenities) payload.amenities = form.amenities.split('\n').map(a => a.trim()).filter(Boolean);

      const created = await apiCall('/properties/', { method: 'POST', body: JSON.stringify(payload) });

      // Upload images
      if (imageFiles.length > 0 && created.id) {
        for (let i = 0; i < imageFiles.length; i++) {
          const fd = new FormData();
          fd.append('file', imageFiles[i]);
          if (i === 0) fd.append('is_primary', 'true');
          await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/properties/${created.id}/images`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
            body: fd,
          });
        }
      }

      alert('Property listed successfully! Awaiting admin approval.');
      router.push('/agent-dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to list property');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AppNav />
      <main className="py-8">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="card">
            <div className="card-content p-6">
              <h1 className="text-3xl font-bold mb-2">List New Property</h1>
              <p className="text-muted mb-6">Fill in the details below to list your property</p>

              <form id="new-property-form" className="grid gap-6" onSubmit={handleSubmit}>
                {/* Basic Info */}
                <div className="form-section">
                  <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                  <div className="form-group">
                    <label htmlFor="title" className="form-label">Property Title *</label>
                    <input type="text" id="title" name="title" className="form-input" required placeholder="e.g., Modern Downtown Apartment" value={form.title} onChange={handleInput} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description" className="form-label">Description *</label>
                    <textarea id="description" name="description" rows={4} className="form-input" required placeholder="Describe your property..." value={form.description} onChange={handleInput}></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="property_type" className="form-label">Property Type *</label>
                      <select id="property_type" name="property_type" className="form-select" required value={form.property_type} onChange={handleInput}>
                        <option value="">Select Type</option>
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                        <option value="condo">Condo</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="land">Land</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="listing_type" className="form-label">Listing Type *</label>
                      <select id="listing_type" name="listing_type" className="form-select" required value={form.listing_type} onChange={handleInput}>
                        <option value="">Select Type</option>
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="price" className="form-label">Price (NGN) *</label>
                    <input type="number" id="price" name="price" className="form-input" required min="0" step="0.01" placeholder="0.00" value={form.price} onChange={handleInput} />
                  </div>
                </div>

                {/* Details */}
                <div className="form-section">
                  <h2 className="text-xl font-semibold mb-4">Property Details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group"><label htmlFor="bedrooms" className="form-label">Bedrooms</label><input type="number" id="bedrooms" name="bedrooms" className="form-input" min="0" placeholder="0" value={form.bedrooms} onChange={handleInput} /></div>
                    <div className="form-group"><label htmlFor="bathrooms" className="form-label">Bathrooms</label><input type="number" id="bathrooms" name="bathrooms" className="form-input" min="0" placeholder="0" value={form.bathrooms} onChange={handleInput} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group"><label htmlFor="area_sqft" className="form-label">Area (sq ft)</label><input type="number" id="area_sqft" name="area_sqft" className="form-input" min="0" step="0.01" placeholder="0" value={form.area_sqft} onChange={handleInput} /></div>
                    <div className="form-group"><label htmlFor="year_built" className="form-label">Year Built</label><input type="number" id="year_built" name="year_built" className="form-input" min="1800" max="2100" placeholder="2020" value={form.year_built} onChange={handleInput} /></div>
                  </div>
                  <div className="form-group"><label htmlFor="parking_spaces" className="form-label">Parking Spaces</label><input type="number" id="parking_spaces" name="parking_spaces" className="form-input" min="0" placeholder="0" value={form.parking_spaces} onChange={handleInput} /></div>
                </div>

                {/* Location */}
                <div className="form-section">
                  <h2 className="text-xl font-semibold mb-4">Location</h2>
                  <div className="form-group"><label htmlFor="address" className="form-label">Street Address *</label><input type="text" id="address" name="address" className="form-input" required placeholder="123 Main St" value={form.address} onChange={handleInput} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group"><label htmlFor="city" className="form-label">City *</label><input type="text" id="city" name="city" className="form-input" required placeholder="Lagos" value={form.city} onChange={handleInput} /></div>
                    <div className="form-group"><label htmlFor="state" className="form-label">State *</label><input type="text" id="state" name="state" className="form-input" required placeholder="Lagos State" value={form.state} onChange={handleInput} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group"><label htmlFor="zip_code" className="form-label">ZIP Code</label><input type="text" id="zip_code" name="zip_code" className="form-input" placeholder="100001" value={form.zip_code} onChange={handleInput} /></div>
                    <div className="form-group"><label htmlFor="country" className="form-label">Country</label><input type="text" id="country" name="country" className="form-input" value={form.country} onChange={handleInput} /></div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="form-section">
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="form-group">
                    <label htmlFor="amenities" className="form-label">Amenities (one per line)</label>
                    <textarea id="amenities" name="amenities" rows={4} className="form-input" placeholder="Swimming Pool&#10;Gym&#10;Security&#10;Parking" value={form.amenities} onChange={handleInput}></textarea>
                    <small className="text-muted">Enter each amenity on a new line</small>
                  </div>
                </div>

                {/* Images */}
                <div className="form-section">
                  <h2 className="text-xl font-semibold mb-4">Images</h2>
                  <div className="form-group">
                    <label htmlFor="images" className="form-label">Property Images</label>
                    <input type="file" id="images" name="images" className="form-input" multiple accept="image/*" onChange={handleImages} />
                    <small className="text-muted">You can select multiple images. First image will be set as primary.</small>
                  </div>
                  {imagePreviews.length > 0 && (
                    <div id="preview-images" className="image-preview-grid">
                      {imagePreviews.map((src, i) => (
                        <img key={i} src={src} alt={`Preview ${i + 1}`} style={{ width: '100px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-actions flex gap-4">
                  <button type="submit" className="btn btn-primary flex-1" id="submit-btn" disabled={loading}>
                    <span className="btn-text">{loading ? 'Processing...' : 'List Property'}</span>
                  </button>
                  <a href="/properties" className="btn btn-outline flex-1" style={{ textAlign: 'center' }}>Cancel</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <AppFooter />
    </>
  );
}
