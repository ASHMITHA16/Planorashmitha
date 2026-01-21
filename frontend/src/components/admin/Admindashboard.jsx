import React, { useEffect, useState } from "react";
import { Outlet,useNavigate } from "react-router-dom";
import ClubPasswordModal from "./ClubPasswordModal";
import { Plus } from "lucide-react";
import API from "../../services/api"; 
const AdminDashboard = () => {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const navigate = useNavigate();

  // useEffect(() => {
  //   fetch("http://localhost:5000/API/clubs")
  //     .then(res => res.json())
  //     .then(data => setClubs(data));
  // }, []);

  useEffect(() => {
  API.get("/clubs")
    .then(res => {
      if (Array.isArray(res.data)) {
        setClubs(res.data);
      } else {
        setClubs([]);
      }
    })
    .catch(err => {
      console.error("Error fetching clubs", err);
      setClubs([]);
    });
}, []);

  const createClub = () => {
    navigate("/admin/create-club");
  };

  return (
  <div className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
    <h1 className="text-3xl font-bold text-indigo-700 mb-6">
      Admin Dashboard
    </h1>

    <button
      onClick={createClub}
      className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl mb-8 hover:bg-indigo-700"
    >
      <Plus /> Create New Club
    </button>

    {/* 👇 THIS IS THE KEY */}
    <Outlet />

    {/* Club Cards */}
    <div className="grid md:grid-cols-3 gap-6 mt-6">
      {Array.isArray(clubs) && clubs.map(club => (
        <div
          key={club.id}
          onClick={() => setSelectedClub(club)}
          className="bg-white p-6 rounded-2xl shadow hover:shadow-xl cursor-pointer transition"
        >
          <h2 className="text-xl font-semibold text-gray-800">
            {club.name}
          </h2>
          <p className="text-gray-500 mt-2">
            {club.description}
          </p>
        </div>
      ))}
    </div>

    {selectedClub && (
  <ClubPasswordModal
    club={selectedClub}
    onClose={() => setSelectedClub(null)}
  />
)}

  </div>
);
};

export default AdminDashboard;