"use client";

import { useState, useEffect } from "react";

export default function RamadanReservation() {
  const [day, setDay] = useState(null);
  const [menu, setMenu] = useState("");
  const [date, setDate] = useState("");
  const [countdown, setCountdown] = useState(""); // Timer state
  const [canReserve, setCanReserve] = useState(false); // Controls reservation availability
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    people: "",
    type: "Dine-In",
  });

  useEffect(() => {
    const today = new Date();
    const ramadanStart = new Date(2025, 2, 1); // March 1, 2025 (0-based month index)
    
    // Calculate which Ramadan day it is
    let diffDays = Math.floor((today - ramadanStart) / (1000 * 60 * 60 * 24)) + 1;

    // Ensure we only request valid Ramadan days (1-29)
    if (diffDays < 1) {
      diffDays = 1; // If before Ramadan, start from Day 1
    } else if (diffDays > 29) {
      diffDays = 29; // If after Ramadan, default to last valid day
    }

    // Fetch the correct menu for the **next day** (diffDays + 1)
    const nextDay = diffDays + 1;
    
    fetch(`/api/menu?day=${nextDay}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.menu) {
          setDay(nextDay);
          setMenu(data.menu);
          setDate(data.date); // ✅ Correctly saving the menu date
        } else {
          throw new Error("Menu data not found");
        }
      })
      .catch((error) => {
        console.error("Failed to fetch menu:", error);
        setDay(null);
      });

    // Countdown timer logic
    const updateCountdown = () => {
      const now = new Date();
      const startReservation = new Date();
      startReservation.setHours(00, 0, 0, 0); // Reservations open at 19:00
      const closeTime = new Date();
      closeTime.setHours(23, 59, 59, 999); // Close at 23:59

      if (now < startReservation) {
        const timeLeft = startReservation - now;
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        setCountdown(`Reservations open in ${hours}h ${minutes}m`);
        setCanReserve(false);
      } else if (now >= startReservation && now <= closeTime) {
        const timeLeft = closeTime - now;
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        setCountdown(`${hours}h ${minutes}m left to reserve`);
        setCanReserve(true);
      } else {
        setCountdown("Reservations are closed for today.");
        setCanReserve(false);
      }
    };

    updateCountdown();
    const timerInterval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(timerInterval);
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canReserve) {
      alert("Reservations are only allowed between 19:00 - 23:59.");
      return;
    }

    const response = await fetch("/api/saveReservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, date }), // ✅ Saving the correct menu date
    });

    if (response.ok) {
      alert("Reservation submitted successfully!");
      setFormData({ name: "", phone: "", people: "", type: "Dine-In" });
    } else {
      alert("Failed to submit reservation.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Ramadan Pre-Reservation</h1>
      {day ? (
        <>
          <h2 className="text-lg font-semibold mt-2">
            Reservation for: <strong>{date}</strong>
          </h2>
          
          <p className="text-md">Menu: <strong>{menu}</strong></p>
          <p className="text-red-500">{countdown}</p>

          {/* Reservation Form */}
          <form onSubmit={handleSubmit} className="mt-4">
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              className="w-full p-2 border rounded mb-2"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={!canReserve}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              className="w-full p-2 border rounded mb-2"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={!canReserve}
            />
            <input
              type="number"
              name="people"
              placeholder="Number of people"
              className="w-full p-2 border rounded mb-2"
              value={formData.people}
              onChange={handleChange}
              required
              disabled={!canReserve}
            />
            <select
              name="type"
              className="w-full p-2 border rounded mb-4"
              value={formData.type}
              onChange={handleChange}
              disabled={!canReserve}
            >
              <option value="Dine-In">Dine-In</option>
              <option value="Takeaway">Takeaway</option>
            </select>

            <button
              type="submit"
              className={`w-full p-2 rounded ${
                canReserve ? "bg-blue-500 text-white" : "bg-gray-400 text-gray-700 cursor-not-allowed"
              }`}
              disabled={!canReserve}
            >
              Reserve
            </button>
          </form>
        </>
      ) : (
        <p className="text-red-500">Loading failed! Check console logs.</p>
      )}
    </div>
  );
}
