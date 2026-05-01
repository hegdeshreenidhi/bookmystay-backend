import React from 'react';

// Dummy data — replace with real API calls later
const stats = [
  { label: 'Total Rooms',    value: '12',      icon: '🛏️', color: '#3b82f6' },
  { label: 'Total Bookings', value: '48',      icon: '📅', color: '#10b981' },
  { label: 'Pending',        value: '5',       icon: '⏳', color: '#f59e0b' },
  { label: 'Revenue',        value: '$12,400', icon: '💰', color: '#8b5cf6' },
];

const recentBookings = [
  { id: 1, guest: 'Alice Johnson',  room: 'Deluxe Ocean View', checkIn: '2026-03-10', status: 'confirmed' },
  { id: 2, guest: 'Bob Smith',      room: 'Presidential Suite', checkIn: '2026-03-12', status: 'pending'   },
  { id: 3, guest: 'Carol White',    room: 'Garden Bungalow',    checkIn: '2026-03-08', status: 'confirmed' },
  { id: 4, guest: 'David Lee',      room: 'Standard Twin',      checkIn: '2026-03-14', status: 'pending'   },
];

const statusStyle = {
  confirmed: { background: '#d1fae5', color: '#065f46' },
  pending:   { background: '#fef3c7', color: '#92400e' },
  cancelled: { background: '#fee2e2', color: '#991b1b' },
};

const OwnerDashboard = () => {
  return (
    <div style={{ padding: 32 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: 0 }}>Dashboard</h1>
        <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 36 }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            background: '#fff', borderRadius: 14, padding: '22px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `4px solid ${stat.color}`
          }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>{stat.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Bookings Table */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Recent Bookings</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Guest', 'Room', 'Check-in', 'Status'].map(h => (
                <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentBookings.map((b, i) => (
              <tr key={b.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '14px 24px', fontWeight: 500, color: '#1e293b' }}>{b.guest}</td>
                <td style={{ padding: '14px 24px', color: '#475569' }}>{b.room}</td>
                <td style={{ padding: '14px 24px', color: '#475569' }}>{b.checkIn}</td>
                <td style={{ padding: '14px 24px' }}>
                  <span style={{
                    ...statusStyle[b.status],
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600
                  }}>
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default OwnerDashboard;