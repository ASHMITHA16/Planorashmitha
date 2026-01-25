// src/components/user/register.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";

const Register = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const[registercount,setRegistercount]=useState(0);

  useEffect(() => {
    API.get(`/events/${id}`).then(res => setEvent(res.data));
  }, [id]);

  const registerFree = async () => {
    setRegistercount(registercount+1);
    await API.post(`/events/${id}/eventregister`);
    alert("Registered successfully");
  };

 const payAndRegister = async () => {
  try {
    const { data } = await API.post(`/payments/fake/${id}`);
     alert("Payment successful and registered");
   

  } catch (err) {
    console.error(err);
    alert("Payment failed");
  }
};


  if (!event) return null;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">{event.title}</h1>
      <p>{event.description}</p>

      {event.fee === 0 ? (
        <button onClick={registerFree} className="btn-primary">
          Register Free
        </button>
      ) : (
        <button onClick={payAndRegister} className="btn-primary">
          Pay ₹{event.fee} & Register
        </button>
      )}
    </div>
  );
};

export default Register;
