import dbConnect from "../dbConnect";
import mongoose from "mongoose";

export const runtime = "nodejs"; // Ensure it's a server function

export async function GET(req) {
  try {
    // ✅ Ensure database connection
    await dbConnect();
    const db = mongoose.connection.db;

    const url = new URL(req.url);
    const dateQuery = url.searchParams.get("date"); // Allow filtering by date

    // ✅ Fetch all menu entries to determine the first day of Ramadan
    const allMenus = await db.collection("ramadan_menu").find().toArray();

    if (!allMenus.length) {
      return new Response(JSON.stringify({ error: "No menu data available" }), { status: 404 });
    }

    // ✅ Determine the first day of Ramadan dynamically
    const sortedMenus = allMenus.sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
    const firstMenuDate = new Date(sortedMenus[0].date); // First menu date = Day 1

    // ✅ Determine the current reservation date
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour >= 19) {
      now.setDate(now.getDate() + 1); // Move to the next day if it's after 19:00
    }
    const reservationDate = now.toISOString().split("T")[0]; // Format as YYYY-MM-DD

    let query = {};
    if (dateQuery) {
      query.date = { $eq: new Date(dateQuery).toISOString().split("T")[0] };
    } else {
      query.date = { $eq: new Date(reservationDate).toISOString().split("T")[0] };
    }

    // ✅ Fetch all reservations or filter by date
    const reservations = await db.collection("reservations").find(query).toArray();

    if (!reservations.length) {
      return new Response(JSON.stringify({ message: "No reservations found", filter: query }), { status: 404 });
    }

    return new Response(JSON.stringify(reservations), { status: 200 });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch reservations", details: error.message }),
      { status: 500 }
    );
  }
}
