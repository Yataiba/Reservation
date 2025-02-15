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

    let query = {};
    if (dateQuery) {
      query.date = dateQuery; // Fetch reservations for a specific date
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
