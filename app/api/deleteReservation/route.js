import { connectToDatabase } from "../dbConnect";
import { ObjectId } from "mongodb"; // Ensure you import ObjectId to delete by ID

export const runtime = "nodejs"; // Ensure it's running on the server

export async function DELETE(req) {
  try {
    const { db } = await connectToDatabase();
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: "Reservation ID is required" }), { status: 400 });
    }

    const result = await db.collection("reservations").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: "Reservation not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Reservation deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return new Response(JSON.stringify({ error: "Failed to delete reservation" }), { status: 500 });
  }
}
