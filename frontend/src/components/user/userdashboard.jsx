import React, { useEffect, useState } from 'react';
import { useNavigate, Link, Routes, Route } from 'react-router-dom';
import API from '../../services/api';
// import UpcomingEvents from './upcomingevents';
// import PastEventDetails from '../admin/Pasteventdetails';
import EventsList from '../admin/EventsList'; // Add this import
import Register from './register'; // Add this import if missing

// ...existing code...
const UserDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!token || role !== 'user') {
          navigate('/login');
          return;
        }

        const response = await API.get('/user/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Dashboard error:', error);
        setError(error.response?.data?.error || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">No data available</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Event Dashboard
              </h1>
              <p className="mt-1 text-gray-600">Welcome back, {localStorage.getItem('username')}</p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/user/upcoming" 
                className="px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-200 
                         bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:shadow-md"
              >
                Upcoming Events
              </Link>
              <Link 
                to="/user/past" 
                className="px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-200 
                         bg-purple-50 text-purple-600 hover:bg-purple-100 hover:shadow-md"
              >
                Past Events
              </Link>
              <Link 
                to="/user/events" 
                className="px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-200 
                         bg-gradient-to-r from-indigo-600 to-purple-600 text-white 
                         hover:shadow-lg transform hover:-translate-y-0.5"
              >
                View All Events
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Your Registrations</h2>
              <div className="p-3 bg-indigo-50 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-indigo-600">{dashboardData.stats.totalRegistrations}</p>
            <p className="mt-2 text-sm text-gray-600">Total events you've registered for</p>
          </div>
        </div>

        <main className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <Routes>
            <Route path="upcoming" element={<EventsList type="upcoming" />} />
            <Route path="past" element={<EventsList type="past" />} />
            <Route path="events" element={<EventsList type="all" />} />
            <Route path="register/:id" element={<Register />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;