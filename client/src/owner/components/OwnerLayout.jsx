import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';

const navItems = [
  { to: '/owner',          label: 'Dashboard',  icon: '📊', end: true },
  { to: '/owner/rooms',    label: 'Rooms',       icon: '🛏️' },
  { to: '/owner/bookings', label: 'Bookings',    icon: '📋' },
];

const OwnerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useClerk();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 230,
        background: '#0f172a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
        transition: 'width 0.25s ease',
        overflow: 'hidden',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
      }}>

        {/* Logo */}
        <div style={{ padding: '0 16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>🏨 HotelOwner</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Admin Panel</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18, padding: 4 }}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 8px' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                background: isActive ? '#1e40af' : 'transparent',
                color: isActive ? '#fff' : '#94a3b8',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              })}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Buttons */}
        <div style={{ padding: '16px 8px 0', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: 4 }}>
          
          {/* Back to Site */}
          <button
            onClick={() => { window.location.href = '/'; }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 8, border: 'none',
              background: 'transparent', color: '#64748b',
              cursor: 'pointer', fontSize: 14, width: '100%',
              whiteSpace: 'nowrap', overflow: 'hidden',
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>🌐</span>
            {!collapsed && 'Back to Site'}
          </button>

          {/* Logout */}
          <button
            onClick={() => signOut({ redirectUrl: '/' })}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 8, border: 'none',
              background: 'transparent', color: '#ef4444',
              cursor: 'pointer', fontSize: 14, width: '100%',
              whiteSpace: 'nowrap', overflow: 'hidden',
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>🚪</span>
            {!collapsed && 'Logout'}
          </button>

        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, background: '#f1f5f9', minHeight: '100vh', overflow: 'auto' }}>
        <Outlet />
      </main>

    </div>
  );
};

export default OwnerLayout;