import { connectToDatabase } from "../dbConnect";

export const runtime = "nodejs"; // Ensure it's a server function

export async function POST(req) {
  try {
    const { db } = await connectToDatabase();
    const { name, phone, people, type } = await req.json();

    if (!name || !phone || !people || !type) {
      return new Response(JSON.stringify({ error: "All fields are required" }), { status: 400 });
    }

    // Get today's date
    const today = new Date();
    const ramadanStart = new Date(2025, 2, 1); // March 1, 2025
    const day = Math.floor((today - ramadanStart) / (1000 * 60 * 60 * 24)) + 2; // Next day

    // Retrieve the correct menu date
    const menu = await db.collection("ramadan_menu").findOne({ day });
    
    if (!menu) {
      return new Response(JSON.stringify({ error: "Menu not found for this day" }), { status: 400 });
    }

    const reservationDate = menu.date; // Use the menu's date

    const result = await db.collection("reservations").insertOne({
      name,
      phone,
      people,
      type,
      day,  
      date: reservationDate,  // ✅ Save the correct menu date
    });

    return new Response(JSON.stringify({ message: "Reservation saved successfully", id: result.insertedId }), { status: 201 });
  } catch (error) {
    console.error("Error saving reservation:", error);
    return new Response(JSON.stringify({ error: "Failed to save reservation" }), { status: 500 });
  }
}
