import React, { useState } from 'react';

const initialRooms = [
  { id: 1, name: 'Deluxe Ocean View', type: 'Deluxe',   price: 180, available: true  },
  { id: 2, name: 'Presidential Suite', type: 'Suite',   price: 450, available: true  },
  { id: 3, name: 'Standard Twin',      type: 'Standard', price: 90, available: false },
  { id: 4, name: 'Garden Bungalow',    type: 'Deluxe',  price: 220, available: true  },
];

const emptyForm = { name: '', type: 'Standard', price: '', available: true };

const ManageRooms = () => {
  const [rooms, setRooms]       = useState(initialRooms);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);

  const handleSave = () => {
    if (!form.name || !form.price) return;
    if (editId !== null) {
      setRooms(r => r.map(room => room.id === editId ? { ...room, ...form, price: Number(form.price) } : room));
      setEditId(null);
    } else {
      setRooms(r => [...r, { ...form, id: Date.now(), price: Number(form.price) }]);
    }
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleEdit = (room) => {
    setForm({ name: room.name, type: room.type, price: room.price, available: room.available });
    setEditId(room.id);
    setShowForm(true);
  };

  const handleDelete = (id) => setRooms(r => r.filter(room => room.id !== id));

  const toggleAvailable = (id) => setRooms(r => r.map(room => room.id === id ? { ...room, available: !room.available } : room));

  return (
    <div style={{ padding: 32 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0 }}>Manage Rooms</h1>
          <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>{rooms.length} rooms total</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          style={{ background: '#1e40af', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
        >
          + Add Room
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 20px', color: '#0f172a' }}>{editId ? 'Edit Room' : 'Add New Room'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {[['Room Name', 'name', 'text'], ['Price per Night ($)', 'price', 'number']].map(([label, key, type]) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: 500 }}>{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: 500 }}>Room Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }}
              >
                {['Standard', 'Deluxe', 'Suite'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: 500 }}>Available</label>
              <select
                value={form.available}
                onChange={e => setForm(f => ({ ...f, available: e.target.value === 'true' }))}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14 }}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleSave} style={{ background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 22px', cursor: 'pointer', fontWeight: 600 }}>
              {editId ? 'Update' : 'Save Room'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: '9px 22px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rooms Table */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Room Name', 'Type', 'Price/Night', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '13px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room, i) => (
              <tr key={room.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '14px 24px', fontWeight: 500, color: '#1e293b' }}>{room.name}</td>
                <td style={{ padding: '14px 24px', color: '#475569' }}>{room.type}</td>
                <td style={{ padding: '14px 24px', color: '#0f172a', fontWeight: 600 }}>${room.price}</td>
                <td style={{ padding: '14px 24px' }}>
                  <button
                    onClick={() => toggleAvailable(room.id)}
                    style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                      background: room.available ? '#d1fae5' : '#fee2e2',
                      color: room.available ? '#065f46' : '#991b1b',
                    }}
                  >
                    {room.available ? '✓ Available' : '✗ Unavailable'}
                  </button>
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleEdit(room)} style={{ background: '#eff6ff', color: '#1e40af', border: 'none', borderRadius: 7, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Edit</button>
                    <button onClick={() => handleDelete(room.id)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 7, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default ManageRooms;