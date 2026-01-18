import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';

const Register = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [event, setEvent] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await API.get(`/events/${id}`);
        setEvent(response.data);
      } catch (error) {
        setError('Failed to load event details');
      }
    };
    fetchEvent();
  }, [id]);

  const handleRegistration = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await API.post(`/events/register/${id}`);
    console.log('Registration response:', response); // Debug log
    
    setSuccess(true);
    setTimeout(() => {
      navigate('/user/events');
    }, 2000);
  } catch (error) {
    console.error('Registration error:', error);
    setError(
      error.response?.data?.message || 
      'Failed to register for event. Please try again.'
    );
  } finally {
    setLoading(false);
  }
};

  if (!event) return <div>Loading event details...</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Event Registration</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          Successfully registered for the event! Redirecting...
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-semibold">{event.title}</h3>
        <p className="text-gray-600">{event.description}</p>
        <p className="mt-2"><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
        <p><strong>Venue:</strong> {event.venue}</p>
      </div>

      <button
        onClick={handleRegistration}
        disabled={loading || success}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          loading || success 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {loading ? 'Registering...' : success ? 'Registered!' : 'Confirm Registration'}
      </button>
    </div>
  );
};

export default Register;