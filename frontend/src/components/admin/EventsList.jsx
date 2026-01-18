import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../../services/api';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isPastEvents = location.pathname.includes('/past');
  const isUpcomingEvents = location.pathname.includes('/upcoming');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        let endpoint = '/events';
        
        if (isPastEvents) {
          endpoint = '/events/past';
        } else if (isUpcomingEvents) {
          endpoint = '/events/upcoming';
        }

        const response = await API.get(endpoint);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isPastEvents, isUpcomingEvents]);

  const getStatusColor = (status) => {
    return status === 'upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getPageTitle = () => {
    if (isPastEvents) return "Past Events";
    if (isUpcomingEvents) return "Upcoming Events";
    return "All Events";
  };

  if (loading) return <div className="text-center p-4">Loading events...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!events?.length) return <div className="text-center p-4">No events found.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{getPageTitle()}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Date:</span>{' '}
                {new Date(event.date).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Time:</span>{' '}
                {event.time || 'Not specified'}
              </p>
              <p>
                <span className="font-medium">Venue:</span> {event.venue}
              </p>
              <p>
                <span className="font-medium">Type:</span> {event.event_type}
              </p>
              <p>
                <span className="font-medium">Status:</span>{' '}
                <span className={`px-2 py-1 rounded ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </p>
              {event.coordinator_name && (
                <p>
                  <span className="font-medium">Coordinator:</span>{' '}
                  {event.coordinator_name}
                </p>
              )}
              
              {/* Only show registration button for upcoming events in user view */}
              {!isAdmin && event.status === 'upcoming' && isUpcomingEvents && (
                <Link
                  to={`/user/register/${event.id}`}
                  className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Register for Event
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsList;