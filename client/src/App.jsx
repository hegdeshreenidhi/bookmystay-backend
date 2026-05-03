import React from 'react';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

import Home from './pages/Home';
import AboutPage from './pages/AboutPage';
import FeedbackPage from './pages/FeedbackPage';
import RoomsPage from './pages/RoomsPage';
import Dashboard from './pages/Dashboard';

import OwnerLayout from './owner/components/OwnerLayout';
import OwnerDashboard from './owner/pages/OwnerDashboard';
import ManageRooms from './owner/pages/ManageRooms';
import ManageBookings from './owner/pages/ManageBookings';

// BUG FIX: was "reservemyescape@gmail.com" — changed to the correct owner email
const OWNER_EMAIL = "hegdeshreenidhi6@gmail.com";

const OwnerRoute = ({ children }) => {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return null;
  const isOwner = user?.primaryEmailAddress?.emailAddress === OWNER_EMAIL;
  return isOwner ? children : <Navigate to="/" />;
};

// Redirect owner away from "/" automatically
const HomeGuard = () => {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return null;
  const isOwner = user?.primaryEmailAddress?.emailAddress === OWNER_EMAIL;
  return isOwner ? <Navigate to="/owner" replace /> : <Home />;
};

const App = () => {
  const isOwnerPath = useLocation().pathname.startsWith("/owner");

  return (
    <div>
      {!isOwnerPath && <Navbar />}
      <div className="min-h-[70vh]">
        <Routes>
          <Route path="/"          element={<HomeGuard />} />
          <Route path="/rooms"     element={<RoomsPage />} />
          <Route path="/about"     element={<AboutPage />} />
          <Route path="/feedback"  element={<FeedbackPage />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/owner" element={<OwnerRoute><OwnerLayout /></OwnerRoute>}>
            <Route index           element={<OwnerDashboard />} />
            <Route path="rooms"    element={<ManageRooms />} />
            <Route path="bookings" element={<ManageBookings />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
};

export default App;