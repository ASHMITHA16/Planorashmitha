import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/login';
import Signup from './components/auth/signup';
import UserDashboard from './components/user/userdashboard';
import AdminDashboard from './components/admin/Admindashboard';
import ManageEvents from './components/admin/manageEvents';
import AddEvent from './components/admin/addevent';
import Register from './components/user/register';
import EventRegistrations from './components/admin/eventregistrations';
import PastEventDetails from './components/admin/Pasteventdetails';
import UpcomingEvents from './components/user/upcomingevents';
import EventsList from './components/admin/EventsList';
import DashboardHome from './components/admin/DashboardHome';
import VerifyOtp from './components/admin/VerifyOtp';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* User Routes */}
      <Route path="/user/*" element={<UserDashboard />}>
        <Route path="upcoming" element={<UpcomingEvents />} />
        <Route path="past" element={<PastEventDetails />} />
        <Route path="events" element={<EventsList />} />
        <Route path="register/:id" element={<Register />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/*" element={<AdminDashboard />}>
        <Route index element={<DashboardHome />} />
        <Route path="manage" element={<ManageEvents />} />
        <Route path="add" element={<AddEvent />} />
        <Route path="registrations" element={<EventRegistrations />} />
      </Route>
    </Routes>
  );
}

export default App;