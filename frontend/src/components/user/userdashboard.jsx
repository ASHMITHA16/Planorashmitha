// src/components/user/userdashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const UserDashboard = () => {
  const [clubs, setClubs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/clubs/public")
      .then(res => setClubs(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Clubs</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {clubs.map(club => (
          <div
            key={club.id}
            onClick={() => navigate(`/user/club/${club.id}`)}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg cursor-pointer"
          >
            <h2 className="text-xl font-semibold">{club.name}</h2>
            <p className="text-gray-500 mt-2">{club.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
