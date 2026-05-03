import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getHotelBookings, getOwnerRooms } from '../../api';

const statusStyle = {
  confirmed: { background: '#d1fae5', color: '#065f46' },
  pending:   { background: '#fef3c7', color: '#92400e' },
  cancelled: { background: '#fee2e2', color: '#991b1b' },
};

const fmt = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const OwnerDashboard = () => {
  const { getToken } = useAuth();
  const [stats, setStats]       = useState({ totalRooms: 0, totalBookings: 0, pending: 0, revenue: 0 });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        const [bookRes, roomRes] = await Promise.all([
          getHotelBookings(token),
          getOwnerRooms(token),
        ]);

        if (bookRes.data.success) {
          const { totalBookings, totalRevenue, bookings: bList } = bookRes.data.dashboardData;
          const pending = bList.filter(b => b.status === 'pending').length;
          setStats({
            totalRooms:    roomRes.data.success ? roomRes.data.rooms.length : 0,
            totalBookings,
            pending,
            revenue:       totalRevenue,
          });
          setBookings(bList.slice(0, 6)); // show 6 most recent
        } else {
          setError(bookRes.data.message || 'Failed to load dashboard.');
        }
      } catch {
        setError('Could not connect to server.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Rooms',    value: stats.totalRooms,    icon: '🛏️',  color: '#3b82f6' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: '📅',  color: '#10b981' },
    { label: 'Pending',        value: stats.pending,        icon: '⏳',  color: '#f59e0b' },
    { label: 'Revenue (₹)',    value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: '💰', color: '#8b5cf6' },
  ];

  if (loading) return (
    <div style={{ padding: 32, color: '#64748b', fontSize: 15 }}>Loading dashboard…</div>
  );

  if (error) return (
    <div style={{ padding: 32, color: '#991b1b', background: '#fee2e2', borderRadius: 10, margin: 32 }}>{error}</div>
  );

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0 }}>Dashboard</h1>
        <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>Live data from your hotel.</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 36 }}>
        {statCards.map(stat => (
          <div key={stat.label} style={{
            background: '#fff', borderRadius: 14, padding: '22px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `4px solid ${stat.color}`,
          }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{stat.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a' }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Recent Bookings</h2>
        </div>

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>No bookings yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Guest', 'Room', 'Check-in', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={b._id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '14px 24px', fontWeight: 500, color: '#1e293b' }}>{b.user?.username || '—'}</td>
                  <td style={{ padding: '14px 24px', color: '#475569' }}>{b.room?.roomType || '—'} #{b.room?.roomNumber}</td>
                  <td style={{ padding: '14px 24px', color: '#475569' }}>{fmt(b.checkInDate)}</td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{ ...statusStyle[b.status], padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {b.status?.charAt(0).toUpperCase() + b.status?.slice(1)}
                    </span>
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

export default OwnerDashboard;