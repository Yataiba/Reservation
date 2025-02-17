"use client";

import { useState, useEffect } from "react";

export default function ViewReservations() {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [editReservation, setEditReservation] = useState(null);
  const [filter, setFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [newReservation, setNewReservation] = useState({
    name: "",
    phone: "",
    people: "1",
    type: "Dine-In",
    date: "",
  });

  // ✅ Fetch all reservations from API
  useEffect(() => {
    fetch("/api/getReservations")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReservations(data);
        } else {
          console.error("Unexpected reservations API response:", data);
        }
      })
      .catch((error) => console.error("Error fetching reservations:", error));
  }, []);

  // ✅ Fetch all menus
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

  // ✅ Filter reservations dynamically when the selected date, type, or search query changes
  useEffect(() => {
    let filtered = reservations;

    if (selectedDate) {
      filtered = filtered.filter((res) => res.date === selectedDate);
    }

    if (filter) {
      filtered = filtered.filter((res) => res.type.toLowerCase() === filter.toLowerCase());
    }

    if (searchQuery) {
      filtered = filtered.filter((res) => res.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setFilteredReservations(filtered);
  }, [selectedDate, reservations, filter, searchQuery]);

  // ✅ Delete reservation function
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

  // ✅ Handle updating a reservation
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

  // ✅ Handle adding a new reservation (Admin)
  const handleAddReservation = async (e) => {
    e.preventDefault();

    if (!newReservation.date) {
      alert("Please select a valid date for the reservation.");
      return;
    }

    const response = await fetch("/api/saveReservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newReservation, isAdmin: true }), // ✅ Admin flag
    });

    if (response.ok) {
      alert("Reservation added successfully!");
      setNewReservation({ name: "", phone: "", people: "1", type: "Dine-In", date: "" });
    } else {
      alert("Failed to add reservation.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-center">All Reservations</h2>

      {/* ✅ Add New Reservation Form */}
      <div className="border p-4 mb-6 rounded bg-gray-100">
        <h3 className="text-lg font-semibold mb-3 text-center text-black" >Add New Reservation</h3>
        <form onSubmit={handleAddReservation}>
          <input
            type="text"
            name="name"
            placeholder="Enter Name"
            className="w-full p-2 border rounded mb-2 text-black"
            value={newReservation.name}
            onChange={(e) => setNewReservation({ ...newReservation, name: e.target.value })}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Enter Phone Number"
            className="w-full p-2 border rounded mb-2 text-black"
            value={newReservation.phone}
            onChange={(e) => setNewReservation({ ...newReservation, phone: e.target.value })}
            required
          />
          <input
            type="number"
            name="people"
            placeholder="Number of People (1-10)"
            className="w-full p-2 border rounded mb-2 text-black"
            value={newReservation.people}
            min="1"
            max="10"
            onChange={(e) => setNewReservation({ ...newReservation, people: e.target.value })}
            required
          />
          <select
            name="type"
            className="w-full p-2 border rounded mb-2 text-black"
            value={newReservation.type}
            onChange={(e) => setNewReservation({ ...newReservation, type: e.target.value })}
          >
            <option value="Dine-In">Dine-In</option>
            <option value="Takeaway">Takeaway</option>
          </select>
          <select
            className="w-full p-2 border rounded mb-2 text-black"
            value={newReservation.date}
            onChange={(e) => setNewReservation({ ...newReservation, date: e.target.value })}
            required
          >
            <option value="">Select Date</option>
            {menus.map((menu) => (
              <option key={menu.date} value={menu.date}>
                Day {menu.day} - {menu.date} ({menu.menu})
              </option>
            ))}
          </select>
          <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
            Add Reservation
          </button>
        </form>
      </div>

      {/* ✅ Filter Section */}
      <div className="mb-4 flex gap-4">
      <h3 className="text-lg font-semibold mb-3 text-center text-black">Search for Reservations</h3>
      <select
          className="p-2 border rounded text-black"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option value="">All Dates</option>
          {menus.map((menu) => (
            <option key={menu.date} value={menu.date}>
              {menu.date} - {menu.menu}
            </option>
          ))}
        </select>
        <select
          className="p-2 border rounded text-black"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="Dine-In">Dine-In</option>
          <option value="Takeaway">Takeaway</option>
        </select>

        <input
          type="text"
          placeholder="Search by Name"
          className="p-2 border rounded text-black"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ✅ Reservations List */}
      <ul>
        {filteredReservations.map((res) => (
          <li key={res._id} className="border p-4 mb-2 rounded flex justify-between items-center bg-gray-100">
            <div className="text-black">
              <p><strong>Name:</strong> {res.name}</p>
              <p><strong>Phone:</strong> {res.phone}</p>
              <p><strong>People:</strong> {res.people}</p>
              <p><strong>Type:</strong> {res.type}</p>
              <p><strong>Date:</strong> {res.date}</p>
            </div>
            <div>
              <button onClick={() => setEditReservation(res)} className="bg-blue-500 text-white px-4 py-1 rounded mr-2">
                Update
              </button>
              <button onClick={() => deleteReservation(res._id)} className="bg-red-500 text-white px-4 py-1 rounded">
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
            <label className="block mt-2">Date:</label>
            <select
              className="w-full p-2 border rounded"
              value={editReservation.date}
              onChange={(e) =>
                setEditReservation({ ...editReservation, date: e.target.value })
              }
            >
              {menus.map((menu) => (
                <option key={menu.date} value={menu.date}>
                  {menu.date} - {menu.menu}
                </option>
              ))}
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
