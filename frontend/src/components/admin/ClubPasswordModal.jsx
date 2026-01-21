import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const ClubPasswordModal = ({ club, onClose }) => {
  if (!club) return null; // 🔥 IMPORTANT GUARD

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const verifyPassword = async () => {
    try {
      const res = await API.post("/clubs/verify", {
        clubId: club.id,
        password
      });

      if (res.data.success) {
        console.log("Password verified");
        navigate(`/admin/club/${club.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl w-96 shadow-xl">
        <h2 className="text-2xl font-bold mb-4">
          {club.name}
        </h2>

        <input
          type="password"
          placeholder="Enter Club Password"
          className="w-full border p-3 rounded-lg mb-3"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={verifyPassword}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg w-full"
          >
            Enter
          </button>
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg w-full"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubPasswordModal;
