// client/src/owner/pages/ManageRooms.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getOwnerRooms, createRoom, toggleRoomAvail } from '../../api';

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Executive', 'Family Suite', 'Penthouse'];
const AMENITY_OPTIONS = ['Free WiFi', 'AC', 'Breakfast', 'Room Service', 'Pool Access', 'Parking', 'Gym', 'Spa'];

const emptyForm = { roomType: 'Standard', pricePerNight: '', amenities: [], images: [] };

const ManageRooms = () => {
  const { getToken }    = useAuth();
  const fileRef         = useRef();

  const [rooms, setRooms]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [toggling, setToggling]   = useState(null); // roomId being toggled
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  // ── Fetch owner's rooms ────────────────────────────────
  const fetchRooms = async () => {
    try {
      const token = await getToken();
      const res   = await getOwnerRooms(token);
      if (res.data.success) setRooms(res.data.rooms);
    } catch {
      setError('Failed to load rooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  // ── Add room ──────────────────────────────────────────
  const handleSave = async () => {
    if (!form.pricePerNight || form.images.length === 0) {
      setError('Please fill all fields and add at least one image.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('roomType',      form.roomType);
      formData.append('pricePerNight', form.pricePerNight);
      formData.append('amenities',     JSON.stringify(form.amenities));
      form.images.forEach(img => formData.append('images', img));

      const token = await getToken();
      const res   = await createRoom(formData, token);

      if (res.data.success) {
        setSuccess('Room added successfully!');
        setForm(emptyForm);
        setShowForm(false);
        fetchRooms();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.data.message || 'Failed to create room.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle availability ───────────────────────────────
  const handleToggle = async (roomId) => {
    setToggling(roomId);
    try {
      const token = await getToken();
      const res   = await toggleRoomAvail(roomId, token);
      if (res.data.success) {
        setRooms(prev => prev.map(r =>
          r._id === roomId ? { ...r, isAvailable: !r.isAvailable } : r
        ));
      }
    } catch {
      setError('Failed to update availability.');
    } finally {
      setToggling(null);
    }
  };

  // ── Image picker ──────────────────────────────────────
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setForm(f => ({ ...f, images: files }));
  };

  const toggleAmenity = (amenity) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter(a => a !== amenity)
        : [...f.amenities, amenity],
    }));
  };

  if (loading) return (
    <div style={{ padding: 32, color: '#64748b' }}>Loading rooms…</div>
  );

  return (
    <div style={{ padding: 32 }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0 }}>Manage Rooms</h1>
          <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>{rooms.length} room{rooms.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm(emptyForm); setError(''); }}
          style={{ background: '#1e40af', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
        >
          + Add Room
        </button>
      </div>

      {/* ── Alerts ──────────────────────────────────────── */}
      {success && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontWeight: 500 }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* ── Add Room Form ────────────────────────────────── */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 20px', color: '#0f172a' }}>Add New Room</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
            {/* Room Type */}
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: 500 }}>Room Type</label>
              <select
                value={form.roomType}
                onChange={e => setForm(f => ({ ...f, roomType: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }}
              >
                {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Price */}
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: 500 }}>Price per Night (₹)</label>
              <input
                type="number"
                min="1"
                value={form.pricePerNight}
                onChange={e => setForm(f => ({ ...f, pricePerNight: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Amenities */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#475569', marginBottom: 10, fontWeight: 500 }}>Amenities</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {AMENITY_OPTIONS.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: '1px solid',
                    background: form.amenities.includes(a) ? '#1e40af' : '#f8fafc',
                    color:      form.amenities.includes(a) ? '#fff'     : '#475569',
                    borderColor:form.amenities.includes(a) ? '#1e40af' : '#e2e8f0',
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: 500 }}>
              Room Images (up to 4)
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              style={{ padding: '9px 18px', border: '1px dashed #94a3b8', borderRadius: 8, background: '#f8fafc', cursor: 'pointer', fontSize: 13, color: '#475569' }}
            >
              📷 Choose Images
            </button>
            {form.images.length > 0 && (
              <p style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
                {form.images.length} file(s) selected: {form.images.map(f => f.name).join(', ')}
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ background: saving ? '#93c5fd' : '#1e40af', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 22px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600 }}
            >
              {saving ? 'Saving…' : 'Save Room'}
            </button>
            <button
              onClick={() => { setShowForm(false); setError(''); }}
              style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: '9px 22px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Rooms Table ──────────────────────────────────── */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
            No rooms yet. Add your first room above.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Image', 'Type', 'Price/Night', 'Amenities', 'Status'].map(h => (
                  <th key={h} style={{ padding: '13px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, i) => (
                <tr key={room._id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '12px 20px' }}>
                    {room.images?.[0] && (
                      <img src={room.images[0]} alt={room.roomType}
                        style={{ width: 60, height: 44, objectFit: 'cover', borderRadius: 6 }} />
                    )}
                  </td>
                  <td style={{ padding: '12px 20px', fontWeight: 600, color: '#1e293b' }}>{room.roomType}</td>
                  <td style={{ padding: '12px 20px', color: '#0f172a', fontWeight: 600 }}>₹{room.pricePerNight}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {room.amenities?.slice(0, 3).map((a, idx) => (
                        <span key={idx} style={{ background: '#eff6ff', color: '#1e40af', fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>
                          {a}
                        </span>
                      ))}
                      {room.amenities?.length > 3 && (
                        <span style={{ fontSize: 11, color: '#64748b' }}>+{room.amenities.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <button
                      onClick={() => handleToggle(room._id)}
                      disabled={toggling === room._id}
                      style={{
                        padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none',
                        cursor: toggling === room._id ? 'not-allowed' : 'pointer',
                        background: room.isAvailable ? '#d1fae5' : '#fee2e2',
                        color:      room.isAvailable ? '#065f46' : '#991b1b',
                        opacity:    toggling === room._id ? 0.6 : 1,
                      }}
                    >
                      {toggling === room._id ? '…' : room.isAvailable ? '✓ Available' : '✗ Unavailable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageRooms;