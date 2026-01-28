import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";

const ClubEvents = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [winners, setWinners] = useState({}); // 🔥 store winners per event

  useEffect(() => {
    API.get(`/clubs/${clubId}/basedevents`)
      .then(res => {
        setEvents(res.data);

        // 🔥 After events load, fetch winners for each past competition
        res.data.forEach(event => {
          if (event.is_competition && event.results_declared) {
            API.get(`/clubs/${clubId}/events/${event.id}/winners`)
              .then(wres => {
                setWinners(prev => ({ ...prev, [event.id]: wres.data }));
              })
              .catch(() => {});
          }
        });
      })
      .catch(err => console.error(err));
  }, [clubId]);

  const upcoming = events.filter(e => e.status === "upcoming");
  const past = events.filter(e => e.status === "past");

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Club Events</h1>

      <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {upcoming.map(event => (
          <EventCard key={event.id} event={event} navigate={navigate} />
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">Past Events</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {past.map(event => (
          <EventCard
            key={event.id}
            event={event}
            past
            winners={winners[event.id] || []} // 🔥 pass winners
          />
        ))}
      </div>
    </div>
  );
};

const EventCard = ({ event, navigate, past, winners = [] }) => (
  <div className="bg-white p-5 rounded-lg shadow">
    <h3 className="text-lg font-semibold">{event.title}</h3>
    <p className="text-gray-600">{event.description}</p>
    <p className="text-sm mt-1">📍 {event.venue}</p>
    <p className="text-sm">📅 {event.date}</p>

    {event.is_competition && (
      <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
        🏆 Competition
      </span>
    )}

    {/* 🏆 Winners */}
    {past && event.is_competition && event.results_declared && winners.length > 0 && (
      <div className="mt-4 bg-yellow-50 p-3 rounded-lg">
        <h4 className="font-semibold mb-1">🏆 Winners</h4>
        {winners.map((w, i) => (
          <p key={i} className="text-sm">
            {w.position === "winner" ? "🥇 Winner" : "🥈 Runner"} — {w.name}
          </p>
        ))}
      </div>
    )}

    {!past && (
      <button
        onClick={() => navigate(`/user/register/${event.id}`)}
        className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Register
      </button>
    )}
  </div>
);
export default ClubEvents;