import dbConnect from "../dbConnect";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export const runtime = "nodejs"; // Ensure it's a server function

export async function DELETE(req) {
  try {
    // ✅ Ensure database connection
    await dbConnect();
    const db = mongoose.connection.db;

    const { id } = await req.json();
    if (!id) {
      return new Response(JSON.stringify({ error: "Reservation ID is required" }), { status: 400 });
    }

    // ✅ Delete the reservation by ID
    const result = await db.collection("reservations").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: "Reservation not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Reservation deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return new Response(JSON.stringify({ error: "Failed to delete reservation", details: error.message }), { status: 500 });
  }
}
