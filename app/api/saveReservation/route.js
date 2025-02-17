import dbConnect from "../dbConnect";
import mongoose from "mongoose";

export const runtime = "nodejs"; // Ensure it's a server function

export async function POST(req) {
  try {
    await dbConnect();
    const db = mongoose.connection.db;

    const body = await req.json();
    console.log("Received body:", body); // Debugging request body

    const { name, phone, people, type, date, isAdmin } = body;

    if (!name || !phone || !people || !type) {
      return new Response(
        JSON.stringify({ error: "All fields are required", received: body }),
        { status: 400 }
      );
    }

    // ✅ Admin reservation case (allows selecting any date)
    if (isAdmin && date) {
      console.log(`Admin creating reservation for date: ${date}`);

      const menu = await db.collection("ramadan_menu").findOne({ date });

      if (!menu) {
        return new Response(
          JSON.stringify({ error: "Menu not found for the selected date" }),
          { status: 400 }
        );
      }

      console.log("Admin menu found:", menu);

      // ✅ Save reservation for the **selected date** by admin
      const result = await db.collection("reservations").insertOne({
        name,
        phone,
        people,
        type,
        day: menu.day,
        date, // Use the provided date
      });

      console.log("Admin reservation saved:", result.insertedId);

      return new Response(
        JSON.stringify({ message: "Admin reservation saved successfully", id: result.insertedId }),
        { status: 201 }
      );
    }

    // ✅ Customer pre-reservation case (keeps original logic)
    const now = new Date();
    const currentHour = now.getHours();

    // ✅ Ensure reservations are only open from 19:00 - 23:59
    if (currentHour < 0 || currentHour >= 24) {
      return new Response(
        JSON.stringify({ error: "Reservations are only allowed from 19:00 to 23:59." }),
        { status: 400 }
      );
    }

    // ✅ Fetch the menu for the **NEXT** day
    now.setDate(now.getDate() + 1);
    const nextDayDate = now.toISOString().split("T")[0];

    console.log("Fetching menu for date:", nextDayDate);

    const menu = await db.collection("ramadan_menu").findOne({ date: nextDayDate });

    if (!menu) {
      return new Response(
        JSON.stringify({ error: "Menu not found for the next day" }),
        { status: 400 }
      );
    }

    console.log("Menu found:", menu);

    // ✅ Save reservation for the **next day's menu**
    const result = await db.collection("reservations").insertOne({
      name,
      phone,
      people,
      type,
      day: menu.day,
      date: nextDayDate, // Keep customer reservation for next day
    });

    console.log("Customer reservation saved:", result.insertedId);

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
