"use client";

import { useState, useEffect } from "react";

export default function RamadanReservation() {
  const [day, setDay] = useState(null);
  const [menu, setMenu] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [countdown, setCountdown] = useState(""); // Timer state
  const [canReserve, setCanReserve] = useState(false); // Controls reservation availability
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
    today.setDate(today.getDate() + 1); // Always fetch for next day
    const reservationDate = today.toISOString().split("T")[0];

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
        setError("Menu not found for this date.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Ramadan Pre-Reservation</h1>

      {loading && <p className="text-blue-500">Loading menu...</p>}

      {error && (
        <p className="text-red-500">
          {error} <button onClick={() => window.location.reload()}>Retry</button>
        </p>
      )}

      {!loading && !error && day && (
        <>
          <h2 className="text-lg font-semibold mt-2">
            Reservation for: <strong>{date}</strong>
          </h2>

          <p className="text-md">Menu: <strong>{menu}</strong></p>
        </>
      )}
    </div>
  );
}

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
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Ramadan Pre-Reservation</h1>

      {/* Show Loading State */}
      {loading && <p className="text-blue-500">Loading menu...</p>}

      {/* Show Error State */}
      {error && (
        <p className="text-red-500">
          {error} <button onClick={() => window.location.reload()}>Retry</button>
        </p>
      )}

      {/* Show Reservation Form Only If Day is Found */}
      {!loading && !error && day && (
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
      )}
    </div>
  );
}
