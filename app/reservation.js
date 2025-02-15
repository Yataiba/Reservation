"use client";

import { useState, useEffect } from "react";

export default function RamadanReservation() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [people, setPeople] = useState("");
  const [type, setType] = useState("dine-in");
  const [countdown, setCountdown] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const iftarTime = new Date();
      iftarTime.setHours(8, 30, 0, 0);
      if (now < iftarTime) {
        setIsOpen(false);
        setCountdown("Reservations open after Iftar.");
        return;
      }

      const closeTime = new Date();
      closeTime.setHours(23, 59, 59, 999);

      if (now >= iftarTime && now < closeTime) {
        setIsOpen(true);
        const timeLeft = closeTime - now;
        const hours = Math.floor(timeLeft / 3600000);
        const minutes = Math.floor((timeLeft % 3600000) / 60000);
        setCountdown(`${hours}h ${minutes}m left to reserve`);
      } else {
        setIsOpen(false);
        setCountdown("Reservations closed. Reopens tomorrow after Iftar.");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const reservationData = { name, phone, people, type };
  
    const response = await fetch('/api/saveReservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationData),
    });
  
    if (response.ok) {
      alert("Reservation submitted successfully!");
      setName("");
      setPhone("");
      setPeople("");
      setType("dine-in");
    } else {
      alert("Failed to submit reservation.");
    }
  };
  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg border">
      <h2 className="text-xl font-bold mb-4 text-center">Ramadan Pre-Reservation</h2>
      <p className="text-red-600 font-semibold text-center">{countdown}</p>
      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <input
            className="w-full p-2 border rounded"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            className="w-full p-2 border rounded"
            type="number"
            placeholder="Number of People"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            required
          />
          <select
            className="w-full p-2 border rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="dine-in">Dine-In</option>
            <option value="takeaway">Takeaway</option>
          </select>
          <button type="submit" className="mt-4 w-full p-2 bg-blue-600 text-white rounded">
            Reserve
          </button>
        </form>
      )}
    </div>
  );
}
