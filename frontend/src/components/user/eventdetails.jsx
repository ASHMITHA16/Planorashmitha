import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await API.get(`/events/${id}`);
        setEvent(res.data);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
      <div className="space-y-4">
        <p className="text-gray-600">{event.description}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Date:</p>
            <p>{new Date(event.date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="font-semibold">Time:</p>
            <p>{event.time}</p>
          </div>
          <div>
            <p className="font-semibold">Venue:</p>
            <p>{event.venue}</p>
          </div>
          <div>
            <p className="font-semibold">Coordinator:</p>
            <p>{event.coordinator_name}</p>
          </div>
        </div>
        {event.sponsors && (
          <div>
            <p className="font-semibold">Sponsors:</p>
            <p>{event.sponsors}</p>
          </div>
        )}
        <button
          onClick={() => navigate(`/register/${event.id}`)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Register for Event
        </button>
      </div>
    </div>
  );
};