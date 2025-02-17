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

    // ✅ If a date is provided, filter by that date; otherwise, fetch all reservations
    let query = {};
    if (dateQuery) {
      query.date = dateQuery; // ✅ Match the exact date string
      console.log(`Filtering reservations by date: ${dateQuery}`);
    } else {
      console.log("Fetching all reservations (no date filter)");
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
