import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../../services/api";

const ClubDashboard = () => {
  const { clubId } = useParams();
  const [club, setClub] = useState(null);
 const{eventId}=useParams();
  useEffect(() => {
    API.get(`/clubs/${clubId}`)
      .then(res => setClub(res.data))
      
      .catch(err => console.error(err));
  }, [clubId]);

  if (!club) return <p>Loading...</p>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">{club.name}</h1>
      <p className="text-gray-600 mb-8">{club.description}</p>

      <div className="grid md:grid-cols-3 gap-6">
        <Link
          to={`/admin/club/${clubId}/add-event`}
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg"
        >
          ➕ Add Event
        </Link>

        <Link
          to={`/admin/club/${clubId}/manage-events`}
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg"
        >
          🛠 Manage Events
        </Link>

        <Link
          to={`/admin/club/${clubId}/registrations`}
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg"
        >
          📋 View Registrations
        </Link>

        <Link
            to={`/admin/club/${clubId}/events`}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg"
       >
           📅 View Events
        </Link>
      <Link
            to={`/admin/clubs/${clubId}/events/${eventId}/winners`}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg"    
        >
            🏆 Manage Competitions
        </Link>
      </div>

    </div>
  );
};

export default ClubDashboard;
