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

      // Open time: Today at 19:00 (7:00 PM)
      const openTime = new Date();
      openTime.setHours(19, 0, 0, 0);

      // Close time: Next day at 12:00 (Noon)
      const closeTime = new Date();
      closeTime.setDate(closeTime.getDate() + 1);
      closeTime.setHours(12, 0, 0, 0);

      console.log(`Current Time: ${now}`);
      console.log(`Open Time: ${openTime}`);
      console.log(`Close Time: ${closeTime}`);

      if (now < openTime) {
        // Before 19:00 (7 PM) today
        const timeLeft = openTime.getTime() - now.getTime();
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        setCountdown(`Reservations open in ${hours}h ${minutes}m`);
        setCanReserve(false);
      } else if (now >= openTime && now < closeTime) {
        // Between 19:00 (7 PM) today and 12:00 (Noon) tomorrow
        const timeLeft = closeTime.getTime() - now.getTime();
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        setCountdown(`${hours}h ${minutes}m left to reserve`);
        setCanReserve(true);
      } else {
        // After 12:00 noon tomorrow
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
      alert("Reservations are only allowed between 19:00 - 12:00 noon.");
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
      <h1 className="text-3xl font-bold text-black">Ramadan Mubarak 2025</h1>
      <h3 className=" font-bold text-black">Reservation For Tomorrow's Menu</h3>
      {loading && <p className="text-blue-500">Loading menu...</p>}

      {error && (
        <p className="text-red-500">
          {error} <button onClick={() => window.location.reload()}>Retry</button>
        </p>
      )}

      {!loading && !error && day && (
        <>
          <h2 className="text-lg font-semibold mt-2 text-black text-left">
            Reservation Date: <strong>{date}</strong>
          </h2>

          <p className="text-md text-black text-left">
            Menu: <strong>{menu}</strong>
          </p>
          <p className="text-2xl text-red-500">{countdown}</p>

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
              <option value="Delivery">Delivery</option>
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
