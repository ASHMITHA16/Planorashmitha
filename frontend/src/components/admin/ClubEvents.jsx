import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";

const ClubEvents = () => {
  const { clubId } = useParams();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    API.get(`/clubs/${clubId}/events`)
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, [clubId]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Club Events</h1>

      {events.length === 0 && (
        <p className="text-gray-500">No events for this club</p>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        {events.map(event => (
          <div
            key={event.id}
            className="bg-white p-5 rounded-xl shadow"
          >
            <h2 className="text-lg font-semibold">{event.title}</h2>
            <p className="text-gray-500">{event.description}</p>
            <p className="text-sm mt-2">📅 {event.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClubEvents;
