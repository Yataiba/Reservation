"use client";

import { useState, useEffect } from "react";

export default function AdminMenu() {
  const [menus, setMenus] = useState([]); // ✅ Ensure an empty array at start
  const [editDay, setEditDay] = useState(null);
  const [date, setDate] = useState("");
  const [menu, setMenu] = useState("");
  const [isNew, setIsNew] = useState(false);

  // Fetch all menus when the page loads
  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched menus in frontend:", data); // Debugging log
        if (Array.isArray(data)) {
          setMenus(data); // ✅ Only update state if data is an array
        } else {
          console.error("Unexpected API response format:", data);
        }
      })
      .catch((error) => console.error("Error fetching menus:", error));
  }, []);
  

  // Handle edit button click
  const handleEdit = (day) => {
    const selectedMenu = menus.find((m) => m.day === day);
    setEditDay(day);
    setDate(selectedMenu?.date || "");
    setMenu(selectedMenu?.menu || "");
    setIsNew(false);
  };

  // Add new menu day
  const handleNew = () => {
    const lastDay = menus.length > 0 ? Math.max(...menus.map((m) => m.day)) : 0;
    setEditDay(lastDay);
    setDate(new Date().toISOString().split("T")[0]);
    setMenu("");
    setIsNew(true);
  };

  // Update menu
  const handleUpdate = async () => {
    if (!date || !menu) {
      alert("Please enter both the date and menu.");
      return;
    }

    const response = await fetch("/api/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day: editDay, date, menu }),
    });

    if (response.ok) {
      alert(isNew ? "Menu added!" : "Menu updated!");
      setMenus((prev) =>
        isNew
          ? [...prev, { day: editDay, date, menu }]
          : prev.map((m) => (m.day === editDay ? { ...m, date, menu } : m))
      );
      setEditDay(null);
    } else {
      alert("Failed to update menu.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Admin - Manage Ramadan Menu</h2>

      {/* Add New Day Button */}
      <button onClick={handleNew} className="bg-green-500 text-white px-4 py-2 rounded mb-4">
        ➕ Add New Day
      </button>

      {/* Menu List */}
      {menus.length > 0 ? (
        <ul>
          {menus.map((m) => (
            <li key={m.day} className="border p-4 mb-2 rounded flex justify-between items-center">
              <div>
                <p><strong>Day {m.day}:</strong> {m.date}</p>
                <p><strong>Menu:</strong> {m.menu}</p>
              </div>
              <button
                onClick={() => handleEdit(m.day)}
                className="bg-blue-500 text-white px-4 py-1 rounded"
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No menu items found.</p>
      )}

      {/* Edit/Add Modal */}
      {editDay && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">{isNew ? "Add New Menu" : `Edit Menu for Day ${editDay}`}</h2>

            <label className="block">Date:</label>
            <input
              className="w-full p-2 border rounded"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <label className="block mt-2">Menu:</label>
            <input
              className="w-full p-2 border rounded"
              type="text"
              value={menu}
              onChange={(e) => setMenu(e.target.value)}
            />

            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-500 text-white px-4 py-1 rounded mr-2"
                onClick={() => setEditDay(null)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-1 rounded"
                onClick={handleUpdate}
              >
                {isNew ? "Add Menu" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
