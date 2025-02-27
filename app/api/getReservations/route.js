import dbConnect from "../dbConnect";
import mongoose from "mongoose";

export const runtime = "nodejs"; // Ensure it's a server function

export async function GET(req) {
  try {
    // ✅ Ensure database connection
    await dbConnect();
    const db = mongoose.connection.db;

    // ✅ Fetch all reservations
    const reservations = await db.collection("reservations").find().toArray();

    return new Response(JSON.stringify(reservations), { status: 200 });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch reservations", details: error.message }), { status: 500 });
  }
}
