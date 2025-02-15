"use client";

import { useState, useEffect } from "react";

export default function RamadanReservation() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [people, setPeople] = useState("");
  const [type, setType] = useState("dine-in");
  const [countdown, setCountdown] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [menu, setMenu] = useState(null);
  const [day, setDay] = useState(null);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const iftarTime = new Date();
      iftarTime.setHours(17, 30, 0, 0);
      
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

  // ✅ Fetch correct menu for the next day
  useEffect(() => {
    const fetchMenu = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);  // Ensure only the date part is used
      
      const ramadanStart = new Date(2025, 2, 1); // March 1, 2025
      const calculatedDay = Math.floor((today - ramadanStart) / (1000 * 60 * 60 * 24)) + 2;
      
      if (calculatedDay < 1) {
        console.error("Invalid Ramadan day:", calculatedDay);
        return;
      }

      setDay(calculatedDay);

      try {
        const response = await fetch(`/api/menu?day=${calculatedDay}`);
        if (!response.ok) throw new Error("Menu not found");
        const data = await response.json();
        setMenu(data);
      } catch (error) {
        console.error("Failed to fetch menu:", error);
        setMenu(null);
      }
    };

    fetchMenu();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!menu) {
      alert("Menu data is missing, please try again later.");
      return;
    }

    const reservationData = { name, phone, people, type, day, date: menu.date };

    const response = await fetch("/api/saveReservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      {menu ? (
        <p className="text-lg font-semibold text-center">
          Reservation for: <strong>{menu.date}</strong>
          <br />
          Menu: <strong>{menu.menu}</strong>
        </p>
      ) : (
        <p className="text-red-600 text-center">Loading menu...</p>
      )}
      <p className="text-red-600 font-semibold text-center">{countdown}</p>

      {isOpen && menu && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <input
            className="w-full p-2 border rounded"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            className="w-full p-2 border rounded"
            type="number"
            placeholder="Number of people"
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
