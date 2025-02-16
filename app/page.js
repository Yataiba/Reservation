"use client";

import { useState, useEffect } from "react";

export default function RamadanReservation() {
  const [day, setDay] = useState(null);
  const [menu, setMenu] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [canReserve, setCanReserve] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    people: "",
    type: "Dine-In",
  });

  useEffect(() => {
    setLoading(true);
    setError(null);

    const today = new Date();
    today.setDate(today.getDate() + 1);
    const reservationDate = today.toISOString().split("T")[0];

    console.log(`Fetching menu for next day: ${reservationDate}`);

    fetch(`/api/menu?date=${reservationDate}`)
      .then((res) => {
        if (!res.ok) throw new Error("Menu data not found");
        return res.json();
      })
      .then((data) => {
        setDay(data.day);
        setMenu(data.menu);
        setDate(data.date);
      })
      .catch((error) => {
        console.error("Failed to fetch menu:", error);
        setError("Menu not found for the next day.");
      })
      .finally(() => setLoading(false));

    const updateCountdown = () => {
      const now = new Date();
      const openTime = new Date();
      openTime.setHours(19, 0, 0, 0);

      const closeTime = new Date();
      closeTime.setHours(23, 59, 59, 999);

      if (now < openTime) {
        const timeLeft = openTime - now;
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        setCountdown(`Reservations open in ${hours}h ${minutes}m`);
        setCanReserve(false);
      } else if (now >= openTime && now <= closeTime) {
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
    const timerInterval = setInterval(updateCountdown, 60000);

    return () => clearInterval(timerInterval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canReserve) {
      alert("Reservations are only allowed between 19:00 - 23:59.");
      return;
    }

    const response = await fetch("/api/saveReservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, date }),
    });

    if (response.ok) {
      alert("Reservation submitted successfully!");
      setFormData({ name: "", phone: "", people: "", type: "Dine-In" });
    } else {
      alert("Failed to submit reservation.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white min-h-screen text-center">
      <h1 className="text-2xl font-bold text-black">Ramadan Pre-Reservation</h1>

      {loading && <p className="text-blue-500">Loading menu...</p>}

      {error && (
        <p className="text-red-500">
          {error} <button onClick={() => window.location.reload()}>Retry</button>
        </p>
      )}

      {!loading && !error && day && (
        <>
          <h2 className="text-lg font-semibold mt-2 text-black">
            Reservation for: <strong>{date}</strong>
          </h2>

          <p className="text-md text-black">Menu: <strong>{menu}</strong></p>
          <p className="text-red-500">{countdown}</p>

          <form onSubmit={handleSubmit} className="mt-4">
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              className="w-full p-2 border rounded mb-2 text-black bg-white"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={!canReserve}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              className="w-full p-2 border rounded mb-2 text-black bg-white"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={!canReserve}
            />
            <input
              type="number"
              name="people"
              placeholder="Number of people"
              className="w-full p-2 border rounded mb-2 text-black bg-white"
              value={formData.people}
              onChange={handleChange}
              required
              disabled={!canReserve}
            />
            <select
              name="type"
              className="w-full p-2 border rounded mb-4 text-black bg-white"
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
      )}
    </div>
  );
}
