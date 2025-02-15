import dbConnect from "../dbConnect";
import mongoose from "mongoose";

export const runtime = "nodejs"; // Ensure it's a server function

export async function POST(req) {
  try {
    await dbConnect();
    const db = mongoose.connection.db;

    const body = await req.json();
    console.log("Received body:", body); // 🔍 Debugging request body

    const { name, phone, people, type } = body;

    if (!name || !phone || !people || !type) {
      return new Response(JSON.stringify({ error: "All fields are required", received: body }), { status: 400 });
    }

    // ✅ Ensure correct menu retrieval
    const today = new Date();
    const ramadanStart = new Date(2025, 2, 1);
    const day = Math.floor((today - ramadanStart) / (1000 * 60 * 60 * 24)) + 2;

    console.log("Fetching menu for day:", day); // 🔍 Debugging menu fetch

    const menu = await db.collection("ramadan_menu").findOne({ day });

    if (!menu) {
      return new Response(JSON.stringify({ error: "Menu not found for this day" }), { status: 400 });
    }

    console.log("Menu found:", menu); // 🔍 Debugging fetched menu

    const reservationDate = menu.date;

    const result = await db.collection("reservations").insertOne({
      name,
      phone,
      people,
      type,
      day,
      date: reservationDate,
    });

    console.log("Reservation saved:", result.insertedId); // 🔍 Debugging successful insert

    return new Response(JSON.stringify({ message: "Reservation saved successfully", id: result.insertedId }), { status: 201 });
  } catch (error) {
    console.error("Error saving reservation:", error);
    return new Response(JSON.stringify({ error: "Failed to save reservation", details: error.message }), { status: 500 });
  }
}
