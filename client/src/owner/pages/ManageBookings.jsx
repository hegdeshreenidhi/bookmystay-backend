// client/src/owner/pages/ManageBookings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getHotelBookings } from '../../api';

const STATUS_STYLE = {
  confirmed: { background: '#d1fae5', color: '#065f46' },
  pending:   { background: '#fef3c7', color: '#92400e' },
  cancelled: { background: '#fee2e2', color: '#991b1b' },
};

const fmt = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const ManageBookings = () => {
  const { getToken } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState('all');

  // ── Fetch hotel bookings ───────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        const res   = await getHotelBookings(token);
        if (res.data.success) setBookings(res.data.dashboardData.bookings);
        else setError('Could not load bookings.');
      } catch {
        setError('Failed to connect to server.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Status update (local — no backend endpoint yet) ────
  const updateStatus = (id, status) =>
    setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const counts = {
    all:       bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  if (loading) return (
    <div style={{ padding: 32, color: '#64748b' }}>Loading bookings…</div>
  );

  if (error) return (
    <div style={{ padding: 32, color: '#991b1b' }}>{error}</div>
  );

  return (
    <div style={{ padding: 32 }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0 }}>Manage Bookings</h1>
        <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
      </div>

      {/* ── Filter Tabs ──────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['all', 'pending', 'confirmed', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '7px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              background: filter === tab ? '#1e40af' : '#f1f5f9',
              color:      filter === tab ? '#fff'     : '#64748b',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* ── Bookings Table ───────────────────────────────── */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Guest', 'Room', 'Check-in', 'Check-out', 'Total', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '13px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b._id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 500, color: '#1e293b' }}>
                    {b.user?.username || '—'}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#475569', fontSize: 13 }}>
                    {b.room?.roomType || '—'}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#475569', fontSize: 13, whiteSpace: 'nowrap' }}>
                    {fmt(b.checkInDate)}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#475569', fontSize: 13, whiteSpace: 'nowrap' }}>
                    {fmt(b.checkOutDate)}
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: '#0f172a' }}>
                    ₹{b.totalPrice}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ ...STATUS_STYLE[b.status], padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {b.status?.charAt(0).toUpperCase() + b.status?.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {b.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => updateStatus(b._id, 'confirmed')}
                          style={{ background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => updateStatus(b._id, 'cancelled')}
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => updateStatus(b._id, 'cancelled')}
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
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
            No {filter === 'all' ? '' : filter} bookings found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;