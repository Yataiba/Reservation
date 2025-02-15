import { connectToDatabase } from "../dbConnect";
import { ObjectId } from "mongodb";

export const runtime = "nodejs"; // Ensure server environment

export async function PUT(req) {
  try {
    const { db } = await connectToDatabase();
    const { id, name, phone, people, type, date } = await req.json(); // Include date in request

    if (!id) {
      return new Response(JSON.stringify({ error: "Reservation ID is required" }), { status: 400 });
    }

    const result = await db.collection("reservations").updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, phone, people, type, date } } // Ensure date is updated as well
    );

    if (result.modifiedCount === 0) {
      return new Response(JSON.stringify({ error: "No changes made or reservation not found" }), { status: 400 });
    }

    return new Response(JSON.stringify({ message: "Reservation updated successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error updating reservation:", error);
    return new Response(JSON.stringify({ error: "Failed to update reservation" }), { status: 500 });
  }
}

// Handle non-PUT requests
export async function GET() {
  return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405 });
}
