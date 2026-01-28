import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";

const AdminWinnerPage = () => {
  const { clubId } = useParams();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);

  // Load competition events of club
  useEffect(() => {
    API.get(`/clubs/${clubId}/competition-events`)
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, [clubId]);

  const loadRegistrations = async (event) => {
    setSelectedEvent(event);
    const res = await API.get(`/clubs/${clubId}/events/${event.id}/registrations`);
    setRegistrations(res.data);
  };

  const updatePosition = async (id, position) => {
    await API.patch(`/clubs/${clubId}/registrations/${id}/position`, { position });
    loadRegistrations(selectedEvent);
  };

  const sendCertificates = async () => {
    await API.post(`/clubs/${clubId}/events/${selectedEvent.id}/send-certificates`);
    alert("Certificates sent 🎓");
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">🏆 Winner Management</h1>

      {!selectedEvent ? (
        <>
          <h2 className="text-xl font-semibold mb-4">Select Competition Event</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {events.map(event => (
              <div
                key={event.id}
                onClick={() => loadRegistrations(event)}
                className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-lg"
              >
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-sm text-gray-500">{event.date}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => setSelectedEvent(null)}
            className="mb-4 text-blue-600 underline"
          >
            ← Back to Events
          </button>

          <h2 className="text-xl font-semibold mb-4">{selectedEvent.title}</h2>

          {registrations.map(r => (
            <div key={r.id} className="flex justify-between bg-white p-3 rounded shadow mb-2">
              <div>
                <h2 className="text-sm text-gray-500">{r.name}</h2>
                <h3 className="text-sm text-gray-500">{r.position}</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>updatePosition(r.id,"winner")} className="bg-yellow-500 text-white px-2 py-1 rounded">Winner</button>
                <button onClick={()=>updatePosition(r.id,"runner")} className="bg-gray-500 text-white px-2 py-1 rounded">Runner</button>
              </div>
            </div>
          ))}

          <button onClick={sendCertificates} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
            🎓 Send Certificates
          </button>
        </>
      )}
    </div>
  );
};

export default AdminWinnerPage;
