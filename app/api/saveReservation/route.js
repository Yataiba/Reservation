import dbConnect from "../dbConnect";
import mongoose from "mongoose";

export const runtime = "nodejs"; // Ensure it's a server function

export async function POST(req) {
  try {
    await dbConnect();
    const db = mongoose.connection.db;

    const body = await req.json();
    console.log("Received body:", body); // Debugging request body

    const { name, phone, people, type } = body;

    if (!name || !phone || !people || !type) {
      return new Response(
        JSON.stringify({ error: "All fields are required", received: body }),
        { status: 400 }
      );
    }

    // ✅ Get the current time and adjust for time zones if needed
    const now = new Date();
    const currentHour = now.getHours();

    // ✅ Reservations are only allowed between 19:00 - 23:59
    if (currentHour < 19 || currentHour >= 24) {
      return new Response(
        JSON.stringify({ error: "Reservations are only allowed from 19:00 to 23:59." }),
        { status: 400 }
      );
    }

    // ✅ Fetch the menu for the **NEXT** day
    now.setDate(now.getDate() + 1); // Move to the next day
    const nextDayDate = now.toISOString().split("T")[0]; // Format as YYYY-MM-DD

    console.log("Fetching menu for date:", nextDayDate); // Debugging menu fetch

    const menu = await db.collection("ramadan_menu").findOne({ date: nextDayDate });

    if (!menu) {
      return new Response(
        JSON.stringify({ error: "Menu not found for the next day" }),
        { status: 400 }
      );
    }

    console.log("Menu found:", menu); // Debugging fetched menu

    // ✅ Prevent duplicate reservations for the same person & date
    const existingReservation = await db
      .collection("reservations")
      .findOne({ phone, date: nextDayDate });

    if (existingReservation) {
      return new Response(
        JSON.stringify({ error: "You already have a reservation for this day." }),
        { status: 400 }
      );
    }

    // ✅ Save reservation for the **next day's menu**
    const result = await db.collection("reservations").insertOne({
      name,
      phone,
      people,
      type,
      day: menu.day,
      date: nextDayDate, // Ensure it saves the correct date
    });

    console.log("Reservation saved:", result.insertedId); // Debugging successful insert

    return new Response(
      JSON.stringify({ message: "Reservation saved successfully", id: result.insertedId }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving reservation:", error);
    return new Response(
      JSON.stringify({ error: "Failed to save reservation", details: error.message }),
      { status: 500 }
    );
  }
}
