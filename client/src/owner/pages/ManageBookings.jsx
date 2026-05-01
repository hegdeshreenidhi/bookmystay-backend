import React, { useState } from 'react';

const initialBookings = [
  { id: 1, guest: 'Alice Johnson', room: 'Deluxe Ocean View',  checkIn: '2026-03-10', checkOut: '2026-03-14', total: 720,  status: 'confirmed' },
  { id: 2, guest: 'Bob Smith',     room: 'Presidential Suite', checkIn: '2026-03-12', checkOut: '2026-03-15', total: 1350, status: 'pending'   },
  { id: 3, guest: 'Carol White',   room: 'Garden Bungalow',    checkIn: '2026-03-08', checkOut: '2026-03-11', total: 660,  status: 'confirmed' },
  { id: 4, guest: 'David Lee',     room: 'Standard Twin',      checkIn: '2026-03-14', checkOut: '2026-03-16', total: 180,  status: 'pending'   },
  { id: 5, guest: 'Eva Green',     room: 'Deluxe Ocean View',  checkIn: '2026-03-18', checkOut: '2026-03-20', total: 360,  status: 'cancelled' },
];

const statusStyle = {
  confirmed: { background: '#d1fae5', color: '#065f46' },
  pending:   { background: '#fef3c7', color: '#92400e' },
  cancelled: { background: '#fee2e2', color: '#991b1b' },
};

const ManageBookings = () => {
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter]     = useState('all');

  const updateStatus = (id, status) =>
    setBookings(b => b.map(bk => bk.id === id ? { ...bk, status } : bk));

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const counts = {
    all:       bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div style={{ padding: 32 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0 }}>Manage Bookings</h1>
        <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>{bookings.length} total bookings</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['all', 'pending', 'confirmed', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '7px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
              background: filter === tab ? '#1e40af' : '#f1f5f9',
              color: filter === tab ? '#fff' : '#64748b',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Guest', 'Room', 'Check-in', 'Check-out', 'Total', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '13px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, i) => (
              <tr key={b.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '14px 20px', fontWeight: 500, color: '#1e293b' }}>{b.guest}</td>
                <td style={{ padding: '14px 20px', color: '#475569', fontSize: 13 }}>{b.room}</td>
                <td style={{ padding: '14px 20px', color: '#475569', fontSize: 13 }}>{b.checkIn}</td>
                <td style={{ padding: '14px 20px', color: '#475569', fontSize: 13 }}>{b.checkOut}</td>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: '#0f172a' }}>${b.total}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ ...statusStyle[b.status], padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  {b.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => updateStatus(b.id, 'confirmed')}
                        style={{ background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => updateStatus(b.id, 'cancelled')}
                        style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  )}
                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => updateStatus(b.id, 'cancelled')}
                      style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}
                    >
                      Cancel
                    </button>
                  )}
                  {b.status === 'cancelled' && (
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
            No {filter} bookings found.
          </div>
        )}
      </div>

    </div>
  );
};

export default ManageBookings;