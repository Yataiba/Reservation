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

    // ✅ Fetch all menus and determine first day of Ramadan
    const allMenus = await db.collection("ramadan_menu").find().toArray();

    if (!allMenus.length) {
      return new Response(JSON.stringify({ error: "No menu data available" }), { status: 400 });
    }

    // Sort menus by date to find first Ramadan day
    const sortedMenus = allMenus.sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstMenuDate = new Date(sortedMenus[0].date);

    // Calculate tomorrow's date based on the first Ramadan day
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedTomorrow = tomorrow.toISOString().split("T")[0];

    // Fetch the menu for the correct date
    const menu = allMenus.find((m) => m.date === formattedTomorrow);

    if (!menu) {
      return new Response(JSON.stringify({ error: "Menu not found for this date", date: formattedTomorrow }), { status: 400 });
    }

    console.log("Menu found for reservation:", menu); // 🔍 Debugging fetched menu

    const reservationDate = menu.date;

    const result = await db.collection("reservations").insertOne({
      name,
      phone,
      people,
      type,
      date: reservationDate, // ✅ Save the correct menu date
    });

    console.log("Reservation saved:", result.insertedId); // 🔍 Debugging successful insert

    return new Response(JSON.stringify({ message: "Reservation saved successfully", id: result.insertedId }), { status: 201 });
  } catch (error) {
    console.error("Error saving reservation:", error);
    return new Response(JSON.stringify({ error: "Failed to save reservation", details: error.message }), { status: 500 });
  }
}
