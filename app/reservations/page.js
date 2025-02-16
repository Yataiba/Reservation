"use client";

import { useState, useEffect } from "react";

export default function ViewReservations() {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [menus, setMenus] = useState([]);
  const [availableDates, setAvailableDates] = useState([]); // Store available dates
  const [selectedDate, setSelectedDate] = useState("");
  const [editReservation, setEditReservation] = useState(null);
  const [filter, setFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all reservations
  useEffect(() => {
    fetch("/api/getReservations")
      .then((res) => res.json())
      .then((data) => setReservations(data))
      .catch((error) => console.error("Error fetching reservations:", error));
  }, []);

  // Fetch all menus and extract available dates
  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMenus(data);
        } else {
          console.error("Unexpected menu API response:", data);
        }
      })
      .catch((error) => console.error("Error fetching menus:", error));
  }, []);
  

  // Filter reservations when the selected date, type, or search query changes
  useEffect(() => {
    let filtered = reservations;

    if (selectedDate) {
      filtered = filtered.filter((res) => res.date === selectedDate);
    }

    if (filter) {
      filtered = filtered.filter(
        (res) => res.type.toLowerCase() === filter.toLowerCase()
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((res) =>
        res.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReservations(filtered);
  }, [selectedDate, reservations, filter, searchQuery]);

  // Delete reservation
  const deleteReservation = async (id) => {
    const response = await fetch("/api/deleteReservation", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      alert("Reservation deleted!");
      setReservations(reservations.filter((res) => res._id !== id));
    } else {
      alert("Failed to delete reservation.");
    }
  };

  // Handle update reservation
  const handleUpdate = async () => {
    if (!editReservation || !editReservation._id) return;

    const response = await fetch("/api/updateReservation", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editReservation._id,
        name: editReservation.name,
        phone: editReservation.phone,
        people: editReservation.people,
        type: editReservation.type,
        date: editReservation.date,
      }),
    });

    if (response.ok) {
      alert("Reservation updated!");
      setReservations(
        reservations.map((res) =>
          res._id === editReservation._id ? { ...res, ...editReservation } : res
        )
      );
      setEditReservation(null);
    } else {
      alert("Failed to update reservation.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">All Reservations</h2>

      {/* Day Selector */}
      <div className="mb-4">
        <label className="block text-lg font-semibold">Select Day:</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedDate || ""}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option value="">All Days</option>
          {availableDates.map((date) => {
            const menu = menus.find((m) => m.date === date);
            return (
              <option key={date} value={date}>
                Day {menu.day} - {date} ({menu.menu})
              </option>
            );
          })}
        </select>
      </div>

      {/* Filter Section */}
      <div className="mb-4 flex gap-4">
        <select
          className="p-2 border rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="dine-in">Dine-In</option>
          <option value="takeaway">Takeaway</option>
        </select>

        <input
          type="text"
          placeholder="Search by Name"
          className="p-2 border rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Reservations List */}
      <ul>
        {filteredReservations.map((res) => (
          <li
            key={res._id}
            className="border p-4 mb-2 rounded flex justify-between items-center"
          >
            <div>
              <p>
                <strong>Name:</strong> {res.name}
              </p>
              <p>
                <strong>Phone:</strong> {res.phone}
              </p>
              <p>
                <strong>People:</strong> {res.people}
              </p>
              <p>
                <strong>Type:</strong> {res.type}
              </p>
              <p>
                <strong>Date:</strong> {res.date}
              </p>
            </div>
            <div>
              <button
                onClick={() => setEditReservation(res)}
                className="bg-blue-500 text-white px-4 py-1 rounded mr-2"
              >
                Update
              </button>
              <button
                onClick={() => deleteReservation(res._id)}
                className="bg-red-500 text-white px-4 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Edit Reservation Modal */}
      {editReservation && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Reservation</h2>

            <label className="block">Name:</label>
            <input
              className="w-full p-2 border rounded"
              type="text"
              value={editReservation.name}
              onChange={(e) =>
                setEditReservation({ ...editReservation, name: e.target.value })
              }
            />

            <label className="block mt-2">Phone:</label>
            <input
              className="w-full p-2 border rounded"
              type="text"
              value={editReservation.phone}
              onChange={(e) =>
                setEditReservation({
                  ...editReservation,
                  phone: e.target.value,
                })
              }
            />

            <label className="block mt-2">People:</label>
            <input
              className="w-full p-2 border rounded"
              type="number"
              value={editReservation.people}
              onChange={(e) =>
                setEditReservation({
                  ...editReservation,
                  people: e.target.value,
                })
              }
            />

            <label className="block mt-2">Type:</label>
            <select
              className="w-full p-2 border rounded"
              value={editReservation.type}
              onChange={(e) =>
                setEditReservation({ ...editReservation, type: e.target.value })
              }
            >
              <option value="dine-in">Dine-In</option>
              <option value="takeaway">Takeaway</option>
            </select>

            <div className="flex justify-end mt-4">
              <button className="bg-gray-500 text-white px-4 py-1 rounded mr-2" onClick={() => setEditReservation(null)}>
                Cancel
              </button>
              <button className="bg-green-500 text-white px-4 py-1 rounded" onClick={handleUpdate}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
