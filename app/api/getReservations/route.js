import { connectToDatabase } from "../dbConnect";

export const runtime = "nodejs"; // Ensure server environment

export async function GET(req) {
  try {
    const { db } = await connectToDatabase();
    const reservations = await db.collection("reservations").find().toArray();

    if (!reservations) {
      return new Response(JSON.stringify([]), { status: 200 }); // Return an empty array instead of null
    }

    return new Response(JSON.stringify(reservations), { status: 200 });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch reservations" }), { status: 500 });
  }
}
