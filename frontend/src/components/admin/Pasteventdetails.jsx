import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../../services/api';

const PastEventDetails = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  // ...existing code...
  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        setLoading(true);
        const response = await API.get('/api/events/past'); // Add /api prefix
        console.log('Past events fetched:', response.data);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching past events:', error);
        setError('Failed to load past events');
      } finally {
        setLoading(false);
      }
    };

    fetchPastEvents();
  }, []);
// ...existing code...
  if (loading) {
    return <div className="text-center p-4">Loading past events...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  if (!events?.length) {
    return <div className="text-center p-4">No past events found.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Past Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="space-y-2">
              <p><span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}</p>
              <p><span className="font-medium">Time:</span> {event.time || 'Not specified'}</p>
              <p><span className="font-medium">Venue:</span> {event.venue}</p>
              <p><span className="font-medium">Type:</span> {event.event_type}</p>
              <p><span className="font-medium">Registrations:</span> {event.registration_count || 0}</p>
            </div>
            {event.registered_users && (
              <div className="mt-4">
                <p className="font-medium">Registered Users:</p>
                <p className="text-sm text-gray-600">{event.registered_users}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PastEventDetails;