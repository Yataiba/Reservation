"use client";

import { useState } from "react";
import AdminMenu from "./menu"; // Import the existing menu management component
import ViewReservations from "../../reservations/page"; // Import the existing reservations page

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activePage, setActivePage] = useState("menu"); // Default to menu management

  const handleLogin = () => {
    if (password === "admin") { // Change this to your real admin password
      setAuthenticated(true);
    } else {
      alert("Incorrect password! Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-center">Admin Dashboard</h2>

      {/* Admin Authentication */}
      {!authenticated ? (
        <div className="flex flex-col items-center">
          <p className="mb-2 text-lg">Enter Admin Password:</p>
          <input
            type="password"
            className="p-2 border rounded text-black w-64"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="mt-3 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      ) : (
        <div>
          {/* Navigation Tabs */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              className={`px-4 py-2 rounded ${activePage === "menu" ? "bg-blue-600 text-white" : "bg-gray-300 text-black"}`}
              onClick={() => setActivePage("menu")}
            >
              Manage Menu
            </button>
            <button
              className={`px-4 py-2 rounded ${activePage === "reservations" ? "bg-blue-600 text-white" : "bg-gray-300 text-black"}`}
              onClick={() => setActivePage("reservations")}
            >
              Manage Reservations
            </button>
          </div>

          {/* Page Content */}
          {activePage === "menu" && <AdminMenu />}
          {activePage === "reservations" && <ViewReservations />}
        </div>
      )}
    </div>
  );
}
