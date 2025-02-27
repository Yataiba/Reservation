import dbConnect from "../dbConnect";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export const runtime = "nodejs"; // Ensure server environment

export async function PUT(req) {
  try {
    // ✅ Ensure database connection
    await dbConnect();
    const db = mongoose.connection.db;

    // ✅ Include date in request
    const { id, name, phone, people, type, date } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: "Reservation ID is required" }), { status: 400 });
    }

    // ✅ Prepare update fields dynamically (to avoid overwriting with undefined values)
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (people) updateFields.people = people;
    if (type) updateFields.type = type;
    if (date) updateFields.date = date; // ✅ Ensure date is updated as well

    const result = await db.collection("reservations").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return new Response(JSON.stringify({ error: "No changes made or reservation not found" }), { status: 400 });
    }

    return new Response(JSON.stringify({ message: "Reservation updated successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error updating reservation:", error);
    return new Response(JSON.stringify({ error: "Failed to update reservation", details: error.message }), { status: 500 });
  }
}

// Handle non-PUT requests
export async function GET() {
  return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405 });
}
