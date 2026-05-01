import React from 'react';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

// Client pages (existing)
import Home from './pages/Home';
import AboutPage from './pages/AboutPage';
import FeedbackPage from './pages/FeedbackPage';
import RoomsPage from './pages/RoomsPage';
import Dashboard from './pages/Dashboard';

// Owner pages (new)
import OwnerLayout from './owner/components/OwnerLayout';
import OwnerDashboard from './owner/pages/OwnerDashboard';
import ManageRooms from './owner/pages/ManageRooms';
import ManageBookings from './owner/pages/ManageBookings';

const OWNER_EMAIL = "reservemyescape@gmail.com"; // 🔑 owner email

const OwnerRoute = ({ children }) => {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return null;
  return user?.primaryEmailAddress?.emailAddress === OWNER_EMAIL
    ? children
    : <Navigate to="/" />;
};

const App = () => {
  const isOwnerPath = useLocation().pathname.includes("owner");

  return (
    <div>
      {!isOwnerPath && <Navbar />}
      <div className='min-h-[70vh]'>
        <Routes>

          {/* CLIENT ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* OWNER ROUTES - protected */}
          <Route path="/owner" element={<OwnerRoute><OwnerLayout /></OwnerRoute>}>
            <Route index element={<OwnerDashboard />} />
            <Route path="rooms" element={<ManageRooms />} />
            <Route path="bookings" element={<ManageBookings />} />
          </Route>

        </Routes>
      </div>
    </div>
  );
};

export default App;